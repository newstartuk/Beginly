"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/utils";
import {
  CheckCircle,
  Bell,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Check,
  Scale,
  Bot,
  Users,
  Target,
  Zap,
  Star,
  Shield,
} from "lucide-react";
import Disclaimer from "@/components/Disclaimer";

const FEATURES = [
  {
    icon: Target,
    title: "Your Personal 90-Day Roadmap",
    desc: "A checklist built around your arrival date, city, and situation — not generic advice that doesn't apply to you.",
    color: "text-teal",
    bg: "bg-teal-50",
    accent: "#0B7285",
  },
  {
    icon: BookOpen,
    title: "Plain-English Guidance",
    desc: "20+ articles written in clear, calm English — what to do, why it matters, and exactly what to avoid.",
    color: "text-violet",
    bg: "bg-purple-light",
    accent: "#7C3AED",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    desc: "Set reminders for the tasks that matter most. We help you stay on track without overwhelm.",
    color: "text-amber",
    bg: "bg-amber-light",
    accent: "#D97706",
  },
  {
    icon: AlertTriangle,
    title: "Scam & Mistake Alerts",
    desc: "Regular alerts on the scams targeting newcomers — so you can spot danger before you fall for it.",
    color: "text-red",
    bg: "bg-red-light",
    accent: "#DC2626",
  },
  {
    icon: Bot,
    title: "Nia — Document Helper",
    desc: "Your AI guide explains tenancy agreements, NHS letters, and council tax forms in plain English.",
    color: "text-violet",
    bg: "bg-purple-light",
    accent: "#7C3AED",
  },
  {
    icon: Shield,
    title: "Trusted & Compliant",
    desc: "We signpost official sources so you can make informed decisions. Not advice — always guidance.",
    color: "text-teal",
    bg: "bg-teal-50",
    accent: "#0B7285",
  },
];

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Tell us about yourself",
    desc: "Your city, accommodation, university, and arrival date — it takes 2 minutes.",
    color: "#0B7285",
    bg: "#E8F4F6",
  },
  {
    num: "02",
    title: "Get your personalised roadmap",
    desc: "A clear 90-day checklist built around your exact situation and stage.",
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    num: "03",
    title: "Track your progress",
    desc: "Mark tasks done, get guidance, and watch your UK Readiness Score rise.",
    color: "#D97706",
    bg: "#FFF8ED",
  },
  {
    num: "04",
    title: "Settle in confidently",
    desc: "Avoid the common mistakes, know your rights, and build your new life with clarity.",
    color: "#1A9E4A",
    bg: "#E8F9EC",
  },
];

const TRUST_BADGES = [
  { label: "Official source guidance", icon: Shield },
  { label: "No personal data sold", icon: Users },
  { label: "Built for newcomers", icon: Target },
  { label: "Free forever", icon: Zap },
];

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  if (user) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-white)" }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderColor: "var(--color-border)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="logo-mark">
              <span className="text-white font-bold text-sm leading-none">B</span>
            </div>
            <span className="font-bold text-navy text-base">Beginly</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-sm py-1.5 px-4">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary text-sm py-1.5 px-4">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-16 pb-24 px-6"
        style={{ background: "linear-gradient(160deg, #F0FAFC 0%, #D1EEF0 50%, #E8F4F6 100%)" }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full opacity-20"
          style={{
            width: 400, height: 400,
            background: "radial-gradient(circle, #0B7285 0%, transparent 70%)",
            top: -100, right: -100,
          }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{
            width: 300, height: 300,
            background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)",
            bottom: -50, left: -50,
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Trust badge */}
          <div
            className="inline-flex items-center gap-1.5 mb-6 text-xs font-semibold px-4 py-1.5 rounded-full border"
            style={{
              background: "rgba(11,114,133,0.06)",
              borderColor: "rgba(11,114,133,0.2)",
              color: "var(--color-teal)",
            }}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Free settlement guide for everyone arriving in the UK
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
            style={{ color: "var(--color-navy)", letterSpacing: "-0.02em" }}
          >
            Your UK settlement journey{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #0B7285 0%, #2563EB 50%, #7C3AED 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              starts here.
            </span>
          </h1>

          <p
            className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "var(--color-muted)" }}
          >
            Beginly gives you a personalised 90-day checklist, plain-English guidance,
            and scam alerts — all built around your arrival. No more scattered websites,
            no more confusion. Just a clear path forward.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="btn-primary text-base px-8 py-3.5 justify-center"
              style={{ boxShadow: "0 4px 16px rgba(11,114,133,0.3)" }}
            >
              Create your roadmap — free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/guides"
              className="btn-ghost text-base px-8 py-3.5 justify-center"
            >
              Browse guidance articles
            </Link>
          </div>

          {/* Stats bar */}
          <div
            className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            {[
              { value: "40+", label: "Settlement tasks" },
              { value: "20+", label: "Guidance articles" },
              { value: "90", label: "Day roadmap" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p
                  className="text-2xl font-extrabold"
                  style={{ color: "var(--color-teal)" }}
                >
                  {s.value}
                </p>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem → Solution ─────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">

            {/* Problem card */}
            <div
              className="rounded-2xl p-8 border"
              style={{ background: "var(--color-red-light)", borderColor: "#FECACA" }}
            >
              <div
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-5"
                style={{ background: "#FEE2E2", color: "#DC2626" }}
              >
                ✗ The problem
              </div>
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: "var(--color-navy)" }}
              >
                Arriving in the UK is overwhelming.
              </h2>
              <div className="space-y-3">
                {[
                  "Accommodation, banking, GP registration, SIM setup, council tax...",
                  "Information is scattered across dozens of government websites.",
                  "What you find is usually generic — not tailored to you.",
                  "By the time you learn something, you've often already made the mistake.",
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 text-red-500 shrink-0">✗</span>
                    <p className="text-sm" style={{ color: "#991B1B" }}>{line}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Solution card */}
            <div
              className="rounded-2xl p-8 border"
              style={{ background: "var(--color-teal-50)", borderColor: "rgba(11,114,133,0.2)" }}
            >
              <div
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-5"
                style={{ background: "rgba(11,114,133,0.1)", color: "var(--color-teal)" }}
              >
                ✓ What we built
              </div>
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: "var(--color-navy)" }}
              >
                A single, personalised checklist for your first 90 days.
              </h2>
              <div className="space-y-3">
                {[
                  "Everything you need to do, in the right order.",
                  "Built around your city, university, and accommodation type.",
                  "Updated as you go — your roadmap, your pace.",
                  "With official source links and plain-English guidance for every task.",
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: "var(--color-green)" }}
                    />
                    <p className="text-sm" style={{ color: "#166534" }}>{line}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: "var(--color-mist)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "var(--color-teal)" }}
            >
              What you get
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: "var(--color-navy)" }}
            >
              Everything you need to settle, in one place.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card animate-fade-up">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: f.bg }}
                >
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-sm font-bold mb-2" style={{ color: "var(--color-navy)" }}>
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "var(--color-teal)" }}
            >
              How it works
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: "var(--color-navy)" }}
            >
              Four steps to your UK roadmap
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.num} className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 font-extrabold text-2xl"
                  style={{ background: step.bg, color: step.color }}
                >
                  {step.num}
                </div>
                <h3
                  className="text-sm font-bold mb-2"
                  style={{ color: "var(--color-navy)" }}
                >
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  {step.desc}
                </p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ArrowRight
                    className="hidden lg:block absolute top-1/2"
                    style={{ color: "var(--color-border)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust badges ────────────────────────────────────── */}
      <section className="py-14 px-6" style={{ background: "var(--color-mist)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_BADGES.map((b) => (
              <div
                key={b.label}
                className="text-center py-5 px-4 rounded-2xl"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "var(--color-teal-50)" }}
                >
                  <b.icon className="w-5 h-5" style={{ color: "var(--color-teal)" }} />
                </div>
                <p className="text-xs font-semibold" style={{ color: "var(--color-navy)" }}>
                  {b.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compliance note ───────────────────────────────── */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl p-6 border"
            style={{ background: "var(--color-teal-50)", borderColor: "rgba(11,114,133,0.2)" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "var(--color-teal-100)" }}
              >
                <Scale className="w-4 h-4" style={{ color: "var(--color-teal)" }} />
              </div>
              <div>
                <h2 className="text-sm font-bold mb-2" style={{ color: "var(--color-navy)" }}>
                  How we work — and how we don&apos;t
                </h2>
                <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--color-muted)" }}>
                  Beginly is a settlement support platform — not a legal, immigration, financial, or professional advice service. We help you understand what you need to do and point you to official sources.
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  Our content is built around official GOV.UK guidance and reviewed before publication. Always check your personal circumstances against your visa conditions, university guidance, or advice from a regulated professional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden bg-[#102A43]"
          >
            {/* Decorative circles */}
            <div
              className="absolute rounded-full opacity-15 pointer-events-none"
              style={{
                width: 280, height: 280,
                background: "radial-gradient(circle, #0B7285 0%, transparent 65%)",
                top: -80, right: -80,
              }}
            />
            <div
              className="absolute rounded-full opacity-12 pointer-events-none"
              style={{
                width: 220, height: 220,
                background: "radial-gradient(circle, #7C3AED 0%, transparent 65%)",
                bottom: -60, left: -60,
              }}
            />

            <div className="relative z-10">
              <h2
                className="text-2xl sm:text-3xl font-bold text-white mb-4"
              >
                Your first 90 days start now.
              </h2>
              <p
                className="text-sm mb-8 max-w-xl mx-auto leading-relaxed"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Join newcomers from around the world using Beginly to settle in confidently.
                Free forever. No credit card needed.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-sm font-bold px-8 py-3.5 rounded-xl transition-transform hover:scale-[1.03]"
                style={{
                  background: "var(--color-teal)",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(11,114,133,0.45)",
                }}
              >
                Create your roadmap now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t py-8 px-6" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-6xl mx-auto space-y-5">
          <Disclaimer type="general" />
          <div className="flex flex-wrap gap-5 justify-center">
            <Link href="/guides" className="text-xs hover:text-teal" style={{ color: "var(--color-muted)" }}>Guidance library</Link>
            <Link href="/document-helper" className="text-xs hover:text-teal" style={{ color: "var(--color-muted)" }}>Document Helper</Link>
            <Link href="/support" className="text-xs hover:text-teal" style={{ color: "var(--color-muted)" }}>Get support</Link>
            <Link href="/signup" className="text-xs hover:text-teal" style={{ color: "var(--color-muted)" }}>Sign up</Link>
          </div>
          <p className="text-center text-xs" style={{ color: "var(--color-muted)" }}>
            © 2026 Beginly. An independent platform — not affiliated with the UK government, NHS, or any university.
          </p>
        </div>
      </footer>

    </div>
  );
}
