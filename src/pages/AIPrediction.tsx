import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import {
  getDailySpendingData, getPredictedDailyData,
  predictMonthlySpending, getCategoryTotals, getMonthlySpending,
  type Expense, type UserData,
} from "@/lib/financeUtils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend, BarChart, Bar,
} from "recharts";

const COLORS = [
  "hsl(174, 72%, 56%)", "hsl(250, 60%, 65%)", "hsl(340, 75%, 60%)",
  "hsl(38, 92%, 60%)", "hsl(142, 60%, 50%)", "hsl(210, 80%, 60%)",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg p-2 text-xs">
      <p className="text-muted-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: ₹{p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const AIPrediction: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (!authUser) return;
    const load = async () => {
      const { data: expData } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", authUser.id);
      if (expData) {
        setExpenses(expData.map((e: any) => ({
          id: e.id,
          date: e.date,
          amount: Number(e.amount),
          category: e.category,
          mood: e.mood,
          paymentMode: e.payment_mode,
          isSubscription: e.is_subscription,
        })));
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .single();
      if (profile) {
        setUser({
          name: profile.name || "User",
          email: profile.email || "",
          monthlyIncome: Number(profile.monthly_income) || 0,
          hostelRent: Number(profile.hostel_rent) || 0,
          userType: profile.user_type === "professional" ? "professional" : "student",
        });
      }
    };
    load();
  }, [authUser]);

  const predicted = useMemo(() => predictMonthlySpending(expenses), [expenses]);
  const actualMonthly = useMemo(() => getMonthlySpending(expenses), [expenses]);
  const dailyData = useMemo(() => getDailySpendingData(expenses).slice(-30), [expenses]);
  const predictedData = useMemo(() => getPredictedDailyData(expenses), [expenses]);
  const catTotals = useMemo(() => getCategoryTotals(expenses), [expenses]);

  const pieData = Object.entries(catTotals).map(([name, value]) => ({ name, value }));

  // Merge actual and predicted for comparison
  const comparisonData = useMemo(() => {
    const actualMap: Record<string, number> = {};
    dailyData.forEach((d) => { actualMap[d.date] = d.amount; });
    const predMap: Record<string, number> = {};
    predictedData.forEach((d) => { predMap[d.date] = d.predicted; });
    const allDates = new Set([...Object.keys(actualMap), ...Object.keys(predMap)]);
    return Array.from(allDates).sort().slice(-60).map((date) => ({
      date: date.substring(5),
      actual: actualMap[date] || 0,
      predicted: predMap[date] || 0,
    }));
  }, [dailyData, predictedData]);

  // Monthly totals for bar chart
  const monthlyData = useMemo(() => {
    const monthly: Record<string, number> = {};
    expenses.forEach((e) => {
      const key = e.date.substring(0, 7);
      monthly[key] = (monthly[key] || 0) + e.amount;
    });
    return Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)).map(([month, total]) => ({
      month: month.substring(5),
      total,
    }));
  }, [expenses]);

  // Where to save insights
  const saveTips = useMemo(() => {
    const sorted = Object.entries(catTotals).sort(([, a], [, b]) => b - a);
    const tips: string[] = [];
    if (sorted.length > 0) tips.push(`Reduce ${sorted[0][0]} spending — it's your top expense at ₹${sorted[0][1].toLocaleString()}`);
    if (sorted.length > 1) tips.push(`${sorted[1][0]} is your 2nd highest — try cutting 20% next month`);
    if (user?.userType === "student") tips.push("Cook meals instead of ordering — save up to ₹3,000/month");
    tips.push("Set up auto-reminders to track expenses daily");
    return tips;
  }, [catTotals, user]);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="flex-1 flex items-center justify-center px-4">
          <GlassCard className="text-center">
            <Brain className="w-12 h-12 text-primary mx-auto mb-3 animate-float" />
            <h2 className="font-heading font-bold text-foreground text-lg">No Data Yet</h2>
            <p className="text-muted-foreground text-sm mt-1">Load sample data or add expenses to see AI predictions</p>
          </GlassCard>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-4 pt-4 pb-4 space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold font-heading text-foreground">AI Predictions</h1>
        </div>

        {/* Prediction summary */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard glow>
            <p className="text-xs text-muted-foreground">Predicted Monthly</p>
            <p className="text-xl font-bold font-heading text-primary">₹{predicted.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Ensemble ML Model</p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs text-muted-foreground">Actual This Month</p>
            <p className="text-xl font-bold font-heading text-accent">₹{actualMonthly.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Current spending</p>
          </GlassCard>
        </div>

        {/* Actual vs Predicted Chart */}
        <GlassCard>
          <p className="text-sm font-heading font-semibold text-foreground mb-3">📈 Actual vs Predicted (Daily)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={comparisonData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(340, 75%, 60%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(340, 75%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(215, 20%, 55%)" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: "hsl(215, 20%, 55%)" }} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="actual" stroke="hsl(340, 75%, 60%)" fill="url(#colorActual)" strokeWidth={2} name="Actual" />
              <Area type="monotone" dataKey="predicted" stroke="hsl(174, 72%, 56%)" fill="url(#colorPred)" strokeWidth={2} name="Predicted" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Monthly trend */}
        <GlassCard>
          <p className="text-sm font-heading font-semibold text-foreground mb-3">📊 Monthly Spending Trend</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: "hsl(215, 20%, 55%)" }} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(215, 20%, 55%)" }} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Total" fill="hsl(250, 60%, 65%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Category pie */}
        <GlassCard>
          <p className="text-sm font-heading font-semibold text-foreground mb-3">🍰 Category Breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Where to Save */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-success" />
            <p className="text-sm font-heading font-semibold text-foreground">💡 Where to Save</p>
          </div>
          {saveTips.map((tip, i) => (
            <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              className="text-xs text-foreground/80 mb-2 flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span> {tip}
            </motion.p>
          ))}
        </GlassCard>
      </div>
      <BottomNav />
    </div>
  );
};

export default AIPrediction;
