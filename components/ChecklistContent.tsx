"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SEED_TASKS } from "@/lib/seed-data";
import { dbProfileToArrivalProfile, generateTasksForProfile } from "@/lib/task-generator";
import { getUserTasks, upsertUserTask } from "@/lib/utils";
import { isClientDemoMode } from "@/lib/platform/runtime";
import type { UserTask } from "@/types";
import ChecklistSkeleton from "./ChecklistSkeleton";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import { ArrowRight, CheckCircle, ChevronDown, ChevronUp, Filter } from "lucide-react";

const STAGE_ORDER = ["PRE", "D1", "D7", "D30", "D90_A", "D90_B", "GROW"];
const STAGE_LABELS: Record<string, string> = {
  PRE: "Pre-Arrival",
  D1: "Arrival Day",
  D7: "First Week",
  D30: "First Month",
  D90_A: "Day 31-60",
  D90_B: "Day 61-90",
  D90: "Days 31-90",
  GROW: "Growth",
};

const STAGE_SUMMARIES: Record<string, string> = {
  PRE: "Prepare your documents, housing, travel and university setup before you fly.",
  D1: "Handle arrival-day essentials so you feel safe, connected and properly checked in.",
  D7: "Set up banking, healthcare, transport and your university routine in the first week.",
  D30: "Stabilise money, admin, work rights and your student systems in the first month.",
  D90_A: "Strengthen your routines and fix weak spots between day 31 and day 60.",
  D90_B: "Use day 61 to day 90 to move from survival into confidence and momentum.",
  GROW: "Keep progressing once your first settlement foundation is in place.",
};

const D90_TASK_IDS = SEED_TASKS.filter((task) => task.stage === "D90").map((task) => task.taskId);

function displayStage(taskId: string): string {
  const seed = SEED_TASKS.find((task) => task.taskId === taskId);
  if (!seed) return "PRE";
  if (seed.stage !== "D90") return seed.stage;
  const index = D90_TASK_IDS.indexOf(taskId);
  return index >= 0 && index < Math.ceil(D90_TASK_IDS.length / 2) ? "D90_A" : "D90_B";
}

export default function ChecklistContent() {
  const router = useRouter();
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "complete">("all");
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set(["PRE", "D1", "D7"]));

  useEffect(() => {
    async function load() {
      if (isClientDemoMode()) {
        const stored = getUserTasks();
        const tasks: UserTask[] = stored.length
          ? stored
          : SEED_TASKS.map((task, index) => ({
              taskId: task.taskId,
              status: index < 8 ? ("complete" as const) : ("not_started" as const),
              completedAt: index < 8 ? new Date().toISOString() : undefined,
            }));
        setTasks(tasks);
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      let { data: taskData } = await supabase
        .from("user_tasks")
        .select("task_id,status,completed_at")
        .eq("user_id", user.id);

      if (!taskData?.length) {
        const { data: profileRow } = await supabase
          .from("arrival_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileRow) {
          const generated = generateTasksForProfile(dbProfileToArrivalProfile(profileRow));
          if (generated.length) {
            await supabase.from("user_tasks").insert(
              generated.map((task) => ({
                user_id: user.id,
                task_id: task.taskId,
                status: task.status,
                completed_at: null,
              })),
            );
            const refreshed = await supabase
              .from("user_tasks")
              .select("task_id,status,completed_at")
              .eq("user_id", user.id);
            taskData = refreshed.data ?? [];
          }
        } else {
          router.push("/onboarding");
          return;
        }
      }

      setTasks(
        (taskData ?? []).map(
          (task): UserTask => ({
            taskId: task.task_id,
            status: task.status as UserTask["status"],
            completedAt: task.completed_at ?? undefined,
          }),
        ),
      );
      setLoading(false);
    }

    load();
  }, [router]);

  const toggle = async (taskId: string) => {
    const existing = tasks.find((task) => task.taskId === taskId);
    const isComplete = existing?.status === "complete";
    const nextStatus: UserTask["status"] = isComplete ? "not_started" : "complete";
    const completedAt = isComplete ? undefined : new Date().toISOString();

    setTasks((prev) =>
      prev.map((task): UserTask => (task.taskId === taskId ? { ...task, status: nextStatus, completedAt } : task)),
    );

    if (isClientDemoMode()) {
      upsertUserTask(taskId, nextStatus);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("user_tasks").upsert(
      {
        user_id: user.id,
        task_id: taskId,
        status: nextStatus,
        completed_at: completedAt ?? null,
      },
      { onConflict: "user_id,task_id" },
    );
  };

  if (loading) return <ChecklistSkeleton />;

  const validTaskIds = new Set(SEED_TASKS.map((task) => task.taskId));
  const visibleTasks = tasks.filter((task) => validTaskIds.has(task.taskId));
  const filteredTasks = visibleTasks.filter((task) => {
    if (filter === "pending") return task.status !== "complete";
    if (filter === "complete") return task.status === "complete";
    return true;
  });

  const tasksByStage = Object.fromEntries(
    STAGE_ORDER.map((stage) => [stage, filteredTasks.filter((task) => displayStage(task.taskId) === stage)]),
  );

  const completedCount = visibleTasks.filter((task) => task.status === "complete").length;
  const totalCount = visibleTasks.length;
  const completionRate = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const quickLinks = [
    { href: "/journey", label: "Journey Hub", detail: "See the wider Beginly view beyond settlement tasks" },
    { href: "/budget", label: "Budget Planner", detail: "Track monthly income, expenses and savings" },
    { href: "/bank", label: "Banking", detail: "Compare student-friendly UK account options" },
    { href: "/document-helper", label: "Doc Helper", detail: "Understand forms and letters in plain English" },
  ];

  const toggleStage = (stage: string) => {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) next.delete(stage);
      else next.add(stage);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <div className="card flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-navy">
            {completedCount} of {totalCount} tasks completed
          </p>
          <p className="mt-1 text-xs text-muted">
            This is your settlement home: all newcomer actions from pre-arrival to day 90 in one place.
          </p>
          <div className="mt-2 w-48 h-2 bg-civic-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "complete"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                filter === value ? "bg-primary text-white" : "bg-civic-50 text-civic-600 hover:bg-civic-100"
              }`}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        <section className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">How to use this</p>
          <h2 className="mt-1 text-base font-semibold text-navy">Task Library is the settlement home.</h2>
          <p className="mt-2 text-sm text-civic-600">
            Work through these phase-based tasks here. Use Journey Hub for the wider Beginly view that connects
            settlement, future opportunities, household context and next-best actions.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/journey" className="btn-primary text-sm">
              Open Journey Hub <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href} className="card border border-border hover:border-primary/30 transition-all">
              <p className="text-sm font-semibold text-navy">{item.label}</p>
              <p className="mt-1 text-xs text-civic-600">{item.detail}</p>
            </Link>
          ))}
        </section>
      </div>

      {allDone && (
        <div className="card bg-green-50 border-green-200 text-center py-8 space-y-3">
          <CheckCircle className="w-10 h-10 text-green mx-auto" />
          <p className="text-lg font-bold text-green">All tasks complete!</p>
          <p className="text-sm text-civic-600">You&apos;ve finished your personalised settlement roadmap. Well done!</p>
        </div>
      )}

      {STAGE_ORDER.map((stage) => {
        const stageTasks = tasksByStage[stage];
        if (!stageTasks.length) return null;
        const stageCompleted = stageTasks.filter((task) => task.status === "complete").length;
        const open = expandedStages.has(stage);

        return (
          <div key={stage} className="card">
            <button onClick={() => toggleStage(stage)} className="w-full flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Badge label={stage} variant="stage" />
                <div className="text-left">
                  <span className="block text-sm font-semibold text-navy">{STAGE_LABELS[stage]}</span>
                  <span className="block text-xs text-muted">{STAGE_SUMMARIES[stage]}</span>
                </div>
                <span className="text-xs text-muted">{stageCompleted}/{stageTasks.length}</span>
              </div>
              {open ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>

            {open && (
              <div className="mt-3 space-y-2">
                {stageTasks.map((userTask) => {
                  const seed = SEED_TASKS.find((task) => task.taskId === userTask.taskId);
                  if (!seed) return null;
                  const done = userTask.status === "complete";

                  return (
                    <div
                      key={userTask.taskId}
                      className={`w-full rounded-xl border p-4 transition-all ${
                        done ? "bg-green-50 border-green-200" : "bg-white border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggle(userTask.taskId)}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            done ? "bg-green border-green" : "border-civic-300"
                          }`}
                          aria-label={done ? `Mark ${seed.title} as not started` : `Mark ${seed.title} as complete`}
                        >
                          {done ? <CheckCircle className="w-3.5 h-3.5 text-white" /> : null}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <Link href={`/tasks/${userTask.taskId}`} className="min-w-0">
                              <p className={`text-sm font-medium ${done ? "text-green line-through opacity-70" : "text-navy"}`}>{seed.title}</p>
                              <p className="mt-1 text-xs text-civic-600">{seed.summary}</p>
                            </Link>
                            <Badge label={seed.priority} variant="priority" />
                          </div>
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <Badge label={seed.category} variant="category" />
                            {seed.conditional ? (
                              <span className="text-[10px] text-muted bg-civic-50 rounded-full px-2 py-0.5">{seed.conditional}</span>
                            ) : null}
                            <Link href={`/tasks/${userTask.taskId}`} className="text-xs font-semibold text-primary hover:underline">
                              Open details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {filteredTasks.length === 0 && !allDone && (
        <EmptyState icon={Filter} message="No tasks here" description="Try a different filter to see your tasks." />
      )}
    </div>
  );
}
