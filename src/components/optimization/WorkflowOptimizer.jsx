import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, TrendingUp, AlertTriangle, Check, Eye, Play, Sparkles, Loader2, GitBranch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { analyzeWorkflowBottlenecks } from "@/functions/analyzeWorkflowBottlenecks";

export default function WorkflowOptimizer({ workflow }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [appliedOptimizations, setAppliedOptimizations] = useState([]);

  const handleAnalyze = async () => {
    if (!workflow) {
      toast.error("No workflow selected");
      return;
    }

    setAnalyzing(true);

    try {
      const response = await analyzeWorkflowBottlenecks({
        workflowId: workflow.id
      });

      if (response.data.success) {
        setAnalysisData(response.data);
        toast.success("Workflow analyzed", {
          description: `Found ${response.data.analysis.bottlenecks?.length || 0} bottlenecks`
        });
      }
    } catch (error) {
      toast.error("Analysis failed", {
        description: error.message
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyOptimization = (optimization) => {
    setAppliedOptimizations(prev => [...prev, optimization.title]);
    toast.success(`Applied: ${optimization.title}`, {
      description: `Expected improvement: ${optimization.expected_improvement}`
    });
  };

  const handleAutoApplyAll = () => {
    const autoApplicable = analysisData?.analysis.optimizations?.filter(o => o.auto_applicable) || [];
    autoApplicable.forEach(opt => {
      setAppliedOptimizations(prev => [...prev, opt.title]);
    });
    toast.success(`Auto-applied ${autoApplicable.length} optimizations`);
  };

  if (!workflow) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-12 text-center">
          <Zap className="w-16 h-16 mx-auto mb-4 text-blue-400 opacity-50" />
          <h4 className="text-lg font-semibold text-slate-900 mb-2">No Workflow Selected</h4>
          <p className="text-sm text-slate-600">Select a workflow to analyze and optimize</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-600" />
          AI Workflow Optimizer
        </h3>
        <Button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Workflow
            </>
          )}
        </Button>
      </div>

      {!analysisData ? (
        <Card className="bg-white border-slate-200">
          <CardContent className="p-12 text-center">
            <Zap className="w-16 h-16 mx-auto mb-4 text-amber-400 opacity-50" />
            <h4 className="text-lg font-semibold text-slate-900 mb-2">Ready to Optimize</h4>
            <p className="text-sm text-slate-600 mb-4">
              AI will analyze {workflow.name} for bottlenecks and inefficiencies
            </p>
            <Button
              onClick={handleAnalyze}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Analysis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Health Score */}
          <Card className={cn(
            "border-2",
            analysisData.analysis.workflow_health_score >= 80 ? "border-emerald-300 bg-emerald-50" :
            analysisData.analysis.workflow_health_score >= 60 ? "border-amber-300 bg-amber-50" :
            "border-red-300 bg-red-50"
          )}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-bold text-slate-900">Workflow Health Score</h4>
                <div className="text-3xl font-bold text-slate-900">
                  {analysisData.analysis.workflow_health_score}/100
                </div>
              </div>
              <Progress value={analysisData.analysis.workflow_health_score} className="h-2 mb-3" />
              <p className="text-sm text-slate-700">{analysisData.analysis.summary}</p>
            </CardContent>
          </Card>

          {/* Bottlenecks */}
          {analysisData.analysis.bottlenecks?.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3">Identified Bottlenecks</h4>
              <div className="space-y-3">
                {analysisData.analysis.bottlenecks.map((bottleneck, idx) => (
                  <Card key={idx} className={cn(
                    "border-2",
                    bottleneck.severity === "critical" ? "border-red-300 bg-red-50" :
                    bottleneck.severity === "high" ? "border-orange-300 bg-orange-50" :
                    bottleneck.severity === "medium" ? "border-amber-300 bg-amber-50" :
                    "border-blue-300 bg-blue-50"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={cn(
                              "text-xs",
                              bottleneck.severity === "critical" ? "bg-red-100 text-red-700" :
                              bottleneck.severity === "high" ? "bg-orange-100 text-orange-700" :
                              bottleneck.severity === "medium" ? "bg-amber-100 text-amber-700" :
                              "bg-blue-100 text-blue-700"
                            )}>
                              {bottleneck.severity}
                            </Badge>
                            <span className="text-sm font-bold text-slate-900">{bottleneck.step_name}</span>
                          </div>
                          <p className="text-sm text-slate-700 mb-2">{bottleneck.issue}</p>
                          <div className="space-y-1 text-xs">
                            <div>
                              <span className="text-slate-600">Impact: </span>
                              <span className="text-red-700 font-semibold">{bottleneck.impact}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Root Cause: </span>
                              <span className="text-slate-900">{bottleneck.root_cause}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Optimizations */}
          {analysisData.analysis.optimizations?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900">AI-Suggested Optimizations</h4>
                <Button
                  size="sm"
                  onClick={handleAutoApplyAll}
                  className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Auto-Apply All
                </Button>
              </div>
              <div className="space-y-3">
                {analysisData.analysis.optimizations.map((opt, idx) => {
                  const isApplied = appliedOptimizations.includes(opt.title);
                  
                  return (
                    <Card key={idx} className={cn(
                      "border-2",
                      isApplied ? "border-emerald-300 bg-emerald-50 opacity-70" :
                      opt.priority <= 2 ? "border-purple-300 bg-purple-50" :
                      "border-blue-300 bg-blue-50"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-purple-100 text-purple-700 text-xs">
                                P{opt.priority}
                              </Badge>
                              <Badge className={cn(
                                "text-xs",
                                opt.implementation_effort === "low" ? "bg-emerald-100 text-emerald-700" :
                                opt.implementation_effort === "medium" ? "bg-amber-100 text-amber-700" :
                                "bg-red-100 text-red-700"
                              )}>
                                {opt.implementation_effort} effort
                              </Badge>
                              {opt.auto_applicable && (
                                <Badge className="bg-blue-100 text-blue-700 text-xs">
                                  <Zap className="w-3 h-3 mr-1" />
                                  Auto
                                </Badge>
                              )}
                            </div>
                            <h5 className="text-sm font-bold text-slate-900 mb-2">{opt.title}</h5>
                            <p className="text-sm text-slate-700 mb-2">{opt.description}</p>
                            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 mb-2">
                              <strong>Expected: </strong>{opt.expected_improvement}
                            </div>
                            {opt.target_steps?.length > 0 && (
                              <div className="text-xs text-slate-600">
                                Affects: {opt.target_steps.join(", ")}
                              </div>
                            )}
                          </div>
                        </div>

                        {isApplied ? (
                          <Badge className="w-full justify-center bg-emerald-100 text-emerald-700 text-xs py-2">
                            <Check className="w-3 h-3 mr-1" />
                            Applied
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleApplyOptimization(opt)}
                            className="w-full bg-purple-600 hover:bg-purple-700 h-8 text-xs"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Apply Optimization
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Reprioritization */}
          {analysisData.analysis.dynamic_reprioritization?.should_reprioritize && (
            <Card className="border-2 border-amber-300 bg-amber-50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch className="w-5 h-5 text-amber-600" />
                  <h4 className="text-base font-bold text-slate-900">Dynamic Re-prioritization Needed</h4>
                </div>
                <p className="text-sm text-slate-700 mb-4">
                  {analysisData.analysis.dynamic_reprioritization.reasoning}
                </p>
                
                {analysisData.analysis.dynamic_reprioritization.suggested_changes?.length > 0 && (
                  <div className="space-y-2">
                    {analysisData.analysis.dynamic_reprioritization.suggested_changes.map((change, idx) => (
                      <div key={idx} className="p-3 bg-white rounded border border-amber-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-slate-900">{change.mission_id}</span>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-slate-100 text-slate-700 text-xs">
                              P{change.current_priority}
                            </Badge>
                            <span className="text-slate-400">→</span>
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              P{change.suggested_priority}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600">{change.reason}</p>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  className="w-full mt-4 bg-amber-600 hover:bg-amber-700"
                  onClick={() => {
                    toast.success("Re-prioritization applied");
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Apply Re-prioritization
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}