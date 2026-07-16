import type { ApiActor } from "./api-auth";
import { ApiAuthError } from "./api-auth";
import { requireAdminRole } from "./admin-operations";
import { recordPlatformEvent } from "./observability";

export const OPERATIONAL_WORK_TYPES = ["support","data_rights","opportunity_actions","conversion_claims","content","domains","incidents","providers","ingestion","reconciliation"] as const;
export type OperationalWorkType = typeof OPERATIONAL_WORK_TYPES[number];

export function defaultDueAt(workType: OperationalWorkType, priority: string, now = Date.now()): string {
  const hours = priority === "urgent" ? 2 : priority === "high" ? 8 : workType === "data_rights" ? 72 : workType === "support" ? 24 : 48;
  return new Date(now + hours * 3_600_000).toISOString();
}

export async function mutateOperationalWork(actor: ApiActor, input: { workType: OperationalWorkType; workId: string; action: "assign"|"unassign"|"note"|"set_priority"|"set_due"; note?: string; priority?: "low"|"normal"|"high"|"urgent"; dueAt?: string }) {
  await requireAdminRole(actor, ["content_admin","support_admin","finance_admin","partner_admin"]);
  if (!OPERATIONAL_WORK_TYPES.includes(input.workType)) throw new ApiAuthError(400,"invalid_work_type","Unsupported operational work type.");
  if (actor.demo) return { updated: true, ...input, assignedTo: input.action === "assign" ? actor.userId : undefined };
  if (input.action === "note") {
    if (!input.note?.trim()) throw new ApiAuthError(400,"note_required","An operational note is required.");
    const { data, error } = await actor.supabase.from("operational_notes").insert({ work_type: input.workType, work_id: input.workId, author_user_id: actor.userId, note: input.note.trim().slice(0,4_000), visibility: "internal" }).select("*").single();
    if (error) throw error;
    await actor.supabase.from("audit_events").insert({ actor_user_id: actor.userId, actor_type: "admin", action: "operational_note_added", target_type: input.workType, target_id: input.workId, after_state: { noteId: data.id }, request_id: actor.requestId, occurred_at: new Date().toISOString() });
    return { updated: true, note: data };
  }
  const { data: current } = await actor.supabase.from("operational_assignments").select("*").eq("work_type",input.workType).eq("work_id",input.workId).maybeSingle();
  const priority = input.priority ?? current?.priority ?? "normal";
  const dueAt = input.dueAt ?? current?.due_at ?? defaultDueAt(input.workType,priority);
  if (input.action === "set_due" && (!input.dueAt || Number.isNaN(Date.parse(input.dueAt)))) throw new ApiAuthError(400,"invalid_due_at","A valid due date is required.");
  const next = { work_type: input.workType, work_id: input.workId, assigned_to: input.action === "unassign" ? null : input.action === "assign" ? actor.userId : current?.assigned_to, assigned_by: actor.userId, priority, due_at: dueAt, state: input.action === "unassign" ? "unassigned" : "assigned", updated_at: new Date().toISOString() };
  const { data, error } = await actor.supabase.from("operational_assignments").upsert(next,{onConflict:"work_type,work_id"}).select("*").single();
  if (error) throw error;
  await actor.supabase.from("audit_events").insert({ actor_user_id: actor.userId, actor_type: "admin", action: `operational_${input.action}`, target_type: input.workType, target_id: input.workId, before_state: current, after_state: data, request_id: actor.requestId, occurred_at: new Date().toISOString() });
  await recordPlatformEvent({level:"info",category:"operations",message:`Operational ${input.action}`,actorId:actor.userId,requestId:actor.requestId,metadata:{workType:input.workType,workId:input.workId}});
  return { updated: true, assignment: data };
}
