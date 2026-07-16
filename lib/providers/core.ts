import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export class ProviderConfigurationError extends Error {
  constructor(provider: string, detail: string) {
    super(`${provider} is not safely configured: ${detail}`);
    this.name = "ProviderConfigurationError";
  }
}

export const nowIso = (): string => new Date().toISOString();
export const providerId = (prefix: string): string => `${prefix}_${randomUUID()}`;
export const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

const unsafePatterns = [/^$/, /change[-_]?me/i, /example/i, /default/i, /test[-_]?secret/i, /local[-_]?only/i, /placeholder/i];

export function requireProductionSecret(provider: string, value: string | undefined, minimumLength = 20): string {
  const candidate = value?.trim() ?? "";
  if (candidate.length < minimumLength || unsafePatterns.some((pattern) => pattern.test(candidate))) {
    throw new ProviderConfigurationError(provider, "missing, too short or resembles a local/default value");
  }
  return candidate;
}

export function signPayload(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyPayloadSignature(secret: string, payload: string, signature: string): boolean {
  const expected = Buffer.from(signPayload(secret, payload));
  const received = Buffer.from(signature || "");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export class IdempotencyMemory<T> {
  private readonly values = new Map<string, T>();
  get(key: string): T | undefined { return this.values.get(key); }
  set(key: string, value: T): T { this.values.set(key, value); return value; }
  has(key: string): boolean { return this.values.has(key); }
  entries(): Array<[string, T]> { return [...this.values.entries()]; }
  clear(): void { this.values.clear(); }
}

export function redactObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactObject);
  if (!value || typeof value !== "object") return value;
  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (/token|secret|password|authorization|cookie|document|message|body|html/i.test(key)) output[key] = "[REDACTED]";
    else output[key] = redactObject(item);
  }
  return output;
}
