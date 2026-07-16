import { buildJourney } from "./journey";
import { rankOpportunities } from "./opportunities";
import { productCoverage, recommendSmallestSufficientProduct } from "./entitlements";
import type { DashboardComposition, DashboardModule, UserContext } from "./types";

export function composeDashboard(context: UserContext): DashboardComposition {
  const journey = buildJourney(context);
  const opportunities = rankOpportunities(context).slice(0, 2);
  const modules: DashboardModule[] = [];

  const safety = journey.tasks.find((task) => task.category === "Safety" && !context.completedTaskIds.includes(task.id));
  if (safety) {
    modules.push({
      id: `module-safety-${safety.id}`,
      type: "safety",
      title: safety.title,
      summary: safety.summary,
      priority: 1000,
      reasonCodes: safety.reasonCodes,
      commercialClass: "none",
      href: "/journey",
      dismissible: false,
    });
  }

  for (const [index, task] of journey.nextBestActions.entries()) {
    modules.push({
      id: `module-task-${task.id}`,
      type: index === 0 ? "next_best_action" : "mandatory_action",
      title: task.title,
      summary: task.summary,
      priority: 900 - index * 20,
      reasonCodes: task.reasonCodes,
      commercialClass: "none",
      href: "/journey",
      dismissible: false,
      metadata: { estimatedMinutes: task.estimatedMinutes },
    });
  }

  const readinessAverage = Math.round(journey.readiness.reduce((sum, dimension) => sum + dimension.score, 0) / Math.max(1, journey.readiness.length));
  modules.push({
    id: "module-readiness",
    type: "readiness",
    title: `${readinessAverage}% overall readiness`,
    summary: "Your readiness is calculated from route, goals, completed actions and future-stage preparation.",
    priority: 760,
    reasonCodes: ["readiness_summary"],
    commercialClass: "none",
    href: "/journey",
    dismissible: false,
    metadata: { score: readinessAverage },
  });

  const future = journey.tasks.find((task) => task.futureHorizon && !context.completedTaskIds.includes(task.id));
  if (future) {
    modules.push({
      id: `module-future-${future.id}`,
      type: "future_horizon",
      title: `Prepare early: ${future.title}`,
      summary: future.summary,
      priority: 700,
      reasonCodes: [...future.reasonCodes, "lifetime_relevance"],
      commercialClass: "none",
      href: "/journey",
      dismissible: true,
    });
  }

  for (const [index, score] of opportunities.entries()) {
    modules.push({
      id: `module-opportunity-${score.opportunity.id}`,
      type: "opportunity",
      title: score.opportunity.title,
      summary: score.why.slice(0, 2).join(" "),
      priority: 650 - index * 10,
      reasonCodes: ["opportunity_fit", score.opportunity.commercialStatus],
      commercialClass: score.opportunity.commercialStatus === "sponsored" ? "sponsored" : "none",
      href: `/opportunities#${score.opportunity.id}`,
      dismissible: true,
      metadata: { fit: Math.round(score.finalScore * 100) },
    });
  }

  for (const coverage of productCoverage(context).filter((item) => item.owned && item.product.id !== "free_os").slice(0, 2)) {
    modules.push({
      id: `module-product-${coverage.product.id}`,
      type: "owned_product",
      title: coverage.product.name,
      summary: `${coverage.product.promise} Included through ${coverage.sourceLabels.join(", ")}.`,
      priority: 620,
      reasonCodes: ["owned_capability"],
      commercialClass: coverage.sourceLabels.includes("sponsor") ? "sponsored" : "owned",
      href: `/products/${coverage.product.id}`,
      dismissible: true,
    });
  }

  if (context.householdMembers.length > 1) {
    modules.push({
      id: "module-household",
      type: "household",
      title: `${context.householdMembers.length}-person household`,
      summary: "Coordinate shared actions while keeping each adult's private workspace separate.",
      priority: 600,
      reasonCodes: ["household_context"],
      commercialClass: "owned",
      href: "/household",
      dismissible: true,
    });
  }

  if (context.promotionPreference !== "off") {
    const recommendation = recommendSmallestSufficientProduct(context, ["interview_studio"]);
    if (recommendation.type === "buy_standalone" || recommendation.type === "start_subscription") {
      modules.push({
        id: `module-value-${recommendation.id}`,
        type: "value_recommendation",
        title: "A focused option for interview preparation",
        summary: recommendation.explanation,
        priority: 300,
        reasonCodes: recommendation.reasonCodes,
        commercialClass: "promotional",
        href: recommendation.productId ? `/products/${recommendation.productId}` : "/products",
        dismissible: true,
      });
    }
  }

  const sorted = modules.sort((a, b) => b.priority - a.priority);
  const firstPromotionIndex = sorted.findIndex((module) => module.commercialClass === "promotional");
  const finalModules = sorted.filter((module, index) => module.commercialClass !== "promotional" || index === firstPromotionIndex);

  return {
    id: `dashboard-${context.actorId}-${new Date().toISOString().slice(0, 10)}`,
    actorId: context.actorId,
    generatedAt: new Date().toISOString(),
    modules: finalModules,
    explanation: "Safety, urgent actions, future preparation, relevant opportunities and owned work rank above commercial recommendations.",
  };
}
