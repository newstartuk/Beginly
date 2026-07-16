import type { Task, UserTask } from "@/types";

const CATEGORY_WEIGHTS: Record<string, number> = {
  Documents: 0.15,
  Accommodation: 0.15,
  University: 0.15,
  Money: 0.15,
  Health: 0.10,
  "Local Admin": 0.10,
  Work: 0.10,
  Safety: 0.05,
  Growth: 0.05,
  "Local Life": 0.0,  // Local Life tasks are optional — no weight
  Transport: 0.0,    // Transport tasks are optional in the main scoring
};

const ALL_CATEGORIES = Object.keys(CATEGORY_WEIGHTS).filter(
  (k) => CATEGORY_WEIGHTS[k] > 0
);

export interface ReadinessScore {
  totalScore: number; // 0-100
  categoryBreakdown: {
    category: string;
    weight: number;
    completed: number;
    total: number;
    percentage: number;
    weightedContribution: number;
  }[];
  completedTasks: number;
  totalRequiredTasks: number;
  overallPercentage: number;
}

export function calculateReadinessScore(
  tasks: Task[],
  userTasks: UserTask[]
): ReadinessScore {
  const userTaskMap = new Map(userTasks.map((ut) => [ut.taskId, ut]));

  // Only count required, active tasks
  const requiredTasks = tasks.filter((t) => t.required && t.active);

  let totalWeightedScore = 0;

  const breakdown = ALL_CATEGORIES.map((category) => {
    const categoryRequiredTasks = requiredTasks.filter((t) => t.category === category);
    const completed = categoryRequiredTasks.filter(
      (t) => userTaskMap.get(t.taskId)?.status === "complete"
    ).length;
    const total = categoryRequiredTasks.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const weightedContribution = percentage * CATEGORY_WEIGHTS[category];

    totalWeightedScore += weightedContribution;

    return {
      category,
      weight: CATEGORY_WEIGHTS[category] * 100, // express as percentage points
      completed,
      total,
      percentage,
      weightedContribution,
    };
  });

  // Overall completion percentage of required tasks
  const totalCompleted = requiredTasks.filter(
    (t) => userTaskMap.get(t.taskId)?.status === "complete"
  ).length;
  const totalRequired = requiredTasks.length;

  return {
    totalScore: Math.round(totalWeightedScore),
    categoryBreakdown: breakdown,
    completedTasks: totalCompleted,
    totalRequiredTasks: totalRequired,
    overallPercentage:
      totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0,
  };
}
