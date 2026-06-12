"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

import { SEED_TASKS } from "@/lib/seed-data";
import type { TaskStatus, TaskStage, TaskCategory } from "@/types";
import {
  CheckCircle,
  Circle,
  Clock,
  Filter,
  Search,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const STAGES: { value: TaskStage | "ALL"; label: string }[] = [
  { value: "ALL", label: "All stages" },
  { value: "PRE", label: "Pre-Arrival" },
  { value: "D1", label: "Arrival Day" },
  { value: "D7", label: "First Week" },
  { value: "D30", label: "First Month" },
  { value: "D90", label: "Days 31–90" },
  { value: "GROW", label: "Growth" },
];

const CATEGORIES: { value: TaskCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "Documents", label: "Documents" },
  { value: "Accommodation", label: "Accommodation" },
  { value: "University", label: "University" },
  { value: "Money", label: "Money" },
  { value: "Health", label: "Health" },
  { value: "Transport", label: "Transport" },
  { value: "Local Admin", label: "Local Admin" },
  { value: "Work", label: "Work" },
  { value: "Safety", label: "Safety" },
  { value: "Growth", label: "Growth" },
  { value: "Local Life", label: "Local Life" },
];

const PRIORITY_COLORS: Record<string, string> = {
  "Very High": "text-red-600 bg-red-50 border border-red-200",
  "High": "text-amber-600 bg-amber-50 border border-amber-200",
  "Medium": "text-blue-600 bg-blue-50 border border-blue-200",
  "Low": "text-muted bg-civic-50 border border-civic-200",
};

const STATUS_FILTER: { value: TaskStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "complete", label: "Completed" },
];

export default function ChecklistContent() {
  const [mounted, setMounted] = useState(false);
  const [stageFilter, setStageFilter] = useState<TaskStage | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState<{ taskId: string; status: TaskStatus; completedAt?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    async function loadSession() {
      const res = await fetch("/api/user", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data.tasks || []);
      setLoading(false);
    }
    loadSession();
  }, []);

  if (!mounted || loading) return null;

  const refresh = () => setTasks((prev) => [...prev]);

  const toggle = (taskId: string, current: TaskStatus) => {
    const next: TaskStatus =
      current === "complete"
        ? "not_started"
        : current === "in_progress"
        ? "complete"
        : "in_progress";
    // Optimistic update
    setTasks((prev) => {
      const exists = prev.find((t) => t.taskId === taskId);
      if (exists) {
        return prev.map((t) => t.taskId === taskId ? { ...t, status: next } : t);
      }
      return [...prev, { taskId, status: next }];
    });
    // Persist via API
    fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ tasks: [{ taskId, status: next }] }),
    }).catch(() => { /* silently fail — already updated optimistically */ });
  };

  const getStatus = (taskId: string): TaskStatus => {
    return tasks.find((t) => t.taskId === taskId)?.status ?? "not_started";
  };

  const filtered = SEED_TASKS.filter((t) => {
    if (!t.active) return false;
    if (stageFilter !== "ALL" && t.stage !== stageFilter) return false;
    if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
    if (statusFilter !== "ALL" && getStatus(t.taskId) !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !t.title.toLowerCase().includes(q) &&
        !t.summary.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const completed = tasks.filter((t) => t.status === "complete").length;
  const total = SEED_TASKS.filter((t) => t.active && t.required).length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy">My Checklist</h1>
          <p className="text-sm text-muted mt-0.5">
            {completed}/{total} required tasks completed
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-muted">Progress</p>
          <p className="text-sm font-bold text-primary">
            {total > 0 ? Math.round((completed / total) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-2.5 bg-civic-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={total > 0 ? Math.round((completed / total) * 100) : 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Checklist progress: ${completed} of ${total} required tasks complete`}
      >
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{
            width: `${total > 0 ? (completed / total) * 100 : 0}%`,
          }}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="input-field pl-9"
        />
      </div>

      {/* Stage filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-muted mr-1">
          <Filter className="w-3 h-3" /> Stage:
        </div>
        {STAGES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStageFilter(s.value as typeof stageFilter)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              stageFilter === s.value
                ? "bg-primary text-white"
                : "bg-white text-muted border border-border hover:border-primary/40"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-muted mr-1">
          <Filter className="w-3 h-3" /> Status:
        </div>
        {STATUS_FILTER.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value as typeof statusFilter)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              statusFilter === s.value
                ? "bg-primary text-white"
                : "bg-white text-muted border border-border hover:border-primary/40"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategoryFilter(c.value as typeof categoryFilter)}
            className={`px-2.5 py-1 rounded-full text-xs transition-all ${
              categoryFilter === c.value
                ? "bg-navy text-white"
                : "bg-civic-50 text-muted hover:bg-civic-100"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div
          className="card text-center py-12"
          role="status"
          aria-live="polite"
        >
          <CheckCircle className="w-10 h-10 text-muted mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted">No tasks match your filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => {
            const status = getStatus(t.taskId);
            return (
              <div
                key={t.taskId}
                className={`card-hover flex items-center gap-3 ${
                  status === "complete" ? "opacity-60" : ""
                }`}
              >
                <button
                  onClick={() => toggle(t.taskId, status)}
                  className="shrink-0"
                  title={
                    status === "complete"
                      ? "Mark incomplete"
                      : status === "in_progress"
                      ? "Mark complete"
                      : "Mark in progress"
                  }
                  aria-label={
                    status === "complete"
                      ? `Mark "${t.title}" incomplete`
                      : status === "in_progress"
                      ? `Mark "${t.title}" complete`
                      : `Mark "${t.title}" in progress`
                  }
                >
                  {status === "complete" ? (
                    <CheckCircle className="w-6 h-6 text-primary" />
                  ) : status === "in_progress" ? (
                    <Clock className="w-6 h-6 text-amber-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-civic-200 hover:text-primary transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold text-navy ${
                      status === "complete" ? "line-through" : ""
                    }`}
                  >
                    {t.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[t.priority]}`}
                    >
                      {t.priority}
                    </span>
                    <span className="text-xs text-muted">{t.stage}</span>
                    <span className="text-xs text-muted">{t.category}</span>
                    {t.required && (
                      <span className="text-xs text-primary">Required</span>
                    )}
                    {t.riskWarning && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-500">
                        <AlertTriangle className="w-3 h-3" /> Risk
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/tasks/${t.taskId}`}
                  className="shrink-0 text-muted hover:text-primary transition-colors"
                  aria-label={`View details for ${t.title}`}
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
