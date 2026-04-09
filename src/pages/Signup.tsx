import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wallet, Mail, Lock, User, Eye, EyeOff, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !monthlyIncome) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    const userData = {
      name,
      email,
      monthlyIncome: Number(monthlyIncome),
      hostelRent: Number(hostelRent) || 0,
      userType,
    };
    localStorage.setItem("mypocket_user", JSON.stringify(userData));
    toast({ title: "Account created! 🎉" });
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

        <button type="submit"
          className="w-full py-4 rounded-2xl gradient-primary font-heading font-semibold text-primary-foreground glow-primary transition-transform hover:scale-[1.02] active:scale-95 mt-4">
          Create Account
        </button>
      </motion.form>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-center text-sm text-muted-foreground mt-4 pb-6">
        Already have an account?{" "}
        <button onClick={() => navigate("/login")} className="text-primary font-semibold">Sign In</button>
      </motion.p>
    </div>
  );
};

export default Signup;
