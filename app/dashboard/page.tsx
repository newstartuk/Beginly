"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useRouter } from "next/navigation";
import { getUser, getArrivalProfile, getUserTasks } from "@/lib/utils";
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
  Shield,
  BookOpen,
  CheckSquare,
} from "lucide-react";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import ProgressRing from "@/components/ProgressRing";
import StageTracker from "@/components/StageTracker";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [profile, setProfile] = useState<ReturnType<typeof getArrivalProfile>>(null);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [scamAlertIndex, setScamAlertIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    const p = getArrivalProfile();
    if (!u) { router.push("/signup"); return; }
    setUser(u);
    setProfile(p);
    setUserTasks(getUserTasks());
    const interval = setInterval(() => {
      setScamAlertIndex((i) => (i + 1) % getAllScamAlerts().length);
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  if (!mounted) return <DashboardSkeleton />;
  if (!user) return null;

  const stage = calculateStage(profile?.arrivalDate);
  const score = calculateReadinessScore(SEED_TASKS, userTasks);
  const highPriority = SEED_TASKS.filter(
    (t) =>
      t.priority === "Very High" &&
      t.active &&
      !userTasks.find((ut) => ut.taskId === t.taskId && ut.status === "complete")
  ).slice(0, 3);
  const completedCount = userTasks.filter((ut) => ut.status === "complete").length;
  const scamAlerts = getAllScamAlerts();
  const currentAlert = scamAlerts[scamAlertIndex];

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Navigation>
      <div className="space-y-8 animate-fade-up">

        {/* ── Welcome header ─────────────────────────────────── */}
        <div>
          <p className="text-xs text-muted uppercase tracking-wide font-medium">{today}</p>
          <h1 className="text-2xl font-bold text-navy mt-1">
            Hello, {user.name.split(" ")[0]} 👋
          </h1>
          {!profile?.profileCompleted && (
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 text-xs text-teal hover:underline mt-2"
            >
              Complete your profile → get your personalised roadmap
            </Link>
          )}
        </div>

        {/* ── Hero: Score + Stage ──────────────────────────── */}
        <div className="card animate-scale-in">
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            {/* Readiness ring */}
            <div className="flex items-center gap-5">
              <ProgressRing
                percentage={score.totalScore}
                size={110}
                strokeWidth={10}
                label="UK Readiness Score"
                sublabel={`${score.completedTasks} of ${score.totalRequiredTasks} required tasks`}
                className="shrink-0"
              />
              <div>
                <p className="text-xs text-muted font-medium mb-0.5">UK Readiness Score</p>
                <p className="text-sm font-semibold text-navy">
                  {score.completedTasks}/{score.totalRequiredTasks} required tasks
                </p>
                <p className="text-xs text-muted mt-0.5">
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
                  className="inline-flex items-center gap-1 text-xs text-teal hover:underline mt-3"
                >
                  View checklist <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Stage */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0"
                style={{
                  backgroundColor: "var(--color-teal-50)",
                  border: "2px solid var(--color-teal)",
                }}
              >
                <span
                  className="text-xl font-bold"
                  style={{ color: "var(--color-teal)" }}
                >
                  {stage}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted font-medium mb-0.5">Current stage</p>
                <p className="text-base font-bold text-navy">{getStageLabel(stage)}</p>
                <p className="text-xs text-muted mt-0.5">
                  {profile?.city ? `${profile.city} · ` : ""}
                  {profile?.university ? `${profile.university.split(" ")[0]} University` : "No university set"}
                </p>
              </div>
            </div>
          </div>

          {/* Stage tracker bar */}
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs text-muted font-medium mb-3">Your settlement journey</p>
            <StageTracker currentStage={stage as Parameters<typeof StageTracker>[0]["currentStage"]} />
          </div>
        </div>

        {/* ── Category progress ─────────────────────────────── */}
        {score.categoryBreakdown.filter((c) => c.total > 0).length > 0 && (
          <div className="card animate-fade-up">
            <h2 className="section-title">
              <TrendingUp className="w-4 h-4 text-teal" aria-hidden="true" />
              Progress by category
            </h2>
            <div className="space-y-4">
              {score.categoryBreakdown
                .filter((c) => c.total > 0)
                .map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-navy">{cat.category}</span>
                      <span className="text-xs text-muted">
                        {cat.completed}/{cat.total}
                      </span>
                    </div>
                    <div
                      className="progress-track"
                      role="progressbar"
                      aria-valuenow={cat.percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${cat.category}: ${cat.completed} of ${cat.total} tasks`}
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
          <div className="card animate-fade-up">
            <h2 className="section-title">
              <Clock className="w-4 h-4 text-amber" aria-hidden="true" />
              Top priorities right now
            </h2>
            <div className="space-y-2">
              {highPriority.map((t) => (
                <Link
                  key={t.taskId}
                  href={`/tasks/${t.taskId}`}
                  className="flex items-center justify-between p-3.5 rounded-xl hover:bg-civic-50 transition-colors group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-red-light flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-red" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge label={t.stage} variant="stage" />
                        <Badge label={t.category} variant="category" />
                        {t.riskWarning && (
                          <span className="text-xs text-amber flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" /> Risk
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ArrowRight
                    className="w-4 h-4 text-muted shrink-0 group-hover:text-teal transition-colors"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
            <Link
              href="/checklist"
              className="inline-flex items-center gap-1 text-xs text-teal hover:underline mt-4"
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
            <Link
              href="/guides"
              className="inline-flex items-center gap-1 mt-3 text-xs font-semibold hover:underline"
            >
              Read full scam guides <ArrowRight className="w-3 h-3" />
            </Link>
          </Alert>
        )}

        {/* ── Quick actions ─────────────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-3 stagger-children">
          {[
            {
              href: "/checklist",
              label: "My Checklist",
              icon: CheckSquare,
              sub: `${completedCount} tasks done`,
              variant: "card-hover",
            },
            {
              href: "/guides",
              label: "Guidance Library",
              icon: BookOpen,
              sub: "20+ articles",
              variant: "card-hover",
            },
            {
              href: "/document-helper",
              label: "Document Helper",
              icon: Shield,
              sub: "Nia explains",
              variant: "card-hover",
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`card-${action.variant === "card-hover" ? "hover" : ""} text-center py-5`}
            >
              <action.icon className="w-5 h-5 text-teal mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm font-semibold text-navy">{action.label}</p>
              <p className="text-xs text-muted mt-0.5">{action.sub}</p>
            </Link>
          ))}
        </div>

      </div>
    </Navigation>
  );
}
