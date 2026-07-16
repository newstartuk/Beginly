import type { EvidenceRecord } from "./types";

export const EVIDENCE_RECORDS: EvidenceRecord[] = [
  { id: "ev-adaptivity", requirementId: "D13", title: "Adaptive commercial orchestration", dimension: "innovation", status: "implemented", evidenceType: "code", reference: "lib/platform/entitlements.ts", recordedAt: new Date().toISOString() },
  { id: "ev-journey", requirementId: "W2", title: "Route-neutral Journey Engine", dimension: "innovation", status: "implemented", evidenceType: "code", reference: "lib/platform/journey.ts", recordedAt: new Date().toISOString() },
  { id: "ev-ranking", requirementId: "W5", title: "Suitability-first opportunity ranking", dimension: "trust", status: "implemented", evidenceType: "test", reference: "__tests__/platform/opportunities.test.ts", recordedAt: new Date().toISOString() },
  { id: "ev-commission", requirementId: "W7", title: "Commission-readiness and ledger kernel", dimension: "viability", status: "implemented", evidenceType: "code", reference: "lib/platform/partners.ts", recordedAt: new Date().toISOString() },
  { id: "ev-billing", requirementId: "W6", title: "Idempotent billing and retained-work projection", dimension: "viability", status: "verified", evidenceType: "test", reference: "__tests__/platform/billing.test.ts", recordedAt: new Date().toISOString() },
  { id: "ev-referrals", requirementId: "W7", title: "Referral attribution, fraud signals and ProofPoints", dimension: "viability", status: "verified", evidenceType: "test", reference: "__tests__/platform/referrals.test.ts", recordedAt: new Date().toISOString() },
  { id: "ev-pilots", requirementId: "W9", title: "Pilot outcome metric kernel", dimension: "execution", status: "verified", evidenceType: "test", reference: "__tests__/platform/pilots.test.ts", recordedAt: new Date().toISOString() },
  { id: "ev-mobile", requirementId: "W8", title: "Native mobile source application", dimension: "scalability", status: "implemented", evidenceType: "code", reference: "mobile/", recordedAt: new Date().toISOString() },
  { id: "ev-tests", requirementId: "W9", title: "Automated domain test suite", dimension: "execution", status: "verified", evidenceType: "test", reference: "__tests__/platform/", recordedAt: new Date().toISOString() },
];
