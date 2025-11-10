import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sparkles, Brain, Zap, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const AI_AGENTS = {
  pilot: { emoji: "✈️", name: "Pilot", color: "blue" },
  copilot: { emoji: "🧩", name: "Co-Pilot", color: "purple" },
  autopilot: { emoji: "⚙️", name: "Autopilot", color: "emerald" }
};

export default function BehavioralTimeline({ events, onReplay }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [replayDrawerOpen, setReplayDrawerOpen] = useState(false);

  const handleReplay = (event) => {
    setSelectedEvent(event);
    setReplayDrawerOpen(true);
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">Behavioral Timeline</h4>
              <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
                Agent Handoffs
              </Badge>
            </div>
            <div className="text-xs text-slate-600">
              {events.length} control transfers
            </div>
          </div>

          {/* Timeline */}
          <div className="relative space-y-3">
            {/* Vertical Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500 opacity-30" />

            <AnimatePresence>
              {events.map((event, idx) => {
                const agent = AI_AGENTS[event.agent];
                const isPositive = event.outcome.score > 0;
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative pl-12"
                  >
                    {/* Agent Icon */}
                    <div className={cn(
                      "absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2",
                      agent.color === "blue" && "bg-blue-100 border-blue-500",
                      agent.color === "purple" && "bg-purple-100 border-purple-500",
                      agent.color === "emerald" && "bg-emerald-100 border-emerald-500"
                    )}>
                      {agent.emoji}
                    </div>

                    {/* Event Card */}
                    <div className={cn(
                      "p-3 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md",
                      agent.color === "blue" && "border-l-blue-500 bg-blue-50",
                      agent.color === "purple" && "border-l-purple-500 bg-purple-50",
                      agent.color === "emerald" && "border-l-emerald-500 bg-emerald-50"
                    )}
                    onClick={() => handleReplay(event)}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={cn(
                              "text-[9px] py-0",
                              agent.color === "blue" && "bg-blue-100 text-blue-700",
                              agent.color === "purple" && "bg-purple-100 text-purple-700",
                              agent.color === "emerald" && "bg-emerald-100 text-emerald-700"
                            )}>
                              {agent.name}
                            </Badge>
                            <span className="text-[10px] text-slate-500">
                              {event.timestamp}
                            </span>
                          </div>
                          <h5 className="text-xs font-semibold text-slate-900 mb-1">
                            {event.action}
                          </h5>
                          <p className="text-[10px] text-slate-600 leading-tight">
                            {event.reason}
                          </p>
                        </div>
                        
                        {/* Result Score */}
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                          isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isPositive ? '+' : ''}{event.outcome.score}%
                        </div>
                      </div>

                      {/* Outcome Metrics */}
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {event.outcome.latency && (
                          <div className="text-center p-1 bg-white rounded">
                            <div className="text-[9px] text-slate-600">Latency</div>
                            <div className={cn(
                              "text-xs font-bold",
                              event.outcome.latency < 0 ? "text-emerald-700" : "text-amber-700"
                            )}>
                              {event.outcome.latency > 0 ? '+' : ''}{event.outcome.latency}ms
                            </div>
                          </div>
                        )}
                        {event.outcome.cost && (
                          <div className="text-center p-1 bg-white rounded">
                            <div className="text-[9px] text-slate-600">Cost</div>
                            <div className={cn(
                              "text-xs font-bold",
                              event.outcome.cost < 0 ? "text-emerald-700" : "text-red-700"
                            )}>
                              {event.outcome.cost > 0 ? '+' : ''}${Math.abs(event.outcome.cost).toFixed(3)}
                            </div>
                          </div>
                        )}
                        {event.outcome.success && (
                          <div className="text-center p-1 bg-white rounded">
                            <div className="text-[9px] text-slate-600">Success</div>
                            <div className="text-xs font-bold text-purple-700">
                              {event.outcome.success}%
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Replay Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReplay(event);
                        }}
                        className="w-full h-6 text-xs mt-2"
                      >
                        <RefreshCw className="w-2 h-2 mr-1" />
                        Simulate with Alternative AI
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Replay Simulation Drawer */}
      <Sheet open={replayDrawerOpen} onOpenChange={setReplayDrawerOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              Replay Simulation
            </SheetTitle>
          </SheetHeader>

          {selectedEvent && (
            <div className="mt-6 space-y-4">
              {/* Original Event */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-blue-900 mb-2">Original Decision</h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Agent:</span>
                      <span className="font-semibold text-slate-900">
                        {AI_AGENTS[selectedEvent.agent].emoji} {AI_AGENTS[selectedEvent.agent].name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Action:</span>
                      <span className="font-semibold text-slate-900">{selectedEvent.action}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Result Score:</span>
                      <span className={cn(
                        "font-semibold",
                        selectedEvent.outcome.score > 0 ? "text-emerald-700" : "text-red-700"
                      )}>
                        {selectedEvent.outcome.score > 0 ? '+' : ''}{selectedEvent.outcome.score}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alternative Simulations */}
              <div>
                <h5 className="text-sm font-bold text-slate-900 mb-3">Alternative Scenarios</h5>
                <div className="space-y-2">
                  {Object.entries(AI_AGENTS)
                    .filter(([key]) => key !== selectedEvent.agent)
                    .map(([key, agent]) => (
                      <Card key={key} className={cn(
                        "cursor-pointer hover:shadow-md transition-all",
                        agent.color === "blue" && "bg-blue-50 border-blue-200",
                        agent.color === "purple" && "bg-purple-50 border-purple-200",
                        agent.color === "emerald" && "bg-emerald-50 border-emerald-200"
                      )}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{agent.emoji}</span>
                              <span className="text-xs font-semibold text-slate-900">
                                {agent.name}
                              </span>
                            </div>
                            <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
                              Predicted
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-[10px]">
                            <div className="text-center">
                              <div className="text-slate-600">Latency</div>
                              <div className="font-semibold text-blue-700">
                                {key === "pilot" ? "+80ms" : key === "copilot" ? "-120ms" : "-200ms"}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-slate-600">Cost</div>
                              <div className="font-semibold text-emerald-700">
                                {key === "pilot" ? "-$0.005" : key === "copilot" ? "+$0.002" : "-$0.012"}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-slate-600">Score</div>
                              <div className="font-semibold text-purple-700">
                                {key === "pilot" ? "+6%" : key === "copilot" ? "+8%" : "+4%"}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>

              <Button
                onClick={() => {
                  onReplay?.(selectedEvent);
                  setReplayDrawerOpen(false);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Run Simulation
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}