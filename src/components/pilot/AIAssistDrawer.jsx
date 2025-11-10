import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Sparkles, ArrowRight, ArrowLeft, Loader2, CheckCircle, 
  AlertTriangle, Database, Mail, CreditCard, Package, Users,
  FileText, DollarSign, Clock, Target, Brain, FlaskConical,
  Send, Rocket, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AIAssistDrawer({ open, onOpenChange, onInsert }) {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    objective: "",
    systems: [],
    riskTolerance: "medium",
    frequency: "daily",
    successDefinition: ""
  });
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [explanationOpen, setExplanationOpen] = useState(false);

  const systems = [
    { id: "ar", label: "AR", icon: DollarSign, color: "emerald" },
    { id: "crm", label: "CRM", icon: Users, color: "blue" },
    { id: "email", label: "Email", icon: Mail, color: "purple" },
    { id: "inventory", label: "Inventory", icon: Package, color: "amber" },
    { id: "accounting", label: "Accounting", icon: FileText, color: "slate" },
    { id: "payments", label: "Payments", icon: CreditCard, color: "red" }
  ];

  const toggleSystem = (systemId) => {
    setFormData(prev => ({
      ...prev,
      systems: prev.systems.includes(systemId)
        ? prev.systems.filter(s => s !== systemId)
        : [...prev.systems, systemId]
    }));
  };

  const handleGeneratePlan = () => {
    setGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const plan = {
        name: formData.objective.split(" ").slice(0, 3).join("_").toLowerCase() || "new_mission",
        summary: `This mission automates ${formData.objective.toLowerCase()}. It will interact with ${formData.systems.length} systems: ${formData.systems.map(s => systems.find(sys => sys.id === s)?.label).join(", ")}. The workflow includes data validation, intelligent routing, and automated notifications.`,
        estimatedSLA: formData.frequency === "hourly" ? "15 minutes" : 
                      formData.frequency === "daily" ? "2 hours" : 
                      "6 hours",
        estimatedCost: {
          perRun: (0.015 + Math.random() * 0.03).toFixed(3),
          perDay: ((formData.frequency === "hourly" ? 24 : 
                   formData.frequency === "daily" ? 1 : 0.14) * 
                  (0.015 + Math.random() * 0.03)).toFixed(2)
        },
        steps: [
          { name: "Validate Input", action: "Schema Check", model: "N/A", tokens: 0, cost: 0, latency: 45 },
          { name: "Fetch Context", action: "API Call", model: "N/A", tokens: 0, cost: 0, latency: 180 },
          { name: "AI Decision", action: "LLM Inference", model: "gpt-4o-mini", tokens: 650, cost: 0.013, latency: 520 },
          { name: "Execute Action", action: "Tool Call", model: "N/A", tokens: 0, cost: 0, latency: 95 },
          { name: "Notify", action: "Email/Webhook", model: "N/A", tokens: 0, cost: 0, latency: 60 }
        ],
        riskAnalysis: {
          piiRisk: formData.systems.includes("crm") || formData.systems.includes("email") ? "medium" : "low",
          downstreamImpact: formData.systems.length,
          estimatedFailureRate: formData.riskTolerance === "low" ? 2 : 
                               formData.riskTolerance === "medium" ? 5 : 8,
          mitigations: [
            "PII masking enabled by default",
            "Retry logic with exponential backoff",
            "Circuit breaker for external APIs",
            "Manual approval gate for high-risk actions"
          ]
        },
        whyOptimal: {
          modelSelection: "gpt-4o-mini selected for optimal cost-accuracy balance for this task complexity",
          routeSuggestion: formData.riskTolerance === "low" ? "pilot" : 
                          formData.riskTolerance === "medium" ? "copilot" : "autopilot",
          efficiency: "Estimated 40% cost reduction vs. gpt-4o, with only 3% accuracy trade-off",
          safety: `${formData.riskTolerance === "low" ? 'High' : formData.riskTolerance === "medium" ? 'Medium' : 'Standard'} safety guardrails applied`,
          keyOptimizations: [
            "Caching enabled for repeated queries",
            "Batch processing for multiple items",
            "Smart retry logic reduces wasted API calls",
            "Token optimization: average 650 vs. 1200 for similar tasks"
          ]
        }
      };
      
      setGeneratedPlan(plan);
      setGenerating(false);
      setStep(2);
    }, 2500);
  };

  const handleSimulate = () => {
    toast.success("Simulation started", {
      description: "Running test with mock data..."
    });
    onOpenChange(false);
  };

  const handleDeploy = () => {
    onInsert?.(generatedPlan);
    toast.success("Mission deployed", {
      description: `${generatedPlan.name} is now active`
    });
    onOpenChange(false);
    resetWizard();
  };

  const handleSendToCopilot = () => {
    toast.success("Sent to Copilot", {
      description: "Plan queued for human review"
    });
    onOpenChange(false);
    resetWizard();
  };

  const resetWizard = () => {
    setStep(1);
    setFormData({
      objective: "",
      systems: [],
      riskTolerance: "medium",
      frequency: "daily",
      successDefinition: ""
    });
    setGeneratedPlan(null);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.objective || formData.systems.length === 0) {
        toast.error("Please complete required fields", {
          description: "Objective and at least one system are required"
        });
        return;
      }
      handleGeneratePlan();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) resetWizard();
      }}>
        <DialogContent className="bg-white border-slate-200 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Flight Plan Generator
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Step {step} of 2 — {step === 1 ? "Define Mission Parameters" : "Review Generated Plan"}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-4">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold",
              step >= 1 ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-600"
            )}>
              1
            </div>
            <div className={cn("flex-1 h-1 rounded", step >= 2 ? "bg-purple-600" : "bg-slate-200")} />
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold",
              step >= 2 ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-600"
            )}>
              2
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Input */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4 py-4"
              >
                <div>
                  <Label className="text-slate-900 text-sm mb-2 block">
                    Mission Objective <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    placeholder="e.g., Automatically follow up on overdue invoices by sending reminders and escalating to collections"
                    className="min-h-20"
                  />
                </div>

                <div>
                  <Label className="text-slate-900 text-sm mb-2 block">
                    Systems to Touch <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {systems.map((system) => {
                      const Icon = system.icon;
                      const isSelected = formData.systems.includes(system.id);
                      
                      return (
                        <button
                          key={system.id}
                          onClick={() => toggleSystem(system.id)}
                          className={cn(
                            "p-3 rounded-lg border-2 flex items-center gap-2 transition-all hover:scale-105",
                            isSelected
                              ? "border-purple-500 bg-purple-50"
                              : "border-slate-200 bg-white hover:border-purple-300"
                          )}
                        >
                          <div className={cn(
                            "p-1.5 rounded",
                            system.color === "emerald" && "bg-emerald-100",
                            system.color === "blue" && "bg-blue-100",
                            system.color === "purple" && "bg-purple-100",
                            system.color === "amber" && "bg-amber-100",
                            system.color === "slate" && "bg-slate-100",
                            system.color === "red" && "bg-red-100"
                          )}>
                            <Icon className={cn(
                              "w-4 h-4",
                              system.color === "emerald" && "text-emerald-600",
                              system.color === "blue" && "text-blue-600",
                              system.color === "purple" && "text-purple-600",
                              system.color === "amber" && "text-amber-600",
                              system.color === "slate" && "text-slate-600",
                              system.color === "red" && "text-red-600"
                            )} />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{system.label}</span>
                          {isSelected && <CheckCircle className="w-4 h-4 text-purple-600 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-900 text-sm mb-2 block">Risk Tolerance</Label>
                    <div className="space-y-2">
                      {[
                        { value: "low", label: "Low (Manual Review)", color: "emerald" },
                        { value: "medium", label: "Medium (Copilot)", color: "blue" },
                        { value: "high", label: "High (Autopilot)", color: "amber" }
                      ].map((risk) => (
                        <button
                          key={risk.value}
                          onClick={() => setFormData({ ...formData, riskTolerance: risk.value })}
                          className={cn(
                            "w-full p-2 rounded-lg border-2 text-left transition-all",
                            formData.riskTolerance === risk.value
                              ? "border-purple-500 bg-purple-50"
                              : "border-slate-200 bg-white hover:border-purple-300"
                          )}
                        >
                          <span className="text-sm text-slate-900">{risk.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-900 text-sm mb-2 block">Expected Frequency</Label>
                    <div className="space-y-2">
                      {[
                        { value: "hourly", label: "Hourly" },
                        { value: "daily", label: "Daily" },
                        { value: "weekly", label: "Weekly" }
                      ].map((freq) => (
                        <button
                          key={freq.value}
                          onClick={() => setFormData({ ...formData, frequency: freq.value })}
                          className={cn(
                            "w-full p-2 rounded-lg border-2 text-left transition-all",
                            formData.frequency === freq.value
                              ? "border-purple-500 bg-purple-50"
                              : "border-slate-200 bg-white hover:border-purple-300"
                          )}
                        >
                          <span className="text-sm text-slate-900">{freq.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-900 text-sm mb-2 block">Success Definition (Optional)</Label>
                  <Input
                    value={formData.successDefinition}
                    onChange={(e) => setFormData({ ...formData, successDefinition: e.target.value })}
                    placeholder="e.g., 90% response rate within 24 hours"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Preview */}
            {step === 2 && !generating && generatedPlan && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4 py-4"
              >
                {/* Plan Summary */}
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Generated Flight Plan: {generatedPlan.name}
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{generatedPlan.summary}</p>
                    
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="p-2 bg-white rounded-lg border border-purple-200">
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span className="text-[10px] text-slate-600">Est. SLA</span>
                        </div>
                        <div className="text-sm font-bold text-slate-900">{generatedPlan.estimatedSLA}</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-purple-200">
                        <div className="flex items-center gap-1 mb-1">
                          <DollarSign className="w-3 h-3 text-emerald-600" />
                          <span className="text-[10px] text-slate-600">Cost/Run</span>
                        </div>
                        <div className="text-sm font-bold text-slate-900">${generatedPlan.estimatedCost.perRun}</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-purple-200">
                        <div className="flex items-center gap-1 mb-1">
                          <Target className="w-3 h-3 text-purple-600" />
                          <span className="text-[10px] text-slate-600">Daily Cost</span>
                        </div>
                        <div className="text-sm font-bold text-slate-900">${generatedPlan.estimatedCost.perDay}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Analysis */}
                <Card className="border-amber-200">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Risk Preview
                    </h4>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center">
                        <div className={cn(
                          "text-2xl font-bold mb-1",
                          generatedPlan.riskAnalysis.piiRisk === "low" ? "text-emerald-600" :
                          generatedPlan.riskAnalysis.piiRisk === "medium" ? "text-amber-600" : "text-red-600"
                        )}>
                          {generatedPlan.riskAnalysis.piiRisk === "low" ? "✓" : "⚠"}
                        </div>
                        <div className="text-xs text-slate-600">PII Risk</div>
                        <div className="text-xs font-semibold text-slate-900 capitalize">
                          {generatedPlan.riskAnalysis.piiRisk}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {generatedPlan.riskAnalysis.downstreamImpact}
                        </div>
                        <div className="text-xs text-slate-600">Systems</div>
                        <div className="text-xs font-semibold text-slate-900">Impacted</div>
                      </div>
                      <div className="text-center">
                        <div className={cn(
                          "text-2xl font-bold mb-1",
                          generatedPlan.riskAnalysis.estimatedFailureRate < 5 ? "text-emerald-600" : "text-amber-600"
                        )}>
                          {generatedPlan.riskAnalysis.estimatedFailureRate}%
                        </div>
                        <div className="text-xs text-slate-600">Est. Failure</div>
                        <div className="text-xs font-semibold text-slate-900">Rate</div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200">
                      <div className="text-xs font-semibold text-slate-700 mb-2">Mitigations Applied:</div>
                      <ul className="space-y-1">
                        {generatedPlan.riskAnalysis.mitigations.map((mitigation, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                            <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>{mitigation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Why Optimal */}
                <Button
                  variant="outline"
                  onClick={() => setExplanationOpen(true)}
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Why is this plan optimal?
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Generating State */}
            {generating && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Generating Flight Plan...</h3>
                <p className="text-sm text-slate-600">AI is analyzing your requirements</p>
                <div className="mt-4 flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-purple-600 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter className="flex gap-2">
            {step > 1 && !generating && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            {step === 1 && (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Generate Plan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {step === 2 && !generating && (
              <>
                <Button
                  variant="outline"
                  onClick={handleSimulate}
                >
                  <FlaskConical className="w-4 h-4 mr-2" />
                  Simulate
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSendToCopilot}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send to Copilot
                </Button>
                <Button
                  onClick={handleDeploy}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-Explanation Drawer */}
      <Sheet open={explanationOpen} onOpenChange={setExplanationOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Why This Plan is Optimal
            </SheetTitle>
          </SheetHeader>

          {generatedPlan && (
            <div className="mt-6 space-y-4">
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-purple-900 mb-2">Model Selection</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {generatedPlan.whyOptimal.modelSelection}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-blue-900 mb-2">Route Suggestion</h4>
                  <p className="text-xs text-slate-700 leading-relaxed mb-2">
                    Recommended route: <strong className="text-blue-900 capitalize">{generatedPlan.whyOptimal.routeSuggestion}</strong>
                  </p>
                  <Badge className={cn(
                    "text-xs",
                    generatedPlan.whyOptimal.routeSuggestion === "pilot" && "bg-blue-100 text-blue-700",
                    generatedPlan.whyOptimal.routeSuggestion === "copilot" && "bg-purple-100 text-purple-700",
                    generatedPlan.whyOptimal.routeSuggestion === "autopilot" && "bg-emerald-100 text-emerald-700"
                  )}>
                    {generatedPlan.whyOptimal.routeSuggestion}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-emerald-900 mb-2">Efficiency</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {generatedPlan.whyOptimal.efficiency}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-amber-900 mb-2">Safety</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {generatedPlan.whyOptimal.safety}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Key Optimizations</h4>
                  <ul className="space-y-2">
                    {generatedPlan.whyOptimal.keyOptimizations.map((opt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <Sparkles className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}