import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const AI_AGENTS = {
  pilot: { emoji: "✈️", name: "Pilot", color: "blue", icon: Sparkles },
  copilot: { emoji: "🧩", name: "Co-Pilot", color: "purple", icon: Brain },
  autopilot: { emoji: "⚙️", name: "Autopilot", color: "emerald", icon: Zap }
};

export default function AINegotiationFeed({ negotiations }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-bold text-slate-900">AI Negotiation Feed</h4>
            <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
              Internal Debates
            </Badge>
          </div>
          <Badge className="bg-slate-100 text-slate-700 text-[9px] py-0">
            {negotiations.length} active
          </Badge>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {negotiations.map((negotiation, idx) => (
              <motion.div
                key={negotiation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200"
              >
                {/* Conversation Thread */}
                <div className="space-y-2 mb-3">
                  {negotiation.conversation.map((msg, msgIdx) => {
                    const agent = AI_AGENTS[msg.agent];
                    const Icon = agent.icon;
                    
                    return (
                      <motion.div
                        key={msgIdx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: msgIdx * 0.1 }}
                        className={cn(
                          "flex items-start gap-2 p-2 rounded-lg border",
                          agent.color === "blue" && "bg-blue-50 border-blue-200",
                          agent.color === "purple" && "bg-purple-50 border-purple-200",
                          agent.color === "emerald" && "bg-emerald-50 border-emerald-200"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                          agent.color === "blue" && "bg-blue-100",
                          agent.color === "purple" && "bg-purple-100",
                          agent.color === "emerald" && "bg-emerald-100"
                        )}>
                          <Icon className={cn(
                            "w-3 h-3",
                            agent.color === "blue" && "text-blue-600",
                            agent.color === "purple" && "text-purple-600",
                            agent.color === "emerald" && "text-emerald-600"
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={cn(
                              "text-[9px] py-0",
                              agent.color === "blue" && "bg-blue-100 text-blue-700",
                              agent.color === "purple" && "bg-purple-100 text-purple-700",
                              agent.color === "emerald" && "bg-emerald-100 text-emerald-700"
                            )}>
                              {agent.emoji} {agent.name}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-900 leading-tight">
                            {msg.message}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Resolution */}
                <div className={cn(
                  "p-2 rounded-lg border-2 flex items-center gap-2",
                  negotiation.resolution.status === "accepted" && "bg-emerald-50 border-emerald-300",
                  negotiation.resolution.status === "rejected" && "bg-red-50 border-red-300",
                  negotiation.resolution.status === "pending" && "bg-amber-50 border-amber-300"
                )}>
                  {negotiation.resolution.status === "accepted" && (
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                  )}
                  {negotiation.resolution.status === "rejected" && (
                    <AlertCircle className="w-3 h-3 text-red-600" />
                  )}
                  {negotiation.resolution.status === "pending" && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-3 h-3 text-amber-600" />
                    </motion.div>
                  )}
                  <span className="text-xs font-semibold text-slate-900">
                    {negotiation.resolution.decision}
                  </span>
                  {negotiation.resolution.metric && (
                    <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0 ml-auto">
                      {negotiation.resolution.metric}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}