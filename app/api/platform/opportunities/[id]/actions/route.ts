import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { parseOpportunityActionInput } from "@/lib/contracts/platform";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";
import { loadPlatformContext } from "@/lib/platform/context";
import { disclosureRequired, isHostAllowed, normaliseDestination, signOpportunityAction, tokenHash } from "@/lib/platform/opportunity-browser";
import { scoreOpportunity } from "@/lib/platform/opportunities";
import { loadAvailableOpportunity } from "@/lib/platform/opportunity-source";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    const { id } = await params;
    const input = parseOpportunityActionInput(await request.json());
    const context = await loadPlatformContext(actor.userId, actor.supabase);
    const opportunity = await loadAvailableOpportunity(actor.supabase, actor.demo, id);
    if (!opportunity) return NextResponse.json({ error: { code: "opportunity_not_found", message: "This opportunity is no longer available.", requestId } }, { status: 404 });
    const score = scoreOpportunity(opportunity, context);
    if (!score.eligible) return NextResponse.json({ error: { code: "opportunity_not_eligible", message: "This opportunity is not currently suitable for this context.", requestId } }, { status: 403 });

    const interaction = { opportunity_id: id, user_id: actor.userId, interaction_type: input.action, idempotency_key: input.idempotencyKey, metadata: { note: input.note, request_id: requestId } };
    if (!actor.demo) {
      const { error } = await actor.supabase.from("opportunity_interactions").upsert(interaction, { onConflict: "idempotency_key", ignoreDuplicates: true });
      if (error) throw error;
    }

    if (!["view", "apply"].includes(input.action) || !opportunity.sourceUrl) {
      return NextResponse.json({ action: input.action, recorded: true, browserAvailable: false, message: opportunity.sourceUrl ? "Action recorded." : "Preparation saved. The provider destination is not activated yet." }, { headers: { "x-request-id": requestId } });
    }

    const required = disclosureRequired(opportunity.commercialStatus);
    if (required && !input.disclosureAccepted) {
      return NextResponse.json({ error: { code: "disclosure_required", message: "Review and accept the commercial disclosure before opening this destination.", requestId } }, { status: 409 });
    }

    const destination = normaliseDestination(opportunity.sourceUrl);
    if (!actor.demo) {
      const { data: policy, error } = await actor.supabase.from("outbound_link_policies").select("hostname,allow_subdomains,allowed_redirect_hosts,status").eq("hostname", destination.hostname).eq("status", "approved").maybeSingle();
      if (error || !isHostAllowed(destination.hostname, policy)) return NextResponse.json({ error: { code: "destination_not_approved", message: "This provider destination is awaiting Beginly trust review.", requestId } }, { status: 409 });
    }

    const sessionId = randomUUID();
    const expiresAt = Date.now() + 15 * 60_000;
    const token = signOpportunityAction({ version: 1, sessionId, userId: actor.userId, opportunityId: id, destinationUrl: destination.toString(), hostname: destination.hostname, commercialStatus: opportunity.commercialStatus, expiresAt });
    if (!actor.demo) {
      const { error } = await actor.supabase.from("opportunity_action_sessions").insert({
        id: sessionId, opportunity_id: id, user_id: actor.userId, action_type: input.action, destination_url: destination.toString(), destination_hostname: destination.hostname,
        commercial_status: opportunity.commercialStatus, disclosure_state: required ? "accepted" : "not_required", destination_mode: input.destinationMode ?? "in_app",
        session_state: "disclosed", signed_token_hash: tokenHash(token), idempotency_key: input.idempotencyKey, expires_at: new Date(expiresAt).toISOString(),
      });
      if (error) throw error;
    }
    const site = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    return NextResponse.json({ actionSessionId: sessionId, browserAvailable: true, browserUrl: new URL(`/r/${token}`, site).toString(), expiresAt: new Date(expiresAt).toISOString(), destination: { hostname: destination.hostname }, disclosure: { required, beginlyMayEarn: opportunity.commercialStatus === "commission_embedded" }, evidenceHash: createHash("sha256").update(`${id}:${actor.userId}:${requestId}`).digest("hex") }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
