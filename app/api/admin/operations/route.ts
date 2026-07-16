import { NextRequest, NextResponse } from "next/server";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";
import { loadAdminOperations } from "@/lib/platform/admin-operations";

export const dynamic = "force-dynamic";

const activationCards = [
  { id: "supabase", label: "Supabase", localMode: "migrations/seed/pgTAP", configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY), externalGate: "Apply migrations, run RLS and restore rehearsal", activationDoc: "docs/activation/SUPABASE_ACTIVATION.md" },
  { id: "email", label: "Email", localMode: process.env.EMAIL_PROVIDER ?? "memory", configured: Boolean(process.env.RESEND_API_KEY), externalGate: "Verify domain, signed webhook, delivery and bounce", activationDoc: "docs/activation/RESEND_ACTIVATION.md" },
  { id: "payment", label: "Payments", localMode: process.env.PAYMENT_PROVIDER ?? "local", configured: Boolean(process.env.STRIPE_SECRET_KEY), externalGate: "Test-mode checkout, refund and reconciliation", activationDoc: "docs/activation/STRIPE_ACTIVATION.md" },
  { id: "ai", label: "Nia AI", localMode: process.env.AI_PROVIDER ?? "deterministic", configured: Boolean(process.env.AI_API_KEY), externalGate: "Grounding, safety, latency and cost evaluation", activationDoc: "docs/activation/AI_NIA_ACTIVATION.md" },
  { id: "opportunities", label: "Opportunities", localMode: process.env.OPPORTUNITY_PROVIDER ?? "fixture/JSON/CSV/REST", configured: Boolean(process.env.OPPORTUNITY_API_URL), externalGate: "Connector, stale-data, provider-failure and ingestion verification", activationDoc: "docs/activation/OPPORTUNITY_CONNECTORS_ACTIVATION.md" },
  { id: "push", label: "Push", localMode: process.env.PUSH_PROVIDER ?? "local", configured: Boolean(process.env.EXPO_ACCESS_TOKEN), externalGate: "Real-device token, receipt and deep-link verification", activationDoc: "docs/activation/EXPO_PUSH_ACTIVATION.md" },
  { id: "observability", label: "Observability", localMode: "JSONL sink", configured: Boolean(process.env.OBSERVABILITY_DSN), externalGate: "Production alert provider and redaction verification", activationDoc: "docs/activation/OBSERVABILITY_ACTIVATION.md" },
];

export async function GET(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request);
    requestId = actor.requestId;
    const operations = await loadAdminOperations(actor);
    let localServices: unknown = { status: "not_running" };
    try {
      const response = await fetch(`${process.env.BEGINLY_LOCAL_SERVICES_URL ?? "http://127.0.0.1:4577"}/health`, { cache: "no-store", signal: AbortSignal.timeout(1500) });
      if (response.ok) localServices = await response.json();
    } catch {}
    return NextResponse.json({
      ...operations,
      localServices,
      activationCards,
      gates: {
        localSimulation: "implemented",
        databaseRuntime: process.env.SUPABASE_SERVICE_ROLE_KEY ? "configured_not_verified" : "runtime_gate",
        productionProviders: activationCards.every((item) => item.configured) ? "configured_not_verified" : "external_gate",
        productionVerified: false,
      },
    }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    return apiFailure(error, requestId);
  }
}
