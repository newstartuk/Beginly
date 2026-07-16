import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PlatformShell from "@/components/platform/PlatformShell";
import StatusPill from "@/components/platform/StatusPill";
import ProductAction from "@/components/platform/ProductAction";
import JsonLd from "@/components/seo/JsonLd";
import { getProduct, PRODUCTS } from "@/lib/platform/catalog";
import { loadOptionalPlatformContext } from "@/lib/platform/server-context";
import { productCoverage } from "@/lib/platform/entitlements";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return PRODUCTS.map((product) => ({ id: product.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params; const product = getProduct(id); if (!product) return {};
  return { title: product.name, description: product.promise, alternates: { canonical: `/products/${product.id}` }, openGraph: { title: product.name, description: product.promise, url: `https://beginly.app/products/${product.id}` } };
}
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const product = getProduct(id); if (!product) notFound();
  const context = await loadOptionalPlatformContext();
  const coverage = context ? productCoverage(context).find((item) => item.product.id === id) : undefined; const owned = coverage?.owned ?? false;
  const offer = product.priceMinor > 0 ? { "@type": "Offer", priceCurrency: product.currency, price: (product.priceMinor / 100).toFixed(2), availability: "https://schema.org/PreOrder", url: `https://beginly.app/products/${product.id}` } : undefined;
  return <PlatformShell title={product.name} eyebrow={product.standalone ? "Standalone entry · route-integrated" : product.kind} action={<StatusPill tone={owned ? "positive" : "info"}>{owned ? "available now" : product.billingInterval.replaceAll("_", " ")}</StatusPill>}>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: product.name, applicationCategory: "BusinessApplication", operatingSystem: "Web, iOS, Android", description: product.promise, url: `https://beginly.app/products/${product.id}`, offers: offer }} />
    <Link href="/products" className="back-link"><ArrowLeft size={16} /> All products</Link>
    <section className="product-detail-hero"><div><span className="platform-eyebrow"><Sparkles size={15} /> Smallest-sufficient packaging</span><h2>{product.promise}</h2><p>This module can be purchased directly or embedded inside a relevant route, household or sponsored experience. It never creates a separate identity silo.</p><div className="platform-hero-actions"><ProductAction productId={product.id} owned={owned} authenticated={Boolean(context)} /><Link href={context ? "/nia" : `/signup?product=${encodeURIComponent(product.id)}`} className="platform-secondary">{context ? "Ask Nia if this fits" : "Create a free account"}</Link></div></div><div className="product-detail-price"><strong>{product.priceMinor === 0 ? "Free" : `£${(product.priceMinor / 100).toFixed(0)}`}</strong><span>{product.billingInterval.replaceAll("_", " ")}</span><small>Scope: {product.scope.replaceAll("_", " ")}</small></div></section>
    <div className="product-detail-grid"><section><h3>Included capabilities</h3>{product.capabilities.map((capability) => <div className="capability-row" key={capability}><CheckCircle2 size={18} /><span>{capability.replaceAll("_", " ")}</span></div>)}</section><section className="trust-panel"><ShieldCheck size={26} /><h3>Beginly value promise</h3><p>Nia checks free, owned, household, sponsored and ProofPoints access before recommending this product. The recommendation is dismissible and explainable.</p>{owned && <p><strong>Access source:</strong> {coverage?.sourceLabels.join(", ")}</p>}</section></div>
  </PlatformShell>;
}
