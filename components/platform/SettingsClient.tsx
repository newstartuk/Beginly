"use client";
import { useEffect, useState } from "react";

type Prefs = { personalisationEnabled: boolean; locationEnabled: boolean; remindersEnabled: boolean; householdSharingEnabled: boolean; commercialRecommendationMode: "minimal" | "contextual" | "off" };
type RightsRequest = { id: string; request_type: "export" | "delete" | "rectify" | "restrict"; state: string; requested_at: string; completed_at?: string | null };
const defaults: Prefs = { personalisationEnabled: true, locationEnabled: false, remindersEnabled: true, householdSharingEnabled: true, commercialRecommendationMode: "contextual" };

export default function SettingsClient() {
  const [prefs, setPrefs] = useState(defaults);
  const [requests, setRequests] = useState<RightsRequest[]>([]);
  const [status, setStatus] = useState("Loading preferences…");

  async function loadRights() {
    const response = await fetch("/api/platform/data-rights", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) setRequests(data.requests ?? []);
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/platform/preferences", { cache: "no-store" }).then((response) => response.json()),
      loadRights(),
    ]).then(([data]) => {
      const p = data.preferences;
      if (p) setPrefs({ personalisationEnabled: p.personalisation_enabled ?? true, locationEnabled: p.location_enabled ?? false, remindersEnabled: p.reminders_enabled ?? true, householdSharingEnabled: p.household_sharing_enabled ?? true, commercialRecommendationMode: p.commercial_recommendation_mode ?? "contextual" });
      setStatus("");
    }).catch(() => setStatus("Settings could not be loaded."));
  }, []);

  async function save(next: Prefs) {
    setPrefs(next); setStatus("Saving…");
    const response = await fetch("/api/platform/preferences", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(next) });
    setStatus(response.ok ? "Saved" : "Preferences could not be saved.");
  }

  async function dataRight(requestType: "export" | "delete" | "rectify") {
    setStatus("Submitting request…");
    const response = await fetch("/api/platform/data-rights", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ requestType, idempotencyKey: crypto.randomUUID(), scope: { platform: true } }) });
    setStatus(response.ok ? `${requestType} request received.` : "Request could not be submitted.");
    if (response.ok) await loadRights();
  }

  async function downloadExport(id: string) {
    setStatus("Creating a secure download link…");
    const response = await fetch(`/api/platform/data-rights/${id}/download`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.url) { setStatus(data.error?.message ?? "Export is not ready."); return; }
    window.location.assign(data.url);
    setStatus("Your private export link is valid for five minutes.");
  }

  const toggle = (key: keyof Pick<Prefs, "personalisationEnabled" | "locationEnabled" | "remindersEnabled" | "householdSharingEnabled">) => save({ ...prefs, [key]: !prefs[key] });
  return <>
    <div className="settings-list">
      {[["Nia personalisation", "Use profile, journey and owned capabilities.", "personalisationEnabled"], ["Location-aware opportunities", "Use city context for local relevance.", "locationEnabled"], ["Journey reminders", "Receive useful non-overloading reminders.", "remindersEnabled"], ["Household sharing", "Share selected tasks while protecting private work.", "householdSharingEnabled"]].map(([title, text, key]) => <article key={String(key)}><div><strong>{title}</strong><span>{text}</span></div><button aria-pressed={Boolean(prefs[key as keyof Prefs])} className={prefs[key as keyof Prefs] ? "toggle on" : "toggle"} onClick={() => toggle(key as keyof Pick<Prefs, "personalisationEnabled" | "locationEnabled" | "remindersEnabled" | "householdSharingEnabled">)}><i /></button></article>)}
    </div>
    <section className="data-rights-card">
      <div><span>Commercial recommendation frequency</span><select value={prefs.commercialRecommendationMode} onChange={(event) => save({ ...prefs, commercialRecommendationMode: event.target.value as Prefs["commercialRecommendationMode"] })}><option value="minimal">Minimal</option><option value="contextual">Contextual</option><option value="off">Off</option></select></div>
      <div><button className="platform-secondary" onClick={() => dataRight("export")}>Request export</button><button className="platform-secondary" onClick={() => dataRight("rectify")}>Request correction</button><button className="danger-button" onClick={() => dataRight("delete")}>Request deletion</button></div>
      {requests.length > 0 && <div className="data-rights-history"><h3>Request history</h3>{requests.map((request) => <article key={request.id}><div><strong>{request.request_type.replaceAll("_", " ")}</strong><span>{request.state.replaceAll("_", " ")} · {new Date(request.requested_at).toLocaleDateString("en-GB")}</span></div>{request.request_type === "export" && request.state === "completed" && <button className="platform-secondary" onClick={() => downloadExport(request.id)}>Download securely</button>}</article>)}</div>}
    </section>
    {status && <p aria-live="polite">{status}</p>}
  </>;
}
