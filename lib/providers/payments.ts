import { applyBillingEvent, emptyBillingState } from "../platform/billing";
import type { BillingEvent, BillingState } from "../platform/types";
import { IdempotencyMemory, nowIso, providerId, requireProductionSecret, signPayload, verifyPayloadSignature } from "./core";
import type { CheckoutRequest, CheckoutSession, PaymentProvider, PaymentWebhookResult, ProviderHealth } from "./types";

interface LocalWebhook { event: BillingEvent }

export class LocalPaymentProvider implements PaymentProvider {
  readonly name = "local-billing-simulator";
  private readonly secret: string;
  private readonly sessions = new IdempotencyMemory<CheckoutSession>();
  private readonly processed = new IdempotencyMemory<PaymentWebhookResult>();
  private readonly states = new Map<string, BillingState>();

  constructor(secret = process.env.LOCAL_PAYMENT_WEBHOOK_SECRET ?? "beginly-local-payment-webhook-secret-2026") { this.secret = secret; }

  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    const existing = this.sessions.get(request.idempotencyKey);
    if (existing) return existing;
    return this.sessions.set(request.idempotencyKey, {
      id: providerId("checkout"), provider: this.name, status: "created", url: `http://127.0.0.1:4577/payments/checkout/${request.idempotencyKey}`, request,
    });
  }

  sign(payload: string): string { return signPayload(this.secret, payload); }

  buildWebhook(event: BillingEvent): { payload: string; signature: string } {
    const payload = JSON.stringify({ event } satisfies LocalWebhook);
    return { payload, signature: this.sign(payload) };
  }

  async processWebhook(payload: string, signature: string): Promise<PaymentWebhookResult> {
    if (!verifyPayloadSignature(this.secret, payload, signature)) return { accepted: false, duplicate: false, reason: "invalid_signature" };
    let parsed: LocalWebhook;
    try { parsed = JSON.parse(payload) as LocalWebhook; } catch { return { accepted: false, duplicate: false, reason: "invalid_json" }; }
    const existing = this.processed.get(parsed.event.idempotencyKey);
    if (existing) return { ...existing, duplicate: true };
    const current = this.states.get(parsed.event.actorId) ?? emptyBillingState(parsed.event.actorId);
    const state = applyBillingEvent(current, parsed.event);
    this.states.set(parsed.event.actorId, state);
    return this.processed.set(parsed.event.idempotencyKey, { accepted: true, duplicate: false, billingEvent: parsed.event, state });
  }

  state(actorId: string): BillingState { return this.states.get(actorId) ?? emptyBillingState(actorId); }

  async health(): Promise<ProviderHealth> {
    return { provider: this.name, mode: "local", healthy: true, productionVerified: false, checkedAt: nowIso(), details: { sessions: this.sessions.entries().length, actors: this.states.size } };
  }
}

export class StripePaymentProvider implements PaymentProvider {
  readonly name = "stripe";
  private readonly webhookSecret: string;
  private readonly stripe: import("stripe").default;
  constructor(options: { secretKey?: string; webhookSecret?: string } = {}) {
    const secretKey = requireProductionSecret(this.name, options.secretKey ?? process.env.STRIPE_SECRET_KEY);
    this.webhookSecret = requireProductionSecret(this.name, options.webhookSecret ?? process.env.STRIPE_WEBHOOK_SECRET);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require("stripe") as typeof import("stripe").default;
    this.stripe = new Stripe(secretKey, { appInfo: { name: "Beginly", version: "1.3.0" } });
  }
  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    const recurring = request.billingInterval === "month" || request.billingInterval === "year";
    const metadata = { actor_id: request.actorId, product_id: request.productId, idempotency_key: request.idempotencyKey, work_product_ids: (request.workProductIds ?? []).join(",") };
    const session = await this.stripe.checkout.sessions.create({
      mode: recurring ? "subscription" : "payment",
      success_url: `${request.returnUrl}${request.returnUrl.includes("?") ? "&" : "?"}checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.returnUrl}${request.returnUrl.includes("?") ? "&" : "?"}checkout=cancelled`,
      client_reference_id: request.actorId,
      metadata,
      line_items: [{ quantity: 1, price_data: { currency: request.currency.toLowerCase(), unit_amount: request.amountMinor, product_data: { name: request.productName ?? request.productId, metadata: { product_id: request.productId } }, ...(recurring ? { recurring: { interval: request.billingInterval as "month" | "year" } } : {}) } }],
      ...(recurring ? { subscription_data: { metadata } } : { payment_intent_data: { metadata } }),
    }, { idempotencyKey: request.idempotencyKey });
    return { id: session.id, provider: this.name, status: session.status === "complete" ? "complete" : "created", url: session.url ?? request.returnUrl, request };
  }
  async processWebhook(payload: string, signature: string): Promise<PaymentWebhookResult> {
    let event: import("stripe").default.Event;
    try { event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret); }
    catch { return { accepted: false, duplicate: false, reason: "invalid_signature" }; }
    const object = event.data.object as unknown as Record<string, any>;
    const subscriptionDetails = object.parent?.subscription_details ?? object.subscription_details ?? {};
    const metadata = (object.metadata ?? subscriptionDetails.metadata ?? {}) as Record<string, string>;
    const actorId = metadata.actor_id;
    const productId = metadata.product_id;
    if (!actorId || !productId) return { accepted: false, duplicate: false, reason: "missing_beginly_metadata" };
    const mapping: Record<string, BillingEvent["type"] | undefined> = {
      "checkout.session.completed": "checkout_completed",
      "invoice.paid": "invoice_paid",
      "customer.subscription.paused": "subscription_paused",
      "customer.subscription.resumed": "subscription_resumed",
      "customer.subscription.deleted": "subscription_cancelled",
      "charge.refunded": "refund_completed",
    };
    const type = mapping[event.type];
    if (!type) return { accepted: true, duplicate: false, reason: "event_ignored" };
    const amountMinor = Number(object.amount_total ?? object.amount_paid ?? object.amount_refunded ?? 0);
    const rawSubscription = object.subscription ?? subscriptionDetails.subscription ?? (String(object.object ?? "") === "subscription" ? object.id : undefined);
    const providerSubscriptionId = typeof rawSubscription === "string" ? rawSubscription : rawSubscription?.id;
    const rawCustomer = object.customer;
    const providerCustomerId = typeof rawCustomer === "string" ? rawCustomer : rawCustomer?.id;
    const periodEndSeconds = Number(object.current_period_end ?? object.lines?.data?.[0]?.period?.end ?? 0);
    const billingEvent: BillingEvent = {
      id: event.id,
      idempotencyKey: `stripe:${event.id}`,
      type,
      actorId,
      productId,
      amountMinor,
      currency: String(object.currency ?? "gbp").toUpperCase() === "GBP" ? "GBP" : "GBP",
      occurredAt: new Date(event.created * 1000).toISOString(),
      workProductIds: metadata.work_product_ids?.split(",").filter(Boolean),
      providerCustomerId,
      providerSubscriptionId,
      currentPeriodEnd: periodEndSeconds > 0 ? new Date(periodEndSeconds * 1000).toISOString() : undefined,
      cancelAtPeriodEnd: typeof object.cancel_at_period_end === "boolean" ? object.cancel_at_period_end : undefined,
    };
    return { accepted: true, duplicate: false, billingEvent };
  }
  async health(): Promise<ProviderHealth> { return { provider: this.name, mode: "production-adapter", healthy: true, productionVerified: false, checkedAt: nowIso() }; }
}

export function createPaymentProvider(mode = process.env.PAYMENT_PROVIDER ?? "local"): PaymentProvider {
  return mode === "stripe" ? new StripePaymentProvider() : new LocalPaymentProvider();
}
