import type { ApiActor } from "./api-auth";
import { requireAdminRole } from "./admin-operations";

export interface CommissionTotals { confirmedMinor: number; reversedMinor: number; paidMinor: number; payableMinor: number }
export function reconcileLedger(events: Array<{ event_type: string; amount_minor: number }>): CommissionTotals {
  const total = (type: string) => events.filter((event) => event.event_type === type).reduce((sum, event) => sum + Number(event.amount_minor || 0), 0);
  const confirmedMinor = total("confirmed_conversion");
  const reversedMinor = Math.abs(total("reversal"));
  const paidMinor = total("payout");
  return { confirmedMinor, reversedMinor, paidMinor, payableMinor: Math.max(0, confirmedMinor - reversedMinor - paidMinor) };
}

export function calculateCommission(rule: Record<string, unknown>, conversionValueMinor: number): number {
  if (rule.type === "fixed") return Math.max(0, Math.round(Number(rule.amount_minor ?? 0)));
  if (rule.type === "percent") return Math.max(0, Math.round(conversionValueMinor * Number(rule.basis_points ?? 0) / 10_000));
  if (rule.type === "tiered" && Array.isArray(rule.tiers)) {
    const tiers = (rule.tiers as Array<Record<string, unknown>>).sort((a, b) => Number(b.minimum_minor ?? 0) - Number(a.minimum_minor ?? 0));
    const tier = tiers.find((item) => conversionValueMinor >= Number(item.minimum_minor ?? 0));
    return tier ? calculateCommission(tier, conversionValueMinor) : 0;
  }
  return 0;
}

export async function runCommissionReconciliation(actor: ApiActor, programmeId: string, periodStart: string, periodEnd: string) {
  await requireAdminRole(actor, ["finance_admin", "partner_admin"]);
  const { data, error } = await actor.supabase.from("commission_ledger").select("event_type,amount_minor").eq("programme_id", programmeId).gte("occurred_at", periodStart).lt("occurred_at", periodEnd);
  if (error) throw error;
  const totals = reconcileLedger(data ?? []);
  if (actor.demo) return { programmeId, ...totals, discrepancyMinor: 0, state: "complete" };
  const { data: run, error: runError } = await actor.supabase.from("commission_reconciliation_runs").insert({ programme_id: programmeId, period_start: periodStart, period_end: periodEnd, confirmed_minor: totals.confirmedMinor, reversed_minor: totals.reversedMinor, paid_minor: totals.paidMinor, payable_minor: totals.payableMinor, discrepancy_minor: 0, state: "complete", evidence: { eventCount: data?.length ?? 0 }, approved_by: actor.userId, completed_at: new Date().toISOString() }).select("*").single();
  if (runError) throw runError;
  return run;
}
