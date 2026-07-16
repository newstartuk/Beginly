import PlatformShell from "@/components/platform/PlatformShell";
import StatusPill from "@/components/platform/StatusPill";
import HouseholdInviteForm from "@/components/platform/HouseholdInviteForm";
import HouseholdMemberActions from "@/components/platform/HouseholdMemberActions";
import { loadCurrentPlatformContext } from "@/lib/platform/server-context";
import { LockKeyhole, ShieldCheck, Users } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function HouseholdPage() {
  const context = await loadCurrentPlatformContext();
  const actorMember = context.householdMembers.find((member) => member.isActor);
  const actorIsPrimary = actorMember?.role === "primary";
  return <PlatformShell title="Household workspace" eyebrow="Shared coordination · private adult work" action={<StatusPill tone="positive">{context.householdMembers.length} member{context.householdMembers.length === 1 ? "" : "s"}</StatusPill>}>
    <section className="household-hero"><Users size={28}/><div><h2>Coordinate the household without flattening everyone into one account.</h2><p>Shared actions coexist with private career documents, Nia conversations and payment details.</p></div></section>
    <div className="household-grid">{context.householdMembers.map((member) => <article key={member.id}><div className="member-avatar">{member.displayName.slice(0, 2).toUpperCase()}</div><div><StatusPill tone={member.role === "primary" ? "positive" : "neutral"}>{member.role.replaceAll("_", " ")}{member.isActor ? " · you" : ""}</StatusPill><h2>{member.displayName}</h2><p>{member.route?.replaceAll("_", " ") ?? "Age-appropriate household journey"}</p></div><div className="member-access">{member.privateWorkspace ? <><LockKeyhole size={16}/><span>Private workspace</span></> : <><ShieldCheck size={16}/><span>Age-appropriate shared access</span></>}</div>{actorIsPrimary && !member.isActor && member.ageBand === "adult" ? <HouseholdMemberActions memberId={member.id} role={member.role} privateWorkspace={member.privateWorkspace}/> : null}</article>)}</div>
    {actorIsPrimary ? <HouseholdInviteForm/> : <section className="admin-policy"><h2>Household governance</h2><p>The primary member manages invitations and role changes. You can still control your personal preferences and data-rights requests.</p></section>}
  </PlatformShell>;
}
