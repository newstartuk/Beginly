"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Code2, Handshake, ShieldCheck } from "lucide-react";
import { assessCommissionReadiness } from "@/lib/platform/partners";
import type { CommissionReadinessInput } from "@/lib/platform/types";

const initial: CommissionReadinessInput = {
  legalEntityVerified: true, clearOffer: true, qualifyingEventDefined: false, attributionWindowDays: 30,
  conversionWebhook: false, reversalRules: false, consumerDisclosure: true, payoutProcess: false, supportProcess: true, fraudControls: false,
};
const fields: Array<{ key: Exclude<keyof CommissionReadinessInput, "attributionWindowDays">; label: string }> = [
  { key: "legalEntityVerified", label: "Legal entity and authorised contact verified" },
  { key: "clearOffer", label: "Offer and customer outcome are clear" },
  { key: "qualifyingEventDefined", label: "Qualifying conversion event is defined" },
  { key: "conversionWebhook", label: "Signed conversion API/webhook is available" },
  { key: "reversalRules", label: "Refund and reversal rules are documented" },
  { key: "consumerDisclosure", label: "Affiliate disclosures are approved" },
  { key: "payoutProcess", label: "Payout and reconciliation process exists" },
  { key: "supportProcess", label: "Customer and partner support route exists" },
  { key: "fraudControls", label: "Duplicate lead and fraud controls exist" },
];

export default function CommissionReadinessTool() {
  const [input, setInput] = useState(initial);
  const result = useMemo(() => assessCommissionReadiness(input), [input]);
  return <div className="commission-tool">
    <div className="commission-score"><div className="score-ring" style={{ "--score": `${result.score}%` } as React.CSSProperties}><strong>{result.score}</strong><span>/100</span></div><div><span className="eyebrow">Current programme status</span><h2>{result.status.replaceAll("_", " ")}</h2><p>Beginly can use this same infrastructure internally and sell it as a B2B enablement service.</p></div></div>
    <div className="commission-grid"><section><h3><Handshake size={18} /> Readiness checklist</h3>{fields.map((field) => <button key={field.key} className={input[field.key] ? "complete" : ""} onClick={() => setInput((current) => ({ ...current, [field.key]: !current[field.key] }))}>{input[field.key] ? <CheckCircle2 size={18} /> : <Circle size={18} />}<span>{field.label}</span></button>)}</section>
    <section className="commission-next"><h3><Code2 size={18} /> Programmatic next actions</h3>{result.nextActions.length ? result.nextActions.map((action, index) => <div key={action}><b>{index + 1}</b><span>{action}</span></div>) : <div><ShieldCheck size={22} /><span>Ready for sandbox integration and marketplace review.</span></div>}<div className="commission-note"><ShieldCheck size={17} /><span>No programme is published until offer, trust, disclosure and conversion tests pass.</span></div></section></div>
  </div>;
}
