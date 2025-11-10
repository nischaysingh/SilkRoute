import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, GitBranch, Sparkles, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function ImpactFeed({ impacts }) {
  const defaultImpacts = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 120000).toISOString(),
      message: "Autopilot optimized price_rebalance",
      improvement: "+4% accuracy",
      actor: "autopilot",
      type: "optimization"
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      message: "Invoice_chase rerouted to Copilot",
      improvement: "Reduced latency",
      actor: "copilot",
      type: "reroute"
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      message: "Batch processing enabled for support_triage",
      improvement: "+60% throughput",
      actor: "pilot",
      type: "enhancement"
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 900000).toISOString(),
      message: "Cost optimization applied to ar_collection",
      improvement: "-$0.018/run",
      actor: "autopilot",
      type: "optimization"
    }
  ];

  const displayImpacts = impacts || defaultImpacts;

  const getIcon = (type) => {
    switch (type) {
      case "optimization": return Sparkles;
      case "reroute": return GitBranch;
      case "enhancement": return TrendingUp;
      default: return Activity;
    }
  };

  const getColor = (actor) => {
    switch (actor) {
      case "pilot": return "blue";
      case "copilot": return "purple";
      case "autopilot": return "emerald";
      default: return "slate";
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardHeader className="border-b border-slate-200 pb-3">
        <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          Recent Impact Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-2">
          <AnimatePresence>
            {displayImpacts.map((impact, idx) => {
              const Icon = getIcon(impact.type);
              const color = getColor(impact.actor);
              
              return (
                <motion.div
                  key={impact.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "p-3 rounded-lg border-l-4 transition-all hover:shadow-md cursor-pointer",
                    color === "blue" && "bg-blue-50 border-blue-500",
                    color === "purple" && "bg-purple-50 border-purple-500",
                    color === "emerald" && "bg-emerald-50 border-emerald-500"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-full flex-shrink-0",
                      color === "blue" && "bg-blue-100",
                      color === "purple" && "bg-purple-100",
                      color === "emerald" && "bg-emerald-100"
                    )}>
                      <Icon className={cn(
                        "w-3 h-3",
                        color === "blue" && "text-blue-600",
                        color === "purple" && "text-purple-600",
                        color === "emerald" && "text-emerald-600"
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-900 font-medium leading-tight mb-1">
                        {impact.message}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className={cn(
                          "text-[9px] py-0 capitalize",
                          color === "blue" && "bg-blue-100 text-blue-700",
                          color === "purple" && "bg-purple-100 text-purple-700",
                          color === "emerald" && "bg-emerald-100 text-emerald-700"
                        )}>
                          {impact.actor}
                        </Badge>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(impact.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className={cn(
                      "px-2 py-1 rounded text-[10px] font-semibold flex-shrink-0",
                      impact.improvement.startsWith('+') 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-amber-100 text-amber-700"
                    )}>
                      {impact.improvement}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}