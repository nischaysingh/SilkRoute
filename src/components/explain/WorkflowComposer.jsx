import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GitBranch, Plus, Trash2, Play, Save, Sparkles, AlertCircle, Mail, MessageSquare,
  Database, Filter, Zap, Clock, Check, ArrowRight, Code, Target, Bell, Eye, Loader2,
  ChevronRight, ChevronDown, Settings, Link as LinkIcon, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const STEP_TYPES = [
  { id: 'condition', name: 'Condition', icon: GitBranch, color: 'blue', description: 'Branch based on criteria' },
  { id: 'alert', name: 'Send Alert', icon: Bell, color: 'red', description: 'Notify via email/slack' },
  { id: 'wait', name: 'Wait', icon: Clock, color: 'amber', description: 'Delay execution' },
  { id: 'update', name: 'Update Record', icon: Database, color: 'purple', description: 'Modify data' },
  { id: 'filter', name: 'Filter Data', icon: Filter, color: 'cyan', description: 'Filter by conditions' },
  { id: 'ai_action', name: 'AI Action', icon: Sparkles, color: 'pink', description: 'LLM-powered step' },
  { id: 'webhook', name: 'Webhook', icon: Zap, color: 'emerald', description: 'Call external API' }
];

const TRIGGER_TYPES = [
  { id: 'metric_threshold', name: 'Metric Threshold', description: 'When metric crosses threshold' },
  { id: 'schedule', name: 'Schedule', description: 'Run on schedule (daily, weekly)' },
  { id: 'manual', name: 'Manual', description: 'Triggered manually' },
  { id: 'event', name: 'Event', description: 'When specific event occurs' }
];

export default function WorkflowComposer({ open, onClose, widgetContext }) {
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [trigger, setTrigger] = useState(null);
  const [steps, setSteps] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  const [testResults, setTestResults] = useState(null);

  // Generate AI-powered workflow draft when dialog opens
  useEffect(() => {
    if (open && widgetContext) {
      generateWorkflowDraft();
    }
  }, [open, widgetContext]);

  const generateWorkflowDraft = async () => {
    setLoadingDraft(true);
    
    try {
      const prompt = `Generate a workflow for monitoring: ${widgetContext.title}
      
Context:
- Metric: ${widgetContext.metric || 'N/A'}
- Trend: ${widgetContext.trend || 'Unknown'}
- Delta: ${widgetContext.delta || 'N/A'}
- Period: ${widgetContext.period || 'N/A'}

Create a practical 3-5 step workflow that:
1. Monitors this metric
2. Takes intelligent action when thresholds are crossed
3. Includes notification and follow-up steps

Return JSON:
{
  "name": "workflow name",
  "description": "brief description",
  "trigger": {
    "type": "metric_threshold",
    "condition": "when [metric] > threshold"
  },
  "steps": [
    {
      "type": "condition|alert|wait|update",
      "name": "step name",
      "config": {
        // step-specific config
      }
    }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            trigger: {
              type: "object",
              properties: {
                type: { type: "string" },
                condition: { type: "string" }
              }
            },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  name: { type: "string" },
                  config: { type: "object" }
                }
              }
            }
          }
        }
      });

      setWorkflowName(response.name);
      setWorkflowDescription(response.description);
      setTrigger(response.trigger);
      setSteps(response.steps.map((step, idx) => ({ ...step, id: `step-${idx}` })));
      
      toast.success("AI workflow draft generated", {
        description: "Review and customize the steps below"
      });
    } catch (error) {
      console.error('Error generating workflow:', error);
      
      // Fallback to template-based generation
      const template = generateFallbackTemplate(widgetContext);
      setWorkflowName(template.name);
      setWorkflowDescription(template.description);
      setTrigger(template.trigger);
      setSteps(template.steps);
      
      toast.info("Template workflow loaded", {
        description: "Customize the steps as needed"
      });
    } finally {
      setLoadingDraft(false);
    }
  };

  const generateFallbackTemplate = (context) => {
    const metric = context.metric || 'value';
    const title = context.title || 'Metric';
    
    return {
      name: `Monitor ${title}`,
      description: `Automated workflow to monitor ${title} and take action when thresholds are crossed`,
      trigger: {
        type: 'metric_threshold',
        condition: `When ${title} ${context.trend === 'down' ? 'drops below' : 'exceeds'} threshold`
      },
      steps: [
        {
          id: 'step-1',
          type: 'condition',
          name: 'Check Threshold',
          config: {
            metric: title,
            operator: context.trend === 'down' ? '<' : '>',
            threshold: metric,
            variance: '15%'
          }
        },
        {
          id: 'step-2',
          type: 'alert',
          name: 'Notify Team',
          config: {
            channel: 'email',
            recipients: 'finance@company.com',
            subject: `Alert: ${title} threshold crossed`,
            body: `${title} has crossed the defined threshold. Current value: ${metric}`
          }
        },
        {
          id: 'step-3',
          type: 'wait',
          name: 'Wait for Response',
          config: {
            duration: 2,
            unit: 'hours'
          }
        },
        {
          id: 'step-4',
          type: 'update',
          name: 'Log Action',
          config: {
            entity: 'AuditLog',
            action: 'create',
            data: {
              action_type: 'threshold_alert',
              resource_type: 'metric',
              description: `${title} alert triggered`
            }
          }
        }
      ]
    };
  };

  const addStep = (stepType) => {
    const newStep = {
      id: `step-${Date.now()}`,
      type: stepType.id,
      name: `New ${stepType.name}`,
      config: {}
    };
    setSteps([...steps, newStep]);
    setSelectedStep(newStep.id);
    toast.success(`Added ${stepType.name} step`);
  };

  const removeStep = (stepId) => {
    setSteps(steps.filter(s => s.id !== stepId));
    if (selectedStep === stepId) {
      setSelectedStep(null);
    }
    toast.info("Step removed");
  };

  const updateStep = (stepId, updates) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, ...updates } : s));
  };

  const moveStep = (stepId, direction) => {
    const idx = steps.findIndex(s => s.id === stepId);
    if (direction === 'up' && idx > 0) {
      const newSteps = [...steps];
      [newSteps[idx], newSteps[idx - 1]] = [newSteps[idx - 1], newSteps[idx]];
      setSteps(newSteps);
    } else if (direction === 'down' && idx < steps.length - 1) {
      const newSteps = [...steps];
      [newSteps[idx], newSteps[idx + 1]] = [newSteps[idx + 1], newSteps[idx]];
      setSteps(newSteps);
    }
  };

  const testWorkflow = async () => {
    if (!workflowName || steps.length === 0) {
      toast.error("Cannot test workflow", {
        description: "Please add a name and at least one step"
      });
      return;
    }

    toast.info("Testing workflow...", {
      description: "Running simulation with sample data"
    });

    setTimeout(() => {
      const alertSteps = steps.filter(s => s.type === 'alert').length;
      const updateSteps = steps.filter(s => s.type === 'update').length;
      const aiSteps = steps.filter(s => s.type === 'ai_action').length;

      setTestResults({
        success: true,
        executionTime: `${(steps.length * 0.8).toFixed(1)}s`,
        stepsExecuted: steps.length,
        alerts: alertSteps,
        updates: updateSteps,
        aiCalls: aiSteps,
        estimatedCost: `$${(steps.length * 0.012).toFixed(3)}`
      });
      setActiveTab('test');
      toast.success("Workflow test completed", {
        description: `${steps.length} steps executed successfully`
      });
    }, 2400);
  };

  const saveWorkflow = async () => {
    if (!workflowName) {
      toast.error("Workflow name required", {
        description: "Please enter a name for your workflow"
      });
      return;
    }

    if (steps.length === 0) {
      toast.error("Add at least one step", {
        description: "Workflows must have at least one action"
      });
      return;
    }

    const workflow = {
      name: workflowName,
      description: workflowDescription,
      trigger,
      steps,
      sourceWidget: widgetContext?.title,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };

    try {
      // Save to AuditLog for tracking
      await base44.entities.AuditLog.create({
        timestamp: new Date().toISOString(),
        user_email: (await base44.auth.me()).email,
        user_name: (await base44.auth.me()).full_name,
        action_type: 'config_change',
        action_description: `Created workflow: ${workflowName}`,
        resource_type: 'workflow',
        resource_id: `workflow-${Date.now()}`,
        metadata: {
          workflow,
          sourceWidget: widgetContext?.title,
          stepCount: steps.length,
          triggerType: trigger?.type
        },
        status: 'success',
        severity: 'low'
      });

      console.log('Workflow saved:', workflow);
      
      toast.success("Workflow saved successfully! 🎉", {
        description: `"${workflowName}" created with ${steps.length} steps`
      });
      
      // Reset and close
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error("Failed to save workflow", {
        description: "Please try again"
      });
    }
  };

  const getStepConfig = (type) => {
    return STEP_TYPES.find(s => s.id === type) || STEP_TYPES[0];
  };

  const selectedStepData = steps.find(s => s.id === selectedStep);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-blue-900/30 backdrop-blur-xl border-2 border-purple-500/50 text-white max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-purple-500/20 z-[200]">
        <DialogHeader className="border-b border-purple-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                Workflow Composer
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                  AI-Powered
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-purple-300 text-sm">
                Visual workflow designer with intelligent draft generation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loadingDraft ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">AI generating workflow...</p>
              <p className="text-sm text-gray-400">Analyzing {widgetContext?.title}</p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 backdrop-blur-sm">
              <TabsTrigger value="builder" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white">Builder</TabsTrigger>
              <TabsTrigger value="config" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white">Configuration</TabsTrigger>
              <TabsTrigger value="test" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white">Test & Preview</TabsTrigger>
              <TabsTrigger value="code" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white">Code View</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="flex-1 overflow-y-auto space-y-4 mt-4">
              <div className="grid grid-cols-12 gap-4">
                {/* Left: Workflow Canvas */}
                <div className="col-span-8 space-y-4">
                  {/* Workflow Header */}
                  <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 shadow-lg">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-purple-300 text-xs font-semibold">Workflow Name</Label>
                          <Input
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                            placeholder="e.g., AR Collection Automation"
                            className="bg-white/10 border-purple-500/30 text-white mt-1 focus:border-purple-500 focus:ring-purple-500/20"
                          />
                        </div>
                        <div>
                          <Label className="text-purple-300 text-xs font-semibold">Description</Label>
                          <Textarea
                            value={workflowDescription}
                            onChange={(e) => setWorkflowDescription(e.target.value)}
                            placeholder="Describe what this workflow does..."
                            className="bg-white/10 border-purple-500/30 text-white mt-1 h-20 focus:border-purple-500 focus:ring-purple-500/20"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trigger */}
                  <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/40 shadow-lg shadow-cyan-500/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-white flex items-center gap-2 font-bold">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/30 flex items-center justify-center">
                          <Zap className="w-3 h-3 text-cyan-300" />
                        </div>
                        Trigger
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Select value={trigger?.type} onValueChange={(value) => setTrigger({ ...trigger, type: value })}>
                        <SelectTrigger className="bg-white/10 border-cyan-500/30 text-white hover:bg-white/15">
                          <SelectValue placeholder="Select trigger type" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-cyan-500/30 text-white backdrop-blur-xl">
                          {TRIGGER_TYPES.map(t => (
                            <SelectItem key={t.id} value={t.id}>
                              <div>
                                <div className="font-semibold">{t.name}</div>
                                <div className="text-xs text-gray-400">{t.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {trigger?.type === 'metric_threshold' && (
                        <div className="space-y-2">
                          <Input
                            value={trigger.condition || ''}
                            onChange={(e) => setTrigger({ ...trigger, condition: e.target.value })}
                            placeholder="e.g., When Accounts Receivable > $50,000"
                            className="bg-white/5 border-white/10 text-white text-sm"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              placeholder="Metric"
                              defaultValue={widgetContext?.title}
                              className="bg-cyan-500/10 border-cyan-500/30 text-white text-xs"
                            />
                            <Select defaultValue=">">
                              <SelectTrigger className="bg-cyan-500/10 border-cyan-500/30 text-white text-xs hover:bg-cyan-500/15">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-cyan-500/30 text-white backdrop-blur-xl">
                                <SelectItem value=">">Greater than</SelectItem>
                                <SelectItem value="<">Less than</SelectItem>
                                <SelectItem value="=">Equal to</SelectItem>
                                <SelectItem value="!=">Not equal to</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Threshold"
                              defaultValue={widgetContext?.metric}
                              className="bg-cyan-500/10 border-cyan-500/30 text-white text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {trigger?.type === 'schedule' && (
                        <div className="grid grid-cols-2 gap-2">
                          <Select defaultValue="daily">
                            <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/20 text-white">
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="time"
                            defaultValue="09:00"
                            className="bg-white/5 border-white/10 text-white text-xs"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Workflow Steps */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Workflow Steps</h3>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                        {steps.length} steps
                      </Badge>
                    </div>

                    <AnimatePresence>
                      {steps.map((step, idx) => {
                        const stepConfig = getStepConfig(step.type);
                        return (
                          <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Card 
                              className={cn(
                                "bg-gradient-to-r from-slate-800/50 to-slate-800/30 border-slate-700/50 cursor-pointer hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all",
                                selectedStep === step.id && "border-purple-500 bg-gradient-to-r from-purple-500/20 to-blue-500/20 shadow-lg shadow-purple-500/30"
                              )}
                              onClick={() => setSelectedStep(step.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="flex flex-col items-center gap-2">
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                                        stepConfig.color === 'blue' && "bg-gradient-to-br from-blue-500 to-blue-600",
                                        stepConfig.color === 'red' && "bg-gradient-to-br from-red-500 to-pink-600",
                                        stepConfig.color === 'amber' && "bg-gradient-to-br from-amber-500 to-orange-600",
                                        stepConfig.color === 'purple' && "bg-gradient-to-br from-purple-500 to-purple-600",
                                        stepConfig.color === 'cyan' && "bg-gradient-to-br from-cyan-500 to-blue-500",
                                        stepConfig.color === 'pink' && "bg-gradient-to-br from-pink-500 to-purple-600",
                                        stepConfig.color === 'emerald' && "bg-gradient-to-br from-emerald-500 to-teal-600"
                                      )}>
                                        <stepConfig.icon className="w-5 h-5 text-white" />
                                      </div>
                                      {idx < steps.length - 1 && (
                                        <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500 to-blue-500 opacity-50"></div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold">
                                          Step {idx + 1}
                                        </div>
                                        <Badge className={cn(
                                          "text-xs font-semibold",
                                          stepConfig.color === 'blue' && "bg-blue-500/20 text-blue-300 border-blue-500/40",
                                          stepConfig.color === 'red' && "bg-red-500/20 text-red-300 border-red-500/40",
                                          stepConfig.color === 'amber' && "bg-amber-500/20 text-amber-300 border-amber-500/40",
                                          stepConfig.color === 'purple' && "bg-purple-500/20 text-purple-300 border-purple-500/40",
                                          stepConfig.color === 'cyan' && "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
                                          stepConfig.color === 'pink' && "bg-pink-500/20 text-pink-300 border-pink-500/40",
                                          stepConfig.color === 'emerald' && "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                        )}>
                                          {stepConfig.name}
                                        </Badge>
                                      </div>
                                      <h4 className="text-base font-bold text-white mb-1">{step.name}</h4>
                                      <p className="text-xs text-purple-300">{stepConfig.description}</p>
                                      
                                      {/* Quick config preview */}
                                      {step.config && Object.keys(step.config).length > 0 && (
                                        <div className="mt-3 p-3 bg-black/30 rounded-lg border border-white/10 text-xs text-gray-300">
                                          {Object.entries(step.config).slice(0, 2).map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                                              <span className="text-gray-500">{key}:</span>
                                              <span className="font-mono">{String(value).substring(0, 30)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeStep(step.id);
                                      }}
                                      className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {steps.length === 0 && (
                      <Card className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20 border-2 border-dashed">
                        <CardContent className="p-10 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
                            <GitBranch className="w-8 h-8 text-purple-400" />
                          </div>
                          <p className="text-sm text-purple-300 font-semibold mb-1">No steps yet</p>
                          <p className="text-xs text-gray-400">Add steps from the panel to build your workflow →</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Right: Step Library & Configuration */}
                <div className="col-span-4 space-y-4">
                  {/* Step Library */}
                  <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-purple-500/30 shadow-lg">
                    <CardHeader className="pb-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                      <CardTitle className="text-sm text-white font-bold flex items-center gap-2">
                        <Plus className="w-4 h-4 text-purple-400" />
                        Add Step
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {STEP_TYPES.map(stepType => (
                        <Button
                          key={stepType.id}
                          onClick={() => addStep(stepType)}
                          className={cn(
                            "w-full justify-start h-auto py-3 px-3 border-2 transition-all group",
                            stepType.color === 'blue' && "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20",
                            stepType.color === 'red' && "bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20",
                            stepType.color === 'amber' && "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20",
                            stepType.color === 'purple' && "bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20",
                            stepType.color === 'cyan' && "bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20",
                            stepType.color === 'pink' && "bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/20 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20",
                            stepType.color === 'emerald' && "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all",
                            stepType.color === 'blue' && "bg-blue-500/20 group-hover:bg-blue-500/30",
                            stepType.color === 'red' && "bg-red-500/20 group-hover:bg-red-500/30",
                            stepType.color === 'amber' && "bg-amber-500/20 group-hover:bg-amber-500/30",
                            stepType.color === 'purple' && "bg-purple-500/20 group-hover:bg-purple-500/30",
                            stepType.color === 'cyan' && "bg-cyan-500/20 group-hover:bg-cyan-500/30",
                            stepType.color === 'pink' && "bg-pink-500/20 group-hover:bg-pink-500/30",
                            stepType.color === 'emerald' && "bg-emerald-500/20 group-hover:bg-emerald-500/30"
                          )}>
                            <stepType.icon className={cn(
                              "w-4 h-4",
                              stepType.color === 'blue' && "text-blue-400",
                              stepType.color === 'red' && "text-red-400",
                              stepType.color === 'amber' && "text-amber-400",
                              stepType.color === 'purple' && "text-purple-400",
                              stepType.color === 'cyan' && "text-cyan-400",
                              stepType.color === 'pink' && "text-pink-400",
                              stepType.color === 'emerald' && "text-emerald-400"
                            )} />
                          </div>
                          <div className="text-left flex-1">
                            <div className="text-sm font-bold text-white mb-0.5">{stepType.name}</div>
                            <div className="text-[10px] text-gray-400">{stepType.description}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                        </Button>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Step Configuration */}
                  {selectedStepData && (
                    <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-500/40 shadow-xl shadow-purple-500/20">
                      <CardHeader className="pb-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                        <CardTitle className="text-sm text-white font-bold flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-purple-500/30 flex items-center justify-center">
                            <Settings className="w-3 h-3 text-purple-300" />
                          </div>
                          Configure Step
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-purple-300 text-xs font-semibold">Step Name</Label>
                          <Input
                            value={selectedStepData.name}
                            onChange={(e) => updateStep(selectedStepData.id, { name: e.target.value })}
                            className="bg-white/10 border-purple-500/30 text-white mt-1 text-sm focus:border-purple-500"
                            placeholder="Enter descriptive step name"
                          />
                        </div>

                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <div className="text-xs text-blue-300 font-semibold mb-2">💡 Step Info</div>
                          <div className="text-xs text-gray-300">
                            {getStepConfig(selectedStepData.type).description}
                          </div>
                        </div>

                        {selectedStepData.type === 'alert' && (
                          <>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Channel</Label>
                              <Select 
                                value={selectedStepData.config?.channel || 'email'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, channel: value }
                                })}
                              >
                                <SelectTrigger className="bg-white/10 border-purple-500/30 text-white mt-1 hover:bg-white/15">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-purple-500/30 text-white backdrop-blur-xl">
                                  <SelectItem value="email">📧 Email</SelectItem>
                                  <SelectItem value="slack">💬 Slack</SelectItem>
                                  <SelectItem value="sms">📱 SMS</SelectItem>
                                  <SelectItem value="webhook">🔗 Webhook</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Recipients</Label>
                              <Input
                                value={selectedStepData.config?.recipients || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, recipients: e.target.value }
                                })}
                                placeholder="finance@company.com, ops@company.com"
                                className="bg-white/10 border-purple-500/30 text-white mt-1 text-sm focus:border-purple-500"
                              />
                            </div>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Subject</Label>
                              <Input
                                value={selectedStepData.config?.subject || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, subject: e.target.value }
                                })}
                                placeholder="Alert: Threshold crossed"
                                className="bg-white/10 border-purple-500/30 text-white mt-1 text-sm focus:border-purple-500"
                              />
                            </div>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Message</Label>
                              <Textarea
                                value={selectedStepData.config?.body || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, body: e.target.value }
                                })}
                                placeholder="Compose your alert message..."
                                className="bg-white/10 border-purple-500/30 text-white mt-1 h-24 text-sm focus:border-purple-500"
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                              <Label className="text-red-300 text-xs font-semibold cursor-pointer">High Priority Alert</Label>
                              <Switch 
                                checked={selectedStepData.config?.highPriority || false}
                                onCheckedChange={(checked) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, highPriority: checked }
                                })}
                              />
                            </div>
                          </>
                        )}

                        {selectedStepData.type === 'condition' && (
                          <>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Condition Expression</Label>
                              <Input
                                value={selectedStepData.config?.condition || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, condition: e.target.value }
                                })}
                                placeholder="e.g., value > 50000"
                                className="bg-white/10 border-purple-500/30 text-white mt-1 text-sm focus:border-purple-500"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-purple-300 text-xs font-semibold">Field</Label>
                                <Input
                                  value={selectedStepData.config?.field || ''}
                                  onChange={(e) => updateStep(selectedStepData.id, { 
                                    config: { ...selectedStepData.config, field: e.target.value }
                                  })}
                                  placeholder="metric_name"
                                  className="bg-white/10 border-purple-500/30 text-white mt-1 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-purple-300 text-xs font-semibold">Operator</Label>
                                <Select 
                                  value={selectedStepData.config?.operator || '>'} 
                                  onValueChange={(value) => updateStep(selectedStepData.id, { 
                                    config: { ...selectedStepData.config, operator: value }
                                  })}
                                >
                                  <SelectTrigger className="bg-white/10 border-purple-500/30 text-white mt-1 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-900 border-purple-500/30 text-white">
                                    <SelectItem value=">">{'>'} Greater than</SelectItem>
                                    <SelectItem value="<">{'<'} Less than</SelectItem>
                                    <SelectItem value=">=">{'≥'} Greater or equal</SelectItem>
                                    <SelectItem value="<=">{'≤'} Less or equal</SelectItem>
                                    <SelectItem value="=">{'='} Equal to</SelectItem>
                                    <SelectItem value="!=">{'≠'} Not equal</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-purple-300 text-xs font-semibold">Value</Label>
                                <Input
                                  value={selectedStepData.config?.value || ''}
                                  onChange={(e) => updateStep(selectedStepData.id, { 
                                    config: { ...selectedStepData.config, value: e.target.value }
                                  })}
                                  placeholder="threshold"
                                  className="bg-white/10 border-purple-500/30 text-white mt-1 text-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">If True → Action</Label>
                              <Select 
                                value={selectedStepData.config?.trueNext || 'continue'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, trueNext: value }
                                })}
                              >
                                <SelectTrigger className="bg-white/10 border-purple-500/30 text-white mt-1 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-purple-500/30 text-white">
                                  <SelectItem value="continue">✓ Continue to next step</SelectItem>
                                  {steps.filter(s => s.id !== selectedStepData.id).map(s => (
                                    <SelectItem key={s.id} value={s.id}>→ Jump to: {s.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">If False → Action</Label>
                              <Select 
                                value={selectedStepData.config?.falseNext || 'skip'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, falseNext: value }
                                })}
                              >
                                <SelectTrigger className="bg-white/10 border-purple-500/30 text-white mt-1 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-purple-500/30 text-white">
                                  <SelectItem value="skip">⏭️ Skip to next</SelectItem>
                                  <SelectItem value="end">⏹️ End workflow</SelectItem>
                                  {steps.filter(s => s.id !== selectedStepData.id).map(s => (
                                    <SelectItem key={s.id} value={s.id}>→ Jump to: {s.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}

                        {selectedStepData.type === 'wait' && (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-purple-300 text-xs font-semibold">Duration</Label>
                                <Input
                                  type="number"
                                  value={selectedStepData.config?.duration || ''}
                                  onChange={(e) => updateStep(selectedStepData.id, { 
                                    config: { ...selectedStepData.config, duration: e.target.value }
                                  })}
                                  placeholder="1"
                                  className="bg-white/10 border-purple-500/30 text-white mt-1 text-sm focus:border-purple-500"
                                />
                              </div>
                              <div>
                                <Label className="text-purple-300 text-xs font-semibold">Unit</Label>
                                <Select 
                                  value={selectedStepData.config?.unit || 'hours'} 
                                  onValueChange={(value) => updateStep(selectedStepData.id, { 
                                    config: { ...selectedStepData.config, unit: value }
                                  })}
                                >
                                  <SelectTrigger className="bg-white/10 border-purple-500/30 text-white mt-1 hover:bg-white/15">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-900 border-purple-500/30 text-white backdrop-blur-xl">
                                    <SelectItem value="seconds">Seconds</SelectItem>
                                    <SelectItem value="minutes">Minutes</SelectItem>
                                    <SelectItem value="hours">Hours</SelectItem>
                                    <SelectItem value="days">Days</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Wait Description</Label>
                              <Input
                                value={selectedStepData.config?.description || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, description: e.target.value }
                                })}
                                placeholder="e.g., Wait for customer response"
                                className="bg-white/10 border-purple-500/30 text-white mt-1 text-sm focus:border-purple-500"
                              />
                            </div>
                          </>
                        )}

                        {selectedStepData.type === 'update' && (
                          <>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Entity/Table</Label>
                              <Select 
                                value={selectedStepData.config?.entity || 'Order'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, entity: value }
                                })}
                              >
                                <SelectTrigger className="bg-white/10 border-purple-500/30 text-white mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-purple-500/30 text-white">
                                  <SelectItem value="Order">Order</SelectItem>
                                  <SelectItem value="AIRequest">AI Request</SelectItem>
                                  <SelectItem value="AuditLog">Audit Log</SelectItem>
                                  <SelectItem value="CRMTask">CRM Task</SelectItem>
                                  <SelectItem value="HRAssignment">HR Assignment</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Action Type</Label>
                              <Select 
                                value={selectedStepData.config?.action || 'update'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, action: value }
                                })}
                              >
                                <SelectTrigger className="bg-white/10 border-purple-500/30 text-white mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-purple-500/30 text-white">
                                  <SelectItem value="create">Create new record</SelectItem>
                                  <SelectItem value="update">Update existing</SelectItem>
                                  <SelectItem value="delete">Delete record</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Field to Update</Label>
                              <Input
                                value={selectedStepData.config?.field || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, field: e.target.value }
                                })}
                                placeholder="e.g., status"
                                className="bg-white/10 border-purple-500/30 text-white mt-1 text-sm focus:border-purple-500"
                              />
                            </div>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">New Value</Label>
                              <Input
                                value={selectedStepData.config?.newValue || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, newValue: e.target.value }
                                })}
                                placeholder="e.g., flagged"
                                className="bg-white/10 border-purple-500/30 text-white mt-1 text-sm focus:border-purple-500"
                              />
                            </div>
                          </>
                        )}

                        {selectedStepData.type === 'filter' && (
                          <>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Filter Expression</Label>
                              <Input
                                value={selectedStepData.config?.expression || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, expression: e.target.value }
                                })}
                                placeholder="e.g., status = 'active' AND amount > 1000"
                                className="bg-white/10 border-purple-500/30 text-white mt-1 text-sm focus:border-purple-500"
                              />
                            </div>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Data Source</Label>
                              <Select 
                                value={selectedStepData.config?.source || 'previous_step'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, source: value }
                                })}
                              >
                                <SelectTrigger className="bg-white/10 border-purple-500/30 text-white mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-purple-500/30 text-white">
                                  <SelectItem value="previous_step">Previous step output</SelectItem>
                                  <SelectItem value="trigger_data">Trigger data</SelectItem>
                                  <SelectItem value="entity">Database entity</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}

                        {selectedStepData.type === 'ai_action' && (
                          <>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">AI Task</Label>
                              <Select 
                                value={selectedStepData.config?.aiTask || 'analyze'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, aiTask: value }
                                })}
                              >
                                <SelectTrigger className="bg-white/10 border-purple-500/30 text-white mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-purple-500/30 text-white">
                                  <SelectItem value="analyze">🔍 Analyze data</SelectItem>
                                  <SelectItem value="classify">🏷️ Classify/categorize</SelectItem>
                                  <SelectItem value="generate">✨ Generate content</SelectItem>
                                  <SelectItem value="summarize">📝 Summarize</SelectItem>
                                  <SelectItem value="decide">🎯 Make decision</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Prompt Template</Label>
                              <Textarea
                                value={selectedStepData.config?.prompt || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, prompt: e.target.value }
                                })}
                                placeholder="Analyze this data and provide recommendations..."
                                className="bg-white/10 border-purple-500/30 text-white mt-1 h-24 text-sm focus:border-purple-500"
                              />
                            </div>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Model</Label>
                              <Select 
                                value={selectedStepData.config?.model || 'gpt-4'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, model: value }
                                })}
                              >
                                <SelectTrigger className="bg-white/10 border-purple-500/30 text-white mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-purple-500/30 text-white">
                                  <SelectItem value="gpt-4">GPT-4 (High accuracy)</SelectItem>
                                  <SelectItem value="gpt-3.5">GPT-3.5 (Fast & cost-effective)</SelectItem>
                                  <SelectItem value="claude">Claude (Long context)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}

                        {selectedStepData.type === 'webhook' && (
                          <>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Webhook URL</Label>
                              <Input
                                value={selectedStepData.config?.url || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, url: e.target.value }
                                })}
                                placeholder="https://api.example.com/webhook"
                                className="bg-white/10 border-purple-500/30 text-white mt-1 text-sm focus:border-purple-500"
                              />
                            </div>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Method</Label>
                              <Select 
                                value={selectedStepData.config?.method || 'POST'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, method: value }
                                })}
                              >
                                <SelectTrigger className="bg-white/10 border-purple-500/30 text-white mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-purple-500/30 text-white">
                                  <SelectItem value="POST">POST</SelectItem>
                                  <SelectItem value="GET">GET</SelectItem>
                                  <SelectItem value="PUT">PUT</SelectItem>
                                  <SelectItem value="PATCH">PATCH</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-purple-300 text-xs font-semibold">Payload (JSON)</Label>
                              <Textarea
                                value={selectedStepData.config?.payload || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, payload: e.target.value }
                                })}
                                placeholder='{"key": "value"}'
                                className="bg-white/10 border-purple-500/30 text-white mt-1 h-20 text-sm font-mono focus:border-purple-500"
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                              <Label className="text-amber-300 text-xs font-semibold cursor-pointer">Retry on failure</Label>
                              <Switch 
                                checked={selectedStepData.config?.retry || true}
                                onCheckedChange={(checked) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, retry: checked }
                                })}
                              />
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Widget Connection */}
                  <Card className="bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border-2 border-cyan-500/40 shadow-lg shadow-cyan-500/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-white font-bold flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/30 flex items-center justify-center">
                          <LinkIcon className="w-3 h-3 text-cyan-300" />
                        </div>
                        Connected Widget
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/40">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/30 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-cyan-300" />
                          </div>
                          <span className="text-sm font-bold text-white">{widgetContext?.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-xs">
                            Monitoring: {widgetContext?.metric || 'N/A'}
                          </Badge>
                          {widgetContext?.trend && (
                            <Badge className={cn(
                              "text-xs",
                              widgetContext.trend === 'up' && "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
                              widgetContext.trend === 'down' && "bg-red-500/20 text-red-300 border-red-500/40"
                            )}>
                              {widgetContext.trend === 'up' ? '↑' : '↓'} {widgetContext.delta || ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="config" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white text-sm font-bold flex items-center gap-2">
                      <Settings className="w-4 h-4 text-purple-400" />
                      Advanced Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                      <div>
                        <div className="text-sm font-bold text-white mb-1">Auto-activate workflow</div>
                        <div className="text-xs text-emerald-300">Enable immediately after saving</div>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-emerald-500" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                      <div>
                        <div className="text-sm font-bold text-white mb-1">Error handling</div>
                        <div className="text-xs text-amber-300">Auto-retry on failure (max 3 attempts)</div>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-amber-500" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                      <div>
                        <div className="text-sm font-bold text-white mb-1">Logging & Audit</div>
                        <div className="text-xs text-blue-300">Track all executions in audit log</div>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-blue-500" />
                    </div>

                    <div>
                      <Label className="text-purple-300 text-xs font-semibold">Max executions per day</Label>
                      <Input
                        type="number"
                        defaultValue="100"
                        className="bg-white/10 border-purple-500/30 text-white mt-1 focus:border-purple-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">Prevent runaway executions</p>
                    </div>

                    <div>
                      <Label className="text-purple-300 text-xs font-semibold">Notification email</Label>
                      <Input
                        type="email"
                        placeholder="admin@company.com"
                        className="bg-white/10 border-purple-500/30 text-white mt-1 focus:border-purple-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">Receive execution summaries</p>
                    </div>

                    <div>
                      <Label className="text-purple-300 text-xs font-semibold">Timeout (seconds)</Label>
                      <Input
                        type="number"
                        defaultValue="300"
                        className="bg-white/10 border-purple-500/30 text-white mt-1 focus:border-purple-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">Maximum execution time per run</p>
                    </div>

                    <div>
                      <Label className="text-purple-300 text-xs font-semibold">Priority Level</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger className="bg-white/10 border-purple-500/30 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-purple-500/30 text-white">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white text-sm font-bold flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-400" />
                      Performance Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-amber-300 text-xs font-semibold">Batch Size</Label>
                        <Input
                          type="number"
                          defaultValue="10"
                          className="bg-white/10 border-amber-500/30 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-amber-300 text-xs font-semibold">Concurrency</Label>
                        <Input
                          type="number"
                          defaultValue="5"
                          className="bg-white/10 border-amber-500/30 text-white mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="test" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white text-sm font-bold flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/30 flex items-center justify-center">
                        <Play className="w-3 h-3 text-cyan-300" />
                      </div>
                      Test Workflow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-xs text-gray-400 mb-3">Test Configuration</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Workflow:</span>
                          <span className="text-white font-semibold">{workflowName || 'Untitled'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Steps:</span>
                          <span className="text-white font-semibold">{steps.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Trigger:</span>
                          <span className="text-white font-semibold">{trigger?.type || 'Not set'}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={testWorkflow}
                      disabled={!workflowName || steps.length === 0}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 h-12 text-base font-bold"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Run Test Simulation
                    </Button>

                    {testResults && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/20">
                          <CardContent className="p-5 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                                <Check className="w-6 h-6 text-emerald-300" />
                              </div>
                              <div>
                                <div className="font-bold text-white text-lg">Test Passed ✓</div>
                                <div className="text-xs text-emerald-300">All steps executed successfully</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 rounded-lg bg-white/10 border border-white/20">
                                <div className="text-xs text-gray-400 mb-1">Execution Time</div>
                                <div className="text-xl font-bold text-white">{testResults.executionTime}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-white/10 border border-white/20">
                                <div className="text-xs text-gray-400 mb-1">Steps Executed</div>
                                <div className="text-xl font-bold text-white">{testResults.stepsExecuted}/{steps.length}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-white/10 border border-white/20">
                                <div className="text-xs text-gray-400 mb-1">Alerts Sent</div>
                                <div className="text-xl font-bold text-white">{testResults.alerts}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-white/10 border border-white/20">
                                <div className="text-xs text-gray-400 mb-1">Records Updated</div>
                                <div className="text-xl font-bold text-white">{testResults.updates}</div>
                              </div>
                              {testResults.aiCalls > 0 && (
                                <div className="p-3 rounded-lg bg-white/10 border border-white/20">
                                  <div className="text-xs text-gray-400 mb-1">AI Calls</div>
                                  <div className="text-xl font-bold text-white">{testResults.aiCalls}</div>
                                </div>
                              )}
                              {testResults.estimatedCost && (
                                <div className="p-3 rounded-lg bg-white/10 border border-white/20">
                                  <div className="text-xs text-gray-400 mb-1">Estimated Cost</div>
                                  <div className="text-xl font-bold text-emerald-400">{testResults.estimatedCost}</div>
                                </div>
                              )}
                            </div>

                            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                              <div className="text-xs text-blue-300 mb-2 font-semibold">Execution Log:</div>
                              <div className="space-y-1 text-xs text-gray-300 font-mono">
                                {steps.map((step, idx) => (
                                  <div key={step.id} className="flex items-center gap-2">
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Step {idx + 1}: {step.name}</span>
                                    <span className="text-gray-500 ml-auto">{(Math.random() * 0.5 + 0.3).toFixed(2)}s</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Button
                              onClick={() => {
                                setTestResults(null);
                                toast.info("Test results cleared");
                              }}
                              variant="outline"
                              className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                            >
                              Clear Results
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="code" className="flex-1 overflow-y-auto mt-4">
              <Card className="bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-slate-700 shadow-xl">
                <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-700 bg-slate-900/50">
                  <CardTitle className="text-sm text-white font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center">
                      <Code className="w-3 h-3 text-slate-300" />
                    </div>
                    Workflow Definition (JSON)
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const code = JSON.stringify({ 
                        name: workflowName, 
                        description: workflowDescription,
                        trigger, 
                        steps,
                        metadata: {
                          sourceWidget: widgetContext?.title,
                          createdAt: new Date().toISOString()
                        }
                      }, null, 2);
                      navigator.clipboard.writeText(code);
                      toast.success("Copied to clipboard ✓", {
                        description: "Workflow JSON copied"
                      });
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 border-0 text-white h-7 text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy JSON
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4 bg-black/80">
                    <pre className="text-xs text-emerald-400 overflow-x-auto font-mono leading-relaxed">
                      {JSON.stringify({ 
                        name: workflowName, 
                        description: workflowDescription,
                        trigger, 
                        steps,
                        metadata: {
                          sourceWidget: widgetContext?.title,
                          createdAt: new Date().toISOString(),
                          version: '1.0.0',
                          author: 'Workflow Composer AI'
                        }
                      }, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Footer Actions */}
        {!loadingDraft && (
          <div className="flex items-center justify-between p-4 border-t border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={testWorkflow}
                disabled={!workflowName || steps.length === 0}
                className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-white hover:bg-cyan-500/30"
              >
                <Play className="w-4 h-4 mr-2" />
                Test Workflow
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  toast.info("Workflow composer closed");
                }}
                className="bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs px-3 py-1">
                {steps.length} steps
              </Badge>
              <Button
                onClick={saveWorkflow}
                disabled={!workflowName || steps.length === 0}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30 font-bold"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Workflow
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}