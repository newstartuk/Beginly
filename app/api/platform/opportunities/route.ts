import { NextRequest, NextResponse } from "next/server";
import { loadPlatformContext } from "@/lib/platform/context";
import { rankOpportunities } from "@/lib/platform/opportunities";
import { loadAvailableOpportunities } from "@/lib/platform/opportunity-source";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";

export async function GET(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    const [context, opportunities] = await Promise.all([
      loadPlatformContext(actor.userId, actor.supabase),
      loadAvailableOpportunities(actor.supabase, actor.demo),
    ]);
    return NextResponse.json({ opportunities: rankOpportunities(context, opportunities) }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
