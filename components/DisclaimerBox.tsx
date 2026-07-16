"use client";

import { AlertTriangle } from "lucide-react";

interface DisclaimerBoxProps {
  type?: "general" | "medical" | "legal" | "financial" | "ai";
  className?: string;
}

const DISCLAIMER_CONTENT: Record<
  NonNullable<DisclaimerBoxProps["type"]>,
  { title: string; body: string }
> = {
  general: {
    title: "General guidance only",
    body:
      "Beginly provides general settlement guidance, checklist support, document explanation, and signposting. We do not provide legal, immigration, financial, tax, medical, or housing advice. For official or regulated matters, please use official sources or speak to a qualified professional.",
  },
  medical: {
    title: "Not medical advice",
    body:
      "This page is for general information only. Beginly does not provide medical advice. For health concerns, contact the NHS directly or consult a qualified healthcare professional. In an emergency, call 999.",
  },
  legal: {
    title: "Not legal advice",
    body:
      "This page is for general information only and does not constitute legal advice. Beginly is not a law firm. For immigration, tenancy, or other legal matters, consult a qualified legal adviser. Your university's student advice centre is a good starting point.",
  },
  financial: {
    title: "Not financial advice",
    body:
      "This page provides general guidance only and does not constitute financial advice. Budget figures are illustrative. Consult a qualified financial adviser for personal financial planning. The Money Advice Service (moneyadviceservice.org.uk) offers free, independent guidance.",
  },
  ai: {
    title: "Nia is not a professional adviser",
    body:
      "Nia is an AI-assisted orientation tool created by Beginly. She is not a regulated immigration adviser, lawyer, doctor, or financial adviser. She helps you understand information — she does not make decisions for you. Always verify important matters with a qualified professional.",
  },
};

/**
 * Branded disclaimer box.
 * Shown at the bottom of every sensitive page (guidance, Nia, documents, etc.)
 */
export default function DisclaimerBox({
  type = "general",
  className = "",
}: DisclaimerBoxProps) {
  const { title, body } = DISCLAIMER_CONTENT[type];

  return (
    <aside
      className={[
        "rounded-xl border border-border",
        "bg-civic-50 px-5 py-4",
        "flex gap-3 items-start",
        className,
      ].join(" ")}
      aria-label="Disclaimer"
    >
      <AlertTriangle
        className="w-4 h-4 text-muted shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div>
        <p className="font-semibold text-sm text-navy mb-1">{title}</p>
        <p className="text-xs text-muted leading-relaxed">{body}</p>
      </div>
    </aside>
  );
}
