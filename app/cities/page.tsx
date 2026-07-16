import type { Metadata } from "next";
import Link from "next/link";
import PlatformShell from "@/components/platform/PlatformShell";
import JsonLd from "@/components/seo/JsonLd";
import { PUBLIC_CITIES } from "@/lib/seo/public-cities";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "UK city guidance", description: "Reviewed city context connected to Beginly’s adaptive routes, journeys and opportunities.", alternates: { canonical: "/cities" } };
export default function CitiesPage() { return <PlatformShell title="City context without identity silos" eyebrow="Reviewed location guidance">
  <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Beginly UK city guidance", url: "https://beginly.app/cities", hasPart: PUBLIC_CITIES.map((city) => ({ "@type": "WebPage", name: city.title, url: `https://beginly.app/cities/${city.slug}` })) }} />
  <section className="trust-hero"><MapPin/><div><h2>Location improves relevance; it does not define your entire Beginly identity.</h2><p>City context supports practical preparation and opportunity matching only where the source, review date and consent boundary are clear.</p></div></section>
  <div className="guide-grid">{PUBLIC_CITIES.map((city) => <article key={city.slug}><MapPin/><h2>{city.name}</h2><p>{city.summary}</p><footer><span><ShieldCheck size={14}/> Reviewed {city.reviewedAt}</span><Link href={`/cities/${city.slug}`}>Open city guide <ArrowRight size={14}/></Link></footer></article>)}</div>
</PlatformShell>; }
