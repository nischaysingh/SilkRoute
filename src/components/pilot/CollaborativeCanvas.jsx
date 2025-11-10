import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, GripVertical, AlertCircle, CheckCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function CollaborativeCanvas({ mission, onStepUpdate }) {
  const [steps, setSteps] = useState([
    {
      id: "1",
      name: "Validate Input",
      type: "validation",
      pilotAnnotation: null,
      copilotAnnotation: "✓ Structure looks good",
      status: "agreed"
    },
    {
      id: "2",
      name: "Fetch Context",
      type: "api_call",
      pilotAnnotation: null,
      copilotAnnotation: null,
      status: "neutral"
    },
    {
      id: "3",
      name: "AI Decision",
      type: "llm",
      pilotAnnotation: "Using gpt-4o-mini",
      copilotAnnotation: "⚡ Suggest: Parallelize with Step 4",
      status: "conflict"
    },
    {
      id: "4",
      name: "Execute Action",
      type: "tool_call",
      pilotAnnotation: "🛡 Guardrail active — rejecting parallelization",
      copilotAnnotation: null,
      status: "conflict"
    },
    {
      id: "5",
      name: "Notify",
      type: "notification",
      pilotAnnotation: null,
      copilotAnnotation: "✓ Email template optimized",
      status: "agreed"
    }
  ]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(steps);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    setSteps(items);
  };

  const getStepColor = (type) => {
    switch (type) {
      case "validation": return "blue";
      case "api_call": return "purple";
      case "llm": return "amber";
      case "tool_call": return "emerald";
      case "notification": return "cyan";
      default: return "slate";
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-bold text-slate-900">Collaborative Canvas</h4>
            <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
              Live Editing
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span className="text-slate-600">
              {steps.filter(s => s.status === "agreed").length} agreed
            </span>
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span className="text-slate-600">
              {steps.filter(s => s.status === "conflict").length} conflicts
            </span>
          </div>
        </div>

        {/* Drag and Drop Steps */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="steps">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={cn(
                  "space-y-2",
                  snapshot.isDraggingOver && "bg-blue-50/50 rounded-lg p-2"
                )}
              >
                <AnimatePresence>
                  {steps.map((step, index) => (
                    <Draggable key={step.id} draggableId={step.id} index={index}>
                      {(provided, snapshot) => {
                        const color = getStepColor(step.type);
                        
                        return (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={cn(
                              "relative p-3 rounded-lg border-2 transition-all",
                              snapshot.isDragging && "shadow-lg rotate-2",
                              step.status === "agreed" && "border-emerald-300 bg-emerald-50",
                              step.status === "conflict" && "border-amber-300 bg-amber-50 animate-pulse",
                              step.status === "neutral" && "border-slate-200 bg-white"
                            )}
                          >
                            {/* Glow for conflicts */}
                            {step.status === "conflict" && (
                              <motion.div
                                className="absolute inset-0 rounded-lg bg-amber-400 opacity-20"
                                animate={{ opacity: [0.1, 0.3, 0.1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            )}

                            <div className="relative z-10 flex items-start gap-3">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                              </div>

                              {/* Step Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={cn(
                                    "text-[9px] py-0",
                                    color === "blue" && "bg-blue-100 text-blue-700",
                                    color === "purple" && "bg-purple-100 text-purple-700",
                                    color === "amber" && "bg-amber-100 text-amber-700",
                                    color === "emerald" && "bg-emerald-100 text-emerald-700",
                                    color === "cyan" && "bg-cyan-100 text-cyan-700"
                                  )}>
                                    Step {index + 1}
                                  </Badge>
                                  <span className="text-xs font-semibold text-slate-900">
                                    {step.name}
                                  </span>
                                </div>

                                {/* AI Annotations */}
                                <div className="space-y-1">
                                  {step.pilotAnnotation && (
                                    <motion.div
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      className="flex items-start gap-2 p-2 rounded bg-blue-50 border border-blue-200"
                                    >
                                      <Sparkles className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-xs text-blue-900 leading-tight">
                                        <strong>Pilot:</strong> {step.pilotAnnotation}
                                      </p>
                                    </motion.div>
                                  )}
                                  {step.copilotAnnotation && (
                                    <motion.div
                                      initial={{ opacity: 0, x: 10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      className="flex items-start gap-2 p-2 rounded bg-purple-50 border border-purple-200"
                                    >
                                      <Brain className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-xs text-purple-900 leading-tight">
                                        <strong>Co-Pilot:</strong> {step.copilotAnnotation}
                                      </p>
                                    </motion.div>
                                  )}
                                </div>
                              </div>

                              {/* Status Indicator */}
                              <div className="flex-shrink-0">
                                {step.status === "agreed" && (
                                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                                )}
                                {step.status === "conflict" && (
                                  <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      }}
                    </Draggable>
                  ))}
                </AnimatePresence>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-xs"
          >
            Add Step
          </Button>
          <Button
            size="sm"
            className="flex-1 h-7 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Save Workflow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}