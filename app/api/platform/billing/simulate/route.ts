import { NextRequest, NextResponse } from "next/server";
import { activeProductIds, applyBillingEvent, emptyBillingState } from "@/lib/platform/billing";
import type { BillingEvent } from "@/lib/platform/types";
import { apiFailure, requireApiActor } from "@/lib/platform/api-auth";
import { requireAdminRole } from "@/lib/platform/admin-operations";
export async function POST(request: NextRequest){let requestId:string|undefined;try{const actor=await requireApiActor(request);requestId=actor.requestId;if(!actor.demo)await requireAdminRole(actor,["finance_admin"]);const body=await request.json().catch(()=>({})) as {events?:BillingEvent[]};let state=emptyBillingState(actor.userId);for(const event of body.events??[])state=applyBillingEvent(state,{...event,actorId:actor.userId});return NextResponse.json({state,activeProductIds:activeProductIds(state)},{headers:{"x-request-id":requestId}});}catch(error){return apiFailure(error,requestId);}}
