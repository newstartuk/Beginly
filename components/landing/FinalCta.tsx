"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

/** Closing call to action. The door swings open as the box scrolls into view. */
export default function FinalCta() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotateY = useTransform(scrollYProgress, [0.2, 1], [0, -76]);
  const glow = useTransform(scrollYProgress, [0.2, 0.9], [0, 1]);

  return (
    <div ref={ref} className="rounded-3xl p-10 sm:p-14 relative overflow-hidden" style={{ background: "var(--color-navy)" }}>
      <div aria-hidden className="absolute rounded-full pointer-events-none"
        style={{ width: 280, height: 280, opacity: 0.15, background: "radial-gradient(circle, var(--color-teal) 0%, transparent 65%)", top: -80, right: -80 }} />

      <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-10 items-center">
        <div className="text-center md:text-left">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(22,179,166,0.85)" }}>
            Open what comes next
          </p>
          <h2 className="font-display text-2xl sm:text-3xl text-white mb-4">Your first 90 days start now.</h2>
          <p className="text-sm mb-8 max-w-md mx-auto md:mx-0 leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            Join newcomers from around the world using Beginly to settle in with confidence. Free, with no card needed.
          </p>
          <Link href="/signup" className="btn-primary text-sm px-8 py-3.5 inline-flex items-center gap-2">
            Create your roadmap now
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Takes 2 minutes · No payment required</p>
        </div>

        {/* Door: decorative, so hidden from screen readers */}
        <div aria-hidden className="hidden md:block" style={{ perspective: "1100px" }}>
          <div style={{
            position: "relative", width: 128, height: 198,
            border: "3px solid rgba(255,255,255,0.85)",
            borderRadius: "50% 50% 0 0 / 14% 14% 0 0",
          }}>
            <motion.div style={{
              position: "absolute", inset: 0, borderRadius: "inherit",
              background: "radial-gradient(ellipse at 50% 90%, #FFB547 0%, #FF7A59 38%, transparent 72%)",
              opacity: reduceMotion ? 1 : glow,
            }} />
            <motion.div style={{
              position: "absolute", inset: 0, borderRadius: "inherit",
              background: "#17375A", transformOrigin: "0% 50%",
              rotateY: reduceMotion ? -76 : rotateY,
            }}>
              <div style={{ position: "absolute", top: 12, left: 9, right: 9, bottom: 10, border: "1px solid rgba(255,255,255,0.12)", borderRadius: "42% 42% 0 0 / 10% 10% 0 0" }} />
              <div style={{ position: "absolute", right: 15, top: "54%", width: 9, height: 9, borderRadius: "50%", background: "var(--color-gold)", transform: "translateY(-50%)" }} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
