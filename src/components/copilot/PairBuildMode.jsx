import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Users, Sparkles, Eye, MessageCircle, Loader2, 
  CheckCircle, AlertCircle, Lightbulb 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PairBuildMode({ enabled, onToggle, currentComponent }) {
  const [aiAnnotations, setAiAnnotations] = useState([]);
  const [aiActivity, setAiActivity] = useState(null);
  const [autoMode, setAutoMode] = useState(false);
  const [narrationLog, setNarrationLog] = useState([]);

  useEffect(() => {
    if (enabled) {
      // Simulate AI annotations appearing
      const annotations = [
        {
          id: 1,
          type: "dependency",
          target: "node_3",
          message: "This node depends on API latency",
          severity: "info",
          icon: AlertCircle,
          color: "blue"
        },
        {
          id: 2,
          type: "optimization",
          target: "query_1",
          message: "You can compress this query by 40%",
          severity: "suggestion",
          icon: Lightbulb,
          color: "amber"
        },
        {
          id: 3,
          type: "validation",
          target: "output_step",
          message: "Add error handling for null responses",
          severity: "warning",
          icon: AlertCircle,
          color: "red"
        }
      ];

      setTimeout(() => setAiAnnotations(annotations), 500);
    } else {
      setAiAnnotations([]);
      setAutoMode(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (autoMode && enabled) {
      // Simulate AI taking over
      const steps = [
        "Analyzing current structure...",
        "Connecting integration nodes...",
        "Adding filter logic...",
        "Optimizing data flow...",
        "Testing query parameters...",
        "Finalizing configuration..."
      ];

      steps.forEach((step, idx) => {
        setTimeout(() => {
          setAiActivity(step);
          setNarrationLog(prev => [...prev, {
            id: Date.now() + idx,
            step,
            timestamp: new Date().toISOString()
          }]);

          if (idx === steps.length - 1) {
            setTimeout(() => {
              setAiActivity(null);
              setAutoMode(false);
              toast.success("Co-Pilot finished building!");
            }, 1000);
          }
        }, idx * 1500);
      });
    }
  }, [autoMode, enabled]);

  const handleTakeOver = () => {
    if (!enabled) {
      toast.error("Enable Pair-Build Mode first");
      return;
    }
    setAutoMode(true);
    toast.success("Co-Pilot is taking over...");
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "warning": return "border-red-300 bg-red-50";
      case "suggestion": return "border-amber-300 bg-amber-50";
      case "info": return "border-blue-300 bg-blue-50";
      default: return "border-slate-300 bg-slate-50";
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pair-Build Mode</h3>
                <p className="text-xs text-slate-600">Co-Pilot joins you in real-time editing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="pair-build" className="text-xs font-semibold">
                {enabled ? "Active" : "Inactive"}
              </Label>
              <Switch
                id="pair-build"
                checked={enabled}
                onCheckedChange={onToggle}
              />
            </div>
          </div>

          {enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-purple-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    Watching your edits
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700 text-xs">
                    {aiAnnotations.length} annotations
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={handleTakeOver}
                  disabled={autoMode}
                  className="h-7 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {autoMode ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Building...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 mr-1" />
                      You Take Over
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* AI Activity Narration */}
      <AnimatePresence>
        {autoMode && aiActivity && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <div>
                    <h4 className="text-sm font-bold mb-1">Co-Pilot is working...</h4>
                    <p className="text-sm opacity-90">{aiActivity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Annotations */}
      <AnimatePresence>
        {enabled && aiAnnotations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  AI Annotations & Insights
                </h4>
                <div className="space-y-2">
                  {aiAnnotations.map((annotation, idx) => (
                    <motion.div
                      key={annotation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn(
                        "p-3 rounded-lg border-2 relative overflow-hidden",
                        getSeverityColor(annotation.severity)
                      )}
                    >
                      {/* Pulse effect for active annotations */}
                      <motion.div
                        className={cn(
                          "absolute inset-0 opacity-20",
                          annotation.color === "blue" && "bg-blue-400",
                          annotation.color === "amber" && "bg-amber-400",
                          annotation.color === "red" && "bg-red-400"
                        )}
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />

                      <div className="flex items-start gap-3 relative z-10">
                        <annotation.icon className={cn(
                          "w-5 h-5 flex-shrink-0",
                          annotation.color === "blue" && "text-blue-600",
                          annotation.color === "amber" && "text-amber-600",
                          annotation.color === "red" && "text-red-600"
                        )} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="text-xs capitalize bg-white/50">
                              {annotation.type}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              → {annotation.target}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-900">
                            {annotation.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Narration Log */}
      {narrationLog.length > 0 && (
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Build Narration Log</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {narrationLog.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-xs"
                >
                  <CheckCircle className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-700">{entry.step}</span>
                  <span className="text-slate-400 ml-auto">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      {!enabled && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-700">
              💡 <strong>Enable Pair-Build Mode</strong> to have Co-Pilot actively collaborate with you:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-600 ml-6 list-disc">
              <li>See real-time AI annotations on your work</li>
              <li>Get instant optimization suggestions</li>
              <li>Let Co-Pilot take over and finish tasks for you</li>
              <li>Watch AI narrate each step as it builds</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}