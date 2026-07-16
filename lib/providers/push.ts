import { IdempotencyMemory, nowIso, providerId, requireProductionSecret } from "./core";
import type { ProviderHealth, PushDelivery, PushMessage, PushProvider } from "./types";

export class LocalPushProvider implements PushProvider {
  readonly name = "local-push";
  private readonly deliveries = new IdempotencyMemory<PushDelivery>();
  readonly outbox: PushMessage[] = [];
  async send(message: PushMessage): Promise<PushDelivery> {
    const existing = this.deliveries.get(message.idempotencyKey);
    if (existing) return existing;
    this.outbox.push(structuredClone(message));
    return this.deliveries.set(message.idempotencyKey, { id: providerId("push"), state: "delivered", provider: this.name, receiptId: providerId("receipt"), createdAt: nowIso() });
  }
  async health(): Promise<ProviderHealth> { return { provider: this.name, mode: "local", healthy: true, productionVerified: false, checkedAt: nowIso(), details: { outbox: this.outbox.length } }; }
}

export class ExpoPushProvider implements PushProvider {
  readonly name = "expo-push";
  private readonly token: string;
  constructor(token = process.env.EXPO_ACCESS_TOKEN) { this.token = requireProductionSecret(this.name, token); }
  async send(message: PushMessage): Promise<PushDelivery> {
    const response = await fetch("https://exp.host/--/api/v2/push/send", { method: "POST", headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ to: message.deviceToken, title: message.title, body: message.body, data: { ...message.data, deepLink: message.deepLink } }), signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`Expo push failed with ${response.status}`);
    const payload = await response.json() as { data?: { id?: string; status?: string; message?: string } };
    return { id: providerId("push"), state: payload.data?.status === "ok" ? "sent" : "failed", provider: this.name, receiptId: payload.data?.id, createdAt: nowIso() };
  }
  async health(): Promise<ProviderHealth> { return { provider: this.name, mode: "production-adapter", healthy: true, productionVerified: false, checkedAt: nowIso() }; }
}

export function createPushProvider(mode = process.env.PUSH_PROVIDER ?? "local"): PushProvider { return mode === "expo" ? new ExpoPushProvider() : new LocalPushProvider(); }
