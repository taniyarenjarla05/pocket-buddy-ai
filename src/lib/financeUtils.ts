export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  mood: string;
  paymentMode: string;
  isSubscription: boolean;
}

export interface UserData {
  name: string;
  email: string;
  monthlyIncome: number;
  hostelRent: number;
  userType: "student" | "professional";
}

export interface BudgetLimits {
  daily: number;
  weekly: number;
}

const EXPENSES_KEY = "mypocket_expenses";
const LIMITS_KEY = "mypocket_limits";
const ALERTS_KEY = "mypocket_alerts";

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function alignDateToCurrentYear(date: string): string {
  const [, month, day] = date.split("-");
  return `${new Date().getFullYear()}-${month}-${day}`;
}

export function getUser(): UserData | null {
  const d = localStorage.getItem("mypocket_user");
  if (!d) return null;

  const parsed = JSON.parse(d);

  return {
    name: parsed.name || "User",
    email: parsed.email || "",
    monthlyIncome: Number(parsed.monthlyIncome) || 0,
    hostelRent: Number(parsed.hostelRent) || 0,
    userType: parsed.userType === "professional" ? "professional" : "student",
  };
}

export function getExpenses(): Expense[] {
  const d = localStorage.getItem(EXPENSES_KEY);
  return d ? JSON.parse(d) : [];
}

export function addExpense(exp: Omit<Expense, "id">) {
  const all = getExpenses();
  all.push({ ...exp, id: crypto.randomUUID() });
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(all));
  return all;
}

export function deleteExpense(id: string) {
  const all = getExpenses().filter((e) => e.id !== id);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(all));
  return all;
}

export function getBudgetLimits(): BudgetLimits {
  const d = localStorage.getItem(LIMITS_KEY);
  return d ? JSON.parse(d) : { daily: 1000, weekly: 5000 };
}

export function setBudgetLimits(limits: BudgetLimits) {
  localStorage.setItem(LIMITS_KEY, JSON.stringify(limits));
}

export function getAlertCount(): number {
  return Number(localStorage.getItem(ALERTS_KEY) || "0");
}

export function incrementAlertCount() {
  const c = getAlertCount() + 1;
  localStorage.setItem(ALERTS_KEY, String(c));
  return c;
}

export function getMonthlySpending(expenses: Expense[], month?: number): number {
  const now = new Date();
  const m = month ?? now.getMonth();
  const y = now.getFullYear();
  return expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === m && d.getFullYear() === y;
    })
    .reduce((s, e) => s + e.amount, 0);
}

export function getTodaySpending(expenses: Expense[]): number {
  const today = toDateKey(new Date());
  return expenses.filter((e) => e.date === today).reduce((s, e) => s + e.amount, 0);
}

export function getWeekSpending(expenses: Expense[]): number {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  return expenses
    .filter((e) => new Date(e.date) >= weekAgo)
    .reduce((s, e) => s + e.amount, 0);
}

export function getCategoryTotals(expenses: Expense[]): Record<string, number> {
  const totals: Record<string, number> = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  return totals;
}

// Simple ensemble prediction using moving averages + weighted recent trend
export function predictMonthlySpending(expenses: Expense[]): number {
  if (expenses.length < 7) return 0;
  
  // Group by month
  const monthly: Record<string, number> = {};
  expenses.forEach((e) => {
    const key = e.date.substring(0, 7);
    monthly[key] = (monthly[key] || 0) + e.amount;
  });
  
  const values = Object.values(monthly);
  if (values.length === 0) return 0;
  
  // Simple Moving Average
  const sma = values.reduce((a, b) => a + b, 0) / values.length;
  
  // Weighted Moving Average (recent months weight more)
  let wma = 0, wTotal = 0;
  values.forEach((v, i) => {
    const w = i + 1;
    wma += v * w;
    wTotal += w;
  });
  wma /= wTotal;
  
  // Exponential smoothing
  let ema = values[0];
  const alpha = 0.3;
  values.forEach((v) => { ema = alpha * v + (1 - alpha) * ema; });
  
  // Ensemble: average of all three
  return Math.round((sma + wma + ema) / 3);
}

export function getDailySpendingData(expenses: Expense[]): { date: string; amount: number }[] {
  const daily: Record<string, number> = {};
  expenses.forEach((e) => {
    daily[e.date] = (daily[e.date] || 0) + e.amount;
  });
  return Object.entries(daily)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));
}

export function getPredictedDailyData(expenses: Expense[]): { date: string; predicted: number }[] {
  const daily = getDailySpendingData(expenses);
  if (daily.length < 3) return [];
  
  // Use exponential smoothing for daily predictions
  const result: { date: string; predicted: number }[] = [];
  let ema = daily[0].amount;
  const alpha = 0.3;
  
  daily.forEach((d) => {
    result.push({ date: d.date, predicted: Math.round(ema) });
    ema = alpha * d.amount + (1 - alpha) * ema;
  });
  
  // Predict next 30 days
  const lastDate = new Date(daily[daily.length - 1].date);
  for (let i = 1; i <= 30; i++) {
    const nextDate = new Date(lastDate.getTime() + i * 86400000);
    result.push({
      date: nextDate.toISOString().split("T")[0],
      predicted: Math.round(ema),
    });
  }
  
  return result;
}

export function getSmartInsights(expenses: Expense[], user: UserData): string[] {
  const insights: string[] = [];
  const cats = getCategoryTotals(expenses);
  const total = Object.values(cats).reduce((a, b) => a + b, 0);
  
  if (total === 0) return ["Start logging expenses to get smart insights!"];
  
  // Find top category
  const topCat = Object.entries(cats).sort(([, a], [, b]) => b - a)[0];
  if (topCat) {
    const pct = Math.round((topCat[1] / total) * 100);
    insights.push(`${topCat[0]} takes ${pct}% of your spending`);
  }
  
  // Hostel student specific
  if (user.userType === "student" && user.hostelRent > 0) {
    const remaining = user.monthlyIncome - user.hostelRent;
    const safeDailyLimit = Math.round(remaining / 30);
    insights.push(`After rent, keep daily spending under ₹${safeDailyLimit}`);
  }
  
  // Weekly comparison
  const weekTotal = getWeekSpending(expenses);
  const avgWeekly = total / Math.max(1, Math.ceil(expenses.length / 7));
  if (weekTotal > avgWeekly * 1.2) {
    insights.push(`This week's spending is ${Math.round(((weekTotal - avgWeekly) / avgWeekly) * 100)}% above average`);
  }
  
  // Savings insight
  const savings = user.monthlyIncome - getMonthlySpending(expenses);
  if (savings > 0) {
    insights.push(`You can save ₹${savings.toLocaleString()} this month!`);
  } else {
    insights.push(`⚠️ You've overspent by ₹${Math.abs(savings).toLocaleString()} this month`);
  }
  
  return insights;
}

export function getYearlySpending(expenses: Expense[]): number {
  const y = new Date().getFullYear();
  return expenses
    .filter((e) => new Date(e.date).getFullYear() === y)
    .reduce((s, e) => s + e.amount, 0);
}

export function getSavingsTips(expenses: Expense[], user: UserData): string[] {
  const tips: string[] = [];
  const cats = getCategoryTotals(expenses);
  const total = Object.values(cats).reduce((a, b) => a + b, 0);
  if (total === 0) return ["Start tracking expenses to get saving tips!"];

  const sorted = Object.entries(cats).sort(([, a], [, b]) => b - a);
  if (sorted[0]) {
    const [topCategory, topAmount] = sorted[0];
    const pct = Math.round((topAmount / total) * 100);
    if (pct > 28) {
      const possibleSave = Math.round(topAmount * 0.15);
      tips.push(`${topCategory} is taking ₹${topAmount.toLocaleString()} (${pct}% of your spend) — trimming it by 15% can save about ₹${possibleSave.toLocaleString()}`);
    }
  }

  const subs = expenses.filter((e) => e.isSubscription);
  if (subs.length > 0) {
    const subTotal = subs.reduce((s, e) => s + e.amount, 0);
    tips.push(`Subscriptions are costing ₹${subTotal.toLocaleString()} — canceling unused recurring payments will free up fixed monthly money`);
  }

  if (cats["Shopping"] && cats["Shopping"] > total * 0.2) {
    tips.push(`Shopping alone is ₹${cats["Shopping"].toLocaleString()} — set a weekly cap to avoid impulse buys`);
  }
  if (cats["Food"] && cats["Food"] > total * 0.35) {
    const foodPct = Math.round((cats["Food"] / total) * 100);
    tips.push(`Food is ${foodPct}% of your spending — a few home-cooked meals each week can cut this category fast`);
  }

  if (user.userType === "student") {
    const safeDaily = Math.max(0, Math.round((user.monthlyIncome - user.hostelRent) / 30));
    tips.push(`As a student, aim to keep flexible spending near ₹${safeDaily.toLocaleString()} per day after rent and use student discounts wherever possible`);
  }

  if (tips.length === 0) tips.push("You're doing great! Keep tracking to find more savings.");
  return tips;
}

// Load CSV sample data
export async function loadSampleData(): Promise<Expense[]> {
  try {
    const res = await fetch("/data/spending_data.csv");
    const text = await res.text();
    const lines = text.trim().split("\n").slice(1);
    const expenses: Expense[] = lines.map((line) => {
      const [date, amount, category, mood, payment_mode, is_subscription] = line.split(",");
      return {
        id: crypto.randomUUID(),
        date: alignDateToCurrentYear(date),
        amount: Number(amount),
        category: category === "Transport" ? "Travel" : category,
        mood,
        paymentMode: payment_mode,
        isSubscription: is_subscription === "1",
      };
    });
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    return expenses;
  } catch {
    return [];
  }
}
