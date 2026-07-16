import { NextRequest, NextResponse } from "next/server";
import { EVIDENCE_RECORDS } from "@/lib/platform/evidence";
import { apiFailure, requireApiActor } from "@/lib/platform/api-auth";
export async function GET(request:NextRequest){let requestId:string|undefined;try{const actor=await requireApiActor(request);requestId=actor.requestId;return NextResponse.json({records:EVIDENCE_RECORDS},{headers:{"x-request-id":requestId}});}catch(error){return apiFailure(error,requestId);}}
