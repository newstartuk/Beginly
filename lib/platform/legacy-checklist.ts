import { SEED_TASKS } from "@/lib/seed-data";
import { getTaskLinks } from "@/lib/task-links";
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

export function isLegacyChecklistTaskId(taskId: string): boolean {
  return taskId.startsWith("STU_");
}

export function getLegacyChecklistTask(taskId: string) {
  return SEED_TASKS.find((task) => task.taskId === taskId);
}

export function buildLegacyChecklistJourneyTasks(context: UserContext): JourneyTask[] {
  if (context.route !== "student") return [];

  return SEED_TASKS.filter((task) => task.active).map((task) => ({
    id: task.taskId,
    title: task.title,
    summary: task.summary,
    route: "student",
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
