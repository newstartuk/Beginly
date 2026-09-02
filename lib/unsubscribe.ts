import { createHmac, timingSafeEqual } from "node:crypto";
import "server-only";

/**
 * Signs a one-click unsubscribe link for a user, verifiable without a login session
 * (the link is clicked from inside an email client). Currently only used for task
 * reminder emails — see app/api/cron/task-reminders/route.ts and app/api/unsubscribe/route.ts.
 */
export function signUnsubscribeToken(userId: string): string | undefined {
  const secret = process.env.TASK_REMINDER_UNSUBSCRIBE_SECRET?.trim();
  if (!secret) return undefined;
  return createHmac("sha256", secret).update(userId).digest("base64url");
}

export function verifyUnsubscribeToken(userId: string | undefined, token: string | undefined): boolean {
  const secret = process.env.TASK_REMINDER_UNSUBSCRIBE_SECRET?.trim();
  if (!secret || !userId || !token) return false;
  const expected = createHmac("sha256", secret).update(userId).digest("base64url");
  const actualBytes = Buffer.from(token);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}
