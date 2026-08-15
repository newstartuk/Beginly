import { NextRequest, NextResponse } from "next/server";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";
import { sendPasswordChangedEmail } from "@/lib/email";

/**
 * Sends the "your password was changed" security notice. Called from
 * app/reset-password/page.tsx right after supabase.auth.updateUser({ password })
 * succeeds, using the still-live recovery session's access token — there's no
 * Supabase auth email type for "password changed", so this can't go through the
 * Send Email Hook (see app/api/auth/send-email-hook/route.ts) and is triggered directly.
 */
export async function POST(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request);
    requestId = actor.requestId;
    if (actor.demo || !actor.email) return NextResponse.json({ acknowledged: true }, { headers: { "x-request-id": requestId } });

    const { data: { user } } = await actor.supabase.auth.getUser();
    const { error } = await sendPasswordChangedEmail({ email: actor.email, name: user?.user_metadata?.name });
    if (error) return NextResponse.json({ error: { code: "email_delivery_failed", message: "Email delivery failed.", requestId } }, { status: 502, headers: { "x-request-id": requestId } });

    return NextResponse.json({ success: true }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    return apiFailure(error, requestId);
  }
}
