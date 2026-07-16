import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireProductionSecret } from "@/lib/providers/core";

export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url || !/^https?:\/\//.test(url)) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required for server administration.");
  const serviceRole = requireProductionSecret("supabase-service-role", process.env.SUPABASE_SERVICE_ROLE_KEY, 30);
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}
