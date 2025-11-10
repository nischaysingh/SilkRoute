import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, TrendingUp, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";

export default function MissionMemoryCard({ mission }) {
  const [expandedMemory, setExpandedMemory] = useState(null);

  // Mock memory snippets
  const memories = [
    {
      id: 1,
      agent: "pilot",
      memory: "Learned: invoice_chase_v1 prefers balanced profile",
      timestamp: "3 days ago",
      confidence: 94,
      data: Array.from({ length: 10 }, (_, i) => ({ 
        x: i, 
        success: 85 + Math.random() * 10 
      }))
    },
    {
      id: 2,
      agent: "copilot",
      memory: "Observed: Anomaly pattern #7 last week (retry storms)",
      timestamp: "1 week ago",
      confidence: 88,
      data: Array.from({ length: 10 }, (_, i) => ({ 
        x: i, 
        latency: 800 + Math.random() * 300 
      }))
    },
    {
      id: 3,
      agent: "pilot",
      memory: "Cost optimization: gpt-4o-mini performs well for this intent",
      timestamp: "2 weeks ago",
      confidence: 91,
      data: Array.from({ length: 10 }, (_, i) => ({ 
        x: i, 
        cost: 0.02 + Math.random() * 0.01 
      }))
    }
  ];

  const handleForget = (memory) => {
    toast.success("Memory forgotten", {
      description: `AI will no longer weight ${memory.memory.slice(0, 30)}...`
    });
  };

  const handleReinforce = (memory) => {
    toast.success("Memory reinforced", {
      description: "AI will prioritize this pattern in future decisions"
    });
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-purple-600" />
          <h4 className="text-sm font-bold text-slate-900">AI Context Memory</h4>
          <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
            {memories.length} insights
          </Badge>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {memories.map((memory, idx) => {
              const isExpanded = expandedMemory === memory.id;
              
              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    memory.agent === "pilot" 
                      ? "bg-blue-50 border-blue-200 hover:border-blue-300" 
                      : "bg-purple-50 border-purple-200 hover:border-purple-300",
                    isExpanded && "ring-2 ring-purple-500"
                  )}
                  onClick={() => setExpandedMemory(isExpanded ? null : memory.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      {memory.agent === "pilot" ? (
                        <Sparkles className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      ) : (
                        <Brain className="w-3 h-3 text-purple-600 flex-shrink-0" />
                      )}
                      <p className="text-xs font-medium text-slate-900 leading-tight">
                        {memory.memory}
                      </p>
                    </div>
                    <Badge className={cn(
                      "text-[9px] py-0 flex-shrink-0 ml-2",
                      memory.agent === "pilot" 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-purple-100 text-purple-700"
                    )}>
                      {memory.confidence}%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-600">
                    <span>{memory.timestamp}</span>
                    <span className="capitalize">{memory.agent}</span>
                  </div>

                  {/* Expanded View */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-slate-200"
                      >
                        {/* Historical Data */}
                        <ResponsiveContainer width="100%" height={60}>
                          <LineChart data={memory.data}>
                            <XAxis dataKey="x" tick={{ fontSize: 8 }} />
                            <YAxis tick={{ fontSize: 8 }} />
                            <Tooltip contentStyle={{ fontSize: 10 }} />
                            <Line 
                              type="monotone" 
                              dataKey={Object.keys(memory.data[0]).find(k => k !== 'x')}
                              stroke={memory.agent === "pilot" ? "#3b82f6" : "#8b5cf6"}
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleForget(memory);
                            }}
                            className="flex-1 h-6 text-xs border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-2 h-2 mr-1" />
                            Forget
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReinforce(memory);
                            }}
                            className={cn(
                              "flex-1 h-6 text-xs",
                              memory.agent === "pilot"
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-purple-600 hover:bg-purple-700"
                            )}
                          >
                            <TrendingUp className="w-2 h-2 mr-1" />
                            Reinforce
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}