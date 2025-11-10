import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Zap, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const AI_AGENTS = {
  pilot: { name: "Pilot", icon: Sparkles, color: "blue", emoji: "✈️" },
  copilot: { name: "Co-Pilot", icon: Brain, color: "purple", emoji: "🧩" },
  autopilot: { name: "Autopilot", icon: Zap, color: "emerald", emoji: "⚙️" }
};

export default function AIOrchestrationView({ missions, onMissionClick }) {
  const [hoveredMission, setHoveredMission] = useState(null);
  const [agentPositions, setAgentPositions] = useState({
    pilot: { x: 20, y: 20 },
    copilot: { x: 60, y: 20 },
    autopilot: { x: 40, y: 60 }
  });

  // Animate agent positions
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentPositions(prev => ({
        pilot: { 
          x: 20 + Math.sin(Date.now() / 2000) * 10, 
          y: 20 + Math.cos(Date.now() / 2000) * 10 
        },
        copilot: { 
          x: 60 + Math.sin(Date.now() / 2500) * 10, 
          y: 20 + Math.cos(Date.now() / 2500) * 10 
        },
        autopilot: { 
          x: 40 + Math.sin(Date.now() / 3000) * 10, 
          y: 60 + Math.cos(Date.now() / 3000) * 10 
        }
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Calculate mission positions in a circular layout
  const getMissionPosition = (index, total) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 35;
    return {
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius
    };
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-bold text-slate-900">AI Orchestration View</h4>
            <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
              Live Neural Control
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-slate-600">Pilot</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-slate-600">Co-Pilot</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-slate-600">Autopilot</span>
            </div>
          </div>
        </div>

        {/* Orchestration Canvas */}
        <div className="relative w-full h-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden">
          {/* Animated Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          </div>

          {/* Connection Lines (Pulsing Data Traffic) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {missions.map((mission, idx) => {
              const pos = getMissionPosition(idx, missions.length);
              const agentPos = agentPositions[mission.route];
              
              return (
                <motion.line
                  key={`line-${mission.id}`}
                  x1={`${pos.x}%`}
                  y1={`${pos.y}%`}
                  x2={`${agentPos.x}%`}
                  y2={`${agentPos.y}%`}
                  stroke={
                    mission.route === "pilot" ? "#3b82f6" :
                    mission.route === "copilot" ? "#8b5cf6" : "#10b981"
                  }
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity={hoveredMission === mission.id ? 0.8 : 0.3}
                  animate={{
                    strokeDashoffset: [0, -8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              );
            })}
          </svg>

          {/* Mission Nodes */}
          {missions.map((mission, idx) => {
            const pos = getMissionPosition(idx, missions.length);
            const isActive = mission.state === "running";
            
            return (
              <motion.div
                key={mission.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)"
                }}
                onHoverStart={() => setHoveredMission(mission.id)}
                onHoverEnd={() => setHoveredMission(null)}
                onClick={() => onMissionClick?.(mission)}
                whileHover={{ scale: 1.2 }}
              >
                <motion.div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 relative",
                    mission.route === "pilot" && "bg-blue-500/20 border-blue-500",
                    mission.route === "copilot" && "bg-purple-500/20 border-purple-500",
                    mission.route === "autopilot" && "bg-emerald-500/20 border-emerald-500"
                  )}
                  animate={isActive ? {
                    boxShadow: [
                      "0 0 0 0 rgba(59, 130, 246, 0.4)",
                      "0 0 0 20px rgba(59, 130, 246, 0)",
                    ]
                  } : {}}
                  transition={isActive ? {
                    duration: 2,
                    repeat: Infinity
                  } : {}}
                >
                  <Activity className={cn(
                    "w-5 h-5",
                    mission.route === "pilot" && "text-blue-400",
                    mission.route === "copilot" && "text-purple-400",
                    mission.route === "autopilot" && "text-emerald-400"
                  )} />
                </motion.div>

                {/* Mission Info on Hover */}
                <AnimatePresence>
                  {hoveredMission === mission.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-10 w-64"
                    >
                      <div className="bg-slate-800 rounded-lg p-3 border border-slate-600 shadow-xl">
                        <div className="text-xs font-bold text-white mb-2">
                          {mission.name}
                        </div>
                        <div className="space-y-1 text-[10px] text-slate-300">
                          <div className="flex justify-between">
                            <span>Last Decision:</span>
                            <span className="text-white font-semibold">
                              {mission.route === "pilot" && "Pilot reduced retry count 30%"}
                              {mission.route === "copilot" && "Co-Pilot optimized latency"}
                              {mission.route === "autopilot" && "Autopilot auto-scaled"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Confidence:</span>
                            <span className="text-emerald-400 font-semibold">
                              {mission.successRate}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Latency:</span>
                            <span className="text-blue-400 font-semibold">
                              {mission.avgLatency}ms
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* AI Agent Avatars (Moving) */}
          {Object.entries(agentPositions).map(([agent, pos]) => {
            const agentInfo = AI_AGENTS[agent];
            const Icon = agentInfo.icon;
            
            return (
              <motion.div
                key={agent}
                className="absolute pointer-events-none"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)"
                }}
                animate={{
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center border-2 shadow-2xl relative",
                  agentInfo.color === "blue" && "bg-blue-600 border-blue-400",
                  agentInfo.color === "purple" && "bg-purple-600 border-purple-400",
                  agentInfo.color === "emerald" && "bg-emerald-600 border-emerald-400"
                )}>
                  <Icon className="w-7 h-7 text-white" />
                  <motion.div
                    className={cn(
                      "absolute inset-0 rounded-full opacity-20",
                      agentInfo.color === "blue" && "bg-blue-400",
                      agentInfo.color === "purple" && "bg-purple-400",
                      agentInfo.color === "emerald" && "bg-emerald-400"
                    )}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity
                    }}
                  />
                </div>
                <div className="text-[10px] text-white font-semibold text-center mt-1">
                  {agentInfo.emoji} {agentInfo.name}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 text-xs text-slate-600 text-center">
          Neural control tower - {missions.filter(m => m.state === "running").length} active missions, 
          {missions.length} total nodes
        </div>
      </CardContent>
    </Card>
  );
}