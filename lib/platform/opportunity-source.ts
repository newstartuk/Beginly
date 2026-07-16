import type { SupabaseClient } from "@supabase/supabase-js";
import { OPPORTUNITIES } from "./catalog";
import type { CommercialStatus, Opportunity, OpportunityCategory } from "./types";

const commercialStatuses = new Set<CommercialStatus>(["commission_embedded", "relationship_pending", "public_interest", "sponsored"]);

function mapOpportunity(row: Record<string, unknown>): Opportunity {
  const providerValue = row.providers as { name?: unknown } | Array<{ name?: unknown }> | null;
  const provider = Array.isArray(providerValue) ? providerValue[0]?.name : providerValue?.name;
  const rule = row.eligibility_rule && typeof row.eligibility_rule === "object" ? row.eligibility_rule as Record<string, unknown> : {};
  const routeCodes = Array.isArray(row.route_codes) ? row.route_codes.map(String) : [];
  const cities = Array.isArray(row.cities) ? row.cities.map(String) : [];
  const status = commercialStatuses.has(row.commercial_status as CommercialStatus) ? row.commercial_status as CommercialStatus : "relationship_pending";
  return {
    id: String(row.id),
    title: String(row.title),
    provider: String(provider ?? "Verified provider"),
    category: String(row.category) as OpportunityCategory,
    description: String(row.description),
    routes: routeCodes.length ? routeCodes as Opportunity["routes"] : "all",
    cities: cities.length ? cities : "all",
    goalTags: Array.isArray(row.goal_tags) ? row.goal_tags.map(String) : [],
    trustScore: Number(row.trust_score ?? 0),
    readinessRequirements: Array.isArray(rule.readiness_requirements) ? rule.readiness_requirements.map(String) : [],
    deadline: row.deadline ? String(row.deadline) : undefined,
    commercialStatus: status,
    commissionMinor: row.commission_minor == null ? undefined : Number(row.commission_minor),
    sponsoredLabel: typeof rule.sponsored_label === "string" ? rule.sponsored_label : undefined,
    verifiedAt: String(row.verified_at),
    sourceUrl: typeof row.source_url === "string" ? row.source_url : undefined,
  };
}

export async function loadAvailableOpportunities(supabase: SupabaseClient, demo: boolean): Promise<Opportunity[]> {
  if (demo) return OPPORTUNITIES;
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("opportunities")
    .select("id,title,category,description,route_codes,cities,goal_tags,eligibility_rule,deadline,trust_score,commercial_status,commission_minor,source_url,verified_at,expires_at,status,providers(name)")
    .eq("status", "published")
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("verified_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapOpportunity(row as unknown as Record<string, unknown>));
}

export async function loadAvailableOpportunity(supabase: SupabaseClient, demo: boolean, id: string): Promise<Opportunity | null> {
  if (demo) return OPPORTUNITIES.find((item) => item.id === id) ?? null;
  const { data, error } = await supabase
    .from("opportunities")
    .select("id,title,category,description,route_codes,cities,goal_tags,eligibility_rule,deadline,trust_score,commercial_status,commission_minor,source_url,verified_at,expires_at,status,providers(name)")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  if (!data || (data.expires_at && new Date(String(data.expires_at)).getTime() <= Date.now())) return null;
  return mapOpportunity(data as unknown as Record<string, unknown>);
}
