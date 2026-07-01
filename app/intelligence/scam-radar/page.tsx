"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { getAllScamAlerts } from "@/lib/scam-alerts";
import Alert from "@/components/Alert";
import { flags } from "@/lib/feature-flags";
import { supabase } from "@/lib/supabase";
import {
  Shield,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Info,
  ExternalLink,
  Send,
  X,
} from "lucide-react";

const SUSPICIOUS_KEYWORDS = [
  "urgent", "account suspended", "verify", "click here", "bitcoin",
  "gift card", "western union", "moneygram", "confirm identity",
  "password", "social security", "national insurance", "suspended",
  "limited", "unusual activity", "security alert", "act now",
  "immediately", "expires", "confirm your identity", "update your details",
  "click below", "free gift", "winner", "congratulations",
  "bank account", "sort code", "one time code", "otp",
  "refund", "prize", "lottery", "inheritance",
];

interface ScanResult {
  level: "safe" | "suspicious" | "high-risk";
  message: string;
  flags: string[];
}

function scanText(text: string): ScanResult {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const kw of SUSPICIOUS_KEYWORDS) {
    if (lower.includes(kw)) found.push(kw);
  }
  if (found.length === 0) {
    return { level: "safe", message: "No suspicious keywords detected. Always stay cautious.", flags: [] };
  }
  if (found.length <= 2) {
    return {
      level: "suspicious",
      message: `Detected ${found.length} potentially concerning keyword(s). This could be legitimate, but verify independently.`,
      flags: found,
    };
  }
  return {
    level: "high-risk",
    message: `Detected ${found.length} suspicious keywords. High probability this is a scam. Do NOT respond or click any links.`,
    flags: found,
  };
}

const SCAM_REPORT_FORM = [
  { name: "reporter_name", label: "Your name", type: "text", placeholder: "Your full name" },
  { name: "reporter_email", label: "Your email", type: "email", placeholder: "email@example.com" },
  { name: "scam_type", label: "Scam type", type: "text", placeholder: "e.g. Housing deposit, Job offer" },
  { name: "message_description", label: "Describe what happened", type: "textarea", placeholder: "Tell us what happened..." },
  { name: "contact_method", label: "How were you contacted?", type: "text", placeholder: "e.g. Email, WhatsApp, Phone" },
];

export default function ScamRadarPage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportForm, setReportForm] = useState<Record<string, string>>({
    reporter_name: "",
    reporter_email: "",
    scam_type: "",
    message_description: "",
    contact_method: "",
  });

  useEffect(() => { setMounted(true); }, []);

  const alerts = getAllScamAlerts();

  function handleScan() {
    setScanResult(scanText(pasteText));
  }

  function handleReportChange(field: string, value: string) {
    setReportForm((prev) => ({ ...prev, [field]: value }));
    setReportError(null);
  }

  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reportForm.reporter_name || !reportForm.scam_type || !reportForm.message_description) {
      setReportError("Please fill in all required fields.");
      return;
    }
    setReportSubmitting(true);
    setReportError(null);
    try {
      await supabase.from("support_tickets").insert({
        user_id: user?.id ?? "anonymous",
        category: "scam_report",
        description: `[Scam Report] Type: ${reportForm.scam_type}\nContact method: ${reportForm.contact_method}\n\n${reportForm.message_description}`,
        email: reportForm.reporter_email || "not provided",
        status: "open",
      });
      setReportDone(true);
    } catch {
      setReportError("Something went wrong. Please try again.");
    } finally {
      setReportSubmitting(false);
    }
  }

  if (loading || !mounted) return null;

  if (!flags.ENABLE_INTELLIGENCE) {
    return (
      <Navigation>
        <div className="card text-center py-12">
          <Shield className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-navy mb-2">Intelligence not enabled</h2>
          <p className="text-sm text-muted">Check back soon — this feature is coming soon.</p>
        </div>
      </Navigation>
    );
  }

  return (
    <Navigation>
      <div className="space-y-8 animate-fade-in">

        {/* ── Hero ──────────────────────────────────────────── */}
        <div className="card bg-gradient-to-br from-red-50 to-white border-red-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-navy mb-1">Scam Radar</h1>
              <p className="text-sm text-muted mb-3">
                Stay safe from fraud. Learn about common scams targeting international students and check suspicious messages.
              </p>
              <Alert variant="danger" title="Always verify independently">
                Beginly can provide guidance but cannot definitively verify whether a specific message is a scam. When in doubt, verify directly with the official organisation via their official website or phone number.
              </Alert>
            </div>
          </div>
        </div>

        {/* ── Paste-Check Tool ─────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Check a Suspicious Message
          </h2>
          <div className="card">
            <textarea
              value={pasteText}
              onChange={(e) => { setPasteText(e.target.value); setScanResult(null); }}
              placeholder="Paste the suspicious message, email, or text here for a quick keyword analysis…"
              rows={5}
              className="w-full input-field resize-none text-sm"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-muted">
                Client-side keyword analysis only. Never submit personal or sensitive information.
              </p>
              <button
                onClick={handleScan}
                disabled={!pasteText.trim()}
                className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-50"
              >
                <Shield className="w-4 h-4" />
                Analyse Message
              </button>
            </div>

            {scanResult && (
              <div className={`mt-4 rounded-xl p-4 border ${
                scanResult.level === "safe"
                  ? "bg-green-light border-green-200"
                  : scanResult.level === "suspicious"
                  ? "bg-amber-light border-amber-200"
                  : "bg-red-light border-red-200"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {scanResult.level === "safe" && (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-700">Likely safe</span>
                    </>
                  )}
                  {scanResult.level === "suspicious" && (
                    <>
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span className="font-bold text-amber-700">Caution advised</span>
                    </>
                  )}
                  {scanResult.level === "high-risk" && (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-bold text-red-700">High risk — do not respond</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-navy mb-2">{scanResult.message}</p>
                {scanResult.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.flags.map((flag) => (
                      <span key={flag} className="text-xs px-2 py-0.5 bg-white/70 border border-current/20 rounded-full text-navy">
                        &ldquo;{flag}&rdquo;
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Alert variant="info" title="What this checks" className="mt-3">
              This tool scans for common scam keywords. A clean scan does not mean a message is safe — scammers evolve constantly. Always verify through official channels.
            </Alert>
          </div>
        </section>

        {/* ── Scam Type Cards ───────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Common Scam Types
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="card border-civic-100">
                <button
                  onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
                  className="w-full flex items-start gap-3 text-left"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    alert.severity === "high" ? "bg-red-100" : "bg-amber-100"
                  }`}>
                    <AlertTriangle className={`w-4 h-4 ${alert.severity === "high" ? "text-red-600" : "text-amber-600"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-navy">{alert.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        alert.severity === "high"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {alert.severity === "high" ? "High Risk" : "Medium Risk"}
                      </span>
                      <span className="text-xs bg-civic-100 text-muted px-2 py-0.5 rounded-full">{alert.category}</span>
                    </div>
                    {expandedId !== alert.id && (
                      <p className="text-xs text-muted mt-1 line-clamp-1">{alert.body}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-muted">
                    {expandedId === alert.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {expandedId === alert.id && (
                  <div className="mt-3 ml-11 text-sm text-navy bg-civic-50 rounded-xl p-4 animate-fade-in">
                    <p className="whitespace-pre-wrap leading-relaxed">{alert.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Official Resources ────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            Official Reporting Resources
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                name: "Action Fraud",
                url: "https://actionfraud.police.uk",
                desc: "Report fraud and cybercrime",
                icon: "🚔",
              },
              {
                name: "Take Five",
                url: "https://takefive-stopfraud.org.uk",
                desc: "Stop-fraud advice and resources",
                icon: "🛡️",
              },
              {
                name: "NCSC",
                url: "https://ncsc.gov.uk",
                desc: "National Cyber Security Centre",
                icon: "🔒",
              },
            ].map((res) => (
              <a
                key={res.url}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card card-hover border-civic-100 flex items-start gap-3"
              >
                <span className="text-2xl">{res.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-navy">{res.name}</p>
                  <p className="text-xs text-muted">{res.desc}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted ml-auto shrink-0 mt-1" />
              </a>
            ))}
          </div>
        </section>

        {/* ── Report a Scam ─────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Report a Scam
          </h2>

          {reportDone ? (
            <div className="card border-green-200 bg-green-light">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-green-700">Report submitted!</p>
                  <p className="text-sm text-green-600 mt-0.5">
                    Thank you for helping keep the community safe. We will review your report and take appropriate action.
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setReportDone(false); setReportForm({ reporter_name: "", reporter_email: "", scam_type: "", message_description: "", contact_method: "" }); }}
                className="btn-ghost text-sm mt-3"
              >
                Submit another report
              </button>
            </div>
          ) : !showReportForm ? (
            <div className="card text-center py-8">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <p className="text-sm text-muted mb-4">
                Were you targeted by a scam? Share the details to help us warn others.
              </p>
              <button
                onClick={() => setShowReportForm(true)}
                className="btn-primary"
              >
                Report a Scam
              </button>
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} className="card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-navy">Scam Report Form</h3>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="text-muted hover:text-navy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-navy mb-1">Your name *</label>
                  <input
                    type="text"
                    value={reportForm.reporter_name}
                    onChange={(e) => handleReportChange("reporter_name", e.target.value)}
                    placeholder="Your full name"
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy mb-1">Your email</label>
                  <input
                    type="email"
                    value={reportForm.reporter_email}
                    onChange={(e) => handleReportChange("reporter_email", e.target.value)}
                    placeholder="email@example.com"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy mb-1">Scam type *</label>
                  <input
                    type="text"
                    value={reportForm.scam_type}
                    onChange={(e) => handleReportChange("scam_type", e.target.value)}
                    placeholder="e.g. Housing deposit, Job offer"
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy mb-1">How were you contacted?</label>
                  <input
                    type="text"
                    value={reportForm.contact_method}
                    onChange={(e) => handleReportChange("contact_method", e.target.value)}
                    placeholder="e.g. Email, WhatsApp, Phone"
                    className="input-field text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy mb-1">Describe what happened *</label>
                <textarea
                  value={reportForm.message_description}
                  onChange={(e) => handleReportChange("message_description", e.target.value)}
                  placeholder="Tell us what happened in as much detail as you can…"
                  rows={4}
                  className="input-field text-sm resize-none"
                  required
                />
              </div>
              {reportError && (
                <Alert variant="danger">{reportError}</Alert>
              )}
              <div className="flex gap-2">
                <button type="submit" disabled={reportSubmitting} className="btn-primary flex items-center gap-1.5 disabled:opacity-60">
                  {reportSubmitting ? "Submitting…" : <><Send className="w-4 h-4" /> Submit Report</>}
                </button>
                <button type="button" onClick={() => setShowReportForm(false)} className="btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

      </div>
    </Navigation>
  );
}
