"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { calculateReadinessScore } from "@/lib/readiness-score";
import { calculateStage, getStageLabel } from "@/lib/stage-calculator";
import { SEED_TASKS } from "@/lib/seed-data";
import { getAllScamAlerts } from "@/lib/scam-alerts";
import type { UserTask } from "@/types";
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BookOpen,
  Bot,
  Zap,
  Shield,
  CheckSquare,
} from "lucide-react";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import ProgressRing from "@/components/ProgressRing";
import StageTracker from "@/components/StageTracker";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";

export default function DashboardPage() {
  const { user, profile, tasks, loading } = useAuth();
  const [scamAlertIndex, setScamAlertIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setScamAlertIndex((i: number) => (i + 1) % getAllScamAlerts().length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || loading) return <DashboardSkeleton />;
  if (!user) return null;

  const stage = calculateStage(profile?.arrival_date as string | undefined);
  const score = calculateReadinessScore(SEED_TASKS, tasks as UserTask[]);
  const highPriority = SEED_TASKS.filter(
    (t) =>
      t.priority === "Very High" &&
      t.active &&
      !tasks.find((ut) => ut.taskId === t.taskId && ut.status === "complete")
  ).slice(0, 3);
  const completedCount = tasks.filter((ut) => ut.status === "complete").length;
  const totalTasks = SEED_TASKS.length;
  const scamAlerts = getAllScamAlerts();
  const currentAlert = scamAlerts[scamAlertIndex];

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Score colour
  const scoreColor = score.totalScore >= 80
    ? "#1A9E4A"
    : score.totalScore >= 40
    ? "#D97706"
    : "#DC2626";

  const scoreBg = score.totalScore >= 80
    ? "#E8F9EC"
    : score.totalScore >= 40
    ? "#FFF8ED"
    : "#FFF0F0";

  return (
    <Navigation>
      <div className="space-y-6 animate-fade-up">

        {/* ── Welcome hero ─────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
              {today}
            </p>
            <h1 className="text-2xl font-extrabold mt-0.5" style={{ color: "var(--color-navy)" }}>
              Hello, {user.name?.split(" ")[0] ?? "?"} 👋
            </h1>
            {!profile && (
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-1 text-xs mt-2 font-medium"
                style={{ color: "var(--color-teal)" }}
              >
                <Zap className="w-3.5 h-3.5" />
                Complete your profile → get your personalised roadmap
              </Link>
            )}
          </div>

          {/* Mini stats row */}
          <div className="flex gap-3 flex-wrap">
            {[
              {
                icon: CheckSquare,
                value: completedCount,
                label: "Completed",
                color: "var(--color-green)",
                bg: "var(--color-green-light)",
              },
              {
                icon: Clock,
                value: totalTasks - completedCount,
                label: "Remaining",
                color: "var(--color-amber)",
                bg: "var(--color-amber-light)",
              },
              {
                icon: TrendingUp,
                value: `${score.totalScore}%`,
                label: "Readiness",
                color: scoreColor,
                bg: scoreBg,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: stat.bg, border: `1px solid ${stat.color}30` }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main hero card: Score + Stage + Journey ─────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #102A43 0%, #1A3A5C 60%, #0B7285 100%)",
            boxShadow: "0 8px 32px rgba(16,42,67,0.2)",
          }}
        >
          <div className="p-6 sm:p-8">
            <div className="grid sm:grid-cols-2 gap-8 items-center">

              {/* Readiness ring */}
              <div className="flex items-center gap-6">
                <ProgressRing
                  percentage={score.totalScore}
                  size={120}
                  strokeWidth={10}
                  color="#5EEAD4"
                  trackColor="rgba(255,255,255,0.15)"
                  label="UK Readiness"
                  sublabel={`${score.completedTasks}/${score.totalRequiredTasks} required`}
                  className="shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Your UK Readiness Score</p>
                  <p className="text-xs text-teal-200">
                    {score.totalScore < 30
                      ? "Just getting started — keep going!"
                      : score.totalScore < 60
                      ? "Making good progress — you're on track."
                      : score.totalScore < 90
                      ? "Nearly there — just a few more tasks."
                      : "You're ready. Well done!"}
                  </p>
                  <Link
                    href="/checklist"
                    className="inline-flex items-center gap-1 text-xs mt-3 font-medium text-teal-200 hover:text-white transition-colors"
                  >
                    View full checklist <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Stage + location */}
              <div className="flex items-center gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "2px solid rgba(94,234,212,0.4)",
                  }}
                >
                  <span className="text-2xl font-extrabold text-white">{stage}</span>
                </div>
                <div>
                  <p className="text-xs text-teal-200 mb-0.5">Current stage</p>
                  <p className="text-base font-bold text-white">{getStageLabel(stage)}</p>
                  <p className="text-xs text-teal-200 mt-0.5">
                    {(profile?.city as string) ? `${profile?.city ?? ""}` : ""}
                    {profile?.city && profile?.university ? " · " : ""}
                    {(profile?.university as string) ? `${(profile?.university as string)?.split(" ")[0]} University` : "No university set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stage tracker */}
            <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-xs font-medium text-teal-200 mb-3">Your settlement journey</p>
              <StageTracker currentStage={stage as Parameters<typeof StageTracker>[0]["currentStage"]} />
            </div>
          </div>
        </div>

        {/* ── Category progress ─────────────────────────────── */}
        {score.categoryBreakdown.filter((c) => c.total > 0).length > 0 && (
          <div className="card">
            <h2 className="section-title">
              <TrendingUp className="w-4 h-4" style={{ color: "var(--color-teal)" }} />
              Progress by category
            </h2>
            <div className="space-y-4">
              {score.categoryBreakdown
                .filter((c) => c.total > 0)
                .map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-navy">{cat.category}</span>
                      <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                        {cat.completed}/{cat.total}
                      </span>
                    </div>
                    <div
                      className="progress-track"
                      role="progressbar"
                      aria-label={`${cat.category}: ${cat.completed} of ${cat.total}`}
                    >
                      <div
                        className={[
                          "progress-fill",
                          cat.percentage >= 80
                            ? "progress-fill-success"
                            : cat.percentage >= 40
                            ? ""
                            : "progress-fill-warning",
                        ].join(" ")}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── Urgent priorities ──────────────────────────────── */}
        {highPriority.length > 0 && (
          <div className="card">
            <h2 className="section-title">
              <Clock className="w-4 h-4" style={{ color: "var(--color-amber)" }} />
              Top priorities right now
            </h2>
            <div className="space-y-2">
              {highPriority.map((t) => (
                <Link
                  key={t.taskId}
                  href={`/tasks/${t.taskId}`}
                  className="flex items-center justify-between p-4 rounded-xl transition-all group"
                  style={{
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                  }}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--color-red-light)" }}
                    >
                      <AlertTriangle className="w-4 h-4" style={{ color: "var(--color-red)" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge label={t.stage} variant="stage" />
                        <Badge label={t.category} variant="category" />
                      </div>
                    </div>
                  </div>
                  <ArrowRight
                    className="w-4 h-4 shrink-0 transition-colors"
                    style={{ color: "var(--color-muted)" }}
                  />
                </Link>
              ))}
            </div>
            <Link
              href="/checklist"
              className="inline-flex items-center gap-1 text-xs mt-4 font-medium"
              style={{ color: "var(--color-teal)" }}
            >
              View full checklist <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* ── Scam alert ───────────────────────────────────── */}
        {currentAlert && (
          <Alert
            variant={currentAlert.severity === "high" ? "danger" : "warning"}
            title={`Scam Alert — ${currentAlert.title}`}
            className="card"
          >
            <p className="mt-1">{currentAlert.body}</p>
            <Link href="/guides" className="inline-flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: "inherit" }}>
              Read full scam guides <ArrowRight className="w-3 h-3" />
            </Link>
          </Alert>
        )}

        {/* ── Quick actions ─────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-muted)" }}>
            Quick actions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
            {[
              {
                href: "/checklist",
                label: "My Checklist",
                icon: CheckSquare,
                sub: `${completedCount} tasks`,
                color: "var(--color-teal)",
                bg: "var(--color-teal-50)",
              },
              {
                href: "/guides",
                label: "Guidance",
                icon: BookOpen,
                sub: "20+ articles",
                color: "var(--color-violet)",
                bg: "var(--color-violet-light)",
              },
              {
                href: "/document-helper",
                label: "Doc Helper",
                icon: Bot,
                sub: "Ask Nia",
                color: "#2563EB",
                bg: "var(--color-blue-light)",
              },
              {
                href: "/emergency",
                label: "Emergency",
                icon: Shield,
                sub: "Key contacts",
                color: "var(--color-red)",
                bg: "var(--color-red-light)",
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="feature-card text-center py-5"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: action.bg }}
                >
                  <action.icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <p className="text-sm font-bold text-navy">{action.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{action.sub}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </Navigation>
  );
}
