import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Database, GitBranch, Zap, Mail, Settings, Clock,
  DollarSign, Shield, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const getStepIcon = (action) => {
  switch (action.toLowerCase()) {
    case "api call": return Database;
    case "transform": return Settings;
    case "llm inference": return Zap;
    case "tool call": return GitBranch;
    case "email": return Mail;
    default: return Activity;
  }
};

const FlowNode = ({ step, isActive, onClick }) => {
  const Icon = getStepIcon(step.action);
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "relative cursor-pointer",
        isActive && "z-10"
      )}
      onClick={() => onClick(step)}
    >
      <div className={cn(
        "w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all",
        isActive 
          ? "bg-gradient-to-br from-blue-500 to-purple-500 border-blue-400 shadow-lg"
          : "bg-white border-slate-300 hover:border-blue-400 hover:shadow-md"
      )}>
        <Icon className={cn("w-6 h-6 mb-1", isActive ? "text-white" : "text-slate-600")} />
        <span className={cn("text-[9px] text-center leading-tight", isActive ? "text-white font-semibold" : "text-slate-600")}>
          {step.name}
        </span>
      </div>
      {step.tokens > 0 && (
        <div className="absolute -top-1 -right-1">
          <Badge className="bg-purple-600 text-white text-[8px] py-0 px-1">
            {step.tokens}t
          </Badge>
        </div>
      )}
    </motion.div>
  );
};

const FlowEdge = ({ active }) => {
  return (
    <div className="flex items-center justify-center px-2">
      <motion.div
        className={cn(
          "w-12 h-0.5",
          active ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-slate-300"
        )}
        initial={{ width: 0 }}
        animate={{ width: 48 }}
      >
        {active && (
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ x: -10, width: 10 }}
            animate={{ x: 48 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default function FlightPlanVisualizer({ mission }) {
  const [viewMode, setViewMode] = useState("design"); // design or live
  const [selectedStep, setSelectedStep] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  const steps = [
    { id: 1, name: "Fetch Data", action: "API Call", model: "N/A", tokens: 0, cost: 0, latency: 120, guardrails: ["Rate limit", "Timeout 5s"] },
    { id: 2, name: "Parse Input", action: "Transform", model: "gpt-4o-mini", tokens: 150, cost: 0.002, latency: 85, guardrails: ["Schema validate"] },
    { id: 3, name: "Decide Action", action: "LLM Inference", model: "gpt-4o", tokens: 800, cost: 0.024, latency: 640, guardrails: ["PII mask", "Cost cap"] },
    { id: 4, name: "Execute Action", action: "Tool Call", model: "N/A", tokens: 0, cost: 0, latency: 95, guardrails: ["Approval required"] },
    { id: 5, name: "Notify", action: "Email", model: "N/A", tokens: 0, cost: 0, latency: 50, guardrails: ["Throttle 10/min"] }
  ];

  const isRunning = mission?.state === "running";

  const handleNodeClick = (step) => {
    setSelectedStep(step);
    setDetailDrawerOpen(true);
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardHeader className="border-b border-slate-200 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-600" />
              Flight Plan Visualizer
            </CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={viewMode === "design" ? "default" : "outline"}
                onClick={() => setViewMode("design")}
                className="h-6 text-xs"
              >
                Design
              </Button>
              <Button
                size="sm"
                variant={viewMode === "live" ? "default" : "outline"}
                onClick={() => setViewMode("live")}
                className="h-6 text-xs"
              >
                Live Flow
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <FlowNode 
                  step={step} 
                  isActive={viewMode === "live" && isRunning && idx <= 2}
                  onClick={handleNodeClick}
                />
                {idx < steps.length - 1 && (
                  <FlowEdge active={viewMode === "live" && isRunning} />
                )}
              </React.Fragment>
            ))}
          </div>

          {viewMode === "live" && (
            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="text-xs font-semibold text-blue-900">
                  {isRunning ? "Mission Active — Real-time Flow" : "Mission Idle"}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {isRunning 
                  ? "Click any node to view live logs and metrics"
                  : "Launch mission to see live execution flow"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step Detail Drawer */}
      <Sheet open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-slate-900">{selectedStep?.name}</SheetTitle>
          </SheetHeader>

          {selectedStep && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-xs font-semibold text-slate-900 mb-3">Step Details</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Action:</span>
                    <span className="font-medium text-slate-900">{selectedStep.action}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Model:</span>
                    <span className="font-medium text-slate-900">{selectedStep.model}</span>
                  </div>
                  {selectedStep.tokens > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tokens:</span>
                        <span className="font-medium text-slate-900">{selectedStep.tokens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Cost:</span>
                        <span className="font-medium text-slate-900">${selectedStep.cost}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Latency:</span>
                    <span className="font-medium text-slate-900">{selectedStep.latency}ms</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="text-xs font-semibold text-purple-900 mb-2">Guardrails</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedStep.guardrails.map((guard, i) => (
                    <Badge key={i} className="bg-purple-100 text-purple-700 text-[10px]">
                      <Shield className="w-2 h-2 mr-0.5" />
                      {guard}
                    </Badge>
                  ))}
                </div>
              </div>

              {viewMode === "live" && isRunning && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-xs font-semibold text-blue-900 mb-2">Live Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-slate-700">Current latency: {selectedStep.latency + Math.floor(Math.random() * 50)}ms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-slate-700">Executions: {Math.floor(Math.random() * 20) + 10}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-slate-700">Total cost: ${(selectedStep.cost * 15).toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-xs font-semibold text-slate-900 mb-2">Recent Logs</h4>
                <div className="space-y-1 font-mono text-[10px] text-slate-700">
                  <div>[15:45:20] Step executed successfully</div>
                  <div>[15:45:18] Guardrails passed</div>
                  <div>[15:45:15] Input validated</div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}