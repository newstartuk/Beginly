"use client";

import { ReactNode } from "react";
import {
  Info,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
} from "lucide-react";

export type AlertVariant = "info" | "success" | "warning" | "danger" | "violet";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  icon?: ReactNode;
  className?: string;
  /** Render the alert as a div (default) or a specific element */
  as?: "div" | "aside" | "section";
  /** Show the icon (default: true) */
  showIcon?: boolean;
}

const VARIANT_META: Record<
  AlertVariant,
  { icon: ReactNode; defaultTitle?: string }
> = {
  info: {
    icon: <Info className="w-4 h-4 shrink-0 mt-0.5" />,
    defaultTitle: "FYI",
  },
  success: {
    icon: <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />,
    defaultTitle: "Good to know",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />,
    defaultTitle: "Watch out",
  },
  danger: {
    icon: <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />,
    defaultTitle: "Important",
  },
  violet: {
    icon: <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />,
    defaultTitle: "Nia says",
  },
};

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  info:    "bg-info-bg    border-[#BFDBFE] text-[#1E40AF]",
  success: "bg-green-light border-[#BBF7D0] text-[#166534]",
  warning: "bg-amber-light border-[#FDE68A] text-[#92400E]",
  danger:  "bg-red-light  border-[#FECACA] text-[#991B1B]",
  violet:  "bg-violet-light border-[#DDD6FE] text-[#5B21B6]",
};

/**
 * Reusable alert component.
 * Use `variant` to pick the semantic meaning; `title` to override the default heading.
 * Children are rendered as the alert body.
 */
export default function Alert({
  variant = "info",
  title,
  children,
  icon,
  className = "",
  as: Tag = "div",
  showIcon = true,
}: AlertProps) {
  const meta = VARIANT_META[variant];

  return (
    <Tag
      className={[
        "alert",
        VARIANT_CLASSES[variant],
        "rounded-xl",
        className,
      ].join(" ")}
    >
      {showIcon && (
        <div className="shrink-0">
          {icon ?? meta.icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        {(title ?? meta.defaultTitle) && (
          <p className="font-semibold text-sm mb-0.5">{title ?? meta.defaultTitle}</p>
        )}
        {children && (
          <div className="text-sm leading-relaxed">{children}</div>
        )}
      </div>
    </Tag>
  );
}
