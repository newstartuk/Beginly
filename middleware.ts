import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/checklist",
  "/budget",
  "/settings",
  "/support",
  "/tasks",
  "/admin",
  "/onboarding",
];

const ADMIN_PATHS = ["/admin"];

function isProtected(path: string): boolean {
  return PROTECTED_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

function isAdmin(path: string): boolean {
  return ADMIN_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

// Simple JWT verification (mirrors lib/auth.ts for edge compatibility)
function verifyToken(token: string): { sub?: string; isAdmin?: boolean; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const crypto = require("crypto");
    const secret = process.env.JWT_SECRET;
    // If no secret is configured, reject all protected routes to prevent token forgery
    if (!secret) return null;
    const [header, payload, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (signature !== expectedSig) return null;

    const decoded = JSON.parse(Buffer.from(payload, "base64").toString());
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;

    return decoded;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const session = request.cookies.get("nsk_session")?.value;
  const isAdminUser = request.cookies.get("nsk_is_admin")?.value === "true";

  // Redirect unauthenticated users to login
  if (isProtected(pathname) && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Verify JWT on protected routes (extra safety)
  if (isProtected(pathname) && session) {
    const payload = verifyToken(session);
    if (!payload) {
      // Token invalid — clear cookies and redirect to login
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      const response = NextResponse.redirect(url);
      response.cookies.set("nsk_session", "", { maxAge: 0, path: "/" });
      response.cookies.set("nsk_is_admin", "", { maxAge: 0, path: "/" });
      return response;
    }
  }

  // Block non-admins from admin routes
  if (isAdmin(pathname) && !isAdminUser) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|api).*)",
  ],
};
