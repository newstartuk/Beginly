import { OPPORTUNITIES } from "../platform/catalog";
import type { Opportunity } from "../platform/types";
import { nowIso, requireProductionSecret } from "./core";
import type { OpportunityConnector, OpportunityFetchContext, OpportunityFetchResult, ProviderHealth } from "./types";

const stale = (opportunity: Opportunity, maxAgeDays: number): boolean => Date.now() - new Date(opportunity.verifiedAt).getTime() > maxAgeDays * 86_400_000;

export class FixtureOpportunityConnector implements OpportunityConnector {
  readonly name = "fixture-opportunities";
  constructor(private readonly opportunities: Opportunity[] = OPPORTUNITIES, private readonly maxAgeDays = 30) {}
  async fetch(context: OpportunityFetchContext = {}): Promise<OpportunityFetchResult> {
    const start = context.cursor ? Number(context.cursor) : 0;
    const limit = Math.min(Math.max(context.limit ?? 100, 1), 500);
    const rows = this.opportunities.slice(start, start + limit).map((item) => structuredClone(item));
    return { provider: this.name, opportunities: rows, nextCursor: start + limit < this.opportunities.length ? String(start + limit) : undefined, fetchedAt: nowIso(), staleCount: rows.filter((item) => stale(item, this.maxAgeDays)).length };
  }
  async health(): Promise<ProviderHealth> { return { provider: this.name, mode: "local", healthy: true, productionVerified: false, checkedAt: nowIso(), details: { opportunities: this.opportunities.length } }; }
}

export class JsonOpportunityConnector implements OpportunityConnector {
  readonly name = "json-opportunities";
  constructor(private readonly source: string, private readonly maxAgeDays = 30) {}
  async fetch(): Promise<OpportunityFetchResult> {
    const content = this.source.trim().startsWith("[") ? this.source : await (await fetch(this.source, { signal: AbortSignal.timeout(8_000) })).text();
    const rows = JSON.parse(content) as Opportunity[];
    return { provider: this.name, opportunities: rows, fetchedAt: nowIso(), staleCount: rows.filter((item) => stale(item, this.maxAgeDays)).length };
  }
  async health(): Promise<ProviderHealth> { return { provider: this.name, mode: "local-or-remote-json", healthy: true, productionVerified: false, checkedAt: nowIso() }; }
}

export class CsvOpportunityConnector implements OpportunityConnector {
  readonly name = "csv-opportunities";
  constructor(private readonly csv: string) {}
  async fetch(): Promise<OpportunityFetchResult> {
    const [headerLine = "", ...lines] = this.csv.trim().split(/\r?\n/);
    const headers = headerLine.split(",").map((value) => value.trim());
    const rows = lines.filter(Boolean).map((line, index) => {
      const values = line.split(",").map((value) => value.trim());
      const record = Object.fromEntries(headers.map((key, i) => [key, values[i] ?? ""]));
      return {
        id: record.id || `csv-${index + 1}`, title: record.title || "Untitled opportunity", provider: record.provider || "Unknown provider", category: (record.category || "training") as Opportunity["category"], description: record.description || "Imported opportunity", routes: "all", cities: "all", goalTags: (record.goalTags || "").split("|").filter(Boolean), trustScore: Number(record.trustScore || 0.7), readinessRequirements: [], commercialStatus: (record.commercialStatus || "public_interest") as Opportunity["commercialStatus"], verifiedAt: record.verifiedAt || nowIso(), sourceUrl: record.sourceUrl || undefined,
      } satisfies Opportunity;
    });
    return { provider: this.name, opportunities: rows, fetchedAt: nowIso(), staleCount: rows.filter((item) => stale(item, 30)).length };
  }
  async health(): Promise<ProviderHealth> { return { provider: this.name, mode: "local-csv", healthy: true, productionVerified: false, checkedAt: nowIso() }; }
}

export class RestOpportunityConnector implements OpportunityConnector {
  readonly name = "rest-opportunities";
  private readonly apiKey?: string;
  constructor(private readonly endpoint: string, options: { apiKey?: string; requireKey?: boolean } = {}) {
    if (!/^https?:\/\//.test(endpoint)) throw new Error("Opportunity endpoint must be HTTP(S)");
    this.apiKey = options.requireKey ? requireProductionSecret(this.name, options.apiKey ?? process.env.OPPORTUNITY_API_KEY) : options.apiKey;
  }
  async fetch(context: OpportunityFetchContext = {}): Promise<OpportunityFetchResult> {
    const url = new URL(this.endpoint);
    if (context.cursor) url.searchParams.set("cursor", context.cursor);
    if (context.updatedAfter) url.searchParams.set("updated_after", context.updatedAfter);
    if (context.limit) url.searchParams.set("limit", String(context.limit));
    const response = await fetch(url, { headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}, signal: AbortSignal.timeout(8_000) });
    if (!response.ok) throw new Error(`Opportunity connector failed with ${response.status}`);
    const payload = await response.json() as { opportunities?: Opportunity[]; nextCursor?: string } | Opportunity[];
    const opportunities = Array.isArray(payload) ? payload : payload.opportunities ?? [];
    return { provider: this.name, opportunities, nextCursor: Array.isArray(payload) ? undefined : payload.nextCursor, fetchedAt: nowIso(), staleCount: opportunities.filter((item) => stale(item, 30)).length };
  }
  async health(): Promise<ProviderHealth> { return { provider: this.name, mode: "REST-adapter", healthy: true, productionVerified: false, checkedAt: nowIso() }; }
}

export function createOpportunityConnector(mode = process.env.OPPORTUNITY_PROVIDER ?? "fixture"): OpportunityConnector {
  if (mode === "rest") return new RestOpportunityConnector(process.env.OPPORTUNITY_API_URL ?? "", { apiKey: process.env.OPPORTUNITY_API_KEY, requireKey: true });
  return new FixtureOpportunityConnector();
}
