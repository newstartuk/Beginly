import type { UserContext } from "./types";

export const NIA_POLICY_VERSION = "nia-policy-1.3.0";
export const NIA_PROMPT_VERSION = "nia-system-1.3.0";

export interface NiaContextEnvelope {
  actorId: string;
  route: UserContext["route"];
  stage: UserContext["stage"];
  city?: string;
  goals: Array<{ label: string; horizon: string }>;
  household: { memberCount: number; adultCount: number; childCount: number };
  entitlements: Array<{ productId?: string; capabilityCode?: string; source: string; scope: string; endsAt?: string }>;
  taskState: { completed: number; deferred: number; outstanding: number };
  preferences: { promotions: UserContext["promotionPreference"]; aiConsent: boolean; locationConsent: boolean };
}

export function buildNiaContextEnvelope(context: UserContext): NiaContextEnvelope {
  const states = Object.values(context.taskStates);
  return {
    actorId: context.actorId,
    route: context.route,
    stage: context.stage,
    city: context.locationConsent ? context.city : undefined,
    goals: context.goals.filter((goal) => goal.status === "active").map((goal) => ({ label: goal.label, horizon: goal.horizon })),
    household: {
      memberCount: context.householdMembers.length,
      adultCount: context.householdMembers.filter((member) => member.ageBand === "adult").length,
      childCount: context.householdMembers.filter((member) => member.ageBand !== "adult").length,
    },
    entitlements: context.grants.map((grant) => ({ productId: grant.productId, capabilityCode: grant.capabilityCode, source: grant.source, scope: grant.scope, endsAt: grant.endsAt })),
    taskState: {
      completed: context.completedTaskIds.length,
      deferred: states.filter((state) => state.state === "deferred").length,
      outstanding: states.filter((state) => state.state === "not_started").length,
    },
    preferences: { promotions: context.promotionPreference, aiConsent: context.aiConsent, locationConsent: context.locationConsent },
  };
}

export function redactNiaMessage(message: string): string {
  return message
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL]")
    .replace(/\b(?:\+?44\s?7\d{3}|07\d{3})\s?\d{3}\s?\d{3}\b/g, "[PHONE]")
    .replace(/\b(?:GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b/gi, "[POSTCODE]")
    .replace(/\b\d{6,}\b/g, "[IDENTIFIER]")
    .slice(0, 4_000);
}

export const NIA_TOOL_POLICIES = {
  save_opportunity: { risk: "low", approvalRequired: false },
  defer_task: { risk: "low", approvalRequired: true },
  create_reminder: { risk: "low", approvalRequired: true },
  create_support_case: { risk: "medium", approvalRequired: true },
  request_human_review: { risk: "medium", approvalRequired: true },
  purchase_product: { risk: "high", approvalRequired: true },
  submit_application: { risk: "prohibited", approvalRequired: true },
} as const;

export type NiaToolCode = keyof typeof NIA_TOOL_POLICIES;
