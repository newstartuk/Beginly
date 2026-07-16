import { IdempotencyMemory, nowIso, providerId, requireProductionSecret } from "./core";
import type { EmailDelivery, EmailMessage, EmailProvider, ProviderHealth } from "./types";

const textFromHtml = (value: string): string => value.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export class MemoryEmailProvider implements EmailProvider {
  readonly name: string = "memory-email";
  private readonly deliveries = new IdempotencyMemory<EmailDelivery>();
  readonly messages: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<EmailDelivery> {
    const existing = this.deliveries.get(message.idempotencyKey);
    if (existing) return existing;
    const delivery: EmailDelivery = {
      id: providerId("email"), idempotencyKey: message.idempotencyKey, state: "delivered", provider: this.name, createdAt: nowIso(),
    };
    this.messages.push(structuredClone(message));
    return this.deliveries.set(message.idempotencyKey, delivery);
  }

  async preview(message: EmailMessage): Promise<{ html: string; text: string }> {
    return { html: message.html, text: message.text ?? textFromHtml(message.html) };
  }

  simulateBounce(idempotencyKey: string, detail = "local hard-bounce simulation"): EmailDelivery {
    const prior = this.deliveries.get(idempotencyKey);
    const delivery: EmailDelivery = {
      id: prior?.id ?? providerId("email"), idempotencyKey, state: "bounced", provider: this.name, createdAt: nowIso(), detail,
    };
    return this.deliveries.set(idempotencyKey, delivery);
  }

  async health(): Promise<ProviderHealth> {
    return { provider: this.name, mode: "local", healthy: true, productionVerified: false, checkedAt: nowIso(), details: { messages: this.messages.length } };
  }
}

export class ConsoleEmailProvider extends MemoryEmailProvider {
  override readonly name = "console-email";
  override async send(message: EmailMessage): Promise<EmailDelivery> {
    const result = await super.send(message);
    console.info(JSON.stringify({ provider: this.name, to: message.to, subject: message.subject, state: result.state }));
    return result;
  }
}

export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";
  private readonly apiKey: string;
  private readonly from: string;
  private readonly endpoint: string;
  private readonly deliveries = new IdempotencyMemory<EmailDelivery>();

  constructor(options: { apiKey?: string; from?: string; endpoint?: string } = {}) {
    this.apiKey = requireProductionSecret(this.name, options.apiKey ?? process.env.RESEND_API_KEY);
    this.from = options.from ?? process.env.EMAIL_FROM ?? "Beginly <hello@beginly.app>";
    this.endpoint = options.endpoint ?? "https://api.resend.com/emails";
  }

  async send(message: EmailMessage): Promise<EmailDelivery> {
    const existing = this.deliveries.get(message.idempotencyKey);
    if (existing) return existing;
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json", "Idempotency-Key": message.idempotencyKey },
      body: JSON.stringify({ from: this.from, to: [message.to], subject: message.subject, html: message.html, text: message.text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Resend rejected email with ${response.status}`);
    const payload = await response.json() as { id?: string };
    return this.deliveries.set(message.idempotencyKey, {
      id: payload.id ?? providerId("email"), idempotencyKey: message.idempotencyKey, state: "sent", provider: this.name, createdAt: nowIso(),
    });
  }

  async preview(message: EmailMessage): Promise<{ html: string; text: string }> {
    return { html: message.html, text: message.text ?? textFromHtml(message.html) };
  }

  async health(): Promise<ProviderHealth> {
    return { provider: this.name, mode: "production-adapter", healthy: Boolean(this.apiKey), productionVerified: false, checkedAt: nowIso() };
  }
}

export function createEmailProvider(mode = process.env.EMAIL_PROVIDER ?? "memory"): EmailProvider {
  if (mode === "resend") return new ResendEmailProvider();
  if (mode === "console") return new ConsoleEmailProvider();
  return new MemoryEmailProvider();
}
