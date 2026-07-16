import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";
  const variantClasses =
    variant === "primary"
      ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"
      : variant === "danger"
      ? "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]"
      : "bg-civic-50 border border-border text-navy hover:bg-civic-100 active:scale-[0.98]";

  return (
    <button
      className={[base, sizeClasses, variantClasses, className].join(" ")}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
