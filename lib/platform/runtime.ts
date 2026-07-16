export function isExplicitDemoMode(): boolean {
  return process.env.BEGINLY_DEMO_MODE === "true" || process.env.NEXT_PUBLIC_BEGINLY_DEMO_MODE === "true";
}

export function isClientDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_BEGINLY_DEMO_MODE === "true";
}

export function requestIdFrom(headers: Headers): string {
  return headers.get("x-request-id")?.slice(0, 120) || crypto.randomUUID();
}

export class PlatformContextUnavailableError extends Error {
  constructor(message = "Beginly profile context is not available.") {
    super(message);
    this.name = "PlatformContextUnavailableError";
  }
}
