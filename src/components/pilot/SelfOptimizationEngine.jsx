import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Zap, Clock, TrendingUp, TrendingDown, RefreshCw, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function SelfOptimizationEngine({ onOptimizationApplied }) {
  const [autoOptimizeEnabled, setAutoOptimizeEnabled] = useState(true);
  const [optimizationCycle, setOptimizationCycle] = useState({
    status: "idle", // idle, analyzing, applying, completed
    progress: 0,
    nextRunIn: 360, // minutes
    lastRun: "6 hours ago",
    cycleNumber: 42
  });

  const [optimizations, setOptimizations] = useState([
    {
      id: 1,
      rule: "Reduced retry count from 3 to 2",
      mission: "invoice_chase_v1",
      impact: { success: +6.1, cost: -4.8, latency: -150 },
      confidence: 94,
      applied: true,
      timestamp: "6 hours ago"
    },
    {
      id: 2,
      rule: "Switched to balanced profile",
      mission: "batch_pick_opt_v2",
      impact: { success: +2.3, cost: +1.2, latency: -80 },
      confidence: 87,
      applied: true,
      timestamp: "6 hours ago"
    },
    {
      id: 3,
      rule: "Enabled aggressive caching",
      mission: "ar_collection_push",
      impact: { success: +3.7, cost: -8.2, latency: -220 },
      confidence: 91,
      applied: true,
      timestamp: "6 hours ago"
    }
  ]);

  const [stats, setStats] = useState({
    totalCycles: 42,
    totalOptimizations: 127,
    avgSuccessImpact: +4.8,
    avgCostReduction: -5.2,
    rulesApplied: 3,
    rulesRejected: 0
  });

  // Simulate optimization cycle
  useEffect(() => {
    if (!autoOptimizeEnabled) return;

    const countdownInterval = setInterval(() => {
      setOptimizationCycle(prev => ({
        ...prev,
        nextRunIn: prev.nextRunIn - 1
      }));
    }, 60000); // Update every minute

    const cycleInterval = setInterval(() => {
      if (optimizationCycle.nextRunIn <= 0) {
        runOptimizationCycle();
      }
    }, 60000);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(cycleInterval);
    };
  }, [autoOptimizeEnabled, optimizationCycle.nextRunIn]);

  const runOptimizationCycle = () => {
    setOptimizationCycle(prev => ({
      ...prev,
      status: "analyzing",
      progress: 0
    }));

    toast.info("Self-optimization cycle started", {
      description: "Analyzing all active missions..."
    });

    // Simulate analysis phase
    let progress = 0;
    const analysisInterval = setInterval(() => {
      progress += 10;
      setOptimizationCycle(prev => ({
        ...prev,
        progress,
        status: progress < 50 ? "analyzing" : "applying"
      }));

      if (progress >= 100) {
        clearInterval(analysisInterval);
        completeCycle();
      }
    }, 500);
  };

  const completeCycle = () => {
    const newOptimizations = [
      {
        id: optimizations.length + 1,
        rule: "Adjusted concurrency to 15",
        mission: "invoice_chase_v1",
        impact: { success: +4.2, cost: -3.1, latency: -90 },
        confidence: 92,
        applied: true,
        timestamp: "Just now"
      }
    ];

    setOptimizations(prev => [...newOptimizations, ...prev]);
    setOptimizationCycle({
      status: "completed",
      progress: 100,
      nextRunIn: 360,
      lastRun: "Just now",
      cycleNumber: optimizationCycle.cycleNumber + 1
    });

    setStats(prev => ({
      ...prev,
      totalCycles: prev.totalCycles + 1,
      totalOptimizations: prev.totalOptimizations + newOptimizations.length,
      rulesApplied: prev.rulesApplied + newOptimizations.length
    }));

    toast.success("Self-optimization completed", {
      description: `Applied ${newOptimizations.length} optimization rule(s)`
    });

    onOptimizationApplied?.({
      rules: newOptimizations,
      totalImpact: {
        success: +4.2,
        cost: -3.1
      }
    });

    // Reset to idle after 3 seconds
    setTimeout(() => {
      setOptimizationCycle(prev => ({
        ...prev,
        status: "idle"
      }));
    }, 3000);
  };

  const handleManualTrigger = () => {
    if (optimizationCycle.status !== "idle") return;
    runOptimizationCycle();
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-bold text-slate-900">Self-Optimization Engine</h4>
            <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
              Continuous Learning
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-optimize" className="text-xs text-slate-700 cursor-pointer">
              Auto-Optimize
            </Label>
            <Switch
              id="auto-optimize"
              checked={autoOptimizeEnabled}
              onCheckedChange={setAutoOptimizeEnabled}
              className="scale-75"
            />
          </div>
        </div>

        {/* Cycle Status */}
        <div className={cn(
          "mb-4 p-3 rounded-lg border-2",
          optimizationCycle.status === "idle" && "bg-slate-50 border-slate-200",
          optimizationCycle.status === "analyzing" && "bg-blue-50 border-blue-300",
          optimizationCycle.status === "applying" && "bg-purple-50 border-purple-300",
          optimizationCycle.status === "completed" && "bg-emerald-50 border-emerald-300"
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {optimizationCycle.status === "idle" && <Clock className="w-4 h-4 text-slate-600" />}
              {optimizationCycle.status === "analyzing" && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
              {optimizationCycle.status === "applying" && <Zap className="w-4 h-4 text-purple-600" />}
              {optimizationCycle.status === "completed" && <CheckCircle className="w-4 h-4 text-emerald-600" />}
              
              <span className="text-xs font-semibold text-slate-900">
                {optimizationCycle.status === "idle" && "Next Cycle"}
                {optimizationCycle.status === "analyzing" && "Analyzing Missions"}
                {optimizationCycle.status === "applying" && "Applying Optimizations"}
                {optimizationCycle.status === "completed" && "Cycle Completed"}
              </span>
            </div>
            <Badge className="bg-slate-100 text-slate-700 text-[9px] py-0">
              Cycle #{optimizationCycle.cycleNumber}
            </Badge>
          </div>

          {optimizationCycle.status === "idle" && (
            <div className="text-xs text-slate-600">
              {formatTime(optimizationCycle.nextRunIn)} until next cycle
            </div>
          )}

          {(optimizationCycle.status === "analyzing" || optimizationCycle.status === "applying") && (
            <div className="space-y-2">
              <Progress value={optimizationCycle.progress} className="h-2" />
              <div className="text-xs text-slate-600">
                {optimizationCycle.progress}% complete
              </div>
            </div>
          )}

          {optimizationCycle.status === "completed" && (
            <div className="text-xs text-emerald-700 font-semibold">
              Successfully applied {stats.rulesApplied} optimization rules
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-center">
            <div className="text-lg font-bold text-blue-700">{stats.totalCycles}</div>
            <div className="text-[10px] text-slate-600">Total Cycles</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-lg font-bold text-emerald-700">+{stats.avgSuccessImpact}%</div>
            <div className="text-[10px] text-slate-600">Avg Success ↑</div>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-center">
            <div className="text-lg font-bold text-purple-700">{stats.avgCostReduction}%</div>
            <div className="text-[10px] text-slate-600">Avg Cost ↓</div>
          </div>
        </div>

        {/* Recent Optimizations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold text-slate-900">Recent Optimizations</h5>
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualTrigger}
              disabled={optimizationCycle.status !== "idle"}
              className="h-6 text-xs"
            >
              <RefreshCw className={cn(
                "w-3 h-3 mr-1",
                optimizationCycle.status !== "idle" && "animate-spin"
              )} />
              Run Now
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {optimizations.slice(0, 5).map((opt, idx) => (
                <motion.div
                  key={opt.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-3 rounded-lg border border-slate-200 bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900 mb-1">{opt.rule}</p>
                      <p className="text-[10px] text-slate-600">{opt.mission}</p>
                    </div>
                    <Badge className={cn(
                      "text-[9px] py-0",
                      opt.confidence > 90 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {opt.confidence}% conf
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-1">
                      {opt.impact.success > 0 ? (
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                      <span className={cn(
                        "text-[10px] font-semibold",
                        opt.impact.success > 0 ? "text-emerald-700" : "text-red-700"
                      )}>
                        {opt.impact.success > 0 ? '+' : ''}{opt.impact.success}% success
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {opt.impact.cost < 0 ? (
                        <TrendingDown className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <TrendingUp className="w-3 h-3 text-red-600" />
                      )}
                      <span className={cn(
                        "text-[10px] font-semibold",
                        opt.impact.cost < 0 ? "text-emerald-700" : "text-red-700"
                      )}>
                        {opt.impact.cost}% cost
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 text-right">
                      {opt.timestamp}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Next Actions */}
        {autoOptimizeEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-2 rounded-lg bg-purple-50 border border-purple-200 flex items-center gap-2 text-xs text-purple-900"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-3 h-3" />
            </motion.div>
            <span>AI continuously optimizing across all missions...</span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}