import { OPPORTUNITIES } from "./catalog";
import { hasCapability, resolveEntitlements } from "./entitlements";
import type { Opportunity, OpportunityScore, UserContext } from "./types";

const clamp = (value: number): number => Math.max(0, Math.min(1, value));
const goalText = (context: UserContext): string => context.goals.map((goal) => goal.label.toLowerCase()).join(" ");

export function scoreOpportunity(opportunity: Opportunity, context: UserContext): OpportunityScore {
  const routeEligible = opportunity.routes === "all" || opportunity.routes.includes(context.route);
  const locationEligible = opportunity.cities === "all" || opportunity.cities.some((city) => city.toLowerCase() === context.city.toLowerCase());
  const eligible = routeEligible && locationEligible && opportunity.trustScore >= 0.7;

  const goals = goalText(context);
  const tagMatches = opportunity.goalTags.filter((tag) => goals.includes(tag.toLowerCase())).length;
  const suitability = clamp(0.35 + tagMatches * 0.2 + (routeEligible ? 0.2 : 0) + (locationEligible ? 0.15 : 0));

  const resolved = resolveEntitlements(context);
  const missingReadiness = opportunity.readinessRequirements.filter((requirement) => !hasCapability(resolved, requirement));
  const readiness = clamp(1 - missingReadiness.length * 0.25);

  const deadline = opportunity.deadline ? new Date(opportunity.deadline) : undefined;
  const days = deadline ? Math.max(0, (deadline.getTime() - Date.now()) / 86_400_000) : 90;
  const urgency = clamp(days <= 7 ? 1 : days <= 30 ? 0.8 : days <= 60 ? 0.55 : 0.35);
  const commercialValue = opportunity.commissionMinor ? clamp(opportunity.commissionMinor / 6000) : opportunity.commercialStatus === "sponsored" ? 0.55 : 0.1;

  // Commercial value is intentionally excluded from user-fit score. It may only break a near-tie after eligibility.
  const userFit = opportunity.trustScore * 0.3 + suitability * 0.4 + readiness * 0.2 + urgency * 0.1;
  const finalScore = eligible ? userFit : 0;

  const why: string[] = [];
  if (routeEligible) why.push(`Relevant to the ${context.route.replaceAll("_", " ")} route.`);
  if (locationEligible) why.push(opportunity.cities === "all" ? "Available nationally or online." : `Available in ${context.city}.`);
  if (tagMatches) why.push(`Matches ${tagMatches} active goal signal${tagMatches === 1 ? "" : "s"}.`);
  if (opportunity.trustScore >= 0.9) why.push("High current trust and verification score.");
  if (missingReadiness.length) why.push(`You have ${missingReadiness.length} readiness gap${missingReadiness.length === 1 ? "" : "s"} to address.`);

  return {
    opportunity,
    eligible,
    trust: opportunity.trustScore,
    suitability,
    readiness,
    urgency,
    commercialValue,
    finalScore,
    why,
    missingReadiness,
  };
}

export function rankOpportunities(context: UserContext, opportunities: Opportunity[] = OPPORTUNITIES): OpportunityScore[] {
  return opportunities
    .map((opportunity) => scoreOpportunity(opportunity, context))
    .filter((score) => score.eligible)
    .sort((a, b) => {
      const fitDifference = b.finalScore - a.finalScore;
      if (Math.abs(fitDifference) > 0.02) return fitDifference;
      // Only tie-break commercially after fit is effectively equivalent.
      return b.commercialValue - a.commercialValue;
    });
}

export const opportunityDisclosure = (score: OpportunityScore): string => {
  const status = score.opportunity.commercialStatus;
  if (status === "commission_embedded") return "Beginly may receive commission if a qualifying outcome is confirmed. Suitability was assessed before commercial value.";
  if (status === "sponsored") return score.opportunity.sponsoredLabel ?? "Sponsored opportunity. It still passed Beginly's relevance and trust checks.";
  if (status === "relationship_pending") return "Beginly does not currently have a commercial relationship with this provider. It is shown because it may be useful.";
  return "Organic public-interest recommendation. Beginly does not currently expect revenue from this opportunity.";
};
