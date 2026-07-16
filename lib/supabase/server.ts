import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase environment variables are required.");
  const store = await cookies();
  return createServerClient<Database>(url.trim(), anonKey.trim(), {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (entries) => {
        try {
          for (const entry of entries) store.set(entry.name, entry.value, entry.options);
        } catch {
          // Server Components cannot always write cookies; middleware refreshes sessions.
        }
      },
    },
  });
}
