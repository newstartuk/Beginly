"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GUIDANCE_PAGES } from "@/lib/guidance-data";
import { SEED_TASKS } from "@/lib/seed-data";
import { ChevronLeft, AlertTriangle, ArrowRight } from "lucide-react";
import Disclaimer from "@/components/Disclaimer";
import Navigation from "@/components/Navigation";
import InfoCard from "@/components/InfoCard";
import StepList from "@/components/StepList";

export default function GuideArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const guide = GUIDANCE_PAGES.find((g) => g.slug === slug);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  if (!guide) {
    return (
      <Navigation>
        <div className="max-w-3xl mx-auto text-center py-20">
          <h1 className="text-lg font-bold text-navy mb-2">Guide not found</h1>
          <Link href="/guides" className="text-sm text-primary hover:underline">← Back to guides</Link>
        </div>
      </Navigation>
    );
  }

  const relatedTasks = SEED_TASKS.filter((t) => guide.relatedTaskIds.includes(t.taskId));

  const CATEGORY_COLORS: Record<string, string> = {
    Documents: "text-blue-600 bg-blue-50 border-blue-200",
    Accommodation: "text-amber-600 bg-amber-50 border-amber-200",
    Money: "text-green-600 bg-green-50 border-green-200",
    Health: "text-red-500 bg-red-50 border-red-200",
    University: "text-purple-600 bg-purple-50 border-purple-200",
    Work: "text-pink-600 bg-pink-50 border-pink-200",
    Safety: "text-orange-600 bg-orange-50 border-orange-200",
    "Local Life": "text-teal-600 bg-teal-50 border-teal-200",
    "Local Admin": "text-slate-600 bg-slate-50 border-slate-200",
    Growth: "text-indigo-600 bg-indigo-50 border-indigo-200",
    Transport: "text-cyan-600 bg-cyan-50 border-cyan-200",
  };

  return (
    <Navigation>
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <Link href="/guides" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to guidance library
        </Link>

        <div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${CATEGORY_COLORS[guide.category] ?? "text-muted bg-civic-50"}`}>
            {guide.category}
          </span>
          <h1 className="text-2xl font-bold text-navy mt-3 mb-2 leading-snug">{guide.title}</h1>
          <p className="text-sm text-civic-600 leading-relaxed">{guide.description}</p>
          <p className="text-xs text-muted mt-2">Last reviewed: {guide.lastReviewed}</p>
        </div>

        {/* What this is */}
        <InfoCard title="What this is">
          <p className="text-sm text-civic-700 leading-relaxed">{guide.whatThisIs}</p>
        </InfoCard>

        {/* Why it matters */}
        <InfoCard title="Why it matters">
          <p className="text-sm text-civic-700 leading-relaxed">{guide.whyItMatters}</p>
        </InfoCard>

        {/* What to prepare */}
        {guide.whatToPrepare.length > 0 && (
          <div className="card">
            <h2 className="section-title">What to prepare</h2>
            <ul className="space-y-2">
              {guide.whatToPrepare.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-civic-700">
                  <span className="text-primary font-bold shrink-0 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Steps to take */}
        {guide.stepsToTake.length > 0 && (
          <div className="card">
            <h2 className="section-title">Steps to take</h2>
            <StepList steps={guide.stepsToTake} />
          </div>
        )}

        {/* Common mistakes */}
        {guide.commonMistakes.length > 0 && (
          <div className="card border-amber-200 bg-amber-50">
            <h2 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Common mistakes to avoid
            </h2>
            <ul className="space-y-2">
              {guide.commonMistakes.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                  <span className="text-amber-400 shrink-0 mt-0.5">✗</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety warning */}
        {guide.safetyWarning && (
          <div className="card border-2 border-red-200 bg-red-50">
            <h2 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Important safety warning
            </h2>
            <p className="text-sm text-red-600 leading-relaxed">{guide.safetyWarning}</p>
          </div>
        )}

        {/* Source signpost */}
        {guide.sourceSignpost && (
          <div className="card bg-civic-50">
            <h2 className="text-xs font-semibold text-muted uppercase mb-1">Official sources</h2>
            <p className="text-sm text-civic-600 leading-relaxed">{guide.sourceSignpost}</p>
          </div>
        )}

        {/* Related tasks */}
        {relatedTasks.length > 0 && (
          <div className="card">
            <h2 className="section-title">Related checklist tasks</h2>
            <div className="space-y-2">
              {relatedTasks.map((t) => (
                <Link
                  key={t.taskId}
                  href={`/tasks/${t.taskId}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-civic-50 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-navy">{t.title}</p>
                    <p className="text-xs text-muted">{t.stage} · {t.category}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <Disclaimer text={guide.disclaimer} type="general" />
      </div>
    </Navigation>
  );
}
