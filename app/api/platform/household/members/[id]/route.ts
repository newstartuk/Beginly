import { NextRequest, NextResponse } from "next/server";
import { parseHouseholdMemberMutationInput } from "@/lib/contracts/platform";
import { requireApiActor, apiFailure, ApiAuthError } from "@/lib/platform/api-auth";
import { loadPlatformContext } from "@/lib/platform/context";

async function primaryAuthority(actor: Awaited<ReturnType<typeof requireApiActor>>, householdId: string) {
  if (actor.demo) return { id: "demo-primary", role: "primary" };
  const { data, error } = await actor.supabase.from("household_members").select("id,role").eq("household_id", householdId).eq("user_id", actor.userId).maybeSingle();
  if (error || !data || data.role !== "primary") throw new ApiAuthError(403, "household_primary_required", "Only the primary household member can make this change.");
  return data;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    const { id } = await params;
    const input = parseHouseholdMemberMutationInput(await request.json());
    const context = await loadPlatformContext(actor.userId, actor.supabase);
    const authority = await primaryAuthority(actor, context.householdId);
    if (actor.demo) return NextResponse.json({ updated: true, action: input.action, memberId: id }, { headers: { "x-request-id": requestId } });
    const { data: target, error: targetError } = await actor.supabase.from("household_members").select("id,role,user_id,age_band").eq("id", id).eq("household_id", context.householdId).maybeSingle();
    if (targetError || !target) return NextResponse.json({ error: { code: "member_not_found", message: "Household member not found.", requestId } }, { status: 404 });
    if (input.action === "transfer_primary") {
      if (id === authority.id || target.age_band !== "adult") throw new ApiAuthError(409, "invalid_primary_transfer", "Select another adult household member.");
      const { error } = await actor.supabase.rpc("beginly_transfer_household_primary", { household: context.householdId, new_primary_member: id });
      if (error) throw error;
    } else {
      if (target.role === "primary") throw new ApiAuthError(409, "primary_member_protected", "Transfer primary responsibility before changing this member.");
      const updates = input.action === "set_role"
        ? { role: input.role, updated_at: new Date().toISOString() }
        : { private_workspace: input.privateWorkspace ?? true, data_visibility: input.dataVisibility ?? {}, updated_at: new Date().toISOString() };
      const { error } = await actor.supabase.from("household_members").update(updates).eq("id", id).eq("household_id", context.householdId);
      if (error) throw error;
    }
    await actor.supabase.from("audit_events").insert({ actor_user_id: actor.userId, actor_type: "user", action: input.action, target_type: "household_member", target_id: id, request_id: requestId, after_state: input });
    return NextResponse.json({ updated: true, action: input.action, memberId: id }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    const { id } = await params;
    const context = await loadPlatformContext(actor.userId, actor.supabase);
    const authority = await primaryAuthority(actor, context.householdId);
    if (id === authority.id) throw new ApiAuthError(409, "primary_member_protected", "Transfer primary responsibility before leaving the household.");
    if (!actor.demo) {
      const { data: target } = await actor.supabase.from("household_members").select("role").eq("id", id).eq("household_id", context.householdId).maybeSingle();
      if (!target) return NextResponse.json({ error: { code: "member_not_found", message: "Household member not found.", requestId } }, { status: 404 });
      if (target.role === "primary") throw new ApiAuthError(409, "primary_member_protected", "Transfer primary responsibility before removing this member.");
      const { error } = await actor.supabase.from("household_members").delete().eq("id", id).eq("household_id", context.householdId);
      if (error) throw error;
      await actor.supabase.from("audit_events").insert({ actor_user_id: actor.userId, actor_type: "user", action: "household_member_removed", target_type: "household_member", target_id: id, request_id: requestId });
    }
    return NextResponse.json({ removed: true, memberId: id }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
