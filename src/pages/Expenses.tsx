import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Search, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import {
  getExpenses, addExpense, deleteExpense, type Expense,
  getBudgetLimits, getTodaySpending, getWeekSpending,
  incrementAlertCount,
} from "@/lib/financeUtils";
import { useToast } from "@/hooks/use-toast";

const categories = ["Food", "Travel", "Shopping", "Bills", "Others"];
const moods = ["Happy", "Neutral", "Sad", "Stressed"];
const paymentModes = ["Cash", "Card", "UPI"];
const categoryEmojis: Record<string, string> = {
  Food: "🍔", Travel: "🚗", Shopping: "🛍️", Bills: "📄", Others: "📦", Entertainment: "🎬",
};

const Expenses: React.FC = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ amount: "", category: "Food", mood: "Neutral", paymentMode: "UPI", isSubscription: false });

  useEffect(() => { setExpenses(getExpenses()); }, []);

  const handleAdd = () => {
    if (!form.amount || Number(form.amount) <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    const newExp: Omit<Expense, "id"> = {
      date: new Date().toISOString().split("T")[0],
      amount: Number(form.amount),
      category: form.category,
      mood: form.mood,
      paymentMode: form.paymentMode,
      isSubscription: form.isSubscription,
    };
    const updated = addExpense(newExp);
    setExpenses(updated);
    setShowAdd(false);
    setForm({ amount: "", category: "Food", mood: "Neutral", paymentMode: "UPI", isSubscription: false });

    // Check limits
    const limits = getBudgetLimits();
    const todayTotal = getTodaySpending(updated);
    const weekTotal = getWeekSpending(updated);
    if (todayTotal > limits.daily || weekTotal > limits.weekly) {
      incrementAlertCount();
      toast({ title: "⚠️ You are overspending!", description: "Consider reducing today's spending", variant: "destructive" });
    } else {
      toast({ title: "Expense added ✅" });
    }
  };

  const handleDelete = (id: string) => {
    const updated = deleteExpense(id);
    setExpenses(updated);
    toast({ title: "Expense deleted" });
  };

  const filtered = expenses
    .filter((e) => !search || e.category.toLowerCase().includes(search.toLowerCase()) || e.date.includes(search))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-4 pt-4 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold font-heading text-foreground">Expenses</h1>
          <button onClick={() => setShowAdd(!showAdd)}
            className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center glow-primary transition-transform active:scale-90">
            {showAdd ? <X className="w-5 h-5 text-primary-foreground" /> : <Plus className="w-5 h-5 text-primary-foreground" />}
          </button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden">
              <GlassCard className="space-y-3">
                <div className="glass rounded-xl p-3">
                  <input type="number" placeholder="Amount (₹)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button key={c} onClick={() => setForm({ ...form, category: c })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          form.category === c ? "gradient-primary text-primary-foreground" : "glass text-muted-foreground"
                        }`}>
                        {categoryEmojis[c]} {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Payment</p>
                  <div className="flex gap-2">
                    {paymentModes.map((m) => (
                      <button key={m} onClick={() => setForm({ ...form, paymentMode: m })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex-1 ${
                          form.paymentMode === m ? "gradient-primary text-primary-foreground" : "glass text-muted-foreground"
                        }`}>{m}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Mood</p>
                  <div className="flex gap-2">
                    {moods.map((m) => (
                      <button key={m} onClick={() => setForm({ ...form, mood: m })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex-1 ${
                          form.mood === m ? "gradient-primary text-primary-foreground" : "glass text-muted-foreground"
                        }`}>{m}</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleAdd}
                  className="w-full py-3 rounded-xl gradient-primary font-heading font-semibold text-primary-foreground text-sm transition-transform active:scale-95">
                  Add Expense
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="glass rounded-xl p-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground text-sm" />
        </div>

        {/* Transaction list */}
        <div className="space-y-2">
          {filtered.slice(0, 50).map((exp, i) => (
            <motion.div key={exp.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className="glass rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">
                  {categoryEmojis[exp.category] || "📦"}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{exp.category}</p>
                  <p className="text-xs text-muted-foreground">{exp.date} · {exp.paymentMode}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-heading text-accent">₹{exp.amount.toLocaleString()}</span>
                <button onClick={() => handleDelete(exp.id)} className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No expenses yet. Add your first one!</p>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Expenses;
