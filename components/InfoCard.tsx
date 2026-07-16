"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  /** Optional icon shown in the card header */
  icon?: LucideIcon;
  /** Card heading */
  title?: string;
  /** Card content — render any React children here */
  children: ReactNode;
  className?: string;
  /** Make the whole card clickable */
  onClick?: () => void;
  /** Show a subtle action arrow */
  actionHref?: string;
}

/**
 * Generic card wrapper with optional icon + title.
 * Used on dashboard quick-cards and info panels.
 */
export default function InfoCard({
  icon: Icon,
  title,
  children,
  className = "",
  onClick,
  actionHref,
}: InfoCardProps) {
  const cardClass = [
    "card",
    onClick ? "card-hover cursor-pointer" : "",
    className,
  ].filter(Boolean).join(" ");

  const inner = (
    <>
      {title && (
        <h2 className="section-title">
          {Icon && (
            <span className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-teal" aria-hidden="true" />
            </span>
          )}
          {title}
          {actionHref && (
            <a href={actionHref} className="ml-auto text-xs text-teal hover:underline font-normal">
              View all →
            </a>
          )}
        </h2>
      )}
      {children}
    </>
  );

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
        className={cardClass}
      >
        {inner}
      </div>
    );
  }

  return <div className={cardClass}>{inner}</div>;
}
