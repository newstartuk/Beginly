import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAIProvider } from "@/lib/providers/ai";
import type { NiaResponse, UserContext } from "./types";
import type { ApiActor } from "./api-auth";
import { askNia } from "./nia";
import { buildNiaContextEnvelope, NIA_POLICY_VERSION, NIA_PROMPT_VERSION, redactNiaMessage } from "./nia-policy";
import { groundingCoverage, resolveGroundingSources, type GroundingSource } from "./nia-grounding";
import { recordPlatformEvent } from "./observability";

export interface NiaOrchestrationResult extends NiaResponse {
  conversationId: string;
  provider: string;
  policyVersion: string;
  promptVersion: string;
  sources: GroundingSource[];
  metrics: { latencyMs: number; inputTokens: number; outputTokens: number; estimatedCostMinor: number; grounded: boolean };
}

function validResponse(value: unknown): value is NiaResponse {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<NiaResponse>;
  return typeof row.message === "string" && typeof row.mode === "string" && Array.isArray(row.reasonCodes) && Array.isArray(row.sourceIds) && Array.isArray(row.actions) && typeof row.confidence === "number";
}

async function conversation(actor: ApiActor, requestedId: string | undefined, policyVersion: string): Promise<string> {
  if (actor.demo) return requestedId || `demo-${randomUUID()}`;
  if (requestedId) {
    const { data, error } = await actor.supabase.from("nia_conversations").select("id").eq("id", requestedId).eq("user_id", actor.userId).maybeSingle();
    if (error) throw error;
    if (data) return String(data.id);
  }
  const { data, error } = await actor.supabase.from("nia_conversations").insert({ user_id: actor.userId, policy_version: policyVersion, status: "open" }).select("id").single();
  if (error) throw error;
  return String(data.id);
}

async function persistMessage(supabase: SupabaseClient, actor: ApiActor, conversationId: string, role: "user" | "assistant", content: string, response?: NiaResponse): Promise<void> {
  if (actor.demo) return;
  const { error } = await supabase.from("nia_messages").insert({
    conversation_id: conversationId,
    role,
    redacted_content: redactNiaMessage(content),
    source_ids: response?.sourceIds ?? [],
    reason_codes: response?.reasonCodes ?? [],
    confidence: response?.confidence,
  });
  if (error) throw error;
}

export async function orchestrateNia(input: { actor: ApiActor; context: UserContext; message: string; conversationId?: string; idempotencyKey?: string }): Promise<NiaOrchestrationResult> {
  const started = performance.now();
  const message = redactNiaMessage(input.message);
  const conversationId = await conversation(input.actor, input.conversationId, NIA_POLICY_VERSION);
  await persistMessage(input.actor.supabase, input.actor, conversationId, "user", message);
  const provider = createAIProvider();
  let result;
  try {
    result = await provider.respond({
      idempotencyKey: input.idempotencyKey || `${conversationId}:${randomUUID()}`,
      message,
      context: input.context,
      contextEnvelope: buildNiaContextEnvelope(input.context),
      policyVersion: NIA_POLICY_VERSION,
      promptVersion: NIA_PROMPT_VERSION,
    });
  } catch (error) {
    const fallback = askNia(message, input.context);
    result = { provider: "deterministic-nia-fallback", response: fallback, latencyMs: Math.round(performance.now() - started), estimatedInputTokens: Math.ceil(message.length / 4), estimatedOutputTokens: Math.ceil(JSON.stringify(fallback).length / 4), estimatedCostMinor: 0, recorded: false };
    await recordPlatformEvent({ level: "warn", category: "nia", message: "Nia provider fallback used", actorId: input.actor.userId, requestId: input.actor.requestId, metadata: { error: error instanceof Error ? error.name : "unknown" } });
  }
  const response = validResponse(result.response) ? result.response : askNia(message, input.context);
  const coverage = groundingCoverage(response.sourceIds);
  const safeResponse: NiaResponse = coverage.unsupported.length ? { ...response, sourceIds: response.sourceIds.filter((id) => !coverage.unsupported.includes(id)), reasonCodes: [...response.reasonCodes, "unsupported_sources_removed"], confidence: Math.min(response.confidence, 0.8) } : response;
  const sources = resolveGroundingSources(safeResponse.sourceIds);
  await persistMessage(input.actor.supabase, input.actor, conversationId, "assistant", safeResponse.message, safeResponse);
  const latencyMs = Math.max(result.latencyMs, Math.round(performance.now() - started));
  await recordPlatformEvent({ level: "info", category: "nia", message: "Nia response generated", actorId: input.actor.userId, requestId: input.actor.requestId, durationMs: latencyMs, metadata: { provider: result.provider, mode: safeResponse.mode, policyVersion: NIA_POLICY_VERSION, sourceCount: sources.length, costMinor: result.estimatedCostMinor } });
  return {
    ...safeResponse,
    conversationId,
    provider: result.provider,
    policyVersion: NIA_POLICY_VERSION,
    promptVersion: NIA_PROMPT_VERSION,
    sources,
    metrics: { latencyMs, inputTokens: result.estimatedInputTokens, outputTokens: result.estimatedOutputTokens, estimatedCostMinor: result.estimatedCostMinor, grounded: coverage.unsupported.length === 0 },
  };
}
