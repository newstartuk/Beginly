import { NextRequest, NextResponse } from "next/server";
import { Webhook, WebhookVerificationError } from "standardwebhooks";
import { sendPasswordResetEmail, sendSignupConfirmationEmail, sendAuthActionEmail } from "@/lib/email";

type SendEmailHookPayload = {
  user: {
    email: string;
    user_metadata?: { name?: string };
  };
  email_data: {
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
  };
};

function hookError(status: number, message: string) {
  console.error(`[send-email-hook] ${status}: ${message}`);
  return NextResponse.json({ error: { http_code: status, message } }, { status });
}

/**
 * Receives Supabase's Auth "Send Email" hook, which fires in place of Supabase's own
 * mailer for every auth email (signup, magic link, invite, email change, recovery)
 * once the hook is enabled in the dashboard. We take over sending recovery and signup
 * confirmation emails ourselves via Resend (dedicated templates), and fall back to a
 * generic branded email for the rest (magic link, invite, email change, reauthentication)
 * so enabling the hook doesn't silently stop those from being delivered.
 *
 * Configure in Supabase Dashboard → Authentication → Hooks → Send Email hook,
 * pointing at this route, with SEND_EMAIL_HOOK_SECRET set to the secret it gives you.
 * Supabase only ever shows the caller a generic "Error sending recovery email" —
 * check this route's server logs (not the browser console) for the real cause.
 */
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.SEND_EMAIL_HOOK_SECRET;
    if (!secret) return hookError(503, "SEND_EMAIL_HOOK_SECRET is not set.");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return hookError(503, "NEXT_PUBLIC_SUPABASE_URL is not set.");

    const raw = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    let payload: SendEmailHookPayload;
    try {
      payload = new Webhook(secret).verify(raw, headers) as SendEmailHookPayload;
    } catch (err) {
      if (err instanceof WebhookVerificationError) return hookError(401, `Invalid webhook signature: ${err.message}`);
      return hookError(400, `Malformed webhook payload: ${err instanceof Error ? err.message : String(err)}`);
    }

    const { user, email_data: emailData } = payload;
    if (!user?.email || !emailData?.token_hash || !emailData?.email_action_type) {
      return hookError(400, "Missing required fields in webhook payload.");
    }

    // Allowlist of trusted redirect origins — derived from NEXT_PUBLIC_SITE_URL
    // (the same env var used everywhere else) rather than a second hardcoded
    // "https://beginly.app" that could silently drift out of sync with it.
    const allowedRedirectOrigins = new Set([
      new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://beginly.app").origin,
      "http://localhost:3456",
    ]);

    // Empty on anything untrusted/malformed — Supabase falls back to its own
    // configured Site URL when redirect_to is blank, which is the correct
    // fail-safe behavior for an open-redirect guard (never redirect somewhere
    // unvetted; worst case is landing on the app's own default page instead).
    let safeRedirectTo = "";
    if (emailData.redirect_to) {
      try {
        const redirectUrl = new URL(emailData.redirect_to, supabaseUrl);
        if (allowedRedirectOrigins.has(redirectUrl.origin)) {
          safeRedirectTo = redirectUrl.toString();
        } else {
          console.warn(`[send-email-hook] Blocked untrusted redirect_to: ${emailData.redirect_to}`);
        }
      } catch {
        console.warn(`[send-email-hook] Malformed redirect_to: ${emailData.redirect_to}`);
      }
    }

    const actionUrlObj = new URL(`${supabaseUrl}/auth/v1/verify`);
    actionUrlObj.search = new URLSearchParams({
      token: emailData.token_hash,
      type: emailData.email_action_type,
      redirect_to: safeRedirectTo,
    }).toString();
    const actionUrl = actionUrlObj.toString();
    const name = user.user_metadata?.name;

    const { error } =
      emailData.email_action_type === "recovery"
        ? await sendPasswordResetEmail({ email: user.email, name, resetUrl: actionUrl })
        : emailData.email_action_type === "signup"
          ? await sendSignupConfirmationEmail({ email: user.email, name, confirmUrl: actionUrl })
          : await sendAuthActionEmail({ email: user.email, name, actionUrl, actionType: emailData.email_action_type });

    if (error) return hookError(500, `Email delivery failed: ${error.message}`);
    return NextResponse.json({});
  } catch (err) {
    return hookError(500, `Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
  }
}
