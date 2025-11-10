import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Brain, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function FusionPathDrawer({ open, onOpenChange, missions }) {
  const handoffMissions = missions.filter(m => m.route === "copilot" && m.state === "running");
  const autoPilotLearning = missions.filter(m => m.route === "autopilot");

  const syncStatus = {
    pilotCopilot: 95,
    copilotAutopilot: 88,
    overall: 92
  };

  const crossAgentStats = {
    autopilotTrained: 3,
    copilotRulesApplied: 2,
    errorReduction: 6,
    policyOptimizations: 4
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-slate-200 w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Fusion Path
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Sync Status */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-4">
              <h5 className="text-sm font-bold text-purple-900 mb-3">Cross-Agent Sync Status</h5>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-slate-700">Pilot ↔ Co-Pilot</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{syncStatus.pilotCopilot}%</span>
                  </div>
                  <Progress value={syncStatus.pilotCopilot} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Brain className="w-3 h-3 text-purple-600" />
                      <span className="text-xs text-slate-700">Co-Pilot ↔ Autopilot</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{syncStatus.copilotAutopilot}%</span>
                  </div>
                  <Progress value={syncStatus.copilotAutopilot} className="h-2" />
                </div>

                <div className="pt-2 border-t border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-900">Overall Harmony</span>
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                      {syncStatus.overall}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Handoff Missions */}
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <h5 className="text-sm font-bold text-slate-900 mb-3">Missions Handed to Co-Pilot</h5>
              
              {handoffMissions.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-4">
                  No active handoffs
                </p>
              ) : (
                <div className="space-y-2">
                  {handoffMissions.map((mission, idx) => (
                    <motion.div
                      key={mission.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-2 rounded-lg bg-purple-50 border border-purple-200"
                    >
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-slate-900">{mission.name}</div>
                        <div className="text-xs text-slate-600">Optimizing latency</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <Brain className="w-3 h-3 text-purple-600" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Autopilot Learning */}
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <h5 className="text-sm font-bold text-slate-900 mb-3">Autopilot Learning</h5>
              
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-emerald-900">Training Status</span>
                    <Badge className="bg-emerald-600 text-white text-[9px]">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-700 mb-2">
                    Learning from {crossAgentStats.autopilotTrained} successful Pilot runs
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span className="text-slate-700">Pattern recognition</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span className="text-slate-700">Policy learning</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-50 rounded text-center">
                    <div className="text-lg font-bold text-slate-900">{crossAgentStats.copilotRulesApplied}</div>
                    <div className="text-[10px] text-slate-600">Rules Applied</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded text-center">
                    <div className="text-lg font-bold text-emerald-700">-{crossAgentStats.errorReduction}%</div>
                    <div className="text-[10px] text-slate-600">Error Reduction</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <h5 className="text-sm font-bold text-blue-900">Cross-Agent Impact</h5>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Autopilot trained on {crossAgentStats.autopilotTrained} successful Pilot runs. 
                Co-Pilot applied {crossAgentStats.copilotRulesApplied} policy rules, reducing errors by {crossAgentStats.errorReduction}%. 
                Overall {crossAgentStats.policyOptimizations} policy optimizations active.
              </p>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}