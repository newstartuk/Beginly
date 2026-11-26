import { describe, it, expect } from "vitest";
import { TIMELINE_TASK_IDS, TIMELINE_STAGES, getTimelines } from "@/lib/landing-timeline";
import { HERO_ROUTE_ARRIVAL_TYPE, HERO_ROUTE_ORDER, type HeroRoute } from "@/components/landing/hero-routes";
import { SEED_TASKS } from "@/lib/seed-data";
import { taskAppliesToRoute } from "@/lib/task-generator";
import type { TaskStage } from "@/types";

const byId = new Map(SEED_TASKS.map((t) => [t.taskId, t]));
const routes = Object.entries(TIMELINE_TASK_IDS) as Array<[HeroRoute, Partial<Record<TaskStage, string[]>>]>;

describe("landing timeline data", () => {
  it("has a timeline for every hero route", () => {
    expect(Object.keys(TIMELINE_TASK_IDS).sort()).toEqual([...HERO_ROUTE_ORDER].sort());
  });

  it.each(routes)("%s: every task is real, active, unconditional, on the route, and in the stage it's listed under", (route, byStage) => {
    for (const [stage, ids] of Object.entries(byStage) as Array<[TaskStage, string[]]>) {
      for (const id of ids) {
        const task = byId.get(id);
        expect(task, `${id} is missing from the checklist`).toBeDefined();
        expect(task!.active, `${id} is inactive`).toBe(true);
        expect(task!.conditional, `${id} is conditional`).toBeUndefined();
        expect(task!.stage, `${id} is listed under ${stage}`).toBe(stage);
        expect(taskAppliesToRoute(task!, HERO_ROUTE_ARRIVAL_TYPE[route]), `${id} isn't on the ${route} checklist`).toBe(true);
      }
    }
  });

  it.each(routes)("%s: one to three tasks per stage, no repeats", (_route, byStage) => {
    const all = Object.values(byStage).flat();
    expect(new Set(all).size).toBe(all.length);
    for (const ids of Object.values(byStage)) {
      expect(ids.length).toBeGreaterThanOrEqual(1);
      expect(ids.length).toBeLessThanOrEqual(3);
    }
  });

  it("only uses the stages the timeline shows", () => {
    const shown = TIMELINE_STAGES.map((s) => s.stage);
    for (const [, byStage] of routes) {
      for (const stage of Object.keys(byStage)) expect(shown).toContain(stage);
    }
  });

  it("skips Day 1 for graduates, who are already in the UK", () => {
    expect(getTimelines().graduate.map((p) => p.stage)).toEqual(["PRE", "D7", "D30", "D90"]);
  });

  it("builds every route's stages in time order, using checklist titles without em dashes", () => {
    const order = TIMELINE_STAGES.map((s) => s.stage);
    for (const phases of Object.values(getTimelines())) {
      const stages = phases.map((p) => order.indexOf(p.stage));
      expect(stages).toEqual([...stages].sort((a, b) => a - b));
      for (const phase of phases) {
        for (const title of phase.tasks) expect(title).not.toContain("—");
      }
    }
    expect(getTimelines().founder.find((p) => p.stage === "D7")?.tasks[0]).toBe(byId.get("FND_D7_001")!.title);
  });
});
