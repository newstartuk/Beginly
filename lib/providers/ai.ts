import { askNia } from "../platform/nia";
import type { NiaResponse } from "../platform/types";
import { IdempotencyMemory, nowIso, requireProductionSecret } from "./core";
import type { AIProvider, AIRequest, AIResult, ProviderHealth } from "./types";

const estimateTokens = (value: string): number => Math.max(1, Math.ceil(value.length / 4));

export class DeterministicAIProvider implements AIProvider {
  readonly name = "deterministic-nia";
  private readonly results = new IdempotencyMemory<AIResult>();
  async respond(request: AIRequest): Promise<AIResult> {
    const existing = this.results.get(request.idempotencyKey);
    if (existing) return existing;
    const started = performance.now();
    const response = askNia(request.message, request.context);
    const output = JSON.stringify(response);
    return this.results.set(request.idempotencyKey, {
      provider: this.name, response, latencyMs: Math.max(0, Math.round(performance.now() - started)), estimatedInputTokens: estimateTokens(request.message + JSON.stringify(request.context)), estimatedOutputTokens: estimateTokens(output), estimatedCostMinor: 0, recorded: false,
    });
  }
  async health(): Promise<ProviderHealth> { return { provider: this.name, mode: "local", healthy: true, productionVerified: false, checkedAt: nowIso() }; }
}

export class RecordedAIProvider implements AIProvider {
  readonly name = "recorded-nia";
  constructor(private readonly fixtures: Record<string, NiaResponse>) {}
  async respond(request: AIRequest): Promise<AIResult> {
    const response = this.fixtures[request.message] ?? askNia(request.message, request.context);
    return { provider: this.name, response, latencyMs: 0, estimatedInputTokens: estimateTokens(request.message), estimatedOutputTokens: estimateTokens(JSON.stringify(response)), estimatedCostMinor: 0, recorded: true };
  }
  async health(): Promise<ProviderHealth> { return { provider: this.name, mode: "recorded", healthy: true, productionVerified: false, checkedAt: nowIso(), details: { fixtures: Object.keys(this.fixtures).length } }; }
}

export class RemoteModelGatewayProvider implements AIProvider {
  readonly name = "remote-model-gateway";
  private readonly apiKey: string;
  private readonly endpoint: string;
  constructor(options: { apiKey?: string; endpoint?: string } = {}) {
    this.apiKey = requireProductionSecret(this.name, options.apiKey ?? process.env.AI_API_KEY);
    this.endpoint = options.endpoint ?? process.env.AI_GATEWAY_URL ?? "";
    if (!/^https:\/\//.test(this.endpoint)) throw new Error("AI_GATEWAY_URL must be an HTTPS endpoint");
  }
  async respond(request: AIRequest): Promise<AIResult> {
    const started = performance.now();
    const payload = { idempotencyKey: request.idempotencyKey, message: request.message, context: request.contextEnvelope, policyVersion: request.policyVersion, promptVersion: request.promptVersion };
    const response = await fetch(this.endpoint, { method: "POST", headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json", "Idempotency-Key": request.idempotencyKey }, body: JSON.stringify(payload), signal: AbortSignal.timeout(20_000) });
    if (!response.ok) throw new Error(`AI gateway failed with ${response.status}`);
    const result = await response.json() as { response: NiaResponse; usage?: { inputTokens?: number; outputTokens?: number; costMinor?: number } };
    return { provider: this.name, response: result.response, latencyMs: Math.round(performance.now() - started), estimatedInputTokens: result.usage?.inputTokens ?? estimateTokens(request.message), estimatedOutputTokens: result.usage?.outputTokens ?? estimateTokens(JSON.stringify(result.response)), estimatedCostMinor: result.usage?.costMinor ?? 0, recorded: false };
  }
  async health(): Promise<ProviderHealth> { return { provider: this.name, mode: "production-adapter", healthy: true, productionVerified: false, checkedAt: nowIso() }; }
}

export function createAIProvider(mode = process.env.AI_PROVIDER ?? "deterministic"): AIProvider {
  return mode === "remote" ? new RemoteModelGatewayProvider() : new DeterministicAIProvider();
}
