"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import Alert from "@/components/Alert";
import { flags } from "@/lib/feature-flags";
import { Users, CheckCircle2, ChevronLeft, GraduationCap } from "lucide-react";
import Link from "next/link";

interface FormState {
  universityName: string;
  contactName: string;
  contactEmail: string;
  teamSize: string;
  message: string;
}

export default function UniversitiesPartnersPage() {
  const { loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    universityName: "",
    contactName: "",
    contactEmail: "",
    teamSize: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => { setMounted(true); }, []);

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.universityName.trim()) errs.universityName = "University name is required";
    if (!form.contactName.trim()) errs.contactName = "Contact name is required";
    if (!form.contactEmail.trim()) errs.contactEmail = "Contact email is required";
    if (!form.teamSize.trim()) errs.teamSize = "Student team size is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const lead = {
      id: `pilot-${Date.now()}`,
      ...form,
      submittedAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("beginly_pilot_leads") ?? "[]");
    existing.push(lead);
    localStorage.setItem("beginly_pilot_leads", JSON.stringify(existing));
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  }

  if (loading || !mounted) return null;

  if (!flags.ENABLE_COMMUNITY_LITE) {
    return (
      <Navigation>
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-navy mb-2">Feature not enabled</h2>
        </div>
      </Navigation>
    );
  }

  if (submitted) {
    return (
      <Navigation>
        <div className="space-y-4 animate-fade-in">
          <Link href="/community" className="flex items-center gap-1 text-sm text-muted hover:text-navy">
            <ChevronLeft className="w-4 h-4" /> Back to Community
          </Link>
          <div className="card border-green-200 bg-green-light text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-green-700 mb-2">Interest Registered!</h2>
            <p className="text-sm text-green-600 max-w-md mx-auto">
              Thank you for your interest in partnering with Beginly. Our team will review your submission and contact you within 5 working days.
            </p>
            <Link href="/community" className="btn-primary mt-6 inline-flex">
              Back to Community
            </Link>
          </div>
        </div>
      </Navigation>
    );
  }

  return (
    <Navigation>
      <div className="space-y-6 animate-fade-in">
        <Link href="/community" className="flex items-center gap-1 text-sm text-muted hover:text-navy">
          <ChevronLeft className="w-4 h-4" /> Back to Community
        </Link>

        {/* ── Hero ──────────────────────────────────────────── */}
        <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-navy mb-1">Partner with Beginly</h1>
              <p className="text-sm text-muted">
                Equip your international students with the UK&apos;s most comprehensive settlement checklist — free for your students, backed by evidence.
              </p>
            </div>
          </div>
        </div>

        {/* ── Value Proposition ─────────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { stat: "40+", label: "Settlement tasks across 10 categories", icon: "✓" },
            { stat: "90 days", label: "Structured journey from arrival to growth", icon: "✓" },
            { stat: "Free", label: "For students — funded by institutional partnership", icon: "✓" },
          ].map((item) => (
            <div key={item.label} className="card text-center border-civic-100">
              <p className="text-2xl font-extrabold text-primary mb-1">{item.stat}</p>
              <p className="text-xs text-muted">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="text-base font-bold text-navy mb-3">What Beginly Offers Universities</h2>
          <div className="space-y-3">
            {[
              { label: "Student readiness dashboard", desc: "Anonymised aggregate data showing your international student cohort's settlement progress — helping you identify where students need more support." },
              { label: "Complimentary to existing services", desc: "Beginly works alongside your international student services, housing team, and careers service — not instead of them." },
              { label: "Evidence-based content", desc: "All guidance is reviewed by sector experts and aligned with UKVI, NHS, and official government guidance." },
              { label: "Dedicated pilot support", desc: "Every partner university gets a named contact at Beginly for the duration of the pilot, plus feedback channels." },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-navy">{item.label}</p>
                  <p className="text-xs text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pilot Interest Form ───────────────────────────── */}
        <form onSubmit={handleSubmit} className="card space-y-5">
          <h2 className="text-base font-bold text-navy">Register Pilot Interest</h2>
          <p className="text-xs text-muted">
            Complete this short form and our team will be in touch within 5 working days to discuss a pilot partnership.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-navy mb-1">University name *</label>
              <input
                type="text"
                value={form.universityName}
                onChange={(e) => update("universityName", e.target.value)}
                placeholder="e.g. University of Manchester"
                className={`input-field text-sm ${errors.universityName ? "border-red-300" : ""}`}
              />
              {errors.universityName && <p className="text-xs text-red-500 mt-0.5">{errors.universityName}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1">Your name *</label>
              <input
                type="text"
                value={form.contactName}
                onChange={(e) => update("contactName", e.target.value)}
                placeholder="Full name"
                className={`input-field text-sm ${errors.contactName ? "border-red-300" : ""}`}
              />
              {errors.contactName && <p className="text-xs text-red-500 mt-0.5">{errors.contactName}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1">Your email *</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => update("contactEmail", e.target.value)}
                placeholder="work email"
                className={`input-field text-sm ${errors.contactEmail ? "border-red-300" : ""}`}
              />
              {errors.contactEmail && <p className="text-xs text-red-500 mt-0.5">{errors.contactEmail}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1">International student team size *</label>
              <select
                value={form.teamSize}
                onChange={(e) => update("teamSize", e.target.value)}
                className={`input-field text-sm ${errors.teamSize ? "border-red-300" : ""}`}
              >
                <option value="">Select…</option>
                <option value="1-100">1–100</option>
                <option value="101-500">101–500</option>
                <option value="501-2000">501–2,000</option>
                <option value="2001-5000">2,001–5,000</option>
                <option value="5000+">5,000+</option>
              </select>
              {errors.teamSize && <p className="text-xs text-red-500 mt-0.5">{errors.teamSize}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-navy mb-1">Message / specific interests (optional)</label>
            <textarea
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="Tell us anything specific about your interest or questions…"
              rows={4}
              className="w-full input-field text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full sm:w-auto flex items-center gap-1.5 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : <><Users className="w-4 h-4" /> Register Interest</>}
          </button>
        </form>

      </div>
    </Navigation>
  );
}
