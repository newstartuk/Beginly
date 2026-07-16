export type SubscriptionStatus = "not_subscribed" | "active" | "paused" | "cancelled";
export type SubscriptionAction = "pause" | "resume" | "cancel" | "replace";
export function subscriptionTransition(status: SubscriptionStatus, action: SubscriptionAction): { allowed: boolean; nextStatus: SubscriptionStatus; reason?: string } {
  if (action === "replace") return status === "not_subscribed" ? { allowed: false, nextStatus: status, reason: "subscription_not_found" } : { allowed: true, nextStatus: status };
  if (action === "pause") return status === "active" ? { allowed: true, nextStatus: "paused" } : { allowed: false, nextStatus: status, reason: status === "cancelled" ? "already_cancelled" : "not_active" };
  if (action === "resume") return status === "paused" ? { allowed: true, nextStatus: "active" } : { allowed: false, nextStatus: status, reason: status === "active" ? "already_active" : "not_paused" };
  if (action === "cancel") return status === "active" || status === "paused" ? { allowed: true, nextStatus: "cancelled" } : { allowed: false, nextStatus: status, reason: status === "cancelled" ? "already_cancelled" : "subscription_not_found" };
  return { allowed: false, nextStatus: status, reason: "invalid_action" };
}
