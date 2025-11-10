import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AmbientFeedback({ systemConfidence, fusionActive, activeMissions }) {
  // Calculate background color based on confidence
  const getBackgroundGradient = () => {
    if (fusionActive) {
      return "from-blue-500/10 via-purple-500/10 to-emerald-500/10";
    }
    
    if (systemConfidence >= 90) {
      return "from-emerald-500/10 via-blue-500/10 to-cyan-500/10"; // Cool blues → greens
    } else if (systemConfidence >= 70) {
      return "from-blue-500/10 via-cyan-500/10 to-blue-500/10"; // Neutral blues
    } else if (systemConfidence >= 50) {
      return "from-amber-500/10 via-orange-500/10 to-amber-500/10"; // Warning ambers
    } else {
      return "from-red-500/10 via-orange-500/10 to-red-500/10"; // Critical reds
    }
  };

  return (
    <>
      {/* Ambient Background Layer */}
      <motion.div
        className={cn(
          "fixed inset-0 pointer-events-none z-0 bg-gradient-to-br transition-all duration-1000",
          getBackgroundGradient()
        )}
        animate={{
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Fusion Stream Pulse */}
      {fusionActive && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 z-50"
          animate={{
            opacity: [0.5, 1, 0.5],
            scaleX: [1, 1.02, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
      )}

      {/* Active Mission Pulses */}
      {activeMissions > 0 && (
        <>
          <motion.div
            className="fixed top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none z-0"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity
            }}
          />
          <motion.div
            className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl pointer-events-none z-0"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.3, 0.6]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 2
            }}
          />
        </>
      )}

      {/* Low Confidence Warning Overlay */}
      {systemConfidence < 50 && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-0 border-4 border-red-500/20 rounded-lg"
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
      )}
    </>
  );
}