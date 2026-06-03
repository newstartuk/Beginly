import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes require a valid session cookie
const PROTECTED_PATHS = [
  "/dashboard",
  "/checklist",
  "/budget",
  "/settings",
  "/support",
  "/tasks",
  "/admin",
];

// Routes only accessible to admin users
const ADMIN_PATHS = ["/admin"];

function isProtected(path: string): boolean {
  return PROTECTED_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

function isAdmin(path: string): boolean {
  return ADMIN_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals (redundant with matcher but belt-and-suspenders)
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
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
    // Exclude Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon).*)",
  ],
};
