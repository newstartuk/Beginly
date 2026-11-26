import { describe, it, expect } from "vitest";
import { CARD_TASK_IDS, STAGE_LABEL, getCardTasks } from "@/lib/landing-card-tasks";
import { HERO_ROUTE_ARRIVAL_TYPE, type HeroRoute } from "@/components/landing/hero-routes";
import { SEED_TASKS } from "@/lib/seed-data";
import { taskAppliesToRoute } from "@/lib/task-generator";
import type { TaskStage } from "@/types";

const STAGE_ORDER: TaskStage[] = ["PRE", "D1", "D7", "D30", "D90", "GROW"];
const byId = new Map(SEED_TASKS.map((t) => [t.taskId, t]));
const entries = Object.entries(CARD_TASK_IDS) as Array<[HeroRoute, string[]]>;

describe("landing card tasks", () => {
  it("leaves Student on the card's general arrival checklist", () => {
    expect(CARD_TASK_IDS.student).toBeUndefined();
  });

  it.each(entries)("%s: four real, active tasks that belong to the route", (route, ids) => {
    expect(ids).toHaveLength(4);
    for (const id of ids) {
      const task = byId.get(id);
      expect(task, `${id} is missing from the checklist`).toBeDefined();
      expect(task!.active, `${id} is inactive`).toBe(true);
      expect(taskAppliesToRoute(task!, HERO_ROUTE_ARRIVAL_TYPE[route]), `${id} isn't on the ${route} checklist`).toBe(true);
    }
  });

  it.each(entries)("%s: tasks run in time order", (_route, ids) => {
    const stages = ids.map((id) => STAGE_ORDER.indexOf(byId.get(id)!.stage));
    expect(stages).toEqual([...stages].sort((a, b) => a - b));
  });

  it("uses the checklist's own titles, with a stage label for each", () => {
    const cards = getCardTasks();
    expect(cards.founder?.[0]).toEqual({ task: byId.get("FND_D7_001")!.title, day: STAGE_LABEL.D7 });
    for (const tasks of Object.values(cards)) {
      for (const { task, day } of tasks) {
        expect(task.trim()).not.toBe("");
        expect(Object.values(STAGE_LABEL)).toContain(day);
        expect(task).not.toContain("—");
      }
    }
  });
});
