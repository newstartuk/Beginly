import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

function cleanPublicEnv(value: string | undefined): string {
  return (value ?? "").replace(/^\uFEFF/, "").trim();
}

// ISO-8859-1 header sanitiser — strips characters outside the latin-1 range
// that Chrome's fetch API rejects when Supabase JS runtime-info leaks into headers.
const safeFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  if (init?.headers) {
    const raw = init.headers instanceof Headers
      ? Object.fromEntries((init.headers as Headers).entries())
      : (init.headers as Record<string, string>);
    const safe: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      safe[k] = String(v).replace(/[^\x00-\xFF]/g, "");
    }
    init = { ...init, headers: safe };
  }
  return fetch(input, init as RequestInit);
};

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = cleanPublicEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const anonKey = cleanPublicEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (!url || !anonKey) {
      console.warn("Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }

    // createBrowserClient stores the session in cookies (not just localStorage)
    // so Next.js server components can read it via createServerClient.
    _supabase = createBrowserClient(url, anonKey, {
      global: { fetch: safeFetch },
    }) as SupabaseClient;
  }
  return _supabase;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (prop === "then" || prop === "toJSON") return undefined;
    return (getSupabase() as any)[prop];
  },
});
