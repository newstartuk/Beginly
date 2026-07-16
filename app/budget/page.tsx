"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Plus,
  Printer,
  RotateCcw,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Disclaimer from "@/components/Disclaimer";
import BudgetSkeleton from "@/components/BudgetSkeleton";
import PlatformShell from "@/components/platform/PlatformShell";
import StatusPill from "@/components/platform/StatusPill";
import {
  currentMonthKey,
  formatMonthLabel,
  getBudgetForMonth,
  listSavedMonths,
  parseBudgetState,
  summariseBudgetMonth,
  updateMonthInState,
  type BudgetMonthStore,
} from "@/lib/budget-months";
import { getArrivalProfile } from "@/lib/utils";
import type { BudgetItem } from "@/types";

const STORAGE_KEY = "beginly_budget_monthly";
const LEGACY_STORAGE_KEY = "beginly_budget";

function getDefaults(): BudgetItem[] {
  const profile = getArrivalProfile();
  const isInLondon = profile?.city === "London";

  return [
    { id: "rent", category: "Accommodation", label: "Rent", amount: isInLondon ? 900 : 550, type: "expense", color: "#0B7285" },
    { id: "groceries", category: "Food", label: "Groceries", amount: isInLondon ? 200 : 150, type: "expense", color: "#0D9488" },
    { id: "uni", category: "University", label: "Tuition fees", amount: 0, type: "expense", color: "#6366F1" },
    { id: "transport", category: "Transport", label: "Transport (bus/train)", amount: isInLondon ? 150 : 80, type: "expense", color: "#F59E0B" },
    { id: "utilities", category: "Accommodation", label: "Bills (electric, gas, internet)", amount: isInLondon ? 120 : 80, type: "expense", color: "#8B5CF6" },
    { id: "phone", category: "Utilities", label: "Phone/SIM", amount: 15, type: "expense", color: "#EC4899" },
    { id: "social", category: "Social", label: "Social & leisure", amount: 80, type: "expense", color: "#F97316" },
    { id: "books", category: "University", label: "Books & materials", amount: 50, type: "expense", color: "#14B8A6" },
    { id: "savings", category: "Savings", label: "Savings target", amount: 200, type: "savings", color: "#22C55E" },
    { id: "loan", category: "Funding", label: "Student loan / stipend", amount: isInLondon ? 1200 : 900, type: "income", color: "#10B981" },
  ];
}

const CATEGORIES = ["Accommodation", "Food", "Transport", "University", "Social", "Utilities", "Health", "Savings", "Funding", "Other"];
const PIE_COLORS = ["#0B7285", "#0D9488", "#F59E0B", "#6366F1", "#EC4899", "#F97316", "#14B8A6", "#22C55E", "#8B5CF6", "#EF4444"];

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

function colourForCategory(category: string) {
  const index = CATEGORIES.indexOf(category);
  return PIE_COLORS[(index >= 0 ? index : CATEGORIES.length - 1) % PIE_COLORS.length];
}

export default function BudgetPage() {
  const defaultItems = useMemo(() => getDefaults(), []);
  const [budgetState, setBudgetState] = useState<BudgetMonthStore | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: "",
    amount: "",
    category: "Other",
    type: "expense" as BudgetItem["type"],
  });

  useEffect(() => {
    const fallbackMonth = currentMonthKey();
    let raw: string | null = null;

    if (typeof window !== "undefined") {
      raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    }

    setBudgetState(parseBudgetState(raw, defaultItems, fallbackMonth));
    setMounted(true);
  }, [defaultItems]);

  const selectedMonth = budgetState?.selectedMonth ?? currentMonthKey();
  const items = budgetState ? getBudgetForMonth(budgetState, selectedMonth, defaultItems) : [];
  const currentSummary = summariseBudgetMonth(items);

  const persistState = (nextState: BudgetMonthStore) => {
    setBudgetState(nextState);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  };

  const updateCurrentMonthItems = (nextItems: BudgetItem[]) => {
    const baseState = budgetState ?? parseBudgetState(null, defaultItems, selectedMonth);
    persistState(updateMonthInState(baseState, selectedMonth, nextItems));
  };

  const totalIncome = currentSummary.income;
  const totalExpenses = currentSummary.expenses;
  const totalSavings = currentSummary.savings;
  const netMonthly = currentSummary.net;

  const pieData = items
    .filter((item) => item.type === "expense")
    .map((item) => ({ name: item.label, value: item.amount }));

  const barData = [
    { name: "Income", amount: totalIncome, fill: "#10B981" },
    { name: "Expenses", amount: totalExpenses, fill: "#0B7285" },
    { name: "Savings", amount: totalSavings, fill: "#22C55E" },
  ];

  const addItem = () => {
    const parsedAmount = parseFloat(form.amount);

    if (!form.label.trim() || form.amount === "" || Number.isNaN(parsedAmount) || parsedAmount < 0) {
      return;
    }

    const newItem: BudgetItem = {
      id: `item_${Date.now()}`,
      label: form.label.trim(),
      amount: parsedAmount,
      category: form.category,
      type: form.type,
      color: colourForCategory(form.category),
    };

    updateCurrentMonthItems([...items, newItem]);
    setForm({ label: "", amount: "", category: "Other", type: "expense" });
    setShowForm(false);
  };

  const removeItem = (id: string) => {
    updateCurrentMonthItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, patch: Partial<BudgetItem>) => {
    const updated = items.map((item) => {
      if (item.id !== id) return item;

      const nextCategory = patch.category ?? item.category;

      return {
        ...item,
        ...patch,
        category: nextCategory,
        color: patch.color ?? colourForCategory(nextCategory),
      };
    });

    updateCurrentMonthItems(updated);
  };

  const changeMonth = (nextMonth: string) => {
    if (!nextMonth) return;

    const baseState = budgetState ?? parseBudgetState(null, defaultItems, nextMonth);
    const nextItems = baseState.months[nextMonth] ?? defaultItems;
    persistState(updateMonthInState(baseState, nextMonth, nextItems));
  };

  const resetMonth = () => {
    updateCurrentMonthItems(defaultItems);
  };

  const savedMonths = budgetState ? listSavedMonths(budgetState) : [];
  const monthHistory = savedMonths.map((monthKey) => {
    const monthItems = budgetState ? getBudgetForMonth(budgetState, monthKey, defaultItems) : defaultItems;
    return {
      monthKey,
      label: formatMonthLabel(monthKey),
      summary: summariseBudgetMonth(monthItems),
    };
  });

  if (!mounted) return <BudgetSkeleton />;

  return (
    <PlatformShell
      title="Budget Planner"
      eyebrow="Monthly budgeting with saved history"
      action={<StatusPill tone="positive">Old planner restored</StatusPill>}
    >
      <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold text-navy">Beginly - Budget Planner</h1>
          <p className="text-sm text-muted">
            Generated on {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <div className="mt-4 border-t border-border" />
        </div>

        <div className="flex items-start justify-between gap-3 no-print">
          <div>
            <h1 className="text-xl font-bold text-navy">Budget Planner</h1>
            <p className="text-sm text-muted mt-0.5">
              Use the fuller Beginly planner, now with saved monthly history from January through December.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => window.print()} className="btn-ghost text-sm hidden print:hidden" aria-label="Save budget as PDF">
              <Printer className="w-4 h-4" /> Save as PDF
            </button>
            <button onClick={() => setShowForm((value) => !value)} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Add item
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Budget month</p>
              <h2 className="section-title text-base mt-1">{formatMonthLabel(selectedMonth)}</h2>
              <p className="text-sm text-muted">
                Every month saves separately, so you can review January, February or any later month without losing the chart-based planner.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="block">
                <span className="input-label">Choose month</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(event) => changeMonth(event.target.value)}
                  className="input-field min-w-[180px]"
                />
              </label>
              <button onClick={resetMonth} className="btn-ghost text-sm">
                <RotateCcw className="w-4 h-4" /> Reset this month
              </button>
            </div>
          </div>
          {savedMonths.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Saved months</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {savedMonths.map((monthKey) => (
                  <button
                    key={monthKey}
                    type="button"
                    onClick={() => changeMonth(monthKey)}
                    className={monthKey === selectedMonth ? "btn-primary text-sm" : "btn-ghost text-sm"}
                  >
                    {formatMonthLabel(monthKey)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: `${formatMonthLabel(selectedMonth)} income`, amount: totalIncome, color: "text-green-600", bg: "bg-green-50 border-green-200" },
            { label: `${formatMonthLabel(selectedMonth)} expenses`, amount: totalExpenses, color: "text-red-600", bg: "bg-red-50 border-red-200" },
            { label: `${formatMonthLabel(selectedMonth)} savings`, amount: totalSavings, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
            { label: "Net remaining", amount: netMonthly, color: netMonthly >= 0 ? "text-green-600" : "text-red-600", bg: netMonthly >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200" },
          ].map(({ label, amount, color, bg }) => (
            <div key={label} className={`card border ${bg}`}>
              <p className="text-xs text-muted mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{GBP.format(amount)}</p>
            </div>
          ))}
        </div>

        {monthHistory.length > 1 ? (
          <div className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Monthly history</p>
                <h2 className="section-title text-sm mt-1">See how each saved month went</h2>
              </div>
              <StatusPill tone="info">{monthHistory.length} months saved</StatusPill>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {monthHistory.map((month) => (
                <button
                  key={month.monthKey}
                  type="button"
                  onClick={() => changeMonth(month.monthKey)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    month.monthKey === selectedMonth ? "border-primary bg-teal-50" : "border-border bg-white hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-navy">{month.label}</p>
                      <p className="mt-1 text-xs text-civic-600">Income {GBP.format(month.summary.income)}</p>
                      <p className="text-xs text-civic-600">Expenses {GBP.format(month.summary.expenses)}</p>
                      <p className="text-xs text-civic-600">Savings {GBP.format(month.summary.savings)}</p>
                    </div>
                    <span className={`text-sm font-bold ${month.summary.net >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {GBP.format(month.summary.net)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {netMonthly < 0 ? (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Your expenses exceed your income. Review this month before carrying the same pattern forward.</p>
          </div>
        ) : null}

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card">
            <h2 className="section-title text-sm">Spending breakdown</h2>
            {pieData.filter((item) => item.value > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData.filter((item) => item.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {pieData.filter((item) => item.value > 0).map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => GBP.format(value)} />
                  <Legend formatter={(value) => <span className="text-xs text-muted">{value}</span>} iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-muted">Add expenses to see your breakdown</div>
            )}
          </div>

          <div className="card">
            <h2 className="section-title text-sm">Income vs spending</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" tickFormatter={(value) => `£${value}`} tick={{ fontSize: 11, fill: "#627D98" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#627D98" }} width={70} />
                <Tooltip formatter={(value: number) => GBP.format(value)} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {showForm ? (
          <div className="card border-primary/30">
            <h2 className="section-title text-sm">Add a budget item</h2>
            <div className="grid sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="input-label">Label</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(event) => setForm({ ...form, label: event.target.value })}
                  className="input-field"
                  placeholder="e.g. Gym membership"
                />
              </div>
              <div>
                <label className="input-label">Amount (£)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(event) => setForm({ ...form, amount: event.target.value })}
                  className="input-field"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="input-label">Type</label>
                <select
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value as BudgetItem["type"] })}
                  className="select-field"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
            </div>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <div>
                <label className="input-label">Category</label>
                <select
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  className="select-field"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={addItem} className="btn-primary text-sm">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
              <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <div className="card">
          <h2 className="section-title text-sm">All budget items</h2>
          <div className="space-y-2">
            {(["income", "expense", "savings"] as BudgetItem["type"][]).map((type) => {
              const typeItems = items.filter((item) => item.type === type);
              if (typeItems.length === 0) return null;

              return (
                <div key={type}>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 mt-4 first:mt-0">
                    {type === "income" ? "Income" : type === "expense" ? "Expenses" : "Savings"}
                  </p>
                  <div className="space-y-2">
                    {typeItems.map((item) => (
                      <div key={item.id} className="rounded-xl bg-civic-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-2 h-16 rounded-full mt-1" style={{ backgroundColor: item.color || "#0B7285" }} />
                            <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_120px]">
                              <label className="block">
                                <span className="input-label">Label</span>
                                <input
                                  type="text"
                                  value={item.label}
                                  onChange={(event) => updateItem(item.id, { label: event.target.value })}
                                  className="input-field"
                                />
                              </label>
                              <label className="block">
                                <span className="input-label">Category</span>
                                <select
                                  value={item.category}
                                  onChange={(event) => updateItem(item.id, { category: event.target.value })}
                                  className="select-field"
                                >
                                  {CATEGORIES.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                  ))}
                                </select>
                              </label>
                              <label className="block">
                                <span className="input-label">Monthly amount</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.amount}
                                  onChange={(event) => updateItem(item.id, { amount: Math.max(0, Number(event.target.value) || 0) })}
                                  className="input-field"
                                />
                              </label>
                            </div>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-muted hover:text-red-500 p-1" aria-label={`Remove ${item.label}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3 pl-5">
                          <p className="text-xs text-muted">{item.category}</p>
                          <span className={`text-sm font-bold ${item.type === "income" ? "text-green-600" : item.type === "savings" ? "text-blue-600" : "text-red-600"}`}>
                            {item.type === "income" ? "+" : ""}{GBP.format(item.amount)}/mo
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {items.length === 0 ? (
            <div className="text-center py-10">
              <TrendingUp className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted">No budget items yet. Add your first item above.</p>
            </div>
          ) : null}
        </div>

        <div className="card bg-teal-50 border-primary/20">
          <p className="text-sm font-semibold text-navy mb-1">Budget tip for students</p>
          <p className="text-xs text-civic-600 leading-relaxed">
            Use the <strong>50/30/20 rule</strong> as a starting point: 50% of your income for essentials
            (rent, food, transport), 30% for personal spending (social, entertainment), and 20% for savings.
            Adjust to your situation - as a student, essentials may be higher.
          </p>
        </div>

        <Disclaimer type="financial" />
      </div>
    </PlatformShell>
  );
}
