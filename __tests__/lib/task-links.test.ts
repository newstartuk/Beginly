import { describe, expect, it } from "vitest";
import { SEED_TASKS } from "@/lib/seed-data";
import { getTaskLinks } from "@/lib/task-links";

describe("task-links", () => {
  it("gives every active task either structured links or an existing signpost", () => {
    const missing = SEED_TASKS.filter((task) => task.active && getTaskLinks(task.taskId).length === 0 && !task.sourceSignpost);
    expect(missing, JSON.stringify(missing.map((task) => task.taskId))).toHaveLength(0);
  });

  it("covers critical newcomer tasks with structured links", () => {
    const criticalTaskIds = [
      "STU_D7_003",
      "UNI_D7_001",
      "UNI_D7_002",
      "UNI_D7_003",
      "UNI_D30_003",
    ];
    criticalTaskIds.forEach((taskId) => {
      expect(getTaskLinks(taskId).length, taskId).toBeGreaterThan(0);
    });
  });
});
