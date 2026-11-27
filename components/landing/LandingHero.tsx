"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  ArrowRight, GraduationCap, Briefcase, Heart, Award, Rocket, Stethoscope,
} from "lucide-react";
import RoadmapPreviewCard, { type RoadmapTask } from "@/components/RoadmapPreviewCard";
import { HERO_ROUTE_LABEL, HERO_ROUTE_ORDER, type HeroRoute } from "@/components/landing/hero-routes";
import { useHeroRoute } from "@/components/landing/HeroRouteContext";

const EASE_OUT = [0.16, 0.8, 0.3, 1] as const;

type Persona = HeroRoute;

const PERSONA_ORDER: Persona[] = HERO_ROUTE_ORDER;

const PERSONAS: Record<Persona, {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  headline: string;
  accent: string;
  sub: string;
  stats: Array<{ value: number; suffix: string; label: string }>;
  cardLocation: string;
}> = {
  student: {
    label: HERO_ROUTE_LABEL.student,
    Icon: GraduationCap,
    headline: "Your student visa journey, mapped from day one.",
    accent: "student visa journey,",
    sub: "From university registration to bank accounts and SIM cards: your 90-day checklist is built around your course start date, city, and UKCISA rights.",
    stats: [
      { value: 32, suffix: "+", label: "Student tasks" },
      { value: 15, suffix: "+", label: "Visa guides" },
      { value: 90, suffix: "", label: "Day roadmap" },
    ],
    cardLocation: "Manchester · Student · CAS holder",
  },
  worker: {
    label: HERO_ROUTE_LABEL.worker,
    Icon: Briefcase,
    headline: "Your Skilled Worker route, step by step.",
    accent: "Skilled Worker route,",
    sub: "RTW checks, NI number, bank account, GP registration: everything your employer expects, sorted before your first day in the office.",
    stats: [
      { value: 45, suffix: "+", label: "Work tasks" },
      { value: 20, suffix: "+", label: "Work guides" },
      { value: 90, suffix: "", label: "Day roadmap" },
    ],
    cardLocation: "London · Skilled Worker · Sponsored",
  },
  family: {
    label: HERO_ROUTE_LABEL.family,
    Icon: Heart,
    headline: "Settling your family in the UK, without the guesswork.",
    accent: "family in the UK,",
    sub: "School places, GP registration for children, Council Tax, dependent visa conditions: your family's checklist, in the right order, for each person.",
    stats: [
      { value: 38, suffix: "+", label: "Family tasks" },
      { value: 18, suffix: "+", label: "Family guides" },
      { value: 90, suffix: "", label: "Day roadmap" },
    ],
    cardLocation: "Birmingham · Family visa · 3 dependents",
  },
  graduate: {
    label: HERO_ROUTE_LABEL.graduate,
    Icon: Award,
    headline: "Stay and thrive after your degree with your Graduate route.",
    accent: "Graduate route.",
    sub: "Switched from Student to Graduate visa? Your checklist covers right to work, employer registration, NI number top-up, and what changes the day your CAS expires.",
    stats: [
      { value: 28, suffix: "+", label: "Graduate tasks" },
      { value: 12, suffix: "+", label: "Route guides" },
      { value: 90, suffix: "", label: "Day roadmap" },
    ],
    // No visa length here: it drops from 2 years to 18 months for applications from 1 January 2027.
    cardLocation: "London · Graduate visa · Post-study work",
  },
  founder: {
    label: HERO_ROUTE_LABEL.founder,
    Icon: Rocket,
    headline: "Your Innovator Founder visa, evidence-led and one step at a time.",
    accent: "Innovator Founder visa,",
    sub: "Your roadmap for building in the UK: endorsing-body evidence, viability and scalability criteria, business bank setup, and the record-keeping your endorsement depends on.",
    stats: [
      { value: 24, suffix: "+", label: "Founder tasks" },
      { value: 10, suffix: "+", label: "Route guides" },
      { value: 90, suffix: "", label: "Day roadmap" },
    ],
    cardLocation: "London · Founder visa · Endorsed",
  },
  health: {
    label: HERO_ROUTE_LABEL.health,
    Icon: Stethoscope,
    headline: "Your Health & Care Worker route, from arrival to ward.",
    accent: "Health & Care Worker route,",
    sub: "Your 90-day plan for clinical and care workers arriving in the UK: NMC or GMC registration, NHS trust right-to-work, setting up your eVisa, and mandatory training.",
    stats: [
      { value: 35, suffix: "+", label: "Health tasks" },
      { value: 16, suffix: "+", label: "NHS guides" },
      { value: 90, suffix: "", label: "Day roadmap" },
    ],
    cardLocation: "Birmingham · Health & Care · NHS Trust",
  },
};

/** Counts up to `value` the first time it scrolls into view. */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let cur = 0;
      const step = value / 38;
      timer = setInterval(() => {
        cur = Math.min(cur + step, value);
        setDisplay(Math.round(cur));
        if (cur >= value) clearInterval(timer);
      }, 28);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => { obs.disconnect(); clearInterval(timer); };
  }, [value]);
  return <span ref={ref}>{display}{suffix}</span>;
}

/**
 * The hero's interactive part: pick a visa route and the copy, stats and roadmap card change to match.
 * `cardTasks` comes from the checklist data (see lib/landing-card-tasks.ts); a route without
 * an entry shows the card's general arrival checklist.
 */
export default function LandingHero({ cardTasks }: { cardTasks?: Partial<Record<HeroRoute, RoadmapTask[]>> }) {
  const { route: persona, setRoute: setPersona } = useHeroRoute();
  const p = PERSONAS[persona];
  const [before, after] = p.headline.split(p.accent);

  return (
    <MotionConfig reducedMotion="user">
      <div className="max-w-6xl mx-auto relative grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center pb-16">
        <div className="text-center lg:text-left min-w-0">

          {/* Route picker */}
          <div role="group" aria-label="Choose your visa route"
            className="flex flex-wrap gap-1.5 mb-6 justify-center lg:justify-start">
            {PERSONA_ORDER.map((key) => {
              const { label, Icon } = PERSONAS[key];
              const active = persona === key;
              return (
                <button key={key} type="button" onClick={() => setPersona(key)} aria-pressed={active}
                  className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border shrink-0 transition-colors"
                  style={{
                    background: active ? "var(--color-navy)" : "rgba(255,255,255,0.6)",
                    borderColor: active ? "var(--color-navy)" : "var(--color-border)",
                    color: active ? "#fff" : "var(--color-muted)",
                  }}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Headline: fixed min-height so switching routes doesn't make the page jump */}
          <div className="mb-6 min-h-[5rem] sm:min-h-[4.5rem] lg:min-h-[7rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.h1 key={persona}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] leading-[1.08]"
                style={{ color: "var(--color-navy)" }}>
                {before}
                <span style={{ background: "var(--gradient-vivid)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {p.accent}
                </span>
                {after}
              </motion.h1>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={`sub-${persona}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
              style={{ color: "var(--color-muted)" }}>
              {p.sub}
            </motion.p>
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link href="/signup" className="btn-primary text-base px-8 py-3.5 justify-center">
              Create your free roadmap
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/routes" className="btn-ghost text-base px-8 py-3.5 justify-center">
              Browse guidance articles
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto lg:mx-0">
            {p.stats.map((s, i) => (
              <div key={`${persona}-${i}`} className="text-center lg:text-left">
                <p className="font-display text-2xl font-bold"
                  style={{ color: i === 2 ? "var(--color-coral)" : "var(--color-teal)" }}>
                  <AnimatedNumber value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`card-${persona}`}
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}>
            <RoadmapPreviewCard location={p.cardLocation} tasks={cardTasks?.[persona]} />
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
