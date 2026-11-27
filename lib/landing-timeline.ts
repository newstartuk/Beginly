import "server-only";
import { SEED_TASKS } from "@/lib/seed-data";
import type { TaskStage } from "@/types";
import type { HeroRoute, TimelinePhase } from "@/components/landing/hero-routes";

/** The stages the timeline shows, in order, with their headings. */
export const TIMELINE_STAGES: Array<{ stage: TaskStage; label: string }> = [
  { stage: "PRE", label: "Getting ready" },
  { stage: "D1", label: "Day 1" },
  { stage: "D7", label: "First week" },
  { stage: "D30", label: "First month" },
  { stage: "D90", label: "By day 90" },
];

/**
 * Hand-picked checklist tasks for each route's timeline, by stage. Titles come
 * from lib/seed-data.ts, so the timeline always matches the app. Picks aim for
 * one route-specific task plus one shared essential per stage, with no
 * near-duplicates and no conditional tasks. Graduate has no Day 1 because
 * graduates are already in the UK.
 *
 * Server-only: the page looks up just these titles and passes them down, so
 * the full checklist never ships to the browser.
 */
export const TIMELINE_TASK_IDS: Record<HeroRoute, Partial<Record<TaskStage, string[]>>> = {
  student: {
    PRE: ["STU_PRE_002", "UNI_PRE_001"],
    D1: ["UNI_D1_003", "UNI_D1_001"],
    D7: ["STU_D7_003", "UNI_D7_001"],
    D30: ["STU_D30_003", "UNI_D30_007"],
    D90: ["STU_D90_001", "UNI_D90_001"],
  },
  worker: {
    PRE: ["SKW_PRE_001", "UNI_PRE_001"],
    D1: ["SKW_D1_001", "UNI_D1_001"],
    D7: ["UNI_D7_002", "SKW_D7_003"],
    D30: ["SKW_D30_002", "SKW_D30_001"],
    D90: ["SKW_D90_001", "UNI_D90_001"],
  },
  family: {
    PRE: ["FAM_PRE_001", "FAM_PRE_003"],
    D1: ["UNI_D1_003", "UNI_D1_001"],
    D7: ["FAM_D7_003", "FAM_D7_002"],
    D30: ["FAM_D30_005", "FAM_D30_001"],
    D90: ["UNI_D90_001", "UNI_D90_003"],
  },
  graduate: {
    PRE: ["GRD_PRE_002", "GRD_PRE_001"],
    D7: ["GRD_D7_002", "GRD_D7_001"],
    D30: ["GRD_D30_003", "GRD_D30_001"],
    D90: ["GRD_D90_001", "UNI_D90_001"],
  },
  founder: {
    PRE: ["FND_PRE_001", "FND_PRE_002"],
    D1: ["UNI_D1_003", "UNI_D1_001"],
    D7: ["FND_D7_001", "FND_D7_003"],
    D30: ["FND_D30_003", "FND_D30_001"],
    D90: ["FND_D90_001", "FND_D90_003"],
  },
  health: {
    PRE: ["HCW_PRE_002", "HCW_PRE_001"],
    D1: ["HCW_D1_001", "UNI_D1_001"],
    D7: ["HCW_D7_001", "HCW_D7_002"],
    D30: ["HCW_D30_001", "HCW_D30_003"],
    D90: ["HCW_D90_001", "HCW_D90_003"],
  },
};

/** Looks up every route's timeline in the checklist. */
export function getTimelines(): Record<HeroRoute, TimelinePhase[]> {
  const titleById = new Map(SEED_TASKS.map((task) => [task.taskId, task.title]));
  const result = {} as Record<HeroRoute, TimelinePhase[]>;

  for (const [route, byStage] of Object.entries(TIMELINE_TASK_IDS) as Array<[HeroRoute, Partial<Record<TaskStage, string[]>>]>) {
    result[route] = TIMELINE_STAGES
      .map(({ stage, label }) => ({
        stage,
        label,
        // A missing ID is skipped rather than breaking the page; the tests make sure every ID exists.
        tasks: (byStage[stage] ?? []).map((id) => titleById.get(id)).filter((title) => title !== undefined),
      }))
      .filter((phase) => phase.tasks.length > 0);
  }
  return result;
}
