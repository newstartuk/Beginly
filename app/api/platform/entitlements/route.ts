import { NextRequest, NextResponse } from "next/server";
import { loadPlatformContext } from "@/lib/platform/context";
import { resolveEntitlements } from "@/lib/platform/entitlements";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";
export async function GET(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    const context = await loadPlatformContext(actor.userId, actor.supabase);
    const resolvedCapabilities = resolveEntitlements(context);
    return NextResponse.json({ resolvedCapabilities, capabilities: resolvedCapabilities }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
