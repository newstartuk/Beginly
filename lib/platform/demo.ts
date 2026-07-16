import type { EntitlementGrant, UserContext } from "./types";

const now = new Date().toISOString();
const inOneYear = new Date(Date.now() + 365 * 86_400_000).toISOString();

const grants: EntitlementGrant[] = [
  {
    id: "grant-free-demo",
    actorId: "demo-user",
    source: "free_core",
    scope: "individual",
    productId: "free_os",
    startsAt: now,
  },
  {
    id: "grant-sponsored-cv",
    actorId: "demo-user",
    memberId: "member-primary",
    source: "sponsor",
    scope: "individual",
    productId: "cv_studio",
    startsAt: now,
    endsAt: inOneYear,
    conditions: { sponsor: "Northshire University", cohort: "2026 Career Launch" },
  },
  {
    id: "grant-family",
    actorId: "demo-household",
    source: "household",
    scope: "household",
    productId: "family_workspace",
    startsAt: now,
    endsAt: inOneYear,
  },
];

export const DEMO_CONTEXT: UserContext = {
  actorId: "demo-user",
  displayName: "Tunde",
  householdId: "demo-household",
  activeMemberId: "member-primary",
  route: "student",
  stage: "career_preparation",
  city: "Leeds",
  arrivalDate: "2025-09-18",
  course: "MSc Project Management",
  occupation: "Student and aspiring project coordinator",
  goals: [
    { id: "goal-settle", label: "Complete essential settlement actions", horizon: "now", status: "active" },
    { id: "goal-experience", label: "Build UK project experience", horizon: "next_90_days", status: "active" },
    { id: "goal-job", label: "Secure a project delivery role", horizon: "next_year", targetDate: "2027-02-01", status: "active" },
    { id: "goal-sponsor", label: "Become sponsorship-ready", horizon: "long_term", status: "active" },
  ],
  profileFacts: [
    { key: "english_level", value: "advanced", confidence: 1, source: "user", updatedAt: now },
    { key: "private_rental", value: true, confidence: 1, source: "user", updatedAt: now },
    { key: "graduation_date", value: "2026-12-15", confidence: 0.95, source: "user", updatedAt: now },
    { key: "work_interest", value: true, confidence: 1, source: "user", updatedAt: now },
  ],
  householdMembers: [
    { id: "member-primary", displayName: "Tunde", role: "primary", ageBand: "adult", route: "student", privateWorkspace: true, isActor: true },
    { id: "member-partner", displayName: "Partner", role: "partner", ageBand: "adult", route: "family_dependant", privateWorkspace: true },
    { id: "member-child", displayName: "Child", role: "child", ageBand: "child", privateWorkspace: false },
  ],
  grants,
  completedTaskIds: ["common-identity", "common-gp", "student-enrolment", "common-bank"],
  taskStates: Object.fromEntries(["common-identity", "common-gp", "student-enrolment", "common-bank"].map((id) => [id, { state: "complete" as const }])),
  dismissedRecommendationIds: [],
  proofPoints: 1850,
  promotionPreference: "contextual",
  aiConsent: true,
  locationConsent: true,
};

export const demoContextForRoute = (route: UserContext["route"]): UserContext => ({
  ...DEMO_CONTEXT,
  route,
  stage: route === "graduate" ? "transition" : route === "founder" ? "progression" : DEMO_CONTEXT.stage,
  course: route === "student" ? DEMO_CONTEXT.course : undefined,
  occupation: route === "health_care" ? "Senior Healthcare Assistant" : DEMO_CONTEXT.occupation,
});
