/**
 * Custom auth library — server-side only.
 * Bypasses browser→Supabase auth calls by using server-to-server Supabase REST API.
 * Sessions stored in custom_sessions table, passwords hashed with bcrypt.
 */
import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const JWT_SECRET = process.env.CUSTOM_AUTH_SECRET!;

// NOTE: deliberately not throwing here if CUSTOM_AUTH_SECRET is unset.
// This module is imported (for static analysis) during every Next.js build,
// including "collect page data" — a module-level throw here crashes the
// entire production build even though nothing on the live site currently
// calls these functions (the app runs on Supabase Auth directly; see
// SPRINT_AUTHSECURITY_2026-07-01.md). If CUSTOM_AUTH_SECRET is genuinely
// missing, sign()/verify() below will throw at call time instead, which
// every caller already wraps in try/catch.

// Supabase client with service-role (bypasses RLS) — only used server-side
function getServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: { fetch: (url, opts) => fetch(url, { ...opts, cache: "no-store" } as RequestInit) },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ── Password helpers ───────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hash_: string): Promise<boolean> {
  return compare(password, hash_);
}

// ── JWT helpers ───────────────────────────────────────────────────────────

export function signSessionToken(userId: string, sessionId: string): string {
  return sign({ userId, sessionId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySessionToken(token: string): { userId: string; sessionId: string } | null {
  try {
    return verify(token, JWT_SECRET) as { userId: string; sessionId: string };
  } catch {
    return null;
  }
}

// ── Database helpers (Supabase REST with anon key + RLS bypass via service) ──

const db = () => getServiceClient();

export interface DbUser {
  id: string;
  user_id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface DbSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export async function getCustomUserByEmail(email: string): Promise<DbUser | null> {
  const { data } = await db()
    .from("custom_users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return data as DbUser | null;
}

export async function createCustomUser(userId: string, email: string, passwordHash: string): Promise<DbUser> {
  const { data, error } = await db()
    .from("custom_users")
    .insert({ user_id: userId, email: email.toLowerCase(), password_hash: passwordHash })
    .select()
    .single();
  if (error) throw new Error(`Failed to create custom user: ${error.message}`);
  return data as DbUser;
}

export async function getAuthUserById(userId: string): Promise<{ id: string; email?: string; user_metadata?: Record<string, unknown> } | null> {
  const { data } = await db().from("auth.users").select("id,email,user_metadata").eq("id", userId).maybeSingle();
  return data;
}

export async function createSession(userId: string): Promise<DbSession> {
  const { data, error } = await db()
    .from("custom_sessions")
    .insert({ user_id: userId, token: crypto.randomUUID(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
    .select()
    .single();
  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return data as DbSession;
}

export async function getSession(sessionId: string): Promise<DbSession | null> {
  const { data } = await db()
    .from("custom_sessions")
    .select("*")
    .eq("id", sessionId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return data as DbSession | null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db().from("custom_sessions").delete().eq("id", sessionId);
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await db().from("custom_sessions").delete().eq("user_id", userId);
}

export async function getUserProfile(userId: string): Promise<{ id: string } | null> {
  const { data } = await db()
    .from("arrival_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}
