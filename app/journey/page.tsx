import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import PlatformShell from "@/components/platform/PlatformShell";
import StatusPill from "@/components/platform/StatusPill";
import TaskActions from "@/components/platform/TaskActions";
import { getTaskLinks } from "@/lib/task-links";
import { buildJourney } from "@/lib/platform/journey";
import { getLegacyChecklistTask, isLegacyChecklistTaskId } from "@/lib/platform/legacy-checklist";
import { loadCurrentPlatformContext } from "@/lib/platform/server-context";

export const dynamic = "force-dynamic";

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function stageLabel(taskId: string) {
  const seedTask = getLegacyChecklistTask(taskId);
  if (!seedTask) return "Task Library";

  const stageLabels: Record<string, string> = {
    PRE: "Pre-Arrival",
    D1: "Arrival Day",
    D7: "First Week",
    D30: "First Month",
    D90: "Days 31-90",
    GROW: "Growth",
  };

  return stageLabels[seedTask.stage] ?? "Task Library";
}

export default async function JourneyPage() {
  const context = await loadCurrentPlatformContext();
  const journey = buildJourney(context);
  const settlementTasks = journey.tasks.filter((task) => isLegacyChecklistTaskId(task.id));
  const adaptiveTasks = journey.tasks.filter((task) => !isLegacyChecklistTaskId(task.id));
  const settlementNext = settlementTasks
    .filter((task) => !context.completedTaskIds.includes(task.id))
    .slice(0, 3);
  const completedSettlementCount = settlementTasks.filter((task) => context.completedTaskIds.includes(task.id)).length;
  const settlementProgress = settlementTasks.length
    ? Math.round((completedSettlementCount / settlementTasks.length) * 100)
    : 0;

  const settlementPhaseSummary = [
    { key: "PRE", label: "Pre-Arrival" },
    { key: "D1", label: "Arrival Day" },
    { key: "D7", label: "First Week" },
    { key: "D30", label: "First Month" },
    { key: "D90", label: "Days 31-90" },
  ]
    .map((phase) => {
      const phaseTasks = settlementTasks.filter((task) => getLegacyChecklistTask(task.id)?.stage === phase.key);
      if (!phaseTasks.length) return null;
      const done = phaseTasks.filter((task) => context.completedTaskIds.includes(task.id)).length;
      return {
        ...phase,
        done,
        total: phaseTasks.length,
      };
    })
    .filter((phase): phase is { key: string; label: string; done: number; total: number } => Boolean(phase));

  return (
    <PlatformShell
      title="Journey Hub"
      eyebrow={`${label(context.route)} · ${label(context.stage)}`}
      action={<StatusPill tone="positive">Settlement + future context</StatusPill>}
    >
      <section className="journey-hero">
        <div>
          <h2>Journey Hub connects your settlement work to everything that follows.</h2>
          <p>
            Task Library is now the home for newcomer tasks. Journey Hub sits above it and shows what matters next
            across settlement, future opportunities, household context and product support.
          </p>
          <div className="platform-hero-actions">
            <Link href="/checklist" className="platform-primary">
              Open Task Library <ArrowRight size={17} />
            </Link>
            <Link href="/platform" className="platform-secondary">
              Back to Today
            </Link>
          </div>
        </div>
        <div className="journey-forecast">
          {journey.forecast.slice(0, 2).map((item) => (
            <span key={item.label}>
              <strong>{item.label}</strong>
              {item.reason}
            </span>
          ))}
        </div>
      </section>

      <section className="platform-section-heading">
        <div>
          <span>Newcomer foundation</span>
          <h2>Settlement progress lives in Task Library</h2>
        </div>
        <p>
          This keeps the old Beginly value clear: your newcomer checklist stays phase-based, while Journey Hub shows
          how that work connects to the wider platform.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <article className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Settlement progress</p>
              <h3 className="mt-1 text-lg font-semibold text-navy">{completedSettlementCount} of {settlementTasks.length} settlement tasks done</h3>
              <p className="mt-2 text-sm text-civic-600">
                Use Task Library when you want the full pre-arrival to day 90 structure without the extra platform noise.
              </p>
            </div>
            <StatusPill tone="positive">{settlementProgress}% complete</StatusPill>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-civic-100">
            <div className="h-full bg-primary transition-all" style={{ width: `${settlementProgress}%` }} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {settlementPhaseSummary.map((phase) => (
              <div key={phase.key} className="rounded-xl border border-border bg-civic-50 p-3">
                <p className="text-xs font-semibold text-navy">{phase.label}</p>
                <p className="mt-1 text-sm text-civic-600">
                  {phase.done}/{phase.total} done
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Best next settlement actions</p>
          <div className="mt-3 space-y-3">
            {settlementNext.length > 0 ? (
              settlementNext.map((task) => {
                const links = getTaskLinks(task.id).slice(0, 2);
                return (
                  <div key={task.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted">{stageLabel(task.id)}</p>
                        <h3 className="text-sm font-semibold text-navy">{task.title}</h3>
                        <p className="mt-1 text-xs text-civic-600">{task.summary}</p>
                      </div>
                      <span className="text-xs text-muted whitespace-nowrap">{task.estimatedMinutes} min</span>
                    </div>
                    {links.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {links.map((resource) => (
                          <a
                            key={`${task.id}-${resource.url}`}
                            className="text-xs font-semibold text-primary hover:underline"
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {resource.label} <ExternalLink size={12} className="inline" />
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-civic-600">Your settlement foundation is in good shape. Use Task Library for review or continue with the adaptive layer below.</p>
            )}
          </div>
          <div className="mt-4">
            <Link href="/checklist" className="platform-primary">
              Go to Task Library <ArrowRight size={15} />
            </Link>
          </div>
        </article>
      </div>

      {adaptiveTasks.length > 0 ? (
        <>
          <section className="platform-section-heading">
            <div>
              <span>Adaptive layer</span>
              <h2>What Beginly keeps tracking beyond arrival</h2>
            </div>
            <p>
              These are the next-best actions and future-horizon tasks that belong in Journey Hub rather than in the
              newcomer task library.
            </p>
          </section>
          <div className="journey-task-list">
            {adaptiveTasks.map((task) => {
              const complete = context.completedTaskIds.includes(task.id);
              const next = journey.nextBestActions.some((item) => item.id === task.id);
              return (
                <article key={task.id} className={`${complete ? "complete" : ""} ${next ? "next" : ""}`}>
                  <span className="task-check">
                    {complete ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </span>
                  <div>
                    <div className="task-meta">
                      <StatusPill tone={next ? "positive" : task.futureHorizon ? "info" : "neutral"}>
                        {next ? "next best" : task.futureHorizon ? "future horizon" : task.category}
                      </StatusPill>
                      <span>
                        <Clock3 size={14} /> {task.estimatedMinutes} min
                      </span>
                    </div>
                    <h3>{task.title}</h3>
                    <p>{task.summary}</p>
                    <small>Why: {task.reasonCodes.join(" · ").replaceAll("_", " ")}</small>
                    <TaskActions
                      taskId={task.id}
                      complete={complete}
                      note={journey.taskStates[task.id]?.note}
                      evidenceReference={
                        typeof journey.taskStates[task.id]?.evidence?.reference === "string"
                          ? (journey.taskStates[task.id]?.evidence?.reference as string)
                          : ""
                      }
                    />
                  </div>
                  {next ? <Sparkles size={20} /> : null}
                </article>
              );
            })}
          </div>
        </>
      ) : null}
    </PlatformShell>
  );
}
