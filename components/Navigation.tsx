"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser, clearAllData } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Bot,
  Settings,
  LifeBuoy,
  Shield,
  LogOut,
  X,
  Menu,
  ChevronRight,
  ChevronLeft,
  Building2,
  TrendingUp,
} from "lucide-react";
import MobileNav from "./MobileNav";

/* ─── Admin role guard ──────────────────────────────────────────
   P1/P2 priority: protect /admin behind a role check.
   For MVP v1, admin access is set via localStorage flag.
   In a later sprint this should be replaced by a proper
   `role: "student" | "admin"` field on the User object
   stored in localStorage (and eventually Supabase auth).
────────────────────────────────────────────────────────────────── */
function isAdminUser(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // MVP pattern: set via browser console: localStorage.setItem('nsk_admin','true')
    return localStorage.getItem("nsk_admin") === "true";
  } catch {
    return false;
  }
}

const NAV_ITEMS = [
  { href: "/dashboard",         label: "Dashboard",        icon: LayoutDashboard },
  { href: "/checklist",         label: "My Checklist",    icon: CheckSquare },
  { href: "/budget",             label: "Budget Planner",  icon: TrendingUp },
  { href: "/guides",            label: "Guidance",        icon: BookOpen },
  { href: "/document-helper",   label: "Document Helper", icon: Bot },
  { href: "/nhs",               label: "NHS Guide",       icon: Shield },
  { href: "/bank",              label: "Banking",         icon: Building2 },
  { href: "/emergency",          label: "Emergency",       icon: Shield },
  { href: "/settings",          label: "Settings",        icon: Settings },
  { href: "/support",           label: "Support",         icon: LifeBuoy },
];

const SIDEBAR_COLLAPSED_KEY = "nsk_sidebar_collapsed";

function getCollapsed(defaultVal: boolean): boolean {
  if (typeof window === "undefined") return defaultVal;
  try {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored !== null ? JSON.parse(stored) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setCollapsed(val: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(val));
  } catch {
    // ignore
  }
}

export default function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsedState] = useState(true);

  useEffect(() => {
    setUser(getUser());
    setIsAdmin(isAdminUser());
    setCollapsedState(getCollapsed(true));

    // Listen for storage changes (e.g. admin flag toggled)
    const onStorage = () => setIsAdmin(isAdminUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsedState(next);
    setCollapsed(next);
  };

  const handleLogout = () => {
    clearAllData();
    window.location.href = "/login";
  };

  const sidebarWidth = collapsed ? "w-16" : "w-64";
  const mainMargin  = collapsed ? "md:ml-16" : "md:ml-64";

  // Build nav items, hiding /admin unless admin
  const visibleItems = NAV_ITEMS;

  return (
    <div className="min-h-screen bg-mist flex">

      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-border shrink-0 fixed h-full z-40 transition-all duration-200 ${sidebarWidth}`}
      >
        {/* Logo + Collapse toggle */}
        <div
          className={`relative flex items-center border-b border-border py-3.5 ${
            collapsed ? "justify-center px-2" : "gap-2.5 px-4"
          }`}
        >
          {/* Logo mark */}
          <div className="w-8 h-8 bg-teal rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm leading-none">B</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-navy text-sm leading-tight">Beginly</p>
              <p className="text-xs text-muted leading-tight">UK Settlers</p>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className={`ml-auto p-1.5 rounded-lg hover:bg-civic-50 text-muted transition-colors ${
              collapsed ? "absolute top-3 right-1.5" : ""
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft  className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <div className={collapsed ? "px-2 space-y-0.5" : "px-3 space-y-0.5"}>
            {visibleItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  className={[
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    active
                      ? "bg-teal-50 text-teal"
                      : "text-civic-600 hover:bg-civic-50 hover:text-navy",
                    collapsed ? "justify-center" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Admin section — only shown to admin users */}
          {isAdmin && (
            <>
              <div className={`border-t border-border my-2 ${collapsed ? "mx-2" : "mx-3"}`} />
              <div className={collapsed ? "px-2" : "px-3"}>
                <p className={`text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 px-3 ${collapsed ? "hidden" : ""}`}>
                  Admin
                </p>
                <Link
                  href="/admin"
                  title={collapsed ? "Admin Dashboard" : undefined}
                  className={[
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    pathname.startsWith("/admin")
                      ? "bg-violet-light text-violet"
                      : "text-civic-600 hover:bg-civic-50 hover:text-navy",
                    collapsed ? "justify-center" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Admin Dashboard</span>}
                </Link>
              </div>
            </>
          )}
        </nav>

        {/* User + Logout */}
        <div className={`border-t border-border p-2 ${collapsed ? "flex flex-col items-center gap-1.5" : "space-y-0.5"}`}>
          <div
            className={[
              "flex items-center rounded-xl hover:bg-civic-50 transition-colors",
              collapsed ? "w-10 h-10 justify-center" : "gap-2.5 px-3 py-2.5",
            ].filter(Boolean).join(" ")}
          >
            <div className="w-7 h-7 bg-civic-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-navy">
                {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-navy truncate">{user?.name}</p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            title={collapsed ? "Sign out" : undefined}
            className={[
              "flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-civic-500",
              "hover:bg-red-50 hover:text-red-500 transition-all w-full",
              collapsed ? "justify-center w-10 h-9" : "",
            ].filter(Boolean).join(" ")}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay backdrop ──────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile sidebar ───────────────────────────────────── */}
      <div
        className={[
          "fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col",
          "transform transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="font-bold text-navy text-sm">Beginly</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-civic-50">
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        {/* Mobile nav */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {visibleItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={[
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-teal-50 text-teal"
                    : "text-civic-600 hover:bg-civic-50",
                ].join(" ")}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto text-muted" />}
              </Link>
            );
          })}

          {/* Admin — mobile */}
          {isAdmin && (
            <>
              <div className="border-t border-border my-2" />
              <p className="text-xs font-semibold text-muted uppercase tracking-wider px-3 mb-1.5">Admin</p>
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={[
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  pathname.startsWith("/admin")
                    ? "bg-violet-light text-violet"
                    : "text-civic-600 hover:bg-civic-50",
                ].join(" ")}
              >
                <Shield className="w-4 h-4 shrink-0" />
                Admin Dashboard
              </Link>
            </>
          )}
        </nav>

        {/* Mobile footer */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 bg-civic-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-navy">
                {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-navy truncate">{user?.name}</p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-civic-500 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            Sign out
          </button>
        </div>
      </div>

      {/* ── Page wrapper ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="bg-white border-b border-border px-4 py-3 flex items-center justify-between md:hidden sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="font-bold text-navy text-sm">Beginly</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-civic-50 transition-colors"
          >
            <Menu className="w-5 h-5 text-navy" />
          </button>
        </header>

        {/* Main content */}
        <main
          className={[
            "flex-1 px-4 py-6 pb-24 md:py-8",
            "max-w-5xl w-full mx-auto",
            mainMargin,
            "transition-all duration-200",
          ].join(" ")}
        >
          {children}
        </main>

        {/* Mobile bottom tab bar */}
        <MobileNav onMoreClick={() => setMobileOpen(true)} />
      </div>

    </div>
  );
}
