import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import PlatformShell from "@/components/platform/PlatformShell";
import StatusPill from "@/components/platform/StatusPill";
import ProductEntryForm from "@/components/platform/ProductEntryForm";
import SubscriptionControls from "@/components/platform/SubscriptionControls";
import { getProduct, PRODUCTS } from "@/lib/platform/catalog";
import { loadStandaloneProductAccess } from "@/lib/platform/product-entry";
import { CheckCircle2, ArrowRight, Compass } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  const access = await loadStandaloneProductAccess(id);
  if (!access) redirect(`/login?redirect=${encodeURIComponent(`/products/${id}/workspace`)}`);
  if (!access.owned) redirect(`/products/${id}`);
  const entryReady = access.entry?.state === "active";

  return <PlatformShell title={`${product.name} workspace`} eyebrow="Standalone value · optional wider journey" action={<StatusPill tone="positive">Included through {access.sourceLabels.join(", ") || "active entitlement"}</StatusPill>}>
    <section className="product-principle"><div><h2>{product.promise}</h2><p>Use this product directly with product-specific context. You do not need to complete unrelated settlement onboarding before receiving value.</p></div></section>
    <div className="product-detail-grid">
      <section><h3>Available capabilities</h3>{product.capabilities.map((capability) => <div className="capability-row" key={capability}><CheckCircle2 size={18}/><span>{capability.replaceAll("_", " ")}</span></div>)}</section>
      <ProductEntryForm productId={product.id} productName={product.name} initial={access.entry ? { routeContext: access.entry.routeContext, goal: access.entry.goal, contextNotes: access.entry.contextNotes, personalisationConsent: access.entry.personalisationConsent } : null}/>
    </div>
    <section className="trust-panel">
      <Compass size={24}/><h3>{entryReady ? "Use your configured product" : "Complete the short setup first"}</h3>
      <p>{entryReady ? "Nia can use only the product context you approved. The wider Beginly Free journey remains available whenever it becomes useful." : "This keeps the product immediately useful while preventing Beginly from guessing your route or goals."}</p>
      <div className="platform-hero-actions">
        {entryReady && <Link className="platform-primary" href={`/nia?product=${encodeURIComponent(product.id)}`}>Ask Nia within this product <ArrowRight size={16}/></Link>}
        <Link className="platform-secondary" href="/onboarding">Activate the wider free journey</Link>
      </div>
    </section>
    <SubscriptionControls productId={product.id} recurring={product.billingInterval === "month" || product.billingInterval === "year"} alternatives={PRODUCTS.filter((item) => item.id !== product.id && item.kind !== "business").map((item) => ({ id: item.id, name: item.name }))}/>
  </PlatformShell>;
}
