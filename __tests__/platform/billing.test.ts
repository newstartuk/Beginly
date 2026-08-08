import { describe, it, expect } from "vitest";
import { applyBillingEvent, activeProductIds, emptyBillingState } from "@/lib/platform/billing";
import type { BillingEvent } from "@/lib/platform/types";

function event(overrides: Partial<BillingEvent> = {}): BillingEvent {
  return {
    id: "evt-1",
    idempotencyKey: "key-1",
    type: "checkout_completed",
    actorId: "user-1",
    productId: "career_pro",
    amountMinor: 1900,
    currency: "GBP",
    occurredAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("billing — applyBillingEvent", () => {
  it("activates a product and records the paid amount on checkout_completed", () => {
    const state = applyBillingEvent(emptyBillingState("user-1"), event());
    expect(state.products.career_pro.status).toBe("active");
    expect(state.products.career_pro.paidMinor).toBe(1900);
  });

  it("accumulates paidMinor across multiple invoice_paid events for the same product", () => {
    let state = emptyBillingState("user-1");
    state = applyBillingEvent(state, event({ idempotencyKey: "key-1", type: "invoice_paid", amountMinor: 1900 }));
    state = applyBillingEvent(state, event({ idempotencyKey: "key-2", type: "invoice_paid", amountMinor: 1900 }));
    expect(state.products.career_pro.paidMinor).toBe(3800);
    expect(state.products.career_pro.status).toBe("active");
  });

  it("is idempotent: replaying the same idempotencyKey has no effect", () => {
    const first = applyBillingEvent(emptyBillingState("user-1"), event());
    const replayed = applyBillingEvent(first, event());
    expect(replayed).toEqual(first);
    expect(replayed.products.career_pro.paidMinor).toBe(1900);
  });

  it("ignores events for a different actorId (cross-account event should not mutate state)", () => {
    const state = applyBillingEvent(emptyBillingState("user-1"), event({ actorId: "user-2" }));
    expect(state).toEqual(emptyBillingState("user-1"));
  });

  it("transitions a product through pause / resume / cancel", () => {
    let state = applyBillingEvent(emptyBillingState("user-1"), event({ idempotencyKey: "key-1" }));
    state = applyBillingEvent(state, event({ idempotencyKey: "key-2", type: "subscription_paused", amountMinor: 0 }));
    expect(state.products.career_pro.status).toBe("paused");

    state = applyBillingEvent(state, event({ idempotencyKey: "key-3", type: "subscription_resumed", amountMinor: 0 }));
    expect(state.products.career_pro.status).toBe("active");

    state = applyBillingEvent(state, event({ idempotencyKey: "key-4", type: "subscription_cancelled", amountMinor: 0 }));
    expect(state.products.career_pro.status).toBe("cancelled");
  });

  it("records a refund and accumulates refundedMinor", () => {
    let state = applyBillingEvent(emptyBillingState("user-1"), event({ idempotencyKey: "key-1" }));
    state = applyBillingEvent(state, event({ idempotencyKey: "key-2", type: "refund_completed", amountMinor: 1900 }));
    expect(state.products.career_pro.status).toBe("refunded");
    expect(state.products.career_pro.refundedMinor).toBe(1900);
    // The original paid amount must be retained for audit -- a refund must never erase billing history.
    expect(state.products.career_pro.paidMinor).toBe(1900);
  });

  it("merges retainedWorkProductIds across events without duplicates", () => {
    let state = emptyBillingState("user-1");
    state = applyBillingEvent(state, event({ idempotencyKey: "key-1", workProductIds: ["cv-draft-1"] }));
    state = applyBillingEvent(state, event({ idempotencyKey: "key-2", type: "invoice_paid", workProductIds: ["cv-draft-1", "cover-letter-1"] }));
    expect(state.retainedWorkProductIds.sort()).toEqual(["cover-letter-1", "cv-draft-1"]);
  });

  it("tracks independent status per product for the same actor", () => {
    let state = emptyBillingState("user-1");
    state = applyBillingEvent(state, event({ idempotencyKey: "key-1", productId: "career_pro" }));
    state = applyBillingEvent(state, event({ idempotencyKey: "key-2", productId: "cv_studio", amountMinor: 1200 }));
    state = applyBillingEvent(state, event({ idempotencyKey: "key-3", productId: "career_pro", type: "subscription_cancelled", amountMinor: 0 }));
    expect(state.products.career_pro.status).toBe("cancelled");
    expect(state.products.cv_studio.status).toBe("active");
  });
});

describe("billing — activeProductIds", () => {
  it("returns only products with active status", () => {
    let state = emptyBillingState("user-1");
    state = applyBillingEvent(state, event({ idempotencyKey: "key-1", productId: "career_pro" }));
    state = applyBillingEvent(state, event({ idempotencyKey: "key-2", productId: "cv_studio", amountMinor: 1200 }));
    state = applyBillingEvent(state, event({ idempotencyKey: "key-3", productId: "cv_studio", type: "subscription_cancelled", amountMinor: 0 }));
    expect(activeProductIds(state)).toEqual(["career_pro"]);
  });

  it("returns an empty array for a fresh billing state", () => {
    expect(activeProductIds(emptyBillingState("user-1"))).toEqual([]);
  });
});
