import { NextRequest, NextResponse } from "next/server";
import { parseConversionClaimAdminMutationInput } from "@/lib/contracts/platform";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";
import { requireAdminRole } from "@/lib/platform/admin-operations";
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    await requireAdminRole(actor, ["finance_admin"]);
    const { id } = await params; const input = parseConversionClaimAdminMutationInput(await request.json());
    const state = input.decision === "confirm" ? "provider_confirmed" : "rejected";
    if (actor.demo) return NextResponse.json({ updated: true, state }, { headers: { "x-request-id": requestId } });
    const { data: before, error: readError } = await actor.supabase.from("conversion_claims").select("state,action_session_id,claimed_outcome").eq("id", id).maybeSingle();
    if (readError || !before) return NextResponse.json({ error: { code: "claim_not_found", message: "Conversion claim not found.", requestId } }, { status: 404 });
    const confirmedAt = input.decision === "confirm" ? new Date().toISOString() : null;
    const { error } = await actor.supabase.from("conversion_claims").update({ state, confirmed_at: confirmedAt, evidence: { admin_note: input.note, reviewed_by: actor.userId, request_id: requestId } }).eq("id", id);
    if (error) throw error;
    await Promise.all([
      actor.supabase.from("opportunity_action_sessions").update({ session_state: state, updated_at: new Date().toISOString() }).eq("id", before.action_session_id),
      actor.supabase.from("audit_events").insert({ actor_user_id: actor.userId, actor_type: "administrator", action: `conversion_claim_${input.decision}`, target_type: "conversion_claim", target_id: id, before_state: before, after_state: { state, confirmed_at: confirmedAt, note: input.note }, request_id: requestId }),
    ]);
    return NextResponse.json({ updated: true, state }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
