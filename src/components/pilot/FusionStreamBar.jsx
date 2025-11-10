import React from "react";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function FusionStreamBar({ pilotActivity, copilotActivity, fusionMode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-xl border-2 p-4",
        fusionMode 
          ? "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 border-purple-400"
          : "bg-white/80 backdrop-blur-sm border-slate-200"
      )}
    >
      {/* Animated Background Pulse */}
      {fusionMode && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20"
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      <div className="relative z-10 flex items-center justify-between">
        {/* Left: Pilot Activity */}
        <div className="flex items-center gap-3 flex-1">
          <motion.div
            animate={pilotActivity ? { rotate: [0, 360] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="p-2 rounded-full bg-blue-100"
          >
            <Sparkles className="w-5 h-5 text-blue-600" />
          </motion.div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-slate-900 mb-1">✈️ Pilot</div>
            <p className="text-xs text-slate-700 leading-tight">
              {pilotActivity || "Standing by..."}
            </p>
          </div>
        </div>

        {/* Center: Fusion Indicator */}
        {fusionMode && (
          <motion.div
            className="flex flex-col items-center px-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-8 h-8 text-purple-600" />
              <motion.div
                className="absolute inset-0 rounded-full bg-purple-500 opacity-20 blur-xl"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <Badge className="bg-purple-100 text-purple-700 text-[9px] mt-2 border-purple-300">
              FUSION ACTIVE
            </Badge>
          </motion.div>
        )}

        {/* Right: Co-Pilot Activity */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="flex-1 text-right">
            <div className="text-xs font-semibold text-slate-900 mb-1">🧠 Co-Pilot</div>
            <p className="text-xs text-slate-700 leading-tight">
              {copilotActivity || "Monitoring..."}
            </p>
          </div>
          <motion.div
            animate={copilotActivity ? { rotate: [0, 360] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="p-2 rounded-full bg-purple-100"
          >
            <Brain className="w-5 h-5 text-purple-600" />
          </motion.div>
        </div>
      </div>

      {/* Collaboration Pulse Line */}
      {fusionMode && pilotActivity && copilotActivity && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}