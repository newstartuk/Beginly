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
