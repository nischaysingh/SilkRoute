import React from "react";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function EnergyIndicator({ activeMissions, totalLoad }) {
  // Calculate load percentage (0-100)
  const loadPercentage = Math.min(Math.max(totalLoad || (activeMissions * 15), 0), 100);
  
  const getLoadColor = () => {
    if (loadPercentage < 40) return "emerald";
    if (loadPercentage < 70) return "amber";
    return "red";
  };

  const getLoadLabel = () => {
    if (loadPercentage < 40) return "Nominal";
    if (loadPercentage < 70) return "Active";
    return "High";
  };

  const color = getLoadColor();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200"
    >
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <Activity className={cn(
          "w-4 h-4",
          color === "emerald" && "text-emerald-600",
          color === "amber" && "text-amber-600",
          color === "red" && "text-red-600"
        )} />
      </motion.div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-900">System Load</span>
          <Badge className={cn(
            "text-[9px] py-0",
            color === "emerald" && "bg-emerald-100 text-emerald-700",
            color === "amber" && "bg-amber-100 text-amber-700",
            color === "red" && "bg-red-100 text-red-700"
          )}>
            {getLoadLabel()}
          </Badge>
        </div>
        <div className="relative h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full",
              color === "emerald" && "bg-emerald-500",
              color === "amber" && "bg-amber-500",
              color === "red" && "bg-red-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${loadPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
          {/* Animated pulse for high load */}
          {loadPercentage > 70 && (
            <motion.div
              className="absolute inset-y-0 left-0 bg-white opacity-30 rounded-full"
              animate={{ 
                width: [`${loadPercentage}%`, `${Math.min(loadPercentage + 10, 100)}%`, `${loadPercentage}%`]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
      </div>

      <div className="text-xs font-mono font-bold text-slate-900 min-w-[2.5rem] text-right">
        {loadPercentage}%
      </div>

      {/* Energy sparks for high activity */}
      {loadPercentage > 70 && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Zap className="w-3 h-3 text-red-600" />
        </motion.div>
      )}
    </motion.div>
  );
}