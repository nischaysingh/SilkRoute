import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Play, Pause, XCircle, GitBranch, Eye, FileText,
  DollarSign, Clock, TrendingUp, Zap, Brain, AlertTriangle,
  ChevronDown, ChevronUp, ChevronRight, Target, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const getRouteColor = (route) => {
  switch (route) {
    case "pilot": return "border-blue-500 bg-blue-500/10";
    case "copilot": return "border-purple-500 bg-purple-500/10";
    case "autopilot": return "border-emerald-500 bg-emerald-500/10";
    default: return "border-slate-500 bg-slate-500/10";
  }
};

const getStateColor = (state) => {
  switch (state) {
    case "running": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "queued": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "paused": return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    case "failed": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "completed": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "draft": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};

const HealthRing = ({ percentage, label, color }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-20 h-20">
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="rgb(226, 232, 240)"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-sm font-bold text-slate-900">{percentage}%</div>
        <div className="text-[9px] text-slate-600">{label}</div>
      </div>
    </div>
  );
};

const StatusPulse = ({ state }) => {
  const colors = {
    running: "bg-emerald-500",
    queued: "bg-amber-500",
    paused: "bg-slate-500",
    failed: "bg-red-500",
    draft: "bg-blue-500"
  };

  return (
    <div className="relative">
      <div className={cn("w-2 h-2 rounded-full", colors[state] || colors.draft)}>
        {state === "running" && (
          <>
            <div className={cn("absolute inset-0 rounded-full animate-ping", colors[state])}></div>
            <div className={cn("absolute inset-0 rounded-full", colors[state])}></div>
          </>
        )}
      </div>
    </div>
  );
};

export default function MissionCommandCard({ mission, onLaunch, onPause, onAbort, onReroute, onExplain, onOpenPlan, onClick }) {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const aiConfidence = 92;
  const modelReliability = 88;
  const goalAlignment = 95;
  const spendPerRun = parseFloat(mission.spendPerRun);
  const burnIndicatorColor = spendPerRun > 0.03 ? "text-red-600" : spendPerRun > 0.02 ? "text-amber-600" : "text-emerald-600";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white/80 backdrop-blur-sm border-2 hover:shadow-xl transition-all cursor-pointer rounded-lg overflow-hidden",
        getRouteColor(mission.route),
        expanded && "shadow-2xl"
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <StatusPulse state={mission.state} />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900 mb-1">{mission.name}</h4>
              <p className="text-xs text-slate-600">Owner: {mission.owner}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge className={getStateColor(mission.state)}>
              {mission.state}
            </Badge>
            <Badge className={cn(
              "text-xs capitalize",
              mission.route === "pilot" && "bg-blue-100 text-blue-800",
              mission.route === "copilot" && "bg-purple-100 text-purple-800",
              mission.route === "autopilot" && "bg-emerald-100 text-emerald-800"
            )}>
              {mission.route}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExpandClick}
              className="h-6 w-6 p-0"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Compact View */}
        {!expanded && (
          <>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <TrendingUp className="w-3 h-3" />
                <span>Success: {mission.successRate}%</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <Clock className="w-3 h-3" />
                <span>{mission.avgLatency}ms</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <Zap className="w-3 h-3" />
                <span>{mission.tokensPerRun} tok</span>
              </div>
              <div className={cn("flex items-center gap-1 text-xs", burnIndicatorColor)}>
                <DollarSign className="w-3 h-3" />
                <span>${mission.spendPerRun}</span>
              </div>
            </div>

            {mission.lastRuns && (
              <div className="mb-3">
                <div className="text-xs text-slate-600 mb-1">Last 10 runs</div>
                <ResponsiveContainer width="100%" height={30}>
                  <LineChart data={mission.lastRuns}>
                    <Line 
                      type="monotone" 
                      dataKey="success" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* Expanded View - Mission Dashboard */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 mb-4"
            >
              {/* Health Rings */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center">
                  <HealthRing percentage={mission.successRate} label="Success" color="#10b981" />
                </div>
                <div className="flex flex-col items-center">
                  <HealthRing percentage={aiConfidence} label="AI Conf." color="#3b82f6" />
                </div>
                <div className="flex flex-col items-center">
                  <HealthRing percentage={modelReliability} label="Reliable" color="#8b5cf6" />
                </div>
              </div>

              {/* AI Sentiment */}
              <div className="p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-slate-900">AI Sentiment</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Confidence</span>
                    <span className="font-bold text-purple-900">{aiConfidence}%</span>
                  </div>
                  <Progress value={aiConfidence} className="h-1.5" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Model Reliability</span>
                    <span className="font-bold text-blue-900">{modelReliability}%</span>
                  </div>
                  <Progress value={modelReliability} className="h-1.5" />
                </div>
              </div>

              {/* Spend Indicator */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-semibold text-slate-900">Spend/Run</span>
                  </div>
                  <span className={cn("text-lg font-bold", burnIndicatorColor)}>
                    ${mission.spendPerRun}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Activity className="w-3 h-3" />
                  <span>Tokens: {mission.tokensPerRun} | Latency: {mission.avgLatency}ms</span>
                </div>
              </div>

              {/* Optimization Insights */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-900">Optimization Advice</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Reduce retry depth to 2 (current: 3)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Switch to Copilot for +8% stability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Enable caching to reduce cost by $0.008/run</span>
                  </li>
                </ul>
              </div>

              {/* Goal Alignment */}
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-900">Goal Alignment</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-900">{goalAlignment}%</span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Mission is performing {goalAlignment >= 90 ? "exceptionally well" : "within acceptable range"} against defined objectives
                </p>
              </div>

              {/* Explain Mission Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onExplain(mission);
                }}
                className="w-full h-8 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Brain className="w-3 h-3 mr-2" />
                Explain Mission
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {mission.state !== "running" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onLaunch(mission)}
              className="h-6 px-2 text-xs text-emerald-600 hover:bg-emerald-50"
            >
              <Play className="w-3 h-3 mr-1" />
              Launch
            </Button>
          )}
          {mission.state === "running" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onPause(mission)}
              className="h-6 px-2 text-xs text-amber-600 hover:bg-amber-50"
            >
              <Pause className="w-3 h-3 mr-1" />
              Pause
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onReroute(mission)}
            className="h-6 px-2 text-xs text-blue-600 hover:bg-blue-50"
          >
            <GitBranch className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenPlan(mission)}
            className="h-6 px-2 text-xs text-slate-600 hover:bg-slate-50"
          >
            <FileText className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </motion.div>
  );
}