"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ArrowRight } from "lucide-react";
import NiaIcon from "@/components/NiaIcon";

const NIA_DEMOS = [
  {
    q: "What is an eVisa?",
    a: "An eVisa is the online record of your immigration status. It has replaced physical documents like the BRP. You access it through a free UKVI account, where you also link your passport so you can travel with it. To prove your right to work, you can give an employer a share code, which lasts 90 days.",
    tag: "Immigration",
    tagColor: "var(--color-teal)",
  },
  {
    q: "My landlord sent a Section 21 notice. What does it mean?",
    a: "Section 21 is a 'no-fault eviction'. Your landlord can ask you to leave without giving a reason, but must give at least 2 months' written notice. You don't have to leave before the deadline, and if your deposit wasn't protected in a government scheme, the notice may be invalid.",
    tag: "Housing",
    tagColor: "var(--color-coral)",
  },
  {
    q: "What does 'right to work check' mean for my new job?",
    a: "Before your first shift, your employer must verify you have the legal right to work in the UK. You can prove it with a share code from your UKVI account, or with your eligible immigration documents. It's a legal requirement and nothing to worry about if your visa is current and in order.",
    tag: "Employment",
    tagColor: "var(--color-violet)",
  },
  {
    q: "How do I register with a GP when I've just arrived?",
    a: "Find a GP surgery near your address on NHS.uk and fill in their registration form. You don't need proof of immigration status and you cannot be refused registration just because you're new to the UK. You're entitled to NHS care from your first day here.",
    tag: "NHS",
    tagColor: "var(--color-green)",
  },
];

/** A looping example conversation with Nia; visitors can also pick a topic. */
export default function NiaDemo() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % NIA_DEMOS.length), 5200);
    return () => clearInterval(id);
  }, [active]); // restarting on each change gives a full read after a manual pick

  const demo = NIA_DEMOS[active];

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex gap-2 flex-wrap justify-center mb-7">
        {NIA_DEMOS.map((d, i) => (
          <button key={d.tag} type="button" onClick={() => setActive(i)} aria-pressed={active === i}
            className="text-xs font-bold px-3.5 py-1.5 rounded-full border transition-colors"
            style={{
              background: active === i ? d.tagColor : "transparent",
              borderColor: active === i ? d.tagColor : "var(--color-border)",
              color: active === i ? "white" : "var(--color-muted)",
            }}>
            {d.tag}
          </button>
        ))}
      </div>

      <div className="rounded-3xl overflow-hidden border"
        style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-card)" }}>

        <div className="flex items-center gap-3 px-5 py-4" style={{ background: "var(--color-navy)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-coral)" }}>
            <NiaIcon size={18} style={{ color: "white" }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Nia</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>Document & Settlement Guide</p>
          </div>
        </div>

        <div className="px-5 pt-5 pb-4 space-y-4 min-h-[200px]" style={{ background: "var(--color-mist)" }} aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div key={`q-${active}`}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }} className="flex justify-end">
              <div className="max-w-[78%] text-xs leading-relaxed px-4 py-2.5 rounded-2xl rounded-br-sm"
                style={{ background: "var(--color-navy)", color: "white" }}>
                {demo.q}
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div key={`a-${active}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, delay: 0.12 }} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--color-coral)" }}>
                <NiaIcon size={14} style={{ color: "white" }} />
              </div>
              <div className="flex-1 text-xs leading-relaxed px-4 py-3 rounded-2xl rounded-tl-sm"
                style={{ background: "white", color: "var(--color-navy)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                {demo.a}
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `color-mix(in srgb, ${demo.tagColor} 10%, transparent)`, color: demo.tagColor }}>
                  {demo.tag}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-5 py-4 flex items-center gap-3 border-t" style={{ background: "white", borderColor: "var(--color-border)" }}>
          <div aria-hidden className="flex-1 text-xs px-4 py-2.5 rounded-full border select-none"
            style={{ borderColor: "var(--color-border)", color: "var(--color-muted-light)" }}>
            Ask Nia about any UK document or form…
          </div>
          <Link href="/signup" className="btn-primary text-xs px-4 py-2.5 shrink-0">
            Try Nia <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </MotionConfig>
  );
}
