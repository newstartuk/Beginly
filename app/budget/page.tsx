"use client";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Disclaimer from "@/components/Disclaimer";
import { getArrivalProfile } from "@/lib/utils";
import type { BudgetItem } from "@/types";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, Trash2, Plus, AlertTriangle, Printer } from "lucide-react";
import BudgetSkeleton from "@/components/BudgetSkeleton";

const STORAGE_KEY = "beginly_budget";

function loadBudget(): BudgetItem[] {
  if (typeof window === "undefined") return getDefaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BudgetItem[];
  } catch { /* ignore */ }
  return getDefaults();
}

function saveBudget(items: BudgetItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

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
const TYPES = ["expense", "income", "savings"] as const;
const PIE_COLORS = ["#0B7285", "#0D9488", "#F59E0B", "#6366F1", "#EC4899", "#F97316", "#14B8A6", "#22C55E", "#8B5CF6", "#EF4444"];

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

export default function BudgetPage() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", amount: "", category: "Other", type: "expense" as BudgetItem["type"] });

  useEffect(() => {
    setItems(loadBudget());
    setMounted(true);
  }, []);

  const totalIncome = items.filter((i) => i.type === "income").reduce((s, i) => s + i.amount, 0);
  const totalExpenses = items.filter((i) => i.type === "expense").reduce((s, i) => s + i.amount, 0);
  const totalSavings = items.filter((i) => i.type === "savings").reduce((s, i) => s + i.amount, 0);
  const netMonthly = totalIncome - totalExpenses - totalSavings;

  const pieData = items.filter((i) => i.type === "expense").map((i) => ({ name: i.label, value: i.amount }));

  const barData = [
    { name: "Income", amount: totalIncome, fill: "#10B981" },
    { name: "Expenses", amount: totalExpenses, fill: "#0B7285" },
    { name: "Savings", amount: totalSavings, fill: "#22C55E" },
  ];

  const addItem = () => {
    const parsedAmount = parseFloat(form.amount);
    if (!form.label.trim() || form.amount === "" || isNaN(parsedAmount) || parsedAmount < 0) return;
    const newItem: BudgetItem = {
      id: `item_${Date.now()}`,
      label: form.label.trim(),
      amount: parseFloat(form.amount),
      category: form.category,
      type: form.type,
      color: PIE_COLORS[CATEGORIES.indexOf(form.category) % PIE_COLORS.length],
    };
    const updated = [...items, newItem];
    setItems(updated);
    saveBudget(updated);
    setForm({ label: "", amount: "", category: "Other", type: "expense" });
    setShowForm(false);
  };

  const removeItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    saveBudget(updated);
  };

  if (!mounted) return <BudgetSkeleton />;

  return (
    <Navigation>
      <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
        {/* Print-only header */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold text-navy">Beginly — Budget Planner</h1>
          <p className="text-sm text-muted">Generated on {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          <div className="mt-4 border-t border-border" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 no-print">
          <div>
            <h1 className="text-xl font-bold text-navy">Budget Planner</h1>
            <p className="text-sm text-muted mt-0.5">Plan your monthly income and expenses</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="btn-ghost text-sm hidden print:hidden"
              aria-label="Save budget as PDF"
            >
              <Printer className="w-4 h-4" /> Save as PDF
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary text-sm"
            >
              <Plus className="w-4 h-4" /> Add item
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Monthly income", amount: totalIncome, color: "text-green-600", bg: "bg-green-50 border-green-200" },
            { label: "Monthly expenses", amount: totalExpenses, color: "text-red-600", bg: "bg-red-50 border-red-200" },
            { label: "Monthly savings", amount: totalSavings, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
            { label: "Net remaining", amount: netMonthly, color: netMonthly >= 0 ? "text-green-600" : "text-red-600", bg: netMonthly >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200" },
          ].map(({ label, amount, color, bg }) => (
            <div key={label} className={`card border ${bg}`}>
              <p className="text-xs text-muted mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{GBP.format(amount)}</p>
            </div>
          ))}
        </div>

        {netMonthly < 0 && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Your expenses exceed your income. Review your spending to avoid running a deficit.</p>
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Pie chart */}
          <div className="card">
            <h2 className="section-title text-sm">Spending breakdown</h2>
            {pieData.filter((d) => d.value > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData.filter((d) => d.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {pieData.filter((d) => d.value > 0).map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => GBP.format(v)} />
                  <Legend
                    formatter={(value) => <span className="text-xs text-muted">{value}</span>}
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-muted">
                Add expenses to see your breakdown
              </div>
            )}
          </div>

          {/* Bar chart */}
          <div className="card">
            <h2 className="section-title text-sm">Income vs spending</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" tickFormatter={(v) => `£${v}`} tick={{ fontSize: 11, fill: "#627D98" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#627D98" }} width={70} />
                <Tooltip formatter={(v: number) => GBP.format(v)} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Add item form */}
        {showForm && (
          <div className="card border-primary/30">
            <h2 className="section-title text-sm">Add a budget item</h2>
            <div className="grid sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="input-label">Label</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Gym membership"
                />
              </div>
              <div>
                <label className="input-label">Amount (£)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="input-field"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="input-label">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as BudgetItem["type"] })}
                  className="select-field"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="savings">Savings</option>
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
        )}

        {/* Item list */}
        <div className="card">
          <h2 className="section-title text-sm">All budget items</h2>
          <div className="space-y-2">
            {["income", "expense", "savings"].map((type) => {
              const typeItems = items.filter((i) => i.type === type);
              if (typeItems.length === 0) return null;
              return (
                <div key={type}>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 mt-4 first:mt-0">
                    {type === "income" ? "Income" : type === "expense" ? "Expenses" : "Savings"}
                  </p>
                  <div className="space-y-1">
                    {typeItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-civic-50 rounded-xl group">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-8 rounded-full" style={{ backgroundColor: item.color || "#0B7285" }} />
                          <div>
                            <p className="text-sm font-medium text-navy">{item.label}</p>
                            <p className="text-xs text-muted">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-bold ${item.type === "income" ? "text-green-600" : item.type === "savings" ? "text-blue-600" : "text-red-600"}`}>
                            {item.type === "income" ? "+" : ""}{GBP.format(item.amount)}/mo
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {items.length === 0 && (
            <div className="text-center py-10">
              <TrendingUp className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted">No budget items yet. Add your first item above.</p>
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="card bg-teal-50 border-primary/20">
          <p className="text-sm font-semibold text-navy mb-1">💡 Budget tip for students</p>
          <p className="text-xs text-civic-600 leading-relaxed">
            Use the <strong>50/30/20 rule</strong> as a starting point: 50% of your income for essentials (rent, food, transport), 30% for personal spending (social, entertainment), and 20% for savings. Adjust to your situation — as a student, essentials may be higher.
          </p>
        </div>

        <Disclaimer type="financial" />
      </div>
    </Navigation>
  );
}
