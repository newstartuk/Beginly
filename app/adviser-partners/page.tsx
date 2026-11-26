import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, CalendarClock, AlertTriangle, ListChecks, FileDown,
  Scale, ShieldCheck, ClipboardList,
} from "lucide-react";
import Logo from "@/components/Logo";
import AdviserSurveyButton from "@/components/AdviserSurveyButton";
import EmailFoundersButton from "@/components/EmailFoundersButton";

export const metadata: Metadata = {
  title: "For immigration advisers | Beginly",
  description:
    "Beginly helps people on UK visa routes keep their settlement evidence organised, then share it with their regulated adviser in one consented export. Help us build the adviser export.",
  alternates: { canonical: "/adviser-partners" },
};

const FOUNDERS_EMAIL = process.env.FOUNDERS_EMAIL?.trim();

function parseTypeformId(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  const fromUrl = value.match(/\/to\/([A-Za-z0-9]+)/);
  return fromUrl ? fromUrl[1] : value;
}
const TYPEFORM_ID = parseTypeformId(process.env.ADVISER_TYPEFORM_ID);

const RECEIVE = [
  {
    icon: CalendarClock,
    text: "A dated chronology of residence, absences, addresses, employment and earnings, with every item linked to its source document.",
  },
  {
    icon: AlertTriangle,
    text: "Gaps and conflicts flagged before you start, such as missing months of address evidence or tax years with no payslips.",
  },
  {
    icon: ListChecks,
    text: "Structured to the earned-settlement requirements announced in November 2026.",
  },
  {
    icon: FileDown,
    text: "Export to PDF, with structured data for case-management systems in development.",
  },
];

const EVIDENCE = [
  "Travel and absences",
  "Addresses",
  "Earnings by tax year",
  "Previous permissions",
  "English and Life in the UK",
];

export default function AdvisersPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-white)" }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderColor: "var(--color-border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" aria-label="Beginly home">
            <span className="block sm:hidden"><Logo variant="lockup" size={38} /></span>
            <span className="hidden sm:block"><Logo variant="lockup" size={52} tagline /></span>
          </Link>
          <AdviserSurveyButton formId={TYPEFORM_ID}
            className="btn-primary text-sm py-1.5 px-4">
            Take the survey
          </AdviserSurveyButton>
        </div>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="px-6 pt-16 pb-14" style={{ background: "var(--gradient-hero)" }}>
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--color-teal)" }}>
              For immigration advisers
            </p>
            <h1 className="font-display text-3xl sm:text-5xl mb-6" style={{ color: "var(--color-navy)", lineHeight: 1.15 }}>
              Clients who arrive with their evidence already in order.
            </h1>
            <p className="text-base leading-relaxed mb-6" style={{ color: "var(--color-muted)" }}>
              Beginly helps people on UK visa routes keep their settlement evidence organised as they live it.
              When they are ready, they share it with their regulated adviser in one consented export.
            </p>
            <ul className="flex flex-wrap gap-2">
              {EVIDENCE.map((item) => (
                <li key={item} className="text-xs font-semibold px-3 py-1.5 rounded-full border bg-white"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-navy)" }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── What you receive ─────────────────────────────────── */}
        <section className="px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl mb-8" style={{ color: "var(--color-navy)" }}>
              What you receive
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {RECEIVE.map(({ icon: Icon, text }) => (
                <div key={text} className="rounded-2xl p-5 border bg-white"
                  style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-card)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: "var(--color-teal-50)" }}>
                    <Icon className="w-4 h-4" style={{ color: "var(--color-teal)" }} />
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-navy)" }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Never does / Data protection ─────────────────────── */}
        <section className="px-6 py-16" style={{ background: "var(--color-mist)" }}>
          <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-5">
            <div className="rounded-2xl p-6 border"
              style={{ background: "var(--color-teal-50)", borderColor: "rgba(22,179,166,0.2)" }}>
              <div className="flex items-center gap-2.5 mb-3">
                <Scale className="w-4 h-4" style={{ color: "var(--color-teal)" }} />
                <h2 className="text-sm font-bold" style={{ color: "var(--color-navy)" }}>What Beginly never does</h2>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                Beginly does not give immigration advice. It organises, explains and prepares. Every question
                about an individual&apos;s eligibility is handed to a regulated adviser: you.
              </p>
            </div>
            <div className="rounded-2xl p-6 border bg-white"
              style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-2.5 mb-3">
                <ShieldCheck className="w-4 h-4" style={{ color: "var(--color-teal)" }} />
                <h2 className="text-sm font-bold" style={{ color: "var(--color-navy)" }}>Data protection</h2>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                Clients control what is shared, can revoke access at any time, and every access is logged.
                Data is hosted in the UK and encrypted. We never collect criminal-record information.
              </p>
            </div>
          </div>
        </section>

        {/* ── Help us build it ─────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden" style={{ background: "var(--color-navy)" }}>
              <div aria-hidden className="absolute rounded-full pointer-events-none" style={{ width: 280, height: 280, opacity: 0.15, background: "radial-gradient(circle, var(--color-teal) 0%, transparent 65%)", top: -80, right: -80 }} />
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(22,179,166,0.85)" }}>
                  Design partners
                </p>
                <h2 className="font-display text-2xl sm:text-3xl text-white mb-4">Help us build it</h2>
                <p className="text-sm mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                  We are working with a small number of IAA-regulated firms and immigration solicitors as design
                  partners before launch. If you would like to shape the adviser export, take our 7-minute adviser
                  survey or email us.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <AdviserSurveyButton formId={TYPEFORM_ID}
                    className="btn-primary text-sm px-7 py-3 inline-flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Take the adviser survey
                    <ArrowRight className="w-4 h-4" />
                  </AdviserSurveyButton>
                  {FOUNDERS_EMAIL && (
                    <EmailFoundersButton email={FOUNDERS_EMAIL} subject="Beginly adviser design partner" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-8 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 justify-between items-center text-xs"
          style={{ color: "var(--color-muted)" }}>
          <p>© 2026 Beginly. Not affiliated with the UK government or the Home Office.</p>
          <div className="flex gap-5">
            <Link href="/">Home</Link>
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/terms-of-service">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
