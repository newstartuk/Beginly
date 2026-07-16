import { NextRequest, NextResponse } from "next/server";
import { requireApiActor, apiFailure, ApiAuthError } from "@/lib/platform/api-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request);
    requestId = actor.requestId;
    if (actor.demo) throw new ApiAuthError(409, "demo_export_unavailable", "Data exports are unavailable in demo mode.");
    const { id } = await params;
    const { data, error } = await actor.supabase.from("data_rights_exports").select("storage_bucket,storage_path,expires_at,content_hash").eq("request_id", id).eq("user_id", actor.userId).maybeSingle();
    if (error || !data) throw new ApiAuthError(404, "export_not_ready", "The export is not ready or has expired.");
    if (new Date(data.expires_at).getTime() <= Date.now()) throw new ApiAuthError(410, "export_expired", "This export has expired. Submit a new request.");
    const admin = createAdminSupabaseClient();
    const { data: signed, error: signError } = await admin.storage.from(data.storage_bucket).createSignedUrl(data.storage_path, 300, { download: `beginly-data-export-${id}.json` });
    if (signError || !signed?.signedUrl) throw new ApiAuthError(503, "export_link_failed", "A secure export link could not be created.");
    await admin.from("data_rights_exports").update({ downloaded_at: new Date().toISOString() }).eq("request_id", id);
    return NextResponse.json({ url: signed.signedUrl, expiresInSeconds: 300, contentHash: data.content_hash }, { headers: { "cache-control": "no-store", "x-request-id": requestId } });
  } catch (error) {
    return apiFailure(error, requestId);
  }
}
