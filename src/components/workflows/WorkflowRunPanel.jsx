import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { executeWorkflow } from "@/functions/executeWorkflow";
import { toast } from "sonner";
import { Play, Clock, CheckCircle, XCircle, Loader2, ChevronDown, ChevronRight, Zap } from "lucide-react";
import { format } from "date-fns";

const statusColor = {
  running: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  succeeded: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  partial: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

function ExecutionRow({ execution }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        <Badge className={statusColor[execution.status] || "bg-gray-500/20 text-gray-400"}>
          {execution.status}
        </Badge>
        <span className="text-sm text-white flex-1">{execution.workflow_name}</span>
        <span className="text-xs text-gray-500">
          {execution.duration_ms ? `${(execution.duration_ms / 1000).toFixed(1)}s` : "—"}
        </span>
        <span className="text-xs text-gray-500">
          {execution.start_time ? format(new Date(execution.start_time), "MMM d, HH:mm") : "—"}
        </span>
      </button>
      {expanded && execution.step_performance?.length > 0 && (
        <div className="border-t border-white/10 p-3 space-y-2 bg-black/20">
          {execution.step_performance.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {step.status === "succeeded" ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              )}
              <span className="text-white font-medium">{step.step_name}</span>
              <Badge className="text-[10px] bg-white/5 text-gray-400 border-white/10">{step.step_type}</Badge>
              <span className="text-gray-500 ml-auto">{step.duration_ms}ms</span>
              {step.error && <span className="text-red-400 truncate max-w-[200px]">{step.error}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorkflowRunPanel({ open, onClose, workflow }) {
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const { data: executions = [], refetch } = useQuery({
    queryKey: ["workflow-executions", workflow?.id],
    queryFn: () => base44.entities.WorkflowExecution.filter({ workflow_id: workflow?.id }, "-start_time", 20),
    enabled: !!workflow?.id && open,
  });

  const handleRun = async () => {
    if (workflow.status !== "active") {
      toast.error("Activate the workflow before running it.");
      return;
    }
    setRunning(true);
    setLastResult(null);
    try {
      const res = await executeWorkflow({ workflow_id: workflow.id });
      setLastResult(res.data);
      toast.success(`Workflow finished: ${res.data.status}`);
      refetch();
    } catch (err) {
      toast.error("Execution failed: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  if (!workflow) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            {workflow.name}
          </DialogTitle>
        </DialogHeader>

        {/* Run button */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <div className="text-sm font-semibold text-white">Run Workflow</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {workflow.status === "active"
                ? `${workflow.steps?.length || 0} steps · triggered manually`
                : "Workflow must be active to run"}
            </div>
          </div>
          <Button
            onClick={handleRun}
            disabled={running || workflow.status !== "active"}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
          >
            {running ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running...</>
            ) : (
              <><Play className="w-4 h-4 mr-2" />Run Now</>
            )}
          </Button>
        </div>

        {/* Last result */}
        {lastResult && (
          <div className={`p-4 rounded-xl border ${lastResult.status === "succeeded" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
            <div className="flex items-center gap-2 mb-2">
              {lastResult.status === "succeeded" ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
              <span className="text-sm font-semibold text-white">
                {lastResult.status === "succeeded" ? "Execution Successful" : "Execution Failed"}
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                {lastResult.steps_succeeded}/{lastResult.steps_executed} steps passed · {(lastResult.duration_ms / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
        )}

        {/* Execution history */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-white">Execution History</span>
            <Badge className="bg-white/5 text-gray-400 border-white/10 text-xs">{executions.length}</Badge>
          </div>
          {executions.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-white/10 rounded-lg">
              No executions yet. Run the workflow to see history.
            </div>
          ) : (
            <div className="space-y-2">
              {executions.map((ex) => (
                <ExecutionRow key={ex.id} execution={ex} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}