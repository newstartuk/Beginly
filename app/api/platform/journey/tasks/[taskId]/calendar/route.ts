import { NextRequest, NextResponse } from "next/server";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";
import { loadPlatformContext } from "@/lib/platform/context";
import { buildJourney } from "@/lib/platform/journey";
import { journeyTaskCalendar, journeyTaskCalendarDetails } from "@/lib/platform/calendar";

export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request);
    requestId = actor.requestId;
    const { taskId } = await params;
    const context = await loadPlatformContext(actor.userId, actor.supabase);
    const task = buildJourney(context).tasks.find((item) => item.id === taskId);
    if (!task) return NextResponse.json({ error: { code: "task_not_found", message: "This journey task is not available.", requestId } }, { status: 404 });
    if (request.nextUrl.searchParams.get("format") === "json") {
      return NextResponse.json({ taskId, ...journeyTaskCalendarDetails(task) }, { headers: { "cache-control": "private, no-store", "x-request-id": requestId } });
    }
    return new NextResponse(journeyTaskCalendar(task, actor.userId), {
      headers: {
        "content-type": "text/calendar; charset=utf-8",
        "content-disposition": `attachment; filename="beginly-${task.id}.ics"`,
        "cache-control": "private, no-store",
        "x-request-id": requestId,
      },
    });
  } catch (error) {
    return apiFailure(error, requestId);
  }
}
