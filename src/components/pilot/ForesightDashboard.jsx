import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle, FlaskConical, XCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ForesightDashboard({ missions, onApplyFix, onSimulateFix, onIgnore }) {
  const [predictions, setPredictions] = useState([
    {
      id: 1,
      mission: "ar_collection_push",
      severity: "high",
      prediction: "Mission may fail in 15 mins",
      reason: "Saturation at Step 4 (API rate limit approaching)",
      confidence: 91,
      timeToFailure: "15 min",
      suggestedFix: {
        action: "Reroute to Copilot + enable throttling",
        impact: "-45% failure risk, +180ms latency"
      },
      trend: "worsening"
    },
    {
      id: 2,
      mission: "batch_pick_opt_v2",
      severity: "medium",
      prediction: "Token usage spike predicted",
      reason: "Payload size increasing 12% per hour, will exceed budget",
      confidence: 87,
      timeToFailure: "45 min",
      suggestedFix: {
        action: "Switch to Cost-Save profile temporarily",
        impact: "-22% token usage, -1.5% accuracy"
      },
      trend: "stable"
    },
    {
      id: 3,
      mission: "invoice_chase_v1",
      severity: "low",
      prediction: "Minor latency degradation likely",
      reason: "External API showing early signs of slowdown (5% p95 increase)",
      confidence: 78,
      timeToFailure: "2 hours",
      suggestedFix: {
        action: "Enable aggressive caching + add circuit breaker",
        impact: "-280ms latency, +$0.002 cost"
      },
      trend: "improving"
    }
  ]);

  const handleApplyFix = (prediction) => {
    setPredictions(prev => prev.filter(p => p.id !== prediction.id));
    toast.success("Fix applied proactively", {
      description: prediction.suggestedFix.action
    });
    onApplyFix?.(prediction);
  };

  const handleSimulate = (prediction) => {
    toast.info("Running simulation...", {
      description: "Testing fix in sandbox environment"
    });
    onSimulateFix?.(prediction);
  };

  const handleIgnore = (prediction) => {
    setPredictions(prev => prev.filter(p => p.id !== prediction.id));
    toast.info("Prediction dismissed");
    onIgnore?.(prediction);
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
            <Zap className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-bold text-slate-900">Foresight</h4>
            <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
              Proactive Intelligence
            </Badge>
          </div>
          <Badge className={cn(
            "text-[9px] py-0",
            predictions.some(p => p.severity === "high") 
              ? "bg-red-100 text-red-700 animate-pulse" 
              : "bg-emerald-100 text-emerald-700"
          )}>
            {predictions.length} upcoming issues
          </Badge>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {predictions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-600">No predicted failures</p>
                <p className="text-[10px] text-slate-500 mt-1">All missions on track</p>
              </motion.div>
            ) : (
              predictions.map((prediction, idx) => {
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
                    {/* Pulse for high severity */}
                    {prediction.severity === "high" && (
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-red-400 opacity-10"
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}

                    <div className="relative z-10">
                      {/* Header */}
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
                              {prediction.prediction}
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
                          <div className="text-[10px] text-slate-600 mb-1">
                            Mission: <span className="font-semibold text-slate-900">{prediction.mission}</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-tight mb-2">
                            {prediction.reason}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs flex-shrink-0 ml-2">
                          <Clock className={cn(
                            "w-3 h-3",
                            color === "red" && "text-red-600",
                            color === "amber" && "text-amber-600",
                            color === "blue" && "text-blue-600"
                          )} />
                          <span className={cn(
                            "font-semibold",
                            color === "red" && "text-red-900",
                            color === "amber" && "text-amber-900",
                            color === "blue" && "text-blue-900"
                          )}>
                            {prediction.timeToFailure}
                          </span>
                        </div>
                      </div>

                      {/* Confidence & Trend */}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
                          {prediction.confidence}% AI confidence
                        </Badge>
                        <Badge className={cn(
                          "text-[9px] py-0",
                          prediction.trend === "worsening" && "bg-red-100 text-red-700",
                          prediction.trend === "stable" && "bg-amber-100 text-amber-700",
                          prediction.trend === "improving" && "bg-emerald-100 text-emerald-700"
                        )}>
                          Trend: {prediction.trend}
                        </Badge>
                      </div>

                      {/* Suggested Fix */}
                      <div className="p-2 rounded-lg bg-white border border-slate-200 mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className={cn(
                            "w-3 h-3",
                            color === "red" && "text-red-600",
                            color === "amber" && "text-amber-600",
                            color === "blue" && "text-blue-600"
                          )} />
                          <span className="text-xs font-semibold text-slate-900">
                            AI Suggested Fix
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mb-1">
                          {prediction.suggestedFix.action}
                        </p>
                        <div className="text-[10px] text-emerald-700">
                          Impact: {prediction.suggestedFix.impact}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleApplyFix(prediction)}
                          className={cn(
                            "h-6 text-[10px]",
                            color === "red" && "bg-red-600 hover:bg-red-700",
                            color === "amber" && "bg-amber-600 hover:bg-amber-700",
                            color === "blue" && "bg-blue-600 hover:bg-blue-700"
                          )}
                        >
                          <CheckCircle className="w-2 h-2 mr-1" />
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSimulate(prediction)}
                          className="h-6 text-[10px]"
                        >
                          <FlaskConical className="w-2 h-2 mr-1" />
                          Simulate
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleIgnore(prediction)}
                          className="h-6 text-[10px] text-slate-600"
                        >
                          <XCircle className="w-2 h-2 mr-1" />
                          Ignore
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}