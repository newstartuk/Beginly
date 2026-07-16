"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, FileText, Save } from "lucide-react";

export default function TaskActions({ taskId, complete, note: initialNote = "", evidenceReference = "" }: { taskId: string; complete: boolean; note?: string; evidenceReference?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(Boolean(initialNote || evidenceReference));
  const [note, setNote] = useState(initialNote);
  const [evidenceReferenceValue, setEvidenceReference] = useState(evidenceReference);
  const [message, setMessage] = useState("");
  async function act(action: "complete" | "reopen" | "defer" | "irrelevant" | "note") {
    setBusy(true); setMessage("");
    const body: Record<string, unknown> = { action, idempotencyKey: crypto.randomUUID(), note: note || undefined, evidence: evidenceReferenceValue ? { reference: evidenceReferenceValue } : undefined };
    if (action === "defer") body.deferUntil = new Date(Date.now() + 7 * 86_400_000).toISOString();
    const response = await fetch(`/api/platform/journey/tasks/${taskId}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) { setMessage(data.error?.message ?? "Task could not be updated."); return; }
    setMessage(action === "complete" ? "Completed" : action === "reopen" ? "Reopened" : action === "defer" ? "Deferred for seven days" : action === "irrelevant" ? "Removed from this journey" : "Notes and evidence saved");
    router.refresh();
  }
  return <div className="task-actions-wrap">
    <div className="task-actions">
      <button disabled={busy} className="platform-primary" onClick={() => act(complete ? "reopen" : "complete")}>{complete ? "Reopen" : "Complete"}</button>
      <button disabled={busy} className="platform-secondary" onClick={() => act("defer")}>Defer</button>
      <button disabled={busy} className="platform-secondary" onClick={() => act("irrelevant")}>Not relevant</button>
      <button disabled={busy} className="platform-secondary" onClick={() => setExpanded((value) => !value)}><FileText size={15}/> Notes</button>
      <a className="platform-secondary" href={`/api/platform/journey/tasks/${taskId}/calendar`} download><CalendarPlus size={15}/> Calendar</a>
    </div>
    {expanded && <div className="task-evidence-panel">
      <label>Private note<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Record what you have done or what remains." maxLength={2000}/></label>
      <label>Evidence reference<input value={evidenceReferenceValue} onChange={(event) => setEvidenceReference(event.target.value)} placeholder="Document name, secure link or reference number" maxLength={500}/></label>
      <button disabled={busy} className="platform-primary" onClick={() => act("note")}><Save size={15}/> Save note and evidence</button>
    </div>}
    {message && <small aria-live="polite">{message}</small>}
  </div>;
}
