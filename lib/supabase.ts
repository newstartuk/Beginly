import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      console.warn("Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }

    _supabase = createClient(url ?? "", anonKey ?? "", {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          if (init?.headers) {
            const raw = init.headers instanceof Headers
              ? Object.fromEntries((init.headers as Headers).entries())
              : (init.headers as Record<string, string>);
            const safe: Record<string, string> = {};
            for (const [k, v] of Object.entries(raw)) {
              // Strip any characters outside ISO-8859-1 range that Chrome's
              // fetch API rejects — can appear when Supabase JS detects Node.js
              // runtime info during SSR and the value leaks into the client bundle.
              safe[k] = String(v).replace(/[^\x00-\xFF]/g, "");
            }
            init = { ...init, headers: safe };
          }
          return fetch(input, init as RequestInit);
        },
      },
    });
  }
  return _supabase;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (prop === "then" || prop === "toJSON") return undefined;
    return (getSupabase() as any)[prop];
  },
});
