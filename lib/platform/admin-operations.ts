import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiAuthError, type ApiActor } from "./api-auth";

export type AdminRole = "platform_admin" | "content_admin" | "support_admin" | "finance_admin" | "partner_admin";
export interface OperationsQueueMetric { id: string; label: string; count: number; status: "ready" | "attention" | "clear"; detail: string }
export interface AdminOperationsItem {
  id: string;
  queueId: "support" | "data_rights" | "opportunity_actions" | "conversion_claims" | "content" | "domains" | "incidents";
  title: string;
  detail: string;
  state: string;
  createdAt?: string;
  severity?: string;
  metadata?: Record<string, unknown>;
}

export async function requireAdminRole(actor: ApiActor, accepted: AdminRole[] = ["platform_admin"]): Promise<AdminRole> {
  if (actor.demo) return "platform_admin";
  const roles = Array.from(new Set(["platform_admin", ...accepted]));
  const { data, error } = await actor.supabase.from("platform_role_assignments").select("role_code").eq("user_id", actor.userId).is("revoked_at", null).in("role_code", roles).limit(1);
  if (error || !data?.length) throw new ApiAuthError(403, "administrator_required", "An authorised Beginly operations role is required.");
  return data[0].role_code as AdminRole;
}

async function count(supabase: SupabaseClient, table: string, configure?: (query: any) => any): Promise<number> {
  let query: any = supabase.from(table).select("id", { count: "exact", head: true });
  if (configure) query = configure(query);
  const { count: value, error } = await query;
  if (error) throw error;
  return value ?? 0;
}

const demoItems: AdminOperationsItem[] = [
  { id: "demo-support", queueId: "support", title: "Opportunity safety question", detail: "High-priority representative support case.", state: "received", severity: "high", createdAt: new Date().toISOString() },
  { id: "demo-rights", queueId: "data_rights", title: "Data export request", detail: "Representative user data-rights workflow.", state: "received", metadata: { requestType: "export", identityVerified: false }, createdAt: new Date().toISOString() },
  { id: "demo-session", queueId: "opportunity_actions", title: "Trusted browser return", detail: "jobs.example.org · apply", state: "returned", createdAt: new Date().toISOString() },
  { id: "demo-claim", queueId: "conversion_claims", title: "User reported application", detail: "Provider confirmation required.", state: "user_claimed", createdAt: new Date().toISOString() },
  { id: "demo-content", queueId: "content", title: "Graduate route guide", detail: "/routes/graduate", state: "review", metadata: { indexState: "noindex" }, createdAt: new Date().toISOString() },
  { id: "demo-domain", queueId: "domains", title: "careers.example.org", detail: "Disclosure required · first-party session", state: "review", metadata: { allowSubdomains: false, allowedRedirectHosts: [], disclosureRequired: true, attributionMode: "first_party_session" }, createdAt: new Date().toISOString() },
  { id: "demo-incident", queueId: "incidents", title: "Representative staging incident", detail: "Operational incident response workflow.", state: "investigating", severity: "high", createdAt: new Date().toISOString() },
];

export async function loadAdminOperations(actor: ApiActor) {
  const role = await requireAdminRole(actor, ["content_admin", "support_admin", "finance_admin", "partner_admin"]);
  if (actor.demo) {
    const queues = [
      { id: "support", label: "Support and safety", count: 1, status: "attention", detail: "Representative demo queue." },
      { id: "data_rights", label: "Data rights", count: 1, status: "attention", detail: "Representative demo queue." },
      { id: "opportunity_actions", label: "Opportunity action sessions", count: 1, status: "ready", detail: "Representative demo queue." },
      { id: "conversion_claims", label: "Conversion claims", count: 1, status: "attention", detail: "Representative demo queue." },
      { id: "content", label: "Content reviews", count: 1, status: "attention", detail: "Representative demo queue." },
      { id: "domains", label: "Outbound domains", count: 1, status: "attention", detail: "Representative demo queue." },
      { id: "incidents", label: "Incidents", count: 1, status: "attention", detail: "Representative demo incident." },
    ] satisfies OperationsQueueMetric[];
    return { role, queues, items: demoItems, generatedAt: new Date().toISOString() };
  }

  const [supportCount, rightsCount, sessionsCount, publicationsCount, domainsCount, claimsCount, incidentsCount, support, rights, sessions, publications, domains, claims, incidents] = await Promise.all([
    count(actor.supabase, "support_cases", (q) => q.in("state", ["received", "triaged", "in_progress", "escalated"])),
    count(actor.supabase, "data_rights_requests", (q) => q.in("state", ["received", "validating", "in_progress"])),
    count(actor.supabase, "opportunity_action_sessions", (q) => q.in("session_state", ["created", "disclosed", "opened", "returned"])),
    count(actor.supabase, "public_content_publications", (q) => q.in("publication_state", ["draft", "review"])),
    count(actor.supabase, "outbound_link_policies", (q) => q.neq("status", "approved")),
    count(actor.supabase, "conversion_claims", (q) => q.eq("state", "user_claimed")),
    count(actor.supabase, "incidents", (q) => q.in("state", ["open", "investigating", "mitigated"])),
    actor.supabase.from("support_cases").select("id,subject,severity,state,response_due_at,created_at").in("state", ["received", "triaged", "in_progress", "escalated"]).order("created_at", { ascending: false }).limit(20),
    actor.supabase.from("data_rights_requests").select("id,request_type,state,requested_at").in("state", ["received", "validating", "in_progress"]).order("requested_at", { ascending: false }).limit(20),
    actor.supabase.from("opportunity_action_sessions").select("id,action_type,session_state,destination_hostname,created_at").in("session_state", ["created", "disclosed", "opened", "returned"]).order("created_at", { ascending: false }).limit(20),
    actor.supabase.from("public_content_publications").select("id,title,canonical_path,publication_state,index_state,next_review_at,updated_at").in("publication_state", ["draft", "review"]).order("updated_at", { ascending: false }).limit(20),
    actor.supabase.from("outbound_link_policies").select("id,hostname,status,allow_subdomains,allowed_redirect_hosts,disclosure_required,attribution_mode,privacy_note,updated_at").neq("status", "approved").order("updated_at", { ascending: false }).limit(20),
    actor.supabase.from("conversion_claims").select("id,claimed_outcome,state,claimed_at,action_session_id").eq("state", "user_claimed").order("claimed_at", { ascending: false }).limit(20),
    actor.supabase.from("incidents").select("id,title,severity,category,state,detected_at,owner_user_id").in("state", ["open", "investigating", "mitigated"]).order("detected_at", { ascending: false }).limit(20),
  ]);
  for (const result of [support, rights, sessions, publications, domains, claims, incidents]) if (result.error) throw result.error;

  const queues: OperationsQueueMetric[] = [
    { id: "support", label: "Support and safety", count: supportCount, status: supportCount ? "attention" : "clear", detail: "Received, triage, assigned and escalated cases." },
    { id: "data_rights", label: "Data rights", count: rightsCount, status: rightsCount ? "attention" : "clear", detail: "Open access, correction, export and deletion requests." },
    { id: "opportunity_actions", label: "Opportunity action sessions", count: sessionsCount, status: sessionsCount ? "ready" : "clear", detail: "Open or returned outbound opportunity journeys." },
    { id: "conversion_claims", label: "Conversion claims", count: claimsCount, status: claimsCount ? "attention" : "clear", detail: "User-reported outcomes awaiting confirmation." },
    { id: "content", label: "Content reviews", count: publicationsCount, status: publicationsCount ? "attention" : "clear", detail: "Draft, review or stale public content." },
    { id: "domains", label: "Outbound domains", count: domainsCount, status: domainsCount ? "attention" : "clear", detail: "Destinations not yet approved for trusted browsing." },
    { id: "incidents", label: "Incidents", count: incidentsCount, status: incidentsCount ? "attention" : "clear", detail: "Open, investigating and mitigated operational incidents." },
  ];
  const items: AdminOperationsItem[] = [
    ...(support.data ?? []).map((row: any) => ({ id: row.id, queueId: "support" as const, title: row.subject, detail: `Response due ${row.response_due_at ? new Date(row.response_due_at).toLocaleString("en-GB") : "not set"}`, state: row.state, severity: row.severity, createdAt: row.created_at })),
    ...(rights.data ?? []).map((row: any) => ({ id: row.id, queueId: "data_rights" as const, title: `${String(row.request_type).replaceAll("_", " ")} request`, detail: "Identity validation and evidence must be retained.", state: row.state, createdAt: row.requested_at, metadata: { requestType: row.request_type } })),
    ...(sessions.data ?? []).map((row: any) => ({ id: row.id, queueId: "opportunity_actions" as const, title: `${row.action_type} · ${row.destination_hostname}`, detail: "Trusted browser action session.", state: row.session_state, createdAt: row.created_at })),
    ...(claims.data ?? []).map((row: any) => ({ id: row.id, queueId: "conversion_claims" as const, title: `${String(row.claimed_outcome).replaceAll("_", " ")} claim`, detail: `Action session ${row.action_session_id}`, state: row.state, createdAt: row.claimed_at })),
    ...(publications.data ?? []).map((row: any) => ({ id: row.id, queueId: "content" as const, title: row.title, detail: row.canonical_path, state: row.publication_state, createdAt: row.updated_at, metadata: { indexState: row.index_state, nextReviewAt: row.next_review_at } })),
    ...(domains.data ?? []).map((row: any) => ({ id: row.id, queueId: "domains" as const, title: row.hostname, detail: `${row.attribution_mode} · disclosure ${row.disclosure_required ? "required" : "not required"}`, state: row.status, createdAt: row.updated_at, metadata: { allowSubdomains: row.allow_subdomains, allowedRedirectHosts: row.allowed_redirect_hosts, disclosureRequired: row.disclosure_required, attributionMode: row.attribution_mode, privacyNote: row.privacy_note } })),
    ...(incidents.data ?? []).map((row: any) => ({ id: row.id, queueId: "incidents" as const, title: row.title, detail: `${row.category} incident`, state: row.state, severity: row.severity, createdAt: row.detected_at, metadata: { ownerUserId: row.owner_user_id } })),
  ];
  return { role, queues, items, generatedAt: new Date().toISOString() };
}
