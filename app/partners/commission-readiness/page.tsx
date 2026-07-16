import PlatformShell from "@/components/platform/PlatformShell";
import CommissionReadinessTool from "@/components/platform/CommissionReadinessTool";
import StatusPill from "@/components/platform/StatusPill";
import { Activity, BadgePoundSterling, Code2, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export default function CommissionReadinessPage() { return <PlatformShell title="Commission Readiness Studio" eyebrow="Internal engine · external B2B product" action={<StatusPill tone="info">Partner sandbox</StatusPill>}>
  <section className="commission-hero"><div><span className="platform-eyebrow"><Code2 size={15} /> Programmatic partner enablement</span><h2>Turn a suitable provider into a trackable, disclosure-ready and reconcilable partner programme.</h2><p>Beginly first uses this system to enable its own opportunity suppliers, then offers the same infrastructure as a standalone B2B service.</p></div><div className="commission-capabilities"><span><Activity size={18} /> signed conversions</span><span><BadgePoundSterling size={18} /> commission ledger</span><span><ShieldCheck size={18} /> trust and disclosure</span></div></section><CommissionReadinessTool />
</PlatformShell>; }
