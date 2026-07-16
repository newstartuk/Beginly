import type { ProviderHealth } from "@/lib/providers/types";
import { createAIProvider } from "@/lib/providers/ai";
import { createEmailProvider } from "@/lib/providers/email";
import { createPaymentProvider } from "@/lib/providers/payments";
import { createOpportunityConnector } from "@/lib/providers/opportunities";
import { createPushProvider } from "@/lib/providers/push";
import { createObservabilitySink } from "@/lib/providers/observability";

export interface ProviderHealthRecord extends ProviderHealth { code: string; configured: boolean; requiredVariables: string[]; error?: string }

const configured = (names: string[]) => names.every((name) => Boolean(process.env[name]?.trim()));

export async function collectProviderHealth(): Promise<ProviderHealthRecord[]> {
  const definitions = [
    { code: "email", vars: ["RESEND_API_KEY", "EMAIL_FROM"], enabled: process.env.EMAIL_PROVIDER === "resend", factory: () => createEmailProvider() },
    { code: "payments", vars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"], enabled: process.env.PAYMENT_PROVIDER === "stripe", factory: () => createPaymentProvider() },
    { code: "nia", vars: ["AI_API_KEY", "AI_GATEWAY_URL"], enabled: process.env.AI_PROVIDER === "remote", factory: () => createAIProvider() },
    { code: "opportunities", vars: ["OPPORTUNITY_API_URL", "OPPORTUNITY_API_KEY"], enabled: process.env.OPPORTUNITY_PROVIDER === "rest", factory: () => createOpportunityConnector() },
    { code: "push", vars: ["EXPO_ACCESS_TOKEN"], enabled: process.env.PUSH_PROVIDER === "expo", factory: () => createPushProvider() },
    { code: "jobs", vars: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"], enabled: true, factory: () => ({ health: async () => ({ provider: "supabase-job-outbox", mode: "persistent-worker", healthy: configured(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]), productionVerified: false, checkedAt: new Date().toISOString(), details: { workerCommand: "npm run jobs:process", boundedRetries: true, deadLetter: true } }) }) },
    { code: "observability", vars: ["OBSERVABILITY_DSN"], enabled: Boolean(process.env.OBSERVABILITY_DSN), factory: () => createObservabilitySink() },
  ];
  return Promise.all(definitions.map(async (definition): Promise<ProviderHealthRecord> => {
    const isConfigured = definition.vars.length === 0 || configured(definition.vars);
    if (definition.enabled && !isConfigured) return { code: definition.code, configured: false, requiredVariables: definition.vars, provider: definition.code, mode: "not_configured", healthy: false, productionVerified: false, checkedAt: new Date().toISOString(), error: "Required environment variables are missing." };
    try {
      const health = await definition.factory().health();
      return { ...health, code: definition.code, configured: definition.enabled ? isConfigured : false, requiredVariables: definition.vars };
    } catch (error) {
      return { code: definition.code, configured: isConfigured, requiredVariables: definition.vars, provider: definition.code, mode: definition.enabled ? "configuration_error" : "local", healthy: false, productionVerified: false, checkedAt: new Date().toISOString(), error: error instanceof Error ? error.message : String(error) };
    }
  }));
}
