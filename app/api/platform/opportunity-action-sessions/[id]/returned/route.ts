import { NextRequest, NextResponse } from "next/server";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let requestId: string | undefined;
  try { const actor=await requireApiActor(request); requestId=actor.requestId; const {id}=await params; const body=await request.json().catch(()=>({})) as {returnType?:string;idempotencyKey?:string;metadata?:Record<string,unknown>};
    const returnType=["deep_link","dismissed","manual_return","external_return"].includes(body.returnType ?? "")?body.returnType:"manual_return";
    const key=typeof body.idempotencyKey==="string"?body.idempotencyKey:`return:${id}:${returnType}`;
    if(!actor.demo){const {data:session}=await actor.supabase.from("opportunity_action_sessions").select("user_id").eq("id",id).maybeSingle();if(!session||session.user_id!==actor.userId)return NextResponse.json({error:{code:"not_found",message:"Action session not found.",requestId}},{status:404});await Promise.all([actor.supabase.from("browser_return_events").upsert({action_session_id:id,user_id:actor.userId,return_type:returnType,metadata:body.metadata??{},idempotency_key:key},{onConflict:"idempotency_key",ignoreDuplicates:true}),actor.supabase.from("opportunity_action_sessions").update({session_state:returnType==="dismissed"?"dismissed":"returned",returned_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",id)]);}return NextResponse.json({recorded:true,state:returnType==="dismissed"?"dismissed":"returned"},{headers:{"x-request-id":requestId}});
  } catch(error){return apiFailure(error,requestId);} }
