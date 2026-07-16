"use client";
import { useState } from "react";
import Link from "next/link";
import { GUIDANCE_PAGES } from "@/lib/guidance-data";
import { Search, BookOpen, ArrowRight } from "lucide-react";
import type { GuidanceCategory } from "@/types";
import Navigation from "@/components/Navigation";

const CATEGORIES: { value: GuidanceCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Topics" },
  { value: "Documents", label: "Documents" },
  { value: "Accommodation", label: "Accommodation" },
  { value: "Money", label: "Money" },
  { value: "Health", label: "Health" },
  { value: "University", label: "University" },
  { value: "Work", label: "Work" },
  { value: "Safety", label: "Safety" },
  { value: "Local Life", label: "Local Life" },
  { value: "Local Admin", label: "Local Admin" },
  { value: "Growth", label: "Growth" },
  { value: "Transport", label: "Transport" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Documents: "text-blue-600 bg-blue-50 border border-blue-200",
  Accommodation: "text-amber-600 bg-amber-50 border border-amber-200",
  Money: "text-green-600 bg-green-50 border border-green-200",
  Health: "text-red-500 bg-red-50 border border-red-200",
  University: "text-purple-600 bg-purple-50 border border-purple-200",
  Work: "text-pink-600 bg-pink-50 border border-pink-200",
  Safety: "text-orange-600 bg-orange-50 border border-orange-200",
  "Local Life": "text-teal-600 bg-teal-50 border border-teal-200",
  "Local Admin": "text-slate-600 bg-slate-50 border border-slate-200",
  Growth: "text-indigo-600 bg-indigo-50 border border-indigo-200",
  Transport: "text-cyan-600 bg-cyan-50 border border-cyan-200",
};

export default function GuidesPage() {
  const [filter, setFilter] = useState<GuidanceCategory | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filtered = GUIDANCE_PAGES.filter((g) => {
    if (filter !== "ALL" && g.category !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <Navigation>
      <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-navy">Guidance Library</h1>
          <p className="text-sm text-muted mt-0.5">
            Plain-English guides for your first 90 days — written in clear language you can actually use.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides..."
            className="input-field pl-9"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilter(c.value as typeof filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === c.value
                  ? "bg-primary text-white"
                  : "bg-white text-muted border border-border hover:border-primary/40"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="w-10 h-10 text-muted mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted">No guides found for your search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((guide) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`} className="card-hover group">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${CATEGORY_COLORS[guide.category] ?? "text-muted bg-civic-50"}`}>
                    {guide.category}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                </div>
                <h2 className="text-sm font-bold text-navy mb-1 leading-snug">{guide.title}</h2>
                <p className="text-xs text-muted leading-relaxed">{guide.description}</p>
                <p className="text-xs text-muted mt-2">Last reviewed: {guide.lastReviewed}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Navigation>
  );
}
