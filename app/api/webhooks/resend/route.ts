import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * Supabase Auth Webhook — sends a Beginly welcome email after account confirmation.
 *
 * Set this up in your Supabase dashboard:
 *   1. Go to: Database → Webhooks → Create webhook
 *   2. Table: auth.users
 *   3. Events: UPDATE (or INSERT)
 *   4. URL: https://beginly.app/api/webhooks/resend
 *   5. HTTP Headers → add: Authorization: Bearer <your_resend_api_key>
 *
 * Or use the Supabase Edge Function approach documented at:
 *   https://supabase.com/docs/guides/auth/auth-webhooks
 *
 * IMPORTANT: The RESEND_API_KEY must be set in Vercel environment variables
 * for this route to work in production.
 */

export async function POST(request: NextRequest) {
  // Simple bearer-token check to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.RESEND_API_KEY;

  if (!expectedToken) {
    // Gracefully reject during build (no env var) without crashing the build
    return NextResponse.json({ error: "Resend not configured" }, { status: 503 });
  }
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, record } = body as { type: string; record?: { email?: string; user_metadata?: { name?: string }; confirmed_at?: string } };

  // Respond to confirmation emails (or INSERT events for new users)
  if (type === "INSERT" || type === "UPDATE") {
    if (!record?.email) {
      return NextResponse.json({ error: "Missing email in record" }, { status: 400 });
    }

    const name = typeof record.user_metadata?.name === "string"
      ? record.user_metadata.name.trim()
      : record.email.split("@")[0];

    await sendWelcomeEmail({ name, email: record.email });

    return NextResponse.json({ success: true }, { status: 200 });
  }

  // Acknowledge other event types without error
  return NextResponse.json({ acknowledged: true }, { status: 200 });
}
