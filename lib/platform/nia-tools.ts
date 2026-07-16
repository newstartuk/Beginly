import { randomUUID } from "node:crypto";
import type { ApiActor } from "./api-auth";
import { ApiAuthError } from "./api-auth";
import { NIA_TOOL_POLICIES, type NiaToolCode } from "./nia-policy";
import { recordPlatformEvent } from "./observability";

export interface ToolProposalInput { conversationId: string; toolCode: NiaToolCode; payload: Record<string, unknown>; idempotencyKey: string }

export async function proposeNiaTool(actor: ApiActor, input: ToolProposalInput) {
  const policy = NIA_TOOL_POLICIES[input.toolCode];
  if (!policy || policy.risk === "prohibited") throw new ApiAuthError(403, "tool_prohibited", "Nia cannot perform this action.");
  if (actor.demo) return { id: `demo-tool-${randomUUID()}`, ...input, riskClass: policy.risk, approvalState: policy.approvalRequired ? "proposed" : "approved" };
  const { data: owned, error: ownedError } = await actor.supabase.from("nia_conversations").select("id").eq("id", input.conversationId).eq("user_id", actor.userId).maybeSingle();
  if (ownedError) throw ownedError;
  if (!owned) throw new ApiAuthError(404, "conversation_not_found", "The Nia conversation was not found.");
  const { data, error } = await actor.supabase.from("nia_tool_proposals").upsert({ conversation_id: input.conversationId, tool_code: input.toolCode, payload: input.payload, risk_class: policy.risk, approval_state: policy.approvalRequired ? "proposed" : "approved", idempotency_key: input.idempotencyKey }, { onConflict: "idempotency_key" }).select("*").single();
  if (error) throw error;
  return data;
}

async function execute(actor: ApiActor, toolCode: NiaToolCode, payload: Record<string, unknown>, idempotencyKey: string): Promise<Record<string, unknown>> {
  if (toolCode === "submit_application") throw new ApiAuthError(403, "tool_prohibited", "Beginly does not autonomously submit material applications.");
  if (toolCode === "purchase_product") return { state: "handoff_required", href: `/products/${String(payload.productId ?? "")}` };
  if (toolCode === "save_opportunity") {
    const opportunityId = String(payload.opportunityId ?? "");
    if (!opportunityId) throw new ApiAuthError(400, "opportunity_required", "An opportunity is required.");
    const { error } = await actor.supabase.from("opportunity_interactions").upsert({ user_id: actor.userId, opportunity_id: opportunityId, interaction_type: "saved", metadata: { source: "nia" } }, { onConflict: "user_id,opportunity_id,interaction_type" });
    if (error) throw error;
    return { state: "complete", opportunityId };
  }
  if (toolCode === "defer_task") {
    const taskId = String(payload.taskId ?? "");
    const deferUntil = String(payload.deferUntil ?? "");
    if (!taskId || Number.isNaN(Date.parse(deferUntil))) throw new ApiAuthError(400, "invalid_task_defer", "A task and valid defer date are required.");
    const { error } = await actor.supabase.from("user_task_states").upsert({ user_id: actor.userId, task_code: taskId, state: "deferred", defer_until: deferUntil, last_idempotency_key: idempotencyKey }, { onConflict: "user_id,task_code" });
    if (error) throw error;
    return { state: "complete", taskId, deferUntil };
  }
  if (toolCode === "create_reminder") {
    const title = String(payload.title ?? "Beginly reminder").slice(0, 160);
    const runAt = String(payload.runAt ?? new Date().toISOString());
    if (Number.isNaN(Date.parse(runAt))) throw new ApiAuthError(400, "invalid_reminder_time", "A valid reminder time is required.");
    const { error } = await actor.supabase.from("notification_outbox").upsert({ user_id: actor.userId, channel: "in_app", template_code: "nia_reminder", payload: { title, href: payload.href }, state: "queued", idempotency_key: idempotencyKey, scheduled_at: runAt }, { onConflict: "idempotency_key" });
    if (error) throw error;
    return { state: "queued", runAt };
  }
  if (toolCode === "create_support_case" || toolCode === "request_human_review") {
    const { data, error } = await actor.supabase.from("support_cases").upsert({ user_id: actor.userId, case_type: toolCode === "request_human_review" ? "professional_escalation" : String(payload.caseType ?? "support"), subject: String(payload.subject ?? "Nia support request").slice(0, 180), description: String(payload.description ?? "Requested through Nia").slice(0, 5_000), severity: String(payload.severity ?? "normal"), state: "open", idempotency_key: idempotencyKey }, { onConflict: "idempotency_key" }).select("id").single();
    if (error) throw error;
    return { state: "created", caseId: data.id };
  }
  throw new ApiAuthError(400, "unsupported_tool", "This Nia action is not supported.");
}

export async function decideNiaTool(actor: ApiActor, proposalId: string, decision: "approve" | "reject") {
  if (actor.demo) return { id: proposalId, approvalState: decision === "approve" ? "executed" : "rejected", result: decision === "approve" ? { state: "demo_complete" } : undefined };
  const { data, error } = await actor.supabase.from("nia_tool_proposals").select("*,nia_conversations!inner(user_id)").eq("id", proposalId).maybeSingle();
  if (error) throw error;
  if (!data || (data.nia_conversations as { user_id?: string })?.user_id !== actor.userId) throw new ApiAuthError(404, "proposal_not_found", "The Nia action was not found.");
  if (data.approval_state === "executed" || data.approval_state === "rejected") return data;
  if (decision === "reject") {
    const { data: rejected, error: updateError } = await actor.supabase.from("nia_tool_proposals").update({ approval_state: "rejected", approved_by: actor.userId }).eq("id", proposalId).select("*").single();
    if (updateError) throw updateError;
    return rejected;
  }
  const result = await execute(actor, data.tool_code as NiaToolCode, data.payload as Record<string, unknown>, data.idempotency_key);
  const { data: executed, error: updateError } = await actor.supabase.from("nia_tool_proposals").update({ approval_state: "executed", approved_by: actor.userId, executed_at: new Date().toISOString(), payload: { ...(data.payload as Record<string, unknown>), executionResult: result } }).eq("id", proposalId).select("*").single();
  if (updateError) throw updateError;
  await recordPlatformEvent({ level: "info", category: "nia_tool", message: `Nia tool ${data.tool_code} executed`, actorId: actor.userId, requestId: actor.requestId, metadata: { proposalId, toolCode: data.tool_code } });
  return executed;
}
