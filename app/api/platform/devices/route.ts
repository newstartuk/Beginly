import { NextRequest, NextResponse } from "next/server";
import { parseDeviceRegistrationInput } from "@/lib/contracts/platform";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";
import { encryptDeviceToken, hashDeviceToken } from "@/lib/platform/device-tokens";

export async function GET(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    if (actor.demo) return NextResponse.json({ devices: [] }, { headers: { "x-request-id": requestId } });
    const { data, error } = await actor.supabase.from("device_registrations").select("id,platform,state,preferences,last_seen_at,created_at,updated_at").eq("user_id", actor.userId).order("updated_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ devices: data ?? [] }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}

export async function POST(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    const input = parseDeviceRegistrationInput(await request.json());
    const tokenHash = hashDeviceToken(input.token);
    if (actor.demo) return NextResponse.json({ registered: true, device: { id: "demo-device", platform: input.platform, state: "active" } }, { status: 201, headers: { "x-request-id": requestId } });
    const { data, error } = await actor.supabase.from("device_registrations").upsert({
      user_id: actor.userId,
      platform: input.platform,
      token_hash: tokenHash,
      provider_token_ciphertext: encryptDeviceToken(input.token),
      token_version: "v1",
      state: "active",
      preferences: { reminders_enabled: input.remindersEnabled },
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "token_hash" }).select("id,platform,state,preferences,last_seen_at,created_at,updated_at").single();
    if (error) throw error;
    return NextResponse.json({ registered: true, device: data }, { status: 201, headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}

export async function DELETE(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    const tokenHash = request.nextUrl.searchParams.get("tokenHash");
    if (actor.demo) return NextResponse.json({ disabled: true }, { headers: { "x-request-id": requestId } });
    let query = actor.supabase.from("device_registrations").update({ state: "disabled", updated_at: new Date().toISOString() }).eq("user_id", actor.userId);
    if (tokenHash) query = query.eq("token_hash", tokenHash);
    const { error } = await query;
    if (error) throw error;
    return NextResponse.json({ disabled: true }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
