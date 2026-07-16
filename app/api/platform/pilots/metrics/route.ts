import { NextRequest, NextResponse } from "next/server";
import { calculatePilotMetrics } from "@/lib/platform/pilots";
import type { PilotEvent } from "@/lib/platform/types";
import { apiFailure, requireApiActor } from "@/lib/platform/api-auth";
import { requireAdminRole } from "@/lib/platform/admin-operations";
export async function POST(request:NextRequest){let requestId:string|undefined;try{const actor=await requireApiActor(request);requestId=actor.requestId;if(!actor.demo)await requireAdminRole(actor,["platform_admin"]);const body=await request.json().catch(()=>({})) as {events?:PilotEvent[]};return NextResponse.json(calculatePilotMetrics(body.events??[]),{headers:{"x-request-id":requestId}});}catch(error){return apiFailure(error,requestId);}}
