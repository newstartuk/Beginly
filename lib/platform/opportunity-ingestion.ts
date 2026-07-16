import type { ApiActor } from "./api-auth";
import { requireAdminRole } from "./admin-operations";
import type { Opportunity } from "./types";
import type { OpportunityConnector } from "@/lib/providers/types";
import { createOpportunityConnector } from "@/lib/providers/opportunities";
import { recordPlatformEvent } from "./observability";

export interface ValidatedOpportunity { opportunity: Opportunity; accepted: boolean; reasons: string[] }

export function validateIngestedOpportunity(opportunity: Opportunity, now = Date.now()): ValidatedOpportunity {
  const reasons: string[] = [];
  if (!opportunity.id?.trim()) reasons.push("missing_external_id");
  if (!opportunity.title?.trim() || opportunity.title.length > 240) reasons.push("invalid_title");
  if (!opportunity.description?.trim()) reasons.push("missing_description");
  if (!Number.isFinite(opportunity.trustScore) || opportunity.trustScore < 0.7 || opportunity.trustScore > 1) reasons.push("trust_below_threshold");
  if (opportunity.sourceUrl) {
    try { if (new URL(opportunity.sourceUrl).protocol !== "https:") reasons.push("source_not_https"); } catch { reasons.push("invalid_source_url"); }
  }
  if (Number.isNaN(Date.parse(opportunity.verifiedAt))) reasons.push("invalid_verified_at");
  else if (now - Date.parse(opportunity.verifiedAt) > 90 * 86_400_000) reasons.push("verification_stale");
  if (opportunity.deadline && Number.isNaN(Date.parse(opportunity.deadline))) reasons.push("invalid_deadline");
  return { opportunity, accepted: reasons.length === 0, reasons };
}

export async function runOpportunityIngestion(actor: ApiActor, connector: OpportunityConnector = createOpportunityConnector()) {
  await requireAdminRole(actor, ["partner_admin", "content_admin"]);
  const fetched = await connector.fetch({ limit: 200 });
  const validated = fetched.opportunities.map((opportunity) => validateIngestedOpportunity(opportunity));
  const accepted = validated.filter((item) => item.accepted);
  const quarantined = validated.filter((item) => !item.accepted);
  if (actor.demo) return { connector: connector.name, fetched: validated.length, accepted: accepted.length, quarantined: quarantined.length, stale: fetched.staleCount, items: validated };
  const { data: run, error: runError } = await actor.supabase.from("opportunity_ingestion_runs").insert({ connector: connector.name, state: "running", fetched_count: validated.length, stale_count: fetched.staleCount }).select("id").single();
  if (runError) throw runError;
  try {
    for (const item of accepted) {
      const source = item.opportunity;
      const { data: provider, error: providerError } = await actor.supabase.from("providers").upsert({ name: source.provider, provider_type: "opportunity", verification_status: "reviewed", trust_score: source.trustScore, metadata: { connector: connector.name } }, { onConflict: "provider_type,name" }).select("id").single();
      if (providerError) throw providerError;
      const { error } = await actor.supabase.from("opportunities").upsert({ external_id: source.id, provider_id: provider.id, title: source.title, category: source.category, description: source.description, route_codes: source.routes === "all" ? [] : source.routes, cities: source.cities === "all" ? [] : source.cities, goal_tags: source.goalTags, eligibility_rule: { readiness_requirements: source.readinessRequirements, sponsored_label: source.sponsoredLabel }, deadline: source.deadline, trust_score: source.trustScore, commercial_status: source.commercialStatus, commission_minor: source.commissionMinor, source_url: source.sourceUrl, verified_at: source.verifiedAt, status: "review" }, { onConflict: "provider_id,external_id" });
      if (error) throw error;
    }
    const { error: finishError } = await actor.supabase.from("opportunity_ingestion_runs").update({ state: "complete", accepted_count: accepted.length, quarantined_count: quarantined.length, evidence: { quarantine: quarantined.map((item) => ({ id: item.opportunity.id, reasons: item.reasons })) }, completed_at: new Date().toISOString() }).eq("id", run.id);
    if (finishError) throw finishError;
  } catch (error) {
    await actor.supabase.from("opportunity_ingestion_runs").update({ state: "failed", evidence: { error: error instanceof Error ? error.message : String(error) }, completed_at: new Date().toISOString() }).eq("id", run.id);
    throw error;
  }
  await recordPlatformEvent({ level: "info", category: "opportunity_ingestion", message: "Opportunity ingestion completed", actorId: actor.userId, requestId: actor.requestId, metadata: { connector: connector.name, accepted: accepted.length, quarantined: quarantined.length } });
  return { runId: run.id, connector: connector.name, fetched: validated.length, accepted: accepted.length, quarantined: quarantined.length, stale: fetched.staleCount, items: validated };
}
