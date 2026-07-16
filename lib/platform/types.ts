export type MigrationRoute =
  | "student"
  | "graduate"
  | "skilled_worker"
  | "health_care"
  | "family_dependant"
  | "founder"
  | "global_talent"
  | "humanitarian";

export type JourneyStage =
  | "pre_arrival"
  | "arrival"
  | "settling"
  | "studying"
  | "career_preparation"
  | "transition"
  | "established"
  | "progression";

export type HouseholdRole = "primary" | "partner" | "adult_dependant" | "child";
export type EntitlementScope = "individual" | "selected_member" | "household" | "organisation" | "cohort";
export type EntitlementSource =
  | "free_core"
  | "purchase"
  | "subscription"
  | "bundle"
  | "household"
  | "sponsor"
  | "partner_funded"
  | "proofpoints"
  | "promotion"
  | "trial"
  | "grandfathered";

export type ProductKind = "free" | "standalone" | "subscription" | "bundle" | "business";
export type BillingInterval = "free" | "one_off" | "month" | "year" | "usage";
export type OpportunityCategory =
  | "job"
  | "training"
  | "certification"
  | "event"
  | "grant"
  | "accelerator"
  | "housing"
  | "banking"
  | "insurance"
  | "family"
  | "professional_network"
  | "community"
  | "regulated_service";

export type CommercialStatus = "commission_embedded" | "relationship_pending" | "public_interest" | "sponsored";
export type DashboardModuleType =
  | "safety"
  | "mandatory_action"
  | "next_best_action"
  | "future_horizon"
  | "opportunity"
  | "owned_product"
  | "household"
  | "value_recommendation"
  | "readiness"
  | "nia"
  | "notification";

export interface ProfileFact {
  key: string;
  value: string | number | boolean | string[] | null;
  confidence: number;
  source: "user" | "legacy_import" | "partner" | "inferred";
  updatedAt: string;
}

export interface HouseholdMember {
  id: string;
  displayName: string;
  role: HouseholdRole;
  ageBand: "adult" | "16_17" | "child";
  route?: MigrationRoute;
  privateWorkspace: boolean;
  isActor?: boolean;
}

export interface Goal {
  id: string;
  label: string;
  horizon: "now" | "next_90_days" | "next_year" | "long_term";
  targetDate?: string;
  status: "active" | "complete" | "paused";
}


export interface UserTaskState {
  state: "not_started" | "complete" | "deferred" | "irrelevant";
  deferUntil?: string;
  note?: string;
  evidence?: Record<string, unknown>;
}

export interface UserContext {
  actorId: string;
  displayName: string;
  householdId: string;
  activeMemberId: string;
  route: MigrationRoute;
  stage: JourneyStage;
  city: string;
  arrivalDate?: string;
  course?: string;
  occupation?: string;
  goals: Goal[];
  profileFacts: ProfileFact[];
  householdMembers: HouseholdMember[];
  grants: EntitlementGrant[];
  completedTaskIds: string[];
  taskStates: Record<string, UserTaskState>;
  dismissedRecommendationIds: string[];
  proofPoints: number;
  promotionPreference: "minimal" | "contextual" | "off";
  aiConsent: boolean;
  locationConsent: boolean;
}

export interface CapabilityDefinition {
  code: string;
  name: string;
  description: string;
  freeCore?: boolean;
  sensitive?: boolean;
}

export interface ProductDefinition {
  id: string;
  name: string;
  promise: string;
  kind: ProductKind;
  capabilities: string[];
  routeFit: MigrationRoute[] | "all";
  scope: EntitlementScope;
  autonomyLevel: 0 | 1 | 2 | 3 | 4 | 5;
  priceMinor: number;
  currency: "GBP";
  billingInterval: BillingInterval;
  standalone: boolean;
  featured?: boolean;
}

export interface EntitlementGrant {
  id: string;
  actorId: string;
  memberId?: string;
  source: EntitlementSource;
  scope: EntitlementScope;
  productId?: string;
  capabilityCode?: string;
  startsAt: string;
  endsAt?: string;
  autonomyLevel?: 0 | 1 | 2 | 3 | 4 | 5;
  quota?: number;
  used?: number;
  conditions?: Record<string, string | number | boolean>;
}

export interface ResolvedCapability {
  capabilityCode: string;
  allowed: boolean;
  scope: EntitlementScope;
  autonomyLevel: number;
  quota: { limit: number | null; used: number; remaining: number | null };
  sources: Array<Pick<EntitlementGrant, "id" | "source" | "productId" | "startsAt" | "endsAt">>;
}

export interface JourneyTask {
  id: string;
  title: string;
  summary: string;
  route: MigrationRoute | "all";
  stage: JourneyStage;
  category: string;
  urgency: number;
  required: boolean;
  dependencies: string[];
  reasonCodes: string[];
  estimatedMinutes: number;
  dueDate?: string;
  futureHorizon?: boolean;
  assignedMemberId?: string;
  sourceIds: string[];
}

export interface ReadinessDimension {
  id: string;
  label: string;
  score: number;
  explanation: string;
  missingTaskIds: string[];
}

export interface JourneyResult {
  route: MigrationRoute;
  stage: JourneyStage;
  version: string;
  tasks: JourneyTask[];
  nextBestActions: JourneyTask[];
  readiness: ReadinessDimension[];
  forecast: Array<{ stage: JourneyStage; label: string; reason: string }>;
  generatedAt: string;
  taskStates: Record<string, UserTaskState>;
}

export interface Opportunity {
  id: string;
  title: string;
  provider: string;
  category: OpportunityCategory;
  description: string;
  routes: MigrationRoute[] | "all";
  cities: string[] | "all";
  goalTags: string[];
  trustScore: number;
  readinessRequirements: string[];
  deadline?: string;
  commercialStatus: CommercialStatus;
  commissionMinor?: number;
  sponsoredLabel?: string;
  verifiedAt: string;
  sourceUrl?: string;
}

export interface OpportunityScore {
  opportunity: Opportunity;
  eligible: boolean;
  trust: number;
  suitability: number;
  readiness: number;
  urgency: number;
  commercialValue: number;
  finalScore: number;
  why: string[];
  missingReadiness: string[];
}

export type ValueRecommendationType =
  | "no_purchase_needed"
  | "use_existing_capability"
  | "activate_sponsored_access"
  | "redeem_proofpoints"
  | "buy_standalone"
  | "start_subscription"
  | "switch_bundle"
  | "pause_subscription"
  | "replace_subscription"
  | "cancel_subscription"
  | "request_human_review";

export interface ValueRecommendation {
  id: string;
  type: ValueRecommendationType;
  productId?: string;
  reasonCodes: string[];
  explanation: string;
  freeAlternative?: string;
  ownedAlternative?: string;
  sponsoredAlternative?: string;
  standaloneAlternative?: string;
  bundleAlternative?: string;
  confidence: number;
  beginlyMayEarn: boolean;
  dismissible: boolean;
}

export interface NiaResponse {
  message: string;
  mode: "journey" | "opportunity" | "capability" | "value" | "safety";
  reasonCodes: string[];
  sourceIds: string[];
  actions: Array<{ id: string; label: string; href?: string; requiresApproval?: boolean }>;
  recommendation?: ValueRecommendation;
  requiresHumanReview?: boolean;
  confidence: number;
}

export interface DashboardModule {
  id: string;
  type: DashboardModuleType;
  title: string;
  summary: string;
  priority: number;
  reasonCodes: string[];
  commercialClass: "none" | "owned" | "sponsored" | "promotional";
  href?: string;
  dismissible: boolean;
  metadata?: Record<string, string | number | boolean>;
}

export interface DashboardComposition {
  id: string;
  actorId: string;
  generatedAt: string;
  modules: DashboardModule[];
  explanation: string;
}

export interface CommissionReadinessInput {
  legalEntityVerified: boolean;
  clearOffer: boolean;
  qualifyingEventDefined: boolean;
  attributionWindowDays?: number;
  conversionWebhook: boolean;
  reversalRules: boolean;
  consumerDisclosure: boolean;
  payoutProcess: boolean;
  supportProcess: boolean;
  fraudControls: boolean;
}

export interface CommissionReadinessResult {
  score: number;
  status: "not_ready" | "foundation_ready" | "sandbox_ready" | "marketplace_ready";
  missing: string[];
  nextActions: string[];
}

export type LedgerEventType = "click" | "lead" | "provisional_conversion" | "confirmed_conversion" | "reversal" | "payout";
export interface LedgerEvent {
  id: string;
  programmeId: string;
  attributionId: string;
  type: LedgerEventType;
  amountMinor: number;
  currency: "GBP";
  occurredAt: string;
  idempotencyKey: string;
}

export interface LedgerState {
  confirmedMinor: number;
  reversedMinor: number;
  paidMinor: number;
  payableMinor: number;
  events: LedgerEvent[];
}

export interface EvidenceRecord {
  id: string;
  requirementId: string;
  title: string;
  dimension: "innovation" | "viability" | "scalability" | "trust" | "execution";
  status: "planned" | "implemented" | "verified";
  evidenceType: "code" | "test" | "visual" | "metric" | "decision" | "pilot";
  reference: string;
  recordedAt: string;
}


export type BillingEventType =
  | "checkout_completed"
  | "invoice_paid"
  | "subscription_paused"
  | "subscription_resumed"
  | "subscription_cancelled"
  | "refund_completed";
export interface BillingEvent {
  id: string;
  idempotencyKey: string;
  type: BillingEventType;
  actorId: string;
  productId: string;
  amountMinor: number;
  currency: "GBP";
  occurredAt: string;
  workProductIds?: string[];
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}
export interface BillingState {
  actorId: string;
  products: Record<string, { status: "active" | "paused" | "cancelled" | "refunded"; paidMinor: number; refundedMinor: number }>;
  retainedWorkProductIds: string[];
  processedEventKeys: string[];
}

export interface ReferralTouch {
  referralCode: string;
  programmeId: string;
  ownerId: string;
  subjectHash: string;
  householdHash?: string;
  deviceHash?: string;
  touchedAt: string;
  attributionWindowDays: number;
}
export interface ConversionClaim {
  programmeId: string;
  subjectHash: string;
  occurredAt: string;
  externalEventId: string;
  valueMinor: number;
}
export interface AttributionDecision {
  eligible: boolean;
  referralCode?: string;
  ownerId?: string;
  reasonCodes: string[];
  fraudSignals: string[];
}
export interface ProofPointsEvent {
  idempotencyKey: string;
  type: "earn" | "redeem" | "reverse" | "expire" | "adjust";
  points: number;
  sourceId: string;
}
export interface ProofPointsState { balance: number; processedKeys: string[]; events: ProofPointsEvent[] }

export interface PilotEvent {
  actorId: string;
  eventType: "activated" | "task_completed" | "recommendation_shown" | "recommendation_accepted" | "no_purchase_confirmed" | "opportunity_acted";
  occurredAt: string;
  metadata?: Record<string, string | number | boolean>;
}
export interface PilotMetrics {
  actors: number;
  activationRate: number;
  taskCompletionRate: number;
  recommendationAcceptanceRate: number;
  noPurchaseProtectionRate: number;
  opportunityActionRate: number;
}
