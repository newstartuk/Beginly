"use client";

/**
 * NiaIcon — Beginly's Document Helper mark
 *
 * A chat-bubble form with a 4-point sparkle inside:
 * - Bubble = conversational, approachable assistant
 * - Sparkle = clarity, the "aha" moment
 *
 * Uses currentColor — works on any background.
 */

interface NiaIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function NiaIcon({ size = 24, className, style }: NiaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Nia"
      role="img"
    >
      {/* Chat bubble body */}
      <path
        d="M20 3H4C2.9 3 2 3.9 2 5V16C2 17.1 2.9 18 4 18H7.17L12 22.83L16.83 18H20C21.1 18 22 17.1 22 16V5C22 3.9 21.1 3 20 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 4-point sparkle — intelligence mark */}
      <path
        d="M12 7L13.1 9.9L16 11L13.1 12.1L12 15L10.9 12.1L8 11L10.9 9.9Z"
        fill="currentColor"
      />
    </svg>
  );
}
