import { AlertTriangle } from "lucide-react";

interface DisclaimerProps {
  text?: string;
  type?: "general" | "medical" | "legal" | "financial";
}

const DISCLAIMER_TEXT: Record<string, string> = {
  general:
    "Beginly provides general settlement guidance only. This is not a substitute for professional advice specific to your situation. Always verify information directly with official sources.",
  medical:
    "This page is for general information only. Beginly does not provide medical advice. For health concerns, contact the NHS directly or consult a qualified healthcare professional.",
  legal:
    "This page is for general information only and does not constitute legal advice. Beginly is not a law firm. For legal matters, consult a qualified immigration or legal adviser.",
  financial:
    "This page provides general guidance only and does not constitute financial advice. Budget figures are illustrative. Consult a qualified financial adviser for personal financial planning.",
};

export default function Disclaimer({ text, type = "general" }: DisclaimerProps) {
  return (
    <div className="disclaimer-box">
      <p className="font-semibold text-navy mb-1 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5" /> Disclaimer
      </p>
      <p className="text-xs text-muted leading-relaxed">{text ?? DISCLAIMER_TEXT[type]}</p>
    </div>
  );
}
