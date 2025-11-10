import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const COMMAND_MODES = [
  { 
    value: "human", 
    label: "Human Command", 
    icon: User, 
    color: "blue",
    description: "AI acts only when approved"
  },
  { 
    value: "shared", 
    label: "Shared Command", 
    icon: Users, 
    color: "purple",
    description: "AI executes safe actions, requests approval for risky ones"
  },
  { 
    value: "full", 
    label: "Full Autonomy", 
    icon: Zap, 
    color: "emerald",
    description: "Autopilot takes charge, reports only anomalies"
  }
];

export default function CommandPriorityToggle({ value, onChange, mission }) {
  const currentMode = COMMAND_MODES.find(m => m.value === value) || COMMAND_MODES[1];
  const currentIndex = COMMAND_MODES.findIndex(m => m.value === value);

  const handleToggle = () => {
    const nextIndex = (currentIndex + 1) % COMMAND_MODES.length;
    onChange?.(COMMAND_MODES[nextIndex].value);
  };

  const Icon = currentMode.icon;

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className={cn(
          "relative px-4 py-2 rounded-lg border-2 transition-all hover:scale-105 group",
          currentMode.color === "blue" && "bg-blue-50 border-blue-300",
          currentMode.color === "purple" && "bg-purple-50 border-purple-300",
          currentMode.color === "emerald" && "bg-emerald-50 border-emerald-300"
        )}
      >
        {/* Animated glow when AI acts autonomously */}
        {value === "full" && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-emerald-400 opacity-20"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <div className="relative z-10 flex items-center gap-2">
          <motion.div
            animate={value === "full" ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Icon className={cn(
              "w-4 h-4",
              currentMode.color === "blue" && "text-blue-600",
              currentMode.color === "purple" && "text-purple-600",
              currentMode.color === "emerald" && "text-emerald-600"
            )} />
          </motion.div>
          
          <div className="text-left">
            <div className="text-xs font-semibold text-slate-900">
              {currentMode.label}
            </div>
            <div className="text-[10px] text-slate-600 leading-tight">
              {currentMode.description}
            </div>
          </div>

          {/* Level Indicator */}
          <div className="flex flex-col gap-1 ml-2">
            {COMMAND_MODES.map((mode, idx) => (
              <motion.div
                key={mode.value}
                className={cn(
                  "w-2 h-1 rounded-full transition-all",
                  idx <= currentIndex 
                    ? currentMode.color === "blue" && "bg-blue-600" ||
                      currentMode.color === "purple" && "bg-purple-600" ||
                      currentMode.color === "emerald" && "bg-emerald-600"
                    : "bg-slate-300"
                )}
                animate={idx === currentIndex ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
            ))}
          </div>
        </div>

        {/* Tooltip on Hover */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
            Click to cycle: Human → Shared → Full Autonomy
          </div>
        </div>
      </button>

      {/* Auto-Action Indicator */}
      {value === "full" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2"
        >
          <Badge className="bg-emerald-100 text-emerald-700 text-[9px] py-0 flex items-center gap-1 w-full justify-center">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-2 h-2" />
            </motion.div>
            Autopilot Active - 3 optimizations applied
          </Badge>
        </motion.div>
      )}
    </div>
  );
}