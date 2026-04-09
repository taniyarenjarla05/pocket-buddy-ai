import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className, glow, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      className={cn(
        "glass rounded-2xl p-4",
        glow && "glow-primary",
        onClick && "cursor-pointer hover:scale-[1.02] transition-transform",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
