
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Wrench, Boxes, FileCode, Database, Wind, Shield, FlaskConical,
  DollarSign, Plane, Check, AlertTriangle, Play, Save, Copy, Download,
  ArrowRight, Sparkles, Plus, Trash2, Edit, Eye, GitBranch, Target,
  Zap, Lock, Unlock, TrendingUp, BarChart3, Code, Settings, Cpu,
  FileText, Link, MessageSquare, Layers, Network, Filter, ChevronRight,
  Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ToolboxTab() {
  const [activeView, setActiveView] = useState("overview");
  const [selectedTool, setSelectedTool] = useState(null);
  
  // Mission Builder state
  const [missionBuildStep, setMissionBuildStep] = useState(1);
  const [missionSpec, setMissionSpec] = useState({
    name: "",
    objective: "",
    triggers: [],
    inputs: [],
    steps: [],
    guardrails: [],
    successMetrics: [],
    rollbackPlan: ""
  });

  // Action Library state
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionChain, setActionChain] = useState([]);

  // Data Mapper state
  const [discoveredFields, setDiscoveredFields] = useState([
    { name: "customer_email", type: "string", pii: true, source: "CRM" },
    { name: "order_amount", type: "number", pii: false, source: "Orders" },
    { name: "invoice_id", type: "string", pii: false, source: "Accounting" },
    { name: "product_name", type: "string", pii: false, source: "Inventory" }
  ]);

  // Simulator state
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulationRunning, setSimulationRunning] = useState(false);

  // Guardrails state
  const [clearanceLevel, setClearanceLevel] = useState("V3");
  const [globalCaps, setGlobalCaps] = useState({
    recipientsPerHour: 1000,
    spendPerDay: 50,
    rowsTouchedPerJob: 10000,
    marketsAffected: 3
  });

  // Cost Guardian state
  const [costTracking, setCostTracking] = useState({
    dailyBudget: 100,
    currentSpend: 42.36,
    projectedSpend: 87.5,
    alerts: []
  });

  const tools = [
    {
      id: "mission-builder",
      name: "Mission Builder",
      icon: Plane,
      description: "Conversational workflow designer - translate intent into executable specs",
      color: "blue",
      analogy: "Flight Director → briefs Pilot before take-off",
      status: "active"
    },
    {
      id: "action-library",
      name: "Action Library",
      icon: Boxes,
      description: "Low-code reusable operational primitives",
      color: "purple",
      analogy: "Pre-flight checklist of available maneuvers",
      status: "active"
    },
    {
      id: "spec-writer",
      name: "SpecWriter",
      icon: FileCode,
      description: "AI-powered spec generator from fuzzy intent",
      color: "emerald",
      analogy: "Co-pilot that clarifies the flight plan",
      status: "active"
    },
    {
      id: "data-mapper",
      name: "Data Mapper",
      icon: Database,
      description: "Auto-discover and map data structures",
      color: "amber",
      analogy: "Radar that maps the terrain",
      status: "active"
    },
    {
      id: "simulator",
      name: "Simulator (Wind Tunnel)",
      icon: Wind,
      description: "Dry-run missions against historical data",
      color: "cyan",
      analogy: "Test every flight plan before take-off",
      status: "active"
    },
    {
      id: "guardrails",
      name: "Guardrails & Policies",
      icon: Shield,
      description: "Operational airspace limits for AI agents",
      color: "red",
      analogy: "Air traffic control clearance levels",
      status: "active"
    },
    {
      id: "evaluator",
      name: "Evaluator / A-B Harness",
      icon: FlaskConical,
      description: "Benchmark and compare AI flows",
      color: "indigo",
      analogy: "Performance testing before production",
      status: "active"
    },
    {
      id: "cost-guardian",
      name: "Cost Guardian",
      icon: DollarSign,
      description: "Financial intelligence for AI operations",
      color: "green",
      analogy: "Fuel management system",
      status: "active"
    },
    {
      id: "flight-deck",
      name: "Flight Deck",
      icon: Settings,
      description: "Unified command interface",
      color: "slate",
      analogy: "Cockpit control panel",
      status: "beta"
    }
  ];

  const actionPrimitives = [
    { id: "fetch", name: "Fetch", icon: Database, category: "input", description: "Retrieve data from source" },
    { id: "filter", name: "Filter", icon: Filter, category: "transform", description: "Filter data by conditions" },
    { id: "transform", name: "Transform", icon: Zap, category: "transform", description: "Transform data structure" },
    { id: "decide", name: "Decide", icon: GitBranch, category: "logic", description: "Branch based on condition" },
    { id: "generate", name: "Generate", icon: Sparkles, category: "ai", description: "AI content generation" },
    { id: "update_record", name: "Update Record", icon: Edit, category: "output", description: "Update database record" },
    { id: "send_email", name: "Send Email", icon: MessageSquare, category: "output", description: "Send email notification" },
    { id: "send_slack", name: "Send Slack", icon: MessageSquare, category: "output", description: "Post to Slack channel" },
    { id: "schedule", name: "Schedule", icon: Target, category: "control", description: "Schedule future execution" },
    { id: "wait", name: "Wait", icon: Target, category: "control", description: "Pause execution" },
    { id: "branch", name: "Branch", icon: GitBranch, category: "logic", description: "Conditional branching" },
    { id: "webhook", name: "Webhook", icon: Link, category: "output", description: "Call external webhook" }
  ];

  const clearanceLevels = [
    { level: "V1", name: "Draft Only", description: "Generate drafts, no execution", color: "slate" },
    { level: "V2", name: "Draft + Enrich", description: "Draft and enrich data", color: "blue" },
    { level: "V3", name: "Auto-Execute Reversible", description: "Execute reversible actions", color: "amber" },
    { level: "V4", name: "Execute with Approval", description: "Auto-execute after human approval", color: "orange" },
    { level: "V5", name: "Full Auto", description: "Fully autonomous under budget cap", color: "emerald" }
  ];

  const handleBuildMission = () => {
    if (missionBuildStep < 6) {
      setMissionBuildStep(missionBuildStep + 1);
      toast.success(`Step ${missionBuildStep} completed`);
    } else {
      toast.success("Mission spec validated and ready to deploy!", {
        description: "You can now simulate or deploy this mission"
      });
    }
  };

  const handleRunSimulation = () => {
    setSimulationRunning(true);
    toast.info("Running simulation...", {
      description: "Testing against historical data"
    });

    setTimeout(() => {
      setSimulationResult({
        confidence: 94,
        predictedCost: "$2.40/day",
        predictedLatency: "840ms avg",
        predictedSuccessRate: "97.2%",
        riskScore: 12,
        safeToExecute: true,
        warnings: [
          "External API may timeout 3% of runs",
          "Cost may spike during peak hours"
        ],
        recommendations: [
          "Enable circuit breaker for API calls",
          "Consider off-peak scheduling for batch jobs"
        ]
      });
      setSimulationRunning(false);
      toast.success("Simulation complete!", {
        description: "94% confidence - Safe to execute"
      });
    }, 3000);
  };

  const handleAddToChain = (action) => {
    setActionChain([...actionChain, { ...action, id: Date.now() }]);
    toast.success(`Added ${action.name} to action chain`);
  };

  const handleRemoveFromChain = (actionId) => {
    setActionChain(actionChain.filter(a => a.id !== actionId));
    toast.info("Action removed from chain");
  };

  const handleDeployMission = () => {
    toast.success("Mission deployed to Pilot!", {
      description: "Now active and ready for execution"
    });
  };

  const getToolColor = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      purple: "from-purple-500 to-purple-600",
      emerald: "from-emerald-500 to-emerald-600",
      amber: "from-amber-500 to-amber-600",
      cyan: "from-cyan-500 to-cyan-600",
      red: "from-red-500 to-red-600",
      indigo: "from-indigo-500 to-indigo-600",
      green: "from-green-500 to-green-600",
      slate: "from-slate-500 to-slate-600"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mission-builder"><Plane className="w-4 h-4 mr-2" />Mission Builder</TabsTrigger>
          <TabsTrigger value="action-library"><Boxes className="w-4 h-4 mr-2" />Actions</TabsTrigger>
          <TabsTrigger value="spec-writer"><FileCode className="w-4 h-4 mr-2" />SpecWriter</TabsTrigger>
          <TabsTrigger value="data-mapper"><Database className="w-4 h-4 mr-2" />Data Mapper</TabsTrigger>
          <TabsTrigger value="simulator"><Wind className="w-4 h-4 mr-2" />Simulator</TabsTrigger>
          <TabsTrigger value="guardrails"><Shield className="w-4 h-4 mr-2" />Guardrails</TabsTrigger>
          <TabsTrigger value="evaluator"><FlaskConical className="w-4 h-4 mr-2" />Evaluator</TabsTrigger>
          <TabsTrigger value="cost-guardian"><DollarSign className="w-4 h-4 mr-2" />Cost Guardian</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Header */}
          <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Wrench className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-1">Toolbox: Mission Control Suite</h2>
                    <p className="text-purple-100">9 operational tools for building, testing, and deploying AI missions</p>
                  </div>
                </div>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2">
                  <Sparkles className="w-4 h-4 mr-2" />
                  9 Tools Active
                </Badge>
              </div>

              {/* Tool Grid Preview */}
              <div className="grid grid-cols-9 gap-2 mt-6">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 text-center cursor-pointer hover:bg-white/20 transition-all"
                    onClick={() => {
                      setActiveView(tool.id);
                      setSelectedTool(tool);
                    }}
                  >
                    <tool.icon className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-[10px] font-semibold leading-tight">{tool.name.split(" ")[0]}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-3 gap-6">
            {tools.map((tool) => (
              <motion.div
                key={tool.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer border-2 transition-all h-full",
                    selectedTool?.id === tool.id
                      ? "border-purple-300 bg-purple-50"
                      : "border-slate-200 hover:border-purple-200"
                  )}
                  onClick={() => {
                    setSelectedTool(tool);
                    setActiveView(tool.id);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={cn("p-3 rounded-xl bg-gradient-to-br", getToolColor(tool.color))}>
                        <tool.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-slate-900">{tool.name}</h3>
                          <Badge className={cn(
                            "text-xs",
                            tool.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {tool.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{tool.description}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-xs text-slate-500 mb-1">Analogy:</div>
                      <div className="text-sm text-slate-700 italic">"{tool.analogy}"</div>
                    </div>

                    <Button
                      className="w-full mt-4"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveView(tool.id);
                      }}
                    >
                      Open Tool
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* MISSION BUILDER TAB */}
        <TabsContent value="mission-builder" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Plane className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Mission Builder</h3>
                  <p className="text-sm text-slate-600">Guided briefing flow to create executable mission specs</p>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  {[1, 2, 3, 4, 5, 6].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold border-2",
                          step <= missionBuildStep
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-400 border-slate-300"
                        )}
                      >
                        {step < missionBuildStep ? <Check className="w-5 h-5" /> : step}
                      </div>
                      {step < 6 && (
                        <div
                          className={cn(
                            "h-0.5 w-16 mx-2",
                            step < missionBuildStep ? "bg-blue-600" : "bg-slate-300"
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Objective</span>
                  <span>Triggers</span>
                  <span>Inputs</span>
                  <span>Steps</span>
                  <span>Guardrails</span>
                  <span>Validate</span>
                </div>
              </div>

              {/* Step Content */}
              <Card className="border-2 border-blue-200">
                <CardContent className="p-6">
                  {missionBuildStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-bold text-slate-900 mb-2 block">Mission Name</Label>
                        <Input
                          placeholder="e.g., Invoice Reconciliation Workflow"
                          value={missionSpec.name}
                          onChange={(e) => setMissionSpec({ ...missionSpec, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-bold text-slate-900 mb-2 block">Mission Objective</Label>
                        <Textarea
                          placeholder="What should this mission accomplish? Be specific..."
                          value={missionSpec.objective}
                          onChange={(e) => setMissionSpec({ ...missionSpec, objective: e.target.value })}
                          className="min-h-32"
                        />
                      </div>
                    </div>
                  )}

                  {missionBuildStep === 2 && (
                    <div className="space-y-4">
                      <Label className="text-sm font-bold text-slate-900 mb-2 block">Execution Triggers</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Schedule", "Event", "Webhook", "Manual"].map((trigger) => (
                          <Button
                            key={trigger}
                            variant="outline"
                            className="justify-start"
                            onClick={() => {
                              const newTriggers = [...missionSpec.triggers];
                              if (newTriggers.includes(trigger)) {
                                newTriggers.splice(newTriggers.indexOf(trigger), 1);
                              } else {
                                newTriggers.push(trigger);
                              }
                              setMissionSpec({ ...missionSpec, triggers: newTriggers });
                            }}
                          >
                            {missionSpec.triggers.includes(trigger) && <Check className="w-4 h-4 mr-2" />}
                            {trigger}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {missionBuildStep === 3 && (
                    <div className="space-y-4">
                      <Label className="text-sm font-bold text-slate-900 mb-2 block">Data Inputs</Label>
                      <div className="space-y-2">
                        {["Orders API", "Invoice Emails", "QuickBooks", "Customer Database"].map((input) => (
                          <div key={input} className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                            <Switch
                              checked={missionSpec.inputs.includes(input)}
                              onCheckedChange={(checked) => {
                                const newInputs = [...missionSpec.inputs];
                                if (checked) {
                                  newInputs.push(input);
                                } else {
                                  newInputs.splice(newInputs.indexOf(input), 1);
                                }
                                setMissionSpec({ ...missionSpec, inputs: newInputs });
                              }}
                            />
                            <Database className="w-4 h-4 text-slate-600" />
                            <span className="text-sm font-semibold text-slate-900">{input}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {missionBuildStep === 4 && (
                    <div className="space-y-4">
                      <Label className="text-sm font-bold text-slate-900 mb-2 block">Workflow Steps</Label>
                      <div className="text-sm text-slate-600 mb-3">
                        Steps will be configured using Action Library primitives
                      </div>
                      <div className="space-y-2">
                        {["Fetch invoices", "Filter by status", "Reconcile amounts", "Update records", "Notify team"].map((step, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </div>
                            <span className="text-sm text-slate-900">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {missionBuildStep === 5 && (
                    <div className="space-y-4">
                      <Label className="text-sm font-bold text-slate-900 mb-2 block">Safety Guardrails</Label>
                      <div className="space-y-2">
                        {[
                          { name: "Require human approval for amounts > $5K", checked: true },
                          { name: "Sandbox mode for first 3 runs", checked: true },
                          { name: "PII data masking enabled", checked: true },
                          { name: "Auto-rollback on error rate > 5%", checked: false }
                        ].map((guard, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                            <div className="flex items-center gap-3">
                              <Shield className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-slate-900">{guard.name}</span>
                            </div>
                            <Switch checked={guard.checked} />
                          </div>
                        ))}
                      </div>
                      <div>
                        <Label className="text-sm font-bold text-slate-900 mb-2 block">Rollback Plan</Label>
                        <Textarea
                          placeholder="What should happen if this mission fails?"
                          value={missionSpec.rollbackPlan}
                          onChange={(e) => setMissionSpec({ ...missionSpec, rollbackPlan: e.target.value })}
                          className="min-h-24"
                        />
                      </div>
                    </div>
                  )}

                  {missionBuildStep === 6 && (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                        <div className="flex items-center gap-3 mb-3">
                          <Check className="w-6 h-6 text-emerald-600" />
                          <h4 className="text-lg font-bold text-emerald-900">Mission Spec Validated</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-slate-600">Name:</span>
                            <span className="font-semibold text-slate-900 ml-2">{missionSpec.name || "Not set"}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Triggers:</span>
                            <span className="font-semibold text-slate-900 ml-2">{missionSpec.triggers.length}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Inputs:</span>
                            <span className="font-semibold text-slate-900 ml-2">{missionSpec.inputs.length}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Guardrails:</span>
                            <span className="font-semibold text-slate-900 ml-2">4 active</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => setActiveView("simulator")}>
                          <Wind className="w-4 h-4 mr-2" />
                          Run Simulation
                        </Button>
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleDeployMission}>
                          <Play className="w-4 h-4 mr-2" />
                          Deploy Mission
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => missionBuildStep > 1 && setMissionBuildStep(missionBuildStep - 1)}
                  disabled={missionBuildStep === 1}
                >
                  Previous
                </Button>
                <Button onClick={handleBuildMission} className="bg-blue-600 hover:bg-blue-700">
                  {missionBuildStep < 6 ? "Next Step" : "Complete"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACTION LIBRARY TAB */}
        <TabsContent value="action-library" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Boxes className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Action Library</h3>
                  <p className="text-sm text-slate-600">Reusable operational primitives - drag to build workflows</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Available Actions */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Available Actions</h4>
                  <div className="space-y-2">
                    {actionPrimitives.map((action) => (
                      <Card
                        key={action.id}
                        className="cursor-move border-2 border-slate-200 hover:border-purple-300 transition-all"
                        onClick={() => handleAddToChain(action)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded">
                              <action.icon className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-slate-900">{action.name}</div>
                              <div className="text-xs text-slate-600">{action.description}</div>
                            </div>
                            <Badge className="text-xs bg-slate-100 text-slate-700">
                              {action.category}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Action Chain Builder */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-900">Action Chain</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActionChain([])}
                      disabled={actionChain.length === 0}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  </div>

                  {actionChain.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-500">
                      <Boxes className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Click actions to add to chain</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {actionChain.map((action, idx) => (
                        <div key={action.id}>
                          <Card className="border-2 border-purple-300 bg-purple-50">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                                  {idx + 1}
                                </div>
                                <div className="p-2 bg-white rounded">
                                  <action.icon className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-slate-900">{action.name}</div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveFromChain(action.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                          {idx < actionChain.length - 1 && (
                            <div className="flex justify-center">
                              <ArrowRight className="w-4 h-4 text-purple-400 my-1" />
                            </div>
                          )}
                        </div>
                      ))}

                      <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-4">
                        <Save className="w-4 h-4 mr-2" />
                        Save Action Chain
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SPEC WRITER TAB */}
        <TabsContent value="spec-writer" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileCode className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">SpecWriter (AI → Spec)</h3>
                  <p className="text-sm text-slate-600">Turn fuzzy intent into validated mission specs</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-bold text-slate-900 mb-2 block">Describe Your Intent</Label>
                  <Textarea
                    placeholder="Example: I want to automatically reconcile invoices every Friday morning, match them with our QuickBooks records, and send a summary to the finance team..."
                    className="min-h-64"
                  />
                  <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate MissionSpec
                  </Button>
                </div>

                <div>
                  <Label className="text-sm font-bold text-slate-900 mb-2 block">AI Clarification Loop</Label>
                  <div className="space-y-3">
                    {[
                      { q: "What data sources will you use?", a: "QuickBooks API + Invoice emails" },
                      { q: "What are your success criteria?", a: "95% match rate within 2 hours" },
                      { q: "What's your rollback plan?", a: "Manual review queue for failed matches" }
                    ].map((item, idx) => (
                      <Card key={idx} className="border-2 border-emerald-200">
                        <CardContent className="p-3">
                          <div className="text-xs text-emerald-600 font-semibold mb-1">AI Question:</div>
                          <div className="text-sm text-slate-900 mb-2">{item.q}</div>
                          <Input placeholder="Your answer..." defaultValue={item.a} className="text-sm" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="mt-4 bg-emerald-100 border-emerald-300">
                    <CardContent className="p-3">
                      <div className="text-xs text-emerald-800 font-semibold mb-1">Generated Spec Preview:</div>
                      <pre className="text-xs bg-white p-2 rounded font-mono text-slate-700 overflow-x-auto">
{`mission:
  name: invoice_reconciler
  triggers: [schedule(Fri 9AM)]
  inputs: [quickbooks, email]
  guardrails: [human_review>$5K]`}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DATA MAPPER TAB */}
        <TabsContent value="data-mapper" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-amber-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Data Mapper</h3>
                  <p className="text-sm text-slate-600">Auto-discover data structures and create mappings</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Discovered Fields</h4>
                  <div className="space-y-2">
                    {discoveredFields.map((field, idx) => (
                      <Card key={idx} className="border-2 border-amber-200">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-amber-600" />
                              <span className="text-sm font-semibold text-slate-900">{field.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="text-xs bg-slate-100 text-slate-700">{field.type}</Badge>
                              {field.pii && (
                                <Badge className="text-xs bg-red-100 text-red-700">
                                  <Lock className="w-3 h-3 mr-1" />
                                  PII
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-slate-600">Source: {field.source}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Discover More Fields
                  </Button>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Field Mapping Builder</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded border-2 border-amber-200">
                      <div className="text-xs text-amber-600 font-semibold mb-2">Example Join:</div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-mono text-slate-900">Orders.customer_email</span>
                        <ArrowRight className="w-4 h-4 text-amber-600" />
                        <span className="font-mono text-slate-900">CRM.email</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded border-2 border-amber-200">
                      <div className="text-xs text-amber-600 font-semibold mb-2">Sample Row Test:</div>
                      <pre className="text-xs bg-slate-50 p-2 rounded font-mono text-slate-700">
{`{
  "customer_email": "john@example.com",
  "order_amount": 1247.50,
  "invoice_id": "INV-2024-001"
}`}
                      </pre>
                    </div>

                    <Card className="bg-emerald-50 border-emerald-200">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <div className="text-xs text-emerald-800 font-semibold">Mapping Validated</div>
                        </div>
                        <div className="text-xs text-slate-700">
                          All fields mapped successfully. PII fields flagged for encryption.
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SIMULATOR TAB */}
        <TabsContent value="simulator" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Wind className="w-6 h-6 text-cyan-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Simulator (Wind Tunnel)</h3>
                  <p className="text-sm text-slate-600">Test missions against historical data before deployment</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-bold text-slate-900 mb-2 block">Mission to Test</Label>
                  <Select defaultValue="invoice-reconciler">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice-reconciler">Invoice Reconciler</SelectItem>
                      <SelectItem value="crm-sync">CRM Sync Agent</SelectItem>
                      <SelectItem value="refund-handler">Refund Handler</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="mt-4">
                    <Label className="text-sm font-bold text-slate-900 mb-2 block">Historical Data Range</Label>
                    <Select defaultValue="30-days">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7-days">Last 7 days</SelectItem>
                        <SelectItem value="30-days">Last 30 days</SelectItem>
                        <SelectItem value="90-days">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700"
                    onClick={handleRunSimulation}
                    disabled={simulationRunning}
                  >
                    {simulationRunning ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Wind className="w-4 h-4" />
                        </motion.div>
                        Running Simulation...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Simulation
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  {simulationResult ? (
                    <div className="space-y-3">
                      <Card className={cn(
                        "border-2",
                        simulationResult.safeToExecute ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-slate-900">Simulation Results</h4>
                            <Badge className={cn(
                              "text-xs",
                              simulationResult.safeToExecute ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                            )}>
                              {simulationResult.safeToExecute ? "Safe to Execute" : "Not Safe"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="p-2 bg-white rounded">
                              <div className="text-xs text-slate-600">Confidence</div>
                              <div className="text-lg font-bold text-cyan-600">{simulationResult.confidence}%</div>
                            </div>
                            <div className="p-2 bg-white rounded">
                              <div className="text-xs text-slate-600">Risk Score</div>
                              <div className="text-lg font-bold text-amber-600">{simulationResult.riskScore}</div>
                            </div>
                            <div className="p-2 bg-white rounded">
                              <div className="text-xs text-slate-600">Predicted Cost</div>
                              <div className="text-sm font-bold text-slate-900">{simulationResult.predictedCost}</div>
                            </div>
                            <div className="p-2 bg-white rounded">
                              <div className="text-xs text-slate-600">Success Rate</div>
                              <div className="text-sm font-bold text-emerald-600">{simulationResult.predictedSuccessRate}</div>
                            </div>
                          </div>

                          <Progress value={simulationResult.confidence} className="h-2 mb-3" />
                        </CardContent>
                      </Card>

                      {simulationResult.warnings.length > 0 && (
                        <Card className="border-2 border-amber-300 bg-amber-50">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                              <div className="text-xs font-bold text-amber-900">Warnings</div>
                            </div>
                            <ul className="space-y-1">
                              {simulationResult.warnings.map((warning, idx) => (
                                <li key={idx} className="text-xs text-slate-700">• {warning}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {simulationResult.recommendations.length > 0 && (
                        <Card className="border-2 border-blue-200 bg-blue-50">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="w-4 h-4 text-blue-600" />
                              <div className="text-xs font-bold text-blue-900">Recommendations</div>
                            </div>
                            <ul className="space-y-1">
                              {simulationResult.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-xs text-slate-700">• {rec}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-cyan-300 rounded-lg p-12 text-center">
                      <Wind className="w-16 h-16 mx-auto mb-3 text-cyan-400" />
                      <p className="text-sm text-slate-600">Run simulation to see results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GUARDRAILS TAB */}
        <TabsContent value="guardrails" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Guardrails & Policies</h3>
                  <p className="text-sm text-slate-600">Set operational airspace limits for AI agents</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Clearance Levels (VFR/IFR Analogy)</h4>
                  <div className="space-y-2">
                    {clearanceLevels.map((level) => (
                      <Card
                        key={level.level}
                        className={cn(
                          "border-2 cursor-pointer transition-all",
                          clearanceLevel === level.level
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200 hover:border-red-200"
                        )}
                        onClick={() => {
                          setClearanceLevel(level.level);
                          toast.success(`Clearance level set to ${level.name}`);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                                `bg-${level.color}-600`
                              )}>
                                {level.level}
                              </div>
                              <span className="text-sm font-bold text-slate-900">{level.name}</span>
                            </div>
                            {clearanceLevel === level.level && (
                              <Check className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div className="text-xs text-slate-600">{level.description}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Global Caps</h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-slate-600 mb-1 block">Recipients per Hour</Label>
                      <Input
                        type="number"
                        value={globalCaps.recipientsPerHour}
                        onChange={(e) => setGlobalCaps({...globalCaps, recipientsPerHour: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600 mb-1 block">Spend per Day ($)</Label>
                      <Input
                        type="number"
                        value={globalCaps.spendPerDay}
                        onChange={(e) => setGlobalCaps({...globalCaps, spendPerDay: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600 mb-1 block">Rows Touched per Job</Label>
                      <Input
                        type="number"
                        value={globalCaps.rowsTouchedPerJob}
                        onChange={(e) => setGlobalCaps({...globalCaps, rowsTouchedPerJob: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600 mb-1 block">Markets Affected</Label>
                      <Input
                        type="number"
                        value={globalCaps.marketsAffected}
                        onChange={(e) => setGlobalCaps({...globalCaps, marketsAffected: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <Card className="mt-4 bg-red-100 border-red-300">
                    <CardContent className="p-3">
                      <div className="text-xs font-bold text-red-900 mb-1">Current Active Caps</div>
                      <div className="text-xs text-slate-700 space-y-1">
                        <div>✓ Max {globalCaps.recipientsPerHour} emails/hour</div>
                        <div>✓ Max ${globalCaps.spendPerDay}/day AI spend</div>
                        <div>✓ Max {globalCaps.rowsTouchedPerJob.toLocaleString()} records/job</div>
                        <div>✓ Max {globalCaps.marketsAffected} markets per operation</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EVALUATOR TAB */}
        <TabsContent value="evaluator" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FlaskConical className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Evaluator / A-B Harness</h3>
                  <p className="text-sm text-slate-600">Benchmark and compare AI flows and policies</p>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="border-2 border-indigo-200">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900">Experiment: Prompt Variant A vs B</h4>
                      <Badge className="bg-indigo-100 text-indigo-700 text-xs">Running</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white rounded border-2 border-slate-200">
                        <div className="text-xs font-bold text-slate-900 mb-2">Variant A (Control)</div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Success Rate:</span>
                            <span className="font-bold text-emerald-600">94.2%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Avg Latency:</span>
                            <span className="font-bold text-slate-900">840ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Cost/Run:</span>
                            <span className="font-bold text-amber-600">$0.024</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">ROUGE Score:</span>
                            <span className="font-bold text-blue-600">0.87</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-50 rounded border-2 border-indigo-300">
                        <div className="text-xs font-bold text-indigo-900 mb-2">Variant B (Test)</div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Success Rate:</span>
                            <span className="font-bold text-emerald-600">96.8% ↑</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Avg Latency:</span>
                            <span className="font-bold text-slate-900">720ms ↓</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Cost/Run:</span>
                            <span className="font-bold text-amber-600">$0.019 ↓</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">ROUGE Score:</span>
                            <span className="font-bold text-blue-600">0.91 ↑</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Card className="mt-4 bg-emerald-50 border-emerald-200">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          <div className="text-xs font-bold text-emerald-900">Recommendation</div>
                        </div>
                        <div className="text-xs text-slate-700">
                          Variant B shows 2.6% improvement in success rate and 14% cost reduction. Recommend deploying Variant B.
                        </div>
                        <Button size="sm" className="w-full mt-3 h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                          Deploy Variant B
                        </Button>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: "Workflow Path Test", status: "completed", winner: "Path B (+8% throughput)" },
                    { name: "Model Selection", status: "running", winner: "Testing..." },
                    { name: "Retry Logic", status: "scheduled", winner: "Starts tomorrow" }
                  ].map((exp, idx) => (
                    <Card key={idx} className="border-2 border-indigo-200">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold text-slate-900">{exp.name}</div>
                          <Badge className={cn(
                            "text-xs",
                            exp.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                            exp.status === "running" ? "bg-blue-100 text-blue-700" :
                            "bg-slate-100 text-slate-700"
                          )}>
                            {exp.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-600">{exp.winner}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COST GUARDIAN TAB */}
        <TabsContent value="cost-guardian" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Cost Guardian</h3>
                  <p className="text-sm text-slate-600">Financial intelligence for AI operations</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="border-2 border-green-200">
                  <CardContent className="p-4">
                    <div className="text-xs text-slate-600 mb-1">Daily Budget</div>
                    <div className="text-2xl font-bold text-slate-900">${costTracking.dailyBudget}</div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-blue-200">
                  <CardContent className="p-4">
                    <div className="text-xs text-slate-600 mb-1">Current Spend</div>
                    <div className="text-2xl font-bold text-blue-600">${costTracking.currentSpend}</div>
                  </CardContent>
                </Card>
                <Card className={cn(
                  "border-2",
                  costTracking.projectedSpend > costTracking.dailyBudget ? "border-red-300 bg-red-50" : "border-emerald-200"
                )}>
                  <CardContent className="p-4">
                    <div className="text-xs text-slate-600 mb-1">Projected (EOD)</div>
                    <div className={cn(
                      "text-2xl font-bold",
                      costTracking.projectedSpend > costTracking.dailyBudget ? "text-red-600" : "text-emerald-600"
                    )}>
                      ${costTracking.projectedSpend}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-slate-900">Budget Utilization</div>
                  <div className="text-sm text-slate-600">
                    {((costTracking.currentSpend / costTracking.dailyBudget) * 100).toFixed(1)}%
                  </div>
                </div>
                <Progress
                  value={(costTracking.currentSpend / costTracking.dailyBudget) * 100}
                  className="h-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="border-2 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Cost by Model</h4>
                    <div className="space-y-2 text-xs">
                      {[
                        { model: "GPT-4", cost: "$24.50", pct: 58 },
                        { model: "GPT-3.5", cost: "$12.20", pct: 29 },
                        { model: "Claude", cost: "$5.66", pct: 13 }
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-600">{item.model}</span>
                            <span className="font-bold text-slate-900">{item.cost}</span>
                          </div>
                          <Progress value={item.pct} className="h-1" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Optimization Opportunities</h4>
                    <div className="space-y-2">
                      {[
                        { action: "Switch to GPT-3.5 for drafts", saving: "$8.40/day" },
                        { action: "Enable batch processing", saving: "$3.20/day" },
                        { action: "Off-peak scheduling", saving: "$2.10/day" }
                      ].map((opp, idx) => (
                        <div key={idx} className="p-2 bg-purple-50 rounded border border-purple-200">
                          <div className="text-xs text-slate-900 mb-1">{opp.action}</div>
                          <div className="flex items-center justify-between">
                            <Badge className="text-xs bg-emerald-100 text-emerald-700">
                              Save {opp.saving}
                            </Badge>
                            <Button size="sm" variant="outline" className="h-5 text-xs px-2">
                              Apply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {costTracking.projectedSpend > costTracking.dailyBudget && (
                <Card className="mt-4 border-2 border-red-300 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-red-900 mb-1">Budget Alert</div>
                        <div className="text-xs text-slate-700">
                          Projected spend exceeds daily budget by ${(costTracking.projectedSpend - costTracking.dailyBudget).toFixed(2)}. 
                          Consider applying cost optimizations or increasing budget.
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Auto-Optimize
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
