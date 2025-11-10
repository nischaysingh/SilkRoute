import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, User, CheckCircle, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function FusionFlightLog({ activities }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-3 h-3 text-purple-600" />
          <h4 className="text-xs font-bold text-slate-900">Fusion Flight Log</h4>
          <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
            Live
          </Badge>
        </div>

        <div className="space-y-1 max-h-48 overflow-y-auto">
          <AnimatePresence>
            {activities.map((activity, idx) => {
              const isUser = activity.actor === "user";
              const isPilot = activity.actor === "pilot";
              const isCopilot = activity.actor === "copilot";
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.02 }}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded text-xs transition-all hover:bg-slate-50",
                    isUser && "bg-blue-50/50",
                    isPilot && "bg-blue-50/30",
                    isCopilot && "bg-purple-50/30"
                  )}
                >
                  {/* Actor Icon */}
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    isUser && "bg-blue-100",
                    isPilot && "bg-blue-100",
                    isCopilot && "bg-purple-100"
                  )}>
                    {isUser && <User className="w-2.5 h-2.5 text-blue-600" />}
                    {isPilot && <Sparkles className="w-2.5 h-2.5 text-blue-600" />}
                    {isCopilot && <Brain className="w-2.5 h-2.5 text-purple-600" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge className={cn(
                        "text-[9px] py-0 capitalize",
                        isUser && "bg-blue-100 text-blue-700",
                        isPilot && "bg-blue-100 text-blue-700",
                        isCopilot && "bg-purple-100 text-purple-700"
                      )}>
                        {activity.actor}
                      </Badge>
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-tight">
                      {activity.message}
                    </p>
                    {activity.status && (
                      <div className="flex items-center gap-1 mt-1">
                        {activity.status === "completed" && (
                          <CheckCircle className="w-2 h-2 text-emerald-600" />
                        )}
                        {activity.status === "pending" && (
                          <Clock className="w-2 h-2 text-amber-600" />
                        )}
                        <span className={cn(
                          "text-[10px] capitalize",
                          activity.status === "completed" && "text-emerald-700",
                          activity.status === "pending" && "text-amber-700"
                        )}>
                          {activity.status}
                        </span>
                      </div>
                    )}
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