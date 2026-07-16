"use client";
import Link from "next/link";
import { ChevronLeft, Shield } from "lucide-react";
import { GUIDANCE_PAGES } from "@/lib/guidance-data";
import Navigation from "@/components/Navigation";
import AdminGuard from "@/components/AdminGuard";
import Disclaimer from "@/components/Disclaimer";

const CATEGORY_COLORS: Record<string, string> = {
  Documents: "text-blue-600 bg-blue-50 border-blue-200",
  Accommodation: "text-amber-600 bg-amber-50 border-amber-200",
  Money: "text-green-600 bg-green-50 border-green-200",
  Health: "text-red-500 bg-red-50 border-red-200",
  University: "text-purple-600 bg-purple-50 border-purple-200",
  Work: "text-pink-600 bg-pink-50 border-pink-200",
  Safety: "text-orange-600 bg-orange-50 border-orange-200",
  "Local Life": "text-teal-600 bg-teal-50 border-teal-200",
};

export default function AdminGuidesPage() {
  return (
    <AdminGuard>
    <Navigation>
      <div className="max-w-5xl mx-auto space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-muted hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-navy">Guidance Manager</h1>
          <span className="text-xs text-muted ml-auto">{GUIDANCE_PAGES.length} articles total</span>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                {["Slug", "Title", "Category", "Last Reviewed", "Related Tasks", "Actions"].map((h) => (
                  <th key={h} className="text-left py-2 px-2 text-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GUIDANCE_PAGES.map((guide) => (
                <tr key={guide.slug} className="border-b border-civic-50 last:border-0 hover:bg-civic-50/50">
                  <td className="py-2 px-2 font-mono text-muted whitespace-nowrap">{guide.slug}</td>
                  <td className="py-2 px-2 text-navy font-medium max-w-[200px]"><p className="truncate">{guide.title}</p></td>
                  <td className="py-2 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[guide.category] ?? "text-muted bg-civic-50"}`}>
                      {guide.category}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-muted">{guide.lastReviewed}</td>
                  <td className="py-2 px-2 text-muted">{guide.relatedTaskIds.length}</td>
                  <td className="py-2 px-2">
                    <Link href={`/guides/${guide.slug}`} className="text-primary hover:underline">
                      View ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Disclaimer text="Full guide editor (create, edit, publish) will be implemented in Sprint 5. Currently, guides are managed by editing lib/guidance-data.ts directly. Set up Supabase and integrate it in Sprint 5." type="general" />
      </div>
    </Navigation>
    </AdminGuard>
  );
}
