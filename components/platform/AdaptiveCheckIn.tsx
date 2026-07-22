"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, X, ChevronRight, CheckCircle, ArrowRight } from "lucide-react";
import type { CheckInChange } from "@/lib/contracts/platform";

const CHECK_IN_KEY = "beginly_checkin_last";
const INTERVAL_DAYS = 7;

const CHANGES: { id: CheckInChange; label: string }[] = [
  { id: "new_job", label: "I've started a new job or changed employer" },
  { id: "moved_home", label: "I've moved to a new address or area" },
  { id: "family_change", label: "My family or household situation has changed" },
  { id: "visa_change", label: "My visa or immigration status has changed" },
  { id: "health", label: "I have a health or wellbeing concern" },
  { id: "urgent", label: "I need urgent help with something" },
  { id: "all_good", label: "Everything is going well — no changes" },
];

interface FollowUp {
  change: CheckInChange;
  message: string;
  href?: string;
  linkLabel?: string;
}

export default function AdaptiveCheckIn() {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState<CheckInChange[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [followUps, setFollowUps] = useState<FollowUp[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECK_IN_KEY);
      if (!raw) { setShow(true); return; }
      const days = (Date.now() - new Date(raw).getTime()) / 86_400_000;
      if (days >= INTERVAL_DAYS) setShow(true);
    } catch { setShow(true); }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(CHECK_IN_KEY, new Date().toISOString()); } catch {}
    setShow(false);
  };

  const toggle = (id: CheckInChange) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/platform/check-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ changes: selected, idempotencyKey: crypto.randomUUID() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Could not save your update.");
      try { localStorage.setItem(CHECK_IN_KEY, new Date().toISOString()); } catch {}
      setFollowUps(data.followUps as FollowUp[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your update.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  if (followUps) {
    return (
      <div className="card border-primary/20 space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm font-semibold text-navy">Thanks — here's what to do next.</p>
        </div>
        {followUps.map((followUp) => (
          <div key={followUp.change} className="bg-teal-50 rounded-xl p-3">
            <p className="text-sm text-civic-600">{followUp.message}</p>
            {followUp.href && (
              <Link
                href={followUp.href}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {followUp.linkLabel ?? "Take me there"} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ))}
        <button type="button" onClick={dismiss} className="text-xs text-muted hover:text-navy">
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="card border-primary/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-navy">How is your journey going?</p>
            <p className="text-xs text-muted mt-0.5">
              Has anything changed recently that we should factor into your roadmap?
            </p>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="p-1 rounded-lg text-muted hover:text-navy hover:bg-civic-50 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {CHANGES.map((change) => (
          <button
            key={change.id}
            type="button"
            onClick={() => toggle(change.id)}
            className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
              selected.includes(change.id)
                ? "border-primary bg-teal-50 text-navy font-medium"
                : "border-border text-civic-600 hover:border-primary/40"
            }`}
          >
            {change.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {selected.length > 0 && (
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="btn-primary mt-3 w-full justify-center disabled:opacity-60"
        >
          {submitting ? "Sharing…" : "Share this update"} <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
