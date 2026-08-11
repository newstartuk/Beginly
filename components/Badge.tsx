"use client";

/* ─── Badge — design system v2.0 ────────────────────────────────
   Category colours follow the brand palette.
   Violet is reserved exclusively for Nia labels.
──────────────────────────────────────────────────────────────── */

const CATEGORY_STYLES: Record<string, string> = {
  Documents:   "text-[#1D4ED8] bg-[#EFF6FF] border-[#BFDBFE]",
  Accommodation: "text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]",
  University: "text-[#6D28D9] bg-[#F5F3FF] border-[#DDD6FE]",
  Money:      "text-[#15803D] bg-[#F0FDF4] border-[#BBF7D0]",
  Health:     "text-[#C92A2A] bg-[#FFF0F0] border-[#FECACA]",
  Work:       "text-[#BE185D] bg-[#FDF2F8] border-[#FBCFE8]",
  Safety:     "text-[#C2410C] bg-[#FFF7ED] border-[#FED7AA]",
  "Local Life": "text-[#0B7285] bg-[#F0FAFC] border-[#A5F3FC]",
  "Local Admin": "text-[#334E68] bg-[#EFF4FA] border-[#D9E2EC]",
  Growth:     "text-[#1E40AF] bg-[#EFF6FF] border-[#BFDBFE]",
  Transport:  "text-[#0891B2] bg-[#ECFEFF] border-[#A5F3FC]",
};

const PRIORITY_STYLES: Record<string, string> = {
  "Very High": "text-[#C92A2A] bg-[#FFF0F0] border-[#FECACA]",
  High:        "text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]",
  Medium:      "text-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]",
  Low:         "text-[#627D98] bg-[#EFF4FA] border-[#D9E2EC]",
};

/** Badge variant types */
const VARIANT_STYLES: Record<string, string> = {
  success:    "text-[#15803D] bg-[#F0FDF4] border-[#BBF7D0]",
  warning:    "text-[#92400E] bg-[#FFFBEB] border-[#FDE68A]",
  danger:     "text-[#991B1B] bg-[#FEF2F2] border-[#FECACA]",
  info:       "text-[#1E40AF] bg-[#EFF6FF] border-[#BFDBFE]",
  nia:        "text-[#5B21B6] bg-[#F5F3FF] border-[#DDD6FE]",
};

const STAGE_STYLES: Record<string, string> = {
  PRE:  "text-[#1D4ED8] bg-[#EFF6FF] border-[#BFDBFE]",
  D1:   "text-[#0B7285] bg-[#F0FAFC] border-[#A5F3FC]",
  D7:   "text-[#0D9488] bg-[#F0FDFA] border-[#99F6E4]",
  D30:  "text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]",
  D90:  "text-[#C2410C] bg-[#FFF7ED] border-[#FED7AA]",
  GROW: "text-[#15803D] bg-[#F0FDF4] border-[#BBF7D0]",
};

interface BadgeProps {
  label: string;
  /** 'category' = task category, 'priority' = task priority, 'stage' = journey stage */
  variant?: "category" | "priority" | "stage" | "success" | "warning" | "danger" | "info" | "nia";
  className?: string;
}

export default function Badge({
  label,
  variant = "category",
  className = "",
}: BadgeProps) {
  let style: string;

  switch (variant) {
    case "priority":  style = PRIORITY_STYLES[label]  ?? "text-muted bg-civic-50 border-border"; break;
    case "stage":     style = STAGE_STYLES[label]       ?? "text-muted bg-civic-50 border-border"; break;
    case "success":   style = VARIANT_STYLES.success;   break;
    case "warning":   style = VARIANT_STYLES.warning;   break;
    case "danger":    style = VARIANT_STYLES.danger;    break;
    case "info":      style = VARIANT_STYLES.info;      break;
    case "nia":       style = VARIANT_STYLES.nia;       break;
    default:          style = CATEGORY_STYLES[label]   ?? "text-muted bg-civic-50 border-border";
  }

  return (
    <span
      className={[
        "inline-flex items-center",
        "px-2.5 py-1 rounded-full",
        "text-xs font-semibold border",
        "whitespace-nowrap leading-none",
        style,
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
