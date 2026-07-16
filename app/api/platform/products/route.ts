import { NextRequest, NextResponse } from "next/server";
import { loadPlatformContext } from "@/lib/platform/context";
import { productCoverage } from "@/lib/platform/entitlements";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";
export async function GET(request: NextRequest){let requestId:string|undefined;try{const actor=await requireApiActor(request);requestId=actor.requestId;const context=await loadPlatformContext(actor.userId,actor.supabase);return NextResponse.json({products:productCoverage(context)},{headers:{"x-request-id":requestId}});}catch(error){return apiFailure(error,requestId);}}
