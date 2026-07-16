import type { CommissionReadinessInput, CommissionReadinessResult, LedgerEvent, LedgerState } from "./types";

const criteria: Array<{ key: keyof CommissionReadinessInput; label: string; weight: number }> = [
  { key: "legalEntityVerified", label: "Verify the legal entity and authorised contact", weight: 14 },
  { key: "clearOffer", label: "Define a clear, consumer-appropriate offer", weight: 10 },
  { key: "qualifyingEventDefined", label: "Define the qualifying conversion event", weight: 12 },
  { key: "conversionWebhook", label: "Implement a signed conversion API or webhook", weight: 12 },
  { key: "reversalRules", label: "Document refund, cancellation and reversal rules", weight: 10 },
  { key: "consumerDisclosure", label: "Approve affiliate and sponsorship disclosures", weight: 12 },
  { key: "payoutProcess", label: "Define payout timing and reconciliation", weight: 10 },
  { key: "supportProcess", label: "Define customer and partner support routes", weight: 8 },
  { key: "fraudControls", label: "Add duplicate lead and fraud controls", weight: 12 },
];

export function assessCommissionReadiness(input: CommissionReadinessInput): CommissionReadinessResult {
  const missing: string[] = [];
  let score = 0;
  for (const item of criteria) {
    if (input[item.key]) score += item.weight;
    else missing.push(item.label);
  }
  if ((input.attributionWindowDays ?? 0) > 0) score += 5;
  score = Math.min(100, score);
  const status = score >= 90 ? "marketplace_ready" : score >= 75 ? "sandbox_ready" : score >= 45 ? "foundation_ready" : "not_ready";
  return {
    score,
    status,
    missing,
    nextActions: missing.slice(0, 4),
  };
}

export function applyLedgerEvent(state: LedgerState, event: LedgerEvent): LedgerState {
  if (state.events.some((existing) => existing.idempotencyKey === event.idempotencyKey)) return state;
  const next = { ...state, events: [...state.events, event] };
  if (event.type === "confirmed_conversion") next.confirmedMinor += event.amountMinor;
  if (event.type === "reversal") next.reversedMinor += event.amountMinor;
  if (event.type === "payout") next.paidMinor += event.amountMinor;
  next.payableMinor = Math.max(0, next.confirmedMinor - next.reversedMinor - next.paidMinor);
  return next;
}

export const emptyLedger = (): LedgerState => ({
  confirmedMinor: 0,
  reversedMinor: 0,
  paidMinor: 0,
  payableMinor: 0,
  events: [],
});
