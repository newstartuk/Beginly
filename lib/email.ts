import { Resend } from "resend";

// Lazy-initialize so the client is only created at runtime (when env vars are available),
// not at module load time during Next.js build.
function getResendClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set. Set it in .env.local or Vercel environment variables.");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = "Beginly <noreply@beginly.app>";

/**
 * Sends a welcome email to a newly registered user.
 * Call this after email confirmation — e.g. via a Supabase webhook on
 * `user.confirmed_at` change, or after first login with a confirmed email.
 */
export async function sendWelcomeEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to Beginly — your UK journey starts here 🇬🇧",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Beginly</title>
</head>
<body style="margin:0;padding:0;background:#F0FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0B7285,#2563EB);padding:32px 40px;">
      <div style="display:inline-block;background:#ffffff;border-radius:10px;width:40px;height:40px;text-align:center;line-height:40px;font-weight:700;color:#0B7285;font-size:18px;">B</div>
      <h1 style="margin:16px 0 0;color:#ffffff;font-size:24px;font-weight:800;">Welcome to Beginly${name ? `, ${name}` : ""}</h1>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <p style="font-size:16px;color:#1a2740;margin:0 0 20px;line-height:1.6;">
        Your account is confirmed and ready to go. 🎉
      </p>
      <p style="font-size:15px;color:#4b5563;margin:0 0 24px;line-height:1.6;">
        Beginly is your free UK settlement guide — built to help you navigate your first 90 days with confidence. Tell us about your arrival and we&apos;ll build a personalised checklist just for you.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin:32px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://beginly.app"}/onboarding"
           style="display:inline-block;background:#0B7285;color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;box-shadow:0 4px 16px rgba(11,114,133,0.35);">
          Build your roadmap →
        </a>
      </div>

      <p style="font-size:14px;color:#4b5563;margin:0 0 20px;line-height:1.6;">
        It takes about 2 minutes. We&apos;ll ask about your city, university, accommodation, and arrival date — then generate your full 90-day checklist.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;" />

      <p style="font-size:13px;color:#9ca3af;line-height:1.6;">
        <strong style="color:#4b5563;">Important:</strong> Beginly provides general settlement guidance only — not legal, immigration, financial, or medical advice. Always check your personal circumstances against official UK government guidance or speak to a qualified professional.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        © 2026 Beginly · <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://beginly.app"}/privacy-policy" style="color:#0B7285;text-decoration:none;">Privacy Policy</a> · <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://beginly.app"}/terms-of-service" style="color:#0B7285;text-decoration:none;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
  });

  if (error) {
    console.error("[Beginly] Welcome email send failed:", error.message);
  }

  return { error };
}

/**
 * Sends a task reminder email.
 * Call this from a cron job or Supabase scheduled function.
 */
export async function sendTaskReminderEmail({
  email,
  name,
  taskCount,
  incompleteTasks,
}: {
  email: string;
  name: string;
  taskCount: number;
  incompleteTasks: string[];
}) {
  const resend = getResendClient();
  const taskList = incompleteTasks
    .slice(0, 5)
    .map((t) => `<li style="margin-bottom:6px;">${t}</li>`)
    .join("");

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your Beginly weekly check-in — let's keep going 🇬🇧",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Beginly Weekly Check-In</title>
</head>
<body style="margin:0;padding:0;background:#F0FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#0B7285,#2563EB);padding:32px 40px;">
      <div style="display:inline-block;background:#ffffff;border-radius:10px;width:40px;height:40px;text-align:center;line-height:40px;font-weight:700;color:#0B7285;font-size:18px;">B</div>
      <h1 style="margin:16px 0 0;color:#ffffff;font-size:22px;font-weight:800;">Your Beginly weekly check-in${name ? `, ${name}` : ""}</h1>
    </div>

    <div style="padding:40px;">
      <p style="font-size:16px;color:#1a2740;margin:0 0 20px;line-height:1.6;">
        You have <strong style="color:#0B7285;">${taskCount} task${taskCount === 1 ? "" : "s"}</strong> on your roadmap. Here are a few to look at this week:
      </p>

      <ul style="background:#f9fafb;border-radius:10px;padding:16px 20px 16px 36px;margin:0 0 24px;color:#374151;font-size:14px;line-height:1.8;">
        ${taskList}
        ${incompleteTasks.length > 5 ? `<li style="margin-bottom:6px;color:#9ca3af;">...and ${incompleteTasks.length - 5} more</li>` : ""}
      </ul>

      <div style="text-align:center;margin:28px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://beginly.app"}/dashboard"
           style="display:inline-block;background:#0B7285;color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;">
          View your roadmap →
        </a>
      </div>

      <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0;">
        To update your email preferences, visit your <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://beginly.app"}/settings" style="color:#0B7285;text-decoration:none;">account settings</a>.
      </p>
    </div>

    <div style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        © 2026 Beginly · You&apos;re receiving this because you enabled weekly email reminders.
      </p>
    </div>
  </div>
</body>
</html>
    `,
  });

  if (error) {
    console.error("[Beginly] Task reminder email send failed:", error.message);
  }

  return { error };
}
