import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  borderColor?: string;
  bgColor?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  borderColor = "border-border",
  bgColor = "bg-white",
  onClick,
}: CardProps) {
  const classes = [
    "rounded-2xl border p-4 transition-all",
    borderColor,
    bgColor,
    onClick ? "cursor-pointer hover:shadow-card-hover hover:-translate-y-px" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (onClick) {
    return (
      <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === "Enter" && onClick()} className={classes}>
        {children}
      </div>
    );
  }

  return <div className={classes}>{children}</div>;
}
