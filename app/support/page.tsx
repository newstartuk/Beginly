"use client";
import { useState } from "react";
import { addSupportTicket, generateId } from "@/lib/utils";
import type { SupportCategory } from "@/types";
import { MessageSquare, Send, CheckCircle, AlertTriangle } from "lucide-react";
import Navigation from "@/components/Navigation";

const CATEGORIES: { value: SupportCategory; label: string; desc: string }[] = [
  { value: "account", label: "Account issue", desc: "Problems signing in or accessing your account" },
  { value: "checklist", label: "Checklist question", desc: "Questions about a task or your roadmap" },
  { value: "document", label: "Document confusion", desc: "Confused about a document or form" },
  { value: "housing", label: "Housing concern", desc: "Worried about your accommodation situation" },
  { value: "partner", label: "Partner complaint", desc: "Issue with a recommended service" },
  { value: "scam", label: "Scam concern", desc: "Worried you may have been targeted" },
  { value: "other", label: "Something else", desc: "Any other question or concern" },
];

const DISCLAIMER =
  "Beginly provides general settlement guidance only. We do not provide legal, immigration, financial, tax, medical, or housing advice. For urgent or regulated matters, please contact official services or qualified professionals.";

export default function SupportPage() {
  const [category, setCategory] = useState<SupportCategory | "">("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description || !email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    addSupportTicket({
      id: generateId(),
      category: category as SupportCategory,
      description,
      email,
      createdAt: new Date().toISOString(),
      status: "open",
    });
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <Navigation>
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy">Get support</h1>
            <p className="text-xs text-muted">We read every message and aim to reply within 2 working days.</p>
          </div>
        </div>

        <div className="disclaimer-box flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-muted shrink-0 mt-0.5" />
          <p>{DISCLAIMER}</p>
        </div>

        {submitted ? (
          <div className="card text-center py-10">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-navy mb-2">Message received!</h2>
            <p className="text-sm text-muted max-w-xs mx-auto">
              Thank you. We aim to respond within 2 working days. For urgent issues, contact your university support service.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-2">What do you need help with?</label>
              <div className="grid sm:grid-cols-2 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      category === c.value
                        ? "border-primary bg-teal-50"
                        : "border-border bg-white hover:border-primary/40"
                    }`}
                  >
                    <p className="text-sm font-semibold text-navy">{c.label}</p>
                    <p className="text-xs text-muted mt-0.5">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Your email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Describe your question or concern</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field resize-none"
                rows={5}
                placeholder="Please describe your situation as clearly as you can..."
                required
              />
              <p className="text-xs text-muted mt-1">Do not include sensitive personal information such as passport numbers, bank details, or passwords.</p>
            </div>

            <button
              type="submit"
              disabled={loading || !category || !description || !email}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              {loading ? "Sending..." : <><Send className="w-4 h-4" /> Send message</>}
            </button>
          </form>
        )}

        {/* Urgent help */}
        <div className="card border-red-200 bg-red-50">
          <h2 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Need urgent help?
          </h2>
          <p className="text-sm text-red-600 mb-2">For urgent safety concerns, please contact the emergency services:</p>
          <div className="space-y-1 text-sm text-red-700">
            <p>🚨 <strong>Emergency (police, ambulance, fire):</strong> Call <strong>999</strong></p>
            <p>📞 <strong>NHS non-emergency:</strong> Call <strong>111</strong></p>
            <p>📞 <strong>Police non-emergency:</strong> Call <strong>101</strong></p>
            <p>📞 <strong>Crime reporting:</strong> <strong>Action Fraud</strong> — 0300 123 2040</p>
          </div>
        </div>
      </div>
    </Navigation>
  );
}
