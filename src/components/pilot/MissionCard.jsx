import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play, Pause, XCircle, GitBranch, Eye, FileText,
  DollarSign, Clock, TrendingUp, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";

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

export default function MissionCard({ mission, onLaunch, onPause, onAbort, onReroute, onExplain, onOpenPlan, onClick }) {
  return (
    <Card 
      className={cn(
        "bg-white/80 backdrop-blur-sm border-2 hover:shadow-lg transition-all cursor-pointer",
        getRouteColor(mission.route)
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-900 mb-1">{mission.name}</h4>
            <p className="text-xs text-slate-600">Owner: {mission.owner}</p>
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
          </div>
        </div>

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
          <div className="flex items-center gap-1 text-xs text-slate-600">
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
            onClick={() => onExplain(mission)}
            className="h-6 px-2 text-xs text-purple-600 hover:bg-purple-50"
          >
            <Eye className="w-3 h-3" />
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
    </Card>
  );
}