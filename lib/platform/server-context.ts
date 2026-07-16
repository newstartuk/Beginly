import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadPlatformContext } from "./context";
import { isExplicitDemoMode } from "./runtime";

export async function loadOptionalPlatformContext() {
  if (isExplicitDemoMode()) return loadPlatformContext("demo-user");
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  try { return await loadPlatformContext(user.id, supabase as any); } catch { return null; }
}

export async function loadCurrentPlatformContext() {
  const context = await loadOptionalPlatformContext();
  if (!context) redirect("/onboarding");
  return context;
}
