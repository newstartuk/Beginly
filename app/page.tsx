"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/utils";
import {
  Shield,
  CheckCircle,
  Bell,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Check,
  Star,
  Scale,
} from "lucide-react";
import Disclaimer from "@/components/Disclaimer";

const FEATURES = [
  {
    icon: CheckCircle,
    title: "Personalised 90-Day Roadmap",
    desc: "A checklist built around your arrival date, city, and situation — not generic advice.",
    color: "text-primary",
    bg: "bg-teal-50",
  },
  {
    icon: BookOpen,
    title: "Plain-English Guidance",
    desc: "20+ articles written in clear, calm English — what to do, why it matters, and what to avoid.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    desc: "Set weekly or daily reminders for the tasks that matter most — delivered to your email.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: Shield,
    title: "Scam & Mistake Alerts",
    desc: "Regular alerts on the scams targeting newcomers to the UK — so you can spot them before they happen.",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: AlertTriangle,
    title: "Document Helper",
    desc: "Nia, your AI guide, explains tenancy agreements, council tax letters, and NHS forms in plain English.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Scale,
    title: "Neutral & Compliant",
    desc: "Information and signposting — not advice. We point you to official sources so you can make informed decisions.",
    color: "text-green-500",
    bg: "bg-green-50",
  },
];

const HOW_IT_WORKS = [
  { num: "01", title: "Tell us about your arrival", desc: "City, accommodation type, and when you're arriving." },
  { num: "02", title: "Get your personalised roadmap", desc: "A 90-day checklist built around your exact situation." },
  { num: "03", title: "Track, complete, and progress", desc: "Mark tasks done, get guidance, and watch your score rise." },
  { num: "04", title: "Settle in with confidence", desc: "Avoid common mistakes, stay safe, and build your UK life." },
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-navy text-base">Beginly</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-sm py-1.5 px-3">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary text-sm py-1.5 px-3">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <CheckCircle className="w-3 h-3" />
          Free settlement guide for everyone arriving in the UK
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-navy leading-tight mb-5 max-w-3xl mx-auto">
          Your UK settlement journey<br className="hidden sm:block" /> starts here.
        </h1>
        <p className="text-lg text-civic-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Beginly helps you navigate your first 90 days in the UK — from airport to settled. A clear, guided checklist, personalised for your situation, and pointing you to the right official sources at every step.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className="btn-primary text-base px-8 py-3 justify-center">
            Start your roadmap — free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/guides" className="btn-ghost text-base px-8 py-3 justify-center">
            Browse guidance articles
          </Link>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-white border-y border-border py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">The problem</p>
              <h2 className="text-2xl font-bold text-navy mb-4">
                Arriving in the UK is overwhelming. The information is everywhere and nowhere.
              </h2>
              <div className="space-y-3">
                {[
                  "Accommodation, banking, GP registration, SIM setup, council tax...",
                  "Information is scattered across dozens of government websites and forums.",
                  "What you find is usually generic — not tailored to you.",
                  "By the time you learn something, you've often already made the mistake.",
                ].map((line, i) => (
                  <p key={i} className="text-sm text-civic-600 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✗</span>
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="bg-civic-50 border border-civic-100 rounded-2xl p-6">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">What we built instead</p>
              <h3 className="text-lg font-bold text-navy mb-4">
                A single, personalised checklist for your first 90 days.
              </h3>
              <div className="space-y-3">
                {[
                  "Everything you need to do, in the right order.",
                  "Built around your city, university, and accommodation type.",
                  "Updated as you progress — your roadmap, your pace.",
                  "With plain-English guidance and official source links for every task.",
                ].map((line, i) => (
                  <p key={i} className="text-sm text-civic-600 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5"><Check className="w-4 h-4" /></span>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">What you get</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-navy">Everything you need to settle, in one place</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card flex flex-col gap-3">
              <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="text-sm font-bold text-navy">{f.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-border py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy">Four steps to your UK roadmap</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 bg-teal-50 border border-teal-200 text-primary font-bold text-lg rounded-full flex items-center justify-center mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-sm font-bold text-navy mb-2">{step.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Compliance note */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="card bg-teal-50 border-primary/20">
          <h2 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            How we work — and how we don&apos;t
          </h2>
          <p className="text-sm text-civic-700 leading-relaxed mb-3">
            Beginly is a settlement support platform — not a legal, immigration, financial, or professional advice service. We help you understand what you need to do and point you to the official sources that make the decisions.
          </p>
          <p className="text-sm text-civic-700 leading-relaxed mb-3">
            Our content is built around official GOV.UK guidance, NHS guidance, and university-published information. It is reviewed before publication — but it does not substitute for advice from a qualified immigration solicitor, financial adviser, or other regulated professional.
          </p>
          <p className="text-sm text-civic-700 leading-relaxed">
            <strong>Always check your specific conditions</strong> — your eVisa, visa vignette, university enrolment letter, or offer paperwork are the authoritative source for your personal circumstances.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
        <div className="bg-primary rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Your first 90 days start now.
          </h2>
          <p className="text-teal-100 text-sm leading-relaxed mb-8 max-w-xl mx-auto">
            Join newcomers from around the world using Beginly to settle in confidently. Free forever. No credit card needed.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-primary font-bold text-sm px-8 py-3 rounded-xl hover:bg-teal-50 transition-colors">
            Create your roadmap now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 space-y-4">
          <div className="max-w-3xl mx-auto">
            <Disclaimer type="general" />
          </div>
          <div className="flex flex-wrap gap-4 justify-center text-xs text-muted">
            <Link href="/guides" className="hover:text-primary">Guidance library</Link>
            <Link href="/document-helper" className="hover:text-primary">Document Helper</Link>
            <Link href="/support" className="hover:text-primary">Get support</Link>
            <Link href="/signup" className="hover:text-primary">Sign up</Link>
          </div>
          <p className="text-center text-xs text-muted">
            © 2026 SettleMap. Beginly is an independent platform and is not affiliated with the UK government, the NHS, or any university.
          </p>
        </div>
      </footer>
    </div>
  );
}
