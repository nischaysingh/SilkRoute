import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Brain, Zap, TrendingUp, Activity, Eye, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function MissionBrain({ missions, onExplainDecision }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [decisionGraph, setDecisionGraph] = useState([
    {
      id: 1,
      stage: "Data Input",
      active: true,
      confidence: 98,
      latency: 45,
      impact: "high",
      dataPoints: ["Customer: VIP", "PII detected", "Value: $5,200"]
    },
    {
      id: 2,
      stage: "Policy Check",
      active: true,
      confidence: 95,
      latency: 120,
      impact: "high",
      dataPoints: ["VIP escalation required", "PII masking enabled", "Manual approval gate"]
    },
    {
      id: 3,
      stage: "Model Selection",
      active: true,
      confidence: 92,
      latency: 80,
      impact: "medium",
      dataPoints: ["Selected: gpt-4o-mini", "Reason: Cost-accuracy balance", "Token limit: 4096"]
    },
    {
      id: 4,
      stage: "Execution",
      active: true,
      confidence: 89,
      latency: 520,
      impact: "high",
      dataPoints: ["Routed to Pilot", "SLA: 2.5h", "Success probability: 94%"]
    },
    {
      id: 5,
      stage: "Feedback Loop",
      active: false,
      confidence: 100,
      latency: 60,
      impact: "low",
      dataPoints: ["Result logged", "Training data collected", "Confidence adjusted +2%"]
    }
  ]);

  const [confidenceIndex, setConfidenceIndex] = useState({
    overall: 93,
    dataQuality: 98,
    policyAlignment: 95,
    modelPerformance: 89,
    historicalAccuracy: 91
  });

  // Simulate decision flow
  useEffect(() => {
    const interval = setInterval(() => {
      setDecisionGraph(prev => {
        const activeStage = prev.find(stage => stage.active);
        if (!activeStage || activeStage.id === 5) {
          return prev.map(stage => ({ ...stage, active: stage.id === 1 }));
        }
        
        return prev.map(stage => ({
          ...stage,
          active: stage.id === activeStage.id + 1
        }));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setDrawerOpen(true);
  };

  const activeNode = decisionGraph.find(n => n.active);

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">Mission Brain</h4>
              <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
                Autonomous Decision Engine
              </Badge>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 text-xs animate-pulse">
              {confidenceIndex.overall}% Confidence
            </Badge>
          </div>

          {/* Confidence Index */}
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-900">System Confidence</span>
              <span className="text-lg font-bold text-purple-900">{confidenceIndex.overall}%</span>
            </div>
            <Progress value={confidenceIndex.overall} className="h-2 mb-3" />
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(confidenceIndex).filter(([key]) => key !== 'overall').map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-slate-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-semibold text-slate-900">{value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Graph */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Real-Time Decision Flow
            </div>
            
            {decisionGraph.map((node, idx) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                {/* Connection Line */}
                {idx < decisionGraph.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-slate-200" />
                )}

                <div
                  onClick={() => handleNodeClick(node)}
                  className={cn(
                    "p-3 rounded-lg border-2 cursor-pointer transition-all",
                    node.active 
                      ? "border-purple-500 bg-purple-50 shadow-lg" 
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  )}
                >
                  {node.active && (
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-purple-400 opacity-20"
                      animate={{ opacity: [0.1, 0.3, 0.1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            node.active ? "bg-purple-600" : "bg-slate-300"
                          )}>
                            <span className="text-white font-bold text-sm">{node.id}</span>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold text-slate-900">{node.stage}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={cn(
                                "text-[9px] py-0",
                                node.confidence > 90 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                              )}>
                                {node.confidence}% conf
                              </Badge>
                              <span className="text-[10px] text-slate-600">{node.latency}ms</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Badge className={cn(
                        "text-[9px] py-0",
                        node.impact === "high" ? "bg-red-100 text-red-700" :
                        node.impact === "medium" ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {node.impact} impact
                      </Badge>
                    </div>

                    {node.active && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 pt-2 border-t border-purple-200"
                      >
                        <div className="text-[10px] text-slate-700 space-y-0.5">
                          {node.dataPoints.slice(0, 2).map((point, i) => (
                            <div key={i} className="flex items-start gap-1">
                              <div className="w-1 h-1 rounded-full bg-purple-600 mt-1" />
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live Metrics */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-xs text-slate-600 mb-1">Avg Latency</div>
              <div className="text-sm font-bold text-emerald-700">
                {Math.round(decisionGraph.reduce((sum, n) => sum + n.latency, 0) / decisionGraph.length)}ms
              </div>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-center">
              <div className="text-xs text-slate-600 mb-1">Active Stage</div>
              <div className="text-sm font-bold text-blue-700">
                {activeNode?.id || 1}/5
              </div>
            </div>
            <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-center">
              <div className="text-xs text-slate-600 mb-1">Success Rate</div>
              <div className="text-sm font-bold text-purple-700">94.2%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decision Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Decision Detail: {selectedNode?.stage}
            </SheetTitle>
          </SheetHeader>

          {selectedNode && (
            <div className="mt-6 space-y-4">
              {/* Confidence Breakdown */}
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <h5 className="text-sm font-bold text-purple-900 mb-3">Confidence Breakdown</h5>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-700">Overall</span>
                        <span className="text-xs font-semibold text-slate-900">{selectedNode.confidence}%</span>
                      </div>
                      <Progress value={selectedNode.confidence} className="h-1.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Points */}
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <h5 className="text-sm font-bold text-slate-900 mb-3">Data Points Used</h5>
                  <ul className="space-y-2">
                    {selectedNode.dataPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <h5 className="text-sm font-bold text-slate-900 mb-3">Performance</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="text-xs text-slate-600">Latency</div>
                      <div className="text-sm font-bold text-slate-900">{selectedNode.latency}ms</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="text-xs text-slate-600">Impact</div>
                      <div className="text-sm font-bold text-slate-900 capitalize">{selectedNode.impact}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reasoning Trace */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h5 className="text-sm font-bold text-blue-900 mb-3">AI Reasoning</h5>
                  <div className="space-y-2 text-xs text-slate-700">
                    <p className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">1.</span>
                      <span>Analyzed incoming request data and identified VIP customer flag</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">2.</span>
                      <span>Applied policy checks: PII masking required, manual approval gate triggered</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">3.</span>
                      <span>Selected optimal model based on cost-accuracy trade-off analysis</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={() => {
                  onExplainDecision?.({ stage: selectedNode.stage, confidence: selectedNode.confidence });
                  setDrawerOpen(false);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                Full Decision Analysis
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}