import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

// Strip a leading UTF-8 BOM (U+FEFF) and any other characters outside the
// Latin-1 range, plus surrounding whitespace, from an env var value.
//
// Root cause of the onboarding "Build my roadmap" hang/error: the
// NEXT_PUBLIC_SUPABASE_ANON_KEY value configured in Vercel apparently has a
// BOM character prepended (likely pasted from a UTF-8-with-BOM .env file).
// That BOM (U+FEFF) is outside ISO-8859-1, so the moment Supabase's own
// auth client builds a native `Headers` object and calls
// `headers.set('apikey', anonKey)`, Chrome's Fetch API throws
// "Failed to execute 'set' on 'Headers': String contains non ISO-8859-1
// code point" — synchronously, before any request is even sent. This broke
// every insert/upsert call (new user row creation, arrival profile save,
// task generation) with no network request ever leaving the browser.
//
// The custom `global.fetch` sanitizer below only cleans headers that reach
// it as a plain object; it never runs for this case because the crash
// happens inside Supabase's own Headers.set() call, upstream of our fetch
// wrapper. Sanitizing right here, at the point the key is read out of
// process.env, fixes it regardless of which internal code path
// (auth vs. postgrest) builds the request headers.
function sanitizeEnvValue(value: string | undefined): string {
  if (!value) return "";
  return value.replace(/[^\x00-\xFF]/g, "").trim();
}

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const anonKey = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (!url || !anonKey) {
      console.warn("Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }

    _supabase = createClient(url, anonKey, {
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
