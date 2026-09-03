"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, BookOpenCheck, BriefcaseBusiness, CheckSquare, Compass, FileCheck2, HeartPulse, House, Landmark, LifeBuoy, LogIn, LogOut, Menu, MessageCircle, Package, Settings, ShieldCheck, Sparkles, TrendingUp, UserRound, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";import { isClientDemoMode } from "@/lib/platform/runtime";import { isClientDemoMode } from "@/lib/platform/runtime";

const links = [
  { href: "/platform", label: "Today", icon: Compass },
  { href: "/journey", label: "Journey Hub", icon: Sparkles },
  { href: "/checklist", label: "Task Library", icon: CheckSquare },
  { href: "/budget", label: "Budget Planner", icon: TrendingUp },
  { href: "/document-helper", label: "Doc Helper", icon: FileCheck2 },
  { href: "/bank", label: "Banking", icon: Landmark },
  { href: "/emergency", label: "Emergency", icon: HeartPulse },
  { href: "/opportunities", label: "Opportunities", icon: BriefcaseBusiness },
  { href: "/nia", label: "Nia", icon: MessageCircle },
  { href: "/household", label: "Household", icon: Users },
  { href: "/products", label: "Products", icon: Package },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/evidence-room", label: "Evidence", icon: FileCheck2 },
  { href: "/guides", label: "Trust & Guides", icon: BookOpenCheck },
  { href: "/nhs", label: "NHS", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/support", label: "Support", icon: LifeBuoy },
];

export default function PlatformShell({ children, title, eyebrow, action }: { children: ReactNode; title: string; eyebrow?: string; action?: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false); const [signedIn, setSignedIn] = useState(false); useEffect(() => { if (isClientDemoMode()) { setSignedIn(true); return; } supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session)); const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session)); return () => subscription.unsubscribe(); }, []); const [signedIn, setSignedIn] = useState(false); useEffect(() => { if (isClientDemoMode()) { setSignedIn(true); return; } supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session)); const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session)); return () => subscription.unsubscribe(); }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };
  return (
    <div className="platform-shell">
      <aside className={`platform-sidebar ${open ? "is-open" : ""}`}>
        <div className="platform-brand">
          <div className="platform-brand-mark">B</div>
          <div><strong>Beginly</strong><span>Living Path OS</span></div>
          <button className="platform-close" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <nav aria-label="Beginly platform">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/platform" && pathname.startsWith(`${href}/`));
            return <Link key={href} href={href} className={active ? "active" : ""} onClick={() => setOpen(false)}><Icon size={18} /><span>{label}</span>{active && <i />}</Link>;
          })}
        </nav>
        {signedIn ? (<button onClick={handleSignOut} className="platform-signout"><LogOut size={16} /><span>Sign out</span></button>) : (<Link href="/login" className="platform-signout" onClick={() => setOpen(false)}><LogIn size={16} /><span>Sign in</span></Link>)}
        <div className="platform-trust-card"><ShieldCheck size={18} /><div><strong>Trust-first</strong><span>Free, owned and sponsored access is checked before any paid suggestion.</span></div></div>
      </aside>
      {open && <button aria-label="Close navigation overlay" className="platform-overlay" onClick={() => setOpen(false)} />}
      <main className="platform-main">
        <header className="platform-header">
          <button className="platform-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="platform-heading"><span>{eyebrow ?? "Adaptive transition intelligence"}</span><h1>{title}</h1></div>
          <div className="platform-header-actions">{action}<Link className="platform-icon-button" href="/notifications" aria-label="Notifications"><Bell size={19} /></Link><Link className="platform-avatar" href="/settings" aria-label="Account settings"><UserRound size={18}/></Link></div>
        </header>
        <div className="platform-content">{children}</div>
        <footer className="platform-footer"><House size={15} /><span>Beginly follows the journey beyond the first arrival problem.</span></footer>
      </main>
    </div>
  );
}
