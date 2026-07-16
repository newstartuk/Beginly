import type { ReactNode } from "react";
export default function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "positive" | "warning" | "info" | "sponsored" }) {
  return <span className={`platform-pill ${tone}`}>{children}</span>;
}
