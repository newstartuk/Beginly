import Link from "next/link";
import { ArrowRight, BookOpenCheck, CheckSquare, Compass, FileCheck2, HeartPulse, Landmark, Sparkles, TrendingUp } from "lucide-react";
import PlatformShell from "@/components/platform/PlatformShell";
import StatusPill from "@/components/platform/StatusPill";
import { loadOptionalPlatformContext } from "@/lib/platform/server-context";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const context = await loadOptionalPlatformContext();
  const displayName = context?.displayName ?? "Beginly member";

  const modules = [
    {
      href: "/platform",
      label: "Today",
      detail: "Your main post-login entrance from now on.",
      icon: Compass,
    },
    {
      href: "/journey",
      label: "Journey Hub",
      detail: "The wider layer that connects settlement, opportunities and next-best actions.",
      icon: Sparkles,
    },
    {
      href: "/checklist",
      label: "Task Library",
      detail: "The settlement home for pre-arrival through day 90.",
      icon: CheckSquare,
    },
    {
      href: "/budget",
      label: "Budget Planner",
      detail: "The richer monthly planner with saved month-by-month history.",
      icon: TrendingUp,
    },
    {
      href: "/document-helper",
      label: "Doc Helper",
      detail: "Understand forms and letters in plain English.",
      icon: FileCheck2,
    },
    {
      href: "/bank",
      label: "Banking",
      detail: "Compare student-friendly UK account options in one place.",
      icon: Landmark,
    },
    {
      href: "/guides",
      label: "Guides",
      detail: "Trust and guidance articles for key settlement topics.",
      icon: BookOpenCheck,
    },
    {
      href: "/emergency",
      label: "Emergency",
      detail: "Important contacts and safety-first help.",
      icon: HeartPulse,
    },
  ];

  return (
    <PlatformShell
      title={`Dashboard reference for ${displayName}`}
      eyebrow="Legacy surface kept for transition review"
      action={<StatusPill tone="info">Reference only</StatusPill>}
    >
      <section className="journey-hero">
        <div>
          <h2>The old dashboard stays here as a reference point while Beginly shifts into the newer platform flow.</h2>
          <p>
            The live direction is now simpler: <strong>Today</strong> is the entrance, <strong>Task Library</strong> is
            the settlement home, and <strong>Journey Hub</strong> is the wider adaptive layer.
          </p>
          <div className="platform-hero-actions">
            <Link href="/platform" className="platform-primary">
              Open Today <ArrowRight size={17} />
            </Link>
            <Link href="/checklist" className="platform-secondary">
              Open Task Library
            </Link>
          </div>
        </div>
      </section>

      <section className="platform-section-heading">
        <div>
          <span>Transition map</span>
          <h2>Where each core function now lives</h2>
        </div>
        <p>
          This page helps compare the old and new structure without leaving the legacy dashboard route behind.
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="card border border-border hover:border-primary/30 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <module.icon size={20} className="text-primary" />
              <StatusPill tone="neutral">Current</StatusPill>
            </div>
            <h3 className="mt-3 text-base font-semibold text-navy">{module.label}</h3>
            <p className="mt-2 text-sm text-civic-600">{module.detail}</p>
          </Link>
        ))}
      </div>
    </PlatformShell>
  );
}
