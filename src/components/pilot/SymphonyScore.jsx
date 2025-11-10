import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, Activity, Users, Zap, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

export default function SymphonyScore({ score, onOpenHarmonyView }) {
  const [harmonyViewOpen, setHarmonyViewOpen] = useState(false);

  // Calculate component scores
  const components = {
    missionSuccess: 94,
    latency: 88,
    coordinationHarmony: 91,
    costStability: 87
  };

  const avgScore = Math.round(
    Object.values(components).reduce((sum, val) => sum + val, 0) / Object.keys(components).length
  );

  const getScoreColor = () => {
    if (avgScore >= 90) return "emerald";
    if (avgScore >= 75) return "blue";
    if (avgScore >= 60) return "amber";
    return "red";
  };

  const color = getScoreColor();

  const radialData = [
    { name: "Symphony", value: avgScore, fill: color === "emerald" ? "#10b981" : color === "blue" ? "#3b82f6" : color === "amber" ? "#f59e0b" : "#ef4444" }
  ];

  // AI Self-Assessment
  const aiAssessment = {
    overall: "Autonomy balance optimal",
    syncLatency: "120ms",
    recommendation: "Recommend 10% reduction in safety delay for improved throughput",
    balance: {
      humanOversight: 25,
      automation: 45,
      aiCoordination: 30
    }
  };

  return (
    <>
      <motion.div
        className="cursor-pointer"
        onClick={() => {
          setHarmonyViewOpen(true);
          onOpenHarmonyView?.();
        }}
        whileHover={{ scale: 1.02 }}
      >
        <Card className={cn(
          "bg-gradient-to-br border-2 shadow-lg relative overflow-hidden",
          color === "emerald" && "from-emerald-50 to-green-100 border-emerald-300",
          color === "blue" && "from-blue-50 to-cyan-100 border-blue-300",
          color === "amber" && "from-amber-50 to-orange-100 border-amber-300",
          color === "red" && "from-red-50 to-pink-100 border-red-300"
        )}>
          {/* Animated ripple when score drops */}
          {avgScore < 80 && (
            <motion.div
              className={cn(
                "absolute inset-0 rounded-lg opacity-30",
                color === "amber" && "bg-amber-400",
                color === "red" && "bg-red-400"
              )}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}

          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className={cn(
                    "w-5 h-5",
                    color === "emerald" && "text-emerald-600",
                    color === "blue" && "text-blue-600",
                    color === "amber" && "text-amber-600",
                    color === "red" && "text-red-600"
                  )} />
                  <h4 className="text-sm font-bold text-slate-900">Operational Intelligence Index</h4>
                </div>
                <p className="text-xs text-slate-600">Global AI efficiency</p>
              </div>
              
              {/* Score Display */}
              <div className="text-center">
                <motion.div
                  className={cn(
                    "text-5xl font-bold mb-1",
                    color === "emerald" && "text-emerald-600",
                    color === "blue" && "text-blue-600",
                    color === "amber" && "text-amber-600",
                    color === "red" && "text-red-600"
                  )}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {avgScore}
                </motion.div>
                <Badge className={cn(
                  "text-[9px] py-0",
                  color === "emerald" && "bg-emerald-100 text-emerald-700",
                  color === "blue" && "bg-blue-100 text-blue-700",
                  color === "amber" && "bg-amber-100 text-amber-700",
                  color === "red" && "bg-red-100 text-red-700"
                )}>
                  / 100
                </Badge>
              </div>
            </div>

            {/* Mini Component Breakdown */}
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(components).map(([key, value]) => (
                <div key={key} className="text-center p-2 bg-white/60 rounded-lg">
                  <div className="text-lg font-bold text-slate-900">{value}</div>
                  <div className="text-[9px] text-slate-600 leading-tight capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setHarmonyViewOpen(true);
              }}
              className="w-full mt-4 h-7 text-xs"
            >
              AI Performance Insights
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Harmony View Drawer */}
      <Sheet open={harmonyViewOpen} onOpenChange={setHarmonyViewOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              AI Harmony View
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Overall Assessment */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Self-Assessment
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-700">Overall Status:</span>
                    <span className="font-semibold text-emerald-700">
                      {aiAssessment.overall}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Pilot-CoPilot Sync:</span>
                    <span className="font-semibold text-blue-700">
                      {aiAssessment.syncLatency}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance Breakdown */}
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Autonomy Balance</h4>
                <div className="space-y-3">
                  {Object.entries(aiAssessment.balance).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{value}%</span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Component Scores Detail */}
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Component Scores</h4>
                <div className="space-y-2">
                  {Object.entries(components).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded bg-slate-50">
                      <span className="text-xs text-slate-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={value} className="h-1 w-20" />
                        <span className="text-xs font-bold text-slate-900 w-8 text-right">
                          {value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendation */}
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  AI Recommendation
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {aiAssessment.recommendation}
                </p>
                <Button
                  size="sm"
                  className="w-full mt-3 h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                >
                  Apply Recommendation
                </Button>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}