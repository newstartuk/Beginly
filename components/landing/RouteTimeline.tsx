"use client";

import Link from "next/link";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useHeroRoute } from "@/components/landing/HeroRouteContext";
import { HERO_ROUTE_LABEL, HERO_ROUTE_ORDER, type HeroRoute, type TimelinePhase } from "@/components/landing/hero-routes";

// One accent per stage, in order. Colour only marks the stage; the text says what it is.
const STAGE_COLOURS = ["var(--color-coral)", "var(--color-gold)", "var(--color-teal)", "var(--color-violet)", "var(--color-green)"];

/**
 * "Everything, in the right order": a preview of the chosen route's checklist,
 * stage by stage. It follows the route picked in the hero, and its own buttons
 * change both.
 */
export default function RouteTimeline({ timelines }: { timelines: Record<HeroRoute, TimelinePhase[]> }) {
  const { route, setRoute } = useHeroRoute();
  const phases = timelines[route] ?? [];

  return (
    <MotionConfig reducedMotion="user">
      <div className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-coral)" }}>
          Your first 90 days
        </p>
        <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-navy)" }}>
          Everything, in the right order.
        </h2>
        <p className="text-sm max-w-xl mx-auto mt-3 leading-relaxed" style={{ color: "var(--color-muted)" }}>
          A preview of the {HERO_ROUTE_LABEL[route]} checklist. Your own roadmap is built around your route, city and
          arrival date.
        </p>
      </div>

      <div role="group" aria-label="Show the timeline for" className="flex flex-wrap justify-center gap-1.5 mb-12">
        {HERO_ROUTE_ORDER.map((key) => {
          const active = route === key;
          return (
            <button key={key} type="button" onClick={() => setRoute(key)} aria-pressed={active}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
              style={{
                background: active ? "var(--color-navy)" : "white",
                borderColor: active ? "var(--color-navy)" : "var(--color-border)",
                color: active ? "#fff" : "var(--color-muted)",
              }}>
              {HERO_ROUTE_LABEL[key]}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.ol key={route} aria-label={`${HERO_ROUTE_LABEL[route]} timeline`}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          // Stacked on phones; one column per stage on desktop, however many stages the route has.
          className="grid gap-8 lg:grid-flow-col lg:auto-cols-fr lg:gap-6">
          {phases.map((phase, i) => {
            const colour = STAGE_COLOURS[i % STAGE_COLOURS.length];
            const isLast = i === phases.length - 1;
            return (
              <li key={phase.stage} className="relative pl-9 lg:pl-0">
                {/* Line to the next stage: down on phones, across on desktop */}
                {!isLast && (
                  <span aria-hidden
                    className="absolute left-[7px] top-5 -bottom-8 w-0.5 lg:left-6 lg:-right-6 lg:top-[7px] lg:bottom-auto lg:w-auto lg:h-0.5"
                    style={{ background: "var(--color-border)" }} />
                )}
                <span aria-hidden className="absolute left-0 top-0.5 lg:static lg:block w-4 h-4 rounded-full lg:mb-4"
                  style={{ background: colour, boxShadow: `0 0 0 4px color-mix(in srgb, ${colour} 18%, transparent)` }} />

                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-navy)" }}>
                  {phase.label}
                </h3>
                <ul className="space-y-2.5">
                  {phase.tasks.map((task) => (
                    <li key={task} className="flex items-start gap-2 text-sm leading-snug" style={{ color: "var(--color-navy)" }}>
                      <span aria-hidden className="mt-[5px] w-2 h-2 rounded-full border-2 shrink-0" style={{ borderColor: colour }} />
                      {task}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </motion.ol>
      </AnimatePresence>

      <div className="text-center mt-12">
        <Link href="/signup" className="btn-primary text-sm px-7 py-3 inline-flex items-center gap-2">
          Build my roadmap
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </MotionConfig>
  );
}
