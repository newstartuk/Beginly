import { NextRequest, NextResponse } from "next/server";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";
import { requireAdminRole } from "@/lib/platform/admin-operations";
import { collectProviderHealth } from "@/lib/platform/provider-health";

export async function GET(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    await requireAdminRole(actor, ["partner_admin", "finance_admin"]);
    const providers = await collectProviderHealth();
    if (!actor.demo) {
      for (const provider of providers) {
        await actor.supabase.from("provider_activation_states").upsert({ provider_code: provider.code, environment: process.env.BEGINLY_ENVIRONMENT ?? "local", configuration_state: provider.configured ? "configured" : "not_configured", verification_state: provider.productionVerified ? "production_verified" : provider.healthy ? "locally_healthy" : "attention", owner_user_id: actor.userId, evidence: { mode: provider.mode, requiredVariables: provider.requiredVariables, error: provider.error }, last_checked_at: provider.checkedAt }, { onConflict: "provider_code" });
        await actor.supabase.from("service_health_snapshots").insert({ provider_code: provider.code, environment: process.env.BEGINLY_ENVIRONMENT ?? "local", healthy: provider.healthy, detail: { mode: provider.mode, configured: provider.configured, error: provider.error }, checked_at: provider.checkedAt });
      }
    }
    return NextResponse.json({ providers, productionVerified: false }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
