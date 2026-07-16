import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PlatformShell from "@/components/platform/PlatformShell";
import JsonLd from "@/components/seo/JsonLd";
import { getPublicCity, PUBLIC_CITIES } from "@/lib/seo/public-cities";
import { ArrowLeft, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";

export function generateStaticParams() { return PUBLIC_CITIES.map((city) => ({ city: city.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> { const { city } = await params; const item = getPublicCity(city); if (!item) return {}; return { title: item.title, description: item.summary, alternates: { canonical: `/cities/${item.slug}` }, openGraph: { title: item.title, description: item.summary, url: `https://beginly.app/cities/${item.slug}` } }; }
export default async function CityPage({ params }: { params: Promise<{ city: string }> }) { const { city } = await params; const item = getPublicCity(city); if (!item) notFound(); return <PlatformShell title={item.title} eyebrow="Consent-aware city context">
  <JsonLd data={{ "@context": "https://schema.org", "@type": "WebPage", name: item.title, description: item.summary, url: `https://beginly.app/cities/${item.slug}`, about: { "@type": "City", name: item.name }, dateModified: item.reviewedAt }} />
  <Link href="/cities" className="back-link"><ArrowLeft size={16}/> All cities</Link>
  <section className="trust-hero"><MapPin/><div><h2>{item.answer}</h2><p>{item.summary}</p></div></section>
  <div className="product-detail-grid"><section className="trust-panel"><h3>Useful context</h3>{item.usefulFor.map((entry) => <div className="capability-row" key={entry}><CheckCircle2 size={17}/><span>{entry}</span></div>)}</section><section className="trust-panel"><h3>Prepare safely</h3>{item.preparationAreas.map((entry) => <div className="capability-row" key={entry}><ShieldCheck size={17}/><span>{entry}</span></div>)}<p><strong>Reviewed:</strong> {item.reviewedAt} · <strong>Next review:</strong> {item.nextReviewAt}</p></section></div>
</PlatformShell>; }
