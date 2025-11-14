
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Plus, Database, Zap, Shield, Play, Save, Copy, Loader2, CheckCircle, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AgentBuilder() {
  const [prompt, setPrompt] = useState("");
  const [blueprint, setBlueprint] = useState(null);
  const [building, setBuilding] = useState(false);
  const [agentName, setAgentName] = useState("");
  const queryClient = useQueryClient();

  const generateBlueprintMutation = useMutation({
    mutationFn: async (mission) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI agent architect. Based on this mission description, design a complete agent blueprint.

Mission: ${mission}

Generate a detailed blueprint with:
1. Agent name (concise, snake_case format like "invoice_reconciler_v1")
2. Data inputs needed (list 2-4 specific sources)
3. Trigger configurations (when should it run)
4. Recommended AI model (gpt-4o-mini, gpt-4o, or claude-3-haiku)
5. Required safeguards for this use case
6. Expected outputs/actions
7. Cost and runtime estimates

Return ONLY valid JSON matching this schema:
{
  "name": "string (snake_case)",
  "mission": "string",
  "inputs": [{"name": "string", "type": "string", "description": "string"}],
  "triggers": [{"type": "schedule|event|webhook", "config": "string"}],
  "model": {"name": "string", "profile": "cost-balanced|accuracy-focused", "reasoning": "string"},
  "safeguards": [{"name": "string", "enabled": true, "description": "string"}],
  "outputs": [{"name": "string", "action": "string"}],
  "estimatedCost": "string",
  "estimatedRuntime": "string"
}`,
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
                  description: { type: "string" }
                }
              }
            },
            triggers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  config: { type: "string" }
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
            safeguards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  enabled: { type: "boolean" },
                  description: { type: "string" }
                }
              }
            },
            outputs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  action: { type: "string" }
                }
              }
            },
            estimatedCost: { type: "string" },
            estimatedRuntime: { type: "string" }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setBlueprint(data);
      setAgentName(data.name);
      toast.success("Agent blueprint generated!");
    },
    onError: (error) => {
      toast.error("Failed to generate blueprint", {
        description: error.message
      });
    }
  });

  const deployAgentMutation = useMutation({
    mutationFn: async (blueprintData) => {
      // Create an AIMission with the blueprint - status is "armed" so it's ready to execute
      const mission = await base44.entities.AIMission.create({
        name: blueprintData.name,
        version: 1,
        intent: blueprintData.mission,
        status: "armed", // Changed from "draft" to "armed" - ready to execute
        priority: 3,
        risk_score: 0.2,
        simulation_metadata: {
          route: "pilot",
          successRate: 90,
          avgLatency: parseInt(blueprintData.estimatedRuntime?.match(/\d+/)?.[0] || "45") * 1000,
          tokensPerRun: 450,
          spendPerRun: blueprintData.estimatedCost?.match(/\d+\.\d+/)?.[0] || "0.04",
          model: blueprintData.model?.name || "gpt-4o-mini",
          inputs: blueprintData.inputs?.map(i => i.name) || [],
          triggers: blueprintData.triggers?.map(t => t.config) || [],
          safeguards: blueprintData.safeguards?.filter(s => s.enabled).map(s => s.name) || [],
          outputs: blueprintData.outputs?.map(o => o.name) || [],
          confidence: 0.88,
          estimatedImpact: "AI-generated agent ready for execution"
        }
      });
      return mission;
    },
    onSuccess: (mission) => {
      queryClient.invalidateQueries({ queryKey: ['ai-missions'] });
      toast.success("Agent deployed and armed! 🚀", {
        description: `${mission.name} is ready to execute - find it in Management > Orchestration`
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
    
    // Clone blueprint for editing
    setPrompt(blueprint.mission);
    toast.success("Blueprint cloned", {
      description: "Modify and regenerate to create a variant"
    });
  };

  React.useEffect(() => {
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
              <h2 className="text-xl font-bold text-slate-900">Agent Builder</h2>
              <p className="text-sm text-slate-600">Design custom AI teammates by describing their mission</p>
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
                Generating Blueprint...
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
                        <p className="text-xs text-slate-600">{input.description}</p>
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
                        <p className="text-xs text-slate-700">{trigger.config}</p>
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
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900">{guard.name}</div>
                          <div className="text-xs text-slate-600">{guard.description}</div>
                        </div>
                        <Switch checked={guard.enabled} disabled />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

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
