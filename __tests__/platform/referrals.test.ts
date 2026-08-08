import { describe, it, expect } from "vitest";
import { referralCode, decideAttribution, emptyProofPointsState, applyProofPointsEvent } from "@/lib/platform/referrals";
import type { ConversionClaim, ProofPointsEvent, ReferralTouch } from "@/lib/platform/types";

function touch(overrides: Partial<ReferralTouch> = {}): ReferralTouch {
  return {
    referralCode: "ABC1234567",
    programmeId: "programme-1",
    ownerId: "owner-1",
    subjectHash: "subject-1",
    touchedAt: "2026-01-01T00:00:00.000Z",
    attributionWindowDays: 30,
    ...overrides,
  };
}

function claim(overrides: Partial<ConversionClaim> = {}): ConversionClaim {
  return {
    programmeId: "programme-1",
    subjectHash: "subject-1",
    occurredAt: "2026-01-10T00:00:00.000Z",
    externalEventId: "evt-1",
    valueMinor: 1000,
    ...overrides,
  };
}

describe("referrals — referralCode", () => {
  it("is deterministic for the same programme/owner pair", () => {
    expect(referralCode("programme-1", "owner-1")).toBe(referralCode("programme-1", "owner-1"));
  });

  it("differs for different owners", () => {
    expect(referralCode("programme-1", "owner-1")).not.toBe(referralCode("programme-1", "owner-2"));
  });

  it("is a 10-character uppercase code", () => {
    const code = referralCode("programme-1", "owner-1");
    expect(code).toHaveLength(10);
    expect(code).toBe(code.toUpperCase());
  });
});

describe("referrals — decideAttribution", () => {
  it("is ineligible when there is no matching touch", () => {
    const decision = decideAttribution([], claim());
    expect(decision.eligible).toBe(false);
    expect(decision.reasonCodes).toContain("no_valid_touch");
  });

  it("attributes to the touch when it falls within the attribution window", () => {
    const decision = decideAttribution([touch()], claim());
    expect(decision.eligible).toBe(true);
    expect(decision.ownerId).toBe("owner-1");
    expect(decision.fraudSignals).toEqual([]);
  });

  it("does not attribute when the claim falls outside the attribution window", () => {
    const decision = decideAttribution(
      [touch({ touchedAt: "2026-01-01T00:00:00.000Z", attributionWindowDays: 7 })],
      claim({ occurredAt: "2026-01-20T00:00:00.000Z" }),
    );
    expect(decision.eligible).toBe(false);
    expect(decision.reasonCodes).toContain("no_valid_touch");
  });

  it("ignores touches from a different programme or subject", () => {
    const decision = decideAttribution(
      [touch({ programmeId: "other-programme" }), touch({ subjectHash: "other-subject" })],
      claim(),
    );
    expect(decision.eligible).toBe(false);
  });

  it("selects the most recent touch when multiple are eligible", () => {
    const decision = decideAttribution(
      [
        touch({ ownerId: "owner-old", touchedAt: "2026-01-01T00:00:00.000Z" }),
        touch({ ownerId: "owner-new", touchedAt: "2026-01-05T00:00:00.000Z" }),
      ],
      claim(),
    );
    expect(decision.ownerId).toBe("owner-new");
  });

  it("flags self-referral as a fraud signal and makes the attribution ineligible", () => {
    const decision = decideAttribution([touch({ ownerId: "subject-1" })], claim({ subjectHash: "subject-1" }));
    expect(decision.fraudSignals).toContain("self_referral_signal");
    expect(decision.eligible).toBe(false);
  });

  it("flags competing referrals from the same household as fraud", () => {
    const decision = decideAttribution(
      [
        touch({ ownerId: "owner-a", householdHash: "house-1", touchedAt: "2026-01-01T00:00:00.000Z" }),
        touch({ ownerId: "owner-b", householdHash: "house-1", touchedAt: "2026-01-05T00:00:00.000Z" }),
      ],
      claim(),
    );
    expect(decision.fraudSignals).toContain("competing_household_referrals");
    expect(decision.eligible).toBe(false);
  });

  it("flags competing referrals from the same device as fraud", () => {
    const decision = decideAttribution(
      [
        touch({ ownerId: "owner-a", deviceHash: "device-1", touchedAt: "2026-01-01T00:00:00.000Z" }),
        touch({ ownerId: "owner-b", deviceHash: "device-1", touchedAt: "2026-01-05T00:00:00.000Z" }),
      ],
      claim(),
    );
    expect(decision.fraudSignals).toContain("competing_device_referrals");
    expect(decision.eligible).toBe(false);
  });

  it("does not flag a fraud signal when only one owner shares a household/device across touches", () => {
    const decision = decideAttribution(
      [
        touch({ ownerId: "owner-a", householdHash: "house-1", deviceHash: "device-1", touchedAt: "2026-01-01T00:00:00.000Z" }),
        touch({ ownerId: "owner-a", householdHash: "house-1", deviceHash: "device-1", touchedAt: "2026-01-05T00:00:00.000Z" }),
      ],
      claim(),
    );
    expect(decision.fraudSignals).toEqual([]);
    expect(decision.eligible).toBe(true);
  });
});

describe("referrals — ProofPoints ledger", () => {
  function event(overrides: Partial<ProofPointsEvent> = {}): ProofPointsEvent {
    return { idempotencyKey: "key-1", type: "earn", points: 100, sourceId: "referral-1", ...overrides };
  }

  it("starts at a zero balance", () => {
    expect(emptyProofPointsState().balance).toBe(0);
  });

  it("adds points on earn", () => {
    const state = applyProofPointsEvent(emptyProofPointsState(), event());
    expect(state.balance).toBe(100);
  });

  it("subtracts points on redeem", () => {
    let state = applyProofPointsEvent(emptyProofPointsState(), event({ idempotencyKey: "key-1", type: "earn", points: 100 }));
    state = applyProofPointsEvent(state, event({ idempotencyKey: "key-2", type: "redeem", points: 40 }));
    expect(state.balance).toBe(60);
  });

  it("never lets the balance go negative", () => {
    let state = applyProofPointsEvent(emptyProofPointsState(), event({ idempotencyKey: "key-1", type: "earn", points: 10 }));
    state = applyProofPointsEvent(state, event({ idempotencyKey: "key-2", type: "redeem", points: 100 }));
    expect(state.balance).toBe(0);
  });

  it("is idempotent: replaying the same idempotencyKey does not double-apply", () => {
    const first = applyProofPointsEvent(emptyProofPointsState(), event());
    const replayed = applyProofPointsEvent(first, event());
    expect(replayed.balance).toBe(100);
    expect(replayed.events).toHaveLength(1);
  });

  it("reverses and expires both subtract from the balance", () => {
    let state = applyProofPointsEvent(emptyProofPointsState(), event({ idempotencyKey: "key-1", type: "earn", points: 100 }));
    state = applyProofPointsEvent(state, event({ idempotencyKey: "key-2", type: "reverse", points: 30 }));
    state = applyProofPointsEvent(state, event({ idempotencyKey: "key-3", type: "expire", points: 20 }));
    expect(state.balance).toBe(50);
  });
});
