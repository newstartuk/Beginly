"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import AdminGuard from "@/components/AdminGuard";
import { flags } from "@/lib/feature-flags";
import {
  Users,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Star,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  type: "ambassador" | "peer_guide";
  name: string;
  email: string;
  university: string;
  city: string;
  submittedAt: string;
  why?: string;
  handle?: string;
  hear?: string;
  arrivalYear?: string;
  areas?: string[];
  experience?: string;
}

export default function AdminApplicationsPage() {
  const [mounted, setMounted] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem("beginly_applications");
    if (saved) {
      try {
        setApplications(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, [mounted]);

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

  const ambassadorApps = applications.filter((a) => a.type === "ambassador");
  const peerGuideApps = applications.filter((a) => a.type === "peer_guide");

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
              <h1 className="text-xl font-bold text-navy">Applications</h1>
            </div>
          </div>

          {/* ── Info Banner ─────────────────────────────────── */}
          <div className="card bg-blue-50 border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> In the full deployment, applications are stored in the <code className="bg-blue-100 px-1 rounded">community_applications</code> database table and visible here. For this MVP, applications are stored in localStorage of the submitting user's browser.
            </p>
          </div>

          {/* ── Ambassador Applications ──────────────────────── */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-bold text-navy">Ambassador Applications</h2>
              </div>
              <span className="badge bg-amber-50 text-amber-600 border-amber-200">
                {ambassadorApps.length} submitted
              </span>
            </div>

            {ambassadorApps.length === 0 ? (
              <p className="text-sm text-muted text-center py-6">No ambassador applications yet.</p>
            ) : (
              <div className="space-y-3">
                {ambassadorApps.map((app) => {
                  const isOpen = expandedId === app.id;
                  return (
                    <div key={app.id} className="border border-civic-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedId(isOpen ? null : app.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-civic-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-navy">{app.name}</p>
                          <p className="text-xs text-muted mt-0.5">{app.email} · {app.university} · {app.city}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">{new Date(app.submittedAt).toLocaleDateString()}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 bg-civic-50 space-y-3 animate-fade-in">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-muted">University</p>
                              <p className="text-xs font-medium text-navy">{app.university}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted">City</p>
                              <p className="text-xs font-medium text-navy">{app.city}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted">Contact</p>
                              <p className="text-xs font-medium text-navy">{app.email}</p>
                            </div>
                            {app.handle && (
                              <div>
                                <p className="text-xs text-muted">Social / WhatsApp</p>
                                <p className="text-xs font-medium text-navy">{app.handle}</p>
                              </div>
                            )}
                            {app.hear && (
                              <div>
                                <p className="text-xs text-muted">Heard about Beginly from</p>
                                <p className="text-xs font-medium text-navy">{app.hear}</p>
                              </div>
                            )}
                          </div>
                          {app.why && (
                            <div>
                              <p className="text-xs text-muted mb-1">Why they want to be an ambassador</p>
                              <p className="text-xs text-navy bg-white rounded-xl p-3 border border-civic-100">{app.why}</p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button className="btn-primary text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approve</button>
                            <button className="btn-ghost text-xs">Reject</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Peer Guide Applications ─────────────────────── */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-primary" />
                <h2 className="text-base font-bold text-navy">Peer Guide Applications</h2>
              </div>
              <span className="badge bg-teal-50 text-primary border-teal-200">
                {peerGuideApps.length} submitted
              </span>
            </div>

            {peerGuideApps.length === 0 ? (
              <p className="text-sm text-muted text-center py-6">No peer guide applications yet.</p>
            ) : (
              <div className="space-y-3">
                {peerGuideApps.map((app) => {
                  const isOpen = expandedId === app.id;
                  return (
                    <div key={app.id} className="border border-civic-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedId(isOpen ? null : app.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-civic-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-navy">{app.name}</p>
                          <p className="text-xs text-muted mt-0.5">{app.email} · {app.university} · {app.city}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">{new Date(app.submittedAt).toLocaleDateString()}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 bg-civic-50 space-y-3 animate-fade-in">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-muted">University</p>
                              <p className="text-xs font-medium text-navy">{app.university}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted">City</p>
                              <p className="text-xs font-medium text-navy">{app.city}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted">Arrival Year</p>
                              <p className="text-xs font-medium text-navy">{app.arrivalYear}</p>
                            </div>
                          </div>
                          {app.areas && app.areas.length > 0 && (
                            <div>
                              <p className="text-xs text-muted mb-1">Areas of help</p>
                              <div className="flex flex-wrap gap-1.5">
                                {app.areas.map((area) => (
                                  <span key={area} className="badge bg-teal-50 text-primary border-teal-200">{area}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {app.experience && (
                            <div>
                              <p className="text-xs text-muted mb-1">Experience / story</p>
                              <p className="text-xs text-navy bg-white rounded-xl p-3 border border-civic-100">{app.experience}</p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button className="btn-primary text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approve</button>
                            <button className="btn-ghost text-xs">Reject</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </Navigation>
    </AdminGuard>
  );
}
