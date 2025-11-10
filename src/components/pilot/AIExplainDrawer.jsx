import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, ArrowRight, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AIExplainDrawer({ open, onOpenChange, decision }) {
  if (!decision) return null;

  // Mock alternative options
  const alternatives = [
    {
      option: "Route to Co-Pilot instead",
      latencyDelta: 140,
      costDelta: -0.018,
      successDelta: 2,
      confidence: 82
    },
    {
      option: "Route to Autopilot instead",
      latencyDelta: -60,
      costDelta: -0.025,
      successDelta: -3,
      confidence: 76
    }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-slate-200 w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
            AI Decision Explanation
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Decision Summary */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-bold text-purple-900 mb-2">Decision Made</h4>
              <p className="text-sm text-slate-900 font-semibold mb-3">
                {decision.action}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-600">Agent:</span>
                  <span className="ml-2 font-semibold text-slate-900 capitalize">
                    {decision.agent}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Confidence:</span>
                  <span className="ml-2 font-semibold text-purple-700">
                    {decision.confidence || 92}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Timestamp:</span>
                  <span className="ml-2 font-semibold text-slate-900">
                    {decision.timestamp || new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Mission:</span>
                  <span className="ml-2 font-semibold text-slate-900">
                    {decision.mission || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reasoning Path */}
          <Card className="border-blue-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Reasoning Path
              </h4>
              
              <div className="space-y-3">
                {/* Input */}
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-xs font-semibold text-blue-900 mb-2">1. Input Analysis</div>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {(decision.inputs || ["Request priority: High", "PII detected: Yes", "Cost estimate: $0.045"]).map((input, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                        <span>{input}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Policy Check */}
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="text-xs font-semibold text-purple-900 mb-2">2. Policy Validation</div>
                  <ul className="space-y-1 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-700 text-[10px]">✓</span>
                      </div>
                      <span>PII masking applied</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-700 text-[10px]">✓</span>
                      </div>
                      <span>Budget check passed</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-700 text-[10px]">✓</span>
                      </div>
                      <span>Risk score acceptable (0.32)</span>
                    </li>
                  </ul>
                </div>

                {/* Decision */}
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-semibold text-emerald-900 mb-2">3. Final Decision</div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {decision.reason || "Based on risk assessment and policy validation, routing to Pilot for manual review provides optimal balance of safety and efficiency."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confidence & Impact */}
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Impact Metrics</h4>
              <div className="grid grid-cols-3 gap-2">
                {(decision.outcome || {latency: -120, cost: 0.003, success: 96}).latency !== undefined && (
                  <div className="p-2 bg-slate-50 rounded text-center">
                    <div className={cn(
                      "text-lg font-bold",
                      (decision.outcome?.latency || -120) < 0 ? "text-emerald-700" : "text-amber-700"
                    )}>
                      {(decision.outcome?.latency || -120) > 0 ? '+' : ''}{decision.outcome?.latency || -120}ms
                    </div>
                    <div className="text-[10px] text-slate-600">Latency</div>
                  </div>
                )}
                {(decision.outcome || {}).cost !== undefined && (
                  <div className="p-2 bg-slate-50 rounded text-center">
                    <div className={cn(
                      "text-lg font-bold",
                      (decision.outcome?.cost || 0.003) < 0 ? "text-emerald-700" : "text-red-700"
                    )}>
                      {(decision.outcome?.cost || 0.003) > 0 ? '+' : ''}${Math.abs(decision.outcome?.cost || 0.003).toFixed(3)}
                    </div>
                    <div className="text-[10px] text-slate-600">Cost</div>
                  </div>
                )}
                {(decision.outcome || {}).success !== undefined && (
                  <div className="p-2 bg-slate-50 rounded text-center">
                    <div className="text-lg font-bold text-purple-700">
                      {decision.outcome?.success || 96}%
                    </div>
                    <div className="text-[10px] text-slate-600">Success</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alternative Options */}
          <Card className="border-amber-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Alternative Paths Considered
              </h4>
              
              <div className="space-y-2">
                {alternatives.map((alt, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 bg-white rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-900">
                        {alt.option}
                      </span>
                      <Badge className="bg-slate-100 text-slate-700 text-[9px] py-0">
                        {alt.confidence}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                      <div className="flex items-center gap-1">
                        {alt.latencyDelta < 0 ? (
                          <TrendingDown className="w-2 h-2 text-emerald-600" />
                        ) : (
                          <TrendingUp className="w-2 h-2 text-amber-600" />
                        )}
                        <span className="text-slate-700">
                          {alt.latencyDelta > 0 ? '+' : ''}{alt.latencyDelta}ms
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {alt.costDelta < 0 ? (
                          <TrendingDown className="w-2 h-2 text-emerald-600" />
                        ) : (
                          <TrendingUp className="w-2 h-2 text-red-600" />
                        )}
                        <span className="text-slate-700">
                          {alt.costDelta > 0 ? '+' : ''}${Math.abs(alt.costDelta).toFixed(3)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {alt.successDelta > 0 ? (
                          <TrendingUp className="w-2 h-2 text-emerald-600" />
                        ) : (
                          <TrendingDown className="w-2 h-2 text-red-600" />
                        )}
                        <span className="text-slate-700">
                          {alt.successDelta > 0 ? '+' : ''}{alt.successDelta}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}