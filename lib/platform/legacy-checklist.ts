import { SEED_TASKS } from "@/lib/seed-data";
import { getTaskLinks } from "@/lib/task-links";
import { conditionMatches } from "@/lib/task-generator";
import { routeToArrivalType } from "./route-mapping";
import type { TaskCategory, TaskPriority } from "@/types";
import type { JourneyStage, JourneyTask, UserContext } from "./types";

const STAGE_MAP: Record<string, JourneyStage> = {
  PRE: "pre_arrival",
  D1: "arrival",
  D7: "settling",
  D30: "studying",
  D90: "progression",
  GROW: "progression",
};

const CATEGORY_MAP: Record<TaskCategory, string> = {
  Documents: "Identity",
  Accommodation: "Local life",
  University: "Education",
  Money: "Money",
  Health: "Health",
  Transport: "Local life",
  "Local Admin": "Local life",
  Work: "Career",
  Safety: "Safety",
  Growth: "Personal development",
  "Local Life": "Local life",
};

const PRIORITY_MAP: Record<TaskPriority, number> = {
  "Very High": 98,
  High: 88,
  Medium: 74,
  Low: 60,
};

// A task belongs to the settlement checklist (backed by lib/seed-data.ts) rather than
// the adaptive layer's own hand-authored tasks (journey.ts's routeTasks/commonTasks,
// whose ids look like "common-gp" or "worker-progression") whenever it's a real seed
// task. Checking real membership — rather than guessing from an id prefix — means this
// stays correct as seed-data.ts prefixes change or grow (it previously only recognised
// "STU_", silently misclassifying every "UNI_" universal task as an adaptive task).
export function isLegacyChecklistTaskId(taskId: string): boolean {
  return SEED_TASKS.some((task) => task.taskId === taskId);
}

export function getLegacyChecklistTask(taskId: string) {
  return SEED_TASKS.find((task) => task.taskId === taskId);
}

export function buildLegacyChecklistJourneyTasks(context: UserContext): JourneyTask[] {
  // Every route except humanitarian has a settlement task library in seed-data.ts,
  // keyed by ArrivalType. Humanitarian has no ArrivalType equivalent and is deliberately
  // routed to human support instead (see routeTasks.humanitarian in journey.ts).
  const arrivalType = routeToArrivalType(context.route);
  if (!arrivalType) return [];

  return SEED_TASKS
    .filter((task) => task.active)
    .filter((task) => !task.routes || task.routes === "all" || (task.routes as string[]).includes(arrivalType))
    // Apply the same condition-based filtering Task Library uses (driving, dependants,
    // accommodation, work interest), so the settlement count matches exactly between the
    // two pages. Skipped when arrivalProfile isn't available (migration_profiles-based
    // contexts have no equivalent fixed-shape profile) — shows the unconditioned set.
    .filter((task) => !context.arrivalProfile || conditionMatches(task, context.arrivalProfile))
    .map((task) => ({
    id: task.taskId,
    title: task.title,
    summary: task.summary,
    route: context.route,
    stage: STAGE_MAP[task.stage] ?? "settling",
    category: CATEGORY_MAP[task.category],
    urgency: PRIORITY_MAP[task.priority],
    required: task.required,
    dependencies: task.dependencies ?? [],
    reasonCodes: [
      "settlement_core",
      `legacy_stage_${task.stage.toLowerCase()}`,
      task.category.toLowerCase().replaceAll(" ", "_"),
    ],
    estimatedMinutes: task.estimatedMinutes,
    sourceIds: getTaskLinks(task.taskId).map((resource) => resource.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
    futureHorizon: task.stage === "D90" || task.stage === "GROW",
    assignedMemberId: context.activeMemberId,
  }));
}
