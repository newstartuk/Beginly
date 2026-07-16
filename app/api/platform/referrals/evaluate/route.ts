import { NextRequest, NextResponse } from "next/server";
import { apiFailure, requireApiActor } from "@/lib/platform/api-auth";
import { requireAdminRole } from "@/lib/platform/admin-operations";
import { decideAttribution } from "@/lib/platform/referrals";
import type { ConversionClaim, ReferralTouch } from "@/lib/platform/types";

export async function POST(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    await requireAdminRole(actor, ["finance_admin"]);
    const body = await request.json().catch(() => ({})) as { touches?: ReferralTouch[]; claim?: ConversionClaim };
    if (!body.claim) return NextResponse.json({ error: { code: "claim_required", message: "A conversion claim is required.", requestId } }, { status: 400, headers: { "x-request-id": requestId } });
    return NextResponse.json(decideAttribution(body.touches ?? [], body.claim), { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
