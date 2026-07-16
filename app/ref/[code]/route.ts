import { createHmac, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const codePattern = /^[A-Z2-9]{8,20}$/;
export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const signup = new URL("/signup", request.url);
  if (!codePattern.test(code)) return NextResponse.redirect(signup);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const secret = process.env.BEGINLY_REFERRAL_SIGNING_SECRET?.trim();
  if (!url || !serviceKey || !secret) return NextResponse.redirect(signup);

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: identity } = await supabase.from("user_referral_identities").select("id").eq("code", code).eq("state", "active").maybeSingle();
  if (!identity) return NextResponse.redirect(signup);
  const subject = request.cookies.get("beginly_referral_subject")?.value ?? randomUUID();
  const subjectHash = createHmac("sha256", secret).update(subject).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 86_400_000).toISOString();
  const existing = await supabase.from("user_referral_touches").select("id,state").eq("referral_identity_id", identity.id).eq("subject_hash", subjectHash).maybeSingle();
  let touch = existing.data;
  if (touch) {
    await supabase.from("user_referral_touches").update({ touched_at: new Date().toISOString(), expires_at: expiresAt, metadata: { source: "shared_link", revisited: true } }).eq("id", touch.id);
  } else {
    const created = await supabase.from("user_referral_touches").insert({ referral_identity_id: identity.id, subject_hash: subjectHash, state: "touched", expires_at: expiresAt, metadata: { source: "shared_link" } }).select("id,state").maybeSingle();
    touch = created.data;
  }
  const response = NextResponse.redirect(signup);
  response.cookies.set("beginly_referral_subject", subject, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 30 * 86_400, path: "/" });
  if (touch?.id) {
    const signature = createHmac("sha256", secret).update(touch.id).digest("base64url");
    response.cookies.set("beginly_referral_touch", `${touch.id}.${signature}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 30 * 86_400, path: "/" });
  }
  return response;
}
