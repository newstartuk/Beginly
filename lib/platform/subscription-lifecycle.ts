import type { ApiActor } from "./api-auth";
import { ApiAuthError } from "./api-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getProduct } from "./catalog";
import { recordPlatformEvent } from "./observability";
import { subscriptionTransition, type SubscriptionAction } from "./subscription-policy";
export type { SubscriptionAction } from "./subscription-policy";
export interface SubscriptionView { productId: string; subscriptionId?: string; status: "not_subscribed" | "active" | "paused" | "cancelled"; currentPeriodEnd?: string; providerManaged: boolean; latestAction?: { action: string; effectiveAt?: string; createdAt: string } }

export async function loadSubscriptionView(actor: ApiActor, productId: string): Promise<SubscriptionView> {
  const product = getProduct(productId); if (!product) throw new ApiAuthError(404, "product_not_found", "Product not found.");
  if (actor.demo) return { productId, subscriptionId: product.billingInterval === "month" || product.billingInterval === "year" ? "demo-subscription" : undefined, status: product.billingInterval === "month" || product.billingInterval === "year" ? "active" : "not_subscribed", providerManaged: false };
  const { data, error } = await actor.supabase.from("subscriptions").select("id,status,current_period_end,provider_subscription_id").eq("actor_id", actor.userId).eq("product_id", productId).maybeSingle();
  if (error) throw error;
  if (!data) return { productId, status: "not_subscribed", providerManaged: false };
  const { data: actions, error: actionError } = await actor.supabase.from("subscription_lifecycle_actions").select("action,effective_at,created_at").eq("subscription_id", data.id).order("created_at", { ascending: false }).limit(1);
  if (actionError) throw actionError;
  return { productId, subscriptionId: data.id, status: data.status as SubscriptionView["status"], currentPeriodEnd: data.current_period_end ?? undefined, providerManaged: Boolean(data.provider_subscription_id), latestAction: actions?.[0] ? { action: actions[0].action, effectiveAt: actions[0].effective_at ?? undefined, createdAt: actions[0].created_at } : undefined };
}

export async function requestSubscriptionAction(actor: ApiActor, input: { productId: string; action: SubscriptionAction; replacementProductId?: string; reasonCodes?: string[]; idempotencyKey: string }) {
  const product = getProduct(input.productId); if (!product) throw new ApiAuthError(404, "product_not_found", "Product not found.");
  if (input.action === "replace" && (!input.replacementProductId || !getProduct(input.replacementProductId))) throw new ApiAuthError(400, "replacement_required", "Choose a valid replacement product.");
  if (actor.demo) return { state: input.action === "replace" ? "handoff" : "complete", action: input.action, href: input.action === "replace" ? `/products/${input.replacementProductId}` : undefined, effectiveAt: new Date().toISOString() };
  const { data: subscription, error } = await actor.supabase.from("subscriptions").select("id,status,current_period_end,provider_subscription_id").eq("actor_id", actor.userId).eq("product_id", input.productId).maybeSingle();
  if (error) throw error;
  if (!subscription) throw new ApiAuthError(404, "subscription_not_found", "No recurring subscription exists for this product.");
  const transition = subscriptionTransition(subscription.status as SubscriptionView["status"], input.action);
  if (!transition.allowed) return { state: transition.reason ?? "not_allowed", action: input.action };
  const admin = createAdminSupabaseClient();
  const effectiveAt = input.action === "cancel" && subscription.current_period_end ? subscription.current_period_end : new Date().toISOString();
  const retainedWork = { preserveCompletedWork: true, replacementProductId: input.replacementProductId };
  const { data: lifecycle, error: lifecycleError } = await admin.from("subscription_lifecycle_actions").upsert({ subscription_id: subscription.id, action: input.action, requested_by: actor.userId, reason_codes: input.reasonCodes ?? ["user_requested"], effective_at: effectiveAt, retained_work: retainedWork, idempotency_key: input.idempotencyKey, state: "requested" }, { onConflict: "idempotency_key" }).select("id").single();
  if (lifecycleError) throw lifecycleError;
  if (input.action === "replace") {
    await admin.from("subscription_lifecycle_actions").update({ state: "completed", completed_at: new Date().toISOString(), provider_result: { handoff: true, replacement_product_id: input.replacementProductId } }).eq("id", lifecycle.id);
    await recordPlatformEvent({ level: "info", category: "subscription", message: "Subscription replacement handoff created", actorId: actor.userId, requestId: actor.requestId, metadata: { productId: input.productId, replacementProductId: input.replacementProductId } });
    return { state: "handoff", action: input.action, lifecycleActionId: lifecycle.id, href: `/products/${input.replacementProductId}`, effectiveAt };
  }
  const local = (process.env.PAYMENT_PROVIDER ?? "local") === "local" || !subscription.provider_subscription_id;
  if (local) {
    const status = input.action === "resume" ? "active" : input.action === "pause" ? "paused" : "cancelled";
    const { error: updateError } = await admin.from("subscriptions").update({ status, cancelled_at: status === "cancelled" ? effectiveAt : null, updated_at: new Date().toISOString() }).eq("id", subscription.id);
    if (updateError) throw updateError;
    if (input.action === "resume") {
      const { data: entitlement } = await admin.from("entitlements").select("id").eq("actor_id", actor.userId).eq("product_id", input.productId).is("ends_at", null).maybeSingle();
      if (!entitlement) await admin.from("entitlements").insert({ actor_id: actor.userId, source: "subscription", scope: product.scope, product_id: input.productId, starts_at: new Date().toISOString(), autonomy_level: product.autonomyLevel, conditions: { resumed_by: lifecycle.id } });
    } else {
      await admin.from("entitlements").update({ ends_at: effectiveAt, conditions: { lifecycle_action: input.action, retained_work: true } }).eq("actor_id", actor.userId).eq("product_id", input.productId).is("ends_at", null);
    }
    await admin.from("subscription_lifecycle_actions").update({ state: "completed", completed_at: new Date().toISOString(), provider_result: { provider: "local", status } }).eq("id", lifecycle.id);
    await recordPlatformEvent({ level: "info", category: "subscription", message: `Subscription ${input.action} completed locally`, actorId: actor.userId, requestId: actor.requestId, metadata: { productId: input.productId } });
    return { state: "complete", action: input.action, lifecycleActionId: lifecycle.id, effectiveAt };
  }
  const { error: jobError } = await admin.from("job_outbox").upsert({ queue: "billing", job_type: "subscription_lifecycle", payload: { lifecycleActionId: lifecycle.id, subscriptionId: subscription.id, providerSubscriptionId: subscription.provider_subscription_id, actorId: actor.userId, productId: input.productId, action: input.action, effectiveAt }, state: "queued", idempotency_key: `subscription:${input.idempotencyKey}`, run_at: new Date().toISOString() }, { onConflict: "idempotency_key" });
  if (jobError) throw jobError;
  await admin.from("subscription_lifecycle_actions").update({ state: "queued" }).eq("id", lifecycle.id);
  await recordPlatformEvent({ level: "info", category: "subscription", message: `Subscription ${input.action} queued`, actorId: actor.userId, requestId: actor.requestId, metadata: { productId: input.productId } });
  return { state: "queued", action: input.action, lifecycleActionId: lifecycle.id, effectiveAt };
}
