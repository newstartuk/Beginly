import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Beginly",
  description:
    "The terms and conditions governing your use of the Beginly platform.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "23 June 2026";

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
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
            Terms of Service
          </h1>
          <p className="text-sm text-muted">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8">

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">1. About Beginly</h2>
            <p className="text-sm text-muted leading-relaxed">
              Beginly (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;Beginly&rdquo;) is an independent
              digital platform that provides personalised settlement guidance for people arriving
              in the United Kingdom. Beginly is not affiliated with, endorsed by, or connected
              to the UK government, the National Health Service (NHS), any UK university, or any
              regulatory body.
            </p>
            <p className="text-sm text-muted leading-relaxed mt-2">
              By creating an account or using any part of the Beginly platform
              (&ldquo;the Service&rdquo;), you (&ldquo;you&rdquo; or &ldquo;the User&rdquo;) agree to
              these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree with these Terms,
              do not use the Service.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">2. Who can use Beginly</h2>
            <p className="text-sm text-muted leading-relaxed">
              Beginly is available to anyone, but is designed primarily for people arriving
              in the UK — including international students, workers, and family members.
              You must be at least <strong className="text-navy">16 years old</strong> to
              create an account. If you are under 18, you confirm that you have the consent
              of a parent or guardian to use the Service.
            </p>
            <p className="text-sm text-muted leading-relaxed mt-2">
              You are responsible for ensuring that all information you provide during
              registration and onboarding is accurate and up to date.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">3. The Service we provide</h2>
            <p className="text-sm text-muted leading-relaxed">
              Beginly provides:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted list-disc pl-5">
              <li>A personalised settlement checklist generated from information you provide during onboarding.</li>
              <li>Plain-English guidance articles and informational content about UK settlement topics.</li>
              <li>An AI-powered chatbot (Nia) that provides general orientation information and explains documents.</li>
              <li>Scam alerts and safety information.</li>
              <li>Task tracking and progress monitoring tools.</li>
            </ul>
            <p className="text-sm text-muted leading-relaxed mt-3">
              <strong className="text-navy">What Beginly is NOT:</strong> Beginly does not
              provide legal advice, immigration advice, financial advice, tax advice, medical
              advice, housing advice, or advice from regulated professionals. The content
              on Beginly is informational only and should not be relied upon as a substitute
              for professional advice specific to your circumstances.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">4. Nia AI — acceptable use</h2>
            <p className="text-sm text-muted leading-relaxed">
              Nia is an AI orientation assistant built into the Beginly platform. When you
              use Nia, you agree:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted list-disc pl-5">
              <li>Not to share personal, sensitive, or confidential information beyond what is necessary to receive guidance.</li>
              <li>Not to use Nia to obtain regulated advice (immigration, legal, medical, financial, etc.).</li>
              <li>That Nia&apos;s responses are generated by AI and may not always be accurate or complete.</li>
              <li>That Beginly is not liable for decisions made based on Nia&apos;s outputs.</li>
            </ul>
            <p className="text-sm text-muted leading-relaxed mt-3">
              Nia&apos;s scope is clearly defined and enforced technically — attempting to
              circumvent Nia&apos;s scope guardrails to obtain regulated outputs is a
              violation of these Terms.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">5. Your account and responsibilities</h2>
            <p className="text-sm text-muted leading-relaxed">
              You are responsible for:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted list-disc pl-5">
              <li>Keeping your account credentials secure and not sharing them with others.</li>
              <li>All activity that occurs under your account, whether or not you authorised it.</li>
              <li>Providing accurate information during onboarding and updating it if it changes.</li>
              <li>Ensuring your use of the Service complies with these Terms and applicable law.</li>
            </ul>
            <p className="text-sm text-muted leading-relaxed mt-3">
              We reserve the right to suspend or terminate accounts that misuse the platform,
              submit false information, or use the Service for any unlawful purpose.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">6. Fees and payments</h2>
            <p className="text-sm text-muted leading-relaxed">
              Beginly is currently free to use. If we introduce paid features in the future,
              we will notify you in advance and obtain your explicit consent before charging
              any fees. All fees will be displayed clearly and will not be applied without
              your agreement.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">7. Disclaimer of warranties</h2>
            <p className="text-sm text-muted leading-relaxed">
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;
              WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
              TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT.
            </p>
            <p className="text-sm text-muted leading-relaxed mt-2">
              Beginly does not guarantee that:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted list-disc pl-5">
              <li>The Service will be uninterrupted, secure, or error-free.</li>
              <li>Guidance content will always reflect the most current official guidance.</li>
              <li>Nia&apos;s outputs will always be accurate, complete, or suitable for your situation.</li>
              <li>Tasks or timelines generated will be appropriate for your specific circumstances.</li>
            </ul>
            <p className="text-sm text-muted leading-relaxed mt-3">
              You should always verify information against official government sources
              (e.g., GOV.UK) and consult a qualified professional for advice specific
              to your circumstances.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">8. Limitation of liability</h2>
            <p className="text-sm text-muted leading-relaxed">
              To the fullest extent permitted by applicable law, Beginly and its founders,
              team, and affiliates shall not be liable for:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted list-disc pl-5">
              <li>Any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</li>
              <li>Any loss of data, income, opportunity, or reputation.</li>
              <li>Any decisions made or actions taken based on Beginly&apos;s content or Nia&apos;s outputs.</li>
              <li>Any inaccuracies, omissions, or outdated information in guidance content.</li>
              <li>Any disputes with third parties including landlords, employers, banks, or government bodies.</li>
            </ul>
            <p className="text-sm text-muted leading-relaxed mt-3">
              In any event, Beginly&apos;s total liability shall not exceed{" "}
              <strong className="text-navy">£50 (fifty pounds sterling)</strong> in aggregate.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">9. Intellectual property</h2>
            <p className="text-sm text-muted leading-relaxed">
              All content on Beginly — including text, design, logos, software, and the
              Nia AI — is owned by Beginly or its licensors and is protected by applicable
              intellectual property laws. You may not copy, redistribute, scrape, or
              reproduce any part of the platform without our written permission.
            </p>
            <p className="text-sm text-muted leading-relaxed mt-2">
              User-generated content (e.g. support tickets) remains yours, but you grant
              Beginly a non-exclusive, royalty-free licence to use it for the purpose of
              providing the Service.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">10. Third-party links and services</h2>
            <p className="text-sm text-muted leading-relaxed">
              Beginly may link to external websites, resources, or services (including
              GOV.UK, university websites, and other official sources). These links are
              provided for convenience only. Beginly has no control over and accepts no
              responsibility for third-party content, products, or services.
            </p>
            <p className="text-sm text-muted leading-relaxed mt-2">
              Your use of third-party services (including Supabase for authentication) is
              governed by their own terms and privacy policies.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">11. Account termination</h2>
            <p className="text-sm text-muted leading-relaxed">
              You may delete your account at any time from the Settings page or by
              contacting us at{" "}
              <a href="mailto:support@beginly.app" className="text-primary hover:underline">
                support@beginly.app
              </a>
              . Upon deletion, we will erase your personal data in accordance with our
              Privacy Policy, subject to any legal retention requirements.
            </p>
            <p className="text-sm text-muted leading-relaxed mt-2">
              We may suspend or terminate accounts that breach these Terms, without prior
              notice. Termination does not affect any rights or liabilities that accrued
              before termination.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">12. Changes to these Terms</h2>
            <p className="text-sm text-muted leading-relaxed">
              We may update these Terms from time to time to reflect changes in the
              Service, legal requirements, or business practices. If the changes are
              material, we will notify you by posting the updated Terms on this page
              with a revised &ldquo;Last updated&rdquo; date, or — for significant changes —
              by email to the address associated with your account.
            </p>
            <p className="text-sm text-muted leading-relaxed mt-2">
              Your continued use of Beginly after any change constitutes acceptance
              of the updated Terms.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">13. Governing law</h2>
            <p className="text-sm text-muted leading-relaxed">
              These Terms are governed by and construed in accordance with the laws of
              England and Wales. Any disputes arising from these Terms or your use of
              Beginly shall be subject to the exclusive jurisdiction of the courts of
              England and Wales.
            </p>
            <p className="text-sm text-muted leading-relaxed mt-2">
              As a consumer, you may also have rights under applicable consumer protection
              laws. Nothing in these Terms affects your statutory rights.
            </p>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-lg font-bold text-navy mb-3">14. Contact us</h2>
            <p className="text-sm text-muted leading-relaxed">
              For any questions about these Terms or the Service, please contact us at:
            </p>
            <p className="text-sm text-muted leading-relaxed mt-2">
              <strong className="text-navy">Email:</strong>{" "}
              <a href="mailto:support@beginly.app" className="text-primary hover:underline">
                support@beginly.app
              </a>
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t flex flex-wrap gap-6 text-sm">
          <Link href="/privacy-policy" className="text-primary hover:underline font-medium">
            Privacy Policy
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
