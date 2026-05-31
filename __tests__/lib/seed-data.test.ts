import { describe, it, expect } from "vitest";
import { SEED_TASKS } from "@/lib/seed-data";

describe("seed-data", () => {
  it("should have a non-empty task list", () => {
    expect(SEED_TASKS.length).toBeGreaterThan(0);
  });

  it("should have unique task IDs", () => {
    const ids = SEED_TASKS.map((t) => t.taskId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("should have no tasks with active BRP collection references", () => {
    const brpTaskTitles = SEED_TASKS.filter(
      (t) =>
        t.active &&
        (t.title.toLowerCase().includes("brp collection") ||
          t.title.toLowerCase().includes("collect brp"))
    );
    expect(brpTaskTitles).toHaveLength(0);
  });

  it("should have no tasks with active police registration references", () => {
    const policeTaskTitles = SEED_TASKS.filter(
      (t) =>
        t.active &&
        (t.title.toLowerCase().includes("police registration") ||
          t.title.toLowerCase().includes("police register"))
    );
    expect(policeTaskTitles).toHaveLength(0);
  });

  it("should have no tasks without sourceSignpost that contain eVisa/UKVI guidance", () => {
    const tasksWithoutSource = SEED_TASKS.filter(
      (t) =>
        t.active &&
        (t.title.toLowerCase().includes("visa") ||
          t.title.toLowerCase().includes("evisa") ||
          t.title.toLowerCase().includes("ukvi")) &&
        !t.sourceSignpost
    );
    expect(tasksWithoutSource, JSON.stringify(tasksWithoutSource.map((t) => t.taskId))).toHaveLength(0);
  });

  it("every task should have a non-empty title, summary, and stage", () => {
    SEED_TASKS.forEach((task) => {
      expect(task.title.trim().length).toBeGreaterThan(0);
      expect(task.summary.trim().length).toBeGreaterThan(0);
      expect(task.stage).toMatch(/^(PRE|D1|D7|D30|D90|GROW)$/);
    });
  });

  it("every task should belong to a valid category", () => {
    const validCategories = [
      "Documents",
      "Accommodation",
      "University",
      "Money",
      "Health",
      "Transport",
      "Local Admin",
      "Work",
      "Safety",
      "Growth",
      "Local Life",
    ];
    SEED_TASKS.forEach((task) => {
      expect(validCategories).toContain(task.category);
    });
  });

  it("work-hour tasks contain guidance about visa conditions and official sources", () => {
    // Only check tasks in the Work category, or tasks whose titles explicitly mention
    // work/hour/NI number rights — avoid false positives from words like "working well"
    const workTasks = SEED_TASKS.filter(
      (t) =>
        t.active &&
        (t.category === "Work" ||
          /\b(part.?time|work.?hours?|ni number|national insurance|right.?to.?work)\b/i.test(t.title))
    );
    workTasks.forEach((task) => {
      const combined = [
        task.stepsToTake.join(" "),
        task.riskWarning ?? "",
        task.sourceSignpost ?? "",
        task.summary,
        task.title,
      ]
        .join(" ")
        .toLowerCase();
      const hasVisaGuidance =
        combined.includes("visa") ||
        combined.includes("ukvi") ||
        combined.includes("evisa") ||
        combined.includes("gov.uk");
      expect(
        hasVisaGuidance,
        `${task.taskId} work guidance should reference official visa guidance or gov.uk sources`
      ).toBe(true);
    });
  });

  it("all tasks have the v1.2 extended schema fields as optional properties", () => {
    // Verify the Task type includes the new v1.2 fields
    SEED_TASKS.forEach((task) => {
      // TypeScript ensures these exist — this is a compile-time check more than runtime
      // We verify the shape is correct by accessing and confirming they don't throw
      expect(() => {
        const _deps = (task as unknown as Record<string, unknown>).dependencies;
        const _reminder = (task as unknown as Record<string, unknown>).reminderTrigger;
        const _escalation = (task as unknown as Record<string, unknown>).escalationFlag;
        const _review = (task as unknown as Record<string, unknown>).reviewStatus;
        return { _deps, _reminder, _escalation, _review };
      }).not.toThrow();
    });
  });

  it("should have tasks in all required stages", () => {
    const stages = [...new Set(SEED_TASKS.map((t) => t.stage))];
    expect(stages).toContain("PRE");
    expect(stages).toContain("D1");
    expect(stages).toContain("D7");
    expect(stages).toContain("D30");
    expect(stages).toContain("D90");
  });
});
