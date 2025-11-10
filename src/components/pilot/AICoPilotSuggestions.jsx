import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Brain, Sparkles, TrendingUp, DollarSign, Clock, 
  CheckCircle, FlaskConical, Eye, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function AICoPilotSuggestions({ missions, onApply }) {
  const [suggestions, setSuggestions] = useState([]);
  const [analyzing, setAnalyzing] = useState(true);
  const [simulateModalOpen, setSimulateModalOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);

  useEffect(() => {
    // Simulate AI analysis
    setAnalyzing(true);
    
    const timer = setTimeout(() => {
      const newSuggestions = missions.slice(0, 3).map((mission, idx) => ({
        id: idx + 1,
        missionName: mission.name,
        title: idx === 0 
          ? `${mission.name} could improve success +5% by rerouting low-value accounts`
          : idx === 1
          ? `Reduce latency by 120ms with aggressive caching`
          : `Switch to Semi-Auto for cost savings`,
        impact: {
          successImprovement: idx === 0 ? 5 : idx === 1 ? 0 : 3,
          costReduction: idx === 0 ? 0.018 : idx === 1 ? 0.012 : 0.025,
          latencyChange: idx === 0 ? 0 : idx === 1 ? -120 : 40
        },
        confidence: idx === 0 ? 92 : idx === 1 ? 88 : 85,
        category: idx === 0 ? "routing" : idx === 1 ? "performance" : "cost"
      }));
      
      setSuggestions(newSuggestions);
      setAnalyzing(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [missions]);

  const handleSimulate = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setSimulateModalOpen(true);
    setSimulationRunning(true);
    setSimulationResults(null);

    // Simulate running simulation
    setTimeout(() => {
      const baselineData = Array.from({ length: 10 }, (_, i) => ({
        time: i,
        baseline_latency: 840 + Math.random() * 200,
        baseline_success: 88 + Math.random() * 10,
        baseline_cost: 0.025 + Math.random() * 0.01,
        optimized_latency: null,
        optimized_success: null,
        optimized_cost: null
      }));

      const optimizedData = baselineData.map(d => ({
        ...d,
        optimized_latency: d.baseline_latency + suggestion.impact.latencyChange,
        optimized_success: d.baseline_success + suggestion.impact.successImprovement,
        optimized_cost: d.baseline_cost - suggestion.impact.costReduction
      }));

      setSimulationResults(optimizedData);
      setSimulationRunning(false);
    }, 3000);
  };

  const handleApply = (suggestion) => {
    toast.success("Optimization applied", {
      description: `${suggestion.title}`
    });
    onApply?.(suggestion);
  };

  const handleExplain = (suggestion) => {
    toast.info("Opening AI explanation...", {
      description: `Analyzing ${suggestion.missionName}`
    });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "routing": return "bg-blue-100 text-blue-700 border-blue-200";
      case "performance": return "bg-purple-100 text-purple-700 border-purple-200";
      case "cost": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardHeader className="border-b border-slate-200 pb-3">
          <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
            🧠 Co-Pilot Suggestions
            {analyzing && (
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                Analyzing...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {analyzing ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-slate-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-xs text-slate-600">All missions optimized</p>
              <p className="text-xs text-slate-500">No suggestions at this time</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {suggestions.map((suggestion, idx) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all hover:shadow-md",
                      getCategoryColor(suggestion.category)
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-slate-600">{suggestion.missionName}</span>
                          <Badge className="bg-purple-100 text-purple-800 text-[9px] py-0">
                            <Sparkles className="w-2 h-2 mr-0.5" />
                            {suggestion.confidence}% AI
                          </Badge>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                          {suggestion.title}
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {suggestion.impact.successImprovement > 0 && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-emerald-600" />
                          <span className="text-[10px] text-slate-700">
                            <strong>+{suggestion.impact.successImprovement}%</strong> success
                          </span>
                        </div>
                      )}
                      {suggestion.impact.costReduction > 0 && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-emerald-600" />
                          <span className="text-[10px] text-slate-700">
                            <strong>-${suggestion.impact.costReduction.toFixed(3)}</strong>
                          </span>
                        </div>
                      )}
                      {suggestion.impact.latencyChange !== 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span className="text-[10px] text-slate-700">
                            <strong>{suggestion.impact.latencyChange > 0 ? '+' : ''}{suggestion.impact.latencyChange}ms</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleApply(suggestion)}
                        className="flex-1 h-6 text-[10px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSimulate(suggestion)}
                        className="flex-1 h-6 text-[10px]"
                      >
                        <FlaskConical className="w-3 h-3 mr-1" />
                        Simulate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExplain(suggestion)}
                        className="h-6 w-6 p-0"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simulation Modal */}
      <Dialog open={simulateModalOpen} onOpenChange={setSimulateModalOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-purple-600" />
              Simulation Results
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {selectedSuggestion?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {simulationRunning ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-3" />
                <p className="text-sm text-slate-700">Running simulation...</p>
                <p className="text-xs text-slate-500">Analyzing predicted impact</p>
              </div>
            ) : simulationResults ? (
              <>
                {/* Impact Bubbles */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                    <div className="text-2xl font-bold text-emerald-900 mb-1">
                      {selectedSuggestion?.impact.costReduction 
                        ? `↓ ${(selectedSuggestion.impact.costReduction / parseFloat(selectedSuggestion.impact.costReduction + 0.025) * 100).toFixed(0)}%`
                        : '-'
                      }
                    </div>
                    <div className="text-xs text-emerald-700">Cost Reduction</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                    <div className="text-2xl font-bold text-blue-900 mb-1">
                      {selectedSuggestion?.impact.successImprovement 
                        ? `↑ ${selectedSuggestion.impact.successImprovement}%`
                        : '-'
                      }
                    </div>
                    <div className="text-xs text-blue-700">Success Rate</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
                    <div className="text-2xl font-bold text-purple-900 mb-1">
                      {selectedSuggestion?.impact.latencyChange 
                        ? `${selectedSuggestion.impact.latencyChange > 0 ? '+' : ''}${selectedSuggestion.impact.latencyChange}ms`
                        : '-'
                      }
                    </div>
                    <div className="text-xs text-purple-700">Latency Change</div>
                  </div>
                </div>

                {/* Comparison Charts */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Performance Comparison</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={simulationResults}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line 
                          type="monotone" 
                          dataKey="baseline_success" 
                          stroke="#94a3b8" 
                          strokeWidth={2}
                          name="Baseline Success"
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="optimized_success" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="Optimized Success"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSimulateModalOpen(false)}
                      className="flex-1"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        handleApply(selectedSuggestion);
                        setSimulateModalOpen(false);
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Promote to Live
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}