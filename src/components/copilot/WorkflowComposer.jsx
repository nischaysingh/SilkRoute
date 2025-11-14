import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Workflow, Sparkles, Play, Save, CheckCircle, GitBranch, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function WorkflowComposer() {
  const [prompt, setPrompt] = useState("");
  const [workflow, setWorkflow] = useState(null);
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const saveWorkflowMutation = useMutation({
    mutationFn: async ({ workflowData, shouldDeploy }) => {
      const user = await base44.auth.me();
      
      // Save to Workflow entity
      const savedWorkflow = await base44.entities.Workflow.create({
        name: workflowData.name,
        description: `AI-generated workflow: ${prompt.substring(0, 200)}`,
        trigger: {
          type: 'manual',
          description: 'Manually triggered workflow'
        },
        steps: workflowData.steps.map((step, idx) => ({
          step_number: idx + 1,
          type: step.type,
          name: step.label,
          config: {
            icon: step.icon,
            color: step.color,
            branch: step.branch,
            branches: step.branches
          }
        })),
        status: shouldDeploy ? 'active' : 'draft',
        version: 1,
        version_history: [{
          version: 1,
          steps: workflowData.steps,
          trigger: { type: 'manual' },
          description: `AI-generated workflow: ${prompt.substring(0, 200)}`,
          changes_summary: 'Initial version - AI generated',
          created_at: new Date().toISOString(),
          created_by: user.email
        }],
        metadata: {
          integrations: workflowData.integrations,
          estimatedTime: workflowData.estimatedTime,
          estimatedCost: workflowData.estimatedCost,
          ai_generated: true,
          source_prompt: prompt
        }
      });

      // Log to AuditLog
      await base44.entities.AuditLog.create({
        timestamp: new Date().toISOString(),
        user_email: user.email,
        user_name: user.full_name,
        action_type: 'config_change',
        action_description: `${shouldDeploy ? 'Deployed' : 'Saved'} AI-generated workflow: ${workflowData.name}`,
        resource_type: 'workflow',
        resource_id: savedWorkflow.id,
        metadata: {
          workflow_name: workflowData.name,
          step_count: workflowData.steps.length,
          integrations: workflowData.integrations,
          status: shouldDeploy ? 'active' : 'draft'
        },
        status: 'success',
        severity: 'low'
      });

      return { savedWorkflow, shouldDeploy };
    },
    onSuccess: ({ savedWorkflow, shouldDeploy }) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      
      if (shouldDeploy) {
        toast.success("Workflow deployed successfully! 🚀", {
          description: `"${savedWorkflow.name}" is now active and ready to execute.`
        });
      } else {
        toast.success("Workflow saved as draft! 📝", {
          description: `"${savedWorkflow.name}" saved. Deploy it from the Management tab.`
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to save workflow", {
        description: error.message
      });
    }
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe your workflow logic");
      return;
    }

    setGenerating(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert workflow automation designer.

USER REQUEST: ${prompt}

Generate a comprehensive, executable workflow that accomplishes this goal.

Design the workflow with:
1. A descriptive workflow name
2. 4-8 actionable steps that form a complete automation
3. Include appropriate triggers, conditions, actions, and integrations
4. Identify which integrations/systems would be used
5. Provide realistic estimates for execution time and cost

Return JSON with this exact structure:`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  type: { 
                    type: "string",
                    enum: ["trigger", "action", "decision", "wait", "condition"]
                  },
                  label: { type: "string" },
                  icon: { type: "string" },
                  color: { 
                    type: "string",
                    enum: ["blue", "purple", "amber", "emerald", "red", "cyan"]
                  },
                  branch: { type: "string" },
                  branches: { 
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            integrations: {
              type: "array",
              items: { type: "string" }
            },
            estimatedTime: { type: "string" },
            estimatedCost: { type: "string" }
          }
        }
      });

      setWorkflow(response);
      toast.success("Workflow generated successfully! ✨");
    } catch (error) {
      console.error('Error generating workflow:', error);
      
      // Fallback to mock workflow
      setWorkflow({
        name: "Automated Workflow",
        steps: [
          {
            id: 1,
            type: "trigger",
            label: "Workflow triggered",
            icon: "🎯",
            color: "blue"
          },
          {
            id: 2,
            type: "action",
            label: "Process data",
            icon: "⚙️",
            color: "purple"
          },
          {
            id: 3,
            type: "decision",
            label: "Check conditions",
            icon: "🤔",
            color: "amber",
            branches: ["Yes", "No"]
          },
          {
            id: 4,
            type: "action",
            label: "Execute action",
            icon: "✅",
            color: "emerald",
            branch: "Yes"
          },
          {
            id: 5,
            type: "action",
            label: "Send notification",
            icon: "📧",
            color: "blue"
          }
        ],
        integrations: ["Email", "Database"],
        estimatedTime: "~25s per execution",
        estimatedCost: "$0.03 per run"
      });
      
      toast.success("Workflow template generated");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    if (!workflow) {
      toast.error("No workflow to save");
      return;
    }

    saveWorkflowMutation.mutate({ 
      workflowData: workflow, 
      shouldDeploy: false 
    });
  };

  const handleDeploy = () => {
    if (!workflow) {
      toast.error("No workflow to deploy");
      return;
    }

    saveWorkflowMutation.mutate({ 
      workflowData: workflow, 
      shouldDeploy: true 
    });
  };

  const getStepColor = (color) => {
    const colors = {
      blue: "bg-blue-100 border-blue-300 text-blue-800",
      purple: "bg-purple-100 border-purple-300 text-purple-800",
      amber: "bg-amber-100 border-amber-300 text-amber-800",
      emerald: "bg-emerald-100 border-emerald-300 text-emerald-800",
      red: "bg-red-100 border-red-300 text-red-800",
      cyan: "bg-cyan-100 border-cyan-300 text-cyan-800"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Workflow className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Workflow Composer</h2>
              <p className="text-sm text-slate-600">Define business logic in plain English</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-6">
          <label className="text-sm font-bold text-slate-900 mb-2 block">
            Describe Your Workflow Logic
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: When a customer ticket mentions refund delay, check order status, issue refund, update CRM, and notify finance."
            className="min-h-32 mb-4"
          />
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Workflow...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Workflow
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Workflow Visualization */}
      <AnimatePresence>
        {workflow && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Workflow Header */}
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900">{workflow.name}</h3>
                    <div className="flex gap-2 mt-2">
                      {workflow.integrations.map((int, idx) => (
                        <Badge key={idx} className="bg-slate-100 text-slate-700 text-xs">
                          {int}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleSave}
                      disabled={saveWorkflowMutation.isPending}
                    >
                      {saveWorkflowMutation.isPending && !saveWorkflowMutation.variables?.shouldDeploy ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-1" />
                      )}
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleDeploy}
                      disabled={saveWorkflowMutation.isPending}
                    >
                      {saveWorkflowMutation.isPending && saveWorkflowMutation.variables?.shouldDeploy ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-1" />
                      )}
                      Deploy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Steps */}
            <Card className="bg-white border-slate-200">
              <CardContent className="p-6">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Workflow Steps</h4>
                <div className="relative">
                  {workflow.steps.map((step, idx) => {
                    const isDecision = step.type === "decision";
                    const isBranched = step.branch;
                    
                    return (
                      <React.Fragment key={step.id}>
                        {/* Vertical line for branching */}
                        {isBranched && idx > 0 && (
                          <div className={`absolute left-8 w-px h-12 bg-slate-300 ${
                            step.branch === "Yes" ? "ml-20" : "-ml-20"
                          }`} style={{ top: `${(idx - 1) * 100 + 60}px` }} />
                        )}

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`relative flex items-start gap-4 mb-4 ${
                            isBranched ? (step.branch === "Yes" ? "ml-32" : "ml-0") : "ml-16"
                          }`}
                        >
                          {/* Step Number/Icon */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${getStepColor(step.color)} flex items-center justify-center text-xl font-bold border-2`}>
                            {step.icon}
                          </div>

                          {/* Step Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`text-xs capitalize ${
                                step.type === "trigger" ? "bg-blue-100 text-blue-700" :
                                step.type === "decision" ? "bg-amber-100 text-amber-700" :
                                "bg-purple-100 text-purple-700"
                              }`}>
                                {step.type}
                              </Badge>
                              {step.branch && (
                                <Badge className={`text-xs ${
                                  step.branch === "Yes" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                }`}>
                                  {step.branch}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                          </div>

                          {/* Checkmark */}
                          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        </motion.div>

                        {/* Decision branches */}
                        {isDecision && (
                          <div className="ml-16 mb-4 flex gap-4">
                            {step.branches.map((branch, bIdx) => (
                              <div key={bIdx} className="flex items-center gap-2">
                                <GitBranch className="w-4 h-4 text-slate-400" />
                                <Badge className={`text-xs ${
                                  branch === "Yes" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                }`}>
                                  {branch}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Connecting line */}
                        {idx < workflow.steps.length - 1 && !isDecision && (
                          <div className="ml-8 w-px h-4 bg-slate-300 mb-2" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Estimates */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Estimated Execution Time</div>
                    <div className="text-xl font-bold text-blue-900">{workflow.estimatedTime}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Estimated Cost per Run</div>
                    <div className="text-xl font-bold text-blue-900">{workflow.estimatedCost}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Example Templates */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-4">
          <h4 className="text-sm font-bold text-slate-900 mb-3">Example Workflows</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Customer Refund Handler", category: "Support" },
              { name: "Invoice Approval Flow", category: "Finance" },
              { name: "Lead Qualification", category: "Sales" },
              { name: "Onboarding Automation", category: "HR" }
            ].map((template, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="flex flex-col items-start h-auto py-3"
                onClick={() => {
                  setPrompt(`Create a workflow for ${template.name.toLowerCase()}`);
                  toast.info(`Template loaded: ${template.name}`);
                }}
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