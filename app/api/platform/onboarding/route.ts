import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { parseOnboardingInput } from "@/lib/contracts/platform";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";

function verifiedReferralTouch(raw: string | undefined): string | undefined {
  const secret = process.env.BEGINLY_REFERRAL_SIGNING_SECRET?.trim();
  if (!raw || !secret) return undefined;
  const [touchId, signature] = raw.split(".");
  if (!touchId || !/^[0-9a-f-]{36}$/i.test(touchId) || !signature) return undefined;
  const expected = createHmac("sha256", secret).update(touchId).digest("base64url");
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes) ? touchId : undefined;
}

async function activateReferral(touchId: string, userId: string): Promise<{ completed: boolean; activated: boolean }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) return { completed: false, activated: false };
  const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await service.rpc("beginly_activate_user_referral", { touch: touchId, activated_actor: userId });
  return error ? { completed: false, activated: false } : { completed: true, activated: data === true };
}

export async function GET(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    if (actor.demo) return NextResponse.json({ state: { route_code: "student", city: "Leeds", primary_goal: "Build career readiness", personalisation_consent: true, current_step: 1, state: "draft" } }, { headers: { "x-request-id": requestId } });
    const { data, error } = await actor.supabase.from("onboarding_states").select("*").eq("user_id", actor.userId).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ state: data }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}

export async function POST(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    const input = parseOnboardingInput(await request.json());
    if (actor.demo) return NextResponse.json({ saved: true, complete: input.complete, preview: input }, { headers: { "x-request-id": requestId } });

    const now = new Date().toISOString();
    const { data: { user } } = await actor.supabase.auth.getUser();
    const displayName = typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : (user?.email?.split("@")[0] ?? "Beginly member");
    const profileWrite = await actor.supabase.from("user_profiles").upsert({ id: actor.userId, display_name: displayName, updated_at: now }, { onConflict: "id" });
    if (profileWrite.error) throw profileWrite.error;

    const { data: member, error: memberLookupError } = await actor.supabase.from("household_members").select("id,household_id").eq("user_id", actor.userId).limit(1).maybeSingle();
    if (memberLookupError) throw memberLookupError;
    let householdId = member?.household_id as string | undefined;
    if (!householdId) {
      const { data: household, error: householdError } = await actor.supabase.from("households").insert({ name: "My household", created_by: actor.userId }).select("id").single();
      if (householdError) throw householdError;
      householdId = household.id;
      const { error: memberError } = await actor.supabase.from("household_members").insert({ household_id: householdId, user_id: actor.userId, display_name: displayName, role: "primary", age_band: "adult", route: input.route, private_workspace: true, invitation_status: "not_required" });
      if (memberError) throw memberError;
    }

    const { data: activeProfile, error: activeProfileError } = await actor.supabase.from("migration_profiles").select("id").eq("user_id", actor.userId).is("effective_to", null).maybeSingle();
    if (activeProfileError) throw activeProfileError;
    const profileResult = activeProfile
      ? await actor.supabase.from("migration_profiles").update({ household_id: householdId, current_route: input.route, current_stage: "settling", city: input.city, updated_at: now }).eq("id", activeProfile.id)
      : await actor.supabase.from("migration_profiles").insert({ user_id: actor.userId, household_id: householdId, current_route: input.route, current_stage: "settling", city: input.city });
    if (profileResult.error) throw profileResult.error;

    const { data: existingGoal, error: goalLookupError } = await actor.supabase.from("goals").select("id").eq("owner_user_id", actor.userId).eq("label", input.goal).eq("status", "active").maybeSingle();
    if (goalLookupError) throw goalLookupError;
    if (!existingGoal) {
      const { error } = await actor.supabase.from("goals").insert({ owner_user_id: actor.userId, household_id: householdId, label: input.goal, horizon: "now", status: "active", priority: 1 });
      if (error) throw error;
    }

    const { error: prefError } = await actor.supabase.from("user_preferences").upsert({ user_id: actor.userId, personalisation_enabled: input.personalisationConsent, updated_at: now }, { onConflict: "user_id" });
    if (prefError) throw prefError;
    const { error: stateError } = await actor.supabase.from("onboarding_states").upsert({ user_id: actor.userId, current_step: input.complete ? 3 : 2, route_code: input.route, city: input.city, primary_goal: input.goal, personalisation_consent: input.personalisationConsent, state: input.complete ? "complete" : "draft", completed_at: input.complete ? now : null, updated_at: now }, { onConflict: "user_id" });
    if (stateError) throw stateError;

    let referralActivated = false;
    let clearReferralCookie = false;
    if (input.complete) {
      const consentResult = await actor.supabase.from("consent_records").insert({ user_id: actor.userId, purpose_code: "adaptive_personalisation", policy_version: "beginly-v1.2", state: input.personalisationConsent ? "granted" : "withdrawn", evidence: { source: "onboarding", request_id: requestId } });
      if (consentResult.error) throw consentResult.error;
      const lifeEventResult = await actor.supabase.from("life_events").upsert({ user_id: actor.userId, household_id: householdId, event_type: "onboarding_completed", occurred_at: now, facts: { route: input.route, city: input.city }, provenance: { request_id: requestId }, idempotency_key: `onboarding:${actor.userId}:v1.2` }, { onConflict: "idempotency_key", ignoreDuplicates: true });
      if (lifeEventResult.error) throw lifeEventResult.error;
      const referralTouch = verifiedReferralTouch(request.cookies.get("beginly_referral_touch")?.value);
      if (referralTouch) {
        const activation = await activateReferral(referralTouch, actor.userId);
        referralActivated = activation.activated;
        clearReferralCookie = activation.completed;
      }
    }

    const response = NextResponse.json({ saved: true, complete: input.complete, redirect: input.complete ? "/platform" : undefined, referralActivated }, { headers: { "x-request-id": requestId } });
    if (clearReferralCookie) response.cookies.set("beginly_referral_touch", "", { maxAge: 0, path: "/", httpOnly: true, sameSite: "lax" });
    return response;
  } catch (error) { return apiFailure(error, requestId); }
}
