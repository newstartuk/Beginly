import { getProduct } from "./catalog";
import { recommendSmallestSufficientProduct, resolveEntitlements } from "./entitlements";
import { buildJourney } from "./journey";
import { opportunityDisclosure, rankOpportunities } from "./opportunities";
import type { NiaResponse, UserContext } from "./types";

const includesAny = (value: string, terms: string[]): boolean => terms.some((term) => value.includes(term));

const regulatedBoundary = (message: string): NiaResponse | null => {
  const lower = message.toLowerCase();
  if (includesAny(lower, ["will my visa", "definitely cancel", "legal advice", "am i eligible for a visa", "guarantee endorsement"])) {
    return {
      message: "I can help you organise the facts, official sources and questions to take to a regulated immigration adviser, but I cannot decide your personal legal position or guarantee an immigration outcome.",
      mode: "safety",
      reasonCodes: ["regulated_immigration_boundary", "human_review_available"],
      sourceIds: ["gov-immigration", "regulated-adviser-directory"],
      actions: [
        { id: "official-guidance", label: "Review official guidance", href: "/guides" },
        { id: "prepare-adviser", label: "Prepare questions for an adviser", requiresApproval: false },
      ],
      requiresHumanReview: true,
      confidence: 0.99,
    };
  }
  if (includesAny(lower, ["diagnose", "these symptoms mean", "what medicine", "medical advice"])) {
    return {
      message: "I cannot diagnose symptoms or recommend treatment. I can help you find the appropriate NHS route and organise what to tell a qualified professional. Use emergency services for an immediate or life-threatening situation.",
      mode: "safety",
      reasonCodes: ["medical_boundary"],
      sourceIds: ["nhs-111", "uk-emergency"],
      actions: [{ id: "nhs-guide", label: "Open NHS guidance", href: "/nhs" }],
      requiresHumanReview: true,
      confidence: 0.99,
    };
  }
  return null;
};

export function askNia(message: string, context: UserContext): NiaResponse {
  const safety = regulatedBoundary(message);
  if (safety) return safety;

  const lower = message.toLowerCase();
  if (!context.aiConsent) {
    return {
      message: "Your AI-context consent is currently off. I can show manual journeys and product comparisons without using your wider profile, or you can review consent settings.",
      mode: "safety",
      reasonCodes: ["ai_consent_disabled"],
      sourceIds: [],
      actions: [{ id: "settings", label: "Review privacy settings", href: "/settings" }],
      confidence: 1,
    };
  }


  if (includesAny(lower, ["submit this application", "apply for me", "send this application", "submit it for me"])) {
    return {
      message: "I can prepare and review the application with you, but I will not submit a material application without explicit approval and an authorised submission path. I can create a final review checklist or route this to human review.",
      mode: "safety",
      reasonCodes: ["material_action_requires_approval", "human_review_available"],
      sourceIds: ["beginly-action-policy"],
      actions: [
        { id: "prepare-application", label: "Prepare application", requiresApproval: false },
        { id: "approve-submission", label: "Review before submission", requiresApproval: true },
      ],
      requiresHumanReview: true,
      confidence: 0.99,
    };
  }

  if (includesAny(lower, ["cv", "resume"])) {
    const recommendation = recommendSmallestSufficientProduct(context, ["cv_studio"]);
    return {
      message: recommendation.type === "activate_sponsored_access"
        ? "Your university-sponsored CV Studio access already covers this. You do not need to buy Career Pro for this request."
        : recommendation.type === "use_existing_capability"
          ? "Your current access already covers CV support. Let's use it rather than adding another plan."
          : "CV Studio is the smallest current paid option for focused CV help. Career Pro is broader and is only relevant if you also need recurring application, interview and sponsorship support.",
      mode: "value",
      reasonCodes: recommendation.reasonCodes,
      sourceIds: ["beginly-product-catalogue"],
      actions: [
        { id: "open-cv", label: "Open CV Studio", href: "/products/cv_studio" },
        { id: "compare", label: "Compare options", href: "/products" },
      ],
      recommendation,
      confidence: recommendation.confidence,
    };
  }

  if (includesAny(lower, ["interview", "practice interview"])) {
    const recommendation = recommendSmallestSufficientProduct(context, ["interview_studio"]);
    return {
      message: recommendation.type === "use_existing_capability"
        ? "You already have interview preparation access, so no new purchase is needed."
        : "Interview Studio is the focused option for this need. A broader subscription is not required unless your needs continue beyond interview preparation.",
      mode: "value",
      reasonCodes: recommendation.reasonCodes,
      sourceIds: ["beginly-product-catalogue"],
      actions: [{ id: "open-interview", label: "Open Interview Studio", href: "/products/interview_studio" }],
      recommendation,
      confidence: recommendation.confidence,
    };
  }

  if (includesAny(lower, ["opportunity", "job", "training", "grant", "accelerator"])) {
    const top = rankOpportunities(context)[0];
    if (!top) {
      return {
        message: "I could not find an opportunity that passes the current route, location and trust gates. I can help you improve your profile or widen your preferences.",
        mode: "opportunity",
        reasonCodes: ["no_eligible_opportunity"],
        sourceIds: [],
        actions: [{ id: "profile", label: "Review preferences", href: "/settings" }],
        confidence: 0.85,
      };
    }
    return {
      message: `${top.opportunity.title} is currently your strongest match. ${top.why.join(" ")} ${opportunityDisclosure(top)}`,
      mode: "opportunity",
      reasonCodes: ["high_fit_opportunity", top.opportunity.commercialStatus],
      sourceIds: [`opportunity:${top.opportunity.id}`],
      actions: [{ id: "view-opportunity", label: "View opportunity", href: `/opportunities#${top.opportunity.id}` }],
      confidence: top.finalScore,
    };
  }

  if (includesAny(lower, ["plan", "next", "focus", "journey", "what should i do"])) {
    const journey = buildJourney(context);
    const actions = journey.nextBestActions;
    return {
      message: actions.length
        ? `Your next priorities are ${actions.map((task) => task.title).join(", ")}. I am also keeping future career and transition work visible so Beginly remains useful beyond your current settlement stage.`
        : "Your current required actions are complete. I will keep monitoring your future horizons and opportunities rather than ending the journey.",
      mode: "journey",
      reasonCodes: ["next_best_action", "future_horizon"],
      sourceIds: actions.flatMap((task) => task.sourceIds),
      actions: actions.map((task) => ({ id: task.id, label: task.title, href: "/journey" })),
      confidence: 0.94,
    };
  }

  if (includesAny(lower, ["subscription", "upgrade", "premium", "plan should i buy"])) {
    const resolved = resolveEntitlements(context);
    const productSources = resolved.flatMap((item) => item.sources.map((source) => source.productId)).filter(Boolean);
    return {
      message: `I will not recommend a package until we identify a specific uncovered need. Your current access already includes ${new Set(productSources).size} product source${new Set(productSources).size === 1 ? "" : "s"}. Tell me the outcome you need and I will first check free, owned, household and sponsored coverage.`,
      mode: "capability",
      reasonCodes: ["need_first", "no_irrelevant_feature_tax"],
      sourceIds: ["beginly-entitlements"],
      actions: [{ id: "coverage", label: "Review current access", href: "/products" }],
      confidence: 0.98,
    };
  }

  const journey = buildJourney(context);
  const topAction = journey.nextBestActions[0];
  return {
    message: topAction
      ? `I can help with your journey, opportunities, household coordination or product coverage. Based on your current context, ${topAction.title.toLowerCase()} is the most useful next action.`
      : "I can help with your journey, opportunities, household coordination and product coverage. Your current essential actions appear complete, so we can focus on future progression.",
    mode: "journey",
    reasonCodes: ["general_contextual_guidance"],
    sourceIds: topAction?.sourceIds ?? [],
    actions: [
      { id: "journey", label: "Open my journey", href: "/journey" },
      { id: "opportunities", label: "See opportunities", href: "/opportunities" },
    ],
    confidence: 0.86,
  };
}

export const productNameForRecommendation = (productId?: string): string | undefined =>
  productId ? getProduct(productId)?.name : undefined;
