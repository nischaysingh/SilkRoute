import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { executeAIMission } from "@/functions/executeAIMission";
import { toast } from "sonner";
import { Play, Loader2, CheckCircle, XCircle, Bot, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";

const riskColor = (score) => {
  if (score < 0.3) return "text-emerald-400";
  if (score < 0.6) return "text-amber-400";
  return "text-red-400";
};

function StepResult({ step }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-2 p-2.5 hover:bg-white/5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        {step.status === "succeeded" ? (
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
        )}
        <span className="text-sm text-white font-medium flex-1">Step {step.step}</span>
        <span className="text-xs text-gray-400 max-w-[200px] truncate">{step.reasoning}</span>
        {(expanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />)}
      </button>
      {expanded && (
        <div className="border-t border-white/10 p-3 bg-black/20 text-xs space-y-1">
          <p className="text-gray-300">{step.reasoning}</p>
          {step.error && <p className="text-red-400">Error: {step.error}</p>}
          {step.fallback && <p className="text-amber-400">Fallback: {step.fallback}</p>}
        </div>
      )}
    </div>
  );
}

export default function AgentRunPanel({ open, onClose, agent }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    if (!["armed", "draft", "testing"].includes(agent.status)) {
      toast.error("Agent must be in 'armed', 'draft', or 'testing' status to run.");
      return;
    }
    setRunning(true);
    setResult(null);
    try {
      const res = await executeAIMission({ mission_id: agent.id });
      setResult(res.data);
      toast.success(`Agent finished: ${res.data.status}`);
    } catch (err) {
      toast.error("Execution failed: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  if (!agent) return null;

  const canRun = ["armed", "draft", "testing"].includes(agent.status);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            {agent.name}
          </DialogTitle>
        </DialogHeader>

        {/* Agent summary */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm space-y-1">
          <p className="text-gray-300">{agent.intent}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-500">Priority: <span className="text-white font-semibold">{agent.priority}</span></span>
            <span className="text-xs text-gray-500">Risk: <span className={`font-semibold ${riskColor(agent.risk_score || 0)}`}>{agent.risk_score || 0}</span></span>
            <span className="text-xs text-gray-500">v{agent.version}</span>
          </div>
        </div>

        {/* Run button */}
        <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <div>
            <div className="text-sm font-semibold text-white">Execute Agent</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {canRun ? "AI will plan and execute the mission intent" : `Status must be 'armed' or 'draft' to run (currently: ${agent.status})`}
            </div>
          </div>
          <Button
            onClick={handleRun}
            disabled={running || !canRun}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
          >
            {running ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running AI...</>
            ) : (
              <><Play className="w-4 h-4 mr-2" />Run Agent</>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Overall result */}
            <div className={`p-4 rounded-xl border ${result.success ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.success ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                <span className="text-sm font-semibold text-white">
                  {result.success ? "Mission Succeeded" : "Mission Failed"}
                </span>
                {result.confidence && (
                  <span className="text-xs text-gray-400 ml-auto">
                    {Math.round(result.confidence * 100)}% confidence
                  </span>
                )}
              </div>
              {result.expected_outcome && (
                <p className="text-xs text-gray-300">{result.expected_outcome}</p>
              )}
            </div>

            {/* Risk */}
            {result.risk_assessment && (
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-300">{result.risk_assessment}</p>
              </div>
            )}

            {/* Step results */}
            {result.results?.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-white">Execution Steps ({result.results.length})</div>
                {result.results.map((step, i) => (
                  <StepResult key={i} step={step} />
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}