import "server-only";
import { SEED_TASKS } from "@/lib/seed-data";
import type { TaskStage } from "@/types";
import type { RoadmapTask } from "@/components/RoadmapPreviewCard";
import type { HeroRoute } from "@/components/landing/hero-routes";

/**
 * The four checklist tasks the landing page's roadmap card plays through for
 * each route, in order. Titles come from lib/seed-data.ts, so the card always
 * matches what people see in the app. Student isn't listed, so its card keeps
 * the general arrival checklist.
 *
 * This file is server-only: the page looks the titles up here and passes just
 * those strings to the card, so the full checklist never ships to the browser.
 */
export const CARD_TASK_IDS: Partial<Record<HeroRoute, string[]>> = {
  worker: ["SKW_D1_001", "UNI_D7_002", "SKW_D7_003", "SKW_D30_002"],
  family: ["UNI_D1_003", "FAM_D7_003", "FAM_D7_001", "FAM_D30_005"],
  graduate: ["GRD_PRE_002", "GRD_D7_004", "GRD_D7_002", "GRD_D30_003"],
  founder: ["FND_D7_001", "FND_D7_003", "FND_D30_003", "FND_D90_001"],
  health: ["HCW_D1_001", "HCW_D7_001", "HCW_D7_002", "HCW_D30_001"],
};

/** Short labels for each checklist stage, shown on the right of each card row. */
export const STAGE_LABEL: Record<TaskStage, string> = {
  PRE: "Before",
  D1: "Day 1",
  D7: "Week 1",
  D30: "Month 1",
  D90: "Month 3",
  GROW: "Later",
};

/** Looks up each route's card tasks in the checklist. */
export function getCardTasks(): Partial<Record<HeroRoute, RoadmapTask[]>> {
  const byId = new Map(SEED_TASKS.map((task) => [task.taskId, task]));
  const result: Partial<Record<HeroRoute, RoadmapTask[]>> = {};

  for (const [route, ids] of Object.entries(CARD_TASK_IDS) as Array<[HeroRoute, string[]]>) {
    // An ID that's gone missing is skipped rather than breaking the landing page;
    // the tests make sure every ID exists.
    result[route] = ids
      .map((id) => byId.get(id))
      .filter((task) => task !== undefined)
      .map((task) => ({ task: task.title, day: STAGE_LABEL[task.stage] }));
  }
  return result;
}
