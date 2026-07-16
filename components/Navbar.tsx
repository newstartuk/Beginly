"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  items: NavItem[];
  title?: string;
  showLogo?: boolean;
}

export default function Navbar({ items, title = "Beginly", showLogo = true }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 flex-wrap" role="navigation" aria-label="Main navigation">
      {showLogo && (
        <span className="text-sm font-bold text-primary mr-2">{title}</span>
      )}
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted hover:text-navy hover:bg-civic-50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
