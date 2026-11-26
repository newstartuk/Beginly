"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";

/**
 * "Email the founders" button with a copy icon attached.
 *
 * The main part opens the visitor's email app. The icon copies the address
 * instead, for people who use Gmail or Outlook in the browser and have no
 * email app set up.
 */
export default function EmailFoundersButton({ email, subject }: { email: string; subject: string }) {
  const [copied, setCopied] = useState(false);
  const href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // If the browser blocks clipboard access, the email link still works.
    }
  };

  return (
    <div className="inline-flex items-stretch rounded-full border text-sm font-semibold text-white overflow-hidden"
      style={{ borderColor: "rgba(255,255,255,0.3)" }}>
      <a href={href} className="inline-flex items-center gap-2 pl-7 pr-4 py-3 text-white transition-colors hover:bg-white/10">
        <Mail className="w-4 h-4" />
        Email the founders
      </a>
      <button type="button" onClick={copy}
        className="inline-flex items-center gap-1.5 px-4 border-l transition-colors hover:bg-white/10"
        style={{ borderColor: "rgba(255,255,255,0.3)", color: copied ? "var(--color-teal)" : undefined }}
        title={copied ? "Copied" : "Copy founders email"}
        aria-label={copied ? "Email address copied" : "Copy founders email"}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied && <span className="text-xs">Copied</span>}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? "Email address copied" : ""}</span>
    </div>
  );
}
