"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Disclaimer from "@/components/Disclaimer";
import type { BudgetItem } from "@/types";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, Trash2, Plus, AlertTriangle, Printer } from "lucide-react";
import BudgetSkeleton from "@/components/BudgetSkeleton";

const CATEGORIES = ["Accommodation", "Food", "Transport", "University", "Social", "Utilities", "Health", "Savings", "Funding", "Other"];
const PIE_COLORS = ["#0B7285", "#0D9488", "#F59E0B", "#6366F1", "#EC4899", "#F97316", "#14B8A6", "#22C55E", "#8B5CF6", "#EF4444"];

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

// Budget data now lives in Supabase (public.budget_items), same as your
// checklist. Reads/writes go through /api/budget rather than straight from
// the browser to Supabase, because this app's custom auth token isn't a
// Supabase Auth session — so the row-level security on budget_items (which
// checks auth.uid()) would silently reject a direct browser call.
function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("custom_auth_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function BudgetPage() {
  const router = useRouter();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", amount: "", category: "Other", type: "expense" as BudgetItem["type"] });

  useEffect(() => {
    let mounted = true;

    async function load() {
      // Don't gate on localStorage having a token — the session is also
      // carried by an httpOnly cookie the browser sends automatically, and
      // that cookie is the more reliable of the two. Just make the request
      // and let a 401 response (not a missing localStorage key) decide
      // whether to redirect to /login.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const res = await fetch("/api/budget", { headers: authHeaders(), signal: controller.signal });
        if (res.status === 401) { router.push("/login"); return; }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load budget.");

        if (!mounted) return;
        setItems((data.items ?? []) as BudgetItem[]);
      } catch (err: unknown) {
        if (!mounted) return;
        const isAbort = err instanceof Error && err.name === "AbortError";
        console.error("Budget load failed:", err instanceof Error ? err.message : String(err));
        setLoadError(
          isAbort
            ? "This is taking longer than expected. Please try again."
            : "We couldn't load your budget. Please try again."
        );
      } finally {
        clearTimeout(timeoutId);
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [router]);

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

  const addItem = async () => {
    const parsedAmount = parseFloat(form.amount);
    if (!form.label.trim() || form.amount === "" || isNaN(parsedAmount) || parsedAmount < 0) return;

    setActionError("");
    const newItemData = {
      label: form.label.trim(),
      amount: parsedAmount,
      category: form.category,
      type: form.type,
      color: PIE_COLORS[CATEGORIES.indexOf(form.category) % PIE_COLORS.length],
    };

    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(newItemData),
      });
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save item.");

      setItems((prev) => [...prev, data.item as BudgetItem]);
      setForm({ label: "", amount: "", category: "Other", type: "expense" });
      setShowForm(false);
    } catch (err: unknown) {
      console.error("Budget item save failed:", err instanceof Error ? err.message : String(err));
      setActionError("We couldn't save that item. Please try again.");
    }
  };

  const removeItem = async (id: string) => {
    const previous = items;
    setActionError("");
    setItems((prev) => prev.filter((i) => i.id !== id));

    try {
      const res = await fetch(`/api/budget?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete item.");
    } catch (err: unknown) {
      console.error("Budget item delete failed:", err instanceof Error ? err.message : String(err));
      setItems(previous);
      setActionError("We couldn't remove that item. Please try again.");
    }
  };

  if (loading) return <BudgetSkeleton />;

  if (loadError) {
    return (
      <Navigation>
        <div className="max-w-md mx-auto mt-16 text-center space-y-3">
          <p className="text-sm font-semibold text-navy">We couldn&apos;t load your budget</p>
          <p className="text-xs text-muted">{loadError}</p>
          <button onClick={() => window.location.reload()} className="btn-primary text-sm">Try again</button>
        </div>
      </Navigation>
    );
  }

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

        {actionError && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-sm no-print">
            {actionError}
          </div>
        )}

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
