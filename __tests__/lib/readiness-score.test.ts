import { describe, it, expect, afterEach } from "vitest";
import { calculateReadinessScore } from "@/lib/readiness-score";
import type { Task } from "@/types";

describe("readiness-score", () => {
  const makeTask = (overrides: Partial<Task> = {}): Task => ({
    taskId: "TEST_001",
    title: "Test task",
    summary: "Test",
    stage: "PRE",
    category: "Documents",
    priority: "High",
    required: true,
    active: true,
    aiHelperAllowed: true,
    estimatedMinutes: 20,
    whatToPrepare: [],
    stepsToTake: [],
    commonMistakes: [],
    whyItMatters: "",
    ...overrides,
  });

  it("returns a valid score object for empty input", () => {
    const result = calculateReadinessScore([], []);
    expect(result).toHaveProperty("totalScore");
    expect(result).toHaveProperty("overallPercentage");
    expect(result).toHaveProperty("completedTasks");
    expect(result).toHaveProperty("totalRequiredTasks");
    expect(result).toHaveProperty("categoryBreakdown");
    expect(typeof result.totalScore).toBe("number");
  });

  it("totalScore is 0 when no tasks completed", () => {
    const tasks = [makeTask({ taskId: "T1" }), makeTask({ taskId: "T2" })];
    const userTasks: { taskId: string; status: "complete" | "in_progress" }[] = [];
    const result = calculateReadinessScore(tasks, userTasks);
    expect(result.overallPercentage).toBe(0);
  });

  it("overallPercentage is 100 when all required active tasks complete", () => {
    const tasks = [makeTask({ taskId: "T1", active: true })];
    const userTasks = [{ taskId: "T1", status: "complete" as const }];
    const result = calculateReadinessScore(tasks, userTasks);
    expect(result.overallPercentage).toBe(100);
  });

  it("ignores inactive tasks from score calculation", () => {
    const tasks = [
      makeTask({ taskId: "T1", active: true }),
      makeTask({ taskId: "T2", active: false }),
    ];
    const userTasks = [{ taskId: "T1", status: "complete" as const }];
    const result = calculateReadinessScore(tasks, userTasks);
    expect(result.totalRequiredTasks).toBe(1); // only T1 counts
    expect(result.overallPercentage).toBe(100);
  });

  it("returns partial completion correctly", () => {
    const tasks = [
      makeTask({ taskId: "T1", category: "Documents" as const }),
      makeTask({ taskId: "T2", category: "Money" as const }),
    ];
    const userTasks = [{ taskId: "T1", status: "complete" as const }];
    const result = calculateReadinessScore(tasks, userTasks);
    expect(result.overallPercentage).toBe(50);
    expect(result.completedTasks).toBe(1);
    expect(result.totalRequiredTasks).toBe(2);
  });

  it("categoryBreakdown contains entries for all expected categories", () => {
    const result = calculateReadinessScore([], []);
    expect(Array.isArray(result.categoryBreakdown)).toBe(true);
    const categories = result.categoryBreakdown.map((b) => b.category);
    expect(categories).toContain("Documents");
    expect(categories).toContain("Money");
    expect(categories).toContain("Health");
    expect(categories).toContain("University");
    expect(categories).toContain("Accommodation");
  });

  it("each breakdown entry has the correct shape", () => {
    const result = calculateReadinessScore([], []);
    result.categoryBreakdown.forEach((entry) => {
      expect(entry).toHaveProperty("category");
      expect(entry).toHaveProperty("completed");
      expect(entry).toHaveProperty("total");
      expect(entry).toHaveProperty("percentage");
      expect(entry).toHaveProperty("weight");
      expect(typeof entry.completed).toBe("number");
      expect(typeof entry.total).toBe("number");
      expect(typeof entry.percentage).toBe("number");
      expect(typeof entry.weight).toBe("number");
    });
  });

  it("overallPercentage is never less than 0 or greater than 100", () => {
    const tasks = [
      makeTask({ taskId: "T1" }),
      makeTask({ taskId: "T2" }),
      makeTask({ taskId: "T3" }),
    ];
    const userTasks = [
      { taskId: "T1", status: "complete" as const },
      { taskId: "T2", status: "in_progress" as const },
    ];
    const result = calculateReadinessScore(tasks, userTasks);
    expect(result.overallPercentage).toBeGreaterThanOrEqual(0);
    expect(result.overallPercentage).toBeLessThanOrEqual(100);
  });
});
