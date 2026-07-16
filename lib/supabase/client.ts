"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let browserClient: SupabaseClient<Database> | undefined;

function cleanPublicEnv(value: string | undefined): string {
  return (value ?? "").replace(/^\uFEFF/, "").trim();
}

export function createBrowserSupabaseClient(): SupabaseClient<Database> {
  const url = cleanPublicEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = cleanPublicEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url || !anonKey) {
    throw new Error("Supabase public environment variables are required outside explicit demo mode.");
  }
  browserClient ??= createBrowserClient<Database>(url, anonKey);
  return browserClient;
}
