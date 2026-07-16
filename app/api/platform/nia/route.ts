import { NextRequest, NextResponse } from "next/server";
import { loadPlatformContext } from "@/lib/platform/context";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";
import { enforceRateLimit } from "@/lib/platform/rate-limit";
import { orchestrateNia } from "@/lib/platform/nia-orchestrator";
import { loadStandaloneProductContext } from "@/lib/platform/product-entry";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request);
    requestId = actor.requestId;
    const limit = enforceRateLimit(`nia:${actor.userId}`, Number(process.env.NIA_RATE_LIMIT_PER_MINUTE ?? 20), 60_000);
    const body = await request.json().catch(() => ({})) as { message?: string; conversationId?: string; idempotencyKey?: string; productId?: string };
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 4_000) : "";
    if (!message) return NextResponse.json({ error: { code: "message_required", message: "Ask Nia a question.", requestId } }, { status: 400 });
    const context = body.productId
      ? await loadStandaloneProductContext(actor.userId, body.productId, actor.supabase)
      : await loadPlatformContext(actor.userId, actor.supabase);
    const result = await orchestrateNia({ actor, context, message, conversationId: body.conversationId, idempotencyKey: body.idempotencyKey });
    return NextResponse.json(result, { headers: { "x-request-id": requestId, "x-ratelimit-limit": String(limit.limit), "x-ratelimit-remaining": String(limit.remaining), "x-ratelimit-reset": limit.resetAt } });
  } catch (error) {
    return apiFailure(error, requestId);
  }
}
