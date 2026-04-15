import React, { useState } from "react";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Plus, Database, Zap, Shield, Play, Save, Copy, Loader2, CheckCircle, Target, Settings, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AgentBuilder() {
  const [prompt, setPrompt] = useState("");
  const [blueprint, setBlueprint] = useState(null);
  const [building, setBuilding] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedConfig, setAdvancedConfig] = useState({
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 0.9,
    frequency_penalty: 0,
    presence_penalty: 0,
    timeout_ms: 30000
  });
  const queryClient = useQueryClient();

  const generateBlueprintMutation = useMutation({
    mutationFn: async (mission) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert AI agent architect with deep knowledge of automation, workflows, and AI capabilities.

MISSION DESCRIPTION: ${mission}

Design a comprehensive, production-ready agent blueprint with advanced capabilities:

1. AGENT NAME: Create a descriptive snake_case name (e.g., "invoice_reconciler_v1", "customer_support_ai_v1")

2. DATA INPUTS: Identify ALL necessary data sources with:
   - Exact field names and types
   - Data validation requirements
   - Refresh frequency
   - Fallback strategies

3. TRIGGERS: Specify when this agent should activate:
   - Schedule (cron format if applicable)
   - Event-based (which events)
   - Webhook (what conditions)
   - Manual invocation
   
4. AI MODEL SELECTION: Choose the optimal model considering:
   - Task complexity
   - Cost efficiency
   - Latency requirements
   - Accuracy needs
   Recommend: gpt-4o-mini (cost-efficient), gpt-4o (high-accuracy), claude-3-haiku (fast)

5. ADVANCED AI PARAMETERS:
   - Temperature (0.0-2.0): Lower for deterministic tasks, higher for creative tasks
   - Max Tokens: Based on expected output length
   - Top P: Nucleus sampling parameter
   - Suggested retry policy
   - Timeout settings

6. SAFEGUARDS: Design comprehensive safety measures:
   - Human approval thresholds (e.g., "Require approval for amounts > $5K")
   - Rate limiting (e.g., "Max 100 emails/hour")
   - Data validation rules
   - Rollback conditions
   - PII protection
   - Sandbox mode settings

7. EXECUTION STEPS: Break down the mission into executable steps with:
   - Specific actions
   - Dependencies
   - Error handling
   - Validation checks

8. OUTPUTS/ACTIONS: Define what the agent will produce or do

9. COST & PERFORMANCE: Provide realistic estimates

Return ONLY valid JSON:`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            mission: { type: "string" },
            inputs: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  validation: { type: "string" },
                  refresh_frequency: { type: "string" }
                }
              }
            },
            triggers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  config: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            model: {
              type: "object",
              properties: {
                name: { type: "string" },
                profile: { type: "string" },
                reasoning: { type: "string" }
              }
            },
            advanced_params: {
              type: "object",
              properties: {
                temperature: { type: "number" },
                max_tokens: { type: "number" },
                top_p: { type: "number" },
                frequency_penalty: { type: "number" },
                presence_penalty: { type: "number" },
                reasoning: { type: "string" }
              }
            },
            safeguards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  enabled: { type: "boolean" },
                  description: { type: "string" },
                  threshold: { type: "string" }
                }
              }
            },
            execution_steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step: { type: "number" },
                  action: { type: "string" },
                  description: { type: "string" },
                  error_handling: { type: "string" }
                }
              }
            },
            outputs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  action: { type: "string" },
                  format: { type: "string" }
                }
              }
            },
            estimatedCost: { type: "string" },
            estimatedRuntime: { type: "string" },
            riskAssessment: {
              type: "object",
              properties: {
                overall_risk: { type: "string" },
                risk_factors: { type: "array", items: { type: "string" } },
                mitigation_strategies: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setBlueprint(data);
      setAgentName(data.name);
      if (data.advanced_params) {
        setAdvancedConfig({
          temperature: data.advanced_params.temperature || 0.7,
          max_tokens: data.advanced_params.max_tokens || 2000,
          top_p: data.advanced_params.top_p || 0.9,
          frequency_penalty: data.advanced_params.frequency_penalty || 0,
          presence_penalty: data.advanced_params.presence_penalty || 0,
          timeout_ms: 30000
        });
      }
      toast.success("Enhanced agent blueprint generated!");
    },
    onError: (error) => {
      toast.error("Failed to generate blueprint", {
        description: error.message
      });
    }
  });

  const deployAgentMutation = useMutation({
    mutationFn: async (blueprintData) => {
      const mission = await base44.entities.AIMission.create({
        name: blueprintData.name,
        version: 1,
        intent: blueprintData.mission,
        status: "armed",
        priority: 3,
        risk_score: blueprintData.riskAssessment?.overall_risk === "high" ? 0.7 : 
                    blueprintData.riskAssessment?.overall_risk === "medium" ? 0.4 : 0.2,
        simulation_metadata: {
          route: "pilot",
          successRate: 90,
          avgLatency: parseInt(blueprintData.estimatedRuntime?.match(/\d+/)?.[0] || "45") * 1000,
          tokensPerRun: 450,
          spendPerRun: blueprintData.estimatedCost?.match(/\d+\.\d+/)?.[0] || "0.04",
          model: blueprintData.model?.name || "gpt-4o-mini",
          inputs: blueprintData.inputs?.map(i => ({ name: i.name, type: i.type, validation: i.validation })) || [],
          triggers: blueprintData.triggers?.map(t => ({ type: t.type, config: t.config })) || [],
          safeguards: blueprintData.safeguards?.filter(s => s.enabled).map(s => ({ name: s.name, threshold: s.threshold })) || [],
          outputs: blueprintData.outputs?.map(o => ({ name: o.name, action: o.action, format: o.format })) || [],
          execution_steps: blueprintData.execution_steps || [],
          confidence: 0.88,
          estimatedImpact: blueprintData.riskAssessment?.overall_risk || "AI-generated agent ready for execution"
        },
        advanced_config: advancedConfig,
        is_production: false,
        version_notes: "Initial version created by Agent Builder"
      });
      return mission;
    },
    onSuccess: (mission) => {
      queryClient.invalidateQueries({ queryKey: ['ai-missions'] });
      toast.success("Agent deployed and armed! 🚀", {
        description: `${mission.name} v${mission.version} is ready - find it in Management > Orchestration`
      });
      setBlueprint(null);
      setPrompt("");
      setAgentName("");
    },
    onError: (error) => {
      toast.error("Failed to deploy agent", {
        description: error.message
      });
    }
  });

  const handleBuild = () => {
    if (!prompt.trim()) {
      toast.error("Please describe your agent's mission");
      return;
    }

    setBuilding(true);
    generateBlueprintMutation.mutate(prompt);
  };

  const handleDeploy = () => {
    if (!blueprint) return;
    deployAgentMutation.mutate(blueprint);
  };

  const handleClone = () => {
    if (!blueprint) return;
    setPrompt(blueprint.mission);
    toast.success("Blueprint cloned", {
      description: "Modify and regenerate to create a variant"
    });
  };

  useEffect(() => {
    if (generateBlueprintMutation.isSuccess || generateBlueprintMutation.isError) {
      setBuilding(false);
    }
  }, [generateBlueprintMutation.isSuccess, generateBlueprintMutation.isError]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Enhanced Agent Builder</h2>
              <p className="text-sm text-slate-600">Design production-ready AI agents with advanced configuration</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Input */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-6">
          <Label className="text-sm font-bold text-slate-900 mb-2 block">
            Describe Your Agent's Mission
          </Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create an agent that manages and delegates tasks for the workforce. It should be able to handle all types of events like labor shortage, extra workload, etc."
            className="min-h-32 mb-4"
            disabled={building}
          />
          <Button
            onClick={handleBuild}
            disabled={building || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {building ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Enhanced Blueprint...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Agent Blueprint
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Blueprint Display */}
      <AnimatePresence>
        {blueprint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Blueprint Header */}
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900">{blueprint.name}</h3>
                    <p className="text-sm text-slate-700">{blueprint.mission}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleClone}
                      disabled={deployAgentMutation.isPending}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Clone
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleDeploy} 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={deployAgentMutation.isPending}
                    >
                      {deployAgentMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Deploy & Arm
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="config" className="w-full">
              <TabsList className="bg-white border border-slate-200">
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="advanced">Advanced AI Settings</TabsTrigger>
                <TabsTrigger value="execution">Execution Steps</TabsTrigger>
                <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="mt-4">
                {/* Blueprint Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Inputs */}
                  <Card className="border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Database className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-bold text-slate-900">Data Inputs</h4>
                      </div>
                      <div className="space-y-2">
                        {blueprint.inputs?.map((input, idx) => (
                          <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-slate-900">{input.name}</span>
                              <Badge className="bg-blue-100 text-blue-700 text-xs">{input.type}</Badge>
                            </div>
                            <p className="text-xs text-slate-600 mb-1">{input.description}</p>
                            {input.validation && (
                              <p className="text-xs text-amber-600">Validation: {input.validation}</p>
                            )}
                            {input.refresh_frequency && (
                              <p className="text-xs text-blue-600">Refresh: {input.refresh_frequency}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Triggers */}
                  <Card className="border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <h4 className="text-sm font-bold text-slate-900">Triggers</h4>
                      </div>
                      <div className="space-y-2">
                        {blueprint.triggers?.map((trigger, idx) => (
                          <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between mb-1">
                              <Badge className="bg-amber-100 text-amber-700 text-xs capitalize">{trigger.type}</Badge>
                            </div>
                            <p className="text-xs text-slate-700 mb-1">{trigger.config}</p>
                            {trigger.description && (
                              <p className="text-xs text-slate-600 italic">{trigger.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Model Selection */}
                  <Card className="border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <h4 className="text-sm font-bold text-slate-900">Model Configuration</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Model:</span>
                          <span className="text-sm font-semibold text-slate-900">{blueprint.model?.name || "gpt-4o-mini"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Profile:</span>
                          <Badge className="bg-purple-100 text-purple-700 text-xs">{blueprint.model?.profile || "cost-balanced"}</Badge>
                        </div>
                        <p className="text-xs text-slate-600 italic">{blueprint.model?.reasoning || "Optimized for cost and performance"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Safeguards */}
                  <Card className="border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-sm font-bold text-slate-900">Safeguards</h4>
                      </div>
                      <div className="space-y-2">
                        {blueprint.safeguards?.map((guard, idx) => (
                          <div key={idx} className="flex items-start justify-between p-2 rounded bg-slate-50 border border-slate-200">
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-slate-900">{guard.name}</div>
                              <div className="text-xs text-slate-600">{guard.description}</div>
                              {guard.threshold && (
                                <Badge className="mt-1 bg-red-100 text-red-700 text-xs">
                                  Threshold: {guard.threshold}
                                </Badge>
                              )}
                            </div>
                            <Switch checked={guard.enabled} disabled />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="mt-4">
                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="w-5 h-5 text-purple-600" />
                      <h4 className="text-lg font-bold text-slate-900">Advanced AI Parameters</h4>
                    </div>

                    {blueprint.advanced_params?.reasoning && (
                      <Card className="mb-4 bg-blue-50 border-blue-200">
                        <CardContent className="p-3">
                          <p className="text-xs text-blue-900 italic">
                            💡 {blueprint.advanced_params.reasoning}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-6">
                      {/* Temperature */}
                      <div>
                        <Label className="text-sm font-bold text-slate-900 mb-2 block">
                          Temperature: {advancedConfig.temperature}
                        </Label>
                        <p className="text-xs text-slate-600 mb-2">
                          Controls randomness: 0 = deterministic, 2 = very creative
                        </p>
                        <Slider
                          value={[advancedConfig.temperature]}
                          onValueChange={(value) => setAdvancedConfig({ ...advancedConfig, temperature: value[0] })}
                          min={0}
                          max={2}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>Precise</span>
                          <span>Balanced</span>
                          <span>Creative</span>
                        </div>
                      </div>

                      {/* Max Tokens */}
                      <div>
                        <Label className="text-sm font-bold text-slate-900 mb-2 block">
                          Max Tokens: {advancedConfig.max_tokens}
                        </Label>
                        <p className="text-xs text-slate-600 mb-2">
                          Maximum length of AI response
                        </p>
                        <Slider
                          value={[advancedConfig.max_tokens]}
                          onValueChange={(value) => setAdvancedConfig({ ...advancedConfig, max_tokens: value[0] })}
                          min={100}
                          max={4000}
                          step={100}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>100</span>
                          <span>2000</span>
                          <span>4000</span>
                        </div>
                      </div>

                      {/* Top P */}
                      <div>
                        <Label className="text-sm font-bold text-slate-900 mb-2 block">
                          Top P (Nucleus Sampling): {advancedConfig.top_p}
                        </Label>
                        <p className="text-xs text-slate-600 mb-2">
                          Controls diversity via nucleus sampling
                        </p>
                        <Slider
                          value={[advancedConfig.top_p]}
                          onValueChange={(value) => setAdvancedConfig({ ...advancedConfig, top_p: value[0] })}
                          min={0}
                          max={1}
                          step={0.05}
                          className="w-full"
                        />
                      </div>

                      {/* Frequency Penalty */}
                      <div>
                        <Label className="text-sm font-bold text-slate-900 mb-2 block">
                          Frequency Penalty: {advancedConfig.frequency_penalty}
                        </Label>
                        <p className="text-xs text-slate-600 mb-2">
                          Reduces repetition of token sequences
                        </p>
                        <Slider
                          value={[advancedConfig.frequency_penalty]}
                          onValueChange={(value) => setAdvancedConfig({ ...advancedConfig, frequency_penalty: value[0] })}
                          min={-2}
                          max={2}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      {/* Presence Penalty */}
                      <div>
                        <Label className="text-sm font-bold text-slate-900 mb-2 block">
                          Presence Penalty: {advancedConfig.presence_penalty}
                        </Label>
                        <p className="text-xs text-slate-600 mb-2">
                          Reduces repetition of topics
                        </p>
                        <Slider
                          value={[advancedConfig.presence_penalty]}
                          onValueChange={(value) => setAdvancedConfig({ ...advancedConfig, presence_penalty: value[0] })}
                          min={-2}
                          max={2}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      {/* Timeout */}
                      <div>
                        <Label className="text-sm font-bold text-slate-900 mb-2 block">
                          Timeout (ms)
                        </Label>
                        <Input
                          type="number"
                          value={advancedConfig.timeout_ms}
                          onChange={(e) => setAdvancedConfig({ ...advancedConfig, timeout_ms: parseInt(e.target.value) })}
                          min={5000}
                          max={120000}
                          step={5000}
                        />
                        <p className="text-xs text-slate-600 mt-1">
                          Maximum execution time (5-120 seconds)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="execution" className="mt-4">
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-sm font-bold text-slate-900">Execution Steps</h4>
                    </div>
                    <div className="space-y-2">
                      {blueprint.execution_steps?.map((step, idx) => (
                        <div key={idx} className="p-3 rounded bg-slate-50 border border-slate-200">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {step.step}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-slate-900 mb-1">{step.action}</div>
                              <p className="text-xs text-slate-600 mb-1">{step.description}</p>
                              {step.error_handling && (
                                <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                                  <p className="text-xs text-amber-700">Error Handling: {step.error_handling}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Outputs */}
                <Card className="border-slate-200 mt-4">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-sm font-bold text-slate-900">Expected Outputs</h4>
                    </div>
                    <div className="space-y-2">
                      {blueprint.outputs?.map((output, idx) => (
                        <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-slate-900">{output.name}</span>
                            {output.format && (
                              <Badge className="bg-emerald-100 text-emerald-700 text-xs">{output.format}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-600">{output.action}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="risk" className="mt-4">
                {blueprint.riskAssessment && (
                  <Card className="border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <h4 className="text-sm font-bold text-slate-900">Risk Assessment</h4>
                      </div>

                      <div className="mb-4 p-3 rounded bg-slate-50 border-2 border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-900">Overall Risk Level</span>
                          <Badge className={cn(
                            "text-xs",
                            blueprint.riskAssessment.overall_risk === "high" && "bg-red-100 text-red-700",
                            blueprint.riskAssessment.overall_risk === "medium" && "bg-amber-100 text-amber-700",
                            blueprint.riskAssessment.overall_risk === "low" && "bg-emerald-100 text-emerald-700"
                          )}>
                            {blueprint.riskAssessment.overall_risk}
                          </Badge>
                        </div>
                      </div>

                      {blueprint.riskAssessment.risk_factors?.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-xs font-bold text-slate-900 mb-2">Risk Factors</h5>
                          <div className="space-y-1">
                            {blueprint.riskAssessment.risk_factors.map((factor, idx) => (
                              <div key={idx} className="flex items-start gap-2 p-2 bg-red-50 rounded border border-red-200">
                                <AlertTriangle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-slate-700">{factor}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {blueprint.riskAssessment.mitigation_strategies?.length > 0 && (
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 mb-2">Mitigation Strategies</h5>
                          <div className="space-y-1">
                            {blueprint.riskAssessment.mitigation_strategies.map((strategy, idx) => (
                              <div key={idx} className="flex items-start gap-2 p-2 bg-emerald-50 rounded border border-emerald-200">
                                <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-slate-700">{strategy}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Estimates */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Estimated Cost</div>
                    <div className="text-xl font-bold text-blue-900">{blueprint.estimatedCost}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Estimated Runtime</div>
                    <div className="text-xl font-bold text-blue-900">{blueprint.estimatedRuntime}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pre-built Templates */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-4">
          <h4 className="text-sm font-bold text-slate-900 mb-3">Pre-built Agent Templates</h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "Invoice Reconciler", category: "Finance", template: "Create an agent that reconciles invoices from QuickBooks with payment records and sends weekly summaries to the finance team" },
              { name: "CRM Sync Agent", category: "Sales", template: "Build an agent that syncs customer data from HubSpot to our internal database every 6 hours and flags data inconsistencies" },
              { name: "Inventory Monitor", category: "Operations", template: "Design an agent that monitors inventory levels, predicts stockouts, and automatically creates purchase orders when levels are low" },
              { name: "Report Generator", category: "Analytics", template: "Create an agent that generates monthly performance reports from our analytics data and sends them to stakeholders" },
              { name: "Customer Support", category: "Service", template: "Build an agent that triages support tickets, categorizes them by priority, and routes to appropriate teams" },
              { name: "Data Pipeline", category: "Engineering", template: "Design an agent that extracts data from multiple sources, transforms it, and loads it into our data warehouse daily" }
            ].map((template, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="flex flex-col items-start h-auto py-3 hover:bg-purple-50 hover:border-purple-300 transition-all"
                onClick={() => {
                  setPrompt(template.template);
                  toast.info(`Template loaded: ${template.name}`);
                }}
                disabled={building}
              >
                <span className="text-sm font-semibold text-slate-900">{template.name}</span>
                <Badge className="mt-1 bg-slate-100 text-slate-600 text-xs">{template.category}</Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}