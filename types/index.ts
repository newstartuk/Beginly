// ===== User & Auth =====
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  profileCompleted: boolean;
}

// ===== Arrival Profile =====
export type ArrivalStatus = "not_arrived" | "arriving_soon" | "arrived";
export type AccommodationType =
  | "private_rental"
  | "own_home"
  | "university_accommodation"
  | "employer_provided"
  | "homestay"
  | "family_friend"
  | "temporary"
  | "not_secured";
export type EnglishLevel = "beginner" | "intermediate" | "advanced" | "fluent";

export type ArrivalType =
  | "international_student"
  | "skilled_worker"
  | "family_visa"
  | "graduate"
  | "global_talent"
  | "health_and_care"
  | "founder";

export interface ArrivalProfile {
  arrivalType: ArrivalType;
  arrivalStatus: ArrivalStatus;
  arrivalDate: string;
  city: string;
  university: string;
  accommodationType: AccommodationType;
  nationality?: string;
  englishLevel?: EnglishLevel;
  interestedInWork: boolean;
  profileCompleted: boolean;
  drivesFromOrigin?: boolean;
  hasIDL?: boolean;
  hasDependants?: boolean;
  sector?: string;
  employerName?: string;
}

// ===== Checklist Tasks =====
export type TaskStage = "PRE" | "D1" | "D7" | "D30" | "D90" | "GROW";
export type TaskCategory =
  | "Documents"
  | "Accommodation"
  | "University"
  | "Money"
  | "Health"
  | "Transport"
  | "Local Admin"
  | "Work"
  | "Safety"
  | "Growth"
  | "Local Life";
export type TaskPriority = "Very High" | "High" | "Medium" | "Low";
export type TaskStatus = "not_started" | "in_progress" | "complete";
export type ReviewStatus = "pending" | "reviewed" | "flagged" | "archived";
export type EscalationFlag = "none" | "advisor" | "urgent" | "legal";
export type ResourceLinkKind =
  | "official"
  | "commercial"
  | "housing"
  | "bank"
  | "university"
  | "support";

export interface ResourceLink {
  label: string;
  url: string;
  kind?: ResourceLinkKind;
}

export interface Task {
  taskId: string;
  title: string;
  summary: string;
  stage: TaskStage;
  category: TaskCategory;
  priority: TaskPriority;
  required: boolean;
  active: boolean;
  aiHelperAllowed: boolean;
  riskWarning?: string;
  estimatedMinutes: number;
  guidanceSlug?: string;
  whatToPrepare: string[];
  stepsToTake: string[];
  commonMistakes: string[];
  whyItMatters: string;
  sourceSignpost?: string;
  officialLinks?: ResourceLink[];
  routes?: ArrivalType[] | "all"; // which routes this task applies to; omit = "all"
  conditional?: string; // e.g. "Only if renting privately"
  // v1.2 new fields
  dependencies?: string[];          // taskIds that should be complete first
  reminderTrigger?: string;        // e.g. "1 day before arrival date", "first day of term"
  escalationFlag?: EscalationFlag; // flags that need human review
  reviewStatus?: ReviewStatus;     // content review status
}

export interface UserTask {
  taskId: string;
  status: TaskStatus;
  completedAt?: string;
}

// ===== Guidance =====
export type GuidanceCategory =
  | "Documents"
  | "Accommodation"
  | "Money"
  | "Health"
  | "University"
  | "Work"
  | "Safety"
  | "Local Life"
  | "Local Admin"
  | "Growth"
  | "Transport";

export interface GuidanceArticle {
  slug: string;
  title: string;
  category: GuidanceCategory;
  description: string;
  whatThisIs: string;
  whyItMatters: string;
  whatToPrepare: string[];
  stepsToTake: string[];
  commonMistakes: string[];
  safetyWarning?: string;
  sourceSignpost?: string;
  disclaimer: string;
  lastReviewed: string;
  relatedTaskIds: string[];
}

// ===== Scam Alerts =====
export interface ScamAlert {
  id: string;
  title: string;
  body: string;
  category: string;
  severity: "high" | "medium";
}

// ===== Document Helper =====
export type DocType =
  | "tenancy_agreement"
  | "council_tax_letter"
  | "student_status_letter"
  | "bank_letter"
  | "nhs_registration_form"
  | "other";

export interface DocHelperResponse {
  plainEnglish: string;
  missingFields: string[];
  keyTerms: { term: string; meaning: string }[];
  safeNextSteps: string[];
  refusal?: boolean;
  refusalReason?: string;
}

// ===== Reminders =====
export type ReminderFrequency = "daily" | "weekly" | "biweekly" | "monthly";
export interface ReminderPrefs {
  emailReminders: boolean;
  frequency: ReminderFrequency;
}

// ===== Support =====
export type SupportCategory =
  | "account"
  | "checklist"
  | "document"
  | "housing"
  | "partner"
  | "scam"
  | "other";

export interface SupportTicket {
  id: string;
  category: SupportCategory;
  description: string;
  email: string;
  createdAt: string;
  status: "open" | "resolved";
}

// ===== Admin =====
export interface AdminStats {
  totalUsers: number;
  onboardingCompletion: number;
  taskCompletionRate: number;
}


// ===== Budget =====
export interface BudgetItem {
  id: string;
  label: string;
  amount: number;
  category: string;
  type: 'income' | 'expense' | 'savings';
  color?: string;
}
