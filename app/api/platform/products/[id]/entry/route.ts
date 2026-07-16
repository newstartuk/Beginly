import { NextRequest, NextResponse } from "next/server";
import { requireApiActor, apiFailure, ApiAuthError } from "@/lib/platform/api-auth";
import { getProduct } from "@/lib/platform/catalog";
import { parseProductEntryInput } from "@/lib/contracts/platform";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    const { id } = await params; const product = getProduct(id);
    if (!product?.standalone) throw new ApiAuthError(404, "product_not_found", "Standalone product not found.");
    const { data, error } = await actor.supabase.from("product_entry_states").select("product_id,state,route_context,goal,context_notes,personalisation_consent,updated_at").eq("actor_id", actor.userId).eq("product_id", id).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ entry: data }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    const { id } = await params; const product = getProduct(id);
    if (!product?.standalone) throw new ApiAuthError(404, "product_not_found", "Standalone product not found.");
    const input = parseProductEntryInput(await request.json());
    const { data: grants, error: grantError } = await actor.supabase.from("entitlements").select("id").eq("actor_id", actor.userId).eq("product_id", id).lte("starts_at", new Date().toISOString()).or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`).limit(1);
    if (grantError) throw grantError;
    if (!grants?.length) throw new ApiAuthError(403, "product_access_required", "Activate this product before configuring its workspace.");
    const record = { actor_id: actor.userId, product_id: id, state: "active", route_context: input.routeContext, goal: input.goal, context_notes: input.contextNotes ?? null, personalisation_consent: input.personalisationConsent, last_idempotency_key: input.idempotencyKey, updated_at: new Date().toISOString() };
    if (actor.demo) return NextResponse.json({ entry: record }, { status: 200, headers: { "x-request-id": requestId } });
    const { data, error } = await actor.supabase.from("product_entry_states").upsert(record, { onConflict: "actor_id,product_id" }).select("product_id,state,route_context,goal,context_notes,personalisation_consent,updated_at").single();
    if (error) throw error;
    return NextResponse.json({ entry: data }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
