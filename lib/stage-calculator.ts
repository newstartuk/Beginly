import type { TaskStage } from "@/types";

export function calculateStage(arrivalDate: string | undefined): TaskStage {
  if (!arrivalDate) return "PRE";

  const arrival = new Date(arrivalDate);
  const today = new Date();

  // Reset time components for pure date comparison
  arrival.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - arrival.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "PRE";               // hasn't arrived yet
  if (diffDays === 0 || diffDays === 1) return "D1";  // today or yesterday
  if (diffDays <= 7) return "D7";               // days 2-7
  if (diffDays <= 30) return "D30";             // days 8-30
  if (diffDays <= 90) return "D90";             // days 31-90
  return "GROW";                                  // beyond 90 days
}

export function getStageLabel(stage: TaskStage): string {
  const labels: Record<TaskStage, string> = {
    PRE: "Pre-Arrival",
    D1: "Arrival Day",
    D7: "First Week",
    D30: "First Month",
    D90: "Days 31–90",
    GROW: "Growth",
  };
  return labels[stage];
}

export function getStageColor(stage: TaskStage): string {
  const colors: Record<TaskStage, string> = {
    PRE: "text-blue-600 bg-blue-50 border-blue-200",
    D1: "text-primary bg-teal-50 border-teal-200",
    D7: "text-teal-700 bg-teal-100 border-teal-200",
    D30: "text-amber-600 bg-amber-50 border-amber-200",
    D90: "text-orange-600 bg-orange-50 border-orange-200",
    GROW: "text-green-700 bg-green-50 border-green-200",
  };
  return colors[stage];
}
