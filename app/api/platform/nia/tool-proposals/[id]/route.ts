import { NextRequest, NextResponse } from "next/server";
import { requireApiActor, apiFailure, ApiAuthError } from "@/lib/platform/api-auth";
import { decideNiaTool } from "@/lib/platform/nia-tools";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    const body = await request.json().catch(() => ({})) as { decision?: string };
    if (body.decision !== "approve" && body.decision !== "reject") throw new ApiAuthError(400, "invalid_decision", "Approve or reject the Nia action.");
    const { id } = await params;
    const proposal = await decideNiaTool(actor, id, body.decision);
    return NextResponse.json(proposal, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
