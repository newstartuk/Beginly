import { Resend } from "resend";

// --- Shared Email Layout Helpers ---

const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://beginly.app";
const LOGO_SRC = `${DEFAULT_SITE_URL}/beginly-mark.png`;

function emailHeader() {
  return `
    <tr>
      <td style="padding:28px 40px 24px;text-align:center;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
          <tr>
            <td style="vertical-align:middle;">
              <img src="${LOGO_SRC}" alt="Beginly" width="42" height="42" style="display:block;width:42px;height:42px;border:0;" />
            </td>
            <td style="padding-left:12px;text-align:left;">
              <div style="color:#0D223D;font-family:Georgia,'Times New Roman',serif;font-size:23px;line-height:1;">
                Beginly
              </div>
              <div style="color:#FF6B57;font-size:9px;margin-top:4px;letter-spacing:0.2px;">
                Open what comes next.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

function emailDivider() {
  return `
    <tr>
      <td style="padding:0 40px;">
        <div style="height:1px;background:#DCE9EA;width:100%;"></div>
      </td>
    </tr>
  `;
}

function emailFooter({ siteUrl = DEFAULT_SITE_URL }: { siteUrl?: string } = {}) {
  return `
    <tr>
      <td style="background:#F8FBFB;border-top:1px solid #DCE9EA;padding:18px 40px;">
        <p style="margin:0 0 10px;color:#94A3B8;font-size:11px;text-align:center;line-height:1.6;">
          You received this email because an authentication action was requested for your Beginly account.
        </p>
        <p style="margin:0;color:#94A3B8;font-size:11px;text-align:center;line-height:1.6;">
          © 2026 Beginly
          &nbsp;·&nbsp;
          <a href="${siteUrl}/privacy-policy" style="color:#64748B;text-decoration:none;">Privacy</a>
          &nbsp;·&nbsp;
          <a href="${siteUrl}/terms-of-service" style="color:#64748B;text-decoration:none;">Terms</a>
        </p>
      </td>
    </tr>
  `;
}

function brandStripe() {
  return `
    <tr>
      <td>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td width="33%" bgcolor="#18B7B5" style="height:4px;"></td>
            <td width="34%" bgcolor="#FF6B57" style="height:4px;"></td>
            <td width="33%" bgcolor="#F2B544" style="height:4px;"></td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

function ctaButton({ url, text }: { url: string; text: string }) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 32px auto;">
      <tr>
        <td align="center" bgcolor="#FF6B57" style="border-radius:10px;">
          <a href="${escapeHtml(url)}"
            style="display:inline-block;padding:14px 28px;color:#FFFFFF;font-size:15px;font-weight:700;line-height:20px;text-decoration:none;border-radius:10px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function securityBox({ children }: { children: string }) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
      style="background:#F8EEDF;border-radius:12px;margin:0 0 8px;">
      <tr>
        <td style="padding:18px 20px;">
          ${children}
        </td>
      </tr>
    </table>
  `;
}

/**
 * Escapes HTML special characters in a string to prevent injection.
 */
function escapeHtml(str: string = ""): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Lazy-initialize so the client is only created at runtime (when env vars are available),
// not at module load time during Next.js build.
function getResendClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not set. Set it in .env.local or Vercel environment variables.",
    );
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = `Beginly <${process.env.FROM_EMAIL}>`;

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
    subject: "Welcome to Beginly — your adaptive UK path is ready",
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
      <h1 style="margin:16px 0 0;color:#ffffff;font-size:24px;font-weight:800;">Welcome to Beginly${name ? `, ${escapeHtml(name)}` : ""}</h1>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <p style="font-size:16px;color:#1a2740;margin:0 0 20px;line-height:1.6;">
        Your account is confirmed and ready to go. 🎉
      </p>
      <p style="font-size:15px;color:#4b5563;margin:0 0 24px;line-height:1.6;">
        Beginly is your adaptive UK transition and opportunity companion. It connects the actions that matter now with future settlement, study, career, family and progression horizons.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin:32px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://beginly.app"}/onboarding"
           style="display:inline-block;background:#0B7285;color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;box-shadow:0 4px 16px rgba(11,114,133,0.35);">
          Build your living path →
        </a>
      </div>

      <p style="font-size:14px;color:#4b5563;margin:0 0 20px;line-height:1.6;">
        Start with your current route, city and goal. You can add household context progressively, and your journey will continue evolving rather than reset at each transition.
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
 * Sends the "reset your password" email, with the secure link to complete the reset.
 * Called from the Supabase Send Email Hook (app/api/auth/send-email-hook/route.ts) in
 * place of Supabase's built-in recovery email — resetUrl is built from the hook payload.
 */
export async function sendPasswordResetEmail({
  name,
  email,
  resetUrl,
}: {
  name?: string;
  email: string;
  resetUrl: string;
}) {
  const resend = getResendClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://beginly.app";

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your Beginly password",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset your Beginly password</title>
      </head>
      <body style="margin:0;padding:0;background:#EAF8F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0D223D;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#EAF8F7;">
          <tr>
            <td align="center" style="padding:48px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#FFFFFF;border:1px solid #DCE9EA;border-radius:18px;overflow:hidden;">
                ${emailHeader()}
                ${emailDivider()}
                <tr>
                  <td style="padding:40px 40px 20px;">
                    <h1 style="margin:0 0 14px;color:#0D223D;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.18;font-weight:700;text-align:left;">
                      Reset your password
                    </h1>
                    <p style="margin:0 0 16px;color:#0D223D;font-size:16px;line-height:1.7;">
                      ${name ? `Hi ${escapeHtml(name)},` : "Hi there,"}
                    </p>
                    <p style="margin:0 0 28px;color:#64748B;font-size:15px;line-height:1.7;">
                      We received a request to reset the password for your Beginly account associated with
                      <strong style="color:#0D223D;">${escapeHtml(email)}</strong>.
                    </p>
                    <p style="margin:0 0 28px;color:#64748B;font-size:15px;line-height:1.7;">
                      Use the button below to choose a new password and get back to your roadmap.
                    </p>
                    ${ctaButton({ url: resetUrl, text: "Reset my password →" })}
                    <p style="margin:0 0 18px;color:#64748B;font-size:13px;line-height:1.6;text-align:center;">
                      This password reset link will expire in 24 hours.
                      If it expires, you can
                      <a href="${escapeHtml(siteUrl)}/forgot-password" style="color:#18A7A5;text-decoration:none;font-weight:600;">
                        click here to request a new password reset link.
                      </a>
                    </p>
                    ${securityBox({
                      children: `
                        <p style="margin:0;color:#64748B;font-size:13px;line-height:1.65;">
                          <strong style="color:#0D223D;">Didn't request this?</strong>
                          You can safely ignore this email. Your password won't change unless you use the reset link above.
                        </p>
                      `,
                    })}
                  </td>
                </tr>
                ${emailFooter({ siteUrl })}
                ${brandStripe()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `
      Reset your Beginly password

      ${name ? `Hi ${name},` : "Hi there,"}

      We received a request to reset the password for your Beginly account associated with ${email}.

      Use the link below to choose a new password:

      ${resetUrl}

      If you didn't request this password reset, you can safely ignore this email. Your password will not change unless you use the reset link.

      Beginly
      Open what comes next.

      Privacy: ${siteUrl}/privacy-policy
      Terms: ${siteUrl}/terms-of-service`.trim(),
  });

  if (error) {
    console.error("[Beginly] Password reset email send failed:", error.message);
  }

  return { error };
}

/**
 * Sends a security notice confirming a password change just happened.
 * Called directly from app/api/auth/password-changed/route.ts right after
 * supabase.auth.updateUser({ password }) succeeds on /reset-password.
 */
export async function sendPasswordChangedEmail({
  name,
  email,
}: {
  name?: string;
  email: string;
}) {
  const resend = getResendClient();

  const siteUrl = DEFAULT_SITE_URL;

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your Beginly password was changed",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your Beginly password was changed</title>
      </head>
      <body style="margin:0;padding:0;background:#EAF8F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0D223D;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#EAF8F7;">
          <tr>
            <td align="center" style="padding:48px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#FFFFFF;border:1px solid #DCE9EA;border-radius:18px;overflow:hidden;">
                ${emailHeader()}
                ${emailDivider()}
                <tr>
                  <td style="padding:40px;">
                    <h1 style="margin:0 0 24px;color:#0D223D;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.18;font-weight:700;text-align:center;">
                      Your password was changed
                    </h1>
                    <div style="text-align:left;">
                      <p style="margin:0 0 18px;color:#0D223D;font-size:16px;line-height:1.7;">
                        ${name ? `Hi ${escapeHtml(name)},` : "Hi there,"}
                      </p>
                      <p style="margin:0 0 20px;color:#64748B;font-size:15px;line-height:1.7;">
                        This is a confirmation that the password for your Beginly account associated with
                        <strong style="color:#0D223D;">${escapeHtml(email)}</strong>
                        was successfully changed.
                      </p>
                      <p style="margin:0 0 30px;color:#64748B;font-size:15px;line-height:1.7;">
                        If you made this change, no further action is needed.
                      </p>
                    </div>
                    ${ctaButton({ url: `${siteUrl}/login`, text: "Sign in to Beginly →" })}
                    ${securityBox({
                      children: `
                        <p style="margin:0 0 8px;color:#0D223D;font-size:13px;line-height:1.65;font-weight:700;">
                          Wasn't you?
                        </p>
                        <p style="margin:0;color:#64748B;font-size:13px;line-height:1.65;">
                          Someone else may have access to your account. Reset your password immediately using the link below.
                        </p>
                        <p style="margin:10px 0 0;font-size:13px;line-height:1.65;">
                          <a href="${siteUrl}/forgot-password" style="color:#18A7A5;text-decoration:none;font-weight:700;">
                            Secure my account →
                          </a>
                        </p>
                      `,
                    })}
                  </td>
                </tr>
                ${emailFooter({ siteUrl })}
                ${brandStripe()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,

    text: `
      Your Beginly password was changed

      ${name ? `Hi ${name},` : "Hi there,"}

      This is a confirmation that the password for your Beginly account associated with ${email} was successfully changed.

      If you made this change, no further action is needed.

      Sign in:
      ${siteUrl}/login

      Wasn't you?

      Someone else may have access to your account. Reset your password immediately:

      ${siteUrl}/forgot-password

      Beginly
      Open what comes next.

      Privacy: ${siteUrl}/privacy-policy
      Terms: ${siteUrl}/terms-of-service
    `.trim(),
  });

  if (error) {
    console.error(
      "[Beginly] Password changed email send failed:",
      error.message,
    );
  }

  return { error };
}

const AUTH_ACTION_COPY: Record<
  string,
  { subject: string; heading: string; intro: string; cta: string }
> = {
  signup: {
    subject: "Confirm your Beginly account",
    heading: "Confirm your account",
    intro:
      "Thanks for creating a Beginly account. Confirm your email address to activate it.",
    cta: "Confirm email address →",
  },
  magiclink: {
    subject: "Your Beginly sign-in link",
    heading: "Sign in to Beginly",
    intro: "Use the link below to sign in to your Beginly account.",
    cta: "Sign in →",
  },
  invite: {
    subject: "You've been invited to Beginly",
    heading: "You're invited",
    intro:
      "You've been invited to join Beginly. Accept the invite to set up your account.",
    cta: "Accept invite →",
  },
  email_change: {
    subject: "Confirm your new Beginly email",
    heading: "Confirm email change",
    intro:
      "Confirm this email address to complete the change on your Beginly account.",
    cta: "Confirm email change →",
  },
  reauthentication: {
    subject: "Confirm it's you",
    heading: "Confirm it's you",
    intro:
      "Use the link below to confirm this sensitive action on your Beginly account.",
    cta: "Confirm →",
  },
};

/**
 * Generic fallback for any Supabase auth email type that doesn't have a dedicated
 * template (everything except "recovery", which uses sendPasswordResetEmail).
 * Exists so enabling the Send Email Hook doesn't silently stop signup/magic-link/
 * invite/email-change emails from going out — see app/api/auth/send-email-hook/route.ts.
 */
export async function sendAuthActionEmail({
  name,
  email,
  actionUrl,
  actionType,
}: {
  name?: string;
  email: string;
  actionUrl: string;
  actionType: string;
}) {
  const copy = AUTH_ACTION_COPY[actionType] ?? {
    subject: "Confirm your Beginly request",
    heading: "Confirm your request",
    intro: "Use the link below to continue.",
    cta: "Continue →",
  };

  const resend = getResendClient();

  const siteUrl = DEFAULT_SITE_URL;

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: copy.subject,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${copy.subject}</title>
      </head>
      <body style="margin:0;padding:0;background:#EAF8F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0D223D;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#EAF8F7;">
          <tr>
            <td align="center" style="padding:48px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#FFFFFF;border:1px solid #DCE9EA;border-radius:18px;overflow:hidden;">
                ${emailHeader()}
                ${emailDivider()}
                <tr>
                  <td style="padding:40px;">
                    <h1 style="margin:0 0 24px;color:#0D223D;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.18;font-weight:700;text-align:center;">
                      ${copy.heading}
                    </h1>
                    <div style="text-align:left;">
                      <p style="margin:0 0 18px;color:#0D223D;font-size:16px;line-height:1.7;">
                        ${name ? `Hi ${escapeHtml(name)},` : "Hi there,"}
                      </p>
                      <p style="margin:0 0 28px;color:#64748B;font-size:15px;line-height:1.7;">
                        ${copy.intro}
                      </p>
                      <p style="margin:0 0 28px;color:#64748B;font-size:15px;line-height:1.7;">
                        This request is for the Beginly account associated with
                        <strong style="color:#0D223D;">${escapeHtml(email)}</strong>.
                      </p>
                    </div>
                    ${ctaButton({ url: actionUrl, text: copy.cta })}
                    ${securityBox({
                      children: `
                        <p style="margin:0;color:#64748B;font-size:13px;line-height:1.65;">
                          <strong style="color:#0D223D;">Didn't request this?</strong>
                          You can safely ignore this email. No action will be taken unless you use the link above.
                        </p>
                      `,
                    })}
                    <p style="margin:0 0 8px;color:#94A3B8;font-size:12px;line-height:1.6;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="margin:0;color:#18A7A5;font-size:12px;line-height:1.6;word-break:break-all;">
                      <a href="${escapeHtml(actionUrl)}" style="color:#18A7A5;text-decoration:none;">
                        ${escapeHtml(actionUrl)}
                      </a>
                    </p>
                  </td>
                </tr>
                ${emailFooter({ siteUrl })}
                ${brandStripe()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,

    text: `
      ${copy.heading}

      ${name ? `Hi ${name},` : "Hi there,"}

      ${copy.intro}

      This request is for the Beginly account associated with ${email}.

      ${copy.cta.replace(/→/g, "").trim()}:
      ${actionUrl}

      If you didn't request this, you can safely ignore this email. No action will be taken unless you use the link above.

      Beginly
      Open what comes next.

      Privacy: ${siteUrl}/privacy-policy
      Terms: ${siteUrl}/terms-of-service
    `.trim(),
  });

  if (error) {
    console.error(
      `[Beginly] Auth action email (${actionType}) send failed:`,
      error.message,
    );
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
      <h1 style="margin:16px 0 0;color:#ffffff;font-size:22px;font-weight:800;">Your Beginly weekly check-in${name ? `, ${escapeHtml(name)}` : ""}</h1>
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
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://beginly.app"}/platform"
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
