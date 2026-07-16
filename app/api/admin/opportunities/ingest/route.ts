import { NextRequest, NextResponse } from "next/server";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";
import { runOpportunityIngestion } from "@/lib/platform/opportunity-ingestion";
export async function POST(request: NextRequest) { let requestId: string | undefined; try { const actor = await requireApiActor(request); requestId = actor.requestId; const result = await runOpportunityIngestion(actor); return NextResponse.json(result, { headers: { "x-request-id": requestId } }); } catch (error) { return apiFailure(error, requestId); } }
