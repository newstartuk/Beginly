import { NextRequest, NextResponse } from "next/server";
import { parseTaskMutationInput } from "@/lib/contracts/platform";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";
import { loadPlatformContext } from "@/lib/platform/context";
import { buildJourney } from "@/lib/platform/journey";
import type { UserTaskState } from "@/lib/platform/types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request);
    requestId = actor.requestId;
    const { taskId } = await params;
    const input = parseTaskMutationInput(await request.json());
    const context = await loadPlatformContext(actor.userId, actor.supabase);
    const journey = buildJourney(context);
    if (!journey.tasks.some((task) => task.id === taskId)) return NextResponse.json({ error: { code: "task_not_found", message: "This journey task is not available.", requestId } }, { status: 404 });

    const current: UserTaskState = context.taskStates[taskId] ?? { state: context.completedTaskIds.includes(taskId) ? "complete" : "not_started" };
    const state: UserTaskState["state"] = input.action === "complete" ? "complete" : input.action === "reopen" ? "not_started" : input.action === "defer" ? "deferred" : input.action === "irrelevant" ? "irrelevant" : current.state;
    const nextTaskState: UserTaskState = {
      state,
      deferUntil: input.action === "defer" ? input.deferUntil : input.action === "note" ? current.deferUntil : undefined,
      note: input.note ?? current.note,
      evidence: input.evidence ? { ...(current.evidence ?? {}), ...input.evidence } : current.evidence,
    };
    if (!actor.demo) {
      const payload = {
        user_id: actor.userId,
        household_id: context.householdId.startsWith("personal-") ? null : context.householdId,
        task_code: taskId,
        state,
        defer_until: nextTaskState.deferUntil ?? null,
        note: nextTaskState.note ?? null,
        evidence: nextTaskState.evidence ?? {},
        last_idempotency_key: input.idempotencyKey,
        updated_at: new Date().toISOString(),
      };
      const { error } = await actor.supabase.from("user_task_states").upsert(payload, { onConflict: "user_id,task_code" });
      if (error) throw error;
    }
    const completedTaskIds = state === "complete"
      ? [...new Set([...context.completedTaskIds, taskId])]
      : context.completedTaskIds.filter((id) => id !== taskId);
    const nextContext = { ...context, completedTaskIds, taskStates: { ...context.taskStates, [taskId]: nextTaskState } };
    return NextResponse.json({ taskId, state, taskState: nextTaskState, journey: buildJourney(nextContext) }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    return apiFailure(error, requestId);
  }
}
