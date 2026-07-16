export interface GroundingSource { id: string; title: string; url?: string; authority: "official" | "regulated" | "beginly" | "provider"; reviewedAt: string; summary: string }

export const NIA_SOURCE_REGISTRY: GroundingSource[] = [
  { id: "gov-immigration", title: "UK immigration and visas", url: "https://www.gov.uk/browse/visas-immigration", authority: "official", reviewedAt: "2026-07-12", summary: "Official UK government immigration information." },
  { id: "regulated-adviser-directory", title: "Immigration Advice Authority adviser finder", url: "https://www.gov.uk/find-an-immigration-adviser", authority: "regulated", reviewedAt: "2026-07-12", summary: "Official route for locating regulated immigration advice." },
  { id: "nhs-111", title: "NHS 111", url: "https://111.nhs.uk/", authority: "official", reviewedAt: "2026-07-12", summary: "Urgent medical help and triage that is not a 999 emergency." },
  { id: "uk-emergency", title: "UK emergency services", url: "https://www.gov.uk/emergency-services", authority: "official", reviewedAt: "2026-07-12", summary: "Emergency-service information." },
  { id: "beginly-action-policy", title: "Beginly material-action policy", authority: "beginly", reviewedAt: "2026-07-12", summary: "Material actions require explicit approval and an authorised execution route." },
  { id: "beginly-product-catalogue", title: "Beginly product and capability catalogue", authority: "beginly", reviewedAt: "2026-07-12", summary: "Capability-based product, sponsorship and entitlement definitions." },
  { id: "beginly-entitlements", title: "Beginly entitlement resolver", authority: "beginly", reviewedAt: "2026-07-12", summary: "Resolves free, purchased, household, sponsored and promotional access." },
  { id: "gov-identity", title: "UK identity and official-document guidance", url: "https://www.gov.uk/browse/abroad/passports", authority: "official", reviewedAt: "2026-07-12", summary: "Official UK government identity and document signposting." },
  { id: "nhs-gp", title: "Register with a GP", url: "https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/", authority: "official", reviewedAt: "2026-07-12", summary: "Official NHS GP registration guidance." },
  { id: "fca-guidance", title: "Financial Conduct Authority consumer guidance", url: "https://www.fca.org.uk/consumers", authority: "regulated", reviewedAt: "2026-07-12", summary: "Regulated UK financial consumer information." },
  { id: "action-fraud", title: "Report fraud and cyber crime", url: "https://www.actionfraud.police.uk/", authority: "official", reviewedAt: "2026-07-12", summary: "Official fraud-reporting route for England, Wales and Northern Ireland." },
  { id: "local-authority", title: "Find your local council", url: "https://www.gov.uk/find-local-council", authority: "official", reviewedAt: "2026-07-12", summary: "Official local-authority finder." },
  { id: "university", title: "University or education-provider support", authority: "provider", reviewedAt: "2026-07-12", summary: "Use the current provider’s official student-support and course channels." },
  { id: "gov-sponsor-list", title: "Register of licensed sponsors", url: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers", authority: "official", reviewedAt: "2026-07-12", summary: "Official UK register of licensed worker sponsors." },
  { id: "gov-worker", title: "Work in the UK", url: "https://www.gov.uk/browse/visas-immigration/work-visas", authority: "official", reviewedAt: "2026-07-12", summary: "Official UK work-route guidance." },
  { id: "gov-family", title: "Family visas and routes", url: "https://www.gov.uk/browse/visas-immigration/family-visas", authority: "official", reviewedAt: "2026-07-12", summary: "Official UK family-route guidance." },
  { id: "nhs-careers", title: "NHS careers", url: "https://www.healthcareers.nhs.uk/", authority: "official", reviewedAt: "2026-07-12", summary: "Official health-career pathway information." },
  { id: "nhs-support", title: "NHS help and support", url: "https://www.nhs.uk/nhs-services/", authority: "official", reviewedAt: "2026-07-12", summary: "Official NHS service navigation." },
  { id: "gov-global-talent", title: "Global Talent route", url: "https://www.gov.uk/global-talent", authority: "official", reviewedAt: "2026-07-12", summary: "Official UK Global Talent route guidance." },
  { id: "gov-support", title: "UK government support and local services", url: "https://www.gov.uk/browse/benefits", authority: "official", reviewedAt: "2026-07-12", summary: "Official support-service signposting; eligibility remains case-specific." },
  { id: "gov-arrival", title: "UK arrival and living guidance", url: "https://www.gov.uk/browse/visas-immigration", authority: "official", reviewedAt: "2026-07-12", summary: "Official UK transition and immigration information." },
  { id: "nhs-registration", title: "NHS registration and services", url: "https://www.nhs.uk/nhs-services/", authority: "official", reviewedAt: "2026-07-12", summary: "Official NHS service and registration information." },
  { id: "gov-graduate", title: "Graduate route", url: "https://www.gov.uk/graduate-visa", authority: "official", reviewedAt: "2026-07-12", summary: "Official Graduate route information." },
  { id: "beginly-methodology", title: "Beginly trust and recommendation methodology", url: "https://beginly.app/trust/methodology", authority: "beginly", reviewedAt: "2026-07-12", summary: "How Beginly governs relevance, evidence, sources and commercial neutrality." },
  { id: "beginly-household-policy", title: "Beginly household privacy policy", authority: "beginly", reviewedAt: "2026-07-12", summary: "Shared-household coordination with private member workspaces and auditable access." },
  { id: "beginly-career", title: "Beginly career-readiness framework", authority: "beginly", reviewedAt: "2026-07-12", summary: "Deterministic career readiness and next-action framework." },
  { id: "beginly-family", title: "Beginly family coordination framework", authority: "beginly", reviewedAt: "2026-07-12", summary: "Household-aware coordination and member-level privacy framework." },
  { id: "beginly-founder", title: "Beginly founder evidence framework", authority: "beginly", reviewedAt: "2026-07-12", summary: "Founder evidence, validation and opportunity-readiness framework." },
  { id: "beginly-network", title: "Beginly opportunity and network framework", authority: "beginly", reviewedAt: "2026-07-12", summary: "Trust-first opportunity and professional-network relevance rules." },
];

const map = new Map(NIA_SOURCE_REGISTRY.map((source) => [source.id, source]));
export function resolveGroundingSources(ids: string[]): GroundingSource[] {
  return [...new Set(ids)].map((id) => map.get(id) ?? (id.startsWith("opportunity:") ? { id, title: "Verified opportunity record", authority: "provider" as const, reviewedAt: new Date().toISOString().slice(0, 10), summary: "Opportunity-specific source and verification record." } : undefined)).filter((source): source is GroundingSource => Boolean(source));
}
export function groundingCoverage(ids: string[]): { requested: number; resolved: number; unsupported: string[] } {
  const unique = [...new Set(ids)];
  const resolved = resolveGroundingSources(unique);
  const known = new Set(resolved.map((source) => source.id));
  return { requested: unique.length, resolved: resolved.length, unsupported: unique.filter((id) => !known.has(id)) };
}
