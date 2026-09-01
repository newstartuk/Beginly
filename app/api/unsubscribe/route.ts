import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

/**
 * One-click unsubscribe target for task reminder emails — a plain GET link (clicked
 * from an email client, no session), verified via a signed token instead of auth.
 * See lib/unsubscribe.ts and app/api/cron/task-reminders/route.ts.
 */
export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://beginly.app";
  const userId = request.nextUrl.searchParams.get("u") ?? undefined;
  const token = request.nextUrl.searchParams.get("t") ?? undefined;

  if (!userId || !verifyUnsubscribeToken(userId, token)) {
    return NextResponse.redirect(`${siteUrl}/unsubscribed?error=invalid_link`);
  }

  const db = createAdminSupabaseClient();
  const { error } = await db.from("reminder_prefs").update({ email_reminders: false }).eq("user_id", userId);
  if (error) {
    console.error("[unsubscribe] Failed to update reminder_prefs:", error.message);
    return NextResponse.redirect(`${siteUrl}/unsubscribed?error=update_failed`);
  }

  return NextResponse.redirect(`${siteUrl}/unsubscribed`);
}
