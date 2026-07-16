import PlatformShell from "@/components/platform/PlatformShell";
import StatusPill from "@/components/platform/StatusPill";
import { Activity, Bot, CreditCard, Database, Mail, Radar, Radio, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isExplicitDemoMode } from "@/lib/platform/runtime";
import { loadAdminOperations } from "@/lib/platform/admin-operations";
import type { ApiActor } from "@/lib/platform/api-auth";
import AdminOperationsClient from "@/components/platform/AdminOperationsClient";
import { collectProviderHealth } from "@/lib/platform/provider-health";
import Link from "next/link";

export const dynamic = "force-dynamic";

const cards = [
  { icon: Database, label: "Supabase", local: "migrations + seed + pgTAP", configured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) },
  { icon: Mail, label: "Email", local: process.env.EMAIL_PROVIDER ?? "memory emulator", configured: Boolean(process.env.RESEND_API_KEY) },
  { icon: CreditCard, label: "Payments", local: process.env.PAYMENT_PROVIDER ?? "signed billing simulator", configured: Boolean(process.env.STRIPE_SECRET_KEY) },
  { icon: Bot, label: "Nia AI", local: process.env.AI_PROVIDER ?? "deterministic provider", configured: Boolean(process.env.AI_API_KEY) },
  { icon: Radar, label: "Opportunities", local: process.env.OPPORTUNITY_PROVIDER ?? "fixture + JSON/CSV/REST", configured: Boolean(process.env.OPPORTUNITY_API_URL) },
  { icon: Radio, label: "Push", local: process.env.PUSH_PROVIDER ?? "delivery emulator", configured: Boolean(process.env.EXPO_ACCESS_TOKEN) },
  { icon: Activity, label: "Observability", local: "privacy-safe JSONL sink", configured: Boolean(process.env.OBSERVABILITY_DSN) },
];

async function operationsActor(): Promise<ApiActor> {
  const supabase = await createServerSupabaseClient();
  if (isExplicitDemoMode()) return { userId: "demo-user", email: "demo@beginly.test", requestId: "server-page", demo: true, supabase: supabase as never };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/admin/operations");
  return { userId: user.id, email: user.email, requestId: "server-page", demo: false, supabase: supabase as never };
}

export default async function OperationsPage() {
  const operations = await loadAdminOperations(await operationsActor()).catch(() => null);
  const providerHealth = await collectProviderHealth();
  if (!operations) redirect("/platform");
  return <PlatformShell title="Activation and operations" eyebrow="Controlled operations centre" action={<StatusPill tone="positive">Role: {operations.role}</StatusPill>}>
    <section className="admin-policy"><h2>Truthful readiness boundary</h2><p>Local providers, deterministic Nia, synthetic users, migrations, activation controls and operational contracts are implemented. Live provider and production verification remain explicit gates.</p></section>
    <div className="admin-metrics">{cards.map(({ icon: Icon, label, local, configured }) => <article key={label}><Icon/><strong>{configured ? "Configured" : "Local"}</strong><span>{label}: {local}</span></article>)}</div>
    <section className="admin-policy"><h2>Executable provider health</h2><p>Configuration and local adapter health are evaluated without converting configuration into a production-verification claim.</p><Link href="/admin/observability">Open observability evidence</Link></section>
    <div className="admin-metrics">{providerHealth.map((provider)=><article key={provider.code}><Activity/><strong>{provider.healthy?"Healthy":"Attention"}</strong><span>{provider.code}: {provider.mode}{provider.error?` · ${provider.error}`:""}</span><StatusPill tone={provider.healthy?"positive":"warning"}>{provider.configured?"configured":"local/unconfigured"}</StatusPill></article>)}</div>
    <section className="admin-policy"><h2>Live operational queues</h2><p>These counts are loaded through the authenticated administrator authority path, not from a static dashboard.</p></section>
    <div className="admin-metrics">{operations.queues.map((queue) => <article key={queue.id}><ShieldCheck/><strong>{queue.count} · {queue.label}</strong><span>{queue.detail}</span><StatusPill tone={queue.status === "attention" ? "warning" : "positive"}>{queue.status}</StatusPill></article>)}</div>
    <AdminOperationsClient initialItems={operations.items}/><section className="admin-policy"><h2>Safe production rule</h2><p>Production adapters fail securely when credentials are missing. Financial, safety, household, outbound-link and content-publication records retain audit history.</p></section>
  </PlatformShell>;
}
