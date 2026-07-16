import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const EXPORT_BUCKET = "data-rights-exports";
const EXPORT_TTL_DAYS = 14;

type AdminClient = SupabaseClient<any, "public", any>;
type RequestRecord = { id: string; user_id: string; request_type: "export" | "delete" | "rectify" | "restrict"; state: string; scope: Record<string, unknown> | null; evidence: Record<string, unknown> | null };

const DIRECT_EXPORTS: Array<{ table: string; column: string }> = [
  { table: "user_profiles", column: "id" },
  { table: "platform_role_assignments", column: "user_id" },
  { table: "organisation_memberships", column: "user_id" },
  { table: "household_members", column: "user_id" },
  { table: "migration_profiles", column: "user_id" },
  { table: "profile_facts", column: "user_id" },
  { table: "goals", column: "owner_user_id" },
  { table: "life_events", column: "user_id" },
  { table: "consent_records", column: "user_id" },
  { table: "entitlements", column: "actor_id" },
  { table: "journey_plans", column: "user_id" },
  { table: "product_recommendations", column: "user_id" },
  { table: "nia_conversations", column: "user_id" },
  { table: "opportunity_interactions", column: "user_id" },
  { table: "billing_events", column: "actor_id" },
  { table: "subscriptions", column: "actor_id" },
  { table: "proofpoints_ledger", column: "user_id" },
  { table: "notification_outbox", column: "user_id" },
  { table: "device_registrations", column: "user_id" },
  { table: "data_rights_requests", column: "user_id" },
  { table: "user_preferences", column: "user_id" },
  { table: "onboarding_states", column: "user_id" },
  { table: "user_task_states", column: "user_id" },
  { table: "support_cases", column: "user_id" },
  { table: "household_invitations", column: "invited_by" },
  { table: "opportunity_action_sessions", column: "user_id" },
  { table: "browser_return_events", column: "user_id" },
  { table: "conversion_claims", column: "user_id" },
  { table: "user_referral_identities", column: "user_id" },
  { table: "checkout_sessions", column: "actor_id" },
];

async function rowsFor(admin: AdminClient, table: string, column: string, userId: string) {
  const { data, error } = await admin.from(table).select("*").eq(column, userId);
  if (error) throw new Error(`Data-rights export failed for ${table}: ${error.message}`);
  return data ?? [];
}

async function relatedRows(admin: AdminClient, table: string, foreignColumn: string, ids: string[]) {
  if (!ids.length) return [];
  const { data, error } = await admin.from(table).select("*").in(foreignColumn, ids);
  if (error) throw new Error(`Data-rights export failed for ${table}: ${error.message}`);
  return data ?? [];
}

export async function buildUserExport(admin: AdminClient, request: RequestRecord) {
  const { data: authResult, error: authError } = await admin.auth.admin.getUserById(request.user_id);
  if (authError) throw authError;
  const tables: Record<string, unknown[]> = {};
  for (const spec of DIRECT_EXPORTS) tables[spec.table] = await rowsFor(admin, spec.table, spec.column, request.user_id);

  const journeyIds = (tables.journey_plans ?? []).map((row: any) => String(row.id));
  const conversationIds = (tables.nia_conversations ?? []).map((row: any) => String(row.id));
  const supportIds = (tables.support_cases ?? []).map((row: any) => String(row.id));
  const actionSessionIds = (tables.opportunity_action_sessions ?? []).map((row: any) => String(row.id));
  const referralIdentityIds = (tables.user_referral_identities ?? []).map((row: any) => String(row.id));
  tables.task_instances = await relatedRows(admin, "task_instances", "journey_plan_id", journeyIds);
  tables.nia_messages = await relatedRows(admin, "nia_messages", "conversation_id", conversationIds);
  tables.support_case_events = await relatedRows(admin, "support_case_events", "case_id", supportIds);
  tables.opportunity_redirect_events = await relatedRows(admin, "opportunity_redirect_events", "action_session_id", actionSessionIds);
  tables.user_referral_touches = await relatedRows(admin, "user_referral_touches", "referral_identity_id", referralIdentityIds);

  const exportObject = {
    schema: "beginly-data-export-v1",
    generatedAt: new Date().toISOString(),
    requestId: request.id,
    subject: {
      id: request.user_id,
      email: authResult.user?.email ?? null,
      createdAt: authResult.user?.created_at ?? null,
      lastSignInAt: authResult.user?.last_sign_in_at ?? null,
      appMetadata: authResult.user?.app_metadata ?? {},
      userMetadata: authResult.user?.user_metadata ?? {},
    },
    tables,
    notes: [
      "This export contains Beginly-held records linked directly to the requesting account.",
      "Shared household information belonging to other people is intentionally minimised.",
      "Provider-held data may require a separate provider request where Beginly is not the controller.",
    ],
  };
  const content = Buffer.from(JSON.stringify(exportObject, null, 2));
  const contentHash = createHash("sha256").update(content).digest("hex");
  const rowCount = Object.values(tables).reduce((sum, rows) => sum + rows.length, 0);
  return { content, contentHash, rowCount };
}

async function ensurePrivateExportBucket(admin: AdminClient) {
  const { data } = await admin.storage.getBucket(EXPORT_BUCKET);
  if (data) return;
  const { error } = await admin.storage.createBucket(EXPORT_BUCKET, { public: false, fileSizeLimit: 10 * 1024 * 1024, allowedMimeTypes: ["application/json"] });
  if (error && !/already exists/i.test(error.message)) throw error;
}

export async function fulfilExport(admin: AdminClient, request: RequestRecord) {
  if (request.request_type !== "export") throw new Error("Export fulfilment received the wrong request type.");
  const { content, contentHash, rowCount } = await buildUserExport(admin, request);
  await ensurePrivateExportBucket(admin);
  const storagePath = `${request.user_id}/${request.id}.json`;
  const expiresAt = new Date(Date.now() + EXPORT_TTL_DAYS * 86_400_000).toISOString();
  const { error: uploadError } = await admin.storage.from(EXPORT_BUCKET).upload(storagePath, content, { contentType: "application/json", upsert: true });
  if (uploadError) throw uploadError;
  const { error: recordError } = await admin.from("data_rights_exports").upsert({ request_id: request.id, user_id: request.user_id, storage_bucket: EXPORT_BUCKET, storage_path: storagePath, content_hash: contentHash, row_count: rowCount, expires_at: expiresAt }, { onConflict: "request_id" });
  if (recordError) throw recordError;
  const { error: requestError } = await admin.from("data_rights_requests").update({ state: "completed", completed_at: new Date().toISOString(), evidence: { ...(request.evidence ?? {}), fulfilment: "private_export", content_hash: contentHash, row_count: rowCount, expires_at: expiresAt } }).eq("id", request.id);
  if (requestError) throw requestError;
  return { contentHash, rowCount, storagePath, expiresAt };
}

function deletionSubjectHash(userId: string) {
  const secret = process.env.DATA_RIGHTS_TOMBSTONE_SECRET?.trim();
  if (!secret || secret.length < 24) throw new Error("DATA_RIGHTS_TOMBSTONE_SECRET is required for deletion fulfilment.");
  return createHash("sha256").update(`${secret}:${userId}`).digest("hex");
}

async function deleteWhere(admin: AdminClient, table: string, column: string, value: string) {
  const { error } = await admin.from(table).delete().eq(column, value);
  if (error) throw new Error(`Deletion failed for ${table}: ${error.message}`);
}

export async function fulfilDeletion(admin: AdminClient, request: RequestRecord) {
  if (request.request_type !== "delete") throw new Error("Deletion fulfilment received the wrong request type.");
  const evidence = request.evidence ?? {};
  if (evidence.legal_hold === true) throw new Error("Deletion is blocked by a recorded legal hold.");
  if (evidence.identity_verified !== true || evidence.deletion_confirmed !== true) throw new Error("Deletion requires verified identity and explicit confirmation evidence.");

  const retainedFinancialReference = randomUUID();
  const subjectHash = deletionSubjectHash(request.user_id);
  const tombstoneEvidence = { request_id: request.id, completed_by_worker: true, retained_financial_records_pseudonymised: true };
  const { error: tombstoneError } = await admin.from("data_deletion_tombstones").insert({ request_reference: request.id, subject_hash: subjectHash, retained_financial_reference: retainedFinancialReference, evidence: tombstoneEvidence });
  if (tombstoneError) throw tombstoneError;

  // Financial records are retained only under an unlinkable replacement identifier. Direct payload identifiers are removed.
  const { error: billingError } = await admin.from("billing_events").update({ actor_id: retainedFinancialReference, payload: { redacted: true, deletion_request: request.id } }).eq("actor_id", request.user_id);
  if (billingError) throw billingError;
  const { error: auditError } = await admin.from("audit_events").update({ actor_user_id: null, before_state: { redacted: true }, after_state: { redacted: true } }).eq("actor_user_id", request.user_id);
  if (auditError) throw auditError;

  for (const [table, column] of [
    ["checkout_sessions", "actor_id"],
    ["subscriptions", "actor_id"],
    ["entitlements", "actor_id"],
    ["notification_outbox", "user_id"],
    ["device_registrations", "user_id"],
    ["user_referral_identities", "user_id"],
  ] as const) await deleteWhere(admin, table, column, request.user_id);

  // The authentication deletion cascades through all FK-backed personal records. Shared household rows use SET NULL where continuity is required.
  const { error: deleteUserError } = await admin.auth.admin.deleteUser(request.user_id, false);
  if (deleteUserError) throw deleteUserError;
  return { subjectHash, retainedFinancialReference };
}

export async function loadDataRightsRequest(admin: AdminClient, requestId: string): Promise<RequestRecord> {
  const { data, error } = await admin.from("data_rights_requests").select("id,user_id,request_type,state,scope,evidence").eq("id", requestId).maybeSingle();
  if (error || !data) throw new Error("Data-rights request not found.");
  return data as RequestRecord;
}
