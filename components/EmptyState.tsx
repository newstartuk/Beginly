"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  /** Lucide icon to display */
  icon: LucideIcon;
  /** Main message text */
  message: string;
  /** Optional secondary text */
  description?: string;
  /** Optional CTA button */
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}

/**
 * Branded empty state — used when a list or view has no content.
 * Replace placeholder text and ensure this matches brand voice.
 */
export default function EmptyState({
  icon: Icon,
  message,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center",
        "py-14 px-6 text-center rounded-xl",
        "bg-civic-50 border border-dashed border-border",
        className,
      ].join(" ")}
      role="status"
    >
      <div className="w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-6 h-6 text-muted" aria-hidden="true" />
      </div>

      <p className="text-sm font-semibold text-navy mb-1">{message}</p>

      {description && (
        <p className="text-xs text-muted max-w-xs leading-relaxed mt-1">{description}</p>
      )}

      {action && (
        action.href ? (
          <a
            href={action.href}
            className="mt-4 btn-primary text-xs"
          >
            {action.label}
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="mt-4 btn-primary text-xs"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
