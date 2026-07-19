import type { Metadata } from "next";
import PlatformShell from "@/components/platform/PlatformShell";
import StatusPill from "@/components/platform/StatusPill";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Content, opportunity and AI discovery methodology | Beginly",
  description: "How Beginly governs public guidance, opportunity suitability, commercial disclosure, review dates and AI-search discoverability.",
  alternates: { canonical: "/trust/methodology" },
};

const PRINCIPLES = [
  {
    title: "Public guidance",
    body: "Indexable content carries a canonical path, scope, review status, review date and visible source relationship. Draft and expired content is not indexable.",
  },
  {
    title: "Opportunity ranking",
    body: "Eligibility, trust, suitability, readiness and urgency are assessed before commercial value. Commission cannot rescue an unsuitable opportunity.",
  },
  {
    title: "Trusted browser",
    body: "External destinations use disclosed, allowlisted, short-lived action sessions. Opening a destination does not constitute application or conversion.",
  },
  {
    title: "AI discovery",
    body: "Beginly uses clear HTML, explicit entities, canonical content and source provenance. Personalised and sensitive surfaces remain excluded from public discovery.",
  },
];

export default function MethodologyPage() {
  return (
    <PlatformShell
      title="Our methodology"
      eyebrow="Trust by construction"
      action={<StatusPill tone="positive">Content governance</StatusPill>}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Beginly content and opportunity methodology",
          url: "https://beginly.app/trust/methodology",
          about: ["content governance", "opportunity suitability", "commercial disclosure", "AI search discoverability"],
        }}
      />

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="card">
          <p className="text-sm text-civic-600 leading-relaxed">
            Public guidance, personalised recommendations and commercial opportunities use different evidence and control
            layers. This page explains how each is governed.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map(({ title, body }) => (
            <article key={title} className="card space-y-2">
              <h2 className="text-sm font-semibold text-navy">{title}</h2>
              <p className="text-sm text-civic-600 leading-relaxed">{body}</p>
            </article>
          ))}
        </div>

        <div className="card bg-civic-50 border-border">
          <p className="text-xs text-muted leading-relaxed">
            Beginly provides general settlement guidance and informational content only. Nothing on this platform
            constitutes legal, immigration, financial, tax, medical, or housing advice. Always consult a qualified
            professional for regulated matters.
          </p>
        </div>
      </div>
    </PlatformShell>
  );
}
