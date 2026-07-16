import { createHash } from "node:crypto";
import type { AttributionDecision, ConversionClaim, ProofPointsEvent, ProofPointsState, ReferralTouch } from "./types";

export function referralCode(programmeId: string, ownerId: string): string {
  return createHash("sha256").update(`${programmeId}:${ownerId}`).digest("hex").slice(0, 10).toUpperCase();
}

export function decideAttribution(touches: ReferralTouch[], claim: ConversionClaim): AttributionDecision {
  const candidates = touches.filter((touch) => touch.programmeId === claim.programmeId && touch.subjectHash === claim.subjectHash)
    .filter((touch) => new Date(claim.occurredAt).getTime() <= new Date(touch.touchedAt).getTime() + touch.attributionWindowDays * 86_400_000)
    .sort((a, b) => new Date(b.touchedAt).getTime() - new Date(a.touchedAt).getTime());
  const selected = candidates[0];
  if (!selected) return { eligible: false, reasonCodes: ["no_valid_touch"], fraudSignals: [] };
  const fraudSignals: string[] = [];
  if (selected.ownerId === claim.subjectHash) fraudSignals.push("self_referral_signal");
  const sameHouseholdOwners = new Set(candidates.filter((x) => x.householdHash && x.householdHash === selected.householdHash).map((x) => x.ownerId));
  if (sameHouseholdOwners.size > 1) fraudSignals.push("competing_household_referrals");
  const sameDeviceOwners = new Set(candidates.filter((x) => x.deviceHash && x.deviceHash === selected.deviceHash).map((x) => x.ownerId));
  if (sameDeviceOwners.size > 1) fraudSignals.push("competing_device_referrals");
  return { eligible: fraudSignals.length === 0, referralCode: selected.referralCode, ownerId: selected.ownerId, reasonCodes: ["last_valid_touch", `window_${selected.attributionWindowDays}_days`], fraudSignals };
}

export const emptyProofPointsState = (): ProofPointsState => ({ balance: 0, processedKeys: [], events: [] });
export function applyProofPointsEvent(state: ProofPointsState, event: ProofPointsEvent): ProofPointsState {
  if (state.processedKeys.includes(event.idempotencyKey)) return state;
  const signed = event.type === "earn" || event.type === "adjust" ? event.points : -Math.abs(event.points);
  return { balance: Math.max(0, state.balance + signed), processedKeys: [...state.processedKeys, event.idempotencyKey], events: [...state.events, event] };
}
