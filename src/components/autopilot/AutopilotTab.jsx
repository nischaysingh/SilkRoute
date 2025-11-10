import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Power, Shield, TrendingUp, AlertTriangle, Activity, DollarSign, 
  CheckCircle, Pause, Play, Brain, Target, ArrowUp, ArrowDown, Lock, 
  Eye, Gauge, FlaskConical, MessageCircle, Lightbulb, Network, 
  BookOpen, LineChart, Microscope, ArrowUpCircle, Rocket, Wifi, 
  MessageSquare, ArrowRight, TrendingDown, GitBranch, Vote, Layers,
  Radio, Scale, History, Users, BarChart3, ArrowLeftRight, Boxes,
  Zap, Globe, Timer, Shrink, RotateCw, TrendingUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart as RechartsLineChart, Line, ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AutopilotTab() {
  const [autopilotEnabled, setAutopilotEnabled] = useState(true);
  const [safetyMode, setSafetyMode] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [emergencyContext, setEmergencyContext] = useState(null);
  const [activeView, setActiveView] = useState("overview");
  const [selectedNode, setSelectedNode] = useState(null);

  // Phase 5: Distributed Autonomy - Each mission runs its own autonomy loop
  const [autonomyNodes] = useState([
    {
      id: 1,
      mission: "Invoice Reconciler",
      localKPIs: { cost: 0.024, latency: 840, compliance: 98 },
      autonomyScore: 94,
      computeAllocation: 45,
      resourceRequests: [
        { to: "CRM Sync", type: "latency_budget", amount: "15ms", status: "approved" }
      ],
      lastNegotiation: "3m ago",
      consensusWeight: 0.28
    },
    {
      id: 2,
      mission: "Inventory Optimizer",
      localKPIs: { cost: 0.031, latency: 680, compliance: 99 },
      autonomyScore: 97,
      computeAllocation: 62,
      resourceRequests: [
        { to: "Finance Autopilot", type: "compute_credit", amount: "12%", status: "negotiating" }
      ],
      lastNegotiation: "8m ago",
      consensusWeight: 0.35
    },
    {
      id: 3,
      mission: "CRM Sync Agent",
      localKPIs: { cost: 0.019, latency: 720, compliance: 94 },
      autonomyScore: 89,
      computeAllocation: 38,
      resourceRequests: [],
      lastNegotiation: "12m ago",
      consensusWeight: 0.22
    },
    {
      id: 4,
      mission: "Customer Refund Handler",
      localKPIs: { cost: 0.027, latency: 920, compliance: 91 },
      autonomyScore: 76,
      computeAllocation: 28,
      resourceRequests: [
        { to: "Inventory Optimizer", type: "resource_trade", amount: "5ms", status: "pending" }
      ],
      lastNegotiation: "15m ago",
      consensusWeight: 0.15
    }
  ]);

  // Phase 5: Consensus Protocol - Democratic policy voting
  const [consensusVotes] = useState([
    {
      id: 1,
      policyName: "Cost-Reduction Policy v4",
      description: "Lower cost threshold from $0.05 to $0.04 per run",
      proposedBy: "Finance Autopilot",
      votes: [
        { agent: "Invoice Reconciler", vote: "approve", confidence: 87, reasoning: "Cost savings align with Q1 targets" },
        { agent: "Inventory Optimizer", vote: "approve", confidence: 78, reasoning: "Marginal impact on operations" },
        { agent: "CRM Sync", vote: "approve", confidence: 92, reasoning: "Strong support for efficiency" },
        { agent: "Refund Handler", vote: "reject", confidence: 65, reasoning: "May impact service quality" }
      ],
      consensusScore: 82,
      status: "ratified",
      threshold: 80,
      ratifiedAt: "2h ago"
    },
    {
      id: 2,
      policyName: "Latency Budget Redistribution",
      description: "Allocate 20ms from CRM to FP&A pipeline",
      proposedBy: "Ops Autopilot",
      votes: [
        { agent: "Invoice Reconciler", vote: "approve", confidence: 91 },
        { agent: "Inventory Optimizer", vote: "approve", confidence: 84 },
        { agent: "CRM Sync", vote: "abstain", confidence: 45 },
        { agent: "Refund Handler", vote: "approve", confidence: 73 }
      ],
      consensusScore: 75,
      status: "pending",
      threshold: 80,
      ratifiedAt: null
    }
  ]);

  // Phase 5: Meta-Reasoning - AI thinking about its thinking
  const [metaReasoningInsights] = useState([
    {
      id: 1,
      topic: "Model Selection Heuristic",
      observation: "Cost-first routing underperformed for high-priority tasks",
      metaAnalysis: "Prior assumption 'cheaper = better' failed for time-sensitive ops",
      improvement: "Weighted cost+priority composite scoring",
      performanceGain: "+7% accuracy in routing decisions",
      analyzedRuns: 847,
      confidence: 94,
      appliedAt: "1d ago"
    },
    {
      id: 2,
      topic: "Retry Logic Effectiveness",
      observation: "Exponential backoff caused unnecessary delays",
      metaAnalysis: "Most failures transient; linear delays suffice",
      improvement: "Adaptive retry: exponential only if >3 failures",
      performanceGain: "−180ms avg recovery time",
      analyzedRuns: 1243,
      confidence: 89,
      appliedAt: "3d ago"
    },
    {
      id: 3,
      topic: "Success Threshold Calibration",
      observation: "92% threshold too conservative for stable agents",
      metaAnalysis: "Analyzed 30-day trends; 89% stable, 3% variance",
      improvement: "Dynamic threshold: 89-94% based on volatility",
      performanceGain: "+11% autonomy capacity",
      analyzedRuns: 3421,
      confidence: 96,
      appliedAt: "5d ago"
    }
  ]);

  // Phase 5: Recursive Self-Optimization - Optimizing optimization itself
  const [recursiveOptimization] = useState({
    currentOptimizationRate: 4.2,
    historicalRate: [
      { week: "W1", rate: 2.1 },
      { week: "W2", rate: 3.4 },
      { week: "W3", rate: 4.8 },
      { week: "W4", rate: 4.2 },
      { week: "W5", rate: 4.1 }
    ],
    plateauDetected: true,
    explorationTriggered: true,
    newExperiments: [
      { name: "Parallel Pipeline Composition", status: "testing", expectedGain: "+8%" },
      { name: "Cross-Domain Cache Sharing", status: "simulating", expectedGain: "+5%" },
      { name: "Dynamic Batch Sizing", status: "scheduled", expectedGain: "+12%" }
    ],
    learningObjectiveReweights: [
      { objective: "Cost", oldWeight: 0.4, newWeight: 0.35 },
      { objective: "Accuracy", oldWeight: 0.3, newWeight: 0.35 },
      { objective: "Latency", oldWeight: 0.3, newWeight: 0.3 }
    ]
  });

  // Phase 5: Global Telemetry Mesh - Network-wide monitoring
  const [telemetryMesh] = useState({
    nodes: [
      { id: 1, name: "Invoice Reconciler", health: 98, load: 65, latency: 840, anomaly: false },
      { id: 2, name: "Inventory Optimizer", health: 99, load: 72, latency: 680, anomaly: false },
      { id: 3, name: "CRM Sync", health: 94, load: 58, latency: 720, anomaly: false },
      { id: 4, name: "Refund Handler", health: 87, load: 45, latency: 920, anomaly: true }
    ],
    networkHealth: 94,
    emergentPatterns: [
      {
        pattern: "Latency Ripple Effect",
        source: "Refund Handler",
        affected: ["Invoice Reconciler", "CRM Sync", "Payment Processor"],
        severity: "medium",
        action: "Pre-emptively rerouted 4 missions",
        detectedAt: "5m ago"
      }
    ],
    crossNodeMetrics: {
      avgLatency: 785,
      totalThroughput: 2847,
      networkStability: 96
    }
  });

  // Phase 5: Dynamic Governance - Self-rewriting policies
  const [dynamicPolicies] = useState([
    {
      id: 1,
      name: "Refund Threshold Policy",
      currentVersion: "v3.0",
      generatedFrom: "9 weeks behavioral data",
      logic: "IF amount > $1.5K AND customer_tier != 'VIP' THEN escalate",
      ethicalConstraint: "Never bypass human audit > $25K",
      autoExpiry: "30 days or 1000 runs",
      performanceVsPrevious: "+6% cost efficiency vs v2.1",
      createdAt: "2d ago",
      deprecated: ["v2.1 (over-compliance cost 9%)"]
    },
    {
      id: 2,
      name: "Latency Tolerance Function",
      currentVersion: "v4.2",
      generatedFrom: "API stability patterns + load correlation",
      logic: "Dynamic: 8-12% based on rolling 24h API health",
      ethicalConstraint: "Customer-facing always < 10%",
      autoExpiry: "14 days or significant drift",
      performanceVsPrevious: "+14% throughput vs static v3",
      createdAt: "1w ago",
      deprecated: ["v3.0 (static 10%)"]
    }
  ]);

  // Phase 5: Multi-Autopilot Negotiation
  const [autopilotNegotiations] = useState([
    {
      id: 1,
      from: "Finance Autopilot",
      to: "Inventory Autopilot",
      offer: "Lease 10ms latency budget",
      cost: "15 compute credits",
      predictedOutcome: "+4.8% margin for Finance, −2.1% latency for Inventory",
      simulationRuns: 847,
      confidence: 92,
      status: "accepted",
      executedAt: "45m ago"
    },
    {
      id: 2,
      from: "Ops Autopilot",
      to: "HR Autopilot",
      offer: "Share customer sentiment data",
      cost: "Priority access to task assignment queue",
      predictedOutcome: "+7% decision accuracy, +3% task completion",
      simulationRuns: 412,
      confidence: 84,
      status: "negotiating",
      executedAt: null
    }
  ]);

  // Phase 5: Mission Lifecycle Management
  const [lifecycleEvents] = useState([
    {
      id: 1,
      action: "merge",
      agents: ["Invoice Agent A", "Invoice Agent B"],
      result: "Invoice Agent Unified",
      reasoning: "Detected 67% overlapping operations + under-utilization",
      impact: "Saved $0.12/run, maintained 99.1% success",
      predictedVsActual: { costSaving: "predicted $0.10, actual $0.12" },
      executedAt: "3d ago"
    },
    {
      id: 2,
      action: "spawn",
      agent: "Payment Retry Specialist",
      reasoning: "Detected saturation in Payment Processor (load > 85%)",
      impact: "Offloaded 340 retries/day, +8% success rate",
      predictedVsActual: { throughput: "predicted +6%, actual +8%" },
      executedAt: "1w ago"
    },
    {
      id: 3,
      action: "retire",
      agent: "Legacy CRM Connector",
      reasoning: "Redundant after CRM Sync v2 deployment",
      impact: "Eliminated $18/month cost, 0 functionality loss",
      predictedVsActual: { costSaving: "predicted $15/mo, actual $18/mo" },
      executedAt: "2w ago"
    }
  ]);

  // Phase 5: Memory Graph & Evolution Timeline
  const [evolutionTimeline] = useState({
    missions: [
      {
        mission: "Invoice Reconciler",
        lineage: [
          { date: "Jan 2024", version: "v1.0", autonomy: 65, event: "Initial deployment" },
          { date: "Mar 2024", version: "v2.1", autonomy: 72, event: "Policy mutation (retry logic)" },
          { date: "Jun 2024", version: "v3.0", autonomy: 84, event: "Meta-optimization applied" },
          { date: "Sep 2024", version: "v3.8", autonomy: 89, event: "Consensus upgrade ratified" },
          { date: "Nov 2024", version: "v4.2", autonomy: 94, event: "Recursive self-tuning" }
        ],
        totalGain: "+29% autonomy, +48% efficiency over 18 months",
        causalLinks: [
          { from: "v2.1", to: "v3.0", reason: "Closed-loop feedback improved accuracy" },
          { from: "v3.0", to: "v3.8", reason: "Cross-agent learning fabric shared strategy" }
        ]
      }
    ],
    policyLineage: [
      { policy: "Latency Tolerance", versions: ["v1 (2024)", "v4 (2025)"], gain: "+48%" },
      { policy: "Cost Threshold", versions: ["v1 ($0.08)", "v4 ($0.04)"], gain: "+62%" }
    ]
  });

  // Phase 5: Ethics & Alignment Layer
  const [ethicsMonitoring] = useState([
    {
      id: 1,
      issue: "Goal Misalignment Detected",
      description: "Budget optimization conflicting with customer trust policy",
      severity: "high",
      detected: "Autopilot self-audit at 14:23",
      recommendation: "Seek human approval for cost-cutting in VIP segment",
      humanReviewRequested: true,
      status: "awaiting_approval",
      detectedAt: "2h ago"
    },
    {
      id: 2,
      issue: "Value Divergence Warning",
      description: "Aggressive latency optimization reducing accessibility compliance",
      severity: "medium",
      detected: "Alignment layer constraint violation",
      recommendation: "Roll back to v3.2 latency policy",
      humanReviewRequested: false,
      status: "auto_corrected",
      detectedAt: "1d ago"
    }
  ]);

  const aiDialogues = [
    {
      id: 3,
      from: "Autopilot",
      message: "Critical: External API showing degradation patterns. Recommend switching to backup endpoint.",
      suggested_actions: ["Switch Now", "Monitor", "Emergency Stop"],
      priority: "high",
      timestamp: "5m ago",
      responded: false
    }
  ];

  const agents = [
    {
      id: 1,
      name: "Invoice Reconciler",
      status: "running",
      autonomyLevel: 94,
      successRate: 97.8,
      executions24h: 1247,
      cost24h: 4.23,
      decisions24h: 892,
      confidence: { overall: 94, modelAccuracy: 96, costDeviation: 92 },
      intent: "accuracy"
    },
    {
      id: 2,
      name: "Inventory Optimizer",
      status: "running",
      autonomyLevel: 97,
      successRate: 99.1,
      executions24h: 2145,
      cost24h: 6.87,
      decisions24h: 1523,
      confidence: { overall: 97, modelAccuracy: 98, costDeviation: 96 },
      intent: "cost"
    }
  ];

  const totalExecutions = agents.reduce((sum, a) => sum + a.executions24h, 0);
  const totalCost = agents.reduce((sum, a) => sum + a.cost24h, 0);
  const totalDecisions = agents.reduce((sum, a) => sum + a.decisions24h, 0);
  const avgSuccessRate = agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length;

  const handleToggleAgent = (agent) => {
    const newStatus = agent.status === "running" ? "paused" : "running";
    toast.success(`${agent.name} ${newStatus === "running" ? "resumed" : "paused"}`);
  };

  const handleEmergencyStop = () => {
    setEmergencyContext({
      reason: "User-initiated emergency stop",
      activeAgents: agents.filter(a => a.status === "running").length,
      systemState: { avgLatency: "2.3s", errorRate: "3.2%", costBurn: "$0.62/min" },
      suggestedRecovery: "8 minutes",
      safeResumeConditions: ["Error rate drops below 2%", "All API endpoints respond < 1s"]
    });
    setAutopilotEnabled(false);
    toast.error("Emergency stop activated");
  };

  const handleResumeFromEmergency = () => {
    setEmergencyContext(null);
    setAutopilotEnabled(true);
    toast.success("Autopilot resumed");
  };

  const handleDialogueAction = (dialogue, action) => {
    if (action === "Switch Now") {
      toast.success("✓ Switching to backup endpoint", {
        description: "All traffic rerouted to backup API"
      });
    } else if (action === "Monitor") {
      toast.info("📊 Opening monitoring dashboard");
    } else if (action === "Emergency Stop") {
      handleEmergencyStop();
    }
  };

  const handleVoteAction = (vote, action) => {
    if (action === "approve") {
      toast.success(`Policy "${vote.policyName}" approved for deployment`, {
        description: `Consensus: ${vote.consensusScore}% (threshold: ${vote.threshold}%)`
      });
    } else {
      toast.info("Vote cast - awaiting final consensus");
    }
  };

  const handleNegotiationAction = (negotiation, action) => {
    if (action === "accept") {
      toast.success(`Negotiation accepted: ${negotiation.offer}`, {
        description: `Predicted outcome: ${negotiation.predictedOutcome}`
      });
    } else if (action === "counter") {
      toast.info("Counter-offer submitted to simulation");
    }
  };

  const handleEthicsReview = (issue, decision) => {
    if (decision === "approve") {
      toast.success("Ethics review approved", {
        description: `Proceeding with: ${issue.recommendation}`
      });
    } else {
      toast.warning("Ethics issue escalated to human oversight");
    }
  };

  const getStatusColor = (status) => {
    if (status === "running") return "bg-emerald-100 text-emerald-700";
    if (status === "paused") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-700";
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return "text-emerald-600";
    if (confidence >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getConfidenceBgColor = (confidence) => {
    if (confidence >= 90) return "bg-emerald-100";
    if (confidence >= 70) return "bg-amber-100";
    return "bg-red-100";
  };

  return (
    <div className="space-y-6">
      {/* Emergency Banner */}
      <AnimatePresence>
        {emergencyContext && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="bg-red-50 border-2 border-red-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-2">Emergency Stop Active</h3>
                    <Button onClick={handleResumeFromEmergency} className="bg-emerald-600 hover:bg-emerald-700">
                      <Play className="w-4 h-4 mr-2" />Resume Autopilot
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 text-white shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Globe className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Phase 5: Distributed Autonomy</h2>
                <p className="text-purple-100">Federated network of self-governing AI agents with consensus-driven evolution</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <MessageCircle className="w-4 h-4 mr-2" />AI Messages
              </Button>
              <div className={cn("flex items-center gap-3 px-4 py-2 rounded-lg border-2 bg-white/10 backdrop-blur-sm", autopilotEnabled ? "border-emerald-300" : "border-slate-300")}>
                <Power className={cn("w-5 h-5", autopilotEnabled ? "text-emerald-400" : "text-slate-400")} />
                <Switch checked={autopilotEnabled} onCheckedChange={setAutopilotEnabled} />
              </div>
              <Button variant="outline" onClick={handleEmergencyStop} className="bg-red-600/20 border-red-400 text-white hover:bg-red-600/30">
                <AlertTriangle className="w-4 h-4 mr-2" />E-Stop
              </Button>
            </div>
          </div>

          {/* Phase 5 Feature Pills */}
          <div className="grid grid-cols-5 gap-3 mt-6">
            {[
              { icon: Network, label: "Distributed" },
              { icon: Vote, label: "Consensus" },
              { icon: Brain, label: "Meta-Reasoning" },
              { icon: RotateCw, label: "Recursive" },
              { icon: Shield, label: "Ethics" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <feature.icon className="w-5 h-5 mb-1" />
                <div className="text-xs font-semibold">{feature.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distributed"><Network className="w-4 h-4 mr-2" />Distributed</TabsTrigger>
          <TabsTrigger value="consensus"><Vote className="w-4 h-4 mr-2" />Consensus</TabsTrigger>
          <TabsTrigger value="meta"><Brain className="w-4 h-4 mr-2" />Meta-Reasoning</TabsTrigger>
          <TabsTrigger value="recursive"><RotateCw className="w-4 h-4 mr-2" />Recursive</TabsTrigger>
          <TabsTrigger value="telemetry"><Radio className="w-4 h-4 mr-2" />Telemetry</TabsTrigger>
          <TabsTrigger value="governance"><Scale className="w-4 h-4 mr-2" />Governance</TabsTrigger>
          <TabsTrigger value="negotiation"><ArrowLeftRight className="w-4 h-4 mr-2" />Negotiation</TabsTrigger>
          <TabsTrigger value="lifecycle"><Boxes className="w-4 h-4 mr-2" />Lifecycle</TabsTrigger>
          <TabsTrigger value="memory"><History className="w-4 h-4 mr-2" />Memory</TabsTrigger>
          <TabsTrigger value="ethics"><Shield className="w-4 h-4 mr-2" />Ethics</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Network Nodes", value: autonomyNodes.length, icon: Network, color: "blue" },
              { label: "Consensus Score", value: "82%", icon: Vote, color: "emerald" },
              { label: "Total Executions", value: totalExecutions.toLocaleString(), icon: Activity, color: "purple" },
              { label: "Network Health", value: `${telemetryMesh.networkHealth}%`, icon: Wifi, color: "amber" }
            ].map((kpi, idx) => (
              <Card key={idx} className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 bg-${kpi.color}-100 rounded-lg`}>
                      <kpi.icon className={`w-4 h-4 text-${kpi.color}-600`} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
                  <div className="text-xs text-slate-600">{kpi.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="border-2 border-slate-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{agent.name}</h4>
                        <Badge className={cn("text-xs mt-1", getStatusColor(agent.status))}>{agent.status}</Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleToggleAgent(agent)} className="h-8 w-8 p-0">
                      {agent.status === "running" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className={cn("p-4 rounded-lg mb-4", getConfidenceBgColor(agent.confidence.overall))}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">Confidence</span>
                      <span className={cn("text-2xl font-bold", getConfidenceColor(agent.confidence.overall))}>{agent.confidence.overall}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-600">{agent.successRate}%</div>
                      <div className="text-xs text-slate-600">Success</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-900">{agent.executions24h}</div>
                      <div className="text-xs text-slate-600">Runs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{agent.decisions24h}</div>
                      <div className="text-xs text-slate-600">Decisions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-amber-600">${agent.cost24h}</div>
                      <div className="text-xs text-slate-600">Cost</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* DISTRIBUTED TAB */}
        <TabsContent value="distributed" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Network className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Distributed Autonomy Network</h3>
                  <p className="text-sm text-slate-600">Each mission runs its own autonomy loop with local KPI optimization</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {autonomyNodes.map((node) => (
                  <Card key={node.id} className={cn("border-2 cursor-pointer transition-all", selectedNode?.id === node.id ? "border-blue-300 bg-blue-50" : "border-slate-200")} onClick={() => setSelectedNode(node)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-900">{node.mission}</h4>
                        <Badge className="bg-blue-100 text-blue-700 text-xs">Autonomy: {node.autonomyScore}%</Badge>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Cost:</span>
                          <span className="font-semibold">${node.localKPIs.cost}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Latency:</span>
                          <span className="font-semibold">{node.localKPIs.latency}ms</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Compliance:</span>
                          <span className="font-semibold">{node.localKPIs.compliance}%</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-xs text-slate-600 mb-1">Compute Allocation</div>
                        <Progress value={node.computeAllocation} className="h-2" />
                        <div className="text-xs text-slate-500 mt-1">{node.computeAllocation}%</div>
                      </div>

                      {node.resourceRequests.length > 0 && (
                        <div className="pt-3 border-t border-slate-200">
                          <div className="text-xs font-semibold text-slate-900 mb-2">Resource Requests:</div>
                          {node.resourceRequests.map((req, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded">
                              <span className="text-slate-700">
                                {req.type} → {req.to}
                              </span>
                              <Badge className={cn("text-xs", req.status === "approved" ? "bg-emerald-100 text-emerald-700" : req.status === "negotiating" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700")}>
                                {req.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="text-xs text-slate-500 mt-2">
                        Consensus Weight: {node.consensusWeight} • Last negotiation: {node.lastNegotiation}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-4 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-700 italic">
                    💡 "Inventory Optimizer requested 12% extra compute; CRM Sync approved resource trade after efficiency audit."
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONSENSUS TAB */}
        <TabsContent value="consensus" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Vote className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Autonomy Consensus Protocol</h3>
                  <p className="text-sm text-slate-600">Democratic policy voting with confidence-weighted consensus</p>
                </div>
              </div>

              <div className="space-y-4">
                {consensusVotes.map((vote) => (
                  <Card key={vote.id} className={cn("border-2", vote.status === "ratified" ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50")}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-900 mb-1">{vote.policyName}</h4>
                          <p className="text-sm text-slate-700 mb-2">{vote.description}</p>
                          <div className="text-xs text-slate-600">Proposed by: {vote.proposedBy}</div>
                        </div>
                        <Badge className={cn("text-xs ml-3", vote.status === "ratified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                          {vote.status}
                        </Badge>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-900">Consensus Score</span>
                          <span className={cn("text-2xl font-bold", vote.consensusScore >= vote.threshold ? "text-emerald-600" : "text-amber-600")}>
                            {vote.consensusScore}%
                          </span>
                        </div>
                        <Progress value={vote.consensusScore} className="h-3" />
                        <div className="text-xs text-slate-600 mt-1">Threshold: {vote.threshold}%</div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-900 mb-2">Agent Votes:</div>
                        {vote.votes.map((agentVote, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", agentVote.vote === "approve" ? "bg-emerald-600" : agentVote.vote === "reject" ? "bg-red-600" : "bg-slate-400")} />
                              <span className="text-xs font-semibold text-slate-900">{agentVote.agent}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={cn("text-xs", agentVote.vote === "approve" ? "bg-emerald-100 text-emerald-700" : agentVote.vote === "reject" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700")}>
                                {agentVote.vote}
                              </Badge>
                              <span className="text-xs text-slate-600">{agentVote.confidence}%</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {vote.status === "ratified" && (
                        <div className="mt-3 p-2 bg-emerald-100 rounded text-xs text-emerald-800">
                          ✓ Ratified {vote.ratifiedAt}
                        </div>
                      )}

                      {vote.status === "pending" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" onClick={() => handleVoteAction(vote, "approve")} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                            Force Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleVoteAction(vote, "reject")} className="h-7 text-xs">
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-4 bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-700 italic">
                    💡 "Cost-reduction policy v4 ratified (82% consensus across Finance and Ops Autopilots)."
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* META-REASONING TAB */}
        <TabsContent value="meta" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Meta-Reasoning Layer</h3>
                  <p className="text-sm text-slate-600">AI thinking about its own thinking - operational introspection</p>
                </div>
              </div>

              <div className="space-y-4">
                {metaReasoningInsights.map((insight) => (
                  <Card key={insight.id} className="border-2 border-indigo-200 bg-white">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 mb-1">{insight.topic}</h4>
                          <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                            Confidence: {insight.confidence}%
                          </Badge>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                          {insight.performanceGain}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded">
                          <div className="text-xs font-semibold text-slate-900 mb-1">Observation:</div>
                          <div className="text-sm text-slate-700">{insight.observation}</div>
                        </div>

                        <div className="p-3 bg-indigo-50 rounded">
                          <div className="text-xs font-semibold text-indigo-900 mb-1">Meta-Analysis:</div>
                          <div className="text-sm text-slate-700">{insight.metaAnalysis}</div>
                        </div>

                        <div className="p-3 bg-emerald-50 rounded">
                          <div className="text-xs font-semibold text-emerald-900 mb-1">Improvement Applied:</div>
                          <div className="text-sm text-slate-700">{insight.improvement}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 text-xs">
                        <span className="text-slate-600">Analyzed {insight.analyzedRuns} runs</span>
                        <span className="text-slate-500">Applied {insight.appliedAt}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-4 bg-indigo-50 border-indigo-200">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-700 italic">
                    💡 "Model selection heuristic improved 7% after meta-analysis of last 30 simulations."
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RECURSIVE TAB */}
        <TabsContent value="recursive" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <RotateCw className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Recursive Self-Optimization</h3>
                  <p className="text-sm text-slate-600">Continuously benchmarking and evolving its own evolution process</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="border-2 border-emerald-200">
                  <CardContent className="p-4">
                    <div className="text-xs text-slate-600 mb-1">Current Optimization Rate</div>
                    <div className="text-3xl font-bold text-emerald-600 mb-2">{recursiveOptimization.currentOptimizationRate}%</div>
                    <ResponsiveContainer width="100%" height={60}>
                      <AreaChart data={recursiveOptimization.historicalRate}>
                        <defs>
                          <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="rate" stroke="#10b981" fill="url(#rateGradient)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className={cn("border-2", recursiveOptimization.plateauDetected ? "border-amber-300 bg-amber-50" : "border-slate-200")}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-bold text-slate-900">Plateau Detection</span>
                    </div>
                    <div className="text-sm text-slate-700 mb-3">
                      Optimization rate stagnation detected. Exploration mode triggered.
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                      ✓ Exploration Active
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-blue-200 mb-4">
                <CardContent className="p-5">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">New Exploration Experiments</h4>
                  <div className="space-y-2">
                    {recursiveOptimization.newExperiments.map((exp, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{exp.name}</div>
                          <div className="text-xs text-slate-600 mt-1">Expected: {exp.expectedGain}</div>
                        </div>
                        <Badge className={cn("text-xs", exp.status === "testing" ? "bg-blue-100 text-blue-700" : exp.status === "simulating" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700")}>
                          {exp.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200">
                <CardContent className="p-5">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Learning Objective Reweights</h4>
                  <div className="space-y-3">
                    {recursiveOptimization.learningObjectiveReweights.map((obj, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-900">{obj.objective}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600">{obj.oldWeight}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="text-xs font-bold text-purple-600">{obj.newWeight}</span>
                          </div>
                        </div>
                        <Progress value={obj.newWeight * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4 bg-emerald-50 border-emerald-200">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-700 italic">
                    💡 "Detected optimization stagnation; launched 3 new simulated orchestration strategies."
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TELEMETRY TAB */}
        <TabsContent value="telemetry" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Radio className="w-6 h-6 text-cyan-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Global Telemetry Mesh</h3>
                  <p className="text-sm text-slate-600">Real-time network health monitoring and emergent pattern detection</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="border-2 border-cyan-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-cyan-600 mb-1">{telemetryMesh.networkHealth}%</div>
                    <div className="text-xs text-slate-600">Network Health</div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{telemetryMesh.crossNodeMetrics.avgLatency}ms</div>
                    <div className="text-xs text-slate-600">Avg Latency</div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{telemetryMesh.crossNodeMetrics.totalThroughput}</div>
                    <div className="text-xs text-slate-600">Total Throughput</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {telemetryMesh.nodes.map((node) => (
                  <Card key={node.id} className={cn("border-2", node.anomaly ? "border-red-300 bg-red-50" : "border-slate-200")}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-900">{node.name}</h4>
                        {node.anomaly && <Badge className="bg-red-100 text-red-700 text-xs">Anomaly</Badge>}
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <div className="text-slate-600">Health</div>
                          <div className={cn("font-bold", node.health >= 95 ? "text-emerald-600" : "text-amber-600")}>{node.health}%</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Load</div>
                          <div className="font-bold text-slate-900">{node.load}%</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Latency</div>
                          <div className="font-bold text-slate-900">{node.latency}ms</div>
                        </div>
                      </div>

                      <Progress value={node.health} className="h-2 mt-3" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {telemetryMesh.emergentPatterns.map((pattern, idx) => (
                <Card key={idx} className="border-2 border-amber-300 bg-amber-50">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900 mb-1">{pattern.pattern}</h4>
                        <div className="text-sm text-slate-700 mb-2">
                          Source: <span className="font-semibold">{pattern.source}</span>
                        </div>
                        <div className="text-sm text-slate-700 mb-2">
                          Affected: {pattern.affected.join(", ")}
                        </div>
                        <div className="p-2 bg-emerald-100 rounded text-xs text-emerald-800 mb-2">
                          ✓ Action Taken: {pattern.action}
                        </div>
                        <div className="text-xs text-slate-500">Detected {pattern.detectedAt}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="mt-4 bg-cyan-50 border-cyan-200">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-700 italic">
                    💡 "Detected latency ripple from Refund Handler → pre-emptively rerouted 4 missions."
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GOVERNANCE TAB */}
        <TabsContent value="governance" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-6 h-6 text-violet-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Dynamic Governance Engine</h3>
                  <p className="text-sm text-slate-600">Self-rewriting policies generated from behavioral data</p>
                </div>
              </div>

              <div className="space-y-4">
                {dynamicPolicies.map((policy) => (
                  <Card key={policy.id} className="border-2 border-violet-200">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 mb-1">{policy.name}</h4>
                          <Badge className="bg-violet-100 text-violet-700 text-xs">{policy.currentVersion}</Badge>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                          {policy.performanceVsPrevious}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded">
                          <div className="text-xs font-semibold text-slate-900 mb-1">Generated From:</div>
                          <div className="text-sm text-slate-700">{policy.generatedFrom}</div>
                        </div>

                        <div className="p-3 bg-violet-50 rounded">
                          <div className="text-xs font-semibold text-violet-900 mb-1">Policy Logic:</div>
                          <div className="text-sm font-mono text-slate-700">{policy.logic}</div>
                        </div>

                        <div className="p-3 bg-red-50 border border-red-200 rounded">
                          <div className="text-xs font-semibold text-red-900 mb-1">Ethical Constraint:</div>
                          <div className="text-sm text-slate-700">{policy.ethicalConstraint}</div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Auto-expiry: {policy.autoExpiry}</span>
                          <span className="text-slate-500">Created {policy.createdAt}</span>
                        </div>

                        {policy.deprecated.length > 0 && (
                          <div className="pt-3 border-t border-slate-200">
                            <div className="text-xs font-semibold text-slate-900 mb-1">Deprecated:</div>
                            {policy.deprecated.map((dep, idx) => (
                              <div key={idx} className="text-xs text-slate-600">{dep}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-4 bg-violet-50 border-violet-200">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-700 italic">
                    💡 "Deprecated v2.1 refund policy due to 9% over-compliance cost; generated v3.0 with 6% tolerance."
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NEGOTIATION TAB */}
        <TabsContent value="negotiation" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <ArrowLeftRight className="w-6 h-6 text-pink-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Cross-Autopilot Negotiation</h3>
                  <p className="text-sm text-slate-600">Machine-to-machine economic coordination and resource trading</p>
                </div>
              </div>

              <div className="space-y-4">
                {autopilotNegotiations.map((negotiation) => (
                  <Card key={negotiation.id} className={cn("border-2", negotiation.status === "accepted" ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50")}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-pink-600 rounded-lg">
                            <ArrowLeftRight className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-xs text-slate-600 mb-1">
                              {negotiation.from} → {negotiation.to}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">{negotiation.offer}</h4>
                          </div>
                        </div>
                        <Badge className={cn("text-xs", negotiation.status === "accepted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                          {negotiation.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="p-3 bg-white rounded border border-slate-200">
                          <div className="text-xs text-slate-600 mb-1">Cost</div>
                          <div className="text-sm font-semibold text-slate-900">{negotiation.cost}</div>
                        </div>
                        <div className="p-3 bg-white rounded border border-slate-200">
                          <div className="text-xs text-slate-600 mb-1">Confidence</div>
                          <div className="text-sm font-semibold text-purple-600">{negotiation.confidence}%</div>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded mb-3">
                        <div className="text-xs font-semibold text-blue-900 mb-1">Predicted Outcome:</div>
                        <div className="text-sm text-slate-700">{negotiation.predictedOutcome}</div>
                      </div>

                      <div className="text-xs text-slate-600 mb-3">
                        Simulation runs: {negotiation.simulationRuns}
                      </div>

                      {negotiation.status === "negotiating" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleNegotiationAction(negotiation, "accept")} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleNegotiationAction(negotiation, "counter")} className="h-7 text-xs">
                            Counter Offer
                          </Button>
                        </div>
                      )}

                      {negotiation.status === "accepted" && negotiation.executedAt && (
                        <div className="text-xs text-emerald-700">✓ Executed {negotiation.executedAt}</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-4 bg-pink-50 border-pink-200">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-700 italic">
                    💡 "Finance Autopilot leased 10ms bandwidth to Inventory Autopilot → Predicted +4.8% margin."
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LIFECYCLE TAB */}
        <TabsContent value="lifecycle" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Boxes className="w-6 h-6 text-teal-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Predictive Mission Lifecycle Manager</h3>
                  <p className="text-sm text-slate-600">Autonomous spawning, merging, and retirement of agents</p>
                </div>
              </div>

              <div className="space-y-4">
                {lifecycleEvents.map((event) => (
                  <Card key={event.id} className={cn("border-2", event.action === "merge" ? "border-purple-300 bg-purple-50" : event.action === "spawn" ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50")}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={cn("p-2 rounded-lg", event.action === "merge" ? "bg-purple-600" : event.action === "spawn" ? "bg-emerald-600" : "bg-amber-600")}>
                          {event.action === "merge" && <Shrink className="w-5 h-5 text-white" />}
                          {event.action === "spawn" && <Zap className="w-5 h-5 text-white" />}
                          {event.action === "retire" && <Timer className="w-5 h-5 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={cn("text-xs uppercase", event.action === "merge" ? "bg-purple-100 text-purple-700" : event.action === "spawn" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                              {event.action}
                            </Badge>
                            <span className="text-xs text-slate-500">{event.executedAt}</span>
                          </div>

                          {event.action === "merge" && (
                            <div className="text-sm font-semibold text-slate-900 mb-2">
                              {event.agents.join(" + ")} → {event.result}
                            </div>
                          )}
                          {event.action === "spawn" && (
                            <div className="text-sm font-semibold text-slate-900 mb-2">
                              Spawned: {event.agent}
                            </div>
                          )}
                          {event.action === "retire" && (
                            <div className="text-sm font-semibold text-slate-900 mb-2">
                              Retired: {event.agent}
                            </div>
                          )}

                          <div className="p-3 bg-white rounded border border-slate-200 mb-2">
                            <div className="text-xs font-semibold text-slate-900 mb-1">Reasoning:</div>
                            <div className="text-sm text-slate-700">{event.reasoning}</div>
                          </div>

                          <div className="p-3 bg-emerald-50 rounded border border-emerald-200 mb-2">
                            <div className="text-xs font-semibold text-emerald-900 mb-1">Impact:</div>
                            <div className="text-sm text-slate-700">{event.impact}</div>
                          </div>

                          <div className="text-xs text-slate-600">
                            {event.predictedVsActual && Object.keys(event.predictedVsActual).map((key) => (
                              <div key={key}>{event.predictedVsActual[key]}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-4 bg-teal-50 border-teal-200">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-700 italic">
                    💡 "Merged two under-utilized invoice agents → Saved $0.12/run, maintained 99.1% success."
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MEMORY TAB */}
        <TabsContent value="memory" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <History className="w-6 h-6 text-slate-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Long-Term Memory & Evolution Timeline</h3>
                  <p className="text-sm text-slate-600">Complete decision lineage and autonomy maturation history</p>
                </div>
              </div>

              {evolutionTimeline.missions.map((mission, idx) => (
                <Card key={idx} className="border-2 border-blue-200 mb-6">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-900">{mission.mission}</h4>
                      <Badge className="bg-blue-100 text-blue-700">
                        Current: {mission.currentLevel}% autonomy
                      </Badge>
                    </div>

                    <div className="relative">
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-blue-200" />
                      <div className="space-y-6">
                        {mission.lineage.map((entry, entryIdx) => (
                          <div key={entryIdx} className="relative pl-14">
                            <div className="absolute left-0 top-1 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow">
                              <span className="text-sm font-bold text-blue-600">{entry.autonomy}%</span>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-slate-900">{entry.version}</span>
                                <span className="text-xs text-slate-600">{entry.date}</span>
                              </div>
                              <div className="text-sm text-slate-700">{entry.event}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 p-3 bg-emerald-50 rounded border border-emerald-200">
                      <div className="text-sm font-semibold text-emerald-900">Total Evolution:</div>
                      <div className="text-sm text-slate-700">{mission.totalGain}</div>
                    </div>

                    {mission.causalLinks.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs font-semibold text-slate-900 mb-2">Causal Links:</div>
                        <div className="space-y-1">
                          {mission.causalLinks.map((link, linkIdx) => (
                            <div key={linkIdx} className="text-xs text-slate-700 pl-3 border-l-2 border-blue-300">
                              {link.from} → {link.to}: {link.reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <Card className="border-2 border-purple-200">
                <CardContent className="p-5">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Policy Evolution Lineage</h4>
                  <div className="space-y-3">
                    {evolutionTimeline.policyLineage.map((policy, idx) => (
                      <div key={idx} className="p-3 bg-purple-50 rounded border border-purple-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-slate-900">{policy.policy}</span>
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">{policy.gain}</Badge>
                        </div>
                        <div className="text-xs text-slate-600">
                          Evolution: {policy.versions.join(" → ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4 bg-slate-50 border-slate-200">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-700 italic">
                    💡 "Latency policy lineage: v1 (2024) → v7 (2025); Avg efficiency gain +48% over 18 months."
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ETHICS TAB */}
        <TabsContent value="ethics" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Global Ethics & Alignment Layer</h3>
                  <p className="text-sm text-slate-600">Value alignment monitoring and mission drift detection</p>
                </div>
              </div>

              <div className="space-y-4">
                {ethicsMonitoring.map((issue) => (
                  <Card key={issue.id} className={cn("border-2", issue.severity === "high" ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50")}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded-lg", issue.severity === "high" ? "bg-red-600" : "bg-amber-600")}>
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-slate-900">{issue.issue}</h4>
                            <Badge className={cn("text-xs", issue.severity === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                              {issue.severity} severity
                            </Badge>
                          </div>

                          <div className="p-3 bg-white rounded border border-slate-200 mb-3">
                            <div className="text-sm text-slate-700">{issue.description}</div>
                          </div>

                          <div className="p-3 bg-blue-50 rounded border border-blue-200 mb-3">
                            <div className="text-xs font-semibold text-blue-900 mb-1">Detected By:</div>
                            <div className="text-sm text-slate-700">{issue.detected}</div>
                          </div>

                          <div className="p-3 bg-emerald-50 rounded border border-emerald-200 mb-3">
                            <div className="text-xs font-semibold text-emerald-900 mb-1">Recommendation:</div>
                            <div className="text-sm text-slate-700">{issue.recommendation}</div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge className={cn("text-xs", issue.status === "awaiting_approval" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                              {issue.status.replace("_", " ")}
                            </Badge>
                            <span className="text-xs text-slate-500">{issue.detectedAt}</span>
                          </div>

                          {issue.humanReviewRequested && issue.status === "awaiting_approval" && (
                            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                              <Button size="sm" onClick={() => handleEthicsReview(issue, "approve")} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                                Approve Recommendation
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEthicsReview(issue, "escalate")} className="h-7 text-xs">
                                Escalate Further
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-4 bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-700 italic">
                    💡 "Detected goal misalignment in budget optimization vs customer trust policy — seeking approval."
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}