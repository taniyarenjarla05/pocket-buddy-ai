import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, LogOut, Settings, Wallet, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import { getUser, getBudgetLimits, setBudgetLimits, getExpenses, getAlertCount, type UserData } from "@/lib/financeUtils";
import { useToast } from "@/hooks/use-toast";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [limits, setLimits] = useState(getBudgetLimits());
  const [editLimits, setEditLimits] = useState(false);
  const [savingsGoal, setSavingsGoal] = useState(localStorage.getItem("mypocket_savings_goal") || "");

  useEffect(() => {
    const u = getUser();
    if (!u) { navigate("/"); return; }
    setUser(u);
  }, [navigate]);

  const handleSaveLimits = () => {
    setBudgetLimits(limits);
    setEditLimits(false);
    toast({ title: "Budget limits updated ✅" });
  };

  const handleSaveGoal = () => {
    localStorage.setItem("mypocket_savings_goal", savingsGoal);
    toast({ title: "Savings goal set! 🎯" });
  };

  const handleLogout = () => {
    localStorage.removeItem("mypocket_user");
    navigate("/");
  };

  if (!user) return null;

  const totalExpenses = getExpenses().reduce((s, e) => s + e.amount, 0);
  const alertCount = getAlertCount();

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-4 pt-4 pb-4 space-y-4">
        <h1 className="text-xl font-bold font-heading text-foreground">Profile</h1>

        {/* User card */}
        <GlassCard glow>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">{user.name[0]?.toUpperCase()}</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-foreground">{user.name}</h2>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium gradient-primary text-primary-foreground">
                {user.userType === "student" ? "🎓 Student" : "💼 Professional"}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <GlassCard>
            <p className="text-[10px] text-muted-foreground">Income</p>
            <p className="text-sm font-bold font-heading text-primary">₹{user.monthlyIncome.toLocaleString()}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-[10px] text-muted-foreground">Total Spent</p>
            <p className="text-sm font-bold font-heading text-accent">₹{totalExpenses.toLocaleString()}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-[10px] text-muted-foreground">Alerts</p>
            <p className="text-sm font-bold font-heading text-warning">{alertCount}</p>
          </GlassCard>
        </div>

        {/* Budget limits */}
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <span className="font-heading font-semibold text-foreground text-sm">Budget Limits</span>
            </div>
            <button onClick={() => editLimits ? handleSaveLimits() : setEditLimits(true)}
              className="text-xs text-primary font-semibold">{editLimits ? "Save" : "Edit"}</button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Daily Limit</p>
              {editLimits ? (
                <input type="number" value={limits.daily} onChange={(e) => setLimits({ ...limits, daily: Number(e.target.value) })}
                  className="w-full glass rounded-xl p-2 bg-transparent text-foreground text-sm outline-none" />
              ) : (
                <p className="text-sm font-bold text-foreground">₹{limits.daily.toLocaleString()}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Weekly Limit</p>
              {editLimits ? (
                <input type="number" value={limits.weekly} onChange={(e) => setLimits({ ...limits, weekly: Number(e.target.value) })}
                  className="w-full glass rounded-xl p-2 bg-transparent text-foreground text-sm outline-none" />
              ) : (
                <p className="text-sm font-bold text-foreground">₹{limits.weekly.toLocaleString()}</p>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Savings goal */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-success" />
            <span className="font-heading font-semibold text-foreground text-sm">Savings Goal</span>
          </div>
          <div className="flex gap-2">
            <input type="number" placeholder="Target amount (₹)" value={savingsGoal}
              onChange={(e) => setSavingsGoal(e.target.value)}
              className="flex-1 glass rounded-xl p-2 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground" />
            <button onClick={handleSaveGoal}
              className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold">Set</button>
          </div>
          {savingsGoal && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>₹{Math.max(0, user.monthlyIncome - totalExpenses).toLocaleString()} / ₹{Number(savingsGoal).toLocaleString()}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (Math.max(0, user.monthlyIncome - totalExpenses) / Number(savingsGoal)) * 100)}%` }}
                  className="h-full rounded-full gradient-primary"
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          )}
        </GlassCard>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full py-3 rounded-2xl glass flex items-center justify-center gap-2 text-destructive font-heading font-semibold text-sm transition-transform active:scale-95">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
