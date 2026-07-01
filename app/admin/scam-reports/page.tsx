"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ChevronLeft, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import Navigation from "@/components/Navigation";
import AdminGuard from "@/components/AdminGuard";

const STORAGE_KEY = "beginly_scam_reports";

interface ScamReport {
  id: string;
  reporter_name: string;
  reporter_email: string;
  scam_type: string;
  message_description: string;
  contact_method: string;
  submitted_at: string;
  status: "pending" | "reviewed";
}

export default function AdminScamReportsPage() {
  const [reports, setReports] = useState<ScamReport[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  });
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  function markReviewed(id: string) {
    setReviewed((prev) => new Set([...prev, id]));
    const updated = reports.map((r) =>
      r.id === id ? { ...r, status: "reviewed" as const } : r
    );
    setReports(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  const pending = reports.filter((r) => !reviewed.has(r.id) && r.status !== "reviewed");
  const reviewedItems = reports.filter((r) => reviewed.has(r.id) || r.status === "reviewed");

  return (
    <AdminGuard>
      <Navigation>
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-muted hover:text-primary transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-navy">Scam Reports</h1>
            {pending.length > 0 && (
              <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                {pending.length} pending
              </span>
            )}
          </div>

          <p className="text-sm text-muted -mt-3 ml-8">
            Reports submitted via the Scam Radar tool. Reports are stored locally until a database is connected.
          </p>

          {/* Pending */}
          {pending.length === 0 ? (
            <div className="card text-center py-12">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="font-semibold text-navy">No pending reports</p>
              <p className="text-sm text-muted mt-1">All submitted reports have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((report) => (
                <div key={report.id} className="card border-l-4 border-l-red-400">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-semibold text-navy text-sm">{report.scam_type || "Unknown scam type"}</p>
                        <p className="text-xs text-muted mt-0.5">
                          From: {report.reporter_name} &lt;{report.reporter_email}&gt; · via {report.contact_method || "unknown channel"}
                        </p>
                        <p className="text-sm text-muted mt-2 p-3 bg-civic-50 rounded-lg">{report.message_description}</p>
                        <p className="text-xs text-muted mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(report.submitted_at).toLocaleString("en-GB")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => markReviewed(report.id)}
                      className="btn-ghost text-xs shrink-0"
                    >
                      Mark reviewed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reviewed */}
          {reviewedItems.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide">Reviewed</h2>
              <div className="space-y-2">
                {reviewedItems.map((report) => (
                  <div key={report.id} className="card opacity-60">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        <p className="text-sm font-medium text-navy truncate">{report.scam_type || "Unknown"}</p>
                        <span className="text-xs text-muted shrink-0">{report.reporter_name}</span>
                      </div>
                      <span className="text-xs text-muted shrink-0">
                        {new Date(report.submitted_at).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Navigation>
    </AdminGuard>
  );
}
