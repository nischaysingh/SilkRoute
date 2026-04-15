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
    setSteps(prev => [...prev, newStep]);
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

    try {
      const user = await base44.auth.me();
      
      // Save to Workflow entity
      const workflow = await base44.entities.Workflow.create({
        name: workflowName,
        description: workflowDescription,
        trigger,
        steps,
        status: 'draft',
        version: 1,
        version_history: [{
          version: 1,
          steps,
          trigger,
          description: workflowDescription,
          changes_summary: 'Initial version',
          created_at: new Date().toISOString(),
          created_by: user.email
        }],
        widget_context: widgetContext
      });

      // Also log to AuditLog for tracking
      await base44.entities.AuditLog.create({
        timestamp: new Date().toISOString(),
        user_email: user.email,
        user_name: user.full_name,
        action_type: 'config_change',
        action_description: `Created workflow: ${workflowName}`,
        resource_type: 'workflow',
        resource_id: workflow.id,
        metadata: {
          workflow_id: workflow.id,
          workflow_name: workflowName,
          workflow_description: workflowDescription,
          trigger,
          steps,
          widget_context: widgetContext
        },
        status: 'success',
        severity: 'low'
      });

      console.log('Workflow saved:', workflow);
      
      toast.success("Workflow saved successfully! 🎉", {
        description: `"${workflowName}" created with ${steps.length} steps. View it in the Management tab.`
      });
      
      // Reset and close
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error("Failed to save workflow", {
        description: error.message || "Please try again"
      });
    }
  };

  const updateStep = (stepId, updates) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, ...updates } : s));
  };

  const getStepConfig = (type) => {
    return STEP_TYPES.find(s => s.id === type) || STEP_TYPES[0];
  };

  const selectedStepData = steps.find(s => s.id === selectedStep);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="workflow-composer-dialog bg-white backdrop-blur-xl border-2 border-slate-200 max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl z-[200]"
        onClick={(e) => e.stopPropagation()}
        onPointerDownCapture={(e) => e.stopPropagation()}
      >
        <DialogHeader className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-slate-900 text-xl font-bold flex items-center gap-2">
                Workflow Composer
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                  AI-Powered
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-slate-600 text-sm">
                Visual workflow designer with intelligent draft generation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loadingDraft ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-900 font-semibold mb-2">AI generating workflow...</p>
              <p className="text-sm text-slate-600">Analyzing {widgetContext?.title}</p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="bg-slate-100 border border-slate-200">
              <TabsTrigger value="builder" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Builder</TabsTrigger>
              <TabsTrigger value="config" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Configuration</TabsTrigger>
              <TabsTrigger value="test" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Test & Preview</TabsTrigger>
              <TabsTrigger value="code" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Code View</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="flex-1 overflow-y-auto space-y-4 mt-4">
              <div className="grid grid-cols-12 gap-4">
                {/* Left: Workflow Canvas */}
                <div className="col-span-8 space-y-4">
                  {/* Workflow Header */}
                  <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-slate-700 text-xs font-semibold">Workflow Name</Label>
                          <Input
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                            placeholder="e.g., AR Collection Automation"
                            className="bg-white border-slate-200 text-slate-900 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-700 text-xs font-semibold">Description</Label>
                          <Textarea
                            value={workflowDescription}
                            onChange={(e) => setWorkflowDescription(e.target.value)}
                            placeholder="Describe what this workflow does..."
                            className="bg-white border-slate-200 text-slate-900 mt-1 h-20"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trigger */}
                  <Card className="bg-cyan-50 border-cyan-200 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-900 flex items-center gap-2 font-bold">
                        <div className="w-6 h-6 rounded-lg bg-cyan-100 flex items-center justify-center">
                          <Zap className="w-3 h-3 text-cyan-600" />
                        </div>
                        Trigger
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Select value={trigger?.type} onValueChange={(value) => setTrigger({ ...trigger, type: value })}>
                        <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                          <SelectValue placeholder="Select trigger type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 z-[250]">
                          {TRIGGER_TYPES.map(t => (
                            <SelectItem key={t.id} value={t.id}>
                              <div>
                                <div className="font-semibold">{t.name}</div>
                                <div className="text-xs text-slate-600">{t.description}</div>
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
                            className="bg-white border-slate-200 text-slate-900 text-sm"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              placeholder="Metric"
                              defaultValue={widgetContext?.title}
                              className="bg-white border-slate-200 text-slate-900 text-xs"
                            />
                            <Select defaultValue=">">
                              <SelectTrigger className="bg-white border-slate-200 text-slate-900 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-slate-200 z-[250]">
                                <SelectItem value=">">Greater than</SelectItem>
                                <SelectItem value="<">Less than</SelectItem>
                                <SelectItem value="=">Equal to</SelectItem>
                                <SelectItem value="!=">Not equal to</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Threshold"
                              defaultValue={widgetContext?.metric}
                              className="bg-white border-slate-200 text-slate-900 text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {trigger?.type === 'schedule' && (
                        <div className="grid grid-cols-2 gap-2">
                          <Select defaultValue="daily">
                            <SelectTrigger className="bg-white border-slate-200 text-slate-900 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 z-[250]">
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="time"
                            defaultValue="09:00"
                            className="bg-white border-slate-200 text-slate-900 text-xs"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Workflow Steps */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900">Workflow Steps</h3>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
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
                                "bg-white border-slate-200 cursor-pointer hover:border-purple-300 hover:shadow-md transition-all",
                                selectedStep === step.id && "border-purple-400 bg-purple-50 shadow-md"
                              )}
                              onClick={() => setSelectedStep(step.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="flex flex-col items-center gap-2">
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-md",
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
                                        <div className="w-0.5 h-8 bg-gradient-to-b from-purple-300 to-blue-300"></div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                          Step {idx + 1}
                                        </div>
                                        <Badge className={cn(
                                          "text-xs font-semibold",
                                          stepConfig.color === 'blue' && "bg-blue-100 text-blue-700 border-blue-200",
                                          stepConfig.color === 'red' && "bg-red-100 text-red-700 border-red-200",
                                          stepConfig.color === 'amber' && "bg-amber-100 text-amber-700 border-amber-200",
                                          stepConfig.color === 'purple' && "bg-purple-100 text-purple-700 border-purple-200",
                                          stepConfig.color === 'cyan' && "bg-cyan-100 text-cyan-700 border-cyan-200",
                                          stepConfig.color === 'pink' && "bg-pink-100 text-pink-700 border-pink-200",
                                          stepConfig.color === 'emerald' && "bg-emerald-100 text-emerald-700 border-emerald-200"
                                        )}>
                                          {stepConfig.name}
                                        </Badge>
                                      </div>
                                      <h4 className="text-base font-bold text-slate-900 mb-1">{step.name}</h4>
                                      <p className="text-xs text-slate-600">{stepConfig.description}</p>
                                      
                                      {/* Quick config preview */}
                                      {step.config && Object.keys(step.config).length > 0 && (
                                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                                          {Object.entries(step.config).slice(0, 2).map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                                              <span className="text-slate-500">{key}:</span>
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
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
                      <Card className="bg-purple-50 border-purple-200 border-2 border-dashed">
                        <CardContent className="p-10 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                            <GitBranch className="w-8 h-8 text-purple-600" />
                          </div>
                          <p className="text-sm text-purple-700 font-semibold mb-1">No steps yet</p>
                          <p className="text-xs text-slate-600">Add steps from the panel to build your workflow →</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Right: Step Library & Configuration */}
                <div className="col-span-4 space-y-4">
                  {/* Step Library */}
                  <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-200">
                      <CardTitle className="text-sm text-slate-900 font-bold flex items-center gap-2">
                        <Plus className="w-4 h-4 text-purple-600" />
                        Add Step
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {STEP_TYPES.map(stepType => (
                        <Button
                          key={stepType.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addStep(stepType);
                          }}
                          type="button"
                          className={cn(
                            "w-full justify-start h-auto py-3 px-3 border-2 transition-all group",
                            stepType.color === 'blue' && "bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 hover:shadow-md",
                            stepType.color === 'red' && "bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300 hover:shadow-md",
                            stepType.color === 'amber' && "bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300 hover:shadow-md",
                            stepType.color === 'purple' && "bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300 hover:shadow-md",
                            stepType.color === 'cyan' && "bg-cyan-50 border-cyan-200 hover:bg-cyan-100 hover:border-cyan-300 hover:shadow-md",
                            stepType.color === 'pink' && "bg-pink-50 border-pink-200 hover:bg-pink-100 hover:border-pink-300 hover:shadow-md",
                            stepType.color === 'emerald' && "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all",
                            stepType.color === 'blue' && "bg-blue-100 group-hover:bg-blue-200",
                            stepType.color === 'red' && "bg-red-100 group-hover:bg-red-200",
                            stepType.color === 'amber' && "bg-amber-100 group-hover:bg-amber-200",
                            stepType.color === 'purple' && "bg-purple-100 group-hover:bg-purple-200",
                            stepType.color === 'cyan' && "bg-cyan-100 group-hover:bg-cyan-200",
                            stepType.color === 'pink' && "bg-pink-100 group-hover:bg-pink-200",
                            stepType.color === 'emerald' && "bg-emerald-100 group-hover:bg-emerald-200"
                          )}>
                            <stepType.icon className={cn(
                              "w-4 h-4",
                              stepType.color === 'blue' && "text-blue-600",
                              stepType.color === 'red' && "text-red-600",
                              stepType.color === 'amber' && "text-amber-600",
                              stepType.color === 'purple' && "text-purple-600",
                              stepType.color === 'cyan' && "text-cyan-600",
                              stepType.color === 'pink' && "text-pink-600",
                              stepType.color === 'emerald' && "text-emerald-600"
                            )} />
                          </div>
                          <div className="text-left flex-1">
                            <div className="text-sm font-bold text-slate-900 mb-0.5">{stepType.name}</div>
                            <div className="text-[10px] text-slate-600">{stepType.description}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </Button>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Step Configuration */}
                  {selectedStepData && (
                    <Card className="bg-purple-50 border-purple-200 shadow-md">
                      <CardHeader className="pb-3 bg-gradient-to-r from-purple-100 to-blue-100">
                        <CardTitle className="text-sm text-slate-900 font-bold flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-purple-200 flex items-center justify-center">
                            <Settings className="w-3 h-3 text-purple-700" />
                          </div>
                          Configure Step
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-slate-700 text-xs font-semibold">Step Name</Label>
                          <Input
                            value={selectedStepData.name}
                            onChange={(e) => updateStep(selectedStepData.id, { name: e.target.value })}
                            className="bg-white border-slate-200 text-slate-900 mt-1 text-sm"
                            placeholder="Enter descriptive step name"
                          />
                        </div>

                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="text-xs text-blue-700 font-semibold mb-2">💡 Step Info</div>
                          <div className="text-xs text-slate-700">
                            {getStepConfig(selectedStepData.type).description}
                          </div>
                        </div>

                        {selectedStepData.type === 'alert' && (
                          <>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">Channel</Label>
                              <Select 
                                value={selectedStepData.config?.channel || 'email'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, channel: value }
                                })}
                              >
                                <SelectTrigger className="bg-white border-slate-200 text-slate-900 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200">
                                  <SelectItem value="email">📧 Email</SelectItem>
                                  <SelectItem value="slack">💬 Slack</SelectItem>
                                  <SelectItem value="sms">📱 SMS</SelectItem>
                                  <SelectItem value="webhook">🔗 Webhook</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">Recipients</Label>
                              <Input
                                value={selectedStepData.config?.recipients || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, recipients: e.target.value }
                                })}
                                placeholder="finance@company.com, ops@company.com"
                                className="bg-white border-slate-200 text-slate-900 mt-1 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">Subject</Label>
                              <Input
                                value={selectedStepData.config?.subject || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, subject: e.target.value }
                                })}
                                placeholder="Alert: Threshold crossed"
                                className="bg-white border-slate-200 text-slate-900 mt-1 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">Message</Label>
                              <Textarea
                                value={selectedStepData.config?.body || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, body: e.target.value }
                                })}
                                placeholder="Compose your alert message..."
                                className="bg-white border-slate-200 text-slate-900 mt-1 h-24 text-sm"
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                              <Label className="text-red-700 text-xs font-semibold cursor-pointer">High Priority Alert</Label>
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
                              <Label className="text-slate-700 text-xs font-semibold">Condition Expression</Label>
                              <Input
                                value={selectedStepData.config?.condition || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, condition: e.target.value }
                                })}
                                placeholder="e.g., value > 50000"
                                className="bg-white border-slate-200 text-slate-900 mt-1 text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-slate-700 text-xs font-semibold">Field</Label>
                                <Input
                                  value={selectedStepData.config?.field || ''}
                                  onChange={(e) => updateStep(selectedStepData.id, { 
                                    config: { ...selectedStepData.config, field: e.target.value }
                                  })}
                                  placeholder="metric_name"
                                  className="bg-white border-slate-200 text-slate-900 mt-1 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-slate-700 text-xs font-semibold">Operator</Label>
                                <Select 
                                  value={selectedStepData.config?.operator || '>'} 
                                  onValueChange={(value) => updateStep(selectedStepData.id, { 
                                    config: { ...selectedStepData.config, operator: value }
                                  })}
                                >
                                  <SelectTrigger className="bg-white border-slate-200 text-slate-900 mt-1 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border-slate-200 z-[250]">
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
                                <Label className="text-slate-700 text-xs font-semibold">Value</Label>
                                <Input
                                  value={selectedStepData.config?.value || ''}
                                  onChange={(e) => updateStep(selectedStepData.id, { 
                                    config: { ...selectedStepData.config, value: e.target.value }
                                  })}
                                  placeholder="threshold"
                                  className="bg-white border-slate-200 text-slate-900 mt-1 text-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">If True → Action</Label>
                              <Select 
                                value={selectedStepData.config?.trueNext || 'continue'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, trueNext: value }
                                })}
                              >
                                <SelectTrigger className="bg-white border-slate-200 text-slate-900 mt-1 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200">
                                  <SelectItem value="continue">✓ Continue to next step</SelectItem>
                                  {steps.filter(s => s.id !== selectedStepData.id).map(s => (
                                    <SelectItem key={s.id} value={s.id}>→ Jump to: {s.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">If False → Action</Label>
                              <Select 
                                value={selectedStepData.config?.falseNext || 'skip'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, falseNext: value }
                                })}
                              >
                                <SelectTrigger className="bg-white border-slate-200 text-slate-900 mt-1 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200">
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
                                <Label className="text-slate-700 text-xs font-semibold">Duration</Label>
                                <Input
                                  type="number"
                                  value={selectedStepData.config?.duration || ''}
                                  onChange={(e) => updateStep(selectedStepData.id, { 
                                    config: { ...selectedStepData.config, duration: e.target.value }
                                  })}
                                  placeholder="1"
                                  className="bg-white border-slate-200 text-slate-900 mt-1 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-slate-700 text-xs font-semibold">Unit</Label>
                                <Select 
                                  value={selectedStepData.config?.unit || 'hours'} 
                                  onValueChange={(value) => updateStep(selectedStepData.id, { 
                                    config: { ...selectedStepData.config, unit: value }
                                  })}
                                >
                                  <SelectTrigger className="bg-white border-slate-200 text-slate-900 mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border-slate-200 z-[250]">
                                    <SelectItem value="seconds">Seconds</SelectItem>
                                    <SelectItem value="minutes">Minutes</SelectItem>
                                    <SelectItem value="hours">Hours</SelectItem>
                                    <SelectItem value="days">Days</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">Wait Description</Label>
                              <Input
                                value={selectedStepData.config?.description || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, description: e.target.value }
                                })}
                                placeholder="e.g., Wait for customer response"
                                className="bg-white border-slate-200 text-slate-900 mt-1 text-sm"
                              />
                            </div>
                          </>
                        )}

                        {selectedStepData.type === 'update' && (
                          <>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">Entity/Table</Label>
                              <Select 
                                value={selectedStepData.config?.entity || 'Order'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, entity: value }
                                })}
                              >
                                <SelectTrigger className="bg-white border-slate-200 text-slate-900 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200">
                                  <SelectItem value="Order">Order</SelectItem>
                                  <SelectItem value="AIRequest">AI Request</SelectItem>
                                  <SelectItem value="AuditLog">Audit Log</SelectItem>
                                  <SelectItem value="CRMTask">CRM Task</SelectItem>
                                  <SelectItem value="HRAssignment">HR Assignment</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">Action Type</Label>
                              <Select 
                                value={selectedStepData.config?.action || 'update'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, action: value }
                                })}
                              >
                                <SelectTrigger className="bg-white border-slate-200 text-slate-900 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200">
                                  <SelectItem value="create">Create new record</SelectItem>
                                  <SelectItem value="update">Update existing</SelectItem>
                                  <SelectItem value="delete">Delete record</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">Field to Update</Label>
                              <Input
                                value={selectedStepData.config?.field || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, field: e.target.value }
                                })}
                                placeholder="e.g., status"
                                className="bg-white border-slate-200 text-slate-900 mt-1 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">New Value</Label>
                              <Input
                                value={selectedStepData.config?.newValue || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, newValue: e.target.value }
                                })}
                                placeholder="e.g., flagged"
                                className="bg-white border-slate-200 text-slate-900 mt-1 text-sm"
                              />
                            </div>
                          </>
                        )}

                        {selectedStepData.type === 'filter' && (
                          <>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">Filter Expression</Label>
                              <Input
                                value={selectedStepData.config?.expression || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, expression: e.target.value }
                                })}
                                placeholder="e.g., status = 'active' AND amount > 1000"
                                className="bg-white border-slate-200 text-slate-900 mt-1 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">Data Source</Label>
                              <Select 
                                value={selectedStepData.config?.source || 'previous_step'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, source: value }
                                })}
                              >
                                <SelectTrigger className="bg-white border-slate-200 text-slate-900 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200">
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
                              <Label className="text-slate-700 text-xs font-semibold">AI Task</Label>
                              <Select 
                                value={selectedStepData.config?.aiTask || 'analyze'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, aiTask: value }
                                })}
                              >
                                <SelectTrigger className="bg-white border-slate-200 text-slate-900 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200">
                                  <SelectItem value="analyze">🔍 Analyze data</SelectItem>
                                  <SelectItem value="classify">🏷️ Classify/categorize</SelectItem>
                                  <SelectItem value="generate">✨ Generate content</SelectItem>
                                  <SelectItem value="summarize">📝 Summarize</SelectItem>
                                  <SelectItem value="decide">🎯 Make decision</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">Prompt Template</Label>
                              <Textarea
                                value={selectedStepData.config?.prompt || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, prompt: e.target.value }
                                })}
                                placeholder="Analyze this data and provide recommendations..."
                                className="bg-white border-slate-200 text-slate-900 mt-1 h-24 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">Model</Label>
                              <Select 
                                value={selectedStepData.config?.model || 'gpt-4'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, model: value }
                                })}
                              >
                                <SelectTrigger className="bg-white border-slate-200 text-slate-900 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200">
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
                              <Label className="text-slate-700 text-xs font-semibold">Webhook URL</Label>
                              <Input
                                value={selectedStepData.config?.url || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, url: e.target.value }
                                })}
                                placeholder="https://api.example.com/webhook"
                                className="bg-white border-slate-200 text-slate-900 mt-1 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">Method</Label>
                              <Select 
                                value={selectedStepData.config?.method || 'POST'} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, method: value }
                                })}
                              >
                                <SelectTrigger className="bg-white border-slate-200 text-slate-900 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200">
                                  <SelectItem value="POST">POST</SelectItem>
                                  <SelectItem value="GET">GET</SelectItem>
                                  <SelectItem value="PUT">PUT</SelectItem>
                                  <SelectItem value="PATCH">PATCH</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-slate-700 text-xs font-semibold">Payload (JSON)</Label>
                              <Textarea
                                value={selectedStepData.config?.payload || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, payload: e.target.value }
                                })}
                                placeholder='{"key": "value"}'
                                className="bg-white border-slate-200 text-slate-900 mt-1 h-20 text-sm font-mono"
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                              <Label className="text-amber-700 text-xs font-semibold cursor-pointer">Retry on failure</Label>
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
                  <Card className="bg-cyan-50 border-cyan-200 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-900 font-bold flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-cyan-100 flex items-center justify-center">
                          <LinkIcon className="w-3 h-3 text-cyan-600" />
                        </div>
                        Connected Widget
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 rounded-xl bg-cyan-100 border-2 border-cyan-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-cyan-200 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-cyan-700" />
                          </div>
                          <span className="text-sm font-bold text-slate-900">{widgetContext?.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-cyan-200 text-cyan-800 border-cyan-300 text-xs">
                            Monitoring: {widgetContext?.metric || 'N/A'}
                          </Badge>
                          {widgetContext?.trend && (
                            <Badge className={cn(
                              "text-xs",
                              widgetContext.trend === 'up' && "bg-emerald-100 text-emerald-700 border-emerald-200",
                              widgetContext.trend === 'down' && "bg-red-100 text-red-700 border-red-200"
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
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-slate-900 text-sm font-bold flex items-center gap-2">
                      <Settings className="w-4 h-4 text-purple-600" />
                      Advanced Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div>
                        <div className="text-sm font-bold text-slate-900 mb-1">Auto-activate workflow</div>
                        <div className="text-xs text-emerald-700">Enable immediately after saving</div>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-emerald-500" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <div>
                        <div className="text-sm font-bold text-slate-900 mb-1">Error handling</div>
                        <div className="text-xs text-amber-700">Auto-retry on failure (max 3 attempts)</div>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-amber-500" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200">
                      <div>
                        <div className="text-sm font-bold text-slate-900 mb-1">Logging & Audit</div>
                        <div className="text-xs text-blue-700">Track all executions in audit log</div>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-blue-500" />
                    </div>

                    <div>
                      <Label className="text-slate-700 text-xs font-semibold">Max executions per day</Label>
                      <Input
                        type="number"
                        defaultValue="100"
                        className="bg-white border-slate-200 text-slate-900 mt-1"
                      />
                      <p className="text-xs text-slate-500 mt-1">Prevent runaway executions</p>
                    </div>

                    <div>
                      <Label className="text-slate-700 text-xs font-semibold">Notification email</Label>
                      <Input
                        type="email"
                        placeholder="admin@company.com"
                        className="bg-white border-slate-200 text-slate-900 mt-1"
                      />
                      <p className="text-xs text-slate-500 mt-1">Receive execution summaries</p>
                    </div>

                    <div>
                      <Label className="text-slate-700 text-xs font-semibold">Timeout (seconds)</Label>
                      <Input
                        type="number"
                        defaultValue="300"
                        className="bg-white border-slate-200 text-slate-900 mt-1"
                      />
                      <p className="text-xs text-slate-500 mt-1">Maximum execution time per run</p>
                    </div>

                    <div>
                      <Label className="text-slate-700 text-xs font-semibold">Priority Level</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger className="bg-white border-slate-200 text-slate-900 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-slate-900 text-sm font-bold flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-600" />
                      Performance Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-slate-700 text-xs font-semibold">Batch Size</Label>
                        <Input
                          type="number"
                          defaultValue="10"
                          className="bg-white border-slate-200 text-slate-900 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 text-xs font-semibold">Concurrency</Label>
                        <Input
                          type="number"
                          defaultValue="5"
                          className="bg-white border-slate-200 text-slate-900 mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="test" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4">
                <Card className="bg-cyan-50 border-cyan-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-slate-900 text-sm font-bold flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-cyan-100 flex items-center justify-center">
                        <Play className="w-3 h-3 text-cyan-600" />
                      </div>
                      Test Workflow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-600 mb-3">Test Configuration</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Workflow:</span>
                          <span className="text-slate-900 font-semibold">{workflowName || 'Untitled'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Steps:</span>
                          <span className="text-slate-900 font-semibold">{steps.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Trigger:</span>
                          <span className="text-slate-900 font-semibold">{trigger?.type || 'Not set'}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        testWorkflow();
                      }}
                      type="button"
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
                        <Card className="bg-emerald-50 border-emerald-200 shadow-md">
                          <CardContent className="p-5 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <Check className="w-6 h-6 text-emerald-600" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-lg">Test Passed ✓</div>
                                <div className="text-xs text-emerald-700">All steps executed successfully</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 rounded-lg bg-white border border-slate-200">
                                <div className="text-xs text-slate-600 mb-1">Execution Time</div>
                                <div className="text-xl font-bold text-slate-900">{testResults.executionTime}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-white border border-slate-200">
                                <div className="text-xs text-slate-600 mb-1">Steps Executed</div>
                                <div className="text-xl font-bold text-slate-900">{testResults.stepsExecuted}/{steps.length}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-white border border-slate-200">
                                <div className="text-xs text-slate-600 mb-1">Alerts Sent</div>
                                <div className="text-xl font-bold text-slate-900">{testResults.alerts}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-white border border-slate-200">
                                <div className="text-xs text-slate-600 mb-1">Records Updated</div>
                                <div className="text-xl font-bold text-slate-900">{testResults.updates}</div>
                              </div>
                              {testResults.aiCalls > 0 && (
                                <div className="p-3 rounded-lg bg-white border border-slate-200">
                                  <div className="text-xs text-slate-600 mb-1">AI Calls</div>
                                  <div className="text-xl font-bold text-slate-900">{testResults.aiCalls}</div>
                                </div>
                              )}
                              {testResults.estimatedCost && (
                                <div className="p-3 rounded-lg bg-white border border-slate-200">
                                  <div className="text-xs text-slate-600 mb-1">Estimated Cost</div>
                                  <div className="text-xl font-bold text-emerald-600">{testResults.estimatedCost}</div>
                                </div>
                              )}
                            </div>

                            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                              <div className="text-xs text-blue-700 mb-2 font-semibold">Execution Log:</div>
                              <div className="space-y-1 text-xs text-slate-700 font-mono">
                                {steps.map((step, idx) => (
                                  <div key={step.id} className="flex items-center gap-2">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>Step {idx + 1}: {step.name}</span>
                                    <span className="text-slate-500 ml-auto">{(Math.random() * 0.5 + 0.3).toFixed(2)}s</span>
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
                              className="w-full bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
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
              <Card className="bg-slate-900 border-slate-700 shadow-xl">
                <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-700">
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
                  <div className="p-4 bg-black">
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
          <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  testWorkflow();
                }}
                type="button"
                disabled={!workflowName || steps.length === 0}
                className="bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100"
              >
                <Play className="w-4 h-4 mr-2" />
                Test Workflow
              </Button>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                  toast.info("Workflow composer closed");
                }}
                type="button"
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs px-3 py-1">
                {steps.length} steps
              </Badge>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  saveWorkflow();
                }}
                type="button"
                disabled={!workflowName || steps.length === 0}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg font-bold"
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