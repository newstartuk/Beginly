import type { MigrationRoute } from "@/lib/platform/types";

export class ContractError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = 400) {
    super(message);
    this.name = "ContractError";
  }
}

const routeValues: MigrationRoute[] = [
  "student", "graduate", "skilled_worker", "health_care", "family_dependant", "founder", "global_talent", "humanitarian",
];

const asObject = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ContractError("invalid_body", "A JSON object is required.");
  return value as Record<string, unknown>;
};
const asString = (value: unknown, field: string, max = 500): string => {
  if (typeof value !== "string" || !value.trim()) throw new ContractError("invalid_field", `${field} is required.`);
  return value.trim().slice(0, max);
};
const asBoolean = (value: unknown, field: string): boolean => {
  if (typeof value !== "boolean") throw new ContractError("invalid_field", `${field} must be true or false.`);
  return value;
};

export interface OnboardingInput {
  route: MigrationRoute;
  city: string;
  goal: string;
  personalisationConsent: boolean;
  complete: boolean;
}
export function parseOnboardingInput(value: unknown): OnboardingInput {
  const body = asObject(value);
  const route = asString(body.route, "route", 40) as MigrationRoute;
  if (!routeValues.includes(route)) throw new ContractError("invalid_route", "The selected route is not supported.");
  return {
    route,
    city: asString(body.city, "city", 120),
    goal: asString(body.goal, "goal", 240),
    personalisationConsent: asBoolean(body.personalisationConsent, "personalisationConsent"),
    complete: body.complete === true,
  };
}

export type TaskAction = "complete" | "reopen" | "defer" | "irrelevant" | "note";
export interface TaskMutationInput { action: TaskAction; deferUntil?: string; note?: string; evidence?: Record<string, unknown>; idempotencyKey: string }
export function parseTaskMutationInput(value: unknown): TaskMutationInput {
  const body = asObject(value);
  const action = asString(body.action, "action", 30) as TaskAction;
  if (!["complete", "reopen", "defer", "irrelevant", "note"].includes(action)) throw new ContractError("invalid_action", "Unsupported task action.");
  const idempotencyKey = asString(body.idempotencyKey, "idempotencyKey", 160);
  const deferUntil = typeof body.deferUntil === "string" ? body.deferUntil.slice(0, 40) : undefined;
  if (action === "defer" && (!deferUntil || Number.isNaN(Date.parse(deferUntil)))) throw new ContractError("invalid_defer_date", "A valid defer date is required.");
  return { action, deferUntil, note: typeof body.note === "string" ? body.note.trim().slice(0, 2000) : undefined, evidence: body.evidence && typeof body.evidence === "object" && !Array.isArray(body.evidence) ? body.evidence as Record<string, unknown> : undefined, idempotencyKey };
}

export type OpportunityAction = "view" | "save" | "dismiss" | "prepare" | "apply" | "report" | "remind";
export interface OpportunityActionInput { action: OpportunityAction; idempotencyKey: string; disclosureAccepted?: boolean; destinationMode?: "in_app" | "external"; note?: string }
export function parseOpportunityActionInput(value: unknown): OpportunityActionInput {
  const body = asObject(value);
  const action = asString(body.action, "action", 30) as OpportunityAction;
  if (!["view", "save", "dismiss", "prepare", "apply", "report", "remind"].includes(action)) throw new ContractError("invalid_action", "Unsupported opportunity action.");
  return {
    action,
    idempotencyKey: asString(body.idempotencyKey, "idempotencyKey", 160),
    disclosureAccepted: body.disclosureAccepted === true,
    destinationMode: body.destinationMode === "external" ? "external" : "in_app",
    note: typeof body.note === "string" ? body.note.trim().slice(0, 1000) : undefined,
  };
}

export interface PreferencesInput {
  personalisationEnabled: boolean;
  locationEnabled: boolean;
  remindersEnabled: boolean;
  householdSharingEnabled: boolean;
  commercialRecommendationMode: "minimal" | "contextual" | "off";
}
export function parsePreferencesInput(value: unknown): PreferencesInput {
  const body = asObject(value);
  const mode = asString(body.commercialRecommendationMode, "commercialRecommendationMode", 30) as PreferencesInput["commercialRecommendationMode"];
  if (!["minimal", "contextual", "off"].includes(mode)) throw new ContractError("invalid_mode", "Unsupported recommendation mode.");
  return {
    personalisationEnabled: asBoolean(body.personalisationEnabled, "personalisationEnabled"),
    locationEnabled: asBoolean(body.locationEnabled, "locationEnabled"),
    remindersEnabled: asBoolean(body.remindersEnabled, "remindersEnabled"),
    householdSharingEnabled: asBoolean(body.householdSharingEnabled, "householdSharingEnabled"),
    commercialRecommendationMode: mode,
  };
}

const checkInChangeValues = ["new_job", "moved_home", "family_change", "visa_change", "health", "urgent", "all_good"] as const;
export type CheckInChange = (typeof checkInChangeValues)[number];
export interface CheckInInput { changes: CheckInChange[]; idempotencyKey: string }
export function parseCheckInInput(value: unknown): CheckInInput {
  const body = asObject(value);
  if (!Array.isArray(body.changes) || body.changes.length === 0) throw new ContractError("invalid_changes", "At least one change must be selected.");
  const changes = body.changes.map((change) => asString(change, "changes", 40) as CheckInChange);
  const invalid = changes.find((change) => !checkInChangeValues.includes(change));
  if (invalid) throw new ContractError("invalid_change", `Unsupported change: ${invalid}.`);
  return { changes: [...new Set(changes)], idempotencyKey: asString(body.idempotencyKey, "idempotencyKey", 160) };
}

export interface SupportCaseInput { caseType: "support" | "account" | "opportunity_feedback" | "safety" | "professional_escalation"; subject: string; description: string; severity: "low" | "normal" | "high" | "urgent"; opportunityId?: string; idempotencyKey: string }
export function parseSupportCaseInput(value: unknown): SupportCaseInput {
  const body = asObject(value);
  const caseType = asString(body.caseType, "caseType", 40) as SupportCaseInput["caseType"];
  if (!["support", "account", "opportunity_feedback", "safety", "professional_escalation"].includes(caseType)) throw new ContractError("invalid_case_type", "Unsupported support case type.");
  const severity = (typeof body.severity === "string" ? body.severity : "normal") as SupportCaseInput["severity"];
  if (!["low", "normal", "high", "urgent"].includes(severity)) throw new ContractError("invalid_severity", "Unsupported severity.");
  return { caseType, subject: asString(body.subject, "subject", 180), description: asString(body.description, "description", 5000), severity, opportunityId: typeof body.opportunityId === "string" ? body.opportunityId : undefined, idempotencyKey: asString(body.idempotencyKey, "idempotencyKey", 160) };
}

export interface DataRightsInput { requestType: "export" | "delete" | "rectify" | "restrict"; scope?: Record<string, unknown>; idempotencyKey: string }
export function parseDataRightsInput(value: unknown): DataRightsInput {
  const body = asObject(value);
  const requestType = asString(body.requestType, "requestType", 20) as DataRightsInput["requestType"];
  if (!["export", "delete", "rectify", "restrict"].includes(requestType)) throw new ContractError("invalid_request_type", "Unsupported data-rights request.");
  return { requestType, scope: body.scope && typeof body.scope === "object" && !Array.isArray(body.scope) ? body.scope as Record<string, unknown> : {}, idempotencyKey: asString(body.idempotencyKey, "idempotencyKey", 160) };
}

export interface HouseholdInviteInput { email: string; displayName: string; role: "partner" | "adult_dependant"; route?: MigrationRoute; idempotencyKey: string }
export function parseHouseholdInviteInput(value: unknown): HouseholdInviteInput {
  const body = asObject(value);
  const email = asString(body.email, "email", 254).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new ContractError("invalid_email", "A valid email is required.");
  const role = asString(body.role, "role", 30) as HouseholdInviteInput["role"];
  if (!["partner", "adult_dependant"].includes(role)) throw new ContractError("invalid_role", "Only adult household invitations are supported.");
  const route = typeof body.route === "string" && routeValues.includes(body.route as MigrationRoute) ? body.route as MigrationRoute : undefined;
  return { email, displayName: asString(body.displayName, "displayName", 120), role, route, idempotencyKey: asString(body.idempotencyKey, "idempotencyKey", 160) };
}

export interface DeviceRegistrationInput { token: string; platform: "ios" | "android"; remindersEnabled: boolean }
export function parseDeviceRegistrationInput(value: unknown): DeviceRegistrationInput {
  const body = asObject(value);
  const token = asString(body.token, "token", 4096);
  const platform = asString(body.platform, "platform", 20) as DeviceRegistrationInput["platform"];
  if (!["ios", "android"].includes(platform)) throw new ContractError("invalid_platform", "Only iOS and Android push registrations are supported.");
  if (!token.startsWith("ExponentPushToken[") && !token.startsWith("ExpoPushToken[")) throw new ContractError("invalid_push_token", "A valid Expo push token is required.");
  return { token, platform, remindersEnabled: body.remindersEnabled !== false };
}

export interface HouseholdMemberMutationInput {
  action: "set_role" | "set_visibility" | "transfer_primary";
  role?: "partner" | "adult_dependant";
  privateWorkspace?: boolean;
  dataVisibility?: Record<string, boolean>;
  idempotencyKey: string;
}
export function parseHouseholdMemberMutationInput(value: unknown): HouseholdMemberMutationInput {
  const body = asObject(value);
  const action = asString(body.action, "action", 30) as HouseholdMemberMutationInput["action"];
  if (!["set_role", "set_visibility", "transfer_primary"].includes(action)) throw new ContractError("invalid_action", "Unsupported household member action.");
  const role = typeof body.role === "string" ? body.role as HouseholdMemberMutationInput["role"] : undefined;
  if (action === "set_role" && (!role || !["partner", "adult_dependant"].includes(role))) throw new ContractError("invalid_role", "Select partner or adult dependant.");
  const dataVisibility = body.dataVisibility && typeof body.dataVisibility === "object" && !Array.isArray(body.dataVisibility)
    ? Object.fromEntries(Object.entries(body.dataVisibility as Record<string, unknown>).filter(([, item]) => typeof item === "boolean")) as Record<string, boolean>
    : undefined;
  return {
    action,
    role,
    privateWorkspace: typeof body.privateWorkspace === "boolean" ? body.privateWorkspace : undefined,
    dataVisibility,
    idempotencyKey: asString(body.idempotencyKey, "idempotencyKey", 160),
  };
}

export interface AdminSupportMutationInput { action: "triage" | "assign" | "waiting_user" | "escalate" | "resolve" | "close"; assignedTo?: string; note?: string }
export function parseAdminSupportMutationInput(value: unknown): AdminSupportMutationInput {
  const body = asObject(value); const action = asString(body.action, "action", 30) as AdminSupportMutationInput["action"];
  if (!["triage", "assign", "waiting_user", "escalate", "resolve", "close"].includes(action)) throw new ContractError("invalid_action", "Unsupported support action.");
  return { action, assignedTo: typeof body.assignedTo === "string" ? body.assignedTo : undefined, note: typeof body.note === "string" ? body.note.trim().slice(0, 2000) : undefined };
}
export interface AdminDataRightsMutationInput { state: "validating" | "in_progress" | "completed" | "rejected"; note?: string; evidence?: Record<string, unknown> }
export function parseAdminDataRightsMutationInput(value: unknown): AdminDataRightsMutationInput {
  const body = asObject(value); const state = asString(body.state, "state", 30) as AdminDataRightsMutationInput["state"];
  if (!["validating", "in_progress", "completed", "rejected"].includes(state)) throw new ContractError("invalid_state", "Unsupported data-rights state.");
  return { state, note: typeof body.note === "string" ? body.note.trim().slice(0, 2000) : undefined, evidence: body.evidence && typeof body.evidence === "object" && !Array.isArray(body.evidence) ? body.evidence as Record<string, unknown> : undefined };
}
export interface OutboundPolicyMutationInput { status: "review" | "approved" | "blocked" | "suspended"; allowSubdomains: boolean; allowedRedirectHosts: string[]; disclosureRequired: boolean; attributionMode: "none" | "first_party_session" | "partner_code" | "provider_webhook"; privacyNote?: string }
export function parseOutboundPolicyMutationInput(value: unknown): OutboundPolicyMutationInput {
  const body = asObject(value); const status = asString(body.status, "status", 20) as OutboundPolicyMutationInput["status"];
  if (!["review", "approved", "blocked", "suspended"].includes(status)) throw new ContractError("invalid_status", "Unsupported destination policy status.");
  const attributionMode = asString(body.attributionMode, "attributionMode", 40) as OutboundPolicyMutationInput["attributionMode"];
  if (!["none", "first_party_session", "partner_code", "provider_webhook"].includes(attributionMode)) throw new ContractError("invalid_attribution_mode", "Unsupported attribution mode.");
  const hosts = Array.isArray(body.allowedRedirectHosts) ? body.allowedRedirectHosts.filter((item): item is string => typeof item === "string").map((item) => item.trim().toLowerCase()).filter((item) => /^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(item)).slice(0, 30) : [];
  return { status, allowSubdomains: body.allowSubdomains === true, allowedRedirectHosts: hosts, disclosureRequired: body.disclosureRequired !== false, attributionMode, privacyNote: typeof body.privacyNote === "string" ? body.privacyNote.trim().slice(0, 2000) : undefined };
}
export interface ContentPublicationMutationInput { publicationState: "draft" | "review" | "published" | "retired"; indexState: "index" | "noindex" | "expired"; nextReviewAt?: string }
export function parseContentPublicationMutationInput(value: unknown): ContentPublicationMutationInput {
  const body = asObject(value); const publicationState = asString(body.publicationState, "publicationState", 20) as ContentPublicationMutationInput["publicationState"];
  const indexState = asString(body.indexState, "indexState", 20) as ContentPublicationMutationInput["indexState"];
  if (!["draft", "review", "published", "retired"].includes(publicationState)) throw new ContractError("invalid_publication_state", "Unsupported publication state.");
  if (!["index", "noindex", "expired"].includes(indexState)) throw new ContractError("invalid_index_state", "Unsupported indexing state.");
  if (publicationState !== "published" && indexState === "index") throw new ContractError("unsafe_index_state", "Only published content can be indexable.");
  const nextReviewAt = typeof body.nextReviewAt === "string" && !Number.isNaN(Date.parse(body.nextReviewAt)) ? body.nextReviewAt : undefined;
  return { publicationState, indexState, nextReviewAt };
}



export interface ConversionClaimAdminMutationInput { decision: "confirm" | "reject"; note?: string }
export function parseConversionClaimAdminMutationInput(value: unknown): ConversionClaimAdminMutationInput {
  const body = asObject(value);
  const decision = asString(body.decision, "decision", 20) as ConversionClaimAdminMutationInput["decision"];
  if (!["confirm", "reject"].includes(decision)) throw new ContractError("invalid_decision", "Confirm or reject the conversion claim.");
  return { decision, note: typeof body.note === "string" ? body.note.trim().slice(0, 2000) : undefined };
}

export interface NotificationMutationInput { action: "read" | "unread" | "archive" }
export function parseNotificationMutationInput(value: unknown): NotificationMutationInput {
  const body = asObject(value);
  const action = asString(body.action, "action", 20) as NotificationMutationInput["action"];
  if (!["read", "unread", "archive"].includes(action)) throw new ContractError("invalid_action", "Unsupported notification action.");
  return { action };
}

export interface ProductEntryInput {
  routeContext: MigrationRoute;
  goal: string;
  contextNotes?: string;
  personalisationConsent: boolean;
  idempotencyKey: string;
}
export function parseProductEntryInput(value: unknown): ProductEntryInput {
  const body = asObject(value);
  const routeContext = asString(body.routeContext, "routeContext", 40) as MigrationRoute;
  if (!routeValues.includes(routeContext)) throw new ContractError("invalid_route", "Select a supported route context.");
  return {
    routeContext,
    goal: asString(body.goal, "goal", 500),
    contextNotes: typeof body.contextNotes === "string" ? body.contextNotes.trim().slice(0, 2_000) : undefined,
    personalisationConsent: asBoolean(body.personalisationConsent, "personalisationConsent"),
    idempotencyKey: asString(body.idempotencyKey, "idempotencyKey", 160),
  };
}
