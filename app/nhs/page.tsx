"use client";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Shield, Phone, MapPin, Clock, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import Disclaimer from "@/components/Disclaimer";
import StepList from "@/components/StepList";
import InfoCard from "@/components/InfoCard";

const GP_SEARCH_URL = "https://www.nhs.uk/service-search/find-a-gp";

export default function NHSPage() {
  const [registered, setRegistered] = useState(false);
  const [uhsNumber, setUhsNumber] = useState("");

  return (
    <Navigation>
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy">NHS &amp; Healthcare Guide</h1>
            <p className="text-xs text-muted mt-0.5">Everything you need to know about accessing healthcare in the UK</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="disclaimer-box flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-muted shrink-0 mt-0.5" />
          <p>This guide is for general information only. SettleMap does not provide medical advice. For health concerns, contact the NHS directly or visit your GP.</p>
        </div>

        {/* NHS Overview */}
        <InfoCard title="How the NHS works">
          <p className="text-sm text-civic-700 leading-relaxed mb-4">
            The <strong>NHS (National Health Service)</strong> is the UK's publicly funded healthcare system. It is one of the world's largest and most comprehensive health services, available to all UK residents — including international students — and is largely <strong>free at the point of use</strong>.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: CheckCircle, label: "Free at point of use", desc: "GP visits, emergency care, and most treatments are free" },
              { icon: Shield, label: "You must register", desc: "You need to register with a GP to access non-emergency care" },
              { icon: Clock, label: "Register immediately", desc: "Do this within your first week — do not wait until you are unwell" },
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

        {/* Register with a GP */}
        <div className="card">
          <h2 className="section-title">Step 1 — Register with a GP</h2>
          <p className="text-sm text-civic-700 leading-relaxed mb-4">
            A <strong>GP (General Practitioner)</strong> is your first point of contact for non-emergency health issues. You must be registered with one to book appointments, get referrals, or access prescriptions.
          </p>
          <StepList steps={[
            "Find a GP near your accommodation using the NHS GP search tool",
            "Check the GP surgery's website or call them to confirm they are accepting new patients",
            "Fill in the GMS1 registration form (available at the surgery or online)",
            "Provide proof of identity (passport) and proof of address (tenancy agreement or utility bill)",
            "You will receive an NHS Number — keep this safe",
          ]} className="mb-4" />
          <a
            href={GP_SEARCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full justify-center"
          >
            <ExternalLink className="w-4 h-4" /> Find a GP near you on NHS.uk
          </a>
        </div>

        {/* University Health Service */}
        <div className="card border-primary/20 bg-teal-50/30">
          <h2 className="text-sm font-semibold text-navy mb-2">University Health Service (UHS)</h2>
          <p className="text-sm text-civic-700 leading-relaxed mb-3">
            Most universities have an on-campus <strong>University Health Service (UHS)</strong>. This is often the easiest option for students — it is close, familiar with student health needs, and the staff understand international student experiences.
          </p>
          <p className="text-sm text-civic-700 leading-relaxed mb-3">
            <strong>Tip:</strong> Ask your university's student services or check their website for details. Many students register with the UHS rather than a local GP.
          </p>
          <div className="bg-white rounded-xl p-3 border border-border">
            <label className="block text-xs text-muted mb-1.5">Your university's health service (optional)</label>
            <input
              type="text"
              value={uhsNumber}
              onChange={(e) => setUhsNumber(e.target.value)}
              placeholder="e.g. UCL Student Health Service"
              className="input-field text-sm"
            />
          </div>
        </div>

        {/* What you can access */}
        <div className="card">
          <h2 className="section-title">What you can access with NHS registration</h2>
          <div className="space-y-3">
            {[
              { title: "GP appointments", desc: "For illness, infections, mental health referrals, prescriptions, and general health advice", free: true },
              { title: "Emergency department (A&E)", desc: "For serious injuries, life-threatening conditions — call 999 or go directly", free: true },
              { title: "Walk-in centres", desc: "For minor injuries and illnesses without an appointment", free: true },
              { title: "Sexual health services", desc: "Free and confidential STI testing, contraception, and advice", free: true },
              { title: "Mental health support", desc: "Access via your GP — you can be referred to NHS talking therapies or counselling", free: true },
              { title: "Prescriptions", desc: "Free or reduced cost prescriptions for students (check your eligibility)", free: "reduced" },
              { title: "Dentist", desc: "Dental treatment is not free — register with an NHS dentist for reduced costs", free: false },
              { title: "Optician", desc: "Eye tests are free on the NHS; glasses/contact lenses are partially subsidised", free: "partial" },
            ].map(({ title, desc, free }) => (
              <div key={title} className="flex items-start justify-between gap-3 p-3 bg-civic-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-navy">{title}</p>
                  <p className="text-xs text-muted mt-0.5">{desc}</p>
                </div>
                <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  free === true ? "bg-green-100 text-green-700" :
                  free === "reduced" ? "bg-amber-100 text-amber-700" :
                  free === "partial" ? "bg-blue-100 text-blue-700" :
                  "bg-civic-100 text-muted"
                }`}>
                  {free === true ? "Free" : free === "reduced" ? "Reduced" : free === "partial" ? "Partial" : "Full cost"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* NHS 111 */}
        <div className="card border-blue-200 bg-blue-50">
          <h2 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" /> NHS 111 — When to call
          </h2>
          <p className="text-sm text-blue-700 mb-3">
            Call <strong>111</strong> when you need urgent medical help but it is not a 999 emergency. You can also use it to find local services, get health information, or ask about symptoms.
          </p>
          <p className="text-sm text-blue-700">
            Available 24 hours a day, 7 days a week. Free to call.
          </p>
        </div>

        {/* IHME / Healthcare surcharge */}
        <div className="card border-amber-200 bg-amber-50">
          <h2 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Immigration Health Surcharge (IHS)
          </h2>
          <p className="text-sm text-amber-700 mb-2">
            If you are an international student on a Student Visa, you have already paid the <strong>Immigration Health Surcharge (IHS)</strong> as part of your visa application. This gives you access to the NHS during your stay.
          </p>
          <p className="text-sm text-amber-700">
            Keep a copy of your IHS payment confirmation and visa approval email — you may be asked to show this at a GP registration or hospital.
          </p>
        </div>

        {/* Mental health */}
        <div className="card">
          <h2 className="section-title">Mental health support</h2>
          <p className="text-sm text-civic-700 leading-relaxed mb-4">
            Moving to a new country can be stressful. It is completely normal to feel lonely, anxious, or overwhelmed at times. The NHS and universities offer free, confidential mental health support.
          </p>
          <div className="space-y-2">
            {[
              { label: "University counselling service", desc: "Free sessions for students — contact your university's student services" },
              { label: "NHS Talking Therapies", desc: "Free NHS-approved counselling and cognitive behavioural therapy (CBT) — ask your GP for a referral" },
              { label: "International Student Calculator", desc: "A wellbeing tool specifically for international students — nia.org.uk" },
              { label: "Samaritans", desc: "Confidential emotional support: 116 123 (free, 24/7)" },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-2.5 p-3 bg-civic-50 rounded-xl">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-navy">{label}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist tracker */}
        <div className="card">
          <h2 className="section-title">Track your NHS tasks</h2>
          <div className="flex items-center justify-between p-3 bg-civic-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-navy">Have you registered with a GP?</p>
              <p className="text-xs text-muted mt-0.5">Do this within your first week in the UK</p>
            </div>
            <button
              onClick={() => setRegistered(!registered)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                registered
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-muted hover:border-primary/40"
              }`}
            >
              {registered ? <><CheckCircle className="w-3.5 h-3.5" /> Registered</> : "Mark done"}
            </button>
          </div>
        </div>

        {/* Sources */}
        <div className="card bg-civic-50">
          <p className="text-xs font-semibold text-muted uppercase mb-1">Official sources</p>
          <p className="text-sm text-civic-600 leading-relaxed">
            <a href="https://www.nhs.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NHS website (nhs.uk)</a> · <a href={GP_SEARCH_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Find a GP</a> · <a href="https://www.gov.uk/healthcare-immigration-application" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Immigration Health Surcharge (GOV.UK)</a>
          </p>
        </div>

        <Disclaimer type="medical" />
      </div>
    </Navigation>
  );
}
