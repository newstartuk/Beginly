import { NextRequest, NextResponse } from "next/server";
import { parseNotificationMutationInput } from "@/lib/contracts/platform";
import { apiFailure, requireApiActor } from "@/lib/platform/api-auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    const { id } = await params;
    const input = parseNotificationMutationInput(await request.json());
    if (!actor.demo) {
      const update = input.action === "archive" ? { archived_at: new Date().toISOString(), read_at: new Date().toISOString() }
        : input.action === "read" ? { read_at: new Date().toISOString(), archived_at: null }
          : { read_at: null, archived_at: null };
      const { data, error } = await actor.supabase.from("notification_outbox").update(update).eq("id", id).eq("user_id", actor.userId).select("id").maybeSingle();
      if (error) throw error;
      if (!data) return NextResponse.json({ error: { code: "notification_not_found", message: "Notification not found.", requestId } }, { status: 404, headers: { "x-request-id": requestId } });
    }
    return NextResponse.json({ updated: true, action: input.action }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
