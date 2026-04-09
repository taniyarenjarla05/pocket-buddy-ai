import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import { Calendar } from "@/components/ui/calendar";
import { getExpenses, type Expense } from "@/lib/financeUtils";

const categoryEmojis: Record<string, string> = {
  Food: "🍔", Travel: "🚗", Shopping: "🛍️", Bills: "📄", Others: "📦", Entertainment: "🎬",
};

const CalendarView: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    setExpenses(getExpenses());
  }, []);

  const dateStr = selectedDate ? selectedDate.toISOString().split("T")[0] : "";
  const dayExpenses = expenses.filter((e) => e.date === dateStr);
  const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0);

  // Get dates that have expenses for highlighting
  const expenseDates = new Set(expenses.map((e) => e.date));
  const modifiers = {
    hasExpense: (date: Date) => expenseDates.has(date.toISOString().split("T")[0]),
  };
  const modifiersStyles = {
    hasExpense: { backgroundColor: "hsl(270 60% 65% / 0.2)", borderRadius: "50%" },
  };

  // Category breakdown for selected day
  const catTotals: Record<string, number> = {};
  dayExpenses.forEach((e) => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-4 pt-4 pb-4 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold font-heading text-foreground">Calendar</h1>
        </div>

        {/* Calendar */}
        <GlassCard className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="text-foreground"
          />
        </GlassCard>

        {/* Day Summary */}
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <span className="font-heading font-semibold text-foreground text-sm">
              {selectedDate ? selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Select a date"}
            </span>
          </div>

          {dayExpenses.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">Total Spent</span>
                <span className="text-lg font-bold font-heading text-accent">₹{dayTotal.toLocaleString()}</span>
              </div>

              {/* Category breakdown */}
              <div className="space-y-2 mb-3">
                {Object.entries(catTotals).sort(([, a], [, b]) => b - a).map(([cat, amount]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{categoryEmojis[cat] || "📦"}</span>
                      <span className="text-xs text-foreground">{cat}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">₹{amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Individual transactions */}
              <div className="border-t border-border pt-2 space-y-2">
                <p className="text-xs text-muted-foreground">Transactions</p>
                {dayExpenses.map((exp, i) => (
                  <motion.div key={exp.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{categoryEmojis[exp.category] || "📦"}</span>
                      <div>
                        <p className="text-xs text-foreground">{exp.category}</p>
                        <p className="text-[10px] text-muted-foreground">{exp.paymentMode} · {exp.mood}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-accent">₹{exp.amount.toLocaleString()}</span>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-4">No expenses on this day 🎉</p>
          )}
        </GlassCard>
      </div>
      <BottomNav />
    </div>
  );
};

export default CalendarView;
