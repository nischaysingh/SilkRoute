import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, AlertTriangle, CheckCircle, XCircle, 
  Zap, Activity, Clock, DollarSign, Sparkles 
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AIWorkflowOptimizer({ workflows }) {
  const [optimizations, setOptimizations] = useState([]);
  const [monitoring, setMonitoring] = useState([]);
  const [autoOptimizeEnabled, setAutoOptimizeEnabled] = useState(false);

  useEffect(() => {
    // AI-detected optimizations
    const detectedOptimizations = [
      {
        id: 1,
        workflow: "Invoice Reconciler",
        type: "performance",
        severity: "high",
        title: "Enable Parallel Processing",
        description: "Steps 3-5 can run in parallel, reducing execution time by 35%",
        impact: {
          latencyReduction: "2.4s → 1.6s",
          costChange: "+$0.003/run",
          successRate: "No change"
        },
        confidence: 94,
        autoApplicable: true
      },
      {
        id: 2,
        workflow: "Customer Refund Handler",
        type: "cost",
        severity: "medium",
        title: "Cache API Results",
        description: "Payment status check repeats 3x per execution - cache for 5min",
        impact: {
          latencyReduction: "0.8s → 0.3s",
          costChange: "-$0.015/run",
          successRate: "No change"
        },
        confidence: 89,
        autoApplicable: true
      },
      {
        id: 3,
        workflow: "Lead Qualification",
        type: "reliability",
        severity: "high",
        title: "Add Retry Logic",
        description: "CRM API fails 8% of the time - add exponential backoff",
        impact: {
          latencyReduction: "+0.5s avg",
          costChange: "+$0.001/run",
          successRate: "92% → 98%"
        },
        confidence: 96,
        autoApplicable: false
      }
    ];

    setOptimizations(detectedOptimizations);

    // Real-time monitoring data
    const monitoringData = [
      {
        id: 1,
        workflow: "Invoice Reconciler",
        status: "healthy",
        executions24h: 247,
        successRate: 96.4,
        avgLatency: 1847,
        errorRate: 3.6,
        trend: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          latency: 1800 + Math.random() * 300,
          errors: Math.floor(Math.random() * 10)
        }))
      },
      {
        id: 2,
        workflow: "Customer Refund Handler",
        status: "warning",
        executions24h: 89,
        successRate: 91.2,
        avgLatency: 3240,
        errorRate: 8.8,
        trend: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          latency: 3200 + Math.random() * 400,
          errors: Math.floor(Math.random() * 15)
        }))
      },
      {
        id: 3,
        workflow: "Lead Qualification",
        status: "critical",
        executions24h: 156,
        successRate: 92.1,
        avgLatency: 2140,
        errorRate: 7.9,
        trend: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          latency: 2100 + Math.random() * 500,
          errors: Math.floor(Math.random() * 20)
        }))
      }
    ];

    setMonitoring(monitoringData);
  }, [workflows]);

  const handleApplyOptimization = (optimization) => {
    if (optimization.autoApplicable) {
      toast.success(`Applied: ${optimization.title}`, {
        description: `Workflow: ${optimization.workflow}`
      });
      setOptimizations(prev => prev.filter(opt => opt.id !== optimization.id));
    } else {
      toast.info("This optimization requires manual review");
    }
  };

  const handleIgnoreOptimization = (optimization) => {
    toast.info("Optimization dismissed");
    setOptimizations(prev => prev.filter(opt => opt.id !== optimization.id));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-700 border-red-300";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-300";
      case "low": return "bg-blue-100 text-blue-700 border-blue-300";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy": return "bg-emerald-100 text-emerald-700";
      case "warning": return "bg-amber-100 text-amber-700";
      case "critical": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">AI Workflow Optimizer</h2>
                <p className="text-sm text-slate-600">Real-time monitoring and intelligent optimization</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">Auto-Optimize</label>
              <button
                onClick={() => {
                  setAutoOptimizeEnabled(!autoOptimizeEnabled);
                  toast.success(autoOptimizeEnabled ? "Auto-optimize disabled" : "Auto-optimize enabled");
                }}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors",
                  autoOptimizeEnabled ? "bg-emerald-600" : "bg-slate-300"
                )}
              >
                <motion.div
                  className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                  animate={{ x: autoOptimizeEnabled ? 24 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI-Detected Optimizations */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              AI-Detected Optimizations ({optimizations.length})
            </h3>
          </div>

          <AnimatePresence>
            {optimizations.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                <p className="text-sm">All workflows are optimized!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {optimizations.map((opt, idx) => (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn("p-4 rounded-lg border-2", getSeverityColor(opt.severity))}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {opt.type === "performance" && <TrendingUp className="w-5 h-5 text-blue-600" />}
                        {opt.type === "cost" && <DollarSign className="w-5 h-5 text-emerald-600" />}
                        {opt.type === "reliability" && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-slate-900">{opt.title}</h4>
                          <Badge className="text-xs bg-white/50">
                            {opt.confidence}% confidence
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-600 mb-1">
                          Workflow: <strong>{opt.workflow}</strong>
                        </div>
                        <p className="text-xs text-slate-700 mb-3">{opt.description}</p>

                        {/* Impact Metrics */}
                        <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-white/50 rounded">
                          <div>
                            <div className="text-[10px] text-slate-500">Latency</div>
                            <div className="text-xs font-semibold text-blue-700">{opt.impact.latencyReduction}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500">Cost</div>
                            <div className={cn(
                              "text-xs font-semibold",
                              opt.impact.costChange.startsWith("-") ? "text-emerald-700" : "text-red-700"
                            )}>
                              {opt.impact.costChange}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500">Success Rate</div>
                            <div className="text-xs font-semibold text-slate-700">{opt.impact.successRate}</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApplyOptimization(opt)}
                            className={cn(
                              "h-7 text-xs flex-1",
                              opt.autoApplicable 
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                : "bg-slate-600 hover:bg-slate-700"
                            )}
                          >
                            {opt.autoApplicable ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Auto-Apply
                              </>
                            ) : (
                              <>Manual Review Required</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleIgnoreOptimization(opt)}
                            className="h-7 text-xs"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Ignore
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Real-Time Monitoring */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Real-Time Workflow Monitoring
          </h3>

          <div className="space-y-3">
            {monitoring.map((workflow) => (
              <div key={workflow.id} className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{workflow.workflow}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn("text-xs capitalize", getStatusColor(workflow.status))}>
                        {workflow.status}
                      </Badge>
                      <span className="text-xs text-slate-600">
                        {workflow.executions24h} executions (24h)
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    View Details
                  </Button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div className="text-center p-2 rounded bg-white">
                    <div className="text-xs text-slate-500 mb-1">Success Rate</div>
                    <div className={cn(
                      "text-lg font-bold",
                      workflow.successRate >= 95 ? "text-emerald-600" :
                      workflow.successRate >= 90 ? "text-amber-600" : "text-red-600"
                    )}>
                      {workflow.successRate}%
                    </div>
                  </div>
                  <div className="text-center p-2 rounded bg-white">
                    <div className="text-xs text-slate-500 mb-1">Avg Latency</div>
                    <div className="text-lg font-bold text-blue-600">{workflow.avgLatency}ms</div>
                  </div>
                  <div className="text-center p-2 rounded bg-white">
                    <div className="text-xs text-slate-500 mb-1">Error Rate</div>
                    <div className={cn(
                      "text-lg font-bold",
                      workflow.errorRate <= 5 ? "text-emerald-600" :
                      workflow.errorRate <= 10 ? "text-amber-600" : "text-red-600"
                    )}>
                      {workflow.errorRate}%
                    </div>
                  </div>
                  <div className="text-center p-2 rounded bg-white">
                    <div className="text-xs text-slate-500 mb-1">24h Trend</div>
                    <ResponsiveContainer width="100%" height={30}>
                      <LineChart data={workflow.trend}>
                        <Line 
                          type="monotone" 
                          dataKey="latency" 
                          stroke={workflow.status === "healthy" ? "#10b981" : workflow.status === "warning" ? "#f59e0b" : "#ef4444"}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Alerts */}
                {workflow.status !== "healthy" && (
                  <div className={cn(
                    "p-2 rounded text-xs",
                    workflow.status === "warning" && "bg-amber-50 text-amber-800 border border-amber-200",
                    workflow.status === "critical" && "bg-red-50 text-red-800 border border-red-200"
                  )}>
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    {workflow.status === "warning" && "High error rate detected - consider applying suggested optimizations"}
                    {workflow.status === "critical" && "Critical: Multiple failures detected - immediate attention required"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}