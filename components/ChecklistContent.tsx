"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

// Task progress lives in Supabase (public.user_tasks), read/written through
// /api/tasks rather than directly from the browser. This app's custom auth
// token isn't a Supabase Auth session, so the row-level security on
// user_tasks (which checks auth.uid()) would silently reject a direct
// browser call to supabase.from("user_tasks").
function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("custom_auth_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ChecklistContent() {
  const router = useRouter();
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "complete">("all");
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set(["PRE", "D1"]));
  const [toggleError, setToggleError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      const token = localStorage.getItem("custom_auth_token");
      if (!token) { router.push("/login"); return; }

      try {
        const res = await fetch("/api/tasks", { headers: authHeaders() });
        if (res.status === 401) { router.push("/login"); return; }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load checklist.");
        if (!active) return;

        if (!data.hasProfile) { router.push("/onboarding"); return; }

        setTasks(
          (data.tasks ?? []).map(
            (t: { taskId: string; status: UserTask["status"]; completedAt?: string }): UserTask => ({
              taskId: t.taskId,
              status: t.status,
              completedAt: t.completedAt,
            })
          )
        );
      } catch (err: unknown) {
        if (!active) return;
        console.error("Checklist load failed:", err instanceof Error ? err.message : String(err));
        setLoadError("We couldn't load your checklist. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [router]);

  const toggle = async (taskId: string) => {
    const existing = tasks.find((t) => t.taskId === taskId);
    const isComplete = existing?.status === "complete";
    const nextStatus: UserTask["status"] = isComplete ? "not_started" : "complete";
    const completedAt = isComplete ? undefined : new Date().toISOString();

    setToggleError("");
    setTasks((prev) =>
      prev.map((t): UserTask =>
        t.taskId === taskId ? { ...t, status: nextStatus, completedAt } : t
      )
    );

    // Revert the optimistic update above if the save actually fails — this
    // used to fail silently with no feedback and no revert, which is the
    // same "looks done but never saved" bug found (and fixed) on the task
    // detail page and in onboarding's arrival_profiles save.
    const revert = () => setTasks((prev) =>
      prev.map((t): UserTask => (t.taskId === taskId ? (existing ?? t) : t))
    );

    try {
      const token = localStorage.getItem("custom_auth_token");
      if (!token) { revert(); router.push("/login"); return; }

      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ taskId, status: nextStatus }),
      });
      if (res.status === 401) { revert(); router.push("/login"); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
    } catch (err: unknown) {
      console.error("Task toggle save failed:", err instanceof Error ? err.message : String(err));
      revert();
      setToggleError("We couldn't save that — please try again.");
    }
  };

  if (loading) return <ChecklistSkeleton />;

  if (loadError) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-3">
        <p className="text-sm font-semibold text-navy">{loadError}</p>
        <button onClick={() => window.location.reload()} className="btn-primary text-sm">Try again</button>
      </div>
    );
  }

  const validTaskIds = new Set(SEED_TASKS.map((task) => task.taskId));
  const visibleTasks = tasks.filter((task) => validTaskIds.has(task.taskId));
  const filteredTasks = visibleTasks.filter((t) => {
    if (filter === "pending") return t.status !== "complete";
    if (filter === "complete") return t.status === "complete";
    return true;
  });

  const tasksByStage = Object.fromEntries(
    STAGE_ORDER.map((s) => [s, filteredTasks.filter((t) => SEED_TASKS.find((st) => st.taskId === t.taskId && st.stage === s))])
  );

  const completedCount = visibleTasks.filter((t) => t.status === "complete").length;
  const totalCount = visibleTasks.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

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
      {toggleError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{toggleError}</div>
      )}
      <div className="card flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-navy">
            {completedCount} of {totalCount} tasks completed
          </p>
          <div className="mt-2 w-48 h-2 bg-civic-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${totalCount ? Math.round((completedCount / totalCount) * 100) : 0}%` }}
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
          <p className="text-sm text-civic-600">You&apos;ve finished your personalised settlement roadmap. Well done!</p>
        </div>
      )}

      {STAGE_ORDER.map((stage) => {
        const stageTasks = tasksByStage[stage];
        if (!stageTasks.length) return null;
        const stageCompleted = stageTasks.filter((t) => t.status === "complete").length;
        const open = expandedStages.has(stage);

        return (
          <div key={stage} className="card">
            <button onClick={() => toggleStage(stage)} className="w-full flex items-center justify-between py-2">
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
                        done ? "bg-green-50 border-green-200" : "bg-white border-border hover:border-primary/30"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        done ? "bg-green border-green" : "border-civic-300"
                      }`}>
                        {done && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${done ? "text-green line-through opacity-70" : "text-navy"}`}>{seed.title}</p>
                        <div className="mt-1 flex gap-1.5 flex-wrap">
                          <Badge label={seed.category} variant="category" />
                          {seed.conditional && <span className="text-[10px] text-muted bg-civic-50 rounded-full px-2 py-0.5">{seed.conditional}</span>}
                        </div>
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
        <EmptyState icon={Filter} message="No tasks here" description="Try a different filter to see your tasks." />
      )}
    </div>
  );
}
