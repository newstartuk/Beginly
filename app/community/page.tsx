"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { flags } from "@/lib/feature-flags";
import Alert from "@/components/Alert";
import {
  Users,
  ChevronRight,
  Star,
  HeartHandshake,
  Shield,
  MessageCircle,
  CheckCircle2,
  Bell,
} from "lucide-react";
import Link from "next/link";

const SAFETY_RULES = [
  "Never share your password, bank details, or identity documents with other community members.",
  "Beginly staff will never ask you for money, passwords, or sensitive data in community spaces.",
  "Report any suspicious behaviour to the Beginly team immediately.",
  "Respect other members — this is a safe space for everyone.",
];

const AREAS_HELP = [
  "Accommodation",
  "Banking",
  "GP / NHS",
  "University admin",
  "Jobs & work",
  "SIM / Phone",
  "Other",
];

export default function CommunityPage() {
  const { user, profile, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [joinedCohort, setJoinedCohort] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [questionDone, setQuestionDone] = useState(false);
  const [cohortKey, setCohortKey] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const joined = localStorage.getItem("beginly_cohort_joined");
    if (joined === "true") setJoinedCohort(true);
    if (profile?.city && profile?.university) {
      const key = `${(profile.city as string).toLowerCase().replace(/\s+/g, "-")}-2026-09`;
      setCohortKey(key);
    }
  }, [mounted, profile]);

  function handleJoinCohort() {
    if (!cohortKey) return;
    localStorage.setItem("beginly_cohort_joined", "true");
    localStorage.setItem("beginly_cohort_key", cohortKey);
    setJoinedCohort(true);
  }

  function handleSubmitQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!questionText.trim()) return;
    const questions = JSON.parse(localStorage.getItem("beginly_community_questions") ?? "[]");
    questions.push({
      id: `q-${Date.now()}`,
      text: questionText.trim(),
      cohort: cohortKey ?? "unknown",
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("beginly_community_questions", JSON.stringify(questions));
    setQuestionText("");
    setQuestionDone(true);
    setTimeout(() => setQuestionDone(false), 4000);
  }

  if (loading || !mounted) return null;

  if (!flags.ENABLE_COMMUNITY_LITE) {
    return (
      <Navigation>
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-navy mb-2">Community coming soon</h2>
          <p className="text-sm text-muted">Check back soon — cohort spaces are being prepared.</p>
        </div>
      </Navigation>
    );
  }

  const cohortName = cohortKey
    ? cohortKey.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ")
    : null;

  return (
    <Navigation>
      <div className="space-y-8 animate-fade-in">

        {/* ── Hero ──────────────────────────────────────────── */}
        <div className="card bg-gradient-to-br from-violet-50 to-white border-violet-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-navy mb-1">Community</h1>
              <p className="text-sm text-muted">
                Connect with your cohort, find guides, and support each other through the settlement journey.
              </p>
            </div>
          </div>
        </div>

        {/* ── Safety Banner ─────────────────────────────────── */}
        <Alert variant="danger" title="Community Safety Rules">
          <ul className="space-y-1 mt-1">
            {SAFETY_RULES.map((rule, i) => (
              <li key={i} className="flex items-start gap-2">
                <Shield className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                <span className="text-xs">{rule}</span>
              </li>
            ))}
          </ul>
        </Alert>

        {/* ── Cohort Card ──────────────────────────────────── */}
        {cohortKey && (
          <div className="card border-violet-200 bg-gradient-to-br from-violet-50/60 to-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-violet-600" />
                  </div>
                  <p className="text-xs text-muted uppercase tracking-wider">Your Cohort</p>
                </div>
                <h2 className="text-lg font-bold text-navy">{cohortName}</h2>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Cohort launching soon</span>
                  <span className="flex items-center gap-1"><Bell className="w-3 h-3" /> Collecting interest</span>
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-2 border-violet-200 flex items-center justify-center mb-1">
                  <Users className="w-5 h-5 text-violet-400" />
                </div>
                <p className="text-xs text-muted">— members</p>
              </div>
            </div>

            {joinedCohort ? (
              <div className="mt-4 bg-green-light border border-green-200 rounded-xl p-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-sm text-green-700 font-medium">
                  You&apos;re in the <strong>{cohortName}</strong> cohort! We&apos;ll notify you when your city group is ready.
                </p>
              </div>
            ) : (
              <button
                onClick={handleJoinCohort}
                className="btn-primary mt-4 w-full flex items-center justify-center gap-2"
              >
                Join Your Cohort
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ── Ambassador & Peer Guide Cards ─────────────────── */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Ambassador */}
          <div className="card border-amber-200 bg-gradient-to-br from-amber-50/60 to-white">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-navy mb-1">Become an Ambassador</h3>
            <p className="text-xs text-muted mb-4">
              Represent Beginly at your university. Help future students settle with confidence. Earn recognition and grow your network.
            </p>
            <Link href="/community/ambassador" className="btn-primary w-full flex items-center justify-center gap-1.5 text-sm">
              Apply Now
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Peer Guide */}
          <div className="card border-teal-200 bg-gradient-to-br from-teal-50/60 to-white">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center mb-3">
              <HeartHandshake className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-bold text-navy mb-1">Become a Peer Guide</h3>
            <p className="text-xs text-muted mb-4">
              Already settled? Share what you know and help newcomers navigate their first 90 days. One conversation can change everything.
            </p>
            <Link href="/community/peer-guide" className="btn-primary w-full flex items-center justify-center gap-1.5 text-sm">
              Apply Now
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── University Partners ───────────────────────────── */}
        <Link href="/partners/universities" className="card card-hover border-civic-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-navy">Partner with Beginly</p>
            <p className="text-xs text-muted">Universities: pilot the Beginly programme for your international students.</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted shrink-0" />
        </Link>

        {/* ── Ask a Question ────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Ask a Question for Your Cohort
          </h2>
          {questionDone ? (
            <div className="card border-green-200 bg-green-light">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-700 font-medium">
                  Question submitted! We&apos;ll share it with your cohort when spaces launch.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitQuestion} className="card">
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="What do you want to know? Ask your cohort anything…"
                rows={4}
                className="w-full input-field resize-none text-sm"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-muted">Questions are anonymous and reviewed before sharing.</p>
                <button type="submit" disabled={!questionText.trim()} className="btn-primary text-sm disabled:opacity-50">
                  Submit Question
                </button>
              </div>
            </form>
          )}
        </section>

        {/* ── Coming Soon note ──────────────────────────────── */}
        <Alert variant="info" title="Full community features coming soon">
          Direct messaging, cohort forums, and live meetup coordination are being built. Submit your question above to be notified when these features launch.
        </Alert>

      </div>
    </Navigation>
  );
}
