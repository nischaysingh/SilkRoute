import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Lightbulb, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function InsightTimeline() {
  const [expanded, setExpanded] = useState(false);
  const [insights] = useState([
    {
      id: 1,
      timestamp: "2 hours ago",
      type: "suggestion",
      icon: Lightbulb,
      title: "Cost optimization opportunity detected",
      description: "Switching to cost-save profile could reduce spend by 15%",
      applied: false
    },
    {
      id: 2,
      timestamp: "5 hours ago",
      type: "success",
      icon: CheckCircle,
      title: "Agent 'Invoice Reconciler' deployed successfully",
      description: "Now running in Pilot with 94% success rate",
      applied: true
    },
    {
      id: 3,
      timestamp: "1 day ago",
      type: "learning",
      icon: TrendingUp,
      title: "Co-Pilot learned from your feedback",
      description: "Future suggestions will prioritize cost over latency",
      applied: true
    },
    {
      id: 4,
      timestamp: "2 days ago",
      type: "warning",
      icon: AlertTriangle,
      title: "Anomaly detected in batch_pick_opt_v2",
      description: "External API timeout causing 3x retries",
      applied: false
    },
    {
      id: 5,
      timestamp: "3 days ago",
      type: "suggestion",
      icon: Lightbulb,
      title: "Pipeline optimization suggested",
      description: "Use cached results for 65% faster load time",
      applied: true
    }
  ]);

  const getTypeColor = (type) => {
    switch (type) {
      case "suggestion": return "bg-purple-100 text-purple-700 border-purple-300";
      case "success": return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "learning": return "bg-blue-100 text-blue-700 border-blue-300";
      case "warning": return "bg-amber-100 text-amber-700 border-amber-300";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const visibleInsights = expanded ? insights : insights.slice(0, 3);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm mt-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Insight Timeline</h3>
            <Badge className="bg-purple-100 text-purple-700 text-xs">Last 7 days</Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show More
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {visibleInsights.map((insight, idx) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "p-3 rounded-lg border-2",
                  getTypeColor(insight.type)
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    insight.type === "suggestion" && "bg-purple-200",
                    insight.type === "success" && "bg-emerald-200",
                    insight.type === "learning" && "bg-blue-200",
                    insight.type === "warning" && "bg-amber-200"
                  )}>
                    <insight.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-slate-900">{insight.title}</h4>
                      <span className="text-xs text-slate-500">{insight.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700">{insight.description}</p>
                    {insight.applied && (
                      <Badge className="mt-2 bg-emerald-100 text-emerald-700 text-[10px]">
                        <CheckCircle className="w-2 h-2 mr-1" />
                        Applied
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}