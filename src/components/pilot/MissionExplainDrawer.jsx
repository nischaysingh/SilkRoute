import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Target, AlertTriangle, TrendingUp, Sparkles,
  Clock, DollarSign, Zap, ChevronRight, CheckCircle,
  XCircle, ArrowDown, RefreshCw, GitBranch, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

export default function MissionExplainDrawer({ open, onOpenChange, mission, onApplyOptimization }) {
  const [analyzing, setAnalyzing] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (open && mission) {
      setAnalyzing(true);
      
      // Simulate AI analysis
      setTimeout(() => {
        const anomalyData = Array.from({ length: 20 }, (_, i) => ({
          run: i + 1,
          latency: 800 + Math.random() * 400,
          success: Math.random() > 0.1 ? 1 : 0,
          cost: 0.02 + Math.random() * 0.01
        }));

        const analysis = {
          goalAlignment: {
            score: 92,
            details: {
              accuracy: 94,
              consistency: 91,
              slaCompliance: 89,
              costEfficiency: 93
            },
            summary: `Mission ${mission.name} is performing ${92 >= 90 ? "exceptionally well" : "within acceptable range"} against defined objectives. Success rate of ${mission.successRate}% exceeds target of 85%. Average latency of ${mission.avgLatency}ms is under the 1200ms SLA threshold.`
          },
          anomalies: [
            {
              id: 1,
              severity: "medium",
              type: "latency_spike",
              title: "Latency spikes during peak hours",
              description: "Detected 3 instances where latency exceeded 1500ms between 9-11 AM",
              impact: "7% of runs affected, average delay +680ms",
              firstSeen: "2 days ago",
              lastSeen: "4 hours ago",
              trend: "recurring",
              data: anomalyData.filter((_, i) => [7, 8, 9].includes(i)).map(d => ({ ...d, latency: d.latency * 1.8 }))
            },
            {
              id: 2,
              severity: "low",
              type: "retry_pattern",
              title: "Increased retry rate on external API",
              description: "Webhook endpoint returning 429 (rate limit) more frequently",
              impact: "12% of runs require 2+ retries",
              firstSeen: "5 days ago",
              lastSeen: "1 hour ago",
              trend: "increasing",
              data: anomalyData
            },
            {
              id: 3,
              severity: "high",
              type: "cost_drift",
              title: "Token usage 18% higher than baseline",
              description: "Average token count increased from 800 to 950 per run",
              impact: "$0.003 additional cost per run",
              firstSeen: "1 week ago",
              lastSeen: "ongoing",
              trend: "stable",
              data: anomalyData.map(d => ({ ...d, cost: d.cost * 1.18 }))
            }
          ],
          optimizations: [
            {
              id: 1,
              priority: "high",
              title: "Reduce retry depth from 3 to 2",
              rationale: "Current retry strategy wastes ~180ms per failure. Analysis shows 94% success rate on first retry, only 6% benefit from third attempt.",
              impact: {
                latency: -150,
                cost: -0.004,
                successRate: -1
              },
              confidence: 94,
              effort: "Low - Config change only",
              estimatedSavings: "$24/month"
            },
            {
              id: 2,
              priority: "high",
              title: "Switch to Copilot route for stability",
              rationale: `Mission has ${mission.successRate}% success rate on ${mission.route}. Copilot offers +8% stability with only +40ms latency trade-off.`,
              impact: {
                latency: 40,
                cost: -0.002,
                successRate: 8
              },
              confidence: 91,
              effort: "Medium - Requires testing",
              estimatedSavings: "$18/month"
            },
            {
              id: 3,
              priority: "medium",
              title: "Enable aggressive caching",
              rationale: "47% of requests are repeat queries within 1 hour window. Caching can reduce LLM calls significantly.",
              impact: {
                latency: -220,
                cost: -0.012,
                successRate: 0
              },
              confidence: 88,
              effort: "Low - Enable feature flag",
              estimatedSavings: "$68/month"
            },
            {
              id: 4,
              priority: "low",
              title: "Optimize prompt length",
              rationale: "Current prompt uses 320 tokens. Can be reduced to ~240 tokens without accuracy loss.",
              impact: {
                latency: -25,
                cost: -0.005,
                successRate: 0
              },
              confidence: 82,
              effort: "High - Requires prompt engineering",
              estimatedSavings: "$32/month"
            }
          ]
        };

        setReport(analysis);
        setAnalyzing(false);
      }, 2500);
    }
  }, [open, mission]);

  const handleApplyOptimization = (optimization) => {
    toast.success(`Optimization applied: ${optimization.title}`, {
      description: `Est. savings: ${optimization.estimatedSavings}`
    });
    onApplyOptimization?.(mission, optimization);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high": return "red";
      case "medium": return "amber";
      case "low": return "blue";
      default: return "slate";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "red";
      case "medium": return "amber";
      case "low": return "blue";
      default: return "slate";
    }
  };

  if (!mission) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-slate-200 w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
            AI Mission Analysis
          </SheetTitle>
        </SheetHeader>

        {analyzing ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Analyzing Mission...</h3>
            <p className="text-sm text-slate-600">Processing {mission.lastRuns?.length || 10} recent runs</p>
            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-purple-600 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        ) : report ? (
          <div className="mt-6 space-y-6">
            {/* Mission Overview */}
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold text-slate-900 mb-2">{mission.name}</h4>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <div className="text-slate-600">Owner</div>
                    <div className="font-semibold text-slate-900">{mission.owner}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Route</div>
                    <Badge className={cn(
                      "text-xs capitalize",
                      mission.route === "pilot" && "bg-blue-100 text-blue-800",
                      mission.route === "copilot" && "bg-purple-100 text-purple-800",
                      mission.route === "autopilot" && "bg-emerald-100 text-emerald-800"
                    )}>
                      {mission.route}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-slate-600">Success Rate</div>
                    <div className="font-semibold text-slate-900">{mission.successRate}%</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Last Run</div>
                    <div className="font-semibold text-slate-900">{mission.lastRun}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goal Alignment Score */}
            <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Goal Alignment Score
                  </h4>
                  <div className="text-3xl font-bold text-emerald-900">
                    {report.goalAlignment.score}%
                  </div>
                </div>
                <Progress value={report.goalAlignment.score} className="h-2 mb-3" />
                <p className="text-xs text-slate-700 leading-relaxed mb-3">
                  {report.goalAlignment.summary}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(report.goalAlignment.details).map(([key, value]) => (
                    <div key={key} className="p-2 bg-white rounded border border-emerald-200">
                      <div className="text-[10px] text-slate-600 capitalize mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={value} className="h-1 flex-1" />
                        <span className="text-xs font-bold text-slate-900">{value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Anomalies */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Top Anomalies Detected ({report.anomalies.length})
              </h4>
              <div className="space-y-3">
                {report.anomalies.map((anomaly) => {
                  const severityColor = getSeverityColor(anomaly.severity);
                  
                  return (
                    <motion.div
                      key={anomaly.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className={cn(
                        "border-l-4",
                        severityColor === "red" && "border-l-red-500 bg-red-50",
                        severityColor === "amber" && "border-l-amber-500 bg-amber-50",
                        severityColor === "blue" && "border-l-blue-500 bg-blue-50"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="text-sm font-bold text-slate-900">{anomaly.title}</h5>
                                <Badge className={cn(
                                  "text-[9px] py-0",
                                  severityColor === "red" && "bg-red-100 text-red-700",
                                  severityColor === "amber" && "bg-amber-100 text-amber-700",
                                  severityColor === "blue" && "bg-blue-100 text-blue-700"
                                )}>
                                  {anomaly.severity}
                                </Badge>
                                <Badge className="bg-slate-100 text-slate-700 text-[9px] py-0">
                                  {anomaly.trend}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed mb-2">
                                {anomaly.description}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                            <div>
                              <span className="text-slate-600">Impact: </span>
                              <span className="font-semibold text-slate-900">{anomaly.impact}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">First seen: </span>
                              <span className="font-semibold text-slate-900">{anomaly.firstSeen}</span>
                            </div>
                          </div>
                          {anomaly.data && (
                            <ResponsiveContainer width="100%" height={60}>
                              <LineChart data={anomaly.data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="run" tick={{ fontSize: 8 }} />
                                <YAxis tick={{ fontSize: 8 }} />
                                <Tooltip />
                                <Line 
                                  type="monotone" 
                                  dataKey={anomaly.type.includes("latency") ? "latency" : anomaly.type.includes("cost") ? "cost" : "success"}
                                  stroke={severityColor === "red" ? "#ef4444" : severityColor === "amber" ? "#f59e0b" : "#3b82f6"}
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Actionable Optimizations */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Actionable Optimization Advice ({report.optimizations.length})
              </h4>
              <div className="space-y-3">
                <AnimatePresence>
                  {report.optimizations.map((opt, idx) => {
                    const priorityColor = getPriorityColor(opt.priority);
                    
                    return (
                      <motion.div
                        key={opt.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="border-slate-200 hover:shadow-lg transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="text-sm font-bold text-slate-900">{opt.title}</h5>
                                  <Badge className={cn(
                                    "text-[9px] py-0 capitalize",
                                    priorityColor === "red" && "bg-red-100 text-red-700",
                                    priorityColor === "amber" && "bg-amber-100 text-amber-700",
                                    priorityColor === "blue" && "bg-blue-100 text-blue-700"
                                  )}>
                                    {opt.priority}
                                  </Badge>
                                  <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
                                    {opt.confidence}% AI
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed mb-3">
                                  {opt.rationale}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {opt.impact.latency !== 0 && (
                                <div className="p-2 bg-slate-50 rounded text-center">
                                  <div className={cn(
                                    "text-lg font-bold",
                                    opt.impact.latency < 0 ? "text-emerald-600" : "text-amber-600"
                                  )}>
                                    {opt.impact.latency > 0 ? '+' : ''}{opt.impact.latency}ms
                                  </div>
                                  <div className="text-[10px] text-slate-600 flex items-center justify-center gap-1">
                                    <Clock className="w-2 h-2" />
                                    Latency
                                  </div>
                                </div>
                              )}
                              {opt.impact.cost !== 0 && (
                                <div className="p-2 bg-slate-50 rounded text-center">
                                  <div className={cn(
                                    "text-lg font-bold",
                                    opt.impact.cost < 0 ? "text-emerald-600" : "text-red-600"
                                  )}>
                                    {opt.impact.cost > 0 ? '+' : ''}${Math.abs(opt.impact.cost).toFixed(3)}
                                  </div>
                                  <div className="text-[10px] text-slate-600 flex items-center justify-center gap-1">
                                    <DollarSign className="w-2 h-2" />
                                    Cost
                                  </div>
                                </div>
                              )}
                              {opt.impact.successRate !== 0 && (
                                <div className="p-2 bg-slate-50 rounded text-center">
                                  <div className={cn(
                                    "text-lg font-bold",
                                    opt.impact.successRate > 0 ? "text-emerald-600" : "text-red-600"
                                  )}>
                                    {opt.impact.successRate > 0 ? '+' : ''}{opt.impact.successRate}%
                                  </div>
                                  <div className="text-[10px] text-slate-600 flex items-center justify-center gap-1">
                                    <TrendingUp className="w-2 h-2" />
                                    Success
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between mb-3 text-xs">
                              <div>
                                <span className="text-slate-600">Effort: </span>
                                <span className="font-semibold text-slate-900">{opt.effort}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Est. savings: </span>
                                <span className="font-semibold text-emerald-600">{opt.estimatedSavings}</span>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleApplyOptimization(opt)}
                              className="w-full h-8 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                              <CheckCircle className="w-3 h-3 mr-2" />
                              Apply Optimization
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}