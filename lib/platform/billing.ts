import type { BillingEvent, BillingState } from "./types";

export const emptyBillingState = (actorId: string): BillingState => ({ actorId, products: {}, retainedWorkProductIds: [], processedEventKeys: [] });

export function applyBillingEvent(state: BillingState, event: BillingEvent): BillingState {
  if (event.actorId !== state.actorId || state.processedEventKeys.includes(event.idempotencyKey)) return state;
  const current = state.products[event.productId] ?? { status: "cancelled" as const, paidMinor: 0, refundedMinor: 0 };
  const product = { ...current };
  if (event.type === "checkout_completed" || event.type === "invoice_paid") { product.status = "active"; product.paidMinor += event.amountMinor; }
  if (event.type === "subscription_paused") product.status = "paused";
  if (event.type === "subscription_resumed") product.status = "active";
  if (event.type === "subscription_cancelled") product.status = "cancelled";
  if (event.type === "refund_completed") { product.status = "refunded"; product.refundedMinor += event.amountMinor; }
  return {
    ...state,
    products: { ...state.products, [event.productId]: product },
    retainedWorkProductIds: [...new Set([...state.retainedWorkProductIds, ...(event.workProductIds ?? [])])],
    processedEventKeys: [...state.processedEventKeys, event.idempotencyKey],
  };
}

export function activeProductIds(state: BillingState): string[] {
  return Object.entries(state.products).filter(([, value]) => value.status === "active").map(([id]) => id);
}
