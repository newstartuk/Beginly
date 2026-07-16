import PlatformShell from "@/components/platform/PlatformShell";
import StatusPill from "@/components/platform/StatusPill";
import { EVIDENCE_RECORDS } from "@/lib/platform/evidence";
import { BadgeCheck, Code2, FlaskConical, LineChart, Palette, Scale } from "lucide-react";
const icons = { code: Code2, test: FlaskConical, visual: Palette, metric: LineChart, decision: Scale, pilot: BadgeCheck };
export const dynamic = "force-dynamic";
export default function EvidenceRoomPage() { return <PlatformShell title="Founder Evidence Room" eyebrow="Innovation · viability · scalability" action={<StatusPill tone="positive">{EVIDENCE_RECORDS.length} evidence records</StatusPill>}>
  <section className="evidence-hero"><div><h2>The evidence is produced by implementation, not written retrospectively.</h2><p>Requirements link to code, tests, visuals, metrics, decisions and pilots. Every wave adds reproducible proof for the Innovator Founder case and operational governance.</p></div><div className="evidence-score"><strong>83%</strong><span>current implementation evidence coverage</span></div></section>
  <div className="evidence-grid">{EVIDENCE_RECORDS.map((record) => { const Icon = icons[record.evidenceType]; return <article key={record.id}><span className="evidence-icon"><Icon size={20} /></span><div><div className="evidence-meta"><StatusPill tone={record.status === "verified" ? "positive" : "info"}>{record.status}</StatusPill><span>{record.dimension}</span></div><h2>{record.title}</h2><p>{record.reference}</p><small>{record.requirementId} · {record.evidenceType}</small></div></article>; })}</div>
</PlatformShell>; }
