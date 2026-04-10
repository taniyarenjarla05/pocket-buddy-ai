import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wallet, Mail, Lock, User, Eye, EyeOff, Building, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [hostelRent, setHostelRent] = useState("");
  const [userType, setUserType] = useState<"student" | "professional">("student");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !monthlyIncome) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setLoading(false);
      toast({ title: error.message, variant: "destructive" });
      return;
    }
    // Update profile with financial info
    if (data.user) {
      await supabase.from("profiles").update({
        monthly_income: Number(monthlyIncome),
        hostel_rent: Number(hostelRent) || 0,
        user_type: userType,
        name,
      }).eq("user_id", data.user.id);
    }
    setLoading(false);
    toast({ title: "Account created! 🎉" });
    navigate("/dashboard");
  };

  const handleGoogleSignup = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast({ title: "Google sign-in failed", variant: "destructive" });
      return;
    }
    if (result.redirected) return;
    navigate("/dashboard");
  };

  return (
    <div className="min-h-full flex flex-col px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-6 mb-6">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
          <Wallet className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold font-heading gradient-text">Create Account</h1>
        <p className="text-muted-foreground mt-1 text-sm">Start your smart finance journey</p>
      </motion.div>

      {/* User type toggle */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-1 flex mb-4">
        {(["student", "professional"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setUserType(type)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              userType === type ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {type === "student" ? "🎓 Student" : "💼 Professional"}
          </button>
        ))}
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSignup}
        className="space-y-3 flex-1"
      >
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <User className="w-5 h-5 text-muted-foreground shrink-0" />
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
            className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground text-sm" />
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground text-sm" />
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
          <input type={showPw ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground text-sm" />
          <button type="button" onClick={() => setShowPw(!showPw)}>
            {showPw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <span className="text-muted-foreground shrink-0 text-sm font-bold">₹</span>
          <input type="number" placeholder="Monthly Income" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)}
            className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground text-sm" />
        </div>
        {userType === "student" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="glass rounded-2xl p-4 flex items-center gap-3">
            <Building className="w-5 h-5 text-muted-foreground shrink-0" />
            <input type="number" placeholder="Monthly Hostel Rent" value={hostelRent} onChange={(e) => setHostelRent(e.target.value)}
              className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground text-sm" />
          </motion.div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-2xl gradient-primary font-heading font-semibold text-primary-foreground glow-primary transition-transform hover:scale-[1.02] active:scale-95 mt-4 disabled:opacity-60">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Account"}
        </button>
      </motion.form>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        onClick={handleGoogleSignup}
        className="w-full py-4 rounded-2xl glass font-heading font-medium text-foreground transition-transform hover:scale-[1.02] active:scale-95 mt-3 mx-6 flex items-center justify-center gap-2"
        style={{ width: "calc(100% - 3rem)", marginInline: "1.5rem" }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Sign up with Google
      </motion.button>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-center text-sm text-muted-foreground mt-4 pb-6">
        Already have an account?{" "}
        <button onClick={() => navigate("/login")} className="text-primary font-semibold">Sign In</button>
      </motion.p>
    </div>
  );
};

export default Signup;
