import type { BudgetItem } from "@/types";

export interface BudgetMonthStore {
  selectedMonth: string;
  months: Record<string, BudgetItem[]>;
}

export interface BudgetMonthSummary {
  income: number;
  expenses: number;
  savings: number;
  net: number;
}

function cloneItems(items: BudgetItem[]): BudgetItem[] {
  return items.map((item) => ({ ...item }));
}

export function currentMonthKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) return monthKey;

  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function createMonthlyBudgetState(
  defaultItems: BudgetItem[],
  selectedMonth = currentMonthKey(),
): BudgetMonthStore {
  return {
    selectedMonth,
    months: {
      [selectedMonth]: cloneItems(defaultItems),
    },
  };
}

export function parseBudgetState(
  raw: string | null,
  defaultItems: BudgetItem[],
  fallbackMonth = currentMonthKey(),
): BudgetMonthStore {
  if (!raw) return createMonthlyBudgetState(defaultItems, fallbackMonth);

  try {
    const parsed = JSON.parse(raw) as BudgetMonthStore | BudgetItem[];

    if (Array.isArray(parsed)) {
      return {
        selectedMonth: fallbackMonth,
        months: {
          [fallbackMonth]: cloneItems(parsed),
        },
      };
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.selectedMonth === "string" &&
      parsed.months &&
      typeof parsed.months === "object"
    ) {
      const months = Object.fromEntries(
        Object.entries(parsed.months)
          .filter((entry): entry is [string, BudgetItem[]] => Array.isArray(entry[1]))
          .map(([monthKey, items]) => [monthKey, cloneItems(items)]),
      );

      const selectedMonth = parsed.selectedMonth || fallbackMonth;

      if (Object.keys(months).length === 0) {
        months[selectedMonth] = cloneItems(defaultItems);
      }

      if (!months[selectedMonth]) {
        months[selectedMonth] = cloneItems(defaultItems);
      }

      return {
        selectedMonth,
        months,
      };
    }
  } catch {
    // Ignore invalid storage and fall back to defaults.
  }

  return createMonthlyBudgetState(defaultItems, fallbackMonth);
}

export function updateMonthInState(
  state: BudgetMonthStore,
  monthKey: string,
  items: BudgetItem[],
): BudgetMonthStore {
  return {
    ...state,
    selectedMonth: monthKey,
    months: {
      ...state.months,
      [monthKey]: cloneItems(items),
    },
  };
}

export function getBudgetForMonth(
  state: BudgetMonthStore,
  monthKey: string,
  defaultItems: BudgetItem[],
): BudgetItem[] {
  return cloneItems(state.months[monthKey] ?? defaultItems);
}

export function listSavedMonths(state: BudgetMonthStore): string[] {
  return Object.keys(state.months).sort((a, b) => b.localeCompare(a));
}

export function summariseBudgetMonth(items: BudgetItem[]): BudgetMonthSummary {
  const income = items
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenses = items
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const savings = items
    .filter((item) => item.type === "savings")
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    income,
    expenses,
    savings,
    net: income - expenses - savings,
  };
}
