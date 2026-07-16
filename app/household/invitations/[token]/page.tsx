import PlatformShell from "@/components/platform/PlatformShell";
import InvitationDecision from "./InvitationDecision";
export const dynamic = "force-dynamic";
export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; return <PlatformShell title="Household invitation" eyebrow="Explicit consent · private adult workspace"><InvitationDecision token={token}/></PlatformShell>; }
