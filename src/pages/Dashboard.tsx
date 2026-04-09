import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet, TrendingDown, PiggyBank, AlertTriangle, Lightbulb, Download, Calendar as CalIcon, TrendingUp,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import {
  getUser, getExpenses, getMonthlySpending, getTodaySpending,
  getAlertCount, getSmartInsights, getBudgetLimits, getWeekSpending,
  loadSampleData, getYearlySpending, getSavingsTips,
  type Expense, type UserData,
} from "@/lib/financeUtils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const u = getUser();
    if (!u) { navigate("/"); return; }
    setUser(u);
    setExpenses(getExpenses());
  }, [navigate]);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLoadSample = async () => {
    const data = await loadSampleData();
    setExpenses(data);
    toast({ title: `Loaded ${data.length} sample transactions 📊` });
  };

  if (!user) return null;

  const now = new Date();
  const monthlySpent = getMonthlySpending(expenses);
  const yearlySpent = getYearlySpending(expenses);
  const savings = user.monthlyIncome - (user.hostelRent || 0) - monthlySpent;
  const todaySpent = getTodaySpending(expenses);
  const weekSpent = getWeekSpending(expenses);
  const limits = getBudgetLimits();
  const dailyOver = todaySpent > limits.daily;
  const weeklyOver = weekSpent > limits.weekly;
  const insights = getSmartInsights(expenses, user);
  const savingsTips = getSavingsTips(expenses, user);

  const monthName = now.toLocaleString("default", { month: "long" });
  const greeting = time.getHours() < 12 ? "morning" : time.getHours() < 17 ? "afternoon" : "evening";
  const timeStr = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

  const statCards = [
    { icon: Wallet, label: "Balance", value: `₹${(user.monthlyIncome - monthlySpent).toLocaleString()}`, color: "text-primary" },
    { icon: TrendingDown, label: `${monthName} Spent`, value: `₹${monthlySpent.toLocaleString()}`, color: "text-accent" },
    { icon: PiggyBank, label: "Savings", value: `₹${Math.max(0, savings).toLocaleString()}`, color: "text-success" },
    { icon: AlertTriangle, label: "Alerts", value: String(getAlertCount()), color: "text-warning" },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-4 pt-4 pb-4 space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs">Good {greeting},</p>
            <h1 className="text-xl font-bold font-heading text-foreground">{user.name} 👋</h1>
            <p className="text-xs text-primary font-mono mt-0.5">{timeStr}</p>
          </div>
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">{user.name[0]}</span>
          </div>
        </motion.div>

        {/* Hostel student banner */}
        {user.userType === "student" && user.hostelRent > 0 && (
          <GlassCard className="border-l-4 border-l-primary">
            <p className="text-xs text-muted-foreground">After hostel rent (₹{user.hostelRent.toLocaleString()})</p>
            <p className="text-lg font-bold font-heading text-foreground">
              ₹{(user.monthlyIncome - user.hostelRent).toLocaleString()} <span className="text-xs text-muted-foreground font-normal">remaining</span>
            </p>
            <p className="text-xs text-primary mt-1">
              Safe daily limit: ₹{Math.round((user.monthlyIncome - user.hostelRent) / 30).toLocaleString()}
            </p>
          </GlassCard>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((s, i) => (
            <GlassCard key={s.label}>
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-lg font-bold font-heading ${s.color}`}>{s.value}</p>
              </motion.div>
            </GlassCard>
          ))}
        </div>

        {/* Yearly spending */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-secondary" />
            <span className="font-heading font-semibold text-foreground text-sm">Yearly Spending ({now.getFullYear()})</span>
          </div>
          <p className="text-2xl font-bold font-heading text-secondary">₹{yearlySpent.toLocaleString()}</p>
        </GlassCard>

        {/* Budget alerts */}
        {(dailyOver || weeklyOver) && (
          <GlassCard className="border border-destructive/30 glow-accent">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-accent animate-pulse" />
              <span className="font-heading font-semibold text-accent text-sm">Overspending Alert!</span>
            </div>
            {dailyOver && <p className="text-xs text-foreground/80">Daily: ₹{todaySpent} / ₹{limits.daily} limit</p>}
            {weeklyOver && <p className="text-xs text-foreground/80">Weekly: ₹{weekSpent} / ₹{limits.weekly} limit</p>}
          </GlassCard>
        )}

        {/* Smart Insights */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-warning" />
            <span className="font-heading font-semibold text-foreground text-sm">Smart Insights</span>
          </div>
          <div className="space-y-2">
            {insights.map((ins, i) => (
              <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="text-xs text-foreground/80 flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span> {ins}
              </motion.p>
            ))}
          </div>
        </GlassCard>

        {/* Savings Tips */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <PiggyBank className="w-5 h-5 text-success" />
            <span className="font-heading font-semibold text-foreground text-sm">Where You Can Save</span>
          </div>
          <div className="space-y-2">
            {savingsTips.map((tip, i) => (
              <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                className="text-xs text-foreground/80 flex items-start gap-2">
                <span className="text-success mt-0.5">💡</span> {tip}
              </motion.p>
            ))}
          </div>
        </GlassCard>

        {/* Load sample data */}
        {expenses.length === 0 && (
          <GlassCard onClick={handleLoadSample} className="cursor-pointer">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Load Sample Data</p>
                <p className="text-xs text-muted-foreground">Import 365 days of spending data</p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Dashboard;
