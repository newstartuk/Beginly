"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  Shield,
} from "lucide-react";
import Disclaimer from "@/components/Disclaimer";
import InfoCard from "@/components/InfoCard";
import StepList from "@/components/StepList";
import PlatformShell from "@/components/platform/PlatformShell";
import StatusPill from "@/components/platform/StatusPill";

const GP_SEARCH_URL = "https://www.nhs.uk/service-search/find-a-gp";

export default function NHSPage() {
  const [registered, setRegistered] = useState(false);
  const [uhsName, setUhsName] = useState("");

  return (
    <PlatformShell
      title="NHS and Healthcare"
      eyebrow="First-week health setup"
      action={<StatusPill tone="positive">Register with a GP early</StatusPill>}
    >
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy">NHS and Healthcare Guide</h1>
            <p className="text-xs text-muted mt-0.5">
              Everything you need to know about accessing healthcare in the UK
            </p>
          </div>
        </div>

        <div className="disclaimer-box flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-muted shrink-0 mt-0.5" />
          <p>
            This guide is for general information only. Beginly does not provide medical advice. For health concerns, contact the NHS directly or visit your GP.
          </p>
        </div>

        <InfoCard title="How the NHS works">
          <p className="text-sm text-civic-700 leading-relaxed mb-4">
            The <strong>NHS (National Health Service)</strong> is the UK's publicly funded healthcare system. It is available to UK residents, including international students, and is largely <strong>free at the point of use</strong>.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: CheckCircle, label: "Free at point of use", desc: "GP visits, emergency care, and most treatments are free" },
              { icon: Shield, label: "You must register", desc: "You need to register with a GP to access non-emergency care" },
              { icon: Clock, label: "Register immediately", desc: "Do this within your first week - do not wait until you are unwell" },
              { icon: MapPin, label: "Find a local GP", desc: "You can register with any GP near your accommodation" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-2.5 p-3 bg-civic-50 rounded-xl">
                <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-navy">{label}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </InfoCard>

        <div className="card">
          <h2 className="section-title">Step 1 - Register with a GP</h2>
          <p className="text-sm text-civic-700 leading-relaxed mb-4">
            A <strong>GP (General Practitioner)</strong> is your first point of contact for non-emergency health issues.
          </p>
          <StepList
            steps={[
              "Find a GP near your accommodation using the NHS GP search tool",
              "Check that the surgery is accepting new patients",
              "Fill in the GMS1 registration form",
              "Provide proof of identity and proof of address",
              "Keep your NHS number safe once you receive it",
            ]}
            className="mb-4"
          />
          <a
            href={GP_SEARCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full justify-center"
          >
            <ExternalLink className="w-4 h-4" /> Find a GP near you on NHS.uk
          </a>
        </div>

        <div className="card border-primary/20 bg-teal-50/30">
          <h2 className="text-sm font-semibold text-navy mb-2">University Health Service</h2>
          <p className="text-sm text-civic-700 leading-relaxed mb-3">
            Many universities have an on-campus health service. This is often the easiest option for students because the staff understand student and international arrival issues well.
          </p>
          <div className="bg-white rounded-xl p-3 border border-border">
            <label className="block text-xs text-muted mb-1.5">
              Your university health service (optional)
            </label>
            <input
              type="text"
              value={uhsName}
              onChange={(event) => setUhsName(event.target.value)}
              placeholder="e.g. University Health Service"
              className="input-field text-sm"
            />
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">What you can access with NHS registration</h2>
          <div className="space-y-3">
            {[
              { title: "GP appointments", desc: "For illness, infections, mental health referrals, prescriptions, and general health advice", badge: "Free", tone: "bg-green-100 text-green-700" },
              { title: "Emergency department (A&E)", desc: "For serious injuries and life-threatening conditions", badge: "Free", tone: "bg-green-100 text-green-700" },
              { title: "Walk-in centres", desc: "For minor injuries and illnesses without an appointment", badge: "Free", tone: "bg-green-100 text-green-700" },
              { title: "Mental health support", desc: "Usually accessed through a GP referral", badge: "Free", tone: "bg-green-100 text-green-700" },
              { title: "Prescriptions", desc: "Often reduced or exempt depending on your situation", badge: "Reduced", tone: "bg-amber-100 text-amber-700" },
              { title: "Dentist", desc: "Not free, but NHS dental costs are lower than private care", badge: "Paid", tone: "bg-civic-100 text-civic-600" },
            ].map(({ title, desc, badge, tone }) => (
              <div key={title} className="flex items-start justify-between gap-3 p-3 bg-civic-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-navy">{title}</p>
                  <p className="text-xs text-muted mt-0.5">{desc}</p>
                </div>
                <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${tone}`}>
                  {badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card border-blue-200 bg-blue-50">
          <h2 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" /> NHS 111
          </h2>
          <p className="text-sm text-blue-700 mb-3">
            Call <strong>111</strong> when you need urgent medical help but it is not a 999 emergency.
          </p>
          <p className="text-sm text-blue-700">
            Available 24 hours a day, 7 days a week, and free to call.
          </p>
        </div>

        <div className="card border-amber-200 bg-amber-50">
          <h2 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Immigration Health Surcharge
          </h2>
          <p className="text-sm text-amber-700">
            Most international students on a Student Visa have already paid the Immigration Health Surcharge as part of the visa process. Keep the confirmation and visa approval details available.
          </p>
        </div>

        <div className="card">
          <h2 className="section-title">Track your NHS task</h2>
          <div className="flex items-center justify-between p-3 bg-civic-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-navy">Have you registered with a GP?</p>
              <p className="text-xs text-muted mt-0.5">Do this within your first week in the UK</p>
            </div>
            <button
              onClick={() => setRegistered((value) => !value)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                registered
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-muted hover:border-primary/40"
              }`}
            >
              {registered ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Registered
                </>
              ) : (
                "Mark done"
              )}
            </button>
          </div>
        </div>

        <div className="card bg-civic-50">
          <p className="text-xs font-semibold text-muted uppercase mb-1">Official sources</p>
          <p className="text-sm text-civic-600 leading-relaxed">
            <a href="https://www.nhs.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NHS website</a>
            {" · "}
            <a href={GP_SEARCH_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Find a GP</a>
            {" · "}
            <a href="https://www.gov.uk/healthcare-immigration-application" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Immigration Health Surcharge</a>
          </p>
        </div>

        <Disclaimer type="medical" />
      </div>
    </PlatformShell>
  );
}
