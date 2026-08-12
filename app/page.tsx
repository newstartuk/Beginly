"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring,
} from "framer-motion";
import {
  CheckCircle, Bell, AlertTriangle, BookOpen, ArrowRight, Scale,
  Target, Shield, Quote, GraduationCap, Briefcase, Heart, XCircle, MapPin,
  Award, Star, Stethoscope,
} from "lucide-react";
import Disclaimer from "@/components/Disclaimer";
import Logo from "@/components/Logo";
import NiaIcon from "@/components/NiaIcon";
import RoadmapPreviewCard from "@/components/RoadmapPreviewCard";

/* ─── Motion presets ─────────────────────────────────────────────── */
const EASE_OUT = [0.16, 0.8, 0.3, 1] as const;
const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};
const revealItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

/* ─── Persona data ───────────────────────────────────────────────── */
type Persona = "student" | "worker" | "family" | "graduate" | "talent" | "health";
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
    label: "Student",
    Icon: GraduationCap,
    headline: "Your student visa journey, mapped from day one.",
    accent: "student visa journey,",
    sub: "From university registration to bank accounts and SIM cards — your 90-day checklist is built around your course start date, city, and UKCISA rights.",
    stats: [
      { value: 32, suffix: "+", label: "Student tasks" },
      { value: 15, suffix: "+", label: "Visa guides" },
      { value: 90, suffix: "", label: "Day roadmap" },
    ],
    cardLocation: "Manchester · Student · CAS holder",
  },
  worker: {
    label: "Skilled Worker",
    Icon: Briefcase,
    headline: "Your Skilled Worker route, step by step.",
    accent: "Skilled Worker route,",
    sub: "RTW checks, NI number, bank account, GP registration — everything your employer expects, sorted before your first day in the office.",
    stats: [
      { value: 45, suffix: "+", label: "Work tasks" },
      { value: 20, suffix: "+", label: "Work guides" },
      { value: 90, suffix: "", label: "Day roadmap" },
    ],
    cardLocation: "London · Skilled Worker · Tier 2",
  },
  family: {
    label: "Family Visa",
    Icon: Heart,
    headline: "Settling your family in the UK, without the guesswork.",
    accent: "family in the UK,",
    sub: "School places, GP registration for children, Council Tax, dependent visa conditions — your family's checklist, in the right order, for each person.",
    stats: [
      { value: 38, suffix: "+", label: "Family tasks" },
      { value: 18, suffix: "+", label: "Family guides" },
      { value: 90, suffix: "", label: "Day roadmap" },
    ],
    cardLocation: "Birmingham · Family visa · 3 dependents",
  },
  graduate: {
    label: "Graduate",
    Icon: Award,
    headline: "Stay and thrive after your degree — your Graduate route.",
    accent: "Graduate route.",
    sub: "Switched from Student to Graduate visa? Your checklist covers right to work, employer registration, NI number top-up, and what changes the day your CAS expires.",
    stats: [
      { value: 28, suffix: "+", label: "Graduate tasks" },
      { value: 12, suffix: "+", label: "Route guides" },
      { value: 90, suffix: "", label: "Day roadmap" },
    ],
    cardLocation: "London · Graduate visa · 2 years",
  },
  talent: {
    label: "Global Talent",
    Icon: Star,
    headline: "Your Global Talent visa — exceptional people, clear path.",
    accent: "Global Talent visa —",
    sub: "Endorsed by Tech Nation, the Royal Academy, or the British Academy? Your roadmap covers endorsement conditions, flexible working rights, and your route to settlement.",
    stats: [
      { value: 30, suffix: "+", label: "Talent tasks" },
      { value: 14, suffix: "+", label: "Visa guides" },
      { value: 90, suffix: "", label: "Day roadmap" },
    ],
    cardLocation: "London · Global Talent · Tech Nation",
  },
  health: {
    label: "Health & Care",
    Icon: Stethoscope,
    headline: "Your Health & Care Worker route, from arrival to ward.",
    accent: "Health & Care Worker route,",
    sub: "NMC or GMC registration, NHS trust right-to-work, BRP collection, and mandatory training — your 90-day plan for clinical and care workers arriving in the UK.",
    stats: [
      { value: 35, suffix: "+", label: "Health tasks" },
      { value: 16, suffix: "+", label: "NHS guides" },
      { value: 90, suffix: "", label: "Day roadmap" },
    ],
    cardLocation: "Birmingham · Health & Care · NHS Trust",
  },
};

/* ─── City ticker ────────────────────────────────────────────────── */
const JOURNEYS = [
  "🇳🇬 Lagos → Manchester", "🇨🇳 Beijing → London", "🇮🇳 Mumbai → Birmingham",
  "🇰🇪 Nairobi → Edinburgh", "🇮🇳 Delhi → Leicester", "🇵🇭 Manila → Bristol",
  "🇬🇭 Accra → Sheffield", "🇵🇰 Karachi → Leeds", "🇧🇩 Dhaka → Liverpool",
  "🇱🇰 Colombo → Coventry", "🇲🇾 Kuala Lumpur → Nottingham", "🇧🇷 São Paulo → Newcastle",
  "🇰🇷 Seoul → Glasgow", "🇻🇳 Hanoi → Cardiff", "🇹🇿 Dar es Salaam → Leeds",
];

/* ─── Features ───────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Target,
    title: "Your Personal 90-Day Roadmap",
    desc: "A checklist built around your arrival date, city, and situation — not generic advice that doesn't apply to you.",
    iconColor: "#fff",
    iconBg: "rgba(255,255,255,0.12)",
    wide: true,
    dark: true,
  },
  {
    icon: BookOpen,
    title: "Plain-English Guidance",
    desc: "20+ articles written in clear, calm English — what to do, why it matters, and exactly what to avoid.",
    iconColor: "var(--color-violet)",
    iconBg: "var(--color-violet-light)",
    wide: false,
    dark: false,
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    desc: "Set reminders for the tasks that matter most. We help you stay on track without overwhelm.",
    iconColor: "var(--color-gold)",
    iconBg: "var(--color-amber-light)",
    wide: false,
    dark: false,
  },
  {
    icon: AlertTriangle,
    title: "Scam & Mistake Alerts",
    desc: "Regular alerts on the scams targeting newcomers — so you can spot danger before you fall for it.",
    iconColor: "var(--color-red)",
    iconBg: "var(--color-red-light)",
    wide: false,
    dark: false,
  },
  {
    icon: Shield,
    title: "Trusted & Compliant",
    desc: "We signpost official sources so you can make informed decisions. Not advice — always guidance.",
    iconColor: "var(--color-teal)",
    iconBg: "var(--color-teal-50)",
    wide: false,
    dark: false,
  },
  {
    icon: NiaIcon,
    title: "Nia — Document Helper",
    desc: "Nia explains tenancy agreements, NHS letters, and council tax forms in plain English.",
    iconColor: "var(--color-coral)",
    iconBg: "rgba(255,115,88,0.1)",
    wide: true,
    dark: false,
  },
];

/* ─── How it works ───────────────────────────────────────────────── */
const HOW_IT_WORKS = [
  { num: "01", title: "Tell us about yourself", desc: "Your city, accommodation, university, and arrival date — it takes 2 minutes.", color: "var(--color-teal)", bg: "var(--color-teal-50)" },
  { num: "02", title: "Get your personalised roadmap", desc: "A clear 90-day checklist built around your exact situation and stage.", color: "var(--color-violet)", bg: "var(--color-violet-light)" },
  { num: "03", title: "Track your progress", desc: "Mark tasks done, get guidance, and watch your UK Readiness Score rise.", color: "var(--color-gold)", bg: "var(--color-amber-light)" },
  { num: "04", title: "Settle in confidently", desc: "Avoid the common mistakes, know your rights, and build your new life with clarity.", color: "var(--color-green)", bg: "var(--color-green-light)" },
];

/* ─── Testimonials ───────────────────────────────────────────────── */
const TESTIMONIALS = [
  { quote: "I'd been Googling for weeks and getting nowhere. Beginly gave me a clear list of exactly what to do and in what order. The bank account task alone saved me two weeks of confusion.", name: "Amara O.", detail: "Student · 🇳🇬 Lagos → Manchester", initial: "A", color: "var(--color-teal)", bg: "var(--color-teal-50)" },
  { quote: "The scam alerts are genuinely useful. I nearly fell for a fake letting agency within my first week. Beginly flagged that exact type of scam and I knew what to look for.", name: "Wei L.", detail: "Software Engineer · 🇨🇳 Beijing → London", initial: "W", color: "var(--color-violet)", bg: "var(--color-violet-light)" },
  { quote: "As an NHS worker arriving mid-year, I didn't know where to start with council tax, GP registration, or a UK bank. Beginly walked me through everything step by step.", name: "Priya S.", detail: "NHS Worker · 🇮🇳 Mumbai → Birmingham", initial: "P", color: "var(--color-coral)", bg: "var(--color-coral-light)" },
];

/* ─── Quiz ───────────────────────────────────────────────────────── */
const QUIZ_QUESTIONS = [
  { q: "Do you have a UK bank account?", key: "bank" },
  { q: "Are you registered with a GP surgery?", key: "gp" },
  { q: "Have you applied for your National Insurance number?", key: "ni" },
];

/* ─── Scam cards ─────────────────────────────────────────────────── */
const SCAM_CARDS = [
  { id: 1, title: "2-bed flat, Stratford", price: "£1,100 / month", location: "Zone 4 · East London", details: ["Available 1 Feb 2026", "Agent: Connells Estate Agents", "References & credit check required", "In-person viewing arranged on request"], source: "Via Rightmove", isScam: false },
  { id: 2, title: "Stunning 1-bed, Central London", price: "£595 / month", location: "Zone 1 · Mayfair", details: ["Available immediately", "Landlord currently abroad — can't meet", "Pay 2 months' deposit via Western Union", "Keys sent by post once payment received"], source: "Direct from landlord", isScam: true },
  { id: 3, title: "Room in shared house", price: "£650 / month", location: "Manchester City Centre", details: ["3 working professionals, very friendly", "Meet the house first — viewing encouraged", "ANUK certified accommodation", "References checked, move in anytime"], source: "Via SpareRoom", isScam: false },
];

/* ─── New data: city messages ────────────────────────────────────── */
const CITY_MESSAGES: Record<string, string> = {
  manchester: "Manchester checklist ready — 14 student tasks, council tax exemption included.",
  london: "London roadmap ready — Oyster card setup, 18 tasks across 4 zones.",
  birmingham: "Birmingham checklist ready — NHS trust links, council guide included.",
  edinburgh: "Edinburgh roadmap ready — SAAS funding guide, 16 tasks.",
  bristol: "Bristol checklist ready — local council guide, transport setup.",
  leeds: "Leeds checklist ready — student quarter guide, 15 tasks.",
  sheffield: "Sheffield checklist ready — student union resources, 14 tasks.",
  liverpool: "Liverpool checklist ready — NHS trust, council guide, 15 tasks.",
  coventry: "Coventry checklist ready — University contacts, 13 tasks.",
  nottingham: "Nottingham checklist ready — student housing guide, 14 tasks.",
};

/* ─── New data: chaos positions (pre-computed) ───────────────────── */
const CHAOS_POSITIONS = [
  { left: 8, top: 4, rotate: -7, bg: "#EFF6FF", text: "#1D4ED8", label: "GOV.UK" },
  { left: 148, top: 0, rotate: 4, bg: "#FEF3C7", text: "#92400E", label: "NHS.UK" },
  { left: 278, top: 6, rotate: -3, bg: "#FEE2E2", text: "#991B1B", label: "HMRC" },
  { left: 18, top: 88, rotate: 6, bg: "#F0FDF4", text: "#166534", label: "UCAS.com" },
  { left: 158, top: 82, rotate: -5, bg: "#FDF4FF", text: "#6B21A8", label: "Student Finance" },
  { left: 285, top: 90, rotate: 3, bg: "#FFF7ED", text: "#9A3412", label: "Council Tax" },
];

/* ─── New data: timeline phases ─────────────────────────────────── */
const TIMELINE_PHASES = [
  { period: "Days 1–7", color: "var(--color-coral)", tasks: ["SIM card & mobile number", "Temporary accommodation confirmed", "University enrolment", "Bank account application"] },
  { period: "Weeks 2–4", color: "var(--color-gold)", tasks: ["National Insurance number", "GP surgery registration", "Student Finance submitted", "UKCISA rights confirmed"] },
  { period: "Month 2", color: "var(--color-teal)", tasks: ["Council Tax exemption letter", "Library & campus card", "Transport card (Oyster etc)", "Local essentials mapped"] },
  { period: "Month 3", color: "var(--color-green)", tasks: ["Biometric Residence Permit", "Part-time work paperwork", "NHS check-up booked", "Readiness Score: 100%"] },
];

/* ═══════════════════════════════════════════════════════════════════
   TIER 3 #15 — Scroll progress indicator
═══════════════════════════════════════════════════════════════════ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 2,
        scaleX, transformOrigin: "left",
        background: "var(--color-coral)", zIndex: 200,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TIER 3 #11 — Canvas ambient background
═══════════════════════════════════════════════════════════════════ */
function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const parent = canvas.parentElement!;
    let W = parent.offsetWidth;
    let H = parent.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const NAVY = [7, 27, 52];
    const CORAL = [255, 115, 88];
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.8 + 0.7,
      color: Math.random() > 0.65 ? CORAL : NAVY,
      opacity: Math.random() * 0.14 + 0.04,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) { p.vx += (dx / dist) * 0.01; p.vy += (dy / dist) * 0.01; }
        p.vx *= 0.97; p.vy *= 0.97;
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.join(",")},${p.opacity})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      W = parent.offsetWidth; H = parent.offsetHeight;
      canvas.width = W; canvas.height = H;
    };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    window.addEventListener("resize", onResize);
    parent.addEventListener("mousemove", onMove);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); parent.removeEventListener("mousemove", onMove); };
  }, []);

  return (
    <canvas ref={canvasRef} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TIER 2 #10 — Magnetic CTA button
═══════════════════════════════════════════════════════════════════ */
function MagneticButton({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 22 });
  const sy = useSpring(y, { stiffness: 200, damping: 22 });
  return (
    <motion.div
      style={{ x: sx, y: sy, display: "inline-flex" }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.32);
        y.set((e.clientY - r.top - r.height / 2) * 0.32);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TIER 1 #5 — Wave section dividers
═══════════════════════════════════════════════════════════════════ */
function WaveDivider({ flip = false, from = "var(--color-white)", to = "var(--color-mist)" }: {
  flip?: boolean; from?: string; to?: string;
}) {
  return (
    <div style={{ background: from, lineHeight: 0 }}>
      <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", transform: flip ? "scaleX(-1)" : undefined }}
        aria-hidden preserveAspectRatio="none">
        <path d="M0 28 C360 0 720 56 1080 28 C1260 14 1350 42 1440 28 L1440 56 L0 56 Z" fill={to} />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TIER 1 #3 — Animated counter
═══════════════════════════════════════════════════════════════════ */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let cur = 0;
      const step = value / 38;
      const id = setInterval(() => {
        cur = Math.min(cur + step, value);
        setDisplay(Math.round(cur));
        if (cur >= value) clearInterval(id);
      }, 28);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref}>{display}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════════════
   TIER 3 #14 — Before / After chaos toggle
═══════════════════════════════════════════════════════════════════ */
function BeforeAfterToggle() {
  const [mode, setMode] = useState<"chaos" | "order">("chaos");
  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-5">
        {(["chaos", "order"] as const).map((m) => (
          <motion.button key={m} onClick={() => setMode(m)}
            className="text-xs font-bold px-3.5 py-1.5 rounded-full border"
            style={{
              background: mode === m ? (m === "chaos" ? "var(--color-red)" : "var(--color-green)") : "transparent",
              borderColor: mode === m ? "transparent" : "var(--color-border)",
              color: mode === m ? "white" : "var(--color-muted)",
            }}
            whileHover={{ scale: 1.07, y: -1, boxShadow: mode === m ? "0 6px 18px rgba(0,0,0,0.18)" : "0 4px 12px rgba(0,0,0,0.08)" }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}>
            {m === "chaos" ? "Before Beginly" : "With Beginly"}
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {mode === "chaos" ? (
          <motion.div key="chaos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }} style={{ position: "relative", height: 148, width: "100%" }}>
            {CHAOS_POSITIONS.map((p, i) => (
              <motion.div key={p.label}
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  position: "absolute", left: p.left, top: p.top, rotate: `${p.rotate}deg`,
                  background: p.bg, border: "1px solid rgba(0,0,0,0.07)", borderRadius: 5,
                  padding: "4px 9px", fontSize: 10, fontWeight: 700, color: p.text,
                  whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                }}>
                {p.label}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="order" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }} className="space-y-2">
            {["Bank account application", "SIM card & mobile number", "GP surgery registration"].map((item, i) => (
              <motion.div key={item} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.09 }}
                className="flex items-center gap-2 text-xs font-semibold rounded-lg px-3 py-2.5"
                style={{ background: "rgba(22,179,166,0.08)", color: "var(--color-teal)" }}>
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                {item}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TIER 2 #6 — Full-width editorial pull quote
═══════════════════════════════════════════════════════════════════ */
function EditorialQuote() {
  return (
    <motion.section className="py-20 px-6" style={{ background: "var(--color-navy)" }}
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.55 }}>
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-display text-2xl sm:text-4xl italic leading-snug mb-8 text-white" style={{ lineHeight: 1.35 }}>
          &ldquo;Beginly gave me a clear list of exactly what to do and in what order. The bank account task alone saved me two weeks of confusion.&rdquo;
        </p>
        <div className="flex items-center justify-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: "var(--color-teal)" }}>A</div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Amara O.</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Student · 🇳🇬 Lagos → Manchester</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TIER 3 #13 — Timeline roadmap
═══════════════════════════════════════════════════════════════════ */
function TimelineSection() {
  return (
    <section className="py-14 px-6" style={{ background: "var(--color-warm-neutral)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-coral)" }}>
            Your 90-day plan
          </p>
          <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-navy)" }}>
            Everything, in the right order.
          </h2>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 justify-start sm:justify-center" style={{ scrollbarWidth: "none" }}>
          {TIMELINE_PHASES.map((phase, i) => (
            <motion.div key={phase.period}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
              className="shrink-0 rounded-2xl p-6 bg-white border"
              style={{ width: 218, borderColor: "var(--color-border)", boxShadow: "var(--shadow-card)" }}>
              <div className="text-xs font-bold px-3 py-1 rounded-full inline-block mb-4"
                style={{ background: phase.color + "1a", color: phase.color }}>
                {phase.period}
              </div>
              <div className="space-y-2.5">
                {phase.tasks.map((task, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: phase.color }} />
                    <p className="text-xs leading-snug" style={{ color: "var(--color-navy)" }}>{task}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs mt-3" style={{ color: "var(--color-muted-light)" }}>
          Scroll to see full 90-day timeline →
        </p>
      </div>
    </section>
  );
}

/* ─── City Ticker ────────────────────────────────────────────────── */
function CityTicker() {
  const doubled = [...JOURNEYS, ...JOURNEYS];
  return (
    <div className="relative z-10">
      <p
        className="text-center text-[11px] font-bold uppercase tracking-widest mb-3"
        style={{ color: "var(--color-teal)" }}
      >
        Wherever you&apos;re coming from, we can help you settle...
      </p>
      <div className="overflow-hidden py-3 border-y" style={{ borderColor: "rgba(22,179,166,0.15)" }} aria-hidden>
        <div style={{ display: "flex", width: "max-content", animation: "ticker-scroll 38s linear infinite" }}>
          {doubled.map((j, i) => (
            <span key={i} className="text-xs font-medium"
              style={{ padding: "0 2.25rem", whiteSpace: "nowrap", color: "var(--color-muted)" }}>
              {j}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Open Door Section ──────────────────────────────────────────── */
function OpenDoorSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotateY = useTransform(scrollYProgress, [0.1, 0.75], [0, -76]);
  const lightOpacity = useTransform(scrollYProgress, [0.1, 0.7], [0, 1]);
  const taglineOpacity = useTransform(scrollYProgress, [0.45, 0.75], [0, 1]);
  const taglineY = useTransform(scrollYProgress, [0.45, 0.75], [18, 0]);
  return (
    <section ref={ref} className="py-14 px-6 flex flex-col items-center justify-center"
      style={{ background: "var(--color-warm-neutral)", minHeight: "55vh" }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-14" style={{ color: "var(--color-muted)" }}>
        Open Door, Wider World
      </p>
      <div style={{ perspective: "1100px", perspectiveOrigin: "50% 50%" }}>
        <div style={{ position: "relative", width: 148, height: 228, border: "3px solid var(--color-navy)", borderRadius: "50% 50% 0 0 / 14% 14% 0 0", boxShadow: "0 24px 56px rgba(13,27,42,0.18)" }}>
          <motion.div style={{ position: "absolute", inset: 0, borderRadius: "inherit", background: "radial-gradient(ellipse at 50% 90%, #FFB547 0%, #FF7A59 38%, transparent 72%)", opacity: lightOpacity }} />
          <motion.div style={{ position: "absolute", inset: 0, background: "var(--color-navy)", transformOrigin: "0% 50%", rotateY, borderRadius: "inherit" }}>
            <div style={{ position: "absolute", top: 14, left: 10, right: 10, bottom: 12, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "42% 42% 0 0 / 10% 10% 0 0" }} />
            <div style={{ position: "absolute", right: 18, top: "54%", width: 10, height: 10, borderRadius: "50%", background: "var(--color-gold)", transform: "translateY(-50%)", boxShadow: "0 2px 6px rgba(232,185,93,0.5)" }} />
          </motion.div>
        </div>
      </div>
      <motion.p className="mt-14 font-display text-2xl sm:text-3xl text-center" style={{ color: "var(--color-navy)", opacity: taglineOpacity, y: taglineY }}>
        Open what comes next.
      </motion.p>
      <motion.p className="mt-3 text-sm text-center max-w-xs leading-relaxed" style={{ color: "var(--color-muted)", opacity: taglineOpacity }}>
        Beginly opens the door to your new life in the UK — one clear step at a time.
      </motion.p>
    </section>
  );
}

/* ─── Readiness Gauge ────────────────────────────────────────────── */
const GAUGE_R = 54;
const GAUGE_C = Math.PI * GAUGE_R;
const GAUGE_PATH = "M 26,72 A 54,54 0 0 1 134,72";

function ReadinessGauge() {
  const [qIndex, setQIndex] = useState(-1);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const started = qIndex >= 0;
  const done = qIndex >= QUIZ_QUESTIONS.length;
  const score = answers.filter(Boolean).length;
  const displayScore = done ? score : answers.length;
  const dashOffset = GAUGE_C * (1 - displayScore / 3);
  const handleAnswer = (yes: boolean) => { setAnswers((p) => [...p, yes]); setQIndex((i) => i + 1); };
  const reset = () => { setQIndex(-1); setAnswers([]); };
  const currentQ = !done && started ? QUIZ_QUESTIONS[qIndex] : null;
  return (
    <section className="py-20 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-teal)" }}>How ready are you?</p>
        <h2 className="font-display text-2xl sm:text-3xl mb-3" style={{ color: "var(--color-navy)" }}>Check your UK readiness in 30 seconds.</h2>
        <p className="text-sm mb-10" style={{ color: "var(--color-muted)" }}>Three quick questions — then we'll show you where Beginly fills the gaps.</p>
        <div className="flex justify-center mb-8">
          <svg width="160" height="90" viewBox="0 0 160 90" aria-hidden>
            <path d={GAUGE_PATH} fill="none" stroke="var(--color-border)" strokeWidth="11" strokeLinecap="round" />
            <motion.path d={GAUGE_PATH} fill="none" stroke="var(--color-coral)" strokeWidth="11" strokeLinecap="round"
              strokeDasharray={GAUGE_C} animate={{ strokeDashoffset: dashOffset }} transition={{ duration: 0.55, ease: "easeOut" }} />
            <text x="80" y="68" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--color-navy)" fontFamily="inherit">{displayScore}/3</text>
          </svg>
        </div>
        <AnimatePresence mode="wait">
          {!started && (
            <motion.div key="intro" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <button onClick={() => setQIndex(0)} className="btn-primary px-8 py-3 text-sm">Check my readiness <ArrowRight className="w-4 h-4" /></button>
            </motion.div>
          )}
          {currentQ && (
            <motion.div key={`q-${qIndex}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }} className="space-y-4">
              <p className="font-semibold text-base mb-6" style={{ color: "var(--color-navy)" }}>{currentQ.q}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => handleAnswer(true)} className="px-8 py-2.5 rounded-full text-sm font-semibold border transition-all" style={{ borderColor: "var(--color-teal)", color: "var(--color-teal)" }}>Yes</button>
                <button onClick={() => handleAnswer(false)} className="px-8 py-2.5 rounded-full text-sm font-semibold border transition-all" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>Not yet</button>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--color-muted-light)" }}>Question {qIndex + 1} of {QUIZ_QUESTIONS.length}</p>
            </motion.div>
          )}
          {done && (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
              {score === 3 ? (
                <p className="font-semibold text-base" style={{ color: "var(--color-green)" }}>You're well set up — but there are still 37+ tasks Beginly can track for you.</p>
              ) : (
                <p className="font-semibold text-base" style={{ color: "var(--color-navy)" }}>{3 - score} of those {3 - score === 1 ? "step is" : "steps are"} missing — Beginly covers {3 - score === 1 ? "it" : "all of them"}, plus 40+ more.</p>
              )}
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/signup" className="btn-primary text-sm px-8 py-3">Build my roadmap <ArrowRight className="w-4 h-4" /></Link>
                <button onClick={reset} className="text-xs underline" style={{ color: "var(--color-muted)" }}>Start over</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─── Scam Game ──────────────────────────────────────────────────── */
function ScamGame() {
  const [selected, setSelected] = useState<number | null>(null);
  const revealed = selected !== null;
  const scamId = SCAM_CARDS.find((c) => c.isScam)!.id;
  const pickedScam = selected === scamId;
  const reset = () => setSelected(null);
  return (
    <section className="py-20 px-6" style={{ background: "var(--color-mist)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-coral)" }}>Scam awareness</p>
          <h2 className="font-display text-2xl sm:text-3xl mb-3" style={{ color: "var(--color-navy)" }}>Think like a newcomer — spot the scam.</h2>
          <p className="text-sm max-w-xl mx-auto" style={{ color: "var(--color-muted)" }}>One of these three rental listings is fake. Thousands of newcomers lose money to listings just like it every year. Can you spot it?</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          {SCAM_CARDS.map((card) => {
            const isScamCard = card.isScam;
            return (
              <motion.button key={card.id} onClick={() => !revealed && setSelected(card.id)} disabled={revealed}
                className="text-left rounded-2xl overflow-hidden border transition-all relative"
                style={{ borderColor: revealed ? isScamCard ? "#FECACA" : "rgba(22,179,166,0.3)" : selected === card.id ? "var(--color-coral)" : "var(--color-border)", background: "var(--color-white)", boxShadow: "var(--shadow-card)", cursor: revealed ? "default" : "pointer" }}
                whileHover={!revealed ? { y: -3, boxShadow: "0 8px 24px rgba(13,27,42,0.12)" } : {}}
                whileTap={!revealed ? { scale: 0.98 } : {}}>
                <div className="h-32 relative" style={{ background: card.isScam ? "linear-gradient(135deg,#FEE2E2,#FECACA)" : "linear-gradient(135deg,var(--color-teal-50),var(--color-teal-100))" }}>
                  <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.9)", color: "var(--color-navy)" }}>RENTAL</span>
                  <AnimatePresence>
                    {revealed && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center"
                        style={{ background: isScamCard ? "rgba(220,38,38,0.85)" : "rgba(31,163,106,0.82)" }}>
                        {isScamCard ? (
                          <div className="text-center text-white"><XCircle className="w-8 h-8 mx-auto mb-1" /><span className="text-xs font-bold uppercase tracking-widest">Scam</span></div>
                        ) : (
                          <div className="text-center text-white"><CheckCircle className="w-8 h-8 mx-auto mb-1" /><span className="text-xs font-bold uppercase tracking-widest">Legitimate</span></div>
                        )}
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
                    {card.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <span className="mt-0.5 shrink-0" style={{ color: revealed && card.isScam && i >= 1 ? "var(--color-red)" : "var(--color-muted-light)" }}>{revealed && card.isScam && i >= 1 ? "⚠" : "·"}</span>
                        <span style={{ color: "var(--color-muted)" }}>{d}</span>
                      </li>
                    ))}
                  </ul>
                  <span className="text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>{card.source}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {revealed && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
              className="rounded-2xl p-6 text-center max-w-2xl mx-auto border"
              style={{ background: pickedScam ? "var(--color-green-light)" : "var(--color-red-light)", borderColor: pickedScam ? "rgba(31,163,106,0.25)" : "#FECACA" }}>
              {pickedScam ? (
                <>
                  <p className="font-bold text-base mb-2" style={{ color: "var(--color-green)" }}>You spotted it.</p>
                  <p className="text-sm mb-4" style={{ color: "#166534" }}>Three red flags: Zone 1 London at £595 (market rate is £1,800+), landlord can't meet in person, and Western Union payment. Nia flags all three instantly.</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-base mb-2" style={{ color: "var(--color-red)" }}>Not quite — listing 2 is the scam.</p>
                  <p className="text-sm mb-4" style={{ color: "#991B1B" }}>Three red flags: Zone 1 London at £595 (market rate is £1,800+), landlord can't meet in person, and Western Union payment. Most newcomers miss at least one of these.</p>
                </>
              )}
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/signup" className="btn-primary text-sm px-7 py-2.5">Set up my scam alerts <ArrowRight className="w-4 h-4" /></Link>
                <button onClick={reset} className="text-xs underline" style={{ color: "var(--color-muted)" }}>Try again</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!revealed && <p className="text-center text-xs mt-2" style={{ color: "var(--color-muted-light)" }}>Click the listing you think is a scam.</p>}
      </div>
    </section>
  );
}

/* ─── Nia landing demo data ──────────────────────────────────────── */
const NIA_DEMOS = [
  {
    q: "What is a Biometric Residence Permit?",
    a: "Your BRP is the official UK residence card that proves your right to live, work, and study here. Collect it within 10 days of arriving — usually from a designated post office. You'll need it to open a bank account, register with a GP, and every time you re-enter the UK.",
    tag: "Immigration",
    tagColor: "var(--color-teal)",
  },
  {
    q: "My landlord sent a Section 21 notice — what does it mean?",
    a: "Section 21 is a 'no-fault eviction'. Your landlord can ask you to leave without giving a reason, but must give at least 2 months' written notice. You don't have to leave before the deadline — and if your deposit wasn't protected in a government scheme, the notice may be invalid.",
    tag: "Housing",
    tagColor: "var(--color-coral)",
  },
  {
    q: "What does 'right to work check' mean for my new job?",
    a: "Before your first shift, your employer must verify you have the legal right to work in the UK. They'll check your BRP, passport, or a Home Office online share code. It's a legal requirement — nothing to worry about if your visa is current and in order.",
    tag: "Employment",
    tagColor: "var(--color-violet)",
  },
  {
    q: "How do I register with a GP when I've just arrived?",
    a: "Find a GP surgery near your address on NHS.uk and fill in their registration form — you don't need proof of immigration status and you cannot be refused registration just because you're new to the UK. You're entitled to NHS care from your first day here.",
    tag: "NHS",
    tagColor: "var(--color-green)",
  },
];

function NiaLandingSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % NIA_DEMOS.length), 5200);
    return () => clearInterval(id);
  }, []);

  const demo = NIA_DEMOS[active];

  return (
    <section className="py-20 px-6" style={{ background: "var(--color-white)" }}>
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <motion.div className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-coral)" }}>
            Document Helper
          </p>
          <h2 className="font-display text-2xl sm:text-3xl mb-3" style={{ color: "var(--color-navy)" }}>
            Meet Nia — plain English for every UK document.
          </h2>
          <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: "var(--color-muted)" }}>
            Tenancy agreements, NHS letters, HMRC forms, council tax bills — Nia reads them so you don&apos;t have to guess.
          </p>
        </motion.div>

        {/* Topic chips */}
        <div className="flex gap-2 flex-wrap justify-center mb-7">
          {NIA_DEMOS.map((d, i) => (
            <motion.button key={i} onClick={() => setActive(i)}
              className="text-xs font-bold px-3.5 py-1.5 rounded-full border"
              style={{
                background: active === i ? d.tagColor : "transparent",
                borderColor: active === i ? d.tagColor : "var(--color-border)",
                color: active === i ? "white" : "var(--color-muted)",
              }}
              whileHover={{ scale: 1.06, y: -1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}>
              {d.tag}
            </motion.button>
          ))}
        </div>

        {/* Chat card */}
        <motion.div className="rounded-3xl overflow-hidden border"
          style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-card)" }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4"
            style={{ background: "var(--color-navy)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--color-coral)" }}>
              <NiaIcon size={18} style={{ color: "white" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Nia</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>Document & Settlement Guide</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="relative inline-flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{ background: "var(--color-green)" }} />
                <span className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: "var(--color-green)" }} />
              </span>
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="px-5 pt-5 pb-4 space-y-4 min-h-[200px]"
            style={{ background: "var(--color-mist)" }}>
            <AnimatePresence mode="wait">
              <motion.div key={`q-${active}`}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }}
                className="flex justify-end">
                <div className="max-w-[78%] text-xs leading-relaxed px-4 py-2.5 rounded-2xl rounded-br-sm"
                  style={{ background: "var(--color-navy)", color: "white" }}>
                  {demo.q}
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div key={`a-${active}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.32, delay: 0.12 }}
                className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "var(--color-coral)" }}>
                  <NiaIcon size={14} style={{ color: "white" }} />
                </div>
                <div className="flex-1 text-xs leading-relaxed px-4 py-3 rounded-2xl rounded-tl-sm"
                  style={{ background: "white", color: "var(--color-navy)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                  {demo.a}
                  <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: demo.tagColor + "18", color: demo.tagColor }}>
                    {demo.tag}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Fake input + CTA */}
          <div className="px-5 py-4 flex items-center gap-3 border-t"
            style={{ background: "white", borderColor: "var(--color-border)" }}>
            <div className="flex-1 text-xs px-4 py-2.5 rounded-full border"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted-light)", userSelect: "none" }}>
              Ask Nia about any UK document or form…
            </div>
            <Link href="/signup" className="btn-primary text-xs px-4 py-2.5 shrink-0">
              Try Nia <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-5">
          {NIA_DEMOS.map((_, i) => (
            <motion.button key={i} onClick={() => setActive(i)}
              className="rounded-full h-1.5"
              animate={{ width: active === i ? 20 : 6, background: active === i ? "var(--color-coral)" : "var(--color-border)" }}
              transition={{ duration: 0.3 }}
              aria-label={`Demo ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [persona, setPersona] = useState<Persona>("student");
  const [cityInput, setCityInput] = useState("");
  const heroRef = useRef<HTMLElement>(null);

  // TIER 2 #9 — Scroll parallax in hero
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const headlineY = useTransform(heroScroll, [0, 1], [0, -55]);
  const subY = useTransform(heroScroll, [0, 1], [0, -28]);

  const p = PERSONAS[persona];
  const cityKey = cityInput.toLowerCase().trim();
  const cityMessage = CITY_MESSAGES[cityKey] ?? null;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--color-white)" }}>

      {/* TIER 3 #15 — Scroll progress */}
      <ScrollProgress />

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderColor: "var(--color-border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <span className="block sm:hidden"><Logo variant="lockup" size={38} /></span>
          <span className="hidden sm:block"><Logo variant="lockup" size={52} tagline /></span>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <Link href="/login" className="btn-ghost text-sm py-1.5 px-4">Sign in</Link>
            </div>
            <MagneticButton>
              <Link href="/signup" className="btn-primary text-sm py-1.5 px-4">Get started free</Link>
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative overflow-hidden pt-14 pb-0 px-6"
        style={{ background: "var(--gradient-hero)" }}>

        {/* TIER 3 #11 — Canvas ambient background */}
        <CanvasBackground />

        {/* TIER 1 #2 — Noise / grain texture */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.038, mixBlendMode: "overlay",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "220px 220px",
        }} />

        {/* Orbs */}
        <div className="absolute rounded-full pointer-events-none" style={{ width: 420, height: 420, opacity: 0.15, background: "radial-gradient(circle, var(--color-teal) 0%, transparent 70%)", top: -120, right: -120, zIndex: 2 }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 300, height: 300, opacity: 0.09, background: "radial-gradient(circle, var(--color-coral) 0%, transparent 70%)", bottom: 60, left: -80, zIndex: 2 }} />

        <div className="max-w-6xl mx-auto relative grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center pb-20" style={{ zIndex: 3 }}>
          <motion.div className="text-center lg:text-left min-w-0" variants={heroContainer} initial="hidden" animate="show">

            {/* TIER 1 #4 — Live social proof badge */}
            {/* Disabled: Live social proof badge. Re-enable when real-time user stats are ready for launch. */}
            {/* <motion.div variants={heroItem} className="inline-flex items-center gap-2 mb-3 text-xs font-semibold px-4 py-2 rounded-full"
              style={{ background: "rgba(31,163,106,0.07)", border: "1px solid rgba(31,163,106,0.2)", color: "#166534" }}>
              <span className="relative inline-flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "var(--color-green)" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--color-green)" }} />
              </span>
              1,200+ newcomers settled this month
            </motion.div> */}

            {/* Trust badge */}
            <motion.div variants={heroItem} className="inline-flex items-center gap-1.5 mb-5 text-xs font-semibold px-4 py-1.5 rounded-full border"
              style={{ background: "rgba(22,179,166,0.06)", borderColor: "rgba(22,179,166,0.22)", color: "var(--color-teal)" }}>
              <CheckCircle className="w-3.5 h-3.5" />
              Free guide for everyone arriving in the UK
            </motion.div>

            {/* Persona chips */}
            <motion.div variants={heroItem}
              className="flex gap-1.5 flex-nowrap mb-6 overflow-x-auto justify-start lg:justify-start"
              style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", paddingBottom: 2 }}>
              {(["student", "worker", "family", "graduate", "talent", "health"] as Persona[]).map((key) => {
                const { label, Icon } = PERSONAS[key];
                const active = persona === key;
                return (
                  <motion.button key={key} onClick={() => setPersona(key)}
                    className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border shrink-0"
                    style={{ background: active ? "var(--color-navy)" : "transparent", borderColor: active ? "var(--color-navy)" : "var(--color-border)", color: active ? "#fff" : "var(--color-muted)" }}
                    whileHover={{ scale: 1.07, y: -2, boxShadow: active ? "0 6px 18px rgba(7,27,52,0.28)" : "0 4px 12px rgba(7,27,52,0.1)" }}
                    whileTap={{ scale: 0.92 }}
                    animate={active ? { boxShadow: "0 4px 14px rgba(7,27,52,0.22)" } : { boxShadow: "0 0 0 rgba(0,0,0,0)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 24 }}>
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </motion.button>
                );
              })}
            </motion.div>

            {/* TIER 2 #9 — Parallax headline */}
            <motion.div style={{ y: headlineY }}>
              <div className="mb-6 min-h-[5rem] sm:min-h-[4.5rem] lg:min-h-[7rem] relative">
                <AnimatePresence mode="wait">
                  <motion.h1 key={persona}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] leading-[1.08]"
                    style={{ color: "var(--color-navy)" }}>
                    {p.headline.split(p.accent)[0]}
                    <span style={{ background: "var(--gradient-vivid)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {p.accent}
                    </span>
                    {p.headline.split(p.accent)[1]}
                  </motion.h1>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Sub with parallax */}
            <motion.div style={{ y: subY }}>
              <AnimatePresence mode="wait">
                <motion.p key={`sub-${persona}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-9 leading-relaxed"
                  style={{ color: "var(--color-muted)" }}>
                  {p.sub}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* CTAs — TIER 2 #10 magnetic */}
            <motion.div variants={heroItem} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <MagneticButton>
                <Link href="/signup" className="btn-primary text-base px-8 py-3.5 justify-center">
                  Create your roadmap — free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>
              <Link href="/routes" className="btn-ghost text-base px-8 py-3.5 justify-center">Browse guidance articles</Link>
            </motion.div>

            {/* TIER 3 #12 — City-specific preview */}
            <motion.div variants={heroItem} className="mt-6 max-w-xs mx-auto lg:mx-0">
              <div className="flex items-center gap-2 rounded-full border px-4 py-2"
                style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.7)" }}>
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-muted)" }} />
                <input type="text" placeholder="Which city are you moving to?"
                  value={cityInput} onChange={(e) => setCityInput(e.target.value)}
                  className="flex-1 bg-transparent text-xs outline-none"
                  style={{ color: "var(--color-navy)" }} />
              </div>
              <AnimatePresence>
                {cityMessage && (
                  <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-2 text-xs px-2" style={{ color: "var(--color-teal)" }}>
                    ✓ {cityMessage}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* TIER 1 #3 — Animated counter stats */}
            <motion.div variants={heroItem} className="mt-8 sm:mt-11 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto lg:mx-0">
              <AnimatePresence mode="wait">
                {p.stats.map((s, i) => (
                  <motion.div key={`${persona}-${i}`}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className="text-center lg:text-left">
                    <p className="font-display text-2xl font-bold"
                      style={{ color: i === 2 ? "var(--color-coral)" : "var(--color-teal)" }}>
                      <AnimatedNumber value={s.value} suffix={s.suffix} />
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>{s.label}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Right: roadmap card */}
          <AnimatePresence mode="wait">
            <motion.div key={`card-${persona}`}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}>
              <RoadmapPreviewCard location={p.cardLocation} />
            </motion.div>
          </AnimatePresence>
        </div>

        <CityTicker />
      </section>

      {/* TIER 1 #5 — Wave divider */}
      <WaveDivider from="var(--color-warm-neutral)" to="var(--color-white)" />

      {/* ── TIER 2 #7 — Problem / Solution split ─────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">

            {/* Problem — with TIER 3 #14 Before/After toggle */}
            <motion.div variants={revealItem} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
              className="rounded-2xl p-8 border" style={{ background: "var(--color-red-light)", borderColor: "#FECACA" }}>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-5"
                style={{ background: "var(--color-red-bg)", color: "var(--color-red)" }}>
                ✗ The problem
              </div>
              <BeforeAfterToggle />
              <h2 className="font-display text-xl mb-4" style={{ color: "var(--color-navy)" }}>Arriving in the UK is overwhelming.</h2>
              <div className="space-y-3">
                {[
                  "Accommodation, banking, GP registration, SIM setup, council tax...",
                  "Information is scattered across dozens of government websites.",
                  "What you find is usually generic — not tailored to you.",
                  "By the time you learn something, you've often already made the mistake.",
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0" style={{ color: "var(--color-red)" }}>✗</span>
                    <p className="text-sm" style={{ color: "#991B1B" }}>{line}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Solution */}
            <motion.div variants={revealItem} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.1, duration: 0.4, ease: EASE_OUT }}
              className="rounded-2xl p-8 border" style={{ background: "var(--color-teal-50)", borderColor: "rgba(22,179,166,0.2)" }}>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-5"
                style={{ background: "rgba(22,179,166,0.1)", color: "var(--color-teal)" }}>
                ✓ What we built
              </div>
              <div className="mx-auto mb-6 bg-white rounded-xl p-4 border"
                style={{ width: 120, borderColor: "rgba(22,179,166,0.2)", boxShadow: "0 4px 12px rgba(22,179,166,0.1)" }}>
                {["Bank account", "GP registration", "NI number"].map((item, i) => (
                  <motion.div key={item} className="flex items-center gap-2 mb-2 last:mb-0"
                    initial={{ opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.12 + 0.3, duration: 0.3 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-green)", flexShrink: 0 }} />
                    <div style={{ height: 3, background: "rgba(22,179,166,0.35)", borderRadius: 2, flex: 1 }} />
                  </motion.div>
                ))}
              </div>
              <h2 className="font-display text-xl mb-4" style={{ color: "var(--color-navy)" }}>A single, personalised checklist for your first 90 days.</h2>
              <div className="space-y-3">
                {[
                  "Everything you need to do, in the right order.",
                  "Built around your city, university, and accommodation type.",
                  "Updated as you go — your roadmap, your pace.",
                  "With official source links and plain-English guidance for every task.",
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--color-green)" }} />
                    <p className="text-sm" style={{ color: "#166534" }}>{line}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TIER 1 #5 — Wave divider */}
      <WaveDivider from="var(--color-white)" to="var(--color-mist)" />

      {/* ── TIER 1 #1 + TIER 2 #8 — Bento features + sticky left ── */}
      <section className="py-20" style={{ background: "var(--color-mist)" }}>
        <div className="max-w-6xl mx-auto px-6">
          {/* Mobile heading */}
          <div className="lg:hidden text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-teal)" }}>What you get</p>
            <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-navy)" }}>Everything you need to settle, in one place.</h2>
          </div>

          <div className="lg:flex lg:gap-16 lg:items-start">
            {/* TIER 2 #8 — Sticky left panel */}
            <div className="hidden lg:block w-72 shrink-0">
              <div style={{ position: "sticky", top: "6rem" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-teal)" }}>What you get</p>
                <h2 className="font-display text-2xl mb-5" style={{ color: "var(--color-navy)" }}>Everything you need to settle, in one place.</h2>
                <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--color-muted)" }}>Six tools built to work together — from the moment you land to the day you feel at home.</p>
                <MagneticButton>
                  <Link href="/signup" className="btn-primary text-sm px-7 py-3">
                    Build my roadmap <ArrowRight className="w-4 h-4" />
                  </Link>
                </MagneticButton>
              </div>
            </div>

            {/* TIER 1 #1 — Bento grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Wide card: Roadmap */}
              <motion.div variants={revealItem} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="sm:col-span-2 rounded-2xl p-8 border"
                style={{ background: "var(--color-navy)", borderColor: "transparent", boxShadow: "var(--shadow-card)" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(255,255,255,0.1)" }}>
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold mb-2 text-white">{FEATURES[0].title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>{FEATURES[0].desc}</p>
              </motion.div>

              {/* Regular cards: Guidance, Reminders, Scam, Trusted */}
              {FEATURES.slice(1, 5).map((f, i) => (
                <motion.div key={f.title} variants={revealItem} initial="hidden" whileInView="show"
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl p-6 border"
                  style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-card)" }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: f.iconBg }}>
                    <f.icon className="w-6 h-6" style={{ color: f.iconColor }} />
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: "var(--color-navy)" }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>{f.desc}</p>
                </motion.div>
              ))}

              {/* Wide card: Nia */}
              <motion.div variants={revealItem} initial="hidden" whileInView="show" viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="sm:col-span-2 rounded-2xl p-8 border overflow-hidden relative"
                style={{ background: "linear-gradient(135deg, rgba(255,115,88,0.08) 0%, rgba(248,181,71,0.06) 100%)", borderColor: "rgba(255,115,88,0.18)", boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,115,88,0.1)" }}>
                    <NiaIcon size={24} style={{ color: "var(--color-coral)" }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold mb-1" style={{ color: "var(--color-navy)" }}>{FEATURES[5].title}</h3>
                    <p className="text-xs leading-relaxed mb-5" style={{ color: "var(--color-muted)" }}>{FEATURES[5].desc}</p>
                    {/* Mini chat preview */}
                    <div className="space-y-2 max-w-sm">
                      <div className="text-xs px-3.5 py-2 rounded-2xl rounded-tl-sm inline-block"
                        style={{ background: "var(--color-navy)", color: "rgba(255,255,255,0.85)" }}>
                        What does &quot;section 21&quot; mean in my tenancy notice?
                      </div>
                      <div className="text-xs px-3.5 py-2 rounded-2xl rounded-tr-sm inline-block"
                        style={{ background: "var(--color-coral)", color: "white", marginLeft: "auto", display: "block", maxWidth: "80%" }}>
                        A Section 21 is a &apos;no-fault eviction&apos; notice. Your landlord must give you at least 2 months&apos; written notice...
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* TIER 1 #5 — Wave divider */}
      <WaveDivider from="var(--color-mist)" to="var(--color-warm-neutral)" flip />

      {/* ── Open Door ─────────────────────────────────────────────── */}
      <OpenDoorSection />
      {/* TIER 2 #6 — Editorial pull quote */}
      {/* 
        Feature flag: Set to true to enable the EditorialQuote section.
        Remove this flag when the section is ready for production.
      */}
      {false && <EditorialQuote />}

      {/* TIER 3 #13 — Timeline */}
      <TimelineSection />

      {/* TIER 1 #5 — Wave divider */}
      <WaveDivider from="var(--color-warm-neutral)" to="var(--color-white)" />

      {/* ── How it works ──────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-teal)" }}>How it works</p>
            <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-navy)" }}>Four steps to your UK roadmap</h2>
          </div>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={heroContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.num} variants={revealItem} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 font-extrabold text-2xl"
                  style={{ background: step.bg, color: step.color }}>
                  {step.num}
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 translate-x-4 w-8">
                    <motion.svg width="32" height="16" viewBox="0 0 32 16" initial="hidden" whileInView="show" viewport={{ once: true }}>
                      <motion.path d="M 0 8 L 22 8 M 16 3 L 24 8 L 16 13" fill="none" stroke="var(--color-coral)"
                        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                        variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1, transition: { duration: 0.55, delay: i * 0.18 } } }} />
                    </motion.svg>
                  </div>
                )}
                <h3 className="text-sm font-bold mb-2" style={{ color: "var(--color-navy)" }}>{step.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      {/* Commented out for now. Re-enable when we have real testimonials to show. */}
      {/* <section className="py-20 px-6" style={{ background: "var(--color-mist)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-teal)" }}>From our community</p>
            <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--color-navy)" }}>Newcomers who found their footing.</h2>
          </div>
          <motion.div className="grid sm:grid-cols-3 gap-6"
            variants={heroContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            {TESTIMONIALS.map((t) => (
              <motion.div key={t.name} variants={revealItem}
                className="bg-white rounded-2xl p-6 border flex flex-col gap-4"
                style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-card)" }}>
                <div style={{ color: t.color }}><Quote className="w-6 h-6 opacity-60" /></div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--color-navy)" }}>&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: t.color }}>{t.initial}</div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "var(--color-navy)" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>{t.detail}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      {/* ── Nia demo ──────────────────────────────────────────────── */}
      <NiaLandingSection />

      {/* ── Readiness Gauge ───────────────────────────────────────── */}
      <ReadinessGauge />

      {/* ── Scam Game ─────────────────────────────────────────────── */}
      <ScamGame />

      {/* ── Compliance note ───────────────────────────────────────── */}
      <section className="py-12 px-6" style={{ background: "var(--color-mist)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl p-6 border" style={{ background: "var(--color-teal-50)", borderColor: "rgba(22,179,166,0.2)" }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--color-teal-100)" }}>
                <Scale className="w-4 h-4" style={{ color: "var(--color-teal)" }} />
              </div>
              <div>
                <h2 className="text-sm font-bold mb-2" style={{ color: "var(--color-navy)" }}>How we work — and how we don&apos;t</h2>
                <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--color-muted)" }}>Beginly is a settlement support platform — not a legal, immigration, financial, or professional advice service. We help you understand what you need to do and point you to official sources.</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>Our content is built around official GOV.UK guidance and reviewed before publication. Always check your personal circumstances against your visa conditions, university guidance, or advice from a regulated professional.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden" style={{ background: "var(--color-navy)" }}>
            <div className="absolute rounded-full pointer-events-none" style={{ width: 280, height: 280, opacity: 0.15, background: "radial-gradient(circle, var(--color-teal) 0%, transparent 65%)", top: -80, right: -80 }} />
            <div className="absolute rounded-full pointer-events-none" style={{ width: 220, height: 220, opacity: 0.12, background: "radial-gradient(circle, var(--color-coral) 0%, transparent 65%)", bottom: -60, left: -60 }} />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(22,179,166,0.85)" }}>Open what comes next</p>
              <h2 className="font-display text-2xl sm:text-3xl text-white mb-4">Your first 90 days start now.</h2>
              <p className="text-sm mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                Join newcomers from around the world using Beginly to settle in confidently. Free forever. No credit card needed.
              </p>
              <MagneticButton>
                <Link href="/signup" className="btn-primary text-sm px-8 py-3.5 inline-flex items-center gap-2">
                  Create your roadmap now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>
              <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Takes 2 minutes · No payment required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Disclaimer strip (light bg for legibility) ───────────── */}
      <section className="px-6 py-8 border-t" style={{ background: "var(--color-mist)", borderColor: "var(--color-border)" }}>
        <div className="max-w-3xl mx-auto">
          <Disclaimer type="general" />
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ background: "var(--color-navy)" }}>

        {/* Brand beam accent — echoes the logo beam */}
        <div aria-hidden style={{ height: 2, background: "linear-gradient(90deg, transparent 0%, #FF7358 28%, #F8B547 62%, #F6EBDD 100%)" }} />

        {/* Main grid */}
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-10">
          <div className="grid md:grid-cols-[1.7fr_1fr_1fr] gap-10 lg:gap-16 mb-12">

            {/* Brand column */}
            <div>
              <Logo variant="lockup" size={46} theme="light" tagline />
              <p className="mt-6 text-sm leading-relaxed max-w-xs"
                style={{ color: "rgba(255,255,255,0.4)" }}>
                Settlement support for everyone arriving in the UK — free, personalised,
                and built around your visa route and situation.
              </p>
            </div>

            {/* Platform links */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-5"
                style={{ color: "rgba(255,255,255,0.26)" }}>
                Platform
              </p>
              <div className="space-y-3.5">
                {[
                  ["Guidance library",        "/routes"],
                  ["Document Helper (Nia)",   "/nia"],
                  ["Opportunities",           "/opportunity-categories"],
                  ["Get started — free",      "/signup"],
                ].map(([label, href]) => (
                  <Link key={href} href={href}
                    className="block text-sm transition-opacity hover:opacity-100"
                    style={{ color: "rgba(255,255,255,0.5)" }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Company links */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-5"
                style={{ color: "rgba(255,255,255,0.26)" }}>
                Company
              </p>
              <div className="space-y-3.5">
                {[
                  ["How we work",    "/trust/methodology"],
                  ["Sign in",        "/login"],
                  ["Create account", "/signup"],
                ].map(([label, href]) => (
                  <Link key={href} href={href}
                    className="block text-sm transition-opacity hover:opacity-100"
                    style={{ color: "rgba(255,255,255,0.5)" }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t pt-6 flex flex-col sm:flex-row gap-3 justify-between items-center"
            style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-xs text-center sm:text-left"
              style={{ color: "rgba(255,255,255,0.22)" }}>
              © 2026 Beginly. An independent platform — not affiliated with the UK government, NHS, or any university.
            </p>
            <div className="flex gap-5 shrink-0">
              <Link href="/privacy-policy" className="text-xs"
                style={{ color: "rgba(255,255,255,0.28)" }}>
                Privacy
              </Link>
              <Link href="/terms-of-service" className="text-xs"
                style={{ color: "rgba(255,255,255,0.28)" }}>
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
