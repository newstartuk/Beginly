"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { flags } from "@/lib/feature-flags";
import { HeartHandshake, CheckCircle2, ChevronLeft } from "lucide-react";
import Link from "next/link";

const AREAS_HELP = [
  { id: "accommodation", label: "Accommodation & Housing" },
  { id: "banking", label: "Banking & Money" },
  { id: "gp-nhs", label: "GP / NHS" },
  { id: "university", label: "University Admin" },
  { id: "jobs", label: "Jobs & Work" },
  { id: "sim-phone", label: "SIM / Phone" },
  { id: "other", label: "Other" },
];

interface FormState {
  name: string;
  email: string;
  university: string;
  city: string;
  arrivalYear: string;
  areas: string[];
  experience: string;
  agreed: boolean;
}

export default function PeerGuidePage() {
  const { user, profile, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    university: "",
    city: "",
    arrivalYear: "",
    areas: [],
    experience: "",
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

  function update(field: keyof FormState, value: string | boolean | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function toggleArea(id: string) {
    setForm((prev) => ({
      ...prev,
      areas: prev.areas.includes(id)
        ? prev.areas.filter((a) => a !== id)
        : [...prev.areas, id],
    }));
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.university.trim()) errs.university = "University is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.arrivalYear.trim()) errs.arrivalYear = "Arrival year is required";
    if (form.areas.length === 0) errs.areas = "Select at least one area you can help with";
    if (form.experience.trim().length < 50) errs.experience = "Please write at least 50 characters";
    if (!form.agreed) errs.agreed = "You must agree to the guidelines";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const application = {
      id: `peer-${Date.now()}`,
      type: "peer_guide",
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
          <HeartHandshake className="w-12 h-12 text-muted mx-auto mb-4" />
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
              Thank you for applying to be a Peer Guide. The team will review your application and be in touch within 5–7 working days.
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
        <div className="card bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-navy mb-1">Peer Guide</h1>
              <p className="text-sm text-muted">
                You&apos;ve been there. Help others get settled. Share your experience and make a real difference.
              </p>
            </div>
          </div>
        </div>

        {/* ── Role Description ─────────────────────────────── */}
        <div className="card">
          <h2 className="text-base font-bold text-navy mb-3">What is a Peer Guide?</h2>
          <div className="space-y-3">
            {[
              { label: "Your role", desc: "Share your experience as a newly settled student. Answer questions, offer tips, and be a friendly voice for newcomers navigating the same challenges you faced." },
              { label: "What you do", desc: "Respond to cohort questions, share your story, and offer practical tips from your own settlement experience — all on your own schedule." },
              { label: "Time commitment", desc: "Completely flexible. Answer questions when you have time. No minimum hours required." },
              { label: "Who can apply", desc: "Anyone who has been in the UK for at least one full term. You don&apos;t need to be an expert — just honest, empathetic, and willing to help." },
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
            <label className="block text-xs font-medium text-navy mb-1">When did you arrive in the UK? *</label>
            <select
              value={form.arrivalYear}
              onChange={(e) => update("arrivalYear", e.target.value)}
              className={`input-field text-sm ${errors.arrivalYear ? "border-red-300" : ""}`}
            >
              <option value="">Select year…</option>
              {["2023", "2024", "2025", "2026"].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {errors.arrivalYear && <p className="text-xs text-red-500 mt-0.5">{errors.arrivalYear}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-navy mb-2">Areas you can help with *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AREAS_HELP.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => toggleArea(area.id)}
                  className={`text-xs text-left px-3 py-2 rounded-xl border transition-colors ${
                    form.areas.includes(area.id)
                      ? "bg-teal-50 border-teal-300 text-primary font-semibold"
                      : "bg-civic-50 border-civic-100 text-muted hover:border-civic-200"
                  }`}
                >
                  {form.areas.includes(area.id) && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  {area.label}
                </button>
              ))}
            </div>
            {errors.areas && <p className="text-xs text-red-500 mt-1">{errors.areas}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-navy mb-1">Describe your experience *</label>
            <p className="text-xs text-muted mb-1.5">Minimum 50 characters. What was challenging? What helped you? Share your honest story.</p>
            <textarea
              value={form.experience}
              onChange={(e) => update("experience", e.target.value)}
              placeholder="When I arrived, I found X difficult. What really helped me was…"
              rows={5}
              className={`w-full input-field text-sm resize-none ${errors.experience ? "border-red-300" : ""}`}
            />
            <div className="flex justify-end">
              <p className={`text-xs ${form.experience.length >= 50 ? "text-green-600" : "text-muted"}`}>
                {form.experience.length} / 50+
              </p>
            </div>
            {errors.experience && <p className="text-xs text-red-500 mt-0.5">{errors.experience}</p>}
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agree-pg-guidelines"
              checked={form.agreed}
              onChange={(e) => update("agreed", e.target.checked)}
              className="mt-0.5 accent-primary"
            />
            <label htmlFor="agree-pg-guidelines" className="text-xs text-navy leading-relaxed">
              I agree to the Beginly Community Guidelines and commit to being respectful, helpful, and honest in my role as a Peer Guide.
            </label>
          </div>
          {errors.agreed && <p className="text-xs text-red-500 -mt-3">{errors.agreed}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full sm:w-auto flex items-center gap-1.5 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : <><HeartHandshake className="w-4 h-4" /> Submit Application</>}
          </button>
        </form>

      </div>
    </Navigation>
  );
}
