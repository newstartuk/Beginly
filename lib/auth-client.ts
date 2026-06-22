import { supabase } from "@/lib/supabase";
import type { User as BeginlyUser } from "@/types";

type AuthLike = { id: string; email?: string | null; user_metadata?: Record<string, unknown> };

export function displayNameFromAuthUser(user: { email?: string | null; user_metadata?: Record<string, unknown> }): string {
  const metaName = typeof user.user_metadata?.name === "string" ? user.user_metadata.name.trim() : "";
  if (metaName) return metaName;
  return user.email?.split("@")[0] ?? "Beginly user";
}

/**
 * Ensures a row exists in `public.users` for the authenticated user and returns
 * the Beginly profile. Pass the already-known auth user (from signIn/getUser) to
 * skip an extra auth round-trip. Falls back to the local session if not provided.
 */
export async function ensureBeginlyUser(knownUser?: AuthLike): Promise<BeginlyUser | null> {
  let user: AuthLike | null = knownUser ?? null;
  if (!user) {
    // getSession reads from local storage — no network round-trip.
    const { data } = await supabase.auth.getSession();
    user = data.session?.user ?? null;
  }
  if (!user) return null;

  const name = displayNameFromAuthUser(user);
  const email = user.email ?? "";

  const { data: existing } = await supabase
    .from("users")
    .select("id,name,email,profile_completed,created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return {
      id: user.id,
      name: existing.name ?? name,
      email: existing.email ?? email,
      passwordHash: "",
      createdAt: existing.created_at ?? new Date().toISOString(),
      profileCompleted: Boolean(existing.profile_completed),
    };
  }

  // New user — create the row, then return the known values directly. No second
  // SELECT needed: we already know everything we just inserted.
  const { error } = await supabase.from("users").insert({
    id: user.id,
    name,
    email,
    password_hash: "[managed by Supabase Auth]",
    profile_completed: false,
    is_admin: Boolean(user.user_metadata?.is_admin),
  });

  if (error) {
    // Do not block login if the table has not been migrated yet. Protected pages
    // will still rely on Supabase Auth; the database setup screen/report will flag it.
    console.error("Beginly user profile insert failed:", error.message);
  }

  return {
    id: user.id,
    name,
    email,
    passwordHash: "",
    createdAt: new Date().toISOString(),
    profileCompleted: false,
  };
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  if (user.user_metadata?.is_admin === true) return true;
  const { data } = await supabase.from("users").select("is_admin").eq("id", user.id).maybeSingle();
  return Boolean(data?.is_admin);
}
