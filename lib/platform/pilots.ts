import type { PilotEvent, PilotMetrics } from "./types";
const ratio = (n: number, d: number): number => d ? Math.round((n / d) * 1000) / 10 : 0;
export function calculatePilotMetrics(events: PilotEvent[]): PilotMetrics {
  const actors = new Set(events.map((event) => event.actorId));
  const actorCount = actors.size;
  const activated = new Set(events.filter((e) => e.eventType === "activated").map((e) => e.actorId)).size;
  const taskActors = new Set(events.filter((e) => e.eventType === "task_completed").map((e) => e.actorId)).size;
  const shown = events.filter((e) => e.eventType === "recommendation_shown").length;
  const accepted = events.filter((e) => e.eventType === "recommendation_accepted").length;
  const noPurchase = events.filter((e) => e.eventType === "no_purchase_confirmed").length;
  const opportunityActors = new Set(events.filter((e) => e.eventType === "opportunity_acted").map((e) => e.actorId)).size;
  return { actors: actorCount, activationRate: ratio(activated, actorCount), taskCompletionRate: ratio(taskActors, actorCount), recommendationAcceptanceRate: ratio(accepted, shown), noPurchaseProtectionRate: ratio(noPurchase, shown), opportunityActionRate: ratio(opportunityActors, actorCount) };
}
