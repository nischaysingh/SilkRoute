import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Brain, GitBranch, ChevronRight, Target, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function ReasoningMap({ decisions, onCompareWithCoPilot }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return "emerald";
    if (confidence >= 75) return "blue";
    if (confidence >= 60) return "amber";
    return "red";
  };

  const handleNodeClick = (decision) => {
    setSelectedNode(decision);
    setDetailsOpen(true);
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-600" />
              Reasoning Map (Last 10 Decisions)
            </h4>
            <Button
              size="sm"
              variant="outline"
              onClick={onCompareWithCoPilot}
              className="h-7 text-xs border-purple-300 bg-purple-50 hover:bg-purple-100"
            >
              Compare vs Co-Pilot
            </Button>
          </div>

          {/* Tree View */}
          <div className="relative">
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
              {decisions.map((decision, idx) => {
                if (idx === 0) return null;
                const prevIdx = idx - 1;
                const y1 = prevIdx * 60 + 30;
                const y2 = idx * 60 + 30;
                
                return (
                  <motion.line
                    key={idx}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    x1="30"
                    y1={y1}
                    x2="30"
                    y2={y2}
                    stroke="#cbd5e1"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                );
              })}
            </svg>

            <div className="space-y-4 relative" style={{ zIndex: 1 }}>
              {decisions.map((decision, idx) => {
                const confidenceColor = getConfidenceColor(decision.confidence);
                
                return (
                  <motion.div
                    key={decision.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    {/* Node Circle */}
                    <button
                      onClick={() => handleNodeClick(decision)}
                      className={cn(
                        "w-12 h-12 rounded-full border-4 flex items-center justify-center relative cursor-pointer transition-all hover:scale-110",
                        confidenceColor === "emerald" && "bg-emerald-100 border-emerald-500",
                        confidenceColor === "blue" && "bg-blue-100 border-blue-500",
                        confidenceColor === "amber" && "bg-amber-100 border-amber-500",
                        confidenceColor === "red" && "bg-red-100 border-red-500"
                      )}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={cn(
                          "absolute inset-0 rounded-full opacity-20",
                          confidenceColor === "emerald" && "bg-emerald-500",
                          confidenceColor === "blue" && "bg-blue-500",
                          confidenceColor === "amber" && "bg-amber-500",
                          confidenceColor === "red" && "bg-red-500"
                        )}
                      />
                      <Brain className={cn(
                        "w-5 h-5 relative z-10",
                        confidenceColor === "emerald" && "text-emerald-700",
                        confidenceColor === "blue" && "text-blue-700",
                        confidenceColor === "amber" && "text-amber-700",
                        confidenceColor === "red" && "text-red-700"
                      )} />
                    </button>

                    {/* Node Info */}
                    <div className="flex-1 p-3 rounded-lg bg-slate-50 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
                         onClick={() => handleNodeClick(decision)}>
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-xs font-bold text-slate-900">{decision.title}</h5>
                        <Badge className={cn(
                          "text-[9px] py-0",
                          confidenceColor === "emerald" && "bg-emerald-100 text-emerald-700",
                          confidenceColor === "blue" && "bg-blue-100 text-blue-700",
                          confidenceColor === "amber" && "bg-amber-100 text-amber-700",
                          confidenceColor === "red" && "bg-red-100 text-red-700"
                        )}>
                          {decision.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 leading-tight mb-1">
                        {decision.outcome}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>{decision.timestamp}</span>
                        <span>•</span>
                        <span className="capitalize">{decision.type}</span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Drawer */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Decision Reasoning
            </SheetTitle>
          </SheetHeader>

          {selectedNode && (
            <div className="mt-6 space-y-4">
              {/* Overview */}
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-purple-900 mb-2">{selectedNode.title}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-slate-600">Type</div>
                      <div className="font-semibold text-slate-900 capitalize">{selectedNode.type}</div>
                    </div>
                    <div>
                      <div className="text-slate-600">Confidence</div>
                      <div className="font-semibold text-slate-900">{selectedNode.confidence}%</div>
                    </div>
                    <div>
                      <div className="text-slate-600">Timestamp</div>
                      <div className="font-semibold text-slate-900">{selectedNode.timestamp}</div>
                    </div>
                    <div>
                      <div className="text-slate-600">Latency</div>
                      <div className="font-semibold text-slate-900">{selectedNode.latency}ms</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inputs */}
              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Inputs
                  </h4>
                  <ul className="space-y-2">
                    {selectedNode.inputs?.map((input, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <ChevronRight className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{input}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Reasoning Chain */}
              <Card className="border-purple-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Reasoning Chain
                  </h4>
                  <div className="space-y-2">
                    {selectedNode.reasoning?.map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-2 p-2 rounded bg-purple-50 border border-purple-200"
                      >
                        <div className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed flex-1">{step}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Outcome */}
              <Card className="border-emerald-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Outcome
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed mb-3">
                    {selectedNode.outcome}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedNode.impact && Object.entries(selectedNode.impact).map(([key, value]) => (
                      <div key={key} className="p-2 bg-emerald-50 rounded text-center">
                        <div className="text-sm font-bold text-emerald-900">{value}</div>
                        <div className="text-[10px] text-slate-600 capitalize">{key}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Guards Applied */}
              {selectedNode.guards && (
                <Card className="border-amber-200">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Guards Applied
                    </h4>
                    <ul className="space-y-1">
                      {selectedNode.guards.map((guard, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          <span>{guard}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}