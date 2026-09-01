import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { secureEqual } from "@/lib/security";

type AuthRecord = { email?: string; confirmed_at?: string | null; user_metadata?: { name?: string } };
type Payload = { type?: string; record?: AuthRecord; old_record?: AuthRecord };

export async function POST(request: NextRequest) {
  const secret = process.env.BEGINLY_WEBHOOK_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret) {
    console.error("[webhooks/resend] BEGINLY_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook delivery is not configured" }, { status: 503 });
  }
  if (!secureEqual(supplied, secret)) {
    console.error("[webhooks/resend] Bearer token did not match BEGINLY_WEBHOOK_SECRET.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.text();
  let payload: Payload;
  try { payload = JSON.parse(raw) as Payload; }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Supabase's native Database Webhooks don't send a per-delivery event-id header,
  // so a content hash of the payload is used as the idempotency key instead — a real
  // confirmation event (distinct user id + confirmed_at timestamp) is naturally unique.
  const fingerprint = createHash("sha256").update(raw).digest("hex");

  const { type, record, old_record: oldRecord } = payload;
  const transitionedToConfirmed = type === "UPDATE" && !oldRecord?.confirmed_at && Boolean(record?.confirmed_at);
  const insertedConfirmed = type === "INSERT" && Boolean(record?.confirmed_at);
  if (!transitionedToConfirmed && !insertedConfirmed) return NextResponse.json({ acknowledged: true, ignored: "not_confirmation_transition" });
  if (!record?.email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("[webhooks/resend] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.");
    return NextResponse.json({ error: "Delivery ledger is not configured" }, { status: 503 });
  }
  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  // signature_verified is deliberately false: this route authenticates via a shared
  // bearer secret (secureEqual above), not a cryptographic signature over the payload
  // itself (unlike app/api/auth/send-email-hook/route.ts, which uses standardwebhooks'
  // Webhook.verify()). Recording true here would misrepresent what was actually checked.
  const { error: ledgerError } = await db.from("webhook_events").insert({ provider: "supabase_auth", external_event_id: fingerprint, payload_hash: fingerprint, signature_verified: false, state: "received" });
  if (ledgerError) {
    if (ledgerError.code === "23505") return NextResponse.json({ success: true, duplicate: true });
    console.error("[webhooks/resend] Ledger insert failed:", ledgerError.message);
    return NextResponse.json({ error: "Unable to record webhook" }, { status: 503 });
  }

  const name = record.user_metadata?.name?.trim() || record.email.split("@")[0];
  const result = await sendWelcomeEmail({ name, email: record.email });
  await db.from("webhook_events").update({ state: result.error ? "failed" : "processed", processed_at: new Date().toISOString() }).eq("provider", "supabase_auth").eq("external_event_id", fingerprint);
  if (result.error) {
    console.error("[webhooks/resend] sendWelcomeEmail failed:", result.error.message);
    return NextResponse.json({ error: "Email delivery failed" }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
