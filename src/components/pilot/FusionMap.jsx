import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { GitBranch, Brain, Sparkles, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function FusionMap({ decisions }) {
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [resolveDrawerOpen, setResolveDrawerOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolution, setResolution] = useState(null);

  // Mock fusion decisions with conflicts
  const fusionDecisions = [
    {
      id: 1,
      type: "agreement",
      pilotReasoning: ["High-risk customer", "PII detected", "Route to manual"],
      copilotReasoning: ["VIP status", "Compliance priority", "Manual approval recommended"],
      mergeDecision: "Route to Pilot for manual review",
      confidence: 96
    },
    {
      id: 2,
      type: "conflict",
      pilotReasoning: ["Budget constraint", "Use cost-save profile", "Accept 2% accuracy loss"],
      copilotReasoning: ["Success rate priority", "Use balanced profile", "Minimal accuracy impact"],
      pilotConfidence: 78,
      copilotConfidence: 92,
      pilotProposal: "Cost-Save Profile",
      copilotProposal: "Balanced Profile"
    },
    {
      id: 3,
      type: "agreement",
      pilotReasoning: ["Queue depth normal", "No optimization needed", "Continue current routing"],
      copilotReasoning: ["Load balanced", "Performance stable", "Maintain status"],
      mergeDecision: "No changes required",
      confidence: 88
    }
  ];

  const handleResolveConflict = (decision) => {
    setSelectedConflict(decision);
    setResolveDrawerOpen(true);
    setResolving(true);

    // Simulate AI resolution
    setTimeout(() => {
      setResolution({
        fusionDecision: "Hybrid Approach: Balanced Profile with Cost Monitoring",
        reasoning: [
          "Co-Pilot's higher confidence (92%) suggests balanced profile is safer",
          "Pilot's cost concern is valid - enable real-time cost monitoring",
          "If cost exceeds threshold, auto-switch to cost-save",
          "Best of both: quality + cost awareness"
        ],
        confidence: 94,
        impact: {
          cost: "+$0.003/run (acceptable)",
          success: "+2.5% vs cost-save",
          monitoring: "Real-time cost alerts enabled"
        }
      });
      setResolving(false);
    }, 2500);
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">Fusion Map</h4>
              <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
                Dual Reasoning
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>{fusionDecisions.filter(d => d.type === "agreement").length} agreements</span>
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>{fusionDecisions.filter(d => d.type === "conflict").length} conflicts</span>
            </div>
          </div>

          {/* Fusion Decisions */}
          <div className="space-y-4">
            {fusionDecisions.map((decision, idx) => (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "relative p-4 rounded-lg border-2",
                  decision.type === "agreement" 
                    ? "bg-emerald-50 border-emerald-300" 
                    : "bg-amber-50 border-amber-300"
                )}
              >
                {/* Glow effect for conflicts */}
                {decision.type === "conflict" && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-amber-400 opacity-10"
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <div className="relative z-10">
                  <div className="flex items-start gap-4">
                    {/* Left: Pilot Branch */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <h5 className="text-xs font-bold text-blue-900">Pilot</h5>
                        {decision.type === "conflict" && (
                          <Badge className="bg-blue-100 text-blue-700 text-[9px] py-0">
                            {decision.pilotConfidence}%
                          </Badge>
                        )}
                      </div>
                      <ul className="space-y-1">
                        {decision.pilotReasoning.map((step, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                      {decision.type === "conflict" && (
                        <div className="mt-2 p-2 bg-blue-100 rounded text-xs font-semibold text-blue-900">
                          → {decision.pilotProposal}
                        </div>
                      )}
                    </div>

                    {/* Center: Merge Node */}
                    <div className="flex flex-col items-center px-4">
                      {decision.type === "agreement" ? (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="p-2 rounded-full bg-emerald-500"
                        >
                          <CheckCircle className="w-5 h-5 text-white" />
                        </motion.div>
                      ) : (
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="p-2 rounded-full bg-amber-500"
                        >
                          <AlertCircle className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                      <div className="mt-2 text-[9px] font-semibold text-slate-600 uppercase">
                        {decision.type}
                      </div>
                    </div>

                    {/* Right: Co-Pilot Branch */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <h5 className="text-xs font-bold text-purple-900">Co-Pilot</h5>
                        {decision.type === "conflict" && (
                          <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
                            {decision.copilotConfidence}%
                          </Badge>
                        )}
                      </div>
                      <ul className="space-y-1">
                        {decision.copilotReasoning.map((step, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                      {decision.type === "conflict" && (
                        <div className="mt-2 p-2 bg-purple-100 rounded text-xs font-semibold text-purple-900">
                          → {decision.copilotProposal}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Merge Decision or Resolve Button */}
                  {decision.type === "agreement" ? (
                    <div className="mt-3 pt-3 border-t border-emerald-200">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-900">
                          Fusion Decision: {decision.mergeDecision}
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-700 text-[9px] py-0 ml-auto">
                          {decision.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <Button
                        size="sm"
                        onClick={() => handleResolveConflict(decision)}
                        className="w-full h-7 text-xs bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Resolve Conflict
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conflict Resolution Drawer */}
      <Sheet open={resolveDrawerOpen} onOpenChange={setResolveDrawerOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              Conflict Resolution
            </SheetTitle>
          </SheetHeader>

          {selectedConflict && (
            <div className="mt-6 space-y-4">
              {/* Conflict Summary */}
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-amber-900 mb-2">Conflicting Proposals</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700">Pilot:</span>
                      <span className="text-xs font-semibold text-blue-900">
                        {selectedConflict.pilotProposal}
                      </span>
                      <Badge className="bg-blue-100 text-blue-700 text-[9px] py-0">
                        {selectedConflict.pilotConfidence}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700">Co-Pilot:</span>
                      <span className="text-xs font-semibold text-purple-900">
                        {selectedConflict.copilotProposal}
                      </span>
                      <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
                        {selectedConflict.copilotConfidence}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Resolution */}
              {resolving ? (
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center"
                    >
                      <Brain className="w-6 h-6 text-purple-600" />
                    </motion.div>
                    <p className="text-xs text-slate-700">Generating fusion decision...</p>
                  </CardContent>
                </Card>
              ) : resolution ? (
                <>
                  <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-purple-600" />
                        <h4 className="text-sm font-bold text-purple-900">Fusion Decision</h4>
                        <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0 ml-auto">
                          {resolution.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 mb-3">
                        {resolution.fusionDecision}
                      </p>
                      <ul className="space-y-1">
                        {resolution.reasoning.map((step, idx) => (
                          <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-bold text-emerald-900 mb-2">Impact Analysis</h4>
                      <div className="space-y-1 text-xs">
                        {Object.entries(resolution.impact).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-slate-700 capitalize">{key}:</span>
                            <span className="font-semibold text-slate-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={() => {
                      setResolveDrawerOpen(false);
                      setResolution(null);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Apply Fusion Decision
                  </Button>
                </>
              ) : null}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}