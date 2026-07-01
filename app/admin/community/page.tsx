"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import AdminGuard from "@/components/AdminGuard";
import { flags } from "@/lib/feature-flags";
import {
  Users,
  ChevronLeft,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Inbox,
} from "lucide-react";
import Link from "next/link";

interface CommunityQuestion {
  id: string;
  text: string;
  cohort: string;
  timestamp: string;
  status: "pending" | "reviewed" | "converted";
}

const COHORT_STUB = [
  { key: "manchester-2026-09", city: "Manchester", university: "University of Manchester", members: 0, status: "collecting_interest" },
  { key: "london-2026-09", city: "London", university: "Various", members: 0, status: "collecting_interest" },
  { key: "birmingham-2026-09", city: "Birmingham", university: "University of Birmingham", members: 0, status: "collecting_interest" },
];

export default function AdminCommunityPage() {
  const [mounted, setMounted] = useState(false);
  const [questions, setQuestions] = useState<CommunityQuestion[]>([]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem("beginly_community_questions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setQuestions(parsed.map((q: { id: string; text: string; cohort: string; timestamp: string }) => ({
          ...q,
          status: "pending" as const,
        })));
      } catch { /* ignore */ }
    }
  }, [mounted]);

  function markReviewed(id: string) {
    setQuestions((prev) =>
      prev.map((q) => q.id === id ? { ...q, status: "reviewed" as const } : q)
    );
    const saved = JSON.parse(localStorage.getItem("beginly_community_questions") ?? "[]");
    const updated = saved.map((q: { id: string }) => q.id === id ? { ...q, admin_status: "reviewed" } : q);
    localStorage.setItem("beginly_community_questions", JSON.stringify(updated));
  }

  if (!mounted) return null;

  if (!flags.ENABLE_COMMUNITY_LITE) {
    return (
      <AdminGuard>
        <Navigation>
          <div className="card text-center py-12">
            <Users className="w-12 h-12 text-muted mx-auto mb-4" />
            <h2 className="text-xl font-bold text-navy mb-2">Community-lite not enabled</h2>
          </div>
        </Navigation>
      </AdminGuard>
    );
  }

  const pendingCount = questions.filter((q) => q.status === "pending").length;

  return (
    <AdminGuard>
      <Navigation>
        <div className="space-y-6 animate-fade-in">

          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-muted hover:text-navy">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold text-navy">Community Management</h1>
            </div>
          </div>

          {/* ── Cohort Overview ─────────────────────────────── */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-navy">Cohort Overview</h2>
              <span className="badge bg-teal-50 text-teal border-teal-200">{COHORT_STUB.length} cohorts</span>
            </div>
            {COHORT_STUB.length === 0 ? (
              <p className="text-sm text-muted">No cohorts created yet. Cohorts are created automatically when students complete onboarding.</p>
            ) : (
              <div className="space-y-3">
                {COHORT_STUB.map((cohort) => (
                  <div key={cohort.key} className="flex items-center justify-between p-3 bg-civic-50 rounded-xl border border-civic-100">
                    <div>
                      <p className="text-sm font-semibold text-navy">{cohort.city}</p>
                      <p className="text-xs text-muted">{cohort.university}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted">{cohort.members} members</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        cohort.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {cohort.status === "active" ? "Active" : "Interest"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Community Questions Queue ────────────────────── */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h2 className="text-base font-bold text-navy">Community Questions</h2>
                {pendingCount > 0 && (
                  <span className="badge bg-amber-100 text-amber-700">{pendingCount} pending</span>
                )}
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8">
                <Inbox className="w-8 h-8 text-civic-200 mx-auto mb-2" />
                <p className="text-sm text-muted">No questions yet.</p>
                <p className="text-xs text-muted mt-1">Questions submitted by students will appear here for review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q) => (
                  <div key={q.id} className={`p-4 rounded-xl border ${
                    q.status === "pending"
                      ? "bg-amber-50 border-amber-200"
                      : q.status === "reviewed"
                      ? "bg-civic-50 border-civic-100"
                      : "bg-green-50 border-green-200"
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-navy font-medium">{q.text}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-muted">{q.cohort}</span>
                          <span className="text-xs text-muted">·</span>
                          <span className="text-xs text-muted">{new Date(q.timestamp).toLocaleDateString()}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            q.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : q.status === "reviewed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {q.status}
                          </span>
                        </div>
                      </div>
                      {q.status === "pending" && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => markReviewed(q.id)}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Reviewed
                          </button>
                          <button className="text-xs text-violet hover:underline flex items-center gap-1">
                            <ArrowRight className="w-3 h-3" /> Convert to guide
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </Navigation>
    </AdminGuard>
  );
}
