"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, ExternalLink, PalmtreeIcon, Timer } from "lucide-react";
import Disclaimer from "@/components/Disclaimer";
import PlatformShell from "@/components/platform/PlatformShell";
import StatusPill from "@/components/platform/StatusPill";
import { getArrivalProfile } from "@/lib/utils";
import {
  STUDENT_VISA_WORK_LINKS,
  WEEKLY_HOUR_LIMIT,
  addWeeks,
  formatHours,
  formatWeekRange,
  getWeek,
  getWeekDays,
  getWeekStart,
  getWorkHoursMessage,
  parseWorkHoursStore,
  updateWeek,
  weekTotal,
  type WorkHoursStore,
} from "@/lib/work-hours";

const STORAGE_KEY = "beginly_work_hours";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function WorkHoursPage() {
  const [mounted, setMounted] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [store, setStore] = useState<WorkHoursStore>({ weeks: {} });

  useEffect(() => {
    const profile = getArrivalProfile();
    setIsStudent(!profile || profile.arrivalType === "international_student");
    setStore(parseWorkHoursStore(localStorage.getItem(STORAGE_KEY)));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store, mounted]);

  if (!mounted) return null;

  const week = getWeek(store, weekStart);
  const total = weekTotal(week.days);
  const message = getWorkHoursMessage(total, week.isVacation);
  const days = getWeekDays(weekStart);
  const today = todayISO();
  const progressPct = Math.min(100, (total / WEEKLY_HOUR_LIMIT) * 100);

  const setDayHours = (date: string, raw: string) => {
    const nextDays = { ...week.days };
    if (raw.trim() === "") {
      delete nextDays[date];
    } else {
      const value = Number(raw);
      if (Number.isFinite(value)) nextDays[date] = Math.max(0, value);
    }
    setStore((prev) => updateWeek(prev, { ...week, days: nextDays }));
  };

  const toggleVacation = () => {
    setStore((prev) => updateWeek(prev, { ...week, isVacation: !week.isVacation }));
  };

  const toneByStatus = {
    vacation: "info" as const,
    safe: "positive" as const,
    approaching: "warning" as const,
    at_limit: "warning" as const,
    breached: "warning" as const,
  };

  const cardClassByStatus: Record<string, string> = {
    vacation: "card border-primary/20 bg-teal-50/40",
    safe: "card border-green-200 bg-green-50",
    approaching: "card border-amber-200 bg-amber-50",
    at_limit: "card border-amber-200 bg-amber-50",
    breached: "card border-2 border-red-200 bg-red-50",
  };

  return (
    <PlatformShell
      title="Work Hours Tracker"
      eyebrow="Student visa — 20 hour weekly limit"
      action={<StatusPill tone={toneByStatus[message.status]}>{message.status === "vacation" ? "Holiday mode" : `${formatHours(total)} / ${WEEKLY_HOUR_LIMIT} hrs`}</StatusPill>}
    >
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
            <Timer className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy">Log your work hours</h1>
            <p className="text-xs text-muted mt-0.5">
              Most Student visa holders can work up to 20 hours a week in term time, and unlimited hours during official holidays.
            </p>
          </div>
        </div>

        {!isStudent && (
          <div className="card border-amber-200 bg-amber-50">
            <p className="text-sm text-amber-700">
              This tracker is built around the Student visa 20-hour weekly work limit. If that is not your visa route, the hour limits shown here will not apply to you.
            </p>
          </div>
        )}

        {/* Week navigator */}
        <div className="card flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setWeekStart((current) => addWeeks(current, -1))}
            className="btn-ghost text-xs py-1.5 px-2.5 flex items-center gap-1"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-navy">{formatWeekRange(weekStart)}</p>
            {weekStart !== getWeekStart() && (
              <button type="button" onClick={() => setWeekStart(getWeekStart())} className="text-xs text-primary hover:underline">
                Jump to this week
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setWeekStart((current) => addWeeks(current, 1))}
            className="btn-ghost text-xs py-1.5 px-2.5 flex items-center gap-1"
            aria-label="Next week"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Vacation toggle */}
        <button
          type="button"
          onClick={toggleVacation}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
            week.isVacation ? "border-primary bg-teal-50" : "border-border hover:border-primary/40"
          }`}
        >
          <PalmtreeIcon className={`w-5 h-5 shrink-0 ${week.isVacation ? "text-primary" : "text-muted"}`} />
          <div>
            <p className="text-sm font-semibold text-navy">This is a holiday / vacation week</p>
            <p className="text-xs text-muted">No 20-hour limit applies during official university holidays — turn this on and work unlimited hours.</p>
          </div>
        </button>

        {/* Live status */}
        <div className={cardClassByStatus[message.status]}>
          <div className="flex items-start gap-2.5">
            {message.status === "breached" ? (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            ) : message.status === "at_limit" || message.status === "approaching" ? (
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`text-sm font-bold ${
                  message.status === "breached" ? "text-red-700" : message.status === "at_limit" || message.status === "approaching" ? "text-amber-700" : "text-navy"
                }`}
              >
                {message.headline}
              </p>
              <p className={`text-sm mt-1 leading-relaxed ${message.status === "breached" ? "text-red-600" : message.status === "at_limit" || message.status === "approaching" ? "text-amber-700" : "text-civic-600"}`}>
                {message.detail}
              </p>
            </div>
          </div>

          {!week.isVacation && (
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/70">
              <div
                className={`h-full transition-all ${message.status === "breached" ? "bg-red-500" : message.status === "at_limit" ? "bg-amber-500" : message.status === "approaching" ? "bg-amber-400" : "bg-primary"}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}

          {message.status === "breached" && (
            <div className="mt-3 flex flex-wrap gap-3">
              {STUDENT_VISA_WORK_LINKS.map((resource) => (
                <a
                  key={resource.url}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:underline"
                >
                  {resource.label} <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Daily entries */}
        <div className="card">
          <h2 className="section-title">Hours worked this week</h2>
          <div className="space-y-2">
            {days.map((date, index) => {
              const isToday = date === today;
              const dayNum = new Date(`${date}T00:00:00`).getDate();
              return (
                <div
                  key={date}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-2.5 ${
                    isToday ? "border-primary bg-teal-50/50" : "border-border"
                  }`}
                >
                  <label htmlFor={`hours-${date}`} className="text-sm font-medium text-navy flex items-center gap-2">
                    {WEEKDAY_LABELS[index]} {dayNum}
                    {isToday && <span className="text-[10px] font-semibold text-primary bg-white rounded-full px-1.5 py-0.5">Today</span>}
                  </label>
                  <input
                    id={`hours-${date}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.5}
                    placeholder="0"
                    value={week.days[date] !== undefined ? String(week.days[date]) : ""}
                    onChange={(event) => setDayHours(date, event.target.value)}
                    className="input-field w-24 text-right"
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold text-navy">Total this week</span>
            <span className="text-sm font-bold text-navy">{formatHours(total)} hours</span>
          </div>
        </div>

        <div className="card bg-civic-50">
          <p className="text-xs font-semibold text-muted uppercase mb-1">Know your Student visa work conditions</p>
          <p className="text-sm text-civic-600 leading-relaxed">
            {STUDENT_VISA_WORK_LINKS.map((resource, index) => (
              <span key={resource.url}>
                {index > 0 && " · "}
                <a href={resource.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {resource.label}
                </a>
              </span>
            ))}
          </p>
        </div>

        <Disclaimer type="legal" text="Beginly's work-hours tracker is a personal record-keeping tool based on the standard 20-hour Student visa work limit. Rules vary by course level and sponsor, so always confirm your own conditions on gov.uk or with your university's international student office." />
      </div>
    </PlatformShell>
  );
}
