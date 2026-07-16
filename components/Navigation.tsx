"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { clearUser } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Bot,
  Compass,
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
import Logo from "./Logo";

const NAV_ITEMS = [
  { href: "/journey",           label: "Journey",          icon: Compass },
  { href: "/platform",          label: "Today",            icon: LayoutDashboard },
  { href: "/dashboard",         label: "Dashboard Ref",    icon: LayoutDashboard },
  { href: "/checklist",         label: "Task Library",     icon: CheckSquare },
  { href: "/budget",            label: "Budget Planner",   icon: TrendingUp },
  { href: "/guides",            label: "Guidance",        icon: BookOpen },
  { href: "/document-helper",   label: "Doc Helper",      icon: Bot },
  { href: "/nhs",              label: "NHS Guide",       icon: Shield },
  { href: "/bank",             label: "Banking",         icon: Building2 },
  { href: "/emergency",         label: "Emergency",       icon: Shield },
  { href: "/settings",          label: "Settings",        icon: Settings },
  { href: "/support",          label: "Support",         icon: LifeBuoy },
  { href: "#signout",          label: "Sign out",       icon: LogOut },
];

const SIDEBAR_COLLAPSED_KEY = "beginly_sidebar_collapsed";

function getCollapsedKey(defaultVal: boolean): boolean {
  if (typeof window === "undefined") return defaultVal;
  try {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored !== null ? JSON.parse(stored) : defaultVal;
  } catch { return defaultVal; }
}

function setCollapsedKey(val: boolean): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(val)); } catch { /* ignore */ }
}

export default function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<{ user: { id: string; email?: string; user_metadata?: { name?: string } } | null }>({ user: null });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsedState] = useState(true);

  useEffect(() => {
    // Read the session from local storage (instant, no network round-trip).
    supabase.auth.getSession().then(({ data }) => setSession({ user: data.session?.user ?? null }));

    // Listen for auth changes (sign in / sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession({ user: session?.user ?? null });
    });

    setCollapsedState(getCollapsedKey(true));
    return () => subscription.unsubscribe();
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsedState(next);
    setCollapsedKey(next);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    window.location.href = "/login";
  };

  const userName = session.user?.user_metadata?.name ?? session.user?.email?.split("@")[0] ?? "?";
  const userEmail = session.user?.email ?? "";
  const userInitial = userName.charAt(0).toUpperCase();

  const sidebarWidth = collapsed ? "w-16" : "w-64";
  const mainMargin  = collapsed ? "md:ml-16" : "md:ml-64";

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
          <Logo size={32} className="rounded-xl shrink-0 shadow-sm" />
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
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              if (href === "#signout") {
                return (
                  <button
                    key={href}
                    onClick={handleLogout}
                    title={collapsed ? label : undefined}
                    className={[
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full",
                      "text-civic-500 hover:bg-red-50 hover:text-red-500",
                      collapsed ? "justify-center" : "",
                    ].filter(Boolean).join(" ")}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </button>
                );
              }
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
              <span className="text-xs font-bold text-navy">{userInitial}</span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-navy truncate">{userName}</p>
                <p className="text-xs text-muted truncate">{userEmail}</p>
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
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Logo size={28} className="rounded-xl" />
            <span className="font-bold text-navy text-sm">Beginly</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-civic-50">
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            if (href === "#signout") {
              return (
                <button
                  key={href}
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-civic-500 hover:bg-red-50 hover:text-red-500 w-full"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              );
            }
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
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 bg-civic-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-navy">{userInitial}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-navy truncate">{userName}</p>
              <p className="text-xs text-muted truncate">{userEmail}</p>
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
            <Logo size={28} className="rounded-xl" />
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
