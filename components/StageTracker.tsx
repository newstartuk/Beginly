"use client";

/* ─── Journey stage definitions ──────────────────────────────── */
export type Stage = "PRE" | "D1" | "D7" | "D30" | "D90" | "GROW";

interface StageDef {
  id: Stage;
  label: string;
  sublabel: string;
  color: string;
  bg: string;
}

const STAGES: StageDef[] = [
  { id: "PRE",  label: "Pre-Arrival",   sublabel: "Before you travel",  color: "#2563EB", bg: "#EFF6FF" },
  { id: "D1",   label: "Arrival Day",   sublabel: "Day 1",            color: "#0B7285", bg: "#F0FAFC" },
  { id: "D7",   label: "First Week",    sublabel: "Days 1–7",         color: "#0D9488", bg: "#F0FDFA" },
  { id: "D30",  label: "First Month",   sublabel: "Days 1–30",        color: "#D97706", bg: "#FFFBEB" },
  { id: "D90",  label: "Days 31–90",   sublabel: "Keep going",       color: "#EA580C", bg: "#FFF7ED" },
  { id: "GROW", label: "Growth",        sublabel: "Beyond 90 days",   color: "#16A34A", bg: "#F0FDF4" },
];

function stageIndex(stage: Stage): number {
  return STAGES.findIndex((s) => s.id === stage);
}

function isStageComplete(targetIdx: number, currentStage: Stage): boolean {
  return stageIndex(currentStage) > targetIdx;
}

function isStageActive(targetIdx: number, currentStage: Stage): boolean {
  return stageIndex(currentStage) === targetIdx;
}

interface StageTrackerProps {
  /** The user's calculated current stage */
  currentStage: Stage;
  /** Optional: show milestone labels above each node */
  showLabels?: boolean;
  /** Optional extra class */
  className?: string;
}

/**
 * Horizontal journey progress tracker shown on the Dashboard hero.
 * Shows the 6 journey stages with the current one highlighted.
 */
export default function StageTracker({
  currentStage,
  showLabels = true,
  className = "",
}: StageTrackerProps) {
  const currentIdx = stageIndex(currentStage);

  return (
    <div className={`${className}`}>
      {/* Stage labels row */}
      {showLabels && (
        <div className="flex justify-between mb-2 px-0.5">
          {STAGES.map((s, idx) => {
            const done  = isStageComplete(idx, currentStage);
            const active = isStageActive(idx, currentStage);
            return (
              <div
                key={s.id}
                className={`flex flex-col items-center text-center ${
                  done || active ? "" : "opacity-40"
                }`}
                style={{ maxWidth: `${100 / STAGES.length}%` }}
              >
                <span
                  className="text-xs font-semibold leading-tight"
                  style={{ color: active ? s.color : "var(--color-muted)" }}
                >
                  {s.label}
                </span>
                <span className="text-xs text-muted leading-tight mt-0.5 hidden sm:block">
                  {s.sublabel}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress line + dots */}
      <div className="relative flex items-center">
        {/* Track background */}
        <div className="flex-1 h-1 bg-civic-100 rounded-full" />

        {/* Completed fill */}
        <div
          className="absolute left-0 h-1 rounded-full transition-all duration-700"
          style={{
            width: `${(currentIdx / (STAGES.length - 1)) * 100}%`,
            backgroundColor: STAGES[currentIdx]?.color ?? "var(--color-teal)",
          }}
        />

        {/* Stage dots */}
        {STAGES.map((s, idx) => {
          const done   = isStageComplete(idx, currentStage);
          const active = isStageActive(idx, currentStage);
          return (
            <div
              key={s.id}
              className={[
                "absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm",
                "transition-all duration-300",
                active ? "scale-125" : done ? "scale-100" : "scale-90",
              ].join(" ")}
              style={{
                left: `calc(${(idx / (STAGES.length - 1)) * 100}% - 7px)`,
                backgroundColor: active || done ? s.color : "var(--color-civic-200)",
                boxShadow: active ? `0 0 0 3px ${s.color}33` : undefined,
              }}
              title={`${s.label}${active ? " (current)" : done ? " (complete)" : ""}`}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─── Export helpers for other components ────────────────────── */
export { STAGES, stageIndex };
