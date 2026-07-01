import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────────────────
// DISABLED 2026-07-01 — this middleware used to gate protected routes
// (dashboard, onboarding, settings, etc.) behind a "custom_auth_token" JWT
// cookie from a new custom email/password auth system that is still
// mid-migration (see SPRINT_AUTHSECURITY_2026-07-01.md). Two problems:
//
// 1. The live /login page still authenticates directly against Supabase
//    Auth and never sets that cookie, so every real sign-in was passing
//    Supabase Auth (200 OK) and then getting bounced straight back to
//    /login?redirect=... by this middleware — which also left the
//    "Signing in..." button stuck forever, since a search-param-only
//    redirect back to the same page doesn't reset the login form's React
//    state.
//
// 2. Independently of (1), this file imported `verify` from the
//    `jsonwebtoken` package to check that cookie. `jsonwebtoken` relies on
//    Node's `crypto` module and is not compatible with the Edge Runtime
//    that Next.js middleware builds against — every deploy that included
//    this import failed at build time with a "Module not found" webpack
//    error (see Vercel build logs for commit 0f70b2d), which is the real
//    reason production was still serving a build from well before this
//    file existed. If the JWT check is reinstated later, use an
//    Edge-compatible JWT library (e.g. `jose`) instead of `jsonwebtoken`.
//
// Protected pages (dashboard, onboarding, settings, etc.) already do their
// own client-side Supabase-session check and redirect to /login themselves
// (see hooks/useAuth.ts and each page's own auth-guard effect), so removing
// this server-side gate does not remove auth protection — it just stops
// double-guarding with a cookie that nothing currently issues.
//
// Re-enable route gating only once the new custom-auth login page +
// /api/auth/signin flow are fully deployed and verified to set
// "custom_auth_token" on every sign-in, using an Edge-compatible JWT
// library.
// ─────────────────────────────────────────────────────────────────────────
export async function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
