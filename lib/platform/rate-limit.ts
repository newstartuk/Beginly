import { ApiAuthError } from "./api-auth";

interface WindowState { count: number; resetAt: number }
const windows = new Map<string, WindowState>();

export interface RateLimitResult { limit: number; remaining: number; resetAt: string }

export function enforceRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  const safeLimit = Math.max(1, Math.floor(limit));
  const safeWindow = Math.max(1_000, Math.floor(windowMs));
  const current = windows.get(key);
  const state = !current || current.resetAt <= now ? { count: 0, resetAt: now + safeWindow } : current;
  state.count += 1;
  windows.set(key, state);
  if (state.count > safeLimit) {
    const retrySeconds = Math.max(1, Math.ceil((state.resetAt - now) / 1_000));
    throw new ApiAuthError(429, "rate_limited", `Too many requests. Try again in ${retrySeconds} seconds.`);
  }
  return { limit: safeLimit, remaining: Math.max(0, safeLimit - state.count), resetAt: new Date(state.resetAt).toISOString() };
}

export function resetRateLimits(): void { windows.clear(); }
