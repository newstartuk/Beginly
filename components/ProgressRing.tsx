"use client";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  className?: string;
}

/**
 * SVG progress ring — the readiness score component.
 * Used on the Dashboard hero.
 */
export default function ProgressRing({
  percentage,
  size = 100,
  strokeWidth = 9,
  color = "var(--color-teal)",
  trackColor = "var(--color-border)",
  label,
  sublabel,
  showPercentage = true,
  className = "",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clampedPct / 100) * circumference;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`} role="img" aria-label={`${clampedPct}% complete`}>
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>

        {/* Centre content */}
        {showPercentage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-extrabold leading-none"
              style={{ fontSize: size * 0.2, color }}
            >
              {Math.round(clampedPct)}%
            </span>
          </div>
        )}
      </div>

      {/* Labels below the ring */}
      {(label || sublabel) && (
        <div className="text-center">
          {label && <p className="text-xs font-semibold text-navy">{label}</p>}
          {sublabel && <p className="text-xs text-muted mt-0.5">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}
