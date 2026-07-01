"use client";

import { useState, useEffect, useMemo } from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { calculateReadinessScore } from "@/lib/readiness-score";
import { SEED_TASKS } from "@/lib/seed-data";
import { calculateStage, getStageLabel } from "@/lib/stage-calculator";
import ProgressRing from "@/components/ProgressRing";
import Badge from "@/components/Badge";
import { flags } from "@/lib/feature-flags";
import {
  Map,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  Heart,
  Shield,
  CheckCircle2,
  Clock,
  Plane,
} from "lucide-react";

const PHASE_LABELS: Record<string, string> = {
  pre: "Before you leave",
  week1: "Your first week",
  settling: "Settling in",
  building: "Building your life",
};

const PHASE_KEYS = ["pre", "week1", "settling", "building"] as const;
type PhaseKey = typeof PHASE_KEYS[number];

function getUserPhase(stage: string): PhaseKey {
  if (stage === "PRE") return "pre";
  if (stage === "D1" || stage === "D7") return "week1";
  if (stage === "D30") return "settling";
  return "building";
}

function getPhaseProgress(
  phaseKey: PhaseKey,
  tasks: typeof SEED_TASKS,
  completedTaskIds: Set<string>
): { completed: number; total: number; pct: number } {
  const stageMap: Record<PhaseKey, string[]> = {
    pre: ["PRE"],
    week1: ["D1", "D7"],
    settling: ["D30"],
    building: ["D90", "GROW"],
  };
  const stages = stageMap[phaseKey];
  const phaseTasks = tasks.filter((t) => t.active && stages.includes(t.stage));
  const completed = phaseTasks.filter((t) => completedTaskIds.has(t.taskId)).length;
  const total = phaseTasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, pct };
}

const MILESTONES = [
  {
    id: "uni-confirm",
    title: "Confirm university enrolment",
    icon: Star,
    stage: "PRE",
    description: "Accept your offer and get your CAS number",
  },
  {
    id: "accommodation",
    title: "Secure accommodation",
    icon: Shield,
    description: "Have a confirmed place to stay on arrival",
    stage: "PRE",
  },
  {
    id: "bank-account",
    title: "Open a UK bank account",
    icon: TrendingUp,
    description: "Set up your student account",
    stage: "D30",
  },
  {
    id: "gp-registration",
    title: "Register with a GP",
    icon: Heart,
    description: "Get NHS access before you need it",
    stage: "D7",
  },
  {
    id: "uk-phone",
    title: "Set up a UK phone number",
    icon: Clock,
    description: "Essential for banking and verification",
    stage: "D1",
  },
];

const INSIGHTS: Record<string, string> = {
  PRE: "Every great journey starts with a single step. Confirm your enrolment today and you'll arrive with confidence.",
  D1: "You made it! Your only job today is to arrive safely and rest. Everything else can wait until tomorrow.",
  D7: "You're building the foundations. One task at a time — focus on your bank account, GP, and student ID this week.",
  D30: "You should be feeling more settled by now. Focus on work rights, council tax, and building your UK routine.",
  D90: "Ninety days in — you're no longer a newcomer. Review what's left, celebrate your progress, and plan your next chapter.",
  GROW: "You've built a life here. Keep the momentum going, build your network, and remember why you started.",
};

export default function JourneyPage() {
  const { user, profile, tasks, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<PhaseKey | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

  useEffect(() => { setMounted(true); }, []);

  const completedTaskIds = useMemo(
    () => new Set(tasks.filter((t) => t.status === "complete").map((t) => t.taskId)),
    [tasks]
  );

  const score = useMemo(
    () => calculateReadinessScore(SEED_TASKS, tasks),
    [tasks]
  );

  const stage = useMemo(
    () => profile?.arrival_date ? calculateStage(profile.arrival_date) : "PRE",
    [profile]
  );

  const phaseKey = getUserPhase(stage);

  const daysLabel = useMemo(() => {
    if (!profile?.arrival_date) return null;
    const arrival = new Date(profile.arrival_date);
    const today = new Date();
    const diffMs = today.getTime() - arrival.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: `arrives in ${Math.abs(diffDays)} days`, isFuture: true };
    if (diffDays === 0) return { label: "arrived today!", isFuture: false };
    return { label: `${diffDays} days in the UK`, isFuture: false };
  }, [profile?.arrival_date]);

  useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem("beginly_badges");
    if (saved) {
      try { setEarnedBadges(JSON.parse(saved)); } catch { /* ignore */ }
    } else {
      // Derive badges from completed tasks
      const badges: string[] = [];
      if (completedTaskIds.size >= 5) badges.push("Settler");
      if (completedTaskIds.has("STU_D30_001")) badges.push("Banker");
      if (completedTaskIds.has("STU_D7_003")) badges.push("NHS Patient");
      if (completedTaskIds.has("STU_D1_001")) badges.push("First Step");
      if (completedTaskIds.has("STU_D90_006")) badges.push("Ninety Dayer");
      setEarnedBadges(badges);
      localStorage.setItem("beginly_badges", JSON.stringify(badges));
    }
  }, [mounted, completedTaskIds]);

  const phases: { key: PhaseKey; label: string; icon: React.ElementType }[] = [
    { key: "pre", label: PHASE_LABELS.pre, icon: Plane },
    { key: "week1", label: PHASE_LABELS.week1, icon: Clock },
    { key: "settling", label: PHASE_LABELS.settling, icon: Map },
    { key: "building", label: PHASE_LABELS.building, icon: TrendingUp },
  ];

  const phaseKeyToStages: Record<PhaseKey, string[]> = {
    pre: ["PRE"],
    week1: ["D1", "D7"],
    settling: ["D30"],
    building: ["D90", "GROW"],
  };

  function exportCalendar() {
    const datedTasks = SEED_TASKS.filter((t) => {
      if (!profile?.arrival_date || !completedTaskIds.has(t.taskId)) return false;
      const arrival = new Date(profile.arrival_date);
      let daysOffset = 0;
      if (t.stage === "D1") daysOffset = 0;
      else if (t.stage === "D7") daysOffset = 7;
      else if (t.stage === "D30") daysOffset = 30;
      else if (t.stage === "D90") daysOffset = 90;
      if (daysOffset === 0) return false;
      const eventDate = new Date(arrival);
      eventDate.setDate(eventDate.getDate() + daysOffset);
      return true;
    });

    let ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Beginly//Journey//EN\r\n";
    if (profile?.arrival_date) {
      const arrival = new Date(profile.arrival_date);
      const arrivalStr = arrival.toISOString().replace(/[-:]/g, "").split("T")[0];
      ics += `BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:${arrivalStr.replace(/-/g, "")}\r\nSUMMARY:Arrival Day\r\nDESCRIPTION:You arrived in the UK! Welcome.\r\nEND:VEVENT\r\n`;
      datedTasks.forEach((t) => {
        let daysOffset = t.stage === "D1" ? 0 : t.stage === "D7" ? 7 : t.stage === "D30" ? 30 : 90;
        const d = new Date(arrival);
        d.setDate(d.getDate() + daysOffset);
        const dtStr = d.toISOString().replace(/[-:]/g, "").split("T")[0].replace(/-/g, "");
        ics += `BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:${dtStr}\r\nSUMMARY:${t.title}\r\nDESCRIPTION:${t.summary}\r\nEND:VEVENT\r\n`;
      });
    }
    ics += "END:VCALENDAR\r\n";

    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "beginly-journey.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading || !mounted) {
    return (
      <Navigation>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-civic-100 rounded-2xl" />
          <div className="h-48 bg-civic-100 rounded-2xl" />
          <div className="h-24 bg-civic-100 rounded-2xl" />
        </div>
      </Navigation>
    );
  }

  if (!flags.ENABLE_JOURNEY) {
    return (
      <Navigation>
        <div className="card text-center py-12">
          <Map className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-navy mb-2">Journey not enabled</h2>
          <p className="text-sm text-muted">Check back soon — this feature is coming soon.</p>
        </div>
      </Navigation>
    );
  }

  const userName = user?.name ?? profile?.city ?? "Explorer";

  return (
    <Navigation>
      <div className="space-y-8 animate-fade-in">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="card bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Your Journey</p>
              <h1 className="text-2xl font-extrabold text-navy mb-1">
                Welcome, {userName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge label={getStageLabel(stage)} variant="stage" />
                {daysLabel && (
                  <span className="text-xs text-muted">
                    {daysLabel.isFuture ? (
                      <span className="flex items-center gap-1"><Plane className="w-3 h-3" /> {daysLabel.label}</span>
                    ) : (
                      <span className="flex items-center gap-1"><Map className="w-3 h-3" /> {daysLabel.label}</span>
                    )}
                  </span>
                )}
              </div>
            </div>
            <ProgressRing
              percentage={score.totalScore}
              size={100}
              strokeWidth={9}
              label="Settlement Score"
            />
          </div>

          {/* Insight */}
          <div className="mt-4 bg-white/60 rounded-xl px-4 py-3 border border-teal-100">
            <p className="text-sm text-navy italic">
              💡 <span className="not-italic font-medium">{INSIGHTS[stage]}</span>
            </p>
          </div>
        </div>

        {/* ── 90-Day Timeline ─────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" />
              Your 90-Day Roadmap
            </h2>
            <button
              onClick={exportCalendar}
              className="btn-ghost flex items-center gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export Calendar
            </button>
          </div>

          {/* Phase progress row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {phases.map((phase) => {
              const prog = getPhaseProgress(phase.key, SEED_TASKS, completedTaskIds);
              const isActive = phase.key === phaseKey;
              const PhaseIcon = phase.icon;
              return (
                <button
                  key={phase.key}
                  onClick={() => setExpandedPhase(expandedPhase === phase.key ? null : phase.key)}
                  className={`card text-left transition-all hover:shadow-card ${isActive ? "border-teal-300 ring-1 ring-teal-200" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? "bg-teal-100" : "bg-civic-100"}`}>
                      <PhaseIcon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted"}`} />
                    </div>
                    {isActive && <span className="text-xs bg-teal-100 text-primary px-1.5 py-0.5 rounded-full font-semibold">Active</span>}
                  </div>
                  <p className="text-xs font-semibold text-navy leading-tight">{phase.label}</p>
                  <p className="text-xs text-muted mt-0.5">{prog.completed}/{prog.total} tasks</p>
                  <div className="mt-2 h-1.5 bg-civic-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal rounded-full transition-all duration-500"
                      style={{ width: `${prog.pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Expanded phase detail */}
          {expandedPhase && (
            <div className="card border-teal-200 bg-teal-50/30 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-navy">{PHASE_LABELS[expandedPhase]}</h3>
                <button onClick={() => setExpandedPhase(null)} className="text-muted hover:text-navy">
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {SEED_TASKS.filter(
                  (t) => t.active && phaseKeyToStages[expandedPhase].includes(t.stage)
                ).map((t) => {
                  const done = completedTaskIds.has(t.taskId);
                  return (
                    <div key={t.taskId} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-civic-100">
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-civic-200 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium leading-tight ${done ? "text-muted line-through" : "text-navy"}`}>
                          {t.title}
                        </p>
                      </div>
                      <Badge label={t.category} variant="category" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ── Milestones ─────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Key Milestones
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MILESTONES.map((m) => {
              const milestoneTask = SEED_TASKS.find((t) => t.taskId.startsWith(m.id.replace("-", "_").toUpperCase().slice(0, 8)));
              // Match by title keyword
              const matchedTask = SEED_TASKS.find((t) =>
                t.title.toLowerCase().includes(m.title.toLowerCase().split(" ")[0])
              );
              const done = matchedTask ? completedTaskIds.has(matchedTask.taskId) : false;
              const Icon = m.icon;
              return (
                <div key={m.id} className="card border border-civic-100 hover:border-teal-200 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${done ? "bg-green-light" : "bg-civic-100"}`}>
                      <Icon className={`w-4 h-4 ${done ? "text-green-600" : "text-muted"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy leading-tight">{m.title}</p>
                      <p className="text-xs text-muted mt-0.5">{m.description}</p>
                      {done && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">Done</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Badges ──────────────────────────────────────────── */}
        {earnedBadges.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet" />
              Your Badges
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {earnedBadges.map((badge) => (
                <div key={badge} className="card border-violet-100 bg-violet-50/50 text-center">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-2">
                    <Star className="w-5 h-5 text-violet" />
                  </div>
                  <p className="text-xs font-bold text-navy">{badge}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Settlement Score Breakdown ──────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-navy mb-4">Settlement Score Breakdown</h2>
          <div className="card space-y-3">
            {score.categoryBreakdown.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-navy">{cat.category}</span>
                    <span className="text-xs text-muted">{cat.completed}/{cat.total}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary">{Math.round(cat.percentage)}%</span>
                </div>
                <div className="h-2 bg-civic-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </Navigation>
  );
}
