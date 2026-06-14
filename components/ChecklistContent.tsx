"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SEED_TASKS } from "@/lib/seed-data";
import type { UserTask } from "@/types";
import ChecklistSkeleton from "./ChecklistSkeleton";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import { CheckCircle, ChevronDown, ChevronUp, Filter } from "lucide-react";

const STAGE_ORDER = ["PRE", "D1", "D7", "D30", "D90", "GROW"];
const STAGE_LABELS: Record<string, string> = {
  PRE: "Pre-Arrival",
  D1: "Arrival Day",
  D7: "First Week",
  D30: "First Month",
  D90: "Days 31–90",
  GROW: "Growth",
};

export default function ChecklistContent() {
  const router = useRouter();
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "complete">("all");
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set(["PRE", "D1"]));

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: taskData } = await supabase
        .from("user_tasks")
        .select("*")
        .eq("user_id", user.id);

      setTasks(
        (taskData ?? []).map((t): UserTask => ({
          taskId: t.task_id,
          status: t.status as UserTask["status"],
          completedAt: t.completed_at ?? undefined,
        }))
      );
      setLoading(false);
    }
    load();
  }, [router]);

  const toggle = async (taskId: string) => {
    const existing = tasks.find((t) => t.taskId === taskId);
    const isComplete = existing?.status === "complete";

    // Optimistic update
    setTasks((prev) =>
      prev.map((t): UserTask =>
        t.taskId === taskId
          ? {
              ...t,
              status: (isComplete ? "not_started" : "complete") as UserTask["status"],
              completedAt: isComplete ? undefined : new Date().toISOString(),
            }
          : t
      )
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isComplete) {
      await supabase
        .from("user_tasks")
        .update({ status: "not_started", completed_at: null })
        .eq("user_id", user.id)
        .eq("task_id", taskId);
    } else {
      await supabase
        .from("user_tasks")
        .upsert({
          user_id: user.id,
          task_id: taskId,
          status: "complete",
          completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,task_id" });
    }
  };

  if (loading) return <ChecklistSkeleton />;

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return t.status !== "complete";
    if (filter === "complete") return t.status === "complete";
    return true;
  });

  const tasksByStage = Object.fromEntries(
    STAGE_ORDER.map((s) => [s, filteredTasks.filter((t) => SEED_TASKS.find((st) => st.taskId === t.taskId && st.stage === s))])
  );

  const completedCount = tasks.filter((t) => t.status === "complete").length;
  const totalCount = SEED_TASKS.length;
  const allDone = completedCount === totalCount;

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

      {/* ── Summary bar ─────────────────────────────────── */}
      <div className="card flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-navy">
            {completedCount} of {totalCount} tasks completed
          </p>
          <div className="mt-2 w-48 h-2 bg-civic-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "complete"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                filter === f ? "bg-primary text-white" : "bg-civic-50 text-civic-600 hover:bg-civic-100"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {allDone && (
        <div className="card bg-green-50 border-green-200 text-center py-8 space-y-3">
          <CheckCircle className="w-10 h-10 text-green mx-auto" />
          <p className="text-lg font-bold text-green">All tasks complete!</p>
          <p className="text-sm text-civic-600">You&apos;ve finished your 90-day settlement roadmap. Well done!</p>
        </div>
      )}

      {/* ── Task list by stage ────────────────────────────── */}
      {STAGE_ORDER.map((stage) => {
        const stageTasks = tasksByStage[stage];
        if (!stageTasks.length) return null;
        const stageCompleted = stageTasks.filter((t) => t.status === "complete").length;
        const open = expandedStages.has(stage);

        return (
          <div key={stage} className="card">
            <button
              onClick={() => toggleStage(stage)}
              className="w-full flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <Badge label={stage} variant="stage" />
                <span className="text-sm font-semibold text-navy">{STAGE_LABELS[stage]}</span>
                <span className="text-xs text-muted">{stageCompleted}/{stageTasks.length}</span>
              </div>
              {open ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>

            {open && (
              <div className="mt-3 space-y-2">
                {stageTasks.map((ut) => {
                  const seed = SEED_TASKS.find((s) => s.taskId === ut.taskId);
                  if (!seed) return null;
                  const done = ut.status === "complete";

                  return (
                    <button
                      key={ut.taskId}
                      onClick={() => toggle(ut.taskId)}
                      className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                        done
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-border hover:border-primary/30"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        done ? "bg-green border-green" : "border-civic-300"
                      }`}>
                        {done && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${done ? "text-green line-through opacity-70" : "text-navy"}`}>
                          {seed.title}
                        </p>
                        {seed.category && (
                          <div className="mt-1">
                            <Badge label={seed.category} variant="category" />
                          </div>
                        )}
                      </div>
                      <Badge label={seed.priority} variant="priority" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {filteredTasks.length === 0 && !allDone && (
        <EmptyState
          icon={Filter}
          message="No tasks here"
          description="Try a different filter to see your tasks."
        />
      )}
    </div>
  );
}
