import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingUp, Brain, Shield } from "lucide-react";

const features = [
  { icon: Wallet, title: "Track Expenses", desc: "Log daily spending with categories" },
  { icon: TrendingUp, title: "Smart Budget", desc: "Auto-calculated safe limits" },
  { icon: Brain, title: "AI Predictions", desc: "ML-powered spending forecasts" },
  { icon: Shield, title: "Overspend Alerts", desc: "Real-time budget warnings" },
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex flex-col px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mt-8 mb-8"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl gradient-primary flex items-center justify-center glow-primary">
          <Wallet className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold font-heading gradient-text">MyPocket AI</h1>
        <p className="text-muted-foreground mt-2 text-sm">Your smart finance companion</p>
      </motion.div>

      <div className="space-y-3 flex-1">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="glass rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <f.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground text-sm">{f.title}</h3>
              <p className="text-muted-foreground text-xs">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-3 mt-6 pb-8"
      >
        <button
          onClick={() => navigate("/signup")}
          className="w-full py-4 rounded-2xl gradient-primary font-heading font-semibold text-primary-foreground glow-primary transition-transform hover:scale-[1.02] active:scale-95"
        >
          Get Started
        </button>
        <button
          onClick={() => navigate("/login")}
          className="w-full py-4 rounded-2xl glass font-heading font-medium text-foreground transition-transform hover:scale-[1.02] active:scale-95"
        >
          I already have an account
        </button>
      </motion.div>
    </div>
  );
};

export default Onboarding;
