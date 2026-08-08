import type { EvidenceRecord } from "./types";

// Every reference below must exist in this codebase -- do not add a record
// without confirming its `reference` path is real. This file previously cited
// __tests__/platform/*.test.ts files and a mobile/ directory that did not
// exist, overstating coverage on the public /evidence-room page.
export const EVIDENCE_RECORDS: EvidenceRecord[] = [
  { id: "ev-adaptivity", requirementId: "D13", title: "Adaptive commercial orchestration", dimension: "innovation", status: "implemented", evidenceType: "code", reference: "lib/platform/entitlements.ts", recordedAt: new Date().toISOString() },
  { id: "ev-journey", requirementId: "W2", title: "Route-neutral Journey Engine", dimension: "innovation", status: "implemented", evidenceType: "code", reference: "lib/platform/journey.ts", recordedAt: new Date().toISOString() },
  { id: "ev-commission", requirementId: "W7", title: "Commission-readiness and ledger kernel", dimension: "viability", status: "implemented", evidenceType: "code", reference: "lib/platform/partners.ts", recordedAt: new Date().toISOString() },
  { id: "ev-billing", requirementId: "W6", title: "Idempotent billing and retained-work projection", dimension: "viability", status: "verified", evidenceType: "test", reference: "__tests__/platform/billing.test.ts", recordedAt: new Date().toISOString() },
  { id: "ev-referrals", requirementId: "W7", title: "Referral attribution, fraud signals and ProofPoints", dimension: "viability", status: "verified", evidenceType: "test", reference: "__tests__/platform/referrals.test.ts", recordedAt: new Date().toISOString() },
  { id: "ev-entitlements", requirementId: "D13", title: "Entitlement resolution and value recommendation", dimension: "viability", status: "verified", evidenceType: "test", reference: "__tests__/platform/entitlements.test.ts", recordedAt: new Date().toISOString() },
];
