import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireApiActor, apiFailure, ApiAuthError } from "@/lib/platform/api-auth";

function privilegedClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new ApiAuthError(503, "household_acceptance_not_configured", "Household invitation acceptance is not configured.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    const { token } = await params;
    const body = await request.json().catch(() => ({})) as { decision?: string };
    const decision = body.decision === "decline" ? "declined" : "accepted";
    if (actor.demo) return NextResponse.json({ responded: true, state: decision }, { headers: { "x-request-id": requestId } });
    if (!actor.email) throw new ApiAuthError(409, "verified_email_required", "A verified account email is required to respond to this invitation.");
    const admin = privilegedClient();
    const hash = createHash("sha256").update(token).digest("hex");
    const { data: invitation, error } = await admin.from("household_invitations").select("*").eq("token_hash", hash).maybeSingle();
    if (error) throw error;
    if (!invitation || invitation.state !== "pending") return NextResponse.json({ error: { code: "invitation_unavailable", message: "This invitation is no longer available.", requestId } }, { status: 404 });
    if (new Date(invitation.expires_at).getTime() <= Date.now()) {
      await admin.from("household_invitations").update({ state: "expired", responded_at: new Date().toISOString() }).eq("id", invitation.id);
      return NextResponse.json({ error: { code: "invitation_expired", message: "This invitation has expired.", requestId } }, { status: 410 });
    }
    if (String(invitation.invited_email).toLowerCase() !== actor.email.toLowerCase()) throw new ApiAuthError(403, "invitation_email_mismatch", "Sign in with the email address that received this invitation.");
    if (decision === "accepted") {
      const { error: memberError } = await admin.from("household_members").upsert({
        household_id: invitation.household_id,
        user_id: actor.userId,
        display_name: invitation.display_name,
        role: invitation.role,
        age_band: "adult",
        route: invitation.route_code,
        private_workspace: true,
        invitation_status: "accepted",
        invited_email: invitation.invited_email,
      }, { onConflict: "household_id,user_id" });
      if (memberError) throw memberError;
    }
    const { error: updateError } = await admin.from("household_invitations").update({ state: decision, responded_at: new Date().toISOString() }).eq("id", invitation.id);
    if (updateError) throw updateError;
    await admin.from("audit_events").insert({ actor_user_id: actor.userId, actor_type: "user", action: `household_invitation_${decision}`, target_type: "household_invitation", target_id: invitation.id, request_id: requestId });
    return NextResponse.json({ responded: true, state: decision, householdId: decision === "accepted" ? invitation.household_id : undefined }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
