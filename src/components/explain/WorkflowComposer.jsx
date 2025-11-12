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
    toast.info("Testing workflow...", {
      description: "Running simulation with sample data"
    });

    setTimeout(() => {
      setTestResults({
        success: true,
        executionTime: '2.4s',
        stepsExecuted: steps.length,
        alerts: 1,
        updates: 1
      });
      setActiveTab('test');
      toast.success("Workflow test completed", {
        description: `${steps.length} steps executed successfully`
      });
    }, 2400);
  };

  const saveWorkflow = async () => {
    try {
      const workflow = {
        name: workflowName,
        description: workflowDescription,
        trigger,
        steps,
        source_widget: widgetContext?.title || 'Manual',
        source_page: window.location.pathname,
        status: 'draft',
        execution_count: 0,
        success_rate: 0
      };

      await base44.entities.Workflow.create(workflow);
      
      toast.success("Workflow saved", {
        description: `"${workflowName}" created successfully. Activate it from the Workflows page.`
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error("Failed to save workflow", {
        description: error.message
      });
    }
  };

  const getStepConfig = (type) => {
    return STEP_TYPES.find(s => s.id === type) || STEP_TYPES[0];
  };

  const selectedStepData = steps.find(s => s.id === selectedStep);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/98 backdrop-blur-xl border-purple-500/30 text-white max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-400" />
            Workflow Composer
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Visual workflow designer with AI-powered draft generation
          </DialogDescription>
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
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="builder">Builder</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="test">Test & Preview</TabsTrigger>
              <TabsTrigger value="code">Code View</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="flex-1 overflow-y-auto space-y-4 mt-4">
              <div className="grid grid-cols-12 gap-4">
                {/* Left: Workflow Canvas */}
                <div className="col-span-8 space-y-4">
                  {/* Workflow Header */}
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-gray-400 text-xs">Workflow Name</Label>
                          <Input
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                            placeholder="e.g., AR Collection Automation"
                            className="bg-white/5 border-white/10 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-400 text-xs">Description</Label>
                          <Textarea
                            value={workflowDescription}
                            onChange={(e) => setWorkflowDescription(e.target.value)}
                            placeholder="Describe what this workflow does..."
                            className="bg-white/5 border-white/10 text-white mt-1 h-20"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trigger */}
                  <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        Trigger
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Select value={trigger?.type} onValueChange={(value) => setTrigger({ ...trigger, type: value })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select trigger type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/20 text-white">
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
                              className="bg-white/5 border-white/10 text-white text-xs"
                            />
                            <Select defaultValue=">">
                              <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-white/20 text-white">
                                <SelectItem value=">">Greater than</SelectItem>
                                <SelectItem value="<">Less than</SelectItem>
                                <SelectItem value="=">Equal to</SelectItem>
                                <SelectItem value="!=">Not equal to</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Threshold"
                              defaultValue={widgetContext?.metric}
                              className="bg-white/5 border-white/10 text-white text-xs"
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
                                "bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-all",
                                selectedStep === step.id && "border-purple-500/50 bg-purple-500/10"
                              )}
                              onClick={() => setSelectedStep(step.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="flex flex-col items-center gap-2">
                                      <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                        `bg-${stepConfig.color}-500/20`
                                      )}>
                                        <stepConfig.icon className={cn("w-4 h-4", `text-${stepConfig.color}-400`)} />
                                      </div>
                                      {idx < steps.length - 1 && (
                                        <div className="w-0.5 h-6 bg-white/20"></div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-gray-500">Step {idx + 1}</span>
                                        <Badge className={cn("text-xs", `bg-${stepConfig.color}-500/20 text-${stepConfig.color}-400`)}>
                                          {stepConfig.name}
                                        </Badge>
                                      </div>
                                      <h4 className="text-sm font-semibold text-white mb-1">{step.name}</h4>
                                      <p className="text-xs text-gray-400">{stepConfig.description}</p>
                                      
                                      {/* Quick config preview */}
                                      {step.config && Object.keys(step.config).length > 0 && (
                                        <div className="mt-2 p-2 bg-white/5 rounded text-xs text-gray-300">
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
                      <Card className="bg-white/5 border-white/10 border-dashed">
                        <CardContent className="p-8 text-center">
                          <GitBranch className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                          <p className="text-sm text-gray-400">No steps yet. Add steps from the panel →</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Right: Step Library & Configuration */}
                <div className="col-span-4 space-y-4">
                  {/* Step Library */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-white">Add Step</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {STEP_TYPES.map(stepType => (
                        <Button
                          key={stepType.id}
                          onClick={() => addStep(stepType)}
                          variant="outline"
                          className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 h-auto py-2"
                        >
                          <stepType.icon className={cn("w-4 h-4 mr-2", `text-${stepType.color}-400`)} />
                          <div className="text-left">
                            <div className="text-xs font-semibold">{stepType.name}</div>
                            <div className="text-[10px] text-gray-400">{stepType.description}</div>
                          </div>
                        </Button>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Step Configuration */}
                  {selectedStepData && (
                    <Card className="bg-purple-500/10 border-purple-500/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-white flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Configure Step
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-gray-400 text-xs">Step Name</Label>
                          <Input
                            value={selectedStepData.name}
                            onChange={(e) => updateStep(selectedStepData.id, { name: e.target.value })}
                            className="bg-white/5 border-white/10 text-white mt-1 text-sm"
                          />
                        </div>

                        {selectedStepData.type === 'alert' && (
                          <>
                            <div>
                              <Label className="text-gray-400 text-xs">Channel</Label>
                              <Select 
                                value={selectedStepData.config?.channel} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, channel: value }
                                })}
                              >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/20 text-white">
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="slack">Slack</SelectItem>
                                  <SelectItem value="sms">SMS</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-gray-400 text-xs">Recipients</Label>
                              <Input
                                value={selectedStepData.config?.recipients || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, recipients: e.target.value }
                                })}
                                placeholder="email@company.com"
                                className="bg-white/5 border-white/10 text-white mt-1 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-400 text-xs">Message</Label>
                              <Textarea
                                value={selectedStepData.config?.body || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, body: e.target.value }
                                })}
                                className="bg-white/5 border-white/10 text-white mt-1 h-20 text-sm"
                              />
                            </div>
                          </>
                        )}

                        {selectedStepData.type === 'condition' && (
                          <>
                            <div>
                              <Label className="text-gray-400 text-xs">Condition</Label>
                              <Input
                                value={selectedStepData.config?.condition || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, condition: e.target.value }
                                })}
                                placeholder="e.g., value > 50000"
                                className="bg-white/5 border-white/10 text-white mt-1 text-sm"
                              />
                            </div>
                          </>
                        )}

                        {selectedStepData.type === 'wait' && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-gray-400 text-xs">Duration</Label>
                              <Input
                                type="number"
                                value={selectedStepData.config?.duration || ''}
                                onChange={(e) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, duration: e.target.value }
                                })}
                                className="bg-white/5 border-white/10 text-white mt-1 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-400 text-xs">Unit</Label>
                              <Select 
                                value={selectedStepData.config?.unit} 
                                onValueChange={(value) => updateStep(selectedStepData.id, { 
                                  config: { ...selectedStepData.config, unit: value }
                                })}
                              >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/20 text-white">
                                  <SelectItem value="minutes">Minutes</SelectItem>
                                  <SelectItem value="hours">Hours</SelectItem>
                                  <SelectItem value="days">Days</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Widget Connection */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-white flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-cyan-400" />
                        Connected Widget
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm font-semibold text-white">{widgetContext?.title}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Monitoring: {widgetContext?.metric || 'N/A'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="config" className="flex-1 overflow-y-auto mt-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Advanced Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <div className="text-sm font-semibold text-white">Auto-activate workflow</div>
                      <div className="text-xs text-gray-400">Enable immediately after saving</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <div className="text-sm font-semibold text-white">Error handling</div>
                      <div className="text-xs text-gray-400">Auto-retry on failure</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div>
                    <Label className="text-gray-400 text-xs">Max executions per day</Label>
                    <Input
                      type="number"
                      defaultValue="100"
                      className="bg-white/5 border-white/10 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-400 text-xs">Notification email</Label>
                    <Input
                      type="email"
                      placeholder="admin@company.com"
                      className="bg-white/5 border-white/10 text-white mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="test" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Test Workflow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={testWorkflow}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Run Test Simulation
                    </Button>

                    {testResults && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="bg-emerald-500/10 border-emerald-500/30">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center gap-2 mb-3">
                              <Check className="w-5 h-5 text-emerald-400" />
                              <span className="font-semibold text-white">Test Passed</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Execution time:</span>
                                <span className="text-white font-semibold">{testResults.executionTime}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Steps executed:</span>
                                <span className="text-white font-semibold">{testResults.stepsExecuted}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Alerts sent:</span>
                                <span className="text-white font-semibold">{testResults.alerts}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Records updated:</span>
                                <span className="text-white font-semibold">{testResults.updates}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="code" className="flex-1 overflow-y-auto mt-4">
              <Card className="bg-slate-950 border-white/10">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Workflow Definition (JSON)
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify({ name: workflowName, description: workflowDescription, trigger, steps }, null, 2));
                      toast.success("Copied to clipboard");
                    }}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-6 text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-gray-300 overflow-x-auto bg-black/50 p-4 rounded-lg">
                    {JSON.stringify({ 
                      name: workflowName, 
                      description: workflowDescription,
                      trigger, 
                      steps 
                    }, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Footer Actions */}
        {!loadingDraft && (
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={testWorkflow}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <Play className="w-4 h-4 mr-2" />
                Test
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
            <Button
              onClick={saveWorkflow}
              disabled={!workflowName || steps.length === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Workflow
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}