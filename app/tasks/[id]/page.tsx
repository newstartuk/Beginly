"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { SEED_TASKS } from "@/lib/seed-data";
import type { TaskStatus } from "@/types";
import {
  ChevronLeft,
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Disclaimer from "@/components/Disclaimer";

// Task progress lives in Supabase (public.user_tasks), read/written through
// /api/tasks — same as the main checklist page — rather than the old
// localStorage-only getUserTask/upsertUserTask helpers, which never synced
// this page's progress anywhere beyond the current browser.
function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("custom_auth_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const task = SEED_TASKS.find((t) => t.taskId === taskId);
  const [status, setStatus] = useState<TaskStatus>("not_started");
  const [mounted, setMounted] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      // Don't gate on localStorage having a token — the session is also
      // carried by an httpOnly cookie the browser sends automatically, and
      // that cookie is the more reliable of the two. Just make the request
      // and let a 401 response (not a missing localStorage key) decide
      // whether to redirect to /login.
      if (!task) { if (active) setMounted(true); return; }

      try {
        const res = await fetch("/api/tasks", { headers: authHeaders() });
        if (res.status === 401) { router.push("/login"); return; }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load task.");
        if (!active) return;

        const match = (data.tasks ?? []).find((t: { taskId: string; status: TaskStatus }) => t.taskId === task.taskId);
        if (match) setStatus(match.status);
      } catch (err: unknown) {
        console.error("Task load failed:", err instanceof Error ? err.message : String(err));
      } finally {
        if (active) setMounted(true);
      }
    }
    load();
    return () => { active = false; };
  }, [task, router]);

  if (!mounted) return null;

  if (!task) {
    return (
      <Navigation>
        <div className="text-center py-20">
          <p className="text-lg font-bold text-navy mb-2">Task not found</p>
          <Link href="/checklist" className="text-sm text-primary hover:underline">← Back to checklist</Link>
        </div>
      </Navigation>
    );
  }

  const update = async (newStatus: TaskStatus) => {
    const previous = status;
    setSaveError("");
    setStatus(newStatus);

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ taskId: task.taskId, status: newStatus }),
      });
      if (res.status === 401) { setStatus(previous); router.push("/login"); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
    } catch (err: unknown) {
      console.error("Task update failed:", err instanceof Error ? err.message : String(err));
      setStatus(previous);
      setSaveError("We couldn't save that — please try again.");
    }
  };

  const PRIORITY_COLORS: Record<string, string> = {
    "Very High": "text-red-600 bg-red-50 border border-red-200",
    "High": "text-amber-600 bg-amber-50 border border-amber-200",
    "Medium": "text-blue-600 bg-blue-50 border border-blue-200",
    "Low": "text-muted bg-civic-50 border border-civic-200",
  };

  return (
    <Navigation>
      <div className="space-y-5 animate-fade-in max-w-3xl">
        {saveError && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{saveError}</div>
        )}

        {/* Back */}
        <Link href="/checklist" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to checklist
        </Link>

        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </span>
            <span className="text-xs text-muted bg-civic-50 px-2.5 py-1 rounded-full">{task.stage} · {task.category}</span>
            {task.required && <span className="text-xs text-primary bg-teal-50 px-2.5 py-1 rounded-full font-semibold">Required</span>}
          </div>
          <h1 className="text-2xl font-bold text-navy leading-snug">{task.title}</h1>
          <p className="text-sm text-civic-600 mt-2 leading-relaxed">{task.summary}</p>
        </div>

        {/* Status toggle */}
        <div className="card">
          <p className="text-xs text-muted mb-3 uppercase tracking-wide font-semibold">Mark your progress</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "not_started", label: "Not started", icon: Circle, active: false },
              { value: "in_progress", label: "In progress", icon: Clock, active: true },
              { value: "complete", label: "Complete", icon: CheckCircle, active: true },
            ].map(({ value, label, icon: Icon, active }) => (
              <button
                key={value}
                onClick={() => update(value as TaskStatus)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  status === value
                    ? active ? "border-primary bg-teal-50 text-primary" : "border-civic-200 bg-civic-50 text-civic-300"
                    : "border-border text-muted hover:border-primary/40"
                }`}
              >
                <Icon className={`w-6 h-6 ${status === value ? (active ? "text-primary" : "text-civic-300") : "text-civic-300"}`} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Why it matters */}
        <div className="card">
          <h2 className="section-title">Why it matters</h2>
          <p className="text-sm text-civic-700 leading-relaxed">{task.whyItMatters}</p>
        </div>

        {/* Conditional */}
        {task.conditional && (
          <div className="card border-amber-200 bg-amber-50">
            <p className="text-sm font-semibold text-amber-700 mb-1">⚠️ Only applies to you</p>
            <p className="text-sm text-amber-600">{task.conditional}</p>
          </div>
        )}

        {/* What to prepare */}
        {task.whatToPrepare.length > 0 && (
          <div className="card">
            <h2 className="section-title">What to prepare</h2>
            <ul className="space-y-2">
              {task.whatToPrepare.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-civic-700">
                  <span className="text-primary font-bold shrink-0 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Steps to take */}
        {task.stepsToTake.length > 0 && (
          <div className="card">
            <h2 className="section-title">Steps to take</h2>
            <ol className="space-y-3">
              {task.stepsToTake.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-civic-700">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Common mistakes */}
        {task.commonMistakes.length > 0 && (
          <div className="card border-amber-200 bg-amber-50">
            <h2 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Common mistakes to avoid
            </h2>
            <ul className="space-y-2">
              {task.commonMistakes.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                  <span className="text-amber-400 shrink-0 mt-0.5">✗</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk warning */}
        {task.riskWarning && (
          <div className="card border-2 border-red-200 bg-red-50">
            <h2 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Risk warning
            </h2>
            <p className="text-sm text-red-600 leading-relaxed">{task.riskWarning}</p>
          </div>
        )}

        {/* Source signpost */}
        {task.sourceSignpost && (
          <div className="card bg-civic-50">
            <h2 className="text-xs font-semibold text-muted uppercase mb-1">Official sources</h2>
            <p className="text-sm text-civic-600 leading-relaxed">{task.sourceSignpost}</p>
          </div>
        )}

        {/* Related guidance */}
        {task.guidanceSlug && (
          <Link href={`/guides/${task.guidanceSlug}`} className="card-hover flex items-center justify-between">
            <div>
              <p className="text-xs text-muted mb-0.5">Related guidance</p>
              <p className="text-sm font-semibold text-primary">Read full guidance article</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted" />
          </Link>
        )}

        <Disclaimer text="Beginly provides general settlement guidance, checklist support, document explanation, and signposting. We do not provide legal, immigration, financial, tax, medical, or housing advice. For official or regulated matters, please use official sources or speak to a qualified professional." type="general" />
      </div>
    </Navigation>
  );
}
