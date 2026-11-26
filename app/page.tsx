import Link from "next/link";
import { ArrowRight, BookOpen, Bell, Scale, Shield, Target } from "lucide-react";
import Logo from "@/components/Logo";
import LandingHero from "@/components/landing/LandingHero";
import NiaDemo from "@/components/landing/NiaDemo";
import ScamGame from "@/components/landing/ScamGame";
import FinalCta from "@/components/landing/FinalCta";
import ProblemSolution from "@/components/landing/ProblemSolution";
import { getCardTasks } from "@/lib/landing-card-tasks";
import { getTimelines } from "@/lib/landing-timeline";
import RouteTimeline from "@/components/landing/RouteTimeline";
import { HeroRouteProvider } from "@/components/landing/HeroRouteContext";

const JOURNEYS = [
  "🇳🇬 Lagos → Manchester", "🇨🇳 Beijing → London", "🇮🇳 Mumbai → Birmingham",
  "🇰🇪 Nairobi → Edinburgh", "🇮🇳 Delhi → Leicester", "🇵🇭 Manila → Bristol",
  "🇬🇭 Accra → Sheffield", "🇵🇰 Karachi → Leeds", "🇧🇩 Dhaka → Liverpool",
  "🇱🇰 Colombo → Coventry", "🇲🇾 Kuala Lumpur → Nottingham", "🇧🇷 São Paulo → Newcastle",
  "🇰🇷 Seoul → Glasgow", "🇻🇳 Hanoi → Cardiff", "🇹🇿 Dar es Salaam → Leeds",
];

const STEPS = [
  { num: "01", title: "Tell us about yourself", desc: "Your visa route, city and arrival date. It takes two minutes.", color: "var(--color-teal)", bg: "var(--color-teal-50)" },
  { num: "02", title: "Get your roadmap", desc: "A checklist built around your situation, in the order things need to happen.", color: "var(--color-violet)", bg: "var(--color-violet-light)" },
  { num: "03", title: "Settle in with confidence", desc: "Tick tasks off, read plain-English guidance, and watch your readiness score rise.", color: "var(--color-gold)", bg: "var(--color-amber-light)" },
];

const FEATURES = [
  { icon: Target, title: "Your personal 90-day roadmap", desc: "A checklist built around your arrival date, city and situation, not generic advice that doesn't apply to you.", color: "var(--color-teal)", bg: "var(--color-teal-50)" },
  { icon: BookOpen, title: "Plain-English guidance", desc: "20+ articles written in clear, calm English: what to do, why it matters, and exactly what to avoid.", color: "var(--color-violet)", bg: "var(--color-violet-light)" },
  { icon: Bell, title: "Smart reminders", desc: "Set reminders for the tasks that matter most, so you stay on track without the overwhelm.", color: "var(--color-gold)", bg: "var(--color-amber-light)" },
  { icon: Shield, title: "Official sources", desc: "We signpost GOV.UK, NHS and other official sources so you can make informed decisions. Guidance, never advice.", color: "var(--color-coral)", bg: "var(--color-coral-light)" },
];

function SectionHeading({ eyebrow, title, intro, eyebrowColor = "var(--color-teal)" }: {
  eyebrow: string; title: string; intro?: string; eyebrowColor?: string;
}) {
  return (
    <div className="text-center mb-12">
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: eyebrowColor }}>{eyebrow}</p>
      <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-navy)" }}>{title}</h2>
      {intro && (
        <p className="text-sm max-w-xl mx-auto mt-3 leading-relaxed" style={{ color: "var(--color-muted)" }}>{intro}</p>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--color-white)" }}>

      {/* ── Adviser announcement bar ─────────────────────────────────
          Invites advisers to become design partners. Remove this block once
          recruitment ends; the "For advisers" link in the header can stay. */}
      <div className="px-6 py-2.5 text-center text-xs sm:text-sm"
        style={{ background: "var(--color-navy)", color: "rgba(255,255,255,0.8)" }}>
        <span>Are you an immigration consultant or adviser?</span>{" "}
        <Link href="/adviser-partners"
          className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 whitespace-nowrap hover:opacity-90"
          style={{ color: "var(--color-gold)" }}>
          Help us build Beginly
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderColor: "var(--color-border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <span className="block sm:hidden"><Logo variant="lockup" size={38} /></span>
          <span className="hidden sm:block"><Logo variant="lockup" size={52} tagline /></span>
          <div className="flex items-center gap-2">
            <Link href="/adviser-partners"
              className="hidden md:inline-block text-sm font-medium px-3 py-1.5 text-muted hover:text-primary transition-colors">
              For advisers
            </Link>
            <div className="hidden sm:block">
              <Link href="/login" className="btn-ghost text-sm py-1.5 px-4">Sign in</Link>
            </div>
            <Link href="/signup" className="btn-primary text-sm py-1.5 px-4">Get started free</Link>
          </div>
        </div>
      </header>

      {/* The route picked in the hero also drives the timeline further down */}
      <HeroRouteProvider>
      <main>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-14 px-6" style={{ background: "var(--gradient-hero)" }}>
          <div aria-hidden className="absolute rounded-full pointer-events-none"
            style={{ width: 420, height: 420, opacity: 0.15, background: "radial-gradient(circle, var(--color-teal) 0%, transparent 70%)", top: -120, right: -120 }} />
          <div aria-hidden className="absolute rounded-full pointer-events-none"
            style={{ width: 300, height: 300, opacity: 0.09, background: "radial-gradient(circle, var(--color-coral) 0%, transparent 70%)", bottom: 60, left: -80 }} />

          <div className="relative z-10">
            <LandingHero cardTasks={getCardTasks()} />
          </div>

          {/* Where people come from: a slow, looping strip of journeys */}
          <div className="relative z-10 -mx-6">
            <p className="text-center text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-teal)" }}>
              Wherever you&apos;re coming from, we can help you settle
            </p>
            <div className="overflow-hidden py-3 border-y" style={{ borderColor: "rgba(22,179,166,0.15)" }} aria-hidden>
              <div style={{ display: "flex", width: "max-content", animation: "ticker-scroll 38s linear infinite" }}>
                {[...JOURNEYS, ...JOURNEYS].map((j, i) => (
                  <span key={i} className="text-xs font-medium"
                    style={{ padding: "0 2.25rem", whiteSpace: "nowrap", color: "var(--color-muted)" }}>
                    {j}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── The problem / what we built ──────────────────────────── */}
        <ProblemSolution />

        {/* ── How it works ─────────────────────────────────────────── */}
        <section className="pt-10 pb-20 px-6">
          <div className="max-w-5xl mx-auto">
            <SectionHeading eyebrow="How it works" title="Three steps to your UK roadmap" />
            <ol className="grid sm:grid-cols-3 gap-8">
              {STEPS.map((step) => (
                <li key={step.num} className="text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 font-extrabold text-2xl"
                    style={{ background: step.bg, color: step.color }}>
                    {step.num}
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: "var(--color-navy)" }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "var(--color-muted)" }}>{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Your first 90 days: the chosen route's timeline ─────── */}
        <section className="py-20 px-6" style={{ background: "var(--color-warm-neutral)" }}>
          <div className="max-w-6xl mx-auto">
            <RouteTimeline timelines={getTimelines()} />
          </div>
        </section>

        {/* ── What you get ─────────────────────────────────────────── */}
        <section className="py-20 px-6" style={{ background: "var(--color-mist)" }}>
          <div className="max-w-5xl mx-auto">
            <SectionHeading eyebrow="What you get" title="Everything you need to settle, in one place." />
            <div className="grid sm:grid-cols-2 gap-5">
              {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
                <div key={title} className="bg-white rounded-2xl p-6 border flex gap-4"
                  style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-card)" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--color-navy)" }}>{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── See it in action: Nia ────────────────────────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <SectionHeading
              eyebrow="Document helper"
              eyebrowColor="var(--color-coral)"
              title="Meet Nia: plain English for every UK document."
              intro="Tenancy agreements, NHS letters, HMRC forms, council tax bills. Nia explains them so you don't have to guess."
            />
            <NiaDemo />
          </div>
        </section>

        {/* ── See it in action: scam game ──────────────────────────── */}
        <section className="py-20 px-6" style={{ background: "var(--color-mist)" }}>
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              eyebrow="Scam awareness"
              eyebrowColor="var(--color-coral)"
              title="Think like a newcomer: spot the scam."
              intro="One of these three rental listings is fake. Newcomers lose money to listings just like it every year. Can you spot it?"
            />
            <ScamGame />
          </div>
        </section>

        {/* ── Trust + final call to action ─────────────────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="rounded-2xl p-6 border flex items-start gap-3"
              style={{ background: "var(--color-teal-50)", borderColor: "rgba(22,179,166,0.2)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--color-teal-100)" }}>
                <Scale className="w-4 h-4" style={{ color: "var(--color-teal)" }} />
              </div>
              <div>
                <h2 className="text-sm font-bold mb-2" style={{ color: "var(--color-navy)" }}>How we work, and how we don&apos;t</h2>
                <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--color-muted)" }}>
                  Beginly is a settlement support platform, not a legal, immigration, financial or professional advice
                  service. We help you understand what you need to do and point you to official sources.
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  Our content is built around official GOV.UK guidance and reviewed before publication. Always check your
                  personal circumstances against your visa conditions, university guidance, or advice from a regulated
                  professional.
                </p>
              </div>
            </div>

            <FinalCta />
          </div>
        </section>
      </main>
      </HeroRouteProvider>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ background: "var(--color-navy)" }}>
        {/* Thin gradient line that echoes the beam in the logo */}
        <div aria-hidden style={{ height: 2, background: "linear-gradient(90deg, transparent 0%, #FF7358 28%, #F8B547 62%, #F6EBDD 100%)" }} />

        <div className="max-w-6xl mx-auto px-6 pt-14 pb-10">
          <div className="grid md:grid-cols-[1.7fr_1fr_1fr] gap-10 lg:gap-16 mb-12">
            <div>
              <Logo variant="lockup" size={46} theme="light" tagline />
              <p className="mt-6 text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Settlement support for everyone arriving in the UK: free, personalised, and built around your visa
                route and situation.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.26)" }}>Platform</p>
              <div className="space-y-3.5">
                {[
                  ["Guidance library", "/routes"],
                  ["Document Helper (Nia)", "/nia"],
                  ["Opportunities", "/opportunity-categories"],
                  ["Get started for free", "/signup"],
                ].map(([label, href]) => (
                  <Link key={href} href={href} className="block text-sm transition-opacity hover:opacity-100"
                    style={{ color: "rgba(255,255,255,0.5)" }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.26)" }}>Company</p>
              <div className="space-y-3.5">
                {[
                  ["How we work", "/trust/methodology"],
                  ["For advisers", "/adviser-partners"],
                  ["Sign in", "/login"],
                  ["Create account", "/signup"],
                ].map(([label, href]) => (
                  <Link key={href} href={href} className="block text-sm transition-opacity hover:opacity-100"
                    style={{ color: "rgba(255,255,255,0.5)" }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-6 flex flex-col sm:flex-row gap-3 justify-between items-center"
            style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-xs text-center sm:text-left" style={{ color: "rgba(255,255,255,0.22)" }}>
              © 2026 Beginly. An independent platform, not affiliated with the UK government, NHS, or any university.
            </p>
            <div className="flex gap-5 shrink-0">
              <Link href="/privacy-policy" className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>Privacy</Link>
              <Link href="/terms-of-service" className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
