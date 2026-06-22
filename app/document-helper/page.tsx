"use client";

import { useState } from "react";
import { getDocHelperResponse, getAvailableDocTypes } from "@/lib/doc-helper-responses";
import type { DocType } from "@/types";
import { Bot, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Disclaimer from "@/components/Disclaimer";
import Navigation from "@/components/Navigation";

const NIA_INTRO =
  "Hi, I'm Nia. For this MVP, Document Helper is paste-text-only. Paste a short non-sensitive extract and I’ll explain the general meaning in plain English. Do not paste passport numbers, bank details, passwords, full tenancy contracts, or sensitive personal documents.";

export default function DocumentHelperPage() {
  const [selectedType, setSelectedType] = useState<DocType | "">("");
  const [userText, setUserText] = useState("");
  const [response, setResponse] = useState<ReturnType<typeof getDocHelperResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const docTypes = getAvailableDocTypes();

  const handleExplain = async () => {
    if (!selectedType) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = getDocHelperResponse(selectedType);
    setResponse({
      ...result,
      plainEnglish: userText.trim()
        ? `${result.plainEnglish}\n\nNote: this MVP uses template-based guidance. It does not make legal, financial, medical, immigration, tax, or housing decisions from your pasted text. Use the checklist above to understand what to check and verify important issues with official sources or a qualified professional.`
        : result.plainEnglish,
    });
    setLoading(false);
  };

  return (
    <Navigation>
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-navy">Document Helper</h1>
              <span className="text-[10px] font-mono bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">MVP paste-text only</span>
            </div>
            <p className="text-xs text-muted">Powered by Nia — your Beginly guide</p>
          </div>
        </div>

        <div className="card border-primary/20 bg-teal-50/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">N</span>
            </div>
            <p className="text-sm text-civic-700 leading-relaxed italic">{NIA_INTRO}</p>
          </div>
        </div>

        <Disclaimer type="legal" />

        <div className="card">
          <h2 className="section-title">Choose a document type</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {docTypes.map((dt) => (
              <button
                key={dt.type}
                onClick={() => { setSelectedType(dt.type as DocType); setResponse(null); }}
                className={`text-left p-4 rounded-xl border-2 transition-all ${selectedType === dt.type ? "border-primary bg-teal-50" : "border-border bg-white hover:border-primary/40"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-navy">{dt.label}</p>
                    <p className="text-xs text-muted mt-0.5">{dt.desc}</p>
                  </div>
                  {selectedType === dt.type && <CheckCircle className="w-4 h-4 text-primary shrink-0" />}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <label className="block text-xs font-medium text-navy mb-1.5">
              Paste a short non-sensitive extract only
            </label>
            <textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value.slice(0, 5000))}
              className="input-field resize-none"
              rows={6}
              placeholder="Paste a short extract here. Do not paste passport numbers, bank details, passwords, full contracts, or private/sensitive documents."
            />
            <p className="text-xs text-muted mt-1">Maximum 5,000 characters. File upload/OCR will be added only after stronger privacy and extraction controls are implemented.</p>
          </div>

          <button onClick={handleExplain} disabled={loading || !selectedType} className="btn-primary w-full justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Nia is preparing guidance...</> : <><Bot className="w-4 h-4" /> Explain in Plain English</>}
          </button>
        </div>

        {response && (
          <div className="space-y-4">
            <div className="card border-primary/20 bg-teal-50/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">N</span>
                </div>
                <h2 className="text-base font-semibold text-navy">In plain English</h2>
              </div>
              <p className="text-sm text-civic-700 leading-relaxed whitespace-pre-line">{response.plainEnglish}</p>
            </div>

            {response.keyTerms.length > 0 && (
              <div className="card">
                <h2 className="section-title">Key terms explained</h2>
                <div className="space-y-3">
                  {response.keyTerms.map((kt, i) => (
                    <div key={i} className="pb-3 border-b border-civic-100 last:border-0 last:pb-0">
                      <p className="text-sm font-semibold text-navy">{kt.term}</p>
                      <p className="text-xs text-civic-600 mt-0.5 leading-relaxed">{kt.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {response.missingFields.length > 0 && (
              <div className="card">
                <h2 className="text-sm font-semibold text-navy mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" /> Check these are included
                </h2>
                <ul className="space-y-1.5">
                  {response.missingFields.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-civic-700"><span className="text-amber-400 shrink-0 mt-0.5">⚠</span>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {response.safeNextSteps.length > 0 && (
              <div className="card bg-green-50 border-green-200">
                <h2 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Safe next steps</h2>
                <ul className="space-y-1.5">
                  {response.safeNextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-700"><span className="text-green-500 shrink-0 mt-0.5">✓</span>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            <Disclaimer type="legal" />
          </div>
        )}
      </div>
    </Navigation>
  );
}
