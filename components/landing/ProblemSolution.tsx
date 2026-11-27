import { Check, X } from "lucide-react";

// Each problem is answered by the solution in the same position, and the two
// columns line up row by row on desktop.
const PAIRS = [
  {
    problem: "Bank account, GP, SIM card, council tax: there's a lot to do, and it's hard to know what comes first.",
    solution: "Everything you need to do, in the order it needs to happen.",
  },
  {
    problem: "Information is scattered across dozens of government websites.",
    solution: "Plain-English guidance, with links to the official source for every task.",
  },
  {
    problem: "What you find is usually generic, not written for your situation.",
    solution: "A roadmap built around your visa route, city and arrival date.",
  },
  {
    problem: "By the time you learn something, you've often already made the mistake.",
    solution: "Warnings about common mistakes and scams before you run into them.",
  },
];

const TONES = {
  problem: {
    label: "The problem",
    heading: "Arriving in the UK is overwhelming.",
    background: "var(--color-red-light)",
    border: "color-mix(in srgb, var(--color-red) 22%, transparent)",
    accent: "var(--color-red)",
    accentSoft: "var(--color-red-bg)",
    Icon: X,
  },
  solution: {
    label: "What we built",
    heading: "One personalised checklist for your first 90 days.",
    background: "var(--color-teal-50)",
    border: "color-mix(in srgb, var(--color-teal) 22%, transparent)",
    accent: "var(--color-teal)",
    accentSoft: "var(--color-teal-100)",
    Icon: Check,
  },
} as const;

function Column({ tone }: { tone: keyof typeof TONES }) {
  const t = TONES[tone];
  return (
    // On desktop each column is a subgrid of the section's six rows (label,
    // heading, four items), which keeps every problem level with its answer.
    <div className="rounded-2xl border p-7 sm:p-8 flex flex-col gap-4 md:grid md:grid-rows-subgrid md:row-span-6"
      style={{ background: t.background, borderColor: t.border }}>
      <p className="justify-self-start self-start inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
        style={{ background: t.accentSoft, color: t.accent }}>
        <t.Icon aria-hidden className="w-3.5 h-3.5" strokeWidth={3} />
        {t.label}
      </p>
      <h3 className="font-display text-xl sm:text-2xl text-balance" style={{ color: "var(--color-navy)" }}>{t.heading}</h3>
      <ul className="flex flex-col gap-4 md:grid md:grid-rows-subgrid md:row-span-4">
        {PAIRS.map((pair) => (
          <li key={pair[tone]} className="flex items-start gap-3">
            <span aria-hidden className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: t.accentSoft, color: t.accent }}>
              <t.Icon className="w-3 h-3" strokeWidth={3} />
            </span>
            <span className="text-sm leading-relaxed" style={{ color: "var(--color-navy)" }}>{pair[tone]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Side-by-side comparison: what arriving in the UK is like, and how Beginly answers each part of it. */
export default function ProblemSolution() {
  return (
    <section aria-labelledby="why-beginly" className="pt-20 pb-10 px-6">
      <h2 id="why-beginly" className="sr-only">Why Beginly</h2>
      <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2 md:gap-x-8 md:gap-y-4">
        <Column tone="problem" />
        <Column tone="solution" />
      </div>
    </section>
  );
}
