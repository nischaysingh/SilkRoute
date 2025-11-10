import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function CommandCenter({ onExecuteCommand }) {
  const [command, setCommand] = useState("");
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState(null);

  const parseCommand = (cmd) => {
    const lowerCmd = cmd.toLowerCase();
    
    // Parse different command types
    if (lowerCmd.includes("optimize") && lowerCmd.includes("cost")) {
      const costMatch = lowerCmd.match(/\$?(\d+\.?\d*)/);
      const targetCost = costMatch ? parseFloat(costMatch[1]) : 0.02;
      return {
        type: "optimize_cost",
        target: targetCost,
        affectedMissions: ["invoice_chase_v1", "batch_pick_opt_v2"],
        estimatedImpact: {
          costReduction: "-18%",
          latencyIncrease: "+45ms",
          successChange: "-1.2%"
        }
      };
    }
    
    if (lowerCmd.includes("pause") && lowerCmd.includes("latency")) {
      const latencyMatch = lowerCmd.match(/(\d+)\s*s/);
      const threshold = latencyMatch ? parseInt(latencyMatch[1]) * 1000 : 1000;
      return {
        type: "pause_high_latency",
        threshold: threshold,
        affectedMissions: ["batch_pick_opt_v2"],
        estimatedImpact: {
          missionsPaused: 1,
          costSaved: "$0.32/hr",
          risk: "Low"
        }
      };
    }
    
    if (lowerCmd.includes("switch") && lowerCmd.includes("mode")) {
      const missionMatch = lowerCmd.match(/([a-z_]+_v\d+)/);
      const missionName = missionMatch ? missionMatch[1] : "invoice_chase_v1";
      return {
        type: "switch_mode",
        mission: missionName,
        newMode: "high-accuracy",
        affectedMissions: [missionName],
        estimatedImpact: {
          accuracyIncrease: "+2.8%",
          costIncrease: "+$0.012",
          latencyChange: "+180ms"
        }
      };
    }

    return null;
  };

  const handleSubmit = () => {
    if (!command.trim()) return;

    setProcessing(true);

    setTimeout(() => {
      const parsed = parseCommand(command);
      
      if (parsed) {
        setPreview(parsed);
      } else {
        toast.error("Command not recognized", {
          description: "Try: 'Optimize all missions for cost < $0.02'"
        });
      }
      
      setProcessing(false);
    }, 800);
  };

  const handleApprove = () => {
    onExecuteCommand?.(preview);
    toast.success("Command executed", {
      description: `${preview.affectedMissions.length} mission(s) affected`
    });
    setPreview(null);
    setCommand("");
  };

  const handleReject = () => {
    setPreview(null);
    toast.info("Command cancelled");
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h4 className="text-sm font-bold text-slate-900">Command Center</h4>
          <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
            Natural Language
          </Badge>
        </div>

        {/* Command Input */}
        <div className="flex gap-2 mb-3">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="e.g., Optimize all missions for cost < $0.02"
            className="flex-1 h-9 text-xs"
            disabled={processing || preview}
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!command.trim() || processing || preview}
            className="h-9 px-3 bg-purple-600 hover:bg-purple-700"
          >
            {processing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
          </Button>
        </div>

        {/* Processing Indicator */}
        <AnimatePresence>
          {processing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-xs text-slate-600 mb-3"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Pilot AI analyzing command...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Command Preview */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span className="text-xs font-semibold text-purple-900">
                  Action Preview
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="text-xs text-slate-700">
                  <span className="font-semibold">Command: </span>
                  {preview.type === "optimize_cost" && `Optimize for cost < $${preview.target}`}
                  {preview.type === "pause_high_latency" && `Pause missions with latency > ${preview.threshold}ms`}
                  {preview.type === "switch_mode" && `Switch ${preview.mission} to ${preview.newMode} mode`}
                </div>
                
                <div className="text-xs text-slate-700">
                  <span className="font-semibold">Affected: </span>
                  {preview.affectedMissions.join(", ")}
                </div>

                <div className="mt-2 p-2 rounded bg-white border border-purple-200">
                  <div className="text-xs font-semibold text-slate-900 mb-1">Estimated Impact:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(preview.estimatedImpact).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-[10px] text-slate-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className={cn(
                          "text-xs font-bold",
                          value.toString().startsWith('-') ? "text-emerald-700" :
                          value.toString().startsWith('+') ? "text-amber-700" :
                          "text-slate-900"
                        )}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleApprove}
                  className="flex-1 h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approve & Apply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  className="flex-1 h-7 text-xs"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example Commands */}
        {!preview && !processing && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="text-xs text-slate-600 mb-2">Examples:</div>
            <div className="space-y-1">
              {[
                "Optimize all missions for cost < $0.02",
                "Pause missions with latency > 1s",
                "Switch invoice_chase_v1 to high-accuracy mode"
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setCommand(example)}
                  className="w-full text-left text-xs text-slate-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded transition-all"
                >
                  • {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}