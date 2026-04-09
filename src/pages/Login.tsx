import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wallet, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    // Store auth state
    localStorage.setItem("mypocket_user", JSON.stringify({ email, name: email.split("@")[0] }));
    toast({ title: "Welcome back! 🎉" });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-full flex flex-col px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-12 mb-10">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
          <Wallet className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold font-heading gradient-text">Welcome Back</h1>
        <p className="text-muted-foreground mt-1 text-sm">Sign in to your account</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleLogin}
        className="space-y-4 flex-1"
      >
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground text-sm"
          />
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type={showPw ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground text-sm"
          />
          <button type="button" onClick={() => setShowPw(!showPw)}>
            {showPw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl gradient-primary font-heading font-semibold text-primary-foreground glow-primary transition-transform hover:scale-[1.02] active:scale-95 mt-6"
        >
          Sign In
        </button>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-muted-foreground mt-6 pb-8"
      >
        Don't have an account?{" "}
        <button onClick={() => navigate("/signup")} className="text-primary font-semibold">
          Sign Up
        </button>
      </motion.p>
    </div>
  );
};

export default Login;
