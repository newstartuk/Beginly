"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MigrationRoute } from "@/lib/platform/types";

const routes: Array<{ value: MigrationRoute; label: string }> = [
  { value: "student", label: "Student" }, { value: "graduate", label: "Graduate" }, { value: "skilled_worker", label: "Skilled Worker" },
  { value: "health_care", label: "Health and Care" }, { value: "family_dependant", label: "Family or dependant" }, { value: "founder", label: "Founder" },
  { value: "global_talent", label: "Global Talent" }, { value: "humanitarian", label: "Humanitarian" },
];

export default function ProductEntryForm({ productId, productName, initial }: { productId: string; productName: string; initial?: { routeContext: MigrationRoute; goal: string; contextNotes?: string; personalisationConsent: boolean } | null }) {
  const router = useRouter();
  const [routeContext, setRouteContext] = useState<MigrationRoute>(initial?.routeContext ?? "graduate");
  const [goal, setGoal] = useState(initial?.goal ?? "");
  const [contextNotes, setContextNotes] = useState(initial?.contextNotes ?? "");
  const [consent, setConsent] = useState(initial?.personalisationConsent ?? true);
  const [message, setMessage] = useState(initial ? "Product context active." : "Complete this short setup to use the product without settlement onboarding.");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!goal.trim()) { setMessage("Tell Beginly the outcome you want from this product."); return; }
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/platform/products/${encodeURIComponent(productId)}/entry`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ routeContext, goal, contextNotes, personalisationConsent: consent, idempotencyKey: crypto.randomUUID() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Product setup could not be saved.");
      setMessage(`${productName} is ready with your product-specific context.`); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Product setup could not be saved."); }
    finally { setBusy(false); }
  }

  return <section className="trust-panel" aria-labelledby="product-entry-title">
    <h3 id="product-entry-title">Product-only setup</h3>
    <p>Share only the context needed for this workspace. You can activate the wider free Beginly journey later.</p>
    <label className="input-label" htmlFor="product-route">Current context</label>
    <select id="product-route" className="input-field" value={routeContext} onChange={(event) => setRouteContext(event.target.value as MigrationRoute)}>{routes.map((route) => <option key={route.value} value={route.value}>{route.label}</option>)}</select>
    <label className="input-label" htmlFor="product-goal">What outcome do you want?</label>
    <input id="product-goal" className="input-field" value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="For example: prepare a strong CV for project roles" maxLength={500}/>
    <label className="input-label" htmlFor="product-notes">Useful context (optional)</label>
    <textarea id="product-notes" className="input-field" value={contextNotes} onChange={(event) => setContextNotes(event.target.value)} placeholder="Deadlines, experience or constraints" maxLength={2000} rows={4}/>
    <label className="settings-toggle"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)}/><span>Allow Nia to use this product-specific context. You can turn this off later.</span></label>
    <button type="button" className="platform-primary" disabled={busy} onClick={() => void save()}>{busy ? "Saving…" : initial ? "Update product context" : "Activate product workspace"}</button>
    <small role="status" aria-live="polite">{message}</small>
  </section>;
}
