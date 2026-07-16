"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  TrendingUp,
  BookOpen,
  Menu,
} from "lucide-react";

const TABS = [
  { href: "/platform", label: "Today", icon: LayoutDashboard },
  { href: "/journey", label: "Journey", icon: BookOpen },
  { href: "/checklist", label: "Tasks", icon: CheckSquare },
  { href: "/budget", label: "Budget", icon: TrendingUp },
  { href: "/more", label: "More", icon: Menu },
];

interface MobileNavProps {
  onMoreClick?: () => void;
}

export default function MobileNav({ onMoreClick }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch">
        {TABS.map(({ href, label, icon: Icon }) => {
          // "/more" is not a real route — it triggers the hamburger menu
          if (href === "/more") {
            return (
              <button
                key={href}
                onClick={onMoreClick}
                className="flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] text-muted hover:text-navy transition-colors"
                aria-label="Open menu"
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </button>
            );
          }

          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted hover:text-navy"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for notched phones */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white" />
    </nav>
  );
}
