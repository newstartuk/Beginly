import { NextRequest, NextResponse } from "next/server";
import { requireApiActor, apiFailure, ApiAuthError } from "@/lib/platform/api-auth";
import { proposeNiaTool } from "@/lib/platform/nia-tools";
import { NIA_TOOL_POLICIES, type NiaToolCode } from "@/lib/platform/nia-policy";

export async function POST(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const toolCode = typeof body.toolCode === "string" ? body.toolCode as NiaToolCode : undefined;
    if (!toolCode || !(toolCode in NIA_TOOL_POLICIES)) throw new ApiAuthError(400, "invalid_tool", "A supported Nia tool is required.");
    if (typeof body.conversationId !== "string" || typeof body.idempotencyKey !== "string") throw new ApiAuthError(400, "invalid_tool_proposal", "Conversation and idempotency identifiers are required.");
    const proposal = await proposeNiaTool(actor, { conversationId: body.conversationId, toolCode, payload: body.payload && typeof body.payload === "object" && !Array.isArray(body.payload) ? body.payload as Record<string, unknown> : {}, idempotencyKey: body.idempotencyKey.slice(0, 180) });
    return NextResponse.json(proposal, { status: 201, headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
