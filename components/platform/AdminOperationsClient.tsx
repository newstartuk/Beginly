"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminOperationsItem } from "@/lib/platform/admin-operations";
import StatusPill from "./StatusPill";

type Action = { label: string; endpoint: string; body: Record<string, unknown>; tone?: "danger" | "primary" };
function actionsFor(item: AdminOperationsItem): Action[] {
  if (item.queueId === "support") return [
    { label: "Triage", endpoint: `/api/admin/support-cases/${item.id}`, body: { action: "triage" } },
    { label: "Assign to me", endpoint: `/api/admin/support-cases/${item.id}`, body: { action: "assign" }, tone: "primary" },
    { label: "Escalate", endpoint: `/api/admin/support-cases/${item.id}`, body: { action: "escalate" }, tone: "danger" },
    { label: "Resolve", endpoint: `/api/admin/support-cases/${item.id}`, body: { action: "resolve" }, tone: "primary" },
  ];
  if (item.queueId === "data_rights") {
    const requestType = typeof item.metadata?.requestType === "string" ? item.metadata.requestType : "export";
    const workerFulfilled = requestType === "export" || requestType === "delete";
    return [
      { label: "Verify identity", endpoint: `/api/admin/data-rights/${item.id}`, body: { state: "validating", evidence: { identity_verified: true } } },
      { label: requestType === "delete" ? "Confirm and start deletion" : "Start fulfilment", endpoint: `/api/admin/data-rights/${item.id}`, body: { state: "in_progress", evidence: { identity_verified: true, ...(requestType === "delete" ? { deletion_confirmed: true } : {}) } }, tone: "primary" },
      ...(!workerFulfilled ? [{ label: "Complete", endpoint: `/api/admin/data-rights/${item.id}`, body: { state: "completed", evidence: { identity_verified: true, completion_recorded: true } }, tone: "primary" as const }] : []),
      { label: "Reject", endpoint: `/api/admin/data-rights/${item.id}`, body: { state: "rejected" }, tone: "danger" },
    ];
  }
  if (item.queueId === "content") return [
    { label: "Move to review", endpoint: `/api/admin/content-publications/${item.id}`, body: { publicationState: "review", indexState: "noindex" } },
    { label: "Publish + index", endpoint: `/api/admin/content-publications/${item.id}`, body: { publicationState: "published", indexState: "index", nextReviewAt: new Date(Date.now() + 90 * 86_400_000).toISOString() }, tone: "primary" },
    { label: "Retire", endpoint: `/api/admin/content-publications/${item.id}`, body: { publicationState: "retired", indexState: "expired" }, tone: "danger" },
  ];
  if (item.queueId === "domains") {
    const meta = item.metadata ?? {};
    const payload = { allowSubdomains: meta.allowSubdomains === true, allowedRedirectHosts: Array.isArray(meta.allowedRedirectHosts) ? meta.allowedRedirectHosts : [], disclosureRequired: meta.disclosureRequired !== false, attributionMode: typeof meta.attributionMode === "string" ? meta.attributionMode : "none", privacyNote: typeof meta.privacyNote === "string" ? meta.privacyNote : undefined };
    return [
      { label: "Approve", endpoint: `/api/admin/outbound-policies/${item.id}`, body: { ...payload, status: "approved" }, tone: "primary" },
      { label: "Suspend", endpoint: `/api/admin/outbound-policies/${item.id}`, body: { ...payload, status: "suspended" } },
      { label: "Block", endpoint: `/api/admin/outbound-policies/${item.id}`, body: { ...payload, status: "blocked" }, tone: "danger" },
    ];
  }
  if (item.queueId === "incidents") return [
    { label: "Investigate", endpoint: `/api/admin/incidents/${item.id}`, body: { state: "investigating" }, tone: "primary" },
    { label: "Mark mitigated", endpoint: `/api/admin/incidents/${item.id}`, body: { state: "mitigated" } },
    { label: "Resolve", endpoint: `/api/admin/incidents/${item.id}`, body: { state: "resolved" }, tone: "primary" },
  ];
  if (item.queueId === "conversion_claims") return [
    { label: "Provider confirmed", endpoint: `/api/admin/conversion-claims/${item.id}`, body: { decision: "confirm" }, tone: "primary" },
    { label: "Reject claim", endpoint: `/api/admin/conversion-claims/${item.id}`, body: { decision: "reject" }, tone: "danger" },
  ];
  return [];
}

export default function AdminOperationsClient({ initialItems }: { initialItems: AdminOperationsItem[] }) {
  const router = useRouter(); const [items, setItems] = useState(initialItems); const [busy, setBusy] = useState<string>(); const [message, setMessage] = useState(""); const [notes,setNotes]=useState<Record<string,string>>({});
  async function work(item:AdminOperationsItem,action:"assign"|"note") { const key=`${item.queueId}:${item.id}:${action}`; setBusy(key); setMessage(""); const response=await fetch(`/api/admin/work-items/${item.queueId}/${item.id}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({action,note:notes[item.id]})}); const data=await response.json(); setBusy(undefined); if(!response.ok){setMessage(data.error?.message??"Work item could not be updated.");return} if(action==="note")setNotes(current=>({...current,[item.id]:""})); setMessage(action==="assign"?`${item.title} assigned to you.`:`Internal note added to ${item.title}.`); router.refresh(); }
  async function mutate(item: AdminOperationsItem, action: Action) {
    setBusy(`${item.id}:${action.label}`); setMessage("");
    const response = await fetch(action.endpoint, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(action.body) });
    const data = await response.json(); setBusy(undefined);
    if (!response.ok) { setMessage(data.error?.message ?? "Operation could not be completed."); return; }
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    setMessage(`${action.label} completed for ${item.title}.`); router.refresh();
  }
  if (!items.length) return <section className="admin-policy"><h2>Operational queues are clear</h2><p>No open item-level actions require attention.</p></section>;
  return <section className="admin-operation-items"><div className="platform-section-heading"><div><span>Item-level controls</span><h2>Work the live queues</h2></div><p>Every mutation is role-gated and written to the audit trail.</p></div>{items.map((item) => <article key={`${item.queueId}:${item.id}`}><div className="admin-item-copy"><div><StatusPill tone={item.severity === "urgent" || item.severity === "high" ? "warning" : "neutral"}>{item.queueId.replaceAll("_", " ")}</StatusPill><StatusPill tone="neutral">{item.state.replaceAll("_", " ")}</StatusPill></div><h3>{item.title}</h3><p>{item.detail}</p>{item.createdAt && <small>{new Date(item.createdAt).toLocaleString()}</small>}</div><div className="admin-item-actions"><button disabled={Boolean(busy)} className="platform-secondary" onClick={()=>work(item,"assign")}>{busy===`${item.queueId}:${item.id}:assign`?"Assigning…":"Assign to me"}</button>{actionsFor(item).map((action) => <button key={action.label} disabled={Boolean(busy)} className={action.tone === "primary" ? "platform-primary" : action.tone === "danger" ? "platform-danger" : "platform-secondary"} onClick={() => mutate(item, action)}>{busy === `${item.id}:${action.label}` ? "Working…" : action.label}</button>)}<input aria-label={`Internal note for ${item.title}`} placeholder="Internal note" value={notes[item.id]??""} onChange={event=>setNotes(current=>({...current,[item.id]:event.target.value}))}/><button disabled={Boolean(busy)||!(notes[item.id]??"").trim()} className="platform-secondary" onClick={()=>work(item,"note")}>{busy===`${item.queueId}:${item.id}:note`?"Saving…":"Add note"}</button></div></article>)}{message && <p aria-live="polite">{message}</p>}</section>;
}
