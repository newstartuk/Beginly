import Link from "next/link";
import type { Metadata } from "next";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Privacy Policy — Beginly",
  description:
    "How Beginly collects, uses, and protects your personal data. Your privacy matters to us.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "23 June 2026";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} className="rounded-lg" />
            <span className="font-bold text-navy">Beginly</span>
          </Link>
          <Link href="/guides" className="text-sm text-muted hover:text-primary transition-colors">
            ← Back to Beginly
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Legal
          </p>
          <h1 className="text-3xl font-extrabold text-navy mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8">

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">1. Who we are</h2>
            <p className="text-sm text-muted leading-relaxed">
              Beginly (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is an independent UK settlement
              guidance platform. We help people arriving in the United Kingdom to navigate
              their first 90 days through personalised checklists, plain-English guidance,
              and scam alerts.
            </p>
            <p className="text-sm text-muted leading-relaxed mt-2">
              <strong className="text-navy">Contact:</strong>{" "}
              <a href="mailto:privacy@beginly.app" className="text-primary hover:underline">
                privacy@beginly.app
              </a>
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">
              2. What personal data we collect
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-3">
              When you create a Beginly account and use our platform, we may collect the
              following information:
            </p>
            <ul className="space-y-2 text-sm text-muted list-disc pl-5">
              <li>
                <strong className="text-navy">Account information:</strong> your name, email
                address, and password (managed securely by Supabase Auth).
              </li>
              <li>
                <strong className="text-navy">Arrival profile:</strong> city, university,
                accommodation type, arrival date, nationality, English level, and
                work interest — collected during onboarding.
              </li>
              <li>
                <strong className="text-navy">Checklist data:</strong> tasks you complete or
                save, which reflect your settlement progress.
              </li>
              <li>
                <strong className="text-navy">Usage data:</strong> pages you visit, features
                you use, and general device/browser information (via standard server logs).
              </li>
              <li>
                <strong className="text-navy">Communication data:</strong> any messages you
                send us via the support form or Nia chatbot.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">
              3. How we use your data (lawful basis)
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-3">
              Under UK GDPR, we must have a lawful basis for processing your personal data.
              We rely on the following:
            </p>
            <ul className="space-y-2 text-sm text-muted list-disc pl-5">
              <li>
                <strong className="text-navy">Contract (Art. 6(1)(b)):</strong> To provide
                our service to you — generating your personalised checklist and tracking
                your progress — we need your account and profile data.
              </li>
              <li>
                <strong className="text-navy">Legitimate interests (Art. 6(1)(f)):</strong> To
                improve our platform, send you service-related notifications (e.g. task
                reminders you have enabled), and prevent fraud.
              </li>
              <li>
                <strong className="text-navy">Consent (Art. 6(1)(a)):</strong> For any marketing
                communications or optional notifications. You can withdraw consent at any
                time via your account settings.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">
              4. How we store and secure your data
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Your data is stored in Supabase (hosted on servers within the United Kingdom
              or European Economic Area) and protected by Supabase&apos;s built-in Row Level
              Security (RLS) policies. Authentication is handled by Supabase Auth, which
              stores passwords using secure hashing (bcrypt). We do not store your raw
              password.
            </p>
            <p className="text-sm text-muted leading-relaxed mt-2">
              We regularly review our security measures and will notify you (as required by
              law) of any personal data breach that is likely to result in a risk to your
              rights and freedoms.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">
              5. Who we share your data with
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-3">
              We do <strong className="text-navy">not</strong> sell, rent, or trade your
              personal data to third parties. We share data only in the following limited
              circumstances:
            </p>
            <ul className="space-y-2 text-sm text-muted list-disc pl-5">
              <li>
                <strong className="text-navy">Service providers:</strong> We use Supabase as
                our backend (database and authentication). Their use of your data is
                governed by their privacy policy.
              </li>
              <li>
                <strong className="text-navy">Nia:</strong> When you use the Nia chatbot,
                your messages are processed to provide relevant guidance. Nia is disclosed
                as an automated tool and does not receive your personal account data.
              </li>
              <li>
                <strong className="text-navy">Legal obligations:</strong> We may disclose data
                if required by law, court order, or to protect our legal rights.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">
              6. Cookies
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-3">
              We use cookies to keep you signed in and to remember your preferences.
              Supabase Auth sets essential session cookies that are required for the platform
              to function. We do not use advertising or tracking cookies.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              You can manage cookie preferences in your browser settings. Disabling
              essential cookies will prevent you from logging in.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">
              7. How long we keep your data
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              We retain your account data for as long as your account is active. If you
              delete your account, we will erase your personal data within{" "}
              <strong className="text-navy">30 days</strong>, unless we are required to
              retain it longer for legal, accounting, or compliance reasons (in which
              case it will be retained for no longer than necessary).
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">
              8. Your rights under UK GDPR
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-3">
              As a UK resident, you have the following rights regarding your personal data:
            </p>
            <ul className="space-y-2 text-sm text-muted list-disc pl-5">
              <li>
                <strong className="text-navy">Right of access</strong> — Request a copy of
                all data we hold about you.
              </li>
              <li>
                <strong className="text-navy">Right to rectification</strong> — Ask us to
                correct inaccurate data.
              </li>
              <li>
                <strong className="text-navy">Right to erasure</strong> — Request deletion
                of your account and data (&ldquo;right to be forgotten&rdquo;).
              </li>
              <li>
                <strong className="text-navy">Right to restriction</strong> — Ask us to stop
                processing your data in certain circumstances.
              </li>
              <li>
                <strong className="text-navy">Right to data portability</strong> — Receive
                your data in a structured, machine-readable format.
              </li>
              <li>
                <strong className="text-navy">Right to object</strong> — Object to processing
                based on legitimate interests.
              </li>
              <li>
                <strong className="text-navy">Rights related to automated decision-making</strong>{" "}
                — You have the right not to be subject to solely automated decisions that
                significantly affect you. Our Nia chatbot uses automated, rule-based logic and does not
                make automated decisions with legal or similarly significant effects.
              </li>
            </ul>
            <p className="text-sm text-muted leading-relaxed mt-3">
              To exercise any of these rights, email us at{" "}
              <a href="mailto:privacy@beginly.app" className="text-primary hover:underline">
                privacy@beginly.app
              </a>
              . We will respond within <strong className="text-navy">one month</strong> of
              receiving your request, as required by UK GDPR.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">
              9. Children&apos;s privacy
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Beginly is not intended for use by anyone under the age of 16. We do not
              knowingly collect personal data from children. If we become aware that we
              have collected data from a minor, we will delete it promptly.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">
              10. Changes to this policy
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              We may update this Privacy Policy from time to time. Any material changes
              will be communicated by posting the updated policy on this page with a
              revised &ldquo;Last updated&rdquo; date. We encourage you to review this page
              periodically.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">
              11. Complaints
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              If you have concerns about how we handle your personal data, you have the
              right to complain to the{" "}
              <a
                href="https://ico.org.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Information Commissioner&apos;s Office (ICO)
              </a>
              , the UK&apos;s independent authority for data protection.
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t flex flex-wrap gap-6 text-sm">
          <Link href="/terms-of-service" className="text-primary hover:underline font-medium">
            Terms of Service
          </Link>
          <Link href="/guides" className="text-muted hover:text-primary transition-colors">
            Guidance Library
          </Link>
          <Link href="/support" className="text-muted hover:text-primary transition-colors">
            Get Support
          </Link>
        </div>
      </main>
    </div>
  );
}
