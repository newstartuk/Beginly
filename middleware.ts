import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

const PROTECTED_PATHS = [
  "/dashboard",
  "/checklist",
  "/budget",
  "/settings",
  "/support",
  "/tasks",
  "/onboarding",
];

const ADMIN_PATHS = ["/admin"];

const JWT_SECRET = process.env.CUSTOM_AUTH_SECRET ?? "";

function isProtected(path: string): boolean {
  return PROTECTED_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

function isAdmin(path: string): boolean {
  return ADMIN_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  // ─────────────────────────────────────────────────────────────────────────
  // DISABLED 2026-07-01 — route gating below checks for a "custom_auth_token"
  // JWT cookie from a new custom email/password auth system that is still
  // mid-migration (see SPRINT_AUTHSECURITY_2026-07-01.md). The live /login
  // page still authenticates directly against Supabase Auth and never sets
  // that cookie, so every real sign-in was passing Supabase Auth (200 OK)
  // and then getting bounced straight back to /login?redirect=... by this
  // middleware — which also left the "Signing in..." button stuck forever,
  // since a search-param-only redirect back to the same page doesn't reset
  // the login form's React state.
  //
  // Protected pages (dashboard, onboarding, settings, etc.) already do their
  // own client-side Supabase-session check and redirect to /login themselves
  // (see hooks/useAuth.ts and each page's own auth-guard effect), so removing
  // this server-side gate does not remove auth protection — it just stops
  // double-guarding with a cookie that nothing currently issues.
  //
  // Re-enable this block (delete the early return below) only once the new
  // custom-auth login page + /api/auth/signin flow are fully deployed and
  // verified to set "custom_auth_token" on every sign-in.
  // ─────────────────────────────────────────────────────────────────────────
  return NextResponse.next();

  /* eslint-disable no-unreachable */
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // Read our custom auth token from cookie
  const token = request.cookies.get("custom_auth_token")?.value ?? "";
  let payload: { userId?: string } | null = null;

  if (token && JWT_SECRET) {
    try {
      payload = verify(token, JWT_SECRET) as { userId: string };
    } catch {
      // Invalid/expired token — treat as unauthenticated
      payload = null;
    }
  }

  const isAuthenticated = !!payload?.userId;

  // Redirect unauthenticated users away from protected routes
  if (isProtected(pathname) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users away from admin routes
  if (isAdmin(pathname)) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // Admin check — skip for now (can be added later via custom_users.is_admin)
  }

  // If authenticated and hits login/signup, redirect to dashboard (or ?redirect param)
  if ((pathname === "/login" || pathname === "/signup") && isAuthenticated) {
    const redirectTo = request.nextUrl.searchParams.get("redirect");
    const url = request.nextUrl.clone();
    url.pathname = redirectTo || "/dashboard";
    url.searchParams.delete("redirect");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
  /* eslint-enable no-unreachable */
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
