"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import Alert from "@/components/Alert";
import { flags } from "@/lib/feature-flags";
import { Star, CheckCircle2, ChevronLeft } from "lucide-react";
import Link from "next/link";

const HEAR_OPTIONS = [
  "University notice board",
  "Social media",
  "Friend or peer",
  "University staff",
  "Beginly email or newsletter",
  "Other",
];

interface FormState {
  name: string;
  email: string;
  university: string;
  city: string;
  why: string;
  handle: string;
  hear: string;
  agreed: boolean;
}

export default function AmbassadorPage() {
  const { user, profile, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    university: "",
    city: "",
    why: "",
    handle: "",
    hear: "",
    agreed: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !user) return;
    setForm((prev) => ({
      ...prev,
      name: user.name ?? prev.name,
      email: user.email ?? prev.email,
      university: profile?.university ?? prev.university,
      city: profile?.city ?? prev.city,
    }));
  }, [mounted, user, profile]);

  function update(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.university.trim()) errs.university = "University is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (form.why.trim().length < 100) errs.why = "Please write at least 100 characters";
    if (!form.agreed) errs.agreed = "You must agree to the community guidelines";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const application = {
      id: `amb-${Date.now()}`,
      type: "ambassador",
      ...form,
      submittedAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("beginly_applications") ?? "[]");
    existing.push(application);
    localStorage.setItem("beginly_applications", JSON.stringify(existing));
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
          <Star className="w-12 h-12 text-muted mx-auto mb-4" />
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
            <h2 className="text-xl font-bold text-green-700 mb-2">Application Submitted!</h2>
            <p className="text-sm text-green-600 max-w-md mx-auto">
              Thank you for applying to be a Beginly Ambassador. The team will review your application and be in touch within 5–7 working days.
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
        <div className="card bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-navy mb-1">Beginly Ambassador</h1>
              <p className="text-sm text-muted">
                Represent Beginly at your university and help future international students settle with confidence.
              </p>
            </div>
          </div>
        </div>

        {/* ── Role Description ─────────────────────────────── */}
        <div className="card">
          <h2 className="text-base font-bold text-navy mb-3">What is a Beginly Ambassador?</h2>
          <div className="space-y-3">
            {[
              { label: "Your role", desc: "Be the face of Beginly on your campus. Share resources, answer questions, and help new arrivals feel welcome." },
              { label: "What you get", desc: "Exclusive training, a verified Beginly Ambassador badge, networking opportunities, and recognition on your CV." },
              { label: "Time commitment", desc: "As little as 2–3 hours per month during term time. Completely flexible around your studies." },
              { label: "Who can apply", desc: "Any current international student who has been in the UK for at least one full term. No prior experience needed — just enthusiasm and empathy." },
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

        {/* ── Application Form ─────────────────────────────── */}
        <form onSubmit={handleSubmit} className="card space-y-5">
          <h2 className="text-base font-bold text-navy">Application Form</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-navy mb-1">Full name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your full name"
                className={`input-field text-sm ${errors.name ? "border-red-300" : ""}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1">Email address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="email@example.com"
                className={`input-field text-sm ${errors.email ? "border-red-300" : ""}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1">University *</label>
              <input
                type="text"
                value={form.university}
                onChange={(e) => update("university", e.target.value)}
                placeholder="e.g. University of Manchester"
                className={`input-field text-sm ${errors.university ? "border-red-300" : ""}`}
              />
              {errors.university && <p className="text-xs text-red-500 mt-0.5">{errors.university}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1">City *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="e.g. Manchester"
                className={`input-field text-sm ${errors.city ? "border-red-300" : ""}`}
              />
              {errors.city && <p className="text-xs text-red-500 mt-0.5">{errors.city}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-navy mb-1">
              Why do you want to be a Beginly Ambassador? *
            </label>
            <p className="text-xs text-muted mb-1.5">Minimum 100 characters. Tell us about your motivation and relevant experience.</p>
            <textarea
              value={form.why}
              onChange={(e) => update("why", e.target.value)}
              placeholder="I want to help future students because…"
              rows={5}
              className={`w-full input-field text-sm resize-none ${errors.why ? "border-red-300" : ""}`}
            />
            <div className="flex justify-between mt-0.5">
              {errors.why && <p className="text-xs text-red-500">{errors.why}</p>}
              <p className={`text-xs ml-auto ${form.why.length >= 100 ? "text-green-600" : "text-muted"}`}>
                {form.why.length} / 100+
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-navy mb-1">Social media / WhatsApp handle (optional)</label>
              <input
                type="text"
                value={form.handle}
                onChange={(e) => update("handle", e.target.value)}
                placeholder="@username or phone number"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1">How did you hear about Beginly?</label>
              <select
                value={form.hear}
                onChange={(e) => update("hear", e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Select…</option>
                {HEAR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agree-guidelines"
              checked={form.agreed}
              onChange={(e) => update("agreed", e.target.checked)}
              className="mt-0.5 accent-primary"
            />
            <label htmlFor="agree-guidelines" className="text-xs text-navy leading-relaxed">
              I agree to the Beginly Community Guidelines and confirm that the information I have provided is accurate. I understand that ambassadors represent Beginly professionally and with respect for all students.
            </label>
          </div>
          {errors.agreed && <p className="text-xs text-red-500 -mt-3">{errors.agreed}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full sm:w-auto flex items-center gap-1.5 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : <><Star className="w-4 h-4" /> Submit Application</>}
          </button>
        </form>

      </div>
    </Navigation>
  );
}
