import { describe, expect, it } from "vitest";
import type { BudgetItem } from "@/types";
import {
  createMonthlyBudgetState,
  currentMonthKey,
  formatMonthLabel,
  getBudgetForMonth,
  listSavedMonths,
  parseBudgetState,
  summariseBudgetMonth,
  updateMonthInState,
} from "@/lib/budget-months";

const defaults: BudgetItem[] = [
  { id: "rent", label: "Rent", amount: 800, category: "Accommodation", type: "expense", color: "#000" },
  { id: "loan", label: "Loan", amount: 1200, category: "Funding", type: "income", color: "#111" },
];

describe("budget month helpers", () => {
  it("builds a YYYY-MM month key", () => {
    expect(currentMonthKey(new Date("2026-07-16T12:00:00Z"))).toBe("2026-07");
  });

  it("creates starter state for the selected month", () => {
    const state = createMonthlyBudgetState(defaults, "2026-07");
    expect(state.selectedMonth).toBe("2026-07");
    expect(state.months["2026-07"]).toEqual(defaults);
  });

  it("migrates legacy single-month arrays into the fallback month", () => {
    const state = parseBudgetState(JSON.stringify(defaults), defaults, "2026-02");
    expect(state.selectedMonth).toBe("2026-02");
    expect(state.months["2026-02"]).toEqual(defaults);
  });

  it("fills in missing selected month data with defaults", () => {
    const raw = JSON.stringify({
      selectedMonth: "2026-03",
      months: {
        "2026-01": defaults,
      },
    });
    const state = parseBudgetState(raw, defaults, "2026-07");
    expect(state.months["2026-03"]).toEqual(defaults);
  });

  it("updates one month without losing another", () => {
    const state = parseBudgetState(
      JSON.stringify({
        selectedMonth: "2026-02",
        months: {
          "2026-01": defaults,
          "2026-02": defaults,
        },
      }),
      defaults,
      "2026-02",
    );

    const updated = updateMonthInState(state, "2026-02", [
      { ...defaults[0], amount: 950 },
      defaults[1],
    ]);

    expect(updated.months["2026-01"]).toEqual(defaults);
    expect(updated.months["2026-02"][0].amount).toBe(950);
    expect(getBudgetForMonth(updated, "2026-01", defaults)[0].amount).toBe(800);
  });

  it("lists saved months newest first", () => {
    const state = parseBudgetState(
      JSON.stringify({
        selectedMonth: "2026-03",
        months: {
          "2026-01": defaults,
          "2026-03": defaults,
          "2026-02": defaults,
        },
      }),
      defaults,
      "2026-03",
    );

    expect(listSavedMonths(state)).toEqual(["2026-03", "2026-02", "2026-01"]);
  });

  it("formats month keys for display", () => {
    expect(formatMonthLabel("2026-07")).toBe("July 2026");
  });

  it("summarises income, expenses, savings and net", () => {
    const summary = summariseBudgetMonth([
      { id: "rent", label: "Rent", amount: 800, category: "Accommodation", type: "expense", color: "#000" },
      { id: "food", label: "Food", amount: 100, category: "Food", type: "expense", color: "#222" },
      { id: "job", label: "Job", amount: 1400, category: "Funding", type: "income", color: "#333" },
      { id: "save", label: "Save", amount: 200, category: "Savings", type: "savings", color: "#444" },
    ]);

    expect(summary).toEqual({
      income: 1400,
      expenses: 900,
      savings: 200,
      net: 300,
    });
  });
});
