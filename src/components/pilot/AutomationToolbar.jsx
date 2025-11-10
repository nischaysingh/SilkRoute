import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, GitBranch, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AutomationToolbar({ onAutoOptimize, onBalanceLoad, onAskAI, isOptimizing }) {
  const [activeAction, setActiveAction] = useState(null);

  const handleAutoOptimize = () => {
    setActiveAction("optimize");
    onAutoOptimize?.("latency");
    
    setTimeout(() => {
      setActiveAction(null);
      toast.success("Auto-optimization complete", {
        description: "3 missions optimized for latency"
      });
    }, 2000);
  };

  const handleBalanceLoad = () => {
    setActiveAction("balance");
    onBalanceLoad?.();
    
    setTimeout(() => {
      setActiveAction(null);
      toast.success("Load balanced", {
        description: "2 missions shifted to Autopilot"
      });
    }, 1800);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Auto-Optimize Button */}
      <motion.div className="relative">
        <Button
          size="sm"
          onClick={handleAutoOptimize}
          disabled={activeAction !== null}
          className={cn(
            "h-8 text-xs relative overflow-hidden",
            activeAction === "optimize"
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          )}
        >
          {/* Animated glow lines */}
          {activeAction === "optimize" && (
            <>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 opacity-50"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </>
          )}
          <Sparkles className="w-3 h-3 mr-1 relative z-10" />
          <span className="relative z-10">✈️ Auto-Optimize</span>
        </Button>

        {activeAction === "optimize" && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
          >
            <Badge className="bg-purple-600 text-white text-[9px] whitespace-nowrap">
              Analyzing missions...
            </Badge>
          </motion.div>
        )}
      </motion.div>

      {/* Balance Load Button */}
      <motion.div className="relative">
        <Button
          size="sm"
          variant="outline"
          onClick={handleBalanceLoad}
          disabled={activeAction !== null}
          className={cn(
            "h-8 text-xs border-slate-200 bg-white hover:bg-slate-50 relative overflow-hidden",
            activeAction === "balance" && "border-emerald-400 bg-emerald-50"
          )}
        >
          {activeAction === "balance" && (
            <motion.div
              className="absolute inset-0 bg-emerald-400 opacity-20"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
          <GitBranch className="w-3 h-3 mr-1 relative z-10" />
          <span className="relative z-10">🧩 Balance Load</span>
        </Button>

        {activeAction === "balance" && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
          >
            <Badge className="bg-emerald-600 text-white text-[9px] whitespace-nowrap">
              Redistributing...
            </Badge>
          </motion.div>
        )}
      </motion.div>

      {/* Ask AI Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={onAskAI}
        className="h-8 text-xs border-slate-200 bg-white hover:bg-slate-50"
      >
        <MessageCircle className="w-3 h-3 mr-1" />
        💬 Ask AI
      </Button>

      {/* Animated indicator when any action is active */}
      <AnimatePresence>
        {activeAction && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="flex items-center gap-1"
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-purple-600"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}