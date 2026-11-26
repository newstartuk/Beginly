"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";

// Example listings. The agent name is made up so no real firm is implied.
const SCAM_CARDS = [
  { id: 1, title: "2-bed flat, Stratford", price: "£1,100 / month", location: "Zone 4 · East London", details: ["Available 1 Feb 2026", "Agent: Harbour & Co Lettings", "References & credit check required", "In-person viewing arranged on request"], source: "Via Rightmove", isScam: false },
  { id: 2, title: "Stunning 1-bed, Central London", price: "£595 / month", location: "Zone 1 · Mayfair", details: ["Available immediately", "Landlord currently abroad, can't meet", "Pay 2 months' deposit via Western Union", "Keys sent by post once payment received"], source: "Direct from landlord", isScam: true },
  { id: 3, title: "Room in shared house", price: "£650 / month", location: "Manchester City Centre", details: ["3 working professionals, very friendly", "Meet the house first: viewing encouraged", "ANUK certified accommodation", "References checked, move in anytime"], source: "Via SpareRoom", isScam: false },
];

const RED_FLAGS =
  "Three red flags: Zone 1 London at £595 (market rate is £1,800+), a landlord who can't meet in person, and payment by Western Union.";

/** "Spot the scam": pick the fake rental listing out of three. */
export default function ScamGame() {
  const [selected, setSelected] = useState<number | null>(null);
  const revealed = selected !== null;
  const pickedScam = SCAM_CARDS.find((c) => c.id === selected)?.isScam ?? false;

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {SCAM_CARDS.map((card) => (
          <button key={card.id} type="button" onClick={() => !revealed && setSelected(card.id)} disabled={revealed}
            className="text-left rounded-2xl overflow-hidden border bg-white transition-all enabled:hover:-translate-y-0.5 enabled:hover:shadow-lg"
            style={{
              borderColor: revealed ? (card.isScam ? "#FECACA" : "rgba(22,179,166,0.3)") : "var(--color-border)",
              boxShadow: "var(--shadow-card)",
              cursor: revealed ? "default" : "pointer",
            }}>
            <div className="h-28 relative"
              style={{ background: card.isScam ? "linear-gradient(135deg,#FEE2E2,#FECACA)" : "linear-gradient(135deg,var(--color-teal-50),var(--color-teal-100))" }}>
              <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.9)", color: "var(--color-navy)" }}>RENTAL</span>
              <AnimatePresence>
                {revealed && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center text-white"
                    style={{ background: card.isScam ? "rgba(220,38,38,0.85)" : "rgba(31,163,106,0.82)" }}>
                    <div className="text-center">
                      {card.isScam ? <XCircle className="w-8 h-8 mx-auto mb-1" /> : <CheckCircle className="w-8 h-8 mx-auto mb-1" />}
                      <span className="text-xs font-bold uppercase tracking-widest">{card.isScam ? "Scam" : "Legitimate"}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-sm" style={{ color: "var(--color-navy)" }}>{card.title}</h3>
                <span className="font-bold text-sm shrink-0" style={{ color: "var(--color-coral)" }}>{card.price}</span>
              </div>
              <p className="text-xs mb-4" style={{ color: "var(--color-muted)" }}>{card.location}</p>
              <ul className="space-y-1.5 mb-4">
                {card.details.map((d, i) => {
                  const flagged = revealed && card.isScam && i >= 1;
                  return (
                    <li key={d} className="flex items-start gap-2 text-xs">
                      <span className="mt-0.5 shrink-0" style={{ color: flagged ? "var(--color-red)" : "var(--color-muted-light)" }}>{flagged ? "⚠" : "·"}</span>
                      <span style={{ color: "var(--color-muted)" }}>{d}</span>
                    </li>
                  );
                })}
              </ul>
              <span className="text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>{card.source}</span>
            </div>
          </button>
        ))}
      </div>

      <div aria-live="polite">
        <AnimatePresence>
          {revealed ? (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
              className="rounded-2xl p-6 text-center max-w-2xl mx-auto border"
              style={{ background: pickedScam ? "var(--color-green-light)" : "var(--color-red-light)", borderColor: pickedScam ? "rgba(31,163,106,0.25)" : "#FECACA" }}>
              <p className="font-bold text-base mb-2" style={{ color: pickedScam ? "var(--color-green)" : "var(--color-red)" }}>
                {pickedScam ? "You spotted it." : "Not quite. Listing 2 is the scam."}
              </p>
              <p className="text-sm mb-4" style={{ color: pickedScam ? "#166534" : "#991B1B" }}>
                {RED_FLAGS} {pickedScam ? "Beginly's scam alerts teach you to spot all three." : "Most newcomers miss at least one of these."}
              </p>
              <div className="flex gap-3 justify-center flex-wrap items-center">
                <Link href="/signup" className="btn-primary text-sm px-7 py-2.5">Set up my scam alerts <ArrowRight className="w-4 h-4" /></Link>
                <button type="button" onClick={() => setSelected(null)} className="text-xs underline" style={{ color: "var(--color-muted)" }}>Try again</button>
              </div>
            </motion.div>
          ) : (
            <p key="hint" className="text-center text-xs" style={{ color: "var(--color-muted-light)" }}>Click the listing you think is a scam.</p>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
