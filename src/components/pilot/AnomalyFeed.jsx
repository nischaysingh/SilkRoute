import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Search, Zap, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AnomalyFeed({ anomalies, onInvestigate, onAutoMitigate, onIgnore }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high": return "red";
      case "medium": return "amber";
      case "low": return "blue";
      default: return "slate";
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Anomaly Feed
          </h4>
          <Badge className="bg-amber-100 text-amber-700 text-[9px] py-0">
            {anomalies.length} Active
          </Badge>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {anomalies.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-600">All systems nominal</p>
              </motion.div>
            ) : (
              anomalies.map((anomaly, idx) => {
                const severityColor = getSeverityColor(anomaly.severity);
                
                return (
                  <motion.div
                    key={anomaly.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "p-3 rounded-lg border-l-4 relative overflow-hidden",
                      severityColor === "red" && "border-l-red-500 bg-red-50",
                      severityColor === "amber" && "border-l-amber-500 bg-amber-50",
                      severityColor === "blue" && "border-l-blue-500 bg-blue-50"
                    )}
                  >
                    {/* Pulsing glow for high severity */}
                    {anomaly.severity === "high" && (
                      <motion.div
                        className="absolute inset-0 bg-red-400 opacity-10"
                        animate={{ opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="text-xs font-bold text-slate-900">{anomaly.title}</h5>
                            <Badge className={cn(
                              "text-[9px] py-0 capitalize",
                              severityColor === "red" && "bg-red-100 text-red-700",
                              severityColor === "amber" && "bg-amber-100 text-amber-700",
                              severityColor === "blue" && "bg-blue-100 text-blue-700"
                            )}>
                              {anomaly.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-700 leading-tight mb-2">
                            {anomaly.description}
                          </p>
                          <div className="text-[10px] text-slate-600">
                            Detected: {anomaly.detectedAt}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onInvestigate?.(anomaly)}
                          className="h-6 text-[10px] flex-1 border-slate-300 hover:bg-slate-100"
                        >
                          <Search className="w-2.5 h-2.5 mr-1" />
                          Investigate
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onAutoMitigate?.(anomaly)}
                          className={cn(
                            "h-6 text-[10px] flex-1",
                            severityColor === "red" && "bg-red-600 hover:bg-red-700",
                            severityColor === "amber" && "bg-amber-600 hover:bg-amber-700",
                            severityColor === "blue" && "bg-blue-600 hover:bg-blue-700"
                          )}
                        >
                          <Zap className="w-2.5 h-2.5 mr-1" />
                          Auto-Mitigate
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onIgnore?.(anomaly)}
                          className="h-6 w-6 p-0 hover:bg-slate-200"
                        >
                          <XCircle className="w-3 h-3 text-slate-600" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}