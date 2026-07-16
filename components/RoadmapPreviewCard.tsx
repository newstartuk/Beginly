"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import Logo from "@/components/Logo";

type Task = { task: string; day: string; done: boolean; active?: boolean };

const STEPS: { readiness: number; tasks: Task[] }[] = [
  {
    readiness: 68,
    tasks: [
      { task: "Open a UK bank account", day: "Day 1", done: true },
      { task: "Get a UK SIM card", day: "Day 2", done: true },
      { task: "Register with a local GP", day: "Day 7", done: false, active: true },
      { task: "Apply for National Insurance number", day: "Day 10", done: false },
    ],
  },
  {
    readiness: 82,
    tasks: [
      { task: "Open a UK bank account", day: "Day 1", done: true },
      { task: "Get a UK SIM card", day: "Day 2", done: true },
      { task: "Register with a local GP", day: "Day 7", done: true },
      { task: "Apply for National Insurance number", day: "Day 10", done: false, active: true },
    ],
  },
];

const STEP_HOLD_MS = 3200;

export default function RoadmapPreviewCard({ location = "Manchester · Arrived 2 weeks ago" }: { location?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const id = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, STEP_HOLD_MS);
    return () => clearInterval(id);
  }, [shouldReduceMotion]);

  const step = STEPS[stepIndex];
  const entranceTransition = shouldReduceMotion ? { duration: 0 } : undefined;

  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
      {/* floating badge */}
      <motion.div
        className="absolute -top-4 -left-4 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
        style={{ background: "var(--gradient-gold)", color: "var(--color-navy)" }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={entranceTransition ?? { delay: 1.1, type: "spring", stiffness: 300, damping: 15 }}
      >
        <Zap className="w-3.5 h-3.5" />
        <AnimatePresence mode="wait">
          <motion.span
            key={step.readiness}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
          >
            {step.readiness}% ready
          </motion.span>
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="rounded-3xl overflow-hidden"
        style={{
          background: "#0D2036",
          boxShadow: "var(--shadow-lg), 0 30px 60px -20px rgba(7,24,46,0.45)",
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={entranceTransition ?? { delay: 0.3, type: "spring", stiffness: 120, damping: 18 }}
      >
        {/* card header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2">
            <Logo size={22} className="rounded-md" />
            <span className="text-white text-xs font-semibold">Beginly Roadmap</span>
          </div>
          <span className="text-[11px] font-medium" style={{ color: "#46C8F1" }}>
            12 / 40 complete
          </span>
        </div>

        {/* card body */}
        <div className="p-5" style={{ background: "#FFFFFF" }}>
          <p className="text-xs mb-4" style={{ color: "#64748B" }}>
            {location}
          </p>

          <div className="space-y-2.5">
            {step.tasks.map((t) => (
              <motion.div
                key={t.task}
                layout={!shouldReduceMotion}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                animate={{
                  backgroundColor: t.active ? "#F0FAFC" : "#FFFFFF",
                  borderColor: t.active ? "rgba(14,122,120,0.25)" : "#F1F5F9",
                }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
                style={{ borderWidth: 1, borderStyle: "solid" }}
              >
                <motion.div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  animate={{
                    backgroundColor: t.done ? "#1FA36A" : "rgba(0,0,0,0)",
                    borderColor: t.active ? "#0E7A78" : "#E2E8F0",
                  }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
                  style={{ borderWidth: t.done ? 0 : 2, borderStyle: "solid" }}
                >
                  <AnimatePresence>
                    {t.done && (
                      <motion.div
                        initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <motion.p
                    className="text-xs font-semibold truncate"
                    animate={{
                      color: "#0D2036",
                      opacity: t.done ? 0.5 : 1,
                    }}
                    style={{ textDecoration: t.done ? "line-through" : "none" }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
                  >
                    {t.task}
                  </motion.p>
                </div>
                <span className="text-[10px] font-medium shrink-0" style={{ color: "#64748B" }}>
                  {t.day}
                </span>
              </motion.div>
            ))}
          </div>

          {/* readiness bar */}
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid #F1F5F9" }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold" style={{ color: "#0D2036" }}>
                UK Readiness Score
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={step.readiness}
                  className="text-[11px] font-bold"
                  style={{ color: "#E8B95D" }}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
                >
                  {step.readiness}%
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--gradient-teal)" }}
                animate={{ width: `${step.readiness}%` }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: [0.16, 0.8, 0.3, 1] as const }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
