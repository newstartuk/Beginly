import { NextRequest, NextResponse } from "next/server";
import { apiFailure, requireApiActor } from "@/lib/platform/api-auth";

const normalise = (row: Record<string, unknown>) => {
  const payload = row.payload && typeof row.payload === "object" ? row.payload as Record<string, unknown> : {};
  const actionUrl = typeof row.action_url === "string" && row.action_url.startsWith("/") ? row.action_url : undefined;
  return {
    id: String(row.id),
    title: typeof payload.title === "string" ? payload.title : String(row.template_code ?? "Beginly update"),
    message: typeof payload.message === "string" ? payload.message : "A Beginly update is available.",
    channel: String(row.channel ?? "in_app"),
    state: String(row.state ?? "delivered"),
    actionUrl,
    readAt: row.read_at ? String(row.read_at) : null,
    archivedAt: row.archived_at ? String(row.archived_at) : null,
    createdAt: String(row.created_at ?? row.scheduled_at ?? new Date().toISOString()),
  };
};

export async function GET(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    if (actor.demo) {
      const notifications = [{ id: "demo-notification", title: "Career preparation is becoming relevant", message: "Your next journey horizon now includes graduate readiness.", channel: "in_app", state: "delivered", actionUrl: "/journey", readAt: null, archivedAt: null, createdAt: new Date().toISOString() }];
      return NextResponse.json({ notifications, unreadCount: 1 }, { headers: { "x-request-id": requestId } });
    }
    const { data, error } = await actor.supabase.from("notification_outbox")
      .select("id,channel,template_code,payload,state,scheduled_at,delivered_at,created_at,read_at,archived_at,action_url")
      .eq("user_id", actor.userId).is("archived_at", null).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    const notifications = (data ?? []).map((row) => normalise(row as Record<string, unknown>));
    return NextResponse.json({ notifications, unreadCount: notifications.filter((item) => !item.readAt).length }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
