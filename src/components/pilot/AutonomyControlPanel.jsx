import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Gauge, Activity, CheckCircle, AlertCircle, Info,
  Play, Pause, XCircle as Stop
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const AutonomyGauge = ({ level, onChange }) => {
  const [hoveredLevel, setHoveredLevel] = useState(null);
  
  const levels = [
    { value: 0, label: "Manual Only", angle: -90, color: "#ef4444", description: "Every action requires approval" },
    { value: 1, label: "Guide", angle: -30, color: "#f59e0b", description: "AI suggests, you approve" },
    { value: 2, label: "Semi-Auto", angle: 30, color: "#3b82f6", description: "Auto-reroute allowed" },
    { value: 3, label: "Auto", angle: 90, color: "#10b981", description: "Fully autonomous with rollback" }
  ];

  const currentLevel = levels[level];
  const displayLevel = hoveredLevel !== null ? levels[hoveredLevel] : currentLevel;

  return (
    <div className="flex flex-col items-center">
      {/* Circular Gauge */}
      <div className="relative w-48 h-48 mb-4">
        <svg className="w-full h-full transform" viewBox="0 0 200 200">
          {/* Background arc */}
          <path
            d="M 30 170 A 80 80 0 0 1 170 170"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Active arc */}
          <motion.path
            d="M 30 170 A 80 80 0 0 1 170 170"
            fill="none"
            stroke={displayLevel.color}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray="251.2"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ 
              strokeDashoffset: 251.2 - (251.2 * (displayLevel.value + 1) / 4)
            }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Needle */}
          <motion.g
            initial={{ rotate: levels[0].angle }}
            animate={{ rotate: displayLevel.angle }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            style={{ transformOrigin: "100px 100px" }}
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="40"
              stroke={displayLevel.color}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle
              cx="100"
              cy="100"
              r="8"
              fill={displayLevel.color}
            />
          </motion.g>

          {/* Center text */}
          <text
            x="100"
            y="110"
            textAnchor="middle"
            className="text-xl font-bold fill-slate-900"
          >
            {displayLevel.value}
          </text>
          <text
            x="100"
            y="130"
            textAnchor="middle"
            className="text-xs fill-slate-600"
          >
            Level
          </text>
        </svg>

        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${displayLevel.color}20 0%, transparent 70%)`
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Level name and description */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {displayLevel.label}
        </h3>
        <p className="text-xs text-slate-600 italic">
          {displayLevel.description}
        </p>
      </div>

      {/* Level selectors */}
      <div className="flex gap-2">
        {levels.map((lvl) => (
          <button
            key={lvl.value}
            onClick={() => onChange(lvl.value)}
            onMouseEnter={() => setHoveredLevel(lvl.value)}
            onMouseLeave={() => setHoveredLevel(null)}
            className={cn(
              "w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all",
              level === lvl.value
                ? "border-current shadow-lg scale-110"
                : "border-slate-300 hover:border-current hover:scale-105"
            )}
            style={{
              color: lvl.color,
              backgroundColor: level === lvl.value ? `${lvl.color}20` : "white"
            }}
          >
            {lvl.value}
          </button>
        ))}
      </div>
    </div>
  );
};

const AutonomyRulesFeed = ({ rules }) => {
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {rules.map((rule) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={cn(
              "p-3 rounded-lg border-l-4 flex items-start gap-3",
              rule.type === "success" && "bg-emerald-50 border-emerald-500",
              rule.type === "warning" && "bg-amber-50 border-amber-500",
              rule.type === "info" && "bg-blue-50 border-blue-500"
            )}
          >
            {rule.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />}
            {rule.type === "warning" && <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />}
            {rule.type === "info" && <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />}
            
            <div className="flex-1">
              <p className="text-xs text-slate-900 leading-tight">{rule.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(rule.timestamp).toLocaleTimeString()}
                </span>
                <Badge className={cn(
                  "text-[9px] py-0",
                  rule.actor === "pilot" && "bg-blue-100 text-blue-700",
                  rule.actor === "copilot" && "bg-purple-100 text-purple-700",
                  rule.actor === "autopilot" && "bg-emerald-100 text-emerald-700"
                )}>
                  {rule.actor}
                </Badge>
                {rule.explainable && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 px-1 text-[9px]"
                  >
                    Explain
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function AutonomyControlPanel({ mission, onAutonomyChange, onAction }) {
  const [autonomyLevel, setAutonomyLevel] = useState(1);
  const [autonomyRules, setAutonomyRules] = useState([
    {
      id: 1,
      timestamp: new Date(Date.now() - 120000).toISOString(),
      message: "Auto-reroute triggered for REQ-10124",
      actor: "autopilot",
      type: "success",
      explainable: true
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      message: "Pilot paused mission due to policy block",
      actor: "pilot",
      type: "warning",
      explainable: true
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      message: "Cost threshold exceeded - manual approval required",
      actor: "copilot",
      type: "info",
      explainable: true
    }
  ]);

  const handleAutonomyChange = (newLevel) => {
    setAutonomyLevel(newLevel);
    onAutonomyChange?.(newLevel);
    
    // Add new rule to feed
    const newRule = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: `Autonomy level changed to ${newLevel}`,
      actor: "pilot",
      type: "info",
      explainable: false
    };
    setAutonomyRules([newRule, ...autonomyRules.slice(0, 4)]);
  };

  return (
    <div className="space-y-4">
      {/* Autonomy Gauge Card */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardHeader className="border-b border-slate-200 pb-3">
          <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-purple-600" />
            Autonomy Control
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <AutonomyGauge level={autonomyLevel} onChange={handleAutonomyChange} />
          
          {autonomyLevel >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg"
            >
              <p className="text-xs text-amber-900 flex items-center gap-2">
                <Activity className="w-3 h-3 animate-pulse" />
                Auto-corrections enabled
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Autonomy Rules Feed */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardHeader className="border-b border-slate-200 pb-3">
          <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Autonomy Rules Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <AutonomyRulesFeed rules={autonomyRules} />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-3 space-y-2">
          <Button
            onClick={() => onAction?.("launch", mission)}
            className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
          >
            <Play className="w-3 h-3 mr-2" />
            Launch Mission
          </Button>
          <Button
            onClick={() => onAction?.("pause", mission)}
            variant="outline"
            className="w-full h-8 text-xs"
          >
            <Pause className="w-3 h-3 mr-2" />
            Pause Mission
          </Button>
          <Button
            onClick={() => onAction?.("abort", mission)}
            variant="outline"
            className="w-full h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
          >
            <Stop className="w-3 h-3 mr-2" />
            Abort Mission
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}