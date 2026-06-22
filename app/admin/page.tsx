"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserTasks } from "@/lib/utils";
import { SEED_TASKS } from "@/lib/seed-data";
import { GUIDANCE_PAGES } from "@/lib/guidance-data";
import { SCAM_ALERTS } from "@/lib/scam-alerts";
import { Shield, CheckSquare, BookOpen, AlertTriangle, ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import AdminGuard from "@/components/AdminGuard";

export default function AdminPage() {
  const [userTasks, setUserTasks] = useState<ReturnType<typeof getUserTasks>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUserTasks(getUserTasks());
  }, []);

  if (!mounted) return null;

  const completedCount = userTasks.filter((t) => t.status === "complete").length;
  const totalActiveTasks = SEED_TASKS.filter((t) => t.active).length;
  const requiredTasks = SEED_TASKS.filter((t) => t.required && t.active);
  const highPriority = SEED_TASKS.filter((t) => t.priority === "Very High" && t.active);

  return (
    <AdminGuard>
    <Navigation>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-navy">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Tasks", value: `${totalActiveTasks}`, sub: `Required: ${requiredTasks.length}`, icon: CheckSquare, color: "text-primary", bg: "bg-teal-50" },
            { label: "Guidance Articles", value: `${GUIDANCE_PAGES.length}`, sub: "All published", icon: BookOpen, color: "text-purple-500", bg: "bg-purple-50" },
            { label: "Scam Alerts", value: `${SCAM_ALERTS.length}`, sub: "Active alerts", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "User Tasks (demo)", value: `${completedCount}`, sub: "Tasks completed", icon: CheckSquare, color: "text-green-500", bg: "bg-green-50" },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted">{stat.label}</p>
                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-navy">{stat.value}</p>
              <p className="text-xs text-muted mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/admin/tasks" className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-navy mb-1">Task Manager</h2>
                <p className="text-sm text-muted">
                  Manage {totalActiveTasks} checklist task templates — edit priority, guidance links, risk warnings, and activate/deactivate.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted shrink-0" />
            </div>
          </Link>
          <Link href="/admin/guides" className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-navy mb-1">Guidance Manager</h2>
                <p className="text-sm text-muted">
                  Manage {GUIDANCE_PAGES.length} guidance articles — view all articles, check last reviewed dates.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted shrink-0" />
            </div>
          </Link>
        </div>

        {/* High priority task preview */}
        <div className="card">
          <h2 className="section-title mb-3">Very High Priority Tasks ({highPriority.length})</h2>
          <div className="space-y-2">
            {highPriority.slice(0, 5).map((t) => (
              <div key={t.taskId} className="flex items-center justify-between p-3 bg-civic-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-navy">{t.title}</p>
                  <p className="text-xs text-muted">{t.taskId} · {t.category} · {t.stage}</p>
                </div>
                <Link href={`/tasks/${t.taskId}`} className="text-xs text-primary hover:underline">
                  View →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Navigation>
    </AdminGuard>
  );
}
