import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TrendingUp, AlertTriangle, Clock, ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function MissionImpactForecaster({ missions, onApplyHandoff }) {
  const [autoApprove, setAutoApprove] = useState(false);

  // Generate forecast data
  const forecastData = Array.from({ length: 12 }, (_, i) => ({
    time: i * 5,
    load: 45 + Math.random() * 30 + (i > 6 ? 15 : 0),
    threshold: 70
  }));

  // Predicted bottlenecks
  const predictions = [
    {
      id: 1,
      severity: "high",
      title: "SLA breach risk in 15 minutes",
      description: "invoice_chase_v1 queue depth rising. Predicted 89% breach probability.",
      time: "15 min",
      recommendation: {
        action: "Shift 2 low-priority flows to Autopilot",
        impact: "-35% queue depth, +8% SLA compliance"
      }
    },
    {
      id: 2,
      severity: "medium",
      title: "Latency spike forecast",
      description: "External API shows degraded performance trend. Expected +420ms latency.",
      time: "30 min",
      recommendation: {
        action: "Enable aggressive caching + circuit breaker",
        impact: "-280ms avg latency, +2% cost"
      }
    },
    {
      id: 3,
      severity: "low",
      title: "Cost optimization opportunity",
      description: "3 missions running on high-cost models with low complexity workload.",
      time: "ongoing",
      recommendation: {
        action: "Auto-switch to cost-save profile",
        impact: "-$0.18/hour, -1% accuracy"
      }
    }
  ];

  const handleApplyRecommendation = (prediction) => {
    onApplyHandoff?.(prediction.recommendation);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high": return "red";
      case "medium": return "amber";
      case "low": return "blue";
      default: return "slate";
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-bold text-slate-900">Mission Impact Forecaster</h4>
            <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
              Predictive
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-approve" className="text-xs text-slate-700 cursor-pointer">
              Auto-Approve Routine
            </Label>
            <Switch
              id="auto-approve"
              checked={autoApprove}
              onCheckedChange={setAutoApprove}
              className="scale-75"
            />
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="mb-4">
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }}
                label={{ value: "Minutes ahead", position: "insideBottomRight", fontSize: 10, fill: "#64748b" }}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgb(226, 232, 240)',
                  borderRadius: '8px',
                  fontSize: '11px'
                }}
              />
              <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Threshold', fontSize: 10, fill: '#f59e0b' }} />
              <Line 
                type="monotone" 
                dataKey="load" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={false}
                name="Predicted Load %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Predicted Issues */}
        <div className="space-y-2">
          <AnimatePresence>
            {predictions.map((prediction, idx) => {
              const color = getSeverityColor(prediction.severity);
              
              return (
                <motion.div
                  key={prediction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "relative p-3 rounded-lg border-l-4",
                    color === "red" && "border-l-red-500 bg-red-50",
                    color === "amber" && "border-l-amber-500 bg-amber-50",
                    color === "blue" && "border-l-blue-500 bg-blue-50"
                  )}
                >
                  {/* Pulse effect for high severity */}
                  {prediction.severity === "high" && (
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-red-400 opacity-10"
                      animate={{ opacity: [0.1, 0.2, 0.1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className={cn(
                            "w-3 h-3",
                            color === "red" && "text-red-600",
                            color === "amber" && "text-amber-600",
                            color === "blue" && "text-blue-600"
                          )} />
                          <h5 className="text-xs font-bold text-slate-900">
                            {prediction.title}
                          </h5>
                          <Badge className={cn(
                            "text-[9px] py-0 capitalize",
                            color === "red" && "bg-red-100 text-red-700",
                            color === "amber" && "bg-amber-100 text-amber-700",
                            color === "blue" && "bg-blue-100 text-blue-700"
                          )}>
                            {prediction.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-700 leading-tight mb-2">
                          {prediction.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600 flex-shrink-0 ml-2">
                        <Clock className="w-3 h-3" />
                        <span>{prediction.time}</span>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="p-2 rounded-lg bg-white border border-slate-200 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className={cn(
                          "w-3 h-3",
                          color === "red" && "text-red-600",
                          color === "amber" && "text-amber-600",
                          color === "blue" && "text-blue-600"
                        )} />
                        <span className="text-xs font-semibold text-slate-900">
                          Recommended Action:
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mb-1">
                        {prediction.recommendation.action}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-700">
                        <ArrowRight className="w-2 h-2" />
                        <span>Impact: {prediction.recommendation.impact}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      size="sm"
                      onClick={() => handleApplyRecommendation(prediction)}
                      className={cn(
                        "w-full h-6 text-xs",
                        color === "red" && "bg-red-600 hover:bg-red-700",
                        color === "amber" && "bg-amber-600 hover:bg-amber-700",
                        color === "blue" && "bg-blue-600 hover:bg-blue-700"
                      )}
                    >
                      {autoApprove ? "Auto-Applying..." : "Apply Handoff"}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Auto-Approve Info */}
        {autoApprove && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-3 h-3 text-emerald-600" />
            </motion.div>
            <p className="text-xs text-emerald-900">
              Auto-approval enabled for routine adjustments under 5% impact
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}