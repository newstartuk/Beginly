import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DEMO_CONTEXT } from "./demo";
import { isExplicitDemoMode, PlatformContextUnavailableError } from "./runtime";
import type { EntitlementGrant, Goal, HouseholdMember, ProfileFact, UserContext } from "./types";

function serverClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new PlatformContextUnavailableError("Supabase server configuration is unavailable.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const freeGrant = (userId: string): EntitlementGrant => ({
  id: `free-core-${userId}`,
  actorId: userId,
  source: "free_core",
  scope: "individual",
  productId: "free_os",
  startsAt: new Date(0).toISOString(),
});

export async function loadPlatformContext(userId?: string, suppliedClient?: SupabaseClient): Promise<UserContext> {
  if (isExplicitDemoMode()) return { ...DEMO_CONTEXT, actorId: userId ?? DEMO_CONTEXT.actorId };
  if (!userId) throw new PlatformContextUnavailableError("An authenticated user is required.");

  const supabase = suppliedClient ?? serverClient();
  const [profileResult, userProfileResult, householdResult, goalsResult, grantsResult, taskStateResult, preferencesResult, pointsResult] = await Promise.all([
    supabase.from("migration_profiles").select("*").eq("user_id", userId).is("effective_to", null).maybeSingle(),
    supabase.from("user_profiles").select("display_name").eq("id", userId).maybeSingle(),
    supabase.from("household_members").select("*, households!inner(id)").eq("user_id", userId),
    supabase.from("goals").select("*").eq("owner_user_id", userId).eq("status", "active"),
    supabase.from("entitlements").select("*").eq("actor_id", userId),
    supabase.from("user_task_states").select("task_code,state,defer_until,note,evidence").eq("user_id", userId),
    supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("proofpoints_ledger").select("event_type,points,expires_at").eq("user_id", userId),
  ]);

  if (profileResult.error || !profileResult.data) {
    // migration_profiles row missing — fall back to legacy arrival_profiles (v1.x onboarding)
    const { data: arrival } = await supabase
      .from("arrival_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    const { data: legacyTaskRows } = await supabase
      .from("user_tasks")
      .select("task_id,status,completed_at")
      .eq("user_id", userId);
    if (!arrival) throw new PlatformContextUnavailableError("Complete onboarding before opening the adaptive platform.");
    const arrivalToRoute = (t: string): UserContext["route"] => {
      if (t === "international_student") return "student";
      if (t === "skilled_worker") return "skilled_worker";
      if (t === "family_visa") return "family_dependant";
      if (t === "graduate") return "graduate";
      if (t === "global_talent") return "global_talent";
      if (t === "health_and_care") return "health_care";
      return "student";
    };
    const arrivalToStage = (s: string): UserContext["stage"] => {
      if (s === "not_arrived") return "pre_arrival";
      if (s === "arriving_soon") return "arrival";
      return "settling";
    };
    const displayName = String((userProfileResult.data as Record<string, unknown> | null)?.display_name ?? "Beginly member");
    const route = arrivalToRoute(String((arrival as Record<string, unknown>).arrival_type ?? ""));
    const stage = arrivalToStage(String((arrival as Record<string, unknown>).status ?? ""));
    const taskStates = Object.fromEntries(
      (legacyTaskRows ?? []).map((row: Record<string, unknown>) => {
        const status = String(row.status ?? "not_started");
        return [
          String(row.task_id),
          {
            state: status === "complete" ? "complete" : "not_started",
            note: undefined,
            evidence: undefined,
          },
        ];
      }),
    );
    const completedTaskIds = (legacyTaskRows ?? [])
      .filter((row: Record<string, unknown>) => String(row.status ?? "") === "complete")
      .map((row: Record<string, unknown>) => String(row.task_id));
    return {
      actorId: userId, displayName, householdId: `personal-${userId}`, activeMemberId: userId,
      route, stage, city: String((arrival as Record<string, unknown>).city ?? ""),
      arrivalDate: (arrival as Record<string, unknown>).arrival_date ? String((arrival as Record<string, unknown>).arrival_date) : undefined,
      goals: [], profileFacts: [],
      householdMembers: [{ id: userId, displayName, role: "primary", ageBand: "adult", route, privateWorkspace: true, isActor: true }],
      grants: [freeGrant(userId)], completedTaskIds, taskStates, dismissedRecommendationIds: [],
      proofPoints: 0, promotionPreference: "contextual", aiConsent: true, locationConsent: false,
    };
  }
  const profile = profileResult.data as Record<string, unknown>;
  const householdRows = (householdResult.data ?? []) as Array<Record<string, unknown>>;
  const activeHousehold = householdRows[0];
  const householdId = String((activeHousehold?.households as { id?: unknown } | undefined)?.id ?? profile.household_id ?? "");

  const [membersResult, factsResult] = await Promise.all([
    householdId ? supabase.from("household_members").select("*").eq("household_id", householdId) : Promise.resolve({ data: [], error: null }),
    supabase.from("profile_facts").select("*").eq("profile_id", String(profile.id)).is("superseded_at", null),
  ]);

  const displayName = String((userProfileResult.data as Record<string, unknown> | null)?.display_name ?? "Beginly member");
  let householdMembers: HouseholdMember[] = (membersResult.data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    displayName: String(row.display_name ?? "Household member"),
    role: (row.role as HouseholdMember["role"]) ?? "adult_dependant",
    ageBand: (row.age_band as HouseholdMember["ageBand"]) ?? "adult",
    route: row.route as HouseholdMember["route"],
    privateWorkspace: row.private_workspace !== false,
    isActor: String(row.user_id ?? "") === userId,
  }));
  if (!householdMembers.length) householdMembers = [{ id: userId, displayName, role: "primary", ageBand: "adult", route: profile.current_route as HouseholdMember["route"], privateWorkspace: true, isActor: true }];

  const goals: Goal[] = (goalsResult.data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id), label: String(row.label), horizon: row.horizon as Goal["horizon"],
    targetDate: row.target_date ? String(row.target_date) : undefined, status: row.status as Goal["status"],
  }));
  const profileFacts: ProfileFact[] = (factsResult.data ?? []).map((row: Record<string, unknown>) => ({
    key: String(row.fact_key), value: row.fact_value as ProfileFact["value"], confidence: Number(row.confidence ?? 1),
    source: (row.source as ProfileFact["source"]) ?? "user", updatedAt: String(row.updated_at ?? new Date().toISOString()),
  }));
  const grants: EntitlementGrant[] = (grantsResult.data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id), actorId: String(row.actor_id), memberId: row.member_id ? String(row.member_id) : undefined,
    source: row.source as EntitlementGrant["source"], scope: row.scope as EntitlementGrant["scope"],
    productId: row.product_id ? String(row.product_id) : undefined, capabilityCode: row.capability_code ? String(row.capability_code) : undefined,
    startsAt: String(row.starts_at), endsAt: row.ends_at ? String(row.ends_at) : undefined,
    autonomyLevel: row.autonomy_level as EntitlementGrant["autonomyLevel"], quota: row.quota ? Number(row.quota) : undefined, used: Number(row.used ?? 0),
    conditions: row.conditions && typeof row.conditions === "object" ? row.conditions as Record<string, string | number | boolean> : undefined,
  }));
  const taskStates = Object.fromEntries((taskStateResult.data ?? []).map((row: Record<string, unknown>) => [String(row.task_code), {
    state: String(row.state) as "not_started" | "complete" | "deferred" | "irrelevant",
    deferUntil: row.defer_until ? String(row.defer_until) : undefined,
    note: row.note ? String(row.note) : undefined,
    evidence: row.evidence && typeof row.evidence === "object" ? row.evidence as Record<string, unknown> : undefined,
  }]));
  const completedTaskIds = Object.entries(taskStates).filter(([, value]) => value.state === "complete").map(([taskCode]) => taskCode);
  const prefs = preferencesResult.data as Record<string, unknown> | null;
  const proofPoints = (pointsResult.data ?? []).reduce((total: number, row: Record<string, unknown>) => {
    if (row.expires_at && new Date(String(row.expires_at)).getTime() <= Date.now()) return total;
    const points = Number(row.points ?? 0);
    return total + (["redeem", "reverse", "expire"].includes(String(row.event_type)) ? -Math.abs(points) : points);
  }, 0);

  return {
    actorId: userId,
    displayName,
    householdId: householdId || `personal-${userId}`,
    activeMemberId: householdMembers.find((member) => member.isActor)?.id ?? householdMembers.find((member) => member.role === "primary")?.id ?? householdMembers[0].id,
    route: (profile.current_route as UserContext["route"]) ?? "student",
    stage: (profile.current_stage as UserContext["stage"]) ?? "settling",
    city: String(profile.city ?? ""),
    arrivalDate: typeof (profile.route_extension as Record<string, unknown> | null)?.arrivalDate === "string" ? String((profile.route_extension as Record<string, unknown>).arrivalDate) : undefined,
    course: profileFacts.find((fact) => fact.key === "course")?.value as string | undefined,
    occupation: profileFacts.find((fact) => fact.key === "occupation")?.value as string | undefined,
    goals,
    profileFacts,
    householdMembers,
    grants: grants.length ? grants : [freeGrant(userId)],
    completedTaskIds,
    taskStates,
    dismissedRecommendationIds: [],
    proofPoints,
    promotionPreference: (prefs?.commercial_recommendation_mode as UserContext["promotionPreference"]) ?? "contextual",
    aiConsent: prefs?.personalisation_enabled !== false,
    locationConsent: prefs?.location_enabled === true,
  };
}
