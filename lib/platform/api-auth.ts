import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isExplicitDemoMode, requestIdFrom, PlatformContextUnavailableError } from "./runtime";

export interface ApiActor {
  userId: string;
  email?: string;
  requestId: string;
  demo: boolean;
  supabase: SupabaseClient;
}

export class ApiAuthError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
    this.name = "ApiAuthError";
  }
}

function publicConfig(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) throw new ApiAuthError(503, "platform_not_configured", "Beginly authentication is not configured.");
  return { url, anonKey };
}

export async function requireApiActor(request: NextRequest): Promise<ApiActor> {
  const requestId = requestIdFrom(request.headers);
  const { url, anonKey } = publicConfig();

  if (isExplicitDemoMode()) {
    return { userId: "demo-user", email: "demo@beginly.test", requestId, demo: true, supabase: createClient(url, anonKey, { auth: { persistSession: false } }) };
  }

  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice(7).trim();
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}`, "x-request-id": requestId } },
    });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new ApiAuthError(401, "authentication_required", "A valid Beginly session is required.");
    return { userId: user.id, email: user.email, requestId, demo: false, supabase };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new ApiAuthError(401, "authentication_required", "A valid Beginly session is required.");
  return { userId: user.id, email: user.email, requestId, demo: false, supabase: supabase as unknown as SupabaseClient };
}

export function apiFailure(error: unknown, requestId?: string): Response {
  const auth = error instanceof ApiAuthError ? error : null;
  const context = error instanceof PlatformContextUnavailableError ? error : null;
  const contract = error && typeof error === "object" && "status" in error && "code" in error ? error as { status: number; code: string; message?: string } : null;
  const status = auth?.status ?? (context ? 409 : undefined) ?? contract?.status ?? 500;
  const code = auth?.code ?? (context ? "onboarding_required" : undefined) ?? contract?.code ?? "internal_error";
  const message = status >= 500 ? "Beginly could not complete this request." : (auth?.message ?? context?.message ?? contract?.message ?? "The request could not be completed.");
  return Response.json({ error: { code, message, requestId } }, { status, headers: requestId ? { "x-request-id": requestId } : undefined });
}
