"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ChevronLeft, Clock, CheckCircle, Mail, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import AdminGuard from "@/components/AdminGuard";

const STORAGE_KEY = "beginly_pilot_leads";

interface PilotLead {
  id: string;
  university_name: string;
  contact_name: string;
  contact_email: string;
  student_team_size: string;
  message: string;
  submitted_at: string;
  status: "pending" | "contacted" | "converted";
}

export default function AdminPilotLeadsPage() {
  const [leads, setLeads] = useState<PilotLead[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

  function updateStatus(id: string, status: PilotLead["status"]) {
    const updated = leads.map((l) => (l.id === id ? { ...l, status } : l));
    setLeads(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  const pending = leads.filter((l) => l.status === "pending");
  const displayed = activeTab === "pending" ? pending : leads;

  return (
    <AdminGuard>
      <Navigation>
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-muted hover:text-primary transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <GraduationCap className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-navy">University Pilot Leads</h1>
            {pending.length > 0 && (
              <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                {pending.length} awaiting contact
              </span>
            )}
          </div>

          <p className="text-sm text-muted -mt-3 ml-8">
            Interest submitted via the /partners/universities page. Stored locally until a database is connected.
          </p>

          {/* Tabs */}
          <div className="flex gap-2">
            {(["pending", "all"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-teal text-white"
                    : "bg-civic-50 text-muted hover:bg-civic-100"
                }`}
              >
                {tab === "pending" ? `Pending (${pending.length})` : "All leads"}
              </button>
            ))}
          </div>

          {/* Empty state */}
          {displayed.length === 0 ? (
            <div className="card text-center py-12">
              <GraduationCap className="w-10 h-10 text-civic-200 mx-auto mb-3" />
              <p className="font-semibold text-navy">No pilot leads yet</p>
              <p className="text-sm text-muted mt-1">University partnership interest will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayed.map((lead) => (
                <div key={lead.id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4 text-violet-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-navy text-sm">{lead.university_name}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {lead.contact_name} ·{" "}
                          <a href={`mailto:${lead.contact_email}`} className="text-primary hover:underline flex items-center gap-0.5 inline-flex">
                            <Mail className="w-3 h-3" /> {lead.contact_email}
                          </a>
                        </p>
                        {lead.student_team_size && (
                          <p className="text-xs text-muted mt-0.5 flex items-center gap-0.5">
                            <Users className="w-3 h-3" /> {lead.student_team_size} international students
                          </p>
                        )}
                        {lead.message && (
                          <p className="text-sm text-muted mt-2 p-3 bg-civic-50 rounded-lg">{lead.message}</p>
                        )}
                        <p className="text-xs text-muted mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(lead.submitted_at).toLocaleString("en-GB")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      {lead.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(lead.id, "contacted")}
                            className="btn-ghost text-xs whitespace-nowrap"
                          >
                            Mark contacted
                          </button>
                          <button
                            onClick={() => updateStatus(lead.id, "converted")}
                            className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors font-medium"
                          >
                            Converted
                          </button>
                        </>
                      )}
                      {lead.status === "contacted" && (
                        <span className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-medium text-center">
                          Contacted
                        </span>
                      )}
                      {lead.status === "converted" && (
                        <span className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 font-medium text-center flex items-center gap-1 justify-center">
                          <CheckCircle className="w-3 h-3" /> Converted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Navigation>
    </AdminGuard>
  );
}
