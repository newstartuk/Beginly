"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Check, ExternalLink, LoaderCircle, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import type { NiaResponse } from "@/lib/platform/types";

interface NiaSource { id: string; title: string; url?: string; authority: string; reviewedAt: string; summary: string }
interface RichNiaResponse extends NiaResponse { conversationId?: string; provider?: string; policyVersion?: string; promptVersion?: string; sources?: NiaSource[]; metrics?: { latencyMs: number; grounded: boolean } }
interface ToolProposal { id: string; tool_code?: string; toolCode?: string; approval_state?: string; approvalState?: string; payload?: Record<string, unknown> }

const starters = ["What should I focus on next?", "Do I need to pay for CV help?", "Show my best opportunity", "Which subscription do I need?"];
const firstResponse: RichNiaResponse = { message: "I am Nia. I can interpret your journey, opportunities, current access and future horizons. I will check free, owned and sponsored capabilities before suggesting a purchase.", mode: "journey", reasonCodes: ["transparent_start"], sourceIds: [], actions: [], confidence: 1 };

function toolForAction(actionId: string): { toolCode: string; payload: Record<string, unknown> } | null {
  if (actionId === "prepare-adviser") return { toolCode: "request_human_review", payload: { subject: "Questions for a regulated adviser", description: "Please help me organise the facts, sources and questions from my Nia conversation.", severity: "normal" } };
  if (actionId === "prepare-application") return { toolCode: "create_support_case", payload: { caseType: "application_preparation", subject: "Application preparation support", description: "Create a governed preparation checklist. Do not submit the application.", severity: "normal" } };
  if (actionId === "approve-submission") return { toolCode: "request_human_review", payload: { subject: "Material application review", description: "I need an authorised human review before any submission decision.", severity: "high" } };
  return null;
}

export default function NiaConversation({ productId }: { productId?: string }) {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<RichNiaResponse>(firstResponse);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [pending, setPending] = useState<{ proposal: ToolProposal; label: string } | null>(null);

  async function submit(value: string) {
    if (!value.trim()) return;
    setLoading(true); setActionMessage("");
    try {
      const request = await fetch("/api/platform/nia", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ message: value, conversationId: response.conversationId, productId }) });
      const data = await request.json() as RichNiaResponse & { error?: { message?: string } };
      if (!request.ok) throw new Error(data.error?.message ?? "Nia could not respond.");
      setResponse(data); setMessage(""); setPending(null);
    } catch (error) { setActionMessage(error instanceof Error ? error.message : "Nia could not respond."); }
    finally { setLoading(false); }
  }

  async function propose(action: NiaResponse["actions"][number]) {
    const tool = toolForAction(action.id);
    if (!tool) { setActionMessage("This action needs an authorised workflow and is not available automatically."); return; }
    if (!response.conversationId) { setActionMessage("Ask Nia a question first so the action can be attached to an auditable conversation."); return; }
    setLoading(true); setActionMessage("");
    try {
      const request = await fetch("/api/platform/nia/tool-proposals", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ conversationId: response.conversationId, toolCode: tool.toolCode, payload: tool.payload, idempotencyKey: crypto.randomUUID() }) });
      const data = await request.json() as ToolProposal & { error?: { message?: string } };
      if (!request.ok) throw new Error(data.error?.message ?? "The Nia action could not be prepared.");
      const approvalState = data.approval_state ?? data.approvalState;
      if (approvalState === "approved") await decide(data, action.label, "approve");
      else { setPending({ proposal: data, label: action.label }); setActionMessage("Review and approve this action. Nia will not execute it silently."); }
    } catch (error) { setActionMessage(error instanceof Error ? error.message : "The Nia action could not be prepared."); }
    finally { setLoading(false); }
  }

  async function decide(proposal: ToolProposal, label: string, decision: "approve" | "reject") {
    setLoading(true); setActionMessage("");
    try {
      const request = await fetch(`/api/platform/nia/tool-proposals/${proposal.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ decision }) });
      const data = await request.json() as ToolProposal & { error?: { message?: string } };
      if (!request.ok) throw new Error(data.error?.message ?? "The Nia action could not be updated.");
      setPending(null); setActionMessage(decision === "approve" ? `${label} has been created through the governed workflow.` : `${label} was not carried out.`);
    } catch (error) { setActionMessage(error instanceof Error ? error.message : "The Nia action could not be updated."); }
    finally { setLoading(false); }
  }

  function onSubmit(event: FormEvent) { event.preventDefault(); void submit(message); }

  return <div className="nia-workspace">
    <div className="nia-trust-strip"><ShieldCheck size={17}/><span>Nia does not provide regulated immigration, legal, medical or financial advice. Material actions require your approval.</span></div>
    <div className="nia-response-card"><div className="nia-avatar"><Bot size={24}/></div><div>
      <div className="nia-response-meta"><strong>Nia</strong><span>{response.mode} · {Math.round(response.confidence * 100)}% confidence{response.provider ? ` · ${response.provider}` : ""}</span></div>
      <p>{response.message}</p>
      {response.recommendation && <div className="nia-recommendation"><Sparkles size={16}/><div><strong>{response.recommendation.type.replaceAll("_", " ")}</strong><span>{response.recommendation.explanation}</span>{response.recommendation.freeAlternative && <small>Free alternative: {response.recommendation.freeAlternative}</small>}</div></div>}
      {response.actions.length > 0 && <div className="nia-actions">{response.actions.map((action) => action.href ? <Link key={action.id} href={action.href}>{action.label}<ArrowRight size={15}/></Link> : <button type="button" key={action.id} onClick={() => void propose(action)} disabled={loading}>{action.label}<ArrowRight size={15}/></button>)}</div>}
      {pending && <div className="nia-recommendation"><ShieldCheck size={16}/><div><strong>Approval required</strong><span>{pending.label}</span><div className="nia-actions"><button type="button" onClick={() => void decide(pending.proposal, pending.label, "approve")} disabled={loading}><Check size={15}/>Approve</button><button type="button" onClick={() => void decide(pending.proposal, pending.label, "reject")} disabled={loading}><X size={15}/>Reject</button></div></div></div>}
      {(response.sources?.length ?? 0) > 0 && <div className="nia-sources"><strong>Sources and signposts</strong>{response.sources?.map((source) => <div key={source.id}>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}<ExternalLink size={12}/></a> : <span>{source.title}</span>}<small>{source.authority} · reviewed {source.reviewedAt}</small></div>)}</div>}
      {!response.sources?.length && response.sourceIds.length > 0 && <div className="nia-sources">Sources/signposts: {response.sourceIds.join(" · ")}</div>}
      {response.metrics && <small>{response.metrics.grounded ? "Grounded response" : "Grounding limited"} · {response.metrics.latencyMs} ms · policy {response.policyVersion}</small>}
    </div></div>
    {actionMessage && <p role="status" aria-live="polite">{actionMessage}</p>}
    <div className="nia-starters">{starters.map((starter) => <button type="button" key={starter} onClick={() => void submit(starter)} disabled={loading}>{starter}</button>)}</div>
    <form onSubmit={onSubmit} className="nia-input"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask Nia about your next step, opportunity or access…" aria-label="Ask Nia"/><button disabled={loading || !message.trim()}>{loading ? <LoaderCircle className="spin" size={18}/> : <Send size={18}/>}<span>Send</span></button></form>
  </div>;
}
