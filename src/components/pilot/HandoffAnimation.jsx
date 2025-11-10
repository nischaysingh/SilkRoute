import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getAIPersonality } from "./AIPersonality";

export default function HandoffAnimation({ fromAgent, toAgent, missionId, onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  const fromPersonality = getAIPersonality(fromAgent);
  const toPersonality = getAIPersonality(toAgent);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      >
        {/* Light Trail Effect */}
        <svg className="absolute inset-0 w-full h-full">
          <motion.path
            d="M 200 300 Q 400 100 600 300"
            stroke={`url(#gradient-${fromAgent}-${toAgent})`}
            strokeWidth="4"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id={`gradient-${fromAgent}-${toAgent}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={fromPersonality.glowColor} />
              <stop offset="100%" stopColor={toPersonality.glowColor} />
            </linearGradient>
          </defs>
        </svg>

        {/* From → To Indicators */}
        <div className="flex items-center gap-8">
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 0.8, opacity: 0.5 }}
            transition={{ duration: 1 }}
            className={cn(
              "p-4 rounded-full border-4 bg-white shadow-2xl",
              fromPersonality.color === "blue" && "border-blue-500",
              fromPersonality.color === "purple" && "border-purple-500",
              fromPersonality.color === "emerald" && "border-emerald-500"
            )}
          >
            <div className="text-3xl">{fromPersonality.emoji}</div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: [0, 10, 0] }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-2xl text-slate-400"
          >
            →
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className={cn(
              "p-4 rounded-full border-4 bg-white shadow-2xl",
              toPersonality.color === "blue" && "border-blue-500",
              toPersonality.color === "purple" && "border-purple-500",
              toPersonality.color === "emerald" && "border-emerald-500"
            )}
          >
            <div className="text-3xl">{toPersonality.emoji}</div>
          </motion.div>
        </div>

        {/* Transfer Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-1/3 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-xl"
        >
          <div className="text-xs font-semibold">
            Control Transfer: {fromPersonality.name} → {toPersonality.name}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}