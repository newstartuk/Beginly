import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isExplicitDemoMode } from "@/lib/platform/runtime";
import { tokenHash, verifyOpportunityAction } from "@/lib/platform/opportunity-browser";

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const payload = verifyOpportunityAction(token);
    if (!isExplicitDemoMode()) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) return new NextResponse("Beginly redirect service is not configured.", { status: 503 });
      const supabase = createClient(url, key, { auth: { persistSession: false } });
      const { data: session, error } = await supabase.from("opportunity_action_sessions").select("id,user_id,destination_hostname,session_state,expires_at,signed_token_hash").eq("id", payload.sessionId).eq("signed_token_hash", tokenHash(token)).maybeSingle();
      if (error || !session || session.user_id !== payload.userId || session.destination_hostname !== payload.hostname || new Date(session.expires_at).getTime() <= Date.now()) return new NextResponse("This opportunity session is invalid or expired.", { status: 410 });
      await Promise.all([
        supabase.from("opportunity_action_sessions").update({ session_state: "opened", opened_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", payload.sessionId),
        supabase.from("opportunity_redirect_events").insert({ action_session_id: payload.sessionId, event_type: "destination_opened", destination_hostname: payload.hostname, request_id: request.headers.get("x-request-id"), metadata: { user_agent: request.headers.get("user-agent")?.slice(0, 300) } }),
      ]);
    }
    return NextResponse.redirect(payload.destinationUrl, { status: 302, headers: { "referrer-policy": "no-referrer", "cache-control": "no-store" } });
  } catch { return new NextResponse("This opportunity link is invalid or expired.", { status: 410, headers: { "cache-control": "no-store" } }); }
}
