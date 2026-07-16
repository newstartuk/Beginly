import PlatformShell from "@/components/platform/PlatformShell";
import StatusPill from "@/components/platform/StatusPill";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isExplicitDemoMode } from "@/lib/platform/runtime";
import { requireAdminRole } from "@/lib/platform/admin-operations";
import { readPlatformEvents, platformObservabilityHealth } from "@/lib/platform/observability";
import type { ApiActor } from "@/lib/platform/api-auth";

export const dynamic = "force-dynamic";
async function actor():Promise<ApiActor>{const supabase=await createServerSupabaseClient();if(isExplicitDemoMode())return{userId:"demo-user",email:"demo@beginly.test",requestId:"observability-page",demo:true,supabase:supabase as never};const{data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login?redirect=/admin/observability");const value={userId:user.id,email:user.email,requestId:"observability-page",demo:false,supabase:supabase as never};await requireAdminRole(value,["support_admin"]);return value}
export default async function ObservabilityPage(){await actor();const[events,health]=await Promise.all([readPlatformEvents(100),platformObservabilityHealth()]);return <PlatformShell title="Observability and incidents" eyebrow="Privacy-safe operational evidence" action={<StatusPill tone={health.healthy?"positive":"warning"}>{health.mode}</StatusPill>}><section className="admin-policy"><h2>Evidence boundary</h2><p>Local structured events are privacy-redacted. A production alert provider remains an activation and live-verification gate.</p></section><div className="admin-operation-items">{events.length?events.slice().reverse().map(event=><article key={event.id}><div className="admin-item-copy"><div><StatusPill tone={event.level==="error"?"warning":"neutral"}>{event.level}</StatusPill><StatusPill tone="neutral">{event.category}</StatusPill></div><h3>{event.message}</h3><p>{event.requestId?`Request ${event.requestId}`:"No request identifier"}{event.durationMs?` · ${event.durationMs} ms`:""}</p><small>{new Date(event.timestamp).toLocaleString("en-GB")}</small></div></article>):<section className="admin-policy"><h2>No local events yet</h2><p>Events appear after platform operations run in this source tree.</p></section>}</div></PlatformShell>}
