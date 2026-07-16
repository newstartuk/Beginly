"use client";

import { AlertTriangle, Building2, CheckCircle, CreditCard, ExternalLink } from "lucide-react";
import Disclaimer from "@/components/Disclaimer";
import InfoCard from "@/components/InfoCard";
import StepList from "@/components/StepList";
import PlatformShell from "@/components/platform/PlatformShell";
import StatusPill from "@/components/platform/StatusPill";

const UK_BANKS = [
  { name: "Monzo", logo: "M", desc: "Digital bank - easy to open, great app, no branch needed", goodFor: "Quick setup, international students, mobile-first", score: 9, url: "https://monzo.com" },
  { name: "Starling Bank", logo: "S", desc: "Digital bank - fee-free worldwide spending, full UK account", goodFor: "Travel cards, money management, international transfers", score: 9, url: "https://starlingbank.com" },
  { name: "Revolut", logo: "R", desc: "Digital bank/app - good for currency exchange and travel", goodFor: "Currency exchange, travel, spending management", score: 8, url: "https://revolut.com" },
  { name: "Lloyds Bank", logo: "L", desc: "Traditional high-street bank - widely available", goodFor: "Branches, student accounts, cash deposits", score: 8, url: "https://www.lloydsbank.com" },
  { name: "Barclays", logo: "B", desc: "Traditional bank with strong student account offering", goodFor: "Student account with overdraft, branches", score: 7, url: "https://www.barclays.co.uk" },
  { name: "HSBC UK", logo: "H", desc: "Large traditional bank with international reach", goodFor: "International students, global transfers", score: 7, url: "https://www.hsbc.co.uk" },
  { name: "Santander", logo: "S", desc: "Popular with students - 123 Student Account", goodFor: "Cashback, UK-wide branches", score: 7, url: "https://www.santander.co.uk" },
  { name: "NatWest", logo: "N", desc: "Part of RBS group - strong student account", goodFor: "Student incentives, app, branch network", score: 7, url: "https://www.natwest.com" },
];

const DOCUMENTS_NEEDED = [
  "Passport or UKVI eVisa - primary ID",
  "Proof of address - tenancy agreement, university letter, or utility bill (dated within last 3 months)",
  "Student status letter - from your university (ask student services)",
  "UK phone number - required by most banks (get a free SIM on arrival)",
  "Proof of enrollment - CAS (Confirmation of Acceptance for Studies) or offer letter",
];

const STEPS = [
  "Get a UK phone number (free SIM: giffgaff, Lebara, or Lycamobile)",
  "Gather your documents (passport, UKVI eVisa, proof of address, student letter)",
  "Apply online or visit a branch - Monzo and Starling are fully digital and fastest",
  "Wait for your sort code and account number (usually 1-5 working days)",
  "Receive your debit card by post (3-7 working days)",
  "Activate your card and set up mobile banking app",
  "Set up Direct Debits for rent, phone, and essentials",
];

export default function BankPage() {
  return (
    <PlatformShell
      title="Banking"
      eyebrow="Newcomer-friendly UK account setup"
      action={<StatusPill tone="positive">Monzo, Revolut, Lloyds and more</StatusPill>}
    >
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy">UK Banking Guide</h1>
            <p className="text-xs text-muted mt-0.5">
              How to open a UK bank account as an international student
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">What you need to open a UK bank account</h2>
          <div className="space-y-2 mb-4">
            {DOCUMENTS_NEEDED.map((doc) => (
              <div key={doc} className="flex items-start gap-2.5 text-sm text-civic-700">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                {doc}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted">
            <strong>Note:</strong> Most banks accept your passport and UKVI eVisa as primary ID. If you have an older physical BRP card, check with your bank first because some may still accept it.
          </p>
        </div>

        <InfoCard title="How to open your account">
          <StepList steps={STEPS} />
        </InfoCard>

        <div>
          <h2 className="text-sm font-bold text-navy uppercase tracking-wide mb-3">Recommended UK banks</h2>
          <div className="space-y-3">
            {UK_BANKS.map((bank) => (
              <div key={bank.name} className="card border-border hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl font-bold text-primary">{bank.logo}</span>
                    <div>
                      <p className="text-sm font-bold text-navy">{bank.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[...Array(5)].map((_, index) => (
                          <span key={index} className={`text-xs ${index < Math.floor(bank.score / 2) ? "text-amber-400" : "text-civic-200"}`}>*</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <a
                    href={bank.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-xs py-1 px-2 shrink-0 flex items-center gap-1"
                  >
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-sm text-civic-600 mb-2">{bank.desc}</p>
                <div className="flex items-start gap-1.5 text-xs text-muted bg-civic-50 rounded-lg p-2">
                  <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span><strong>Good for:</strong> {bank.goodFor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card border-primary/20 bg-teal-50/30">
          <h2 className="text-sm font-semibold text-navy mb-2">Get a free UK SIM card first</h2>
          <p className="text-sm text-civic-600 mb-3 leading-relaxed">
            Most UK banks require a UK phone number to open an account. Get a free PAYG SIM card at the airport or any convenience store immediately on arrival.
          </p>
          <div className="grid sm:grid-cols-3 gap-2">
            {[
              { name: "giffgaff", note: "Free SIM, uses O2 network" },
              { name: "Lebara", note: "Free SIM, good international calls" },
              { name: "Lycamobile", note: "Free SIM, very cheap abroad" },
            ].map(({ name, note }) => (
              <div key={name} className="bg-white rounded-xl p-3 border border-border">
                <p className="text-sm font-semibold text-navy">{name}</p>
                <p className="text-xs text-muted">{note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card border-blue-200 bg-blue-50">
          <h2 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Sending money to the UK?
          </h2>
          <p className="text-sm text-blue-700 mb-2 leading-relaxed">
            For international transfers from home, avoid high street bank fees where possible and compare specialist services first.
          </p>
          <div className="space-y-2">
            {[
              { name: "Wise", fee: "~0.5% mid-market rate" },
              { name: "Revolut", fee: "Fee-free up to limit" },
              { name: "Monzo", fee: "Fee-free for up to £500/month abroad" },
            ].map(({ name, fee }) => (
              <div key={name} className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-navy">{name}</p>
                <span className="text-xs text-muted">{fee}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Student overdrafts</h2>
          <p className="text-sm text-civic-600 leading-relaxed mb-3">
            Most UK student bank accounts offer an <strong>interest-free overdraft</strong> - money you can borrow up to a limit without paying interest.
          </p>
          <div className="space-y-2 text-sm">
            {[
              "Overdrafts are not free money - you must pay them back",
              "Most banks offer £1,000-£2,000 interest-free overdraft for students",
              "Only use an overdraft in genuine emergencies",
              "Going overdrawn without arranging it first incurs fees and interest",
              "Never exceed your arranged overdraft limit",
            ].map((tip) => (
              <div key={tip} className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-amber-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card border-2 border-red-200 bg-red-50">
          <h2 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Banking scam warning
          </h2>
          <p className="text-sm text-red-600 mb-2 leading-relaxed">
            Scammers specifically target international students with fake bank account scams. Your bank will never ask you to move money to a safe account or ask for your full password or PIN over the phone.
          </p>
          <p className="text-sm text-red-600 leading-relaxed">
            If in doubt, hang up and call your bank's official number from the back of your card or official website.
          </p>
        </div>

        <div className="card bg-civic-50">
          <p className="text-xs font-semibold text-muted uppercase mb-1">Official sources</p>
          <p className="text-sm text-civic-600 leading-relaxed">
            <a href="https://www.gov.uk/set-up-uk-bank-account" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GOV.UK: Set up a UK bank account</a>
            {" · "}
            <a href="https://www.ukfinance.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">UK Finance</a>
            {" · "}
            <a href="https://www.fca.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Financial Conduct Authority (FCA)</a>
          </p>
        </div>

        <Disclaimer type="financial" />
      </div>
    </PlatformShell>
  );
}
