"use client";
import { useState } from "react";
import { getDocHelperResponse, getAvailableDocTypes } from "@/lib/doc-helper-responses";
import type { DocType } from "@/types";
import { Bot, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Disclaimer from "@/components/Disclaimer";
import Navigation from "@/components/Navigation";

const DISCLAIMER =
  "Nia is an AI-assisted guide created by SettleMap. Nia does not provide legal, immigration, financial, tax, medical, or housing advice. Nia helps you understand what documents mean so you can make your own decisions. Always verify important information with official sources or a qualified professional.";

const NIA_INTRO =
  "Hi, I'm Nia! I'm here to help you understand UK documents in plain English. I can explain tenancy agreements, council tax letters, student status letters, bank letters, and NHS forms — without the jargon. I don't give legal or financial advice — I help you understand so you can decide for yourself.";

export default function DocumentHelperPage() {
  const [selectedType, setSelectedType] = useState<DocType | "">("");
  const [userText, setUserText] = useState("");
  const [response, setResponse] = useState<ReturnType<typeof getDocHelperResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const docTypes = getAvailableDocTypes();

  const handleExplain = async () => {
    if (!selectedType) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setResponse(getDocHelperResponse(selectedType));
    setLoading(false);
  };

  return (
    <Navigation>
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy">Document Helper</h1>
            <p className="text-xs text-muted">Powered by Nia — your SettleMap guide</p>
          </div>
        </div>

        {/* Welcome card */}
        <div className="card border-primary/20 bg-teal-50/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">N</span>
            </div>
            <p className="text-sm text-civic-700 leading-relaxed italic">{NIA_INTRO}</p>
          </div>
        </div>

        <Disclaimer type="legal" />

        {/* Type selector */}
        <div className="card">
          <h2 className="section-title">Choose a document type</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {docTypes.map((dt) => (
              <button
                key={dt.type}
                onClick={() => { setSelectedType(dt.type as DocType); setResponse(null); }}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedType === dt.type
                    ? "border-primary bg-teal-50"
                    : "border-border bg-white hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-navy">{dt.label}</p>
                    <p className="text-xs text-muted mt-0.5">{dt.desc}</p>
                  </div>
                  {selectedType === dt.type && (
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <label className="block text-xs font-medium text-navy mb-1.5">
              Paste document text here (optional)
            </label>
            <textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              className="input-field resize-none"
              rows={4}
              placeholder="You can paste relevant text from a document and I'll highlight key terms..."
            />
          </div>

          <button
            onClick={handleExplain}
            disabled={loading || !selectedType}
            className="btn-primary w-full justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Nia is reading...</>
            ) : (
              <><Bot className="w-4 h-4" /> Explain in Plain English</>
            )}
          </button>
        </div>

        {/* Response */}
        {response && (
          <div className="space-y-4">
            <div className="card border-primary/20 bg-teal-50/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">N</span>
                </div>
                <h2 className="text-base font-semibold text-navy">In plain English</h2>
              </div>
              <p className="text-sm text-civic-700 leading-relaxed">{response.plainEnglish}</p>
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
                    <li key={i} className="flex items-start gap-2 text-sm text-civic-700">
                      <span className="text-amber-400 shrink-0 mt-0.5">⚠</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {response.safeNextSteps.length > 0 && (
              <div className="card bg-green-50 border-green-200">
                <h2 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Safe next steps
                </h2>
                <ul className="space-y-1.5">
                  {response.safeNextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                      <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                      {step}
                    </li>
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
