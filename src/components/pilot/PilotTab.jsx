
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sparkles, Plus, Activity, TrendingUp, DollarSign, AlertCircle,
  Search, List, RefreshCw, FlaskConical, Brain, Terminal, Zap, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";

import MissionCommandCard from "../pilot/MissionCommandCard";
import FlightPlanEditor from "../pilot/FlightPlanEditor";
import MissionDetailDrawer from "../pilot/MissionDetailDrawer";
import AIAssistDrawer from "../pilot/AIAssistDrawer";
import AICoPilotSuggestions from "../pilot/AICoPilotSuggestions";
import FlightPlanVisualizer from "../pilot/FlightPlanVisualizer";
import AutonomyControlPanel from "../pilot/AutonomyControlPanel";
import ImpactFeed from "../pilot/ImpactFeed";
import AIFlightSim from "../pilot/AIFlightSim";
import MissionExplainDrawer from "../pilot/MissionExplainDrawer";

// Existing adaptive components
import AILearningPanel from "../pilot/AILearningPanel";
import { CoPilotToggle, CoPilotAvatar, CoPilotChatPanel, CollaborationTimeline } from "../pilot/CoPilotCollabMode";
import AnomalyFeed from "../pilot/AnomalyFeed"; // This will be replaced in JSX by ProactiveMitigationEngine
import AutomationToolbar from "../pilot/AutomationToolbar";
import CommandConsole from "../pilot/CommandConsole";
import ReasoningMap from "../pilot/ReasoningMap";
import MissionPulse2 from "../pilot/MissionPulse2";
import EnergyIndicator from "../pilot/EnergyIndicator";

// Phase 3.5 - Co-Pilot Fusion Components (New imports)
import FusionStreamBar from "../pilot/FusionStreamBar";
import AIThreadWorkspace from "../pilot/AIThreadWorkspace";
import FusionMap from "../pilot/FusionMap";
import CollaborativeCanvas from "../pilot/CollaborativeCanvas";
import MissionImpactForecaster from "../pilot/MissionImpactForecaster";
import MissionMemoryCard from "../pilot/MissionMemoryCard";
import AmbientFeedback from "../pilot/AmbientFeedback";
import FusionFlightLog from "../pilot/FusionFlightLog";
import VoiceCommandConsole from "../pilot/VoiceCommandConsole";

// Phase 4 - Autopilot Symphony Components
import AIOrchestrationView from "../pilot/AIOrchestrationView";
import BehavioralTimeline from "../pilot/BehavioralTimeline";
import AITuningStrip from "../pilot/AITuningStrip";
import CommandPriorityToggle from "../pilot/CommandPriorityToggle";
import ForesightDashboard from "../pilot/ForesightDashboard";
import AINegotiationFeed from "../pilot/AINegotiationFeed";
import SymphonyScore from "../pilot/SymphonyScore";
import AIExplainDrawer from "../pilot/AIExplainDrawer";
import HandoffAnimation from "../pilot/HandoffAnimation";

// Phase 4.5 - Command & Optimization Layer Components
import CommandCenter from "../pilot/CommandCenter";
import SmartScenariosPanel from "../pilot/SmartScenariosPanel";
import MissionBrief from "../pilot/MissionBrief";
import FusionPathDrawer from "../pilot/FusionPathDrawer";
import OperationalIntelligenceIndex from "../pilot/OperationalIntelligenceIndex";
import ProactiveMitigationEngine from "../pilot/ProactiveMitigationEngine"; // New Import
import AIAgentTrainingPipeline from "../pilot/AIAgentTrainingPipeline"; // New Import

// Phase 5 - Full Autonomy Components
import MissionBrain from "../pilot/MissionBrain";
import SelfOptimizationEngine from "../pilot/SelfOptimizationEngine";
import ScenarioStudio from "../pilot/ScenarioStudio";
import InsightEngine from "../pilot/InsightEngine";
import StrategicFusionDashboard from "../pilot/StrategicFusionDashboard";
import ExplainApproveDrawer from "../pilot/ExplainApproveDrawer";

export default function PilotTab() {
  const [viewMode, setViewMode] = useState("list");
  const [activeTab, setActiveTab] = useState("command");
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [routeFilter, setRouteFilter] = useState("all");
  const [selectedMission, setSelectedMission] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [aiAssistOpen, setAiAssistOpen] = useState(false);
  const [flightSimOpen, setFlightSimOpen] = useState(false);
  const [explainDrawerOpen, setExplainDrawerOpen] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [impacts, setImpacts] = useState([]);

  // Co-Pilot Mode State
  const [coPilotEnabled, setCoPilotEnabled] = useState(false);
  const [coPilotHint, setCoPilotHint] = useState(null);
  const [coPilotChatOpen, setCoPilotChatOpen] = useState(false);
  const [coPilotMessages, setCoPilotMessages] = useState([
    { id: 1, from: "copilot", text: "Co-Pilot mode activated. I'll monitor and suggest optimizations.", timestamp: new Date().toISOString() }
  ]);
  const [collaborationActions, setCollaborationActions] = useState([]);

  // Phase 3.5 - Fusion Mode State (New state variables)
  const [fusionMode, setFusionMode] = useState(false);
  const [pilotActivity, setPilotActivity] = useState("Standing by");
  const [copilotActivity, setCopilotActivity] = useState("Monitoring system");
  const [fusionFlightLog, setFusionFlightLog] = useState([]);
  const [voiceConsoleOpen, setVoiceConsoleOpen] = useState(false);
  const [systemConfidence, setSystemConfidence] = useState(92);

  // Phase 4 - Autopilot Symphony State
  const [commandPriority, setCommandPriority] = useState("shared");
  const [aiExplainDrawerOpen, setAiExplainDrawerOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [handoffAnimation, setHandoffAnimation] = useState(null);
  const [behavioralEvents, setBehavioralEvents] = useState([
    {
      id: 1,
      agent: "pilot",
      action: "Reduced retry count from 3 to 2",
      reason: "94% success rate on first retry - third attempt wasteful",
      timestamp: "10:23 AM",
      outcome: {
        score: 7.8,
        latency: -150,
        cost: -0.004,
        success: 96
      }
    },
    {
      id: 2,
      agent: "copilot",
      action: "Switched to balanced profile",
      reason: "Cost-save profile causing 2% accuracy degradation",
      timestamp: "9:45 AM",
      outcome: {
        score: 5.2,
        latency: 40,
        cost: 0.003,
        success: 98
      }
    },
    {
      id: 3,
      agent: "autopilot",
      action: "Enabled aggressive caching",
      reason: "47% repeat queries within 1hr window detected",
      timestamp: "9:12 AM",
      outcome: {
        score: 12.3,
        latency: -220,
        cost: -0.012,
        success: 94
      }
    }
  ]);

  const [aiNegotiations, setAiNegotiations] = useState([
    {
      id: 1,
      conversation: [
        { agent: "copilot", message: "Recommending aggressive concurrency increase to 18" },
        { agent: "pilot", message: "Conflict detected — risk exceeds threshold at 18. Max safe: 15" },
        { agent: "autopilot", message: "Proposal accepted at 15 with safety guard enabled" }
      ],
      resolution: {
        status: "accepted",
        decision: "Concurrency set to 15 with monitoring",
        metric: "Risk ↓ 12%"
      }
    },
    {
      id: 2,
      conversation: [
        { agent: "pilot", message: "Detecting latency spike pattern - suggest reroute" },
        { agent: "copilot", message: "Analysis confirms - external API degraded. Reroute approved" },
        { agent: "autopilot", message: "Executing reroute with circuit breaker enabled" }
      ],
      resolution: {
        status: "accepted",
        decision: "Rerouted with circuit breaker",
        metric: "Latency ↓ 280ms"
      }
    }
  ]);

  // Phase 4.5 - New State
  const [fusionPathOpen, setFusionPathOpen] = useState(false);

  // Command Console (existing state)
  const [commandConsoleOpen, setCommandConsoleOpen] = useState(false);

  // Phase 5 - New State
  const [explainApproveOpen, setExplainApproveOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Anomalies
  const [anomalies, setAnomalies] = useState([
    {
      id: 1,
      severity: "medium",
      title: "Retry storm detected in batch_pick_opt_v2",
      description: "External API returning 429 rate limits, causing 3x retry attempts",
      detectedAt: "2 minutes ago",
      potentialMitigations: [
        { name: "Dynamic rate limit adjustment", estimatedImpact: { errorReduction: 30, costSavings: 0.005 } },
        { name: "Temporary circuit breaker", estimatedImpact: { errorReduction: 50, costSavings: 0.002 } }
      ]
    },
    {
      id: 2,
      severity: "high",
      title: "Model latency ↑ 230ms in last hour",
      description: "gpt-4o-mini response time increased significantly during peak hours",
      detectedAt: "15 minutes ago",
      potentialMitigations: [
        { name: "Scale up inference nodes", estimatedImpact: { latencyReduction: 100, costIncrease: 0.01 } },
        { name: "Switch to smaller model for non-critical path", estimatedImpact: { latencyReduction: 150, costSavings: 0.008 } }
      ]
    }
  ]);

  // AI Decisions for Reasoning Map
  const [aiDecisions] = useState([
    {
      id: 1,
      title: "Route to Pilot",
      type: "routing",
      confidence: 94,
      timestamp: "10:23 AM",
      latency: 45,
      outcome: "High-risk customer request routed to manual review",
      inputs: ["Customer: VIP", "PII detected", "Value: $5,200"],
      reasoning: [
        "Customer flagged as VIP requiring special handling",
        "PII detected in payload, triggering compliance review",
        "Transaction value exceeds $5,000 threshold"
      ],
      impact: { cost: "$0.045", sla: "2.5h", risk: "Low" },
      guards: ["PII masking", "VIP escalation", "Manual approval gate"]
    },
    {
      id: 2,
      title: "Auto-optimize batch",
      type: "optimization",
      confidence: 88,
      timestamp: "10:15 AM",
      latency: 120,
      outcome: "Switched 15 tasks to parallel processing",
      inputs: ["Queue depth: 42", "Avg latency: 1240ms", "Cost pressure: Medium"],
      reasoning: [
        "Queue depth exceeding threshold of 30 items",
        "Identified 15 independent tasks suitable for parallelization",
        "Cost analysis shows acceptable trade-off"
      ],
      impact: { latency: "-680ms", throughput: "+35%", cost: "+$0.08" },
      guards: ["Concurrency limit", "Budget check", "SLA validation"]
    }
  ]);

  // Mock missions data
  const [missions, setMissions] = useState([
    {
      id: 1,
      name: "invoice_chase_v1",
      owner: "finance@acme.com",
      route: "pilot",
      state: "running",
      priority: "High",
      lastRun: "5m ago",
      successRate: 94,
      avgLatency: 842,
      tokensPerRun: 950,
      spendPerRun: "0.025",
      lastRuns: Array.from({ length: 10 }, () => ({ success: Math.random() > 0.1 ? 1 : 0 }))
    },
    {
      id: 2,
      name: "batch_pick_opt_v2",
      owner: "ops@acme.com",
      route: "copilot",
      state: "paused",
      priority: "Medium",
      lastRun: "2h ago",
      successRate: 88,
      avgLatency: 1240,
      tokensPerRun: 1200,
      spendPerRun: "0.032",
      lastRuns: Array.from({ length: 10 }, () => ({ success: Math.random() > 0.15 ? 1 : 0 }))
    },
    {
      id: 3,
      name: "ar_collection_push",
      owner: "finance@acme.com",
      route: "autopilot",
      state: "queued",
      priority: "High",
      lastRun: "Never",
      successRate: 0,
      avgLatency: 0,
      tokensPerRun: 850,
      spendPerRun: "0.022",
      lastRuns: []
    },
    {
      id: 4,
      name: "price_rebalance_weekly",
      owner: "ops@acme.com",
      route: "autopilot",
      state: "running",
      priority: "Medium",
      lastRun: "15m ago",
      successRate: 96,
      avgLatency: 680,
      tokensPerRun: 750,
      spendPerRun: "0.019",
      lastRuns: Array.from({ length: 10 }, () => ({ success: Math.random() > 0.05 ? 1 : 0 }))
    }
  ]);

  // Auto-select first mission on mount
  useEffect(() => {
    if (missions.length > 0 && !selectedMission) {
      setSelectedMission(missions[0]);
    }
  }, [missions]);

  // Fusion Mode Effects (New useEffect)
  useEffect(() => {
    if (!fusionMode) return;

    // Simulate dynamic activity updates
    const activityInterval = setInterval(() => {
      const pilotActions = [
        "Running simulation mode",
        "Analyzing batch_pick_opt_v2",
        "Validating policy compliance",
        "Processing queue depth: 42"
      ];
      const copilotActions = [
        "Predicting SLA breach in 15min",
        "Optimizing cost profile",
        "Monitoring latency trends",
        "Analyzing anomaly pattern #7"
      ];

      setPilotActivity(pilotActions[Math.floor(Math.random() * pilotActions.length)]);
      setCopilotActivity(copilotActions[Math.floor(Math.random() * copilotActions.length)]);
    }, 5000);

    return () => clearInterval(activityInterval);
  }, [fusionMode]);

  // Co-Pilot hints
  useEffect(() => {
    if (!coPilotEnabled) return;

    const hintTimer = setTimeout(() => {
      setCoPilotHint("I can optimize batch_pick_opt_v2 for parallel processing. Approve?");
    }, 5000);

    return () => clearTimeout(hintTimer);
  }, [coPilotEnabled]);

  // KPI calculations
  const activeMissions = missions.filter(m => m.state === "running").length;
  const totalRuns = missions.reduce((sum, m) => sum + (m.lastRuns?.length || 0), 0);
  const successfulRuns = missions.reduce((sum, m) =>
    sum + (m.lastRuns?.filter(r => r.success === 1).length || 0), 0
  );
  const launchSuccessRate = totalRuns > 0 ? ((successfulRuns / totalRuns) * 100).toFixed(1) : 0;
  const avgTokens = Math.round(missions.reduce((sum, m) => sum + m.tokensPerRun, 0) / missions.length);
  const spendPerHour = (missions.filter(m => m.state === "running")
    .reduce((sum, m) => sum + parseFloat(m.spendPerRun), 0) * 2).toFixed(2);
  const incidents24h = anomalies.length;

  const kpiSparklineData = Array.from({ length: 24 }, () => ({ value: Math.random() * 100 }));

  // Filtered missions
  const filteredMissions = missions.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = stateFilter === "all" || m.state === stateFilter;
    const matchesRoute = routeFilter === "all" || m.route === routeFilter;
    return matchesSearch && matchesState && matchesRoute;
  });

  // Handlers
  const handleLaunch = (mission) => {
    setMissions(prev => prev.map(m =>
      m.id === mission.id ? { 
        ...m, 
        state: "running",
        lastRun: "Just now",
        successRate: Math.min(m.successRate + Math.random() * 2, 99),
        lastRuns: [...(m.lastRuns || []), { success: 1 }]
      } : m
    ));
    toast.success(`Mission launched: ${mission.name}`);
    addFusionLogEntry(`Launched ${mission.name}`, "pilot", "completed");
    addActivity(`Launched ${mission.name}`, "pilot", "launch");
    addImpact({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: `${mission.name} successfully launched`,
      improvement: "Active",
      actor: "pilot",
      type: "launch"
    });
    setSystemConfidence(prev => Math.min(prev + 1, 99));
  };

  const handlePause = (mission) => {
    setMissions(prev => prev.map(m =>
      m.id === mission.id ? { ...m, state: "paused" } : m
    ));
    toast.warning(`Mission paused: ${mission.name}`);
    addFusionLogEntry(`Paused ${mission.name}`, "pilot", "completed");
    addActivity(`Paused ${mission.name}`, "pilot", "pause");
    setSystemConfidence(prev => Math.max(prev - 1, 80));
  };

  const handleAbort = (mission) => {
    setMissions(prev => prev.map(m =>
      m.id === mission.id ? { ...m, state: "failed" } : m
    ));
    toast.error(`Mission aborted: ${mission.name}`);
    addFusionLogEntry(`Aborted ${mission.name}`, "pilot", "completed");
    addActivity(`Aborted ${mission.name}`, "pilot", "abort");
    setSystemConfidence(prev => Math.max(prev - 2, 75));
  };

  const handleReroute = (mission) => {
    const oldRoute = mission.route;
    const newRoute = mission.route === "pilot" ? "copilot" :
                     mission.route === "copilot" ? "autopilot" : "pilot";

    setHandoffAnimation({ fromAgent: oldRoute, toAgent: newRoute, missionId: mission.id });

    setTimeout(() => {
      setMissions(prev => prev.map(m =>
        m.id === mission.id ? { 
          ...m, 
          route: newRoute,
          avgLatency: Math.max(m.avgLatency - 50, 300),
          successRate: Math.min(m.successRate + 1, 99)
        } : m
      ));
      toast.success(`Rerouted to ${newRoute}`);
      addFusionLogEntry(`Rerouted ${mission.name} to ${newRoute}`, "copilot", "completed");
      addActivity(`Rerouted ${mission.name} to ${newRoute}`, "copilot", "reroute");
      addImpact({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        message: `${mission.name} rerouted to ${newRoute}`,
        improvement: "-50ms latency",
        actor: newRoute,
        type: "reroute"
      });
      setSystemConfidence(prev => Math.min(prev + 1, 99));
      setHandoffAnimation(null);
    }, 2000);
  };

  const handleExplain = (mission) => {
    setSelectedMission(mission);
    setExplainDrawerOpen(true);
  };

  const handleOpenPlan = (mission) => {
    setSelectedMission(mission);
  };

  const handleInsertPlan = (plan) => {
    toast.success("Flight plan inserted", {
      description: "You can now review and edit the plan"
    });
    addActivity("Flight plan template inserted", "pilot", "plan");
  };

  const handleApplySuggestion = (suggestion) => {
    // Apply the suggestion to the mission
    const improvement = suggestion.impact.costReduction ? `-$${suggestion.impact.costReduction.toFixed(3)}` : `+${suggestion.impact.successImprovement}%`;
    
    if (suggestion.impact.costReduction && selectedMission) {
      setMissions(prev => prev.map(m =>
        m.id === selectedMission.id ? {
          ...m,
          spendPerRun: (parseFloat(m.spendPerRun) - suggestion.impact.costReduction).toFixed(3)
        } : m
      ));
    }
    
    if (suggestion.impact.successImprovement && selectedMission) {
      setMissions(prev => prev.map(m =>
        m.id === selectedMission.id ? {
          ...m,
          successRate: Math.min(m.successRate + suggestion.impact.successImprovement, 99)
        } : m
      ));
    }

    toast.success("Optimization applied", {
      description: suggestion.title
    });
    
    addImpact({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: suggestion.title,
      improvement,
      actor: "autopilot",
      type: "optimization"
    });
    addFusionLogEntry(`Applied suggestion: ${suggestion.title}`, "autopilot", "completed");
    setSystemConfidence(prev => Math.min(prev + 1, 99));
  };

  const handleApplyOptimization = (mission, optimization) => {
    // Update mission metrics based on optimization
    setMissions(prev => prev.map(m => {
      if (m.id === mission.id) {
        const updates = {};
        if (optimization.estimatedSavings) {
          const savingsMatch = optimization.estimatedSavings.match(/\$?([\d.]+)/);
          if (savingsMatch) {
            updates.spendPerRun = Math.max(parseFloat(m.spendPerRun) - parseFloat(savingsMatch[1]), 0.001).toFixed(3);
          }
        }
        if (optimization.latencyReduction) {
          updates.avgLatency = Math.max(m.avgLatency - optimization.latencyReduction, 200);
        }
        return { ...m, ...updates };
      }
      return m;
    }));
    
    toast.success("Optimization applied", {
      description: optimization.title
    });
    
    addImpact({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: optimization.title,
      improvement: optimization.estimatedSavings || "Optimized",
      actor: mission.route,
      type: "optimization"
    });
    addFusionLogEntry(`Applied optimization: ${optimization.title}`, mission.route, "completed");
    setSystemConfidence(prev => Math.min(prev + 1, 99));
  };

  const handleCoPilotHintApprove = () => {
    const targetMission = missions.find(m => m.name === "batch_pick_opt_v2");
    if (targetMission) {
      setMissions(prev => prev.map(m =>
        m.name === "batch_pick_opt_v2" ? {
          ...m,
          avgLatency: Math.max(m.avgLatency - 200, 300),
          successRate: Math.min(m.successRate + 3, 99)
        } : m
      ));
      addImpact({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        message: "Optimized batch_pick_opt_v2 for parallel processing",
        improvement: "-200ms, +3% success",
        actor: "copilot",
        type: "optimization"
      });
    }
    setCoPilotHint(null);
    toast.success("Co-Pilot optimization approved and applied");
    addFusionLogEntry("Optimized batch_pick_opt_v2 for parallel processing", "copilot", "completed");
    setSystemConfidence(prev => Math.min(prev + 2, 99));
  };

  const handleCoPilotHintDismiss = () => {
    setCoPilotHint(null);
    toast.info("Co-Pilot suggestion dismissed");
  };

  const handleCoPilotMessage = (message) => {
    setCoPilotMessages(prev => [...prev, {
      id: prev.length + 1,
      from: "user",
      text: message,
      timestamp: new Date().toISOString()
    }]);

    if (fusionMode) {
      addFusionLogEntry(message, "user");
    }

    // Simulate Co-Pilot response with more specific answers
    setTimeout(() => {
      const responses = [
        "I've analyzed the mission data. The batch_pick_opt_v2 latency can be reduced by 18% through parallel processing.",
        "Based on current patterns, I recommend increasing the concurrency limit for invoice_chase_v1.",
        "I've detected an opportunity to optimize cost by switching the model for ar_collection_push.",
        "The system is running efficiently. All missions are within optimal parameters."
      ];
      
      setCoPilotMessages(prev => [...prev, {
        id: prev.length + 1,
        from: "copilot",
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString()
      }]);
      
      if (fusionMode) {
        addFusionLogEntry("Co-Pilot analysis complete", "copilot", "completed");
      }
    }, 1000);
  };

  const handleAutoOptimize = (mode) => {
    addFusionLogEntry(`Auto-optimization initiated (${mode} mode)`, "pilot", "pending");
    
    // Actually optimize missions
    setTimeout(() => {
      setMissions(prev => prev.map(m => ({
        ...m,
        avgLatency: Math.max(m.avgLatency - Math.floor(Math.random() * 100), 300),
        spendPerRun: Math.max(parseFloat(m.spendPerRun) - 0.002, 0.01).toFixed(3),
        successRate: Math.min(m.successRate + Math.random() * 2, 99)
      })));
      
      addImpact({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        message: `Auto-optimization complete (${mode} mode)`,
        improvement: "All missions optimized",
        actor: "autopilot",
        type: "optimization"
      });
      addFusionLogEntry(`Auto-optimization complete (${mode} mode)`, "autopilot", "completed");
      toast.success("Auto-optimization complete", {
        description: `${missions.length} missions optimized`
      });
      setSystemConfidence(prev => Math.min(prev + 3, 99));
    }, 2000);
  };

  const handleBalanceLoad = () => {
    // Actually rebalance missions
    const autopilotMissions = missions.filter(m => m.route === "autopilot").length;
    const pilotMissions = missions.filter(m => m.route === "pilot").length;
    
    if (pilotMissions > autopilotMissions + 1) {
      const missionToMove = missions.find(m => m.route === "pilot" && m.state === "running");
      if (missionToMove) {
        setMissions(prev => prev.map(m =>
          m.id === missionToMove.id ? { ...m, route: "autopilot" } : m
        ));
        addImpact({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          message: `${missionToMove.name} moved to Autopilot for load balancing`,
          improvement: "Balanced",
          actor: "pilot",
          type: "rebalance"
        });
      }
    }
    
    addFusionLogEntry("Load balancing: missions redistributed for optimal throughput", "pilot", "completed");
    toast.success("Load balanced", {
      description: "Missions redistributed across agents"
    });
    setSystemConfidence(prev => Math.min(prev + 1, 99));
  };

  const handleCommandExecute = (command) => {
    toast.success(`Executed: ${command}`);
    addFusionLogEntry(`Command executed: ${command}`, "user", "completed");
    addActivity(`Command: ${command}`, "user", "command");
  };

  const handleInvestigateAnomaly = (anomaly) => {
    toast.info("Opening detailed anomaly report...");
  };

  const handleAutoMitigate = (anomaly) => {
    setAnomalies(prev => prev.filter(a => a.id !== anomaly.id));
    toast.success("Auto-mitigation applied", {
      description: "Anomaly resolved automatically"
    });
    addFusionLogEntry(`Auto-mitigated: ${anomaly.title}`, "pilot", "completed");
    setSystemConfidence(prev => Math.min(prev + 2, 99));
  };

  const handleIgnoreAnomaly = (anomaly) => {
    setAnomalies(prev => prev.filter(a => a.id !== anomaly.id));
    toast.info("Anomaly dismissed");
  };

  // New Handlers for Phase 3.5
  const handleConvertToWorkflow = (proposedChanges) => {
    toast.success("Changes converted to workflow", {
      description: "Flight plan updated"
    });
    if (fusionMode) {
      addFusionLogEntry("Conversation converted to workflow automation", "copilot", "completed");
    }
    addActivity("Workflow created from conversation", "copilot", "workflow");
  };

  const handleApplyHandoff = (recommendation) => {
    toast.success("Handoff recommendation applied", {
      description: recommendation.action
    });
    if (fusionMode) {
      addFusionLogEntry(recommendation.action, "pilot", "completed");
    }
    addActivity(recommendation.action, "pilot", "handoff");
  };

  // New Handlers for Phase 4
  const handleReplayEvent = (event) => {
    toast.info("Running alternative simulation...", {
      description: `Testing with different AI agent`
    });
    
    setTimeout(() => {
      toast.success("Simulation complete", {
        description: "Alternative approach shows +5% improvement"
      });
      addActivity(`Replayed: ${event.action}`, "autopilot", "simulation");
    }, 2000);
  };

  const handleLockConfiguration = (config) => {
    toast.success("Configuration locked", {
      description: `${config.name} is now permanent`
    });
    addFusionLogEntry(`Locked configuration: ${config.name}`, "pilot", "completed");
    addActivity(`Locked: ${config.name}`, "pilot", "lock");
  };

  // New handlers for Proactive Mitigation (Phase 4.5)
  const handleApplyMitigation = (anomaly, strategy) => {
    setAnomalies(prev => prev.filter(a => a.id !== anomaly.id));
    
    // Update affected mission metrics
    const affectedMission = missions.find(m => anomaly.title.includes(m.name));
    if (affectedMission) {
      setMissions(prev => prev.map(m =>
        m.id === affectedMission.id ? {
          ...m,
          avgLatency: strategy.estimatedImpact.latencyReduction 
            ? Math.max(m.avgLatency - strategy.estimatedImpact.latencyReduction, 300)
            : m.avgLatency,
          successRate: strategy.estimatedImpact.errorReduction
            ? Math.min(m.successRate + (strategy.estimatedImpact.errorReduction / 10), 99)
            : m.successRate
        } : m
      ));
    }
    
    addFusionLogEntry(`Applied mitigation: ${strategy.name} for ${anomaly.title}`, "autopilot", "completed");
    addActivity(`Mitigated: ${anomaly.title}`, "autopilot", "mitigation");
    addImpact({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: `Mitigated: ${anomaly.title}`,
      improvement: strategy.estimatedImpact.errorReduction ? `-${strategy.estimatedImpact.errorReduction}% errors` : "Optimized",
      actor: "autopilot",
      type: "mitigation"
    });
    toast.success("Proactive mitigation applied", {
      description: `Strategy '${strategy.name}' applied successfully`
    });
    setSystemConfidence(prev => Math.min(prev + 2, 99));
  };

  // Phase 5 - New Handlers
  const handleExplainDecision = (decision) => {
    setSelectedDecision(decision);
    setAiExplainDrawerOpen(true);
  };

  const handleOptimizationApplied = (data) => {
    // Apply optimizations to missions
    setMissions(prev => prev.map(m => ({
      ...m,
      successRate: Math.min(m.successRate + (data.totalImpact.success || 0), 99),
      avgLatency: Math.max(m.avgLatency + (data.totalImpact.latency || 0), 200),
      spendPerRun: Math.max(parseFloat(m.spendPerRun) + (data.totalImpact.cost || 0), 0.01).toFixed(3)
    })));
    
    addFusionLogEntry(`Self-optimization: ${data.rules[0].rule}`, "autopilot", "completed");
    addActivity(data.rules[0].rule, "autopilot", "self-optimization");
    addImpact({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: data.rules[0].rule,
      improvement: `+${data.totalImpact.success}%`,
      actor: "autopilot",
      type: "optimization"
    });
    setSystemConfidence(prev => Math.min(prev + 2, 99));
  };

  const handleApplyScenario = (scenario) => {
    setPendingAction({
      title: `Apply Scenario: ${scenario.name}`,
      description: scenario.description || "Execute this simulation strategy",
      confidence: 92,
      reasoning: [
        "Simulation predicts significant improvement in target metrics",
        "Historical data supports this optimization approach",
        "Risk level is acceptable for current operational state"
      ],
      impact: scenario.impact || { success: "+6%", cost: "-8%", latency: "-150ms" },
      scenario
    });
    setExplainApproveOpen(true);
  };

  const handleExplainInsight = (insight) => {
    setPendingAction({
      title: `Apply Recommendation: ${insight.metric}`,
      description: insight.recommendation,
      confidence: 89,
      reasoning: insight.evidence || [],
      impact: { change: insight.change },
      insight
    });
    setExplainApproveOpen(true);
  };

  const handleSetObjective = (objective) => {
    toast.success("Enterprise objective set", {
      description: `All missions will align to: ${objective.goal}`
    });
    addFusionLogEntry(`New objective: ${objective.goal}`, "pilot", "completed");
    addActivity(`Objective set: ${objective.goal}`, "pilot", "objective");
  };

  const handleApproveAction = (action) => {
    // Actually apply the action to missions
    if (action.scenario) {
      setMissions(prev => prev.map(m => {
        const updates = {};
        if (action.scenario.impact.success) {
          // Assume success is a string like "+6%"
          const successChange = parseFloat(action.scenario.impact.success.replace('%', ''));
          updates.successRate = Math.min(m.successRate + successChange, 99);
        }
        if (action.scenario.impact.cost) {
          // Assume cost is a string like "-8%"
          const costChange = parseFloat(action.scenario.impact.cost.replace('%', ''));
          updates.spendPerRun = Math.max(parseFloat(m.spendPerRun) * (1 + costChange / 100), 0.001).toFixed(3);
        }
        if (action.scenario.impact.latency) {
          // Assume latency is a string like "-150ms"
          const latencyChange = parseFloat(action.scenario.impact.latency.replace('ms', ''));
          updates.avgLatency = Math.max(m.avgLatency + latencyChange, 200);
        }
        return { ...m, ...updates };
      }));
      
      addImpact({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        message: action.title,
        improvement: action.scenario.impact.success || action.scenario.impact.cost || "Applied",
        actor: "user",
        type: "approval"
      });
    } else if (action.insight) {
      // Logic for applying insights, e.g., if insight suggests a direct change
      setMissions(prev => prev.map(m => {
        const updates = {};
        if (action.insight.metric === "latency" && action.insight.change) {
          updates.avgLatency = Math.max(m.avgLatency + action.insight.change, 200);
        }
        if (action.insight.metric === "cost" && action.insight.change) {
          updates.spendPerRun = Math.max(parseFloat(m.spendPerRun) + action.insight.change, 0.001).toFixed(3);
        }
        return { ...m, ...updates };
      }));
      
      addImpact({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        message: action.title,
        improvement: `Changed ${action.insight.metric} by ${action.insight.change}`,
        actor: "user",
        type: "approval"
      });
    }
    
    toast.success("Action approved and executed");
    addFusionLogEntry(`Approved: ${action.title}`, "user", "completed");
    addActivity(action.title, "user", "approval");
    setExplainApproveOpen(false);
    setPendingAction(null);
    setSystemConfidence(prev => Math.min(prev + 1, 99));
  };

  const handleRejectAction = (action) => {
    toast.info("Action rejected");
    addFusionLogEntry(`Rejected: ${action.title}`, "user", "completed");
    addActivity(`Rejected: ${action.title}`, "user", "rejection");
    setExplainApproveOpen(false);
    setPendingAction(null);
  };

  const handleUndoAction = (action) => {
    toast.success("Action reverted");
    addFusionLogEntry(`Reverted: ${action.title}`, "user", "completed");
    addActivity(`Reverted: ${action.title}`, "user", "undo");
    // In a real scenario, this would trigger an actual undo operation
  };

  const addActivity = (message, actor, type) => {
    const newActivity = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      message,
      actor,
      type
    };
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  const addImpact = (impact) => {
    setImpacts(prev => [impact, ...prev.slice(0, 9)]);
  };

  const addCollabAction = (action) => {
    setCollaborationActions(prev => [action, ...prev.slice(0, 9)]);
  };

  // New utility function for Fusion Flight Log
  const addFusionLogEntry = (message, actor, status) => {
    const entry = {
      id: Date.now() + Math.random(),
      message,
      actor,
      status,
      timestamp: new Date().toISOString()
    };
    setFusionFlightLog(prev => [entry, ...prev.slice(0, 29)]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("mission-search")?.focus();
      }
      if (e.key.toLowerCase() === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setAiAssistOpen(true);
      }
      // New shortcut for Voice Command Console
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setVoiceConsoleOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-4 relative pb-8">
      {/* Ambient Feedback System (New component) */}
      <AmbientFeedback
        systemConfidence={systemConfidence}
        fusionActive={fusionMode}
        activeMissions={activeMissions}
      />

      {/* Handoff Animation */}
      {handoffAnimation && (
        <HandoffAnimation
          fromAgent={handoffAnimation.fromAgent}
          toAgent={handoffAnimation.toAgent}
          missionId={handoffAnimation.missionId}
          onComplete={() => setHandoffAnimation(null)}
        />
      )}

      {/* Operational Intelligence Index (Replacing old Symphony Score placement) */}
      <div className="relative z-10 grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <SymphonyScore
            score={systemConfidence}
            onOpenHarmonyView={() => {
              toast.info("Opening AI Harmony analysis...");
            }}
          />
        </div>
        <div className="col-span-4">
          <OperationalIntelligenceIndex score={systemConfidence} />
        </div>
      </div>

      {/* Fusion Stream Bar (New component) */}
      {fusionMode && (
        <div className="relative z-10">
          <FusionStreamBar
            pilotActivity={pilotActivity}
            copilotActivity={copilotActivity}
            fusionMode={fusionMode}
          />
        </div>
      )}

      {/* Top Bar with Fusion Toggle and Command Center */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          {/* Replaced CoPilotToggle with Fusion Mode Switch */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200">
            <Label htmlFor="fusion-mode" className="text-xs font-semibold text-slate-900 cursor-pointer flex items-center gap-2">
              <Zap className="w-3 h-3 mr-1" />
              🧩 Fusion Mode
            </Label>
            <Switch
              id="fusion-mode"
              checked={fusionMode}
              onCheckedChange={(checked) => {
                setFusionMode(checked);
                setCoPilotEnabled(checked); // Fusion mode implies Co-Pilot is enabled
                if (checked) {
                  toast.success("Fusion Mode Activated", {
                    description: "Dual-AI workspace enabled"
                  });
                  addFusionLogEntry("Fusion mode activated - collaborative AI workspace online", "pilot", "completed");
                } else {
                  toast.info("Fusion Mode Deactivated");
                }
              }}
              className="scale-75"
            />
          </div>

          {fusionMode && ( // Now conditional on fusionMode
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCoPilotChatOpen(true)}
                className="h-8 text-xs border-purple-300 bg-purple-50 hover:bg-purple-100"
              >
                <Brain className="w-3 h-3 mr-1" />
                Open Chat
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFusionPathOpen(true)}
                className="h-8 text-xs border-purple-300 bg-purple-50 hover:bg-purple-100"
              >
                <Zap className="w-3 h-3 mr-1" />
                Fusion Path
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <EnergyIndicator activeMissions={activeMissions} totalLoad={activeMissions * 18} />
          <MissionBrief missions={missions} />
          <AutomationToolbar
            onAutoOptimize={handleAutoOptimize}
            onBalanceLoad={handleBalanceLoad}
            onAskAI={() => setCoPilotChatOpen(true)}
          />
          {/* Replaced Command Console button with Voice Command Console button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setVoiceConsoleOpen(true)} // Opens VoiceCommandConsole
            className="h-8 text-xs border-slate-200 bg-white hover:bg-slate-50"
          >
            <Terminal className="w-3 h-3 mr-1" />
            Voice (⌘K)
          </Button>
        </div>
      </div>

      {/* Global Header KPIs */}
      <div className="grid grid-cols-5 gap-3 relative z-10">
        {[
          { label: "Active Missions", value: activeMissions, icon: Activity, color: "emerald" },
          { label: "Launch Success", value: `${launchSuccessRate}%`, icon: TrendingUp, color: "blue" },
          { label: "Avg Tokens/Run", value: avgTokens, icon: Activity, color: "purple" },
          { label: "Spend/hr", value: `$${spendPerHour}`, icon: DollarSign, color: "amber" },
          { label: "Anomalies", value: incidents24h, icon: AlertCircle, color: "red" }
        ].map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={cn(
              "bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden",
              kpi.label === "Anomalies" && kpi.value > 0 && "border-red-300 animate-pulse"
            )}>
              {kpi.label === "Anomalies" && kpi.value > 0 && (
                <motion.div
                  className="absolute inset-0 bg-red-400 opacity-10"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <CardContent className="p-3 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-600">{kpi.label}</span>
                  <div className={cn(
                    "p-1 rounded",
                    kpi.color === "emerald" && "bg-emerald-100",
                    kpi.color === "blue" && "bg-blue-100",
                    kpi.color === "purple" && "bg-purple-100",
                    kpi.color === "amber" && "bg-amber-100",
                    kpi.color === "red" && "bg-red-100"
                  )}>
                    <kpi.icon className={cn(
                      "w-3 h-3",
                      kpi.color === "emerald" && "text-emerald-600",
                      kpi.color === "blue" && "text-blue-600",
                      kpi.color === "purple" && "text-purple-600",
                      kpi.color === "amber" && "text-amber-600",
                      kpi.color === "red" && "text-red-600"
                    )} />
                  </div>
                </div>
                <div className="text-xl font-bold text-slate-900 mb-1">{kpi.value}</div>
                <ResponsiveContainer width="100%" height={20}>
                  <LineChart data={kpiSparklineData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={
                        kpi.color === "emerald" ? "#10b981" :
                        kpi.color === "blue" ? "#3b82f6" :
                        kpi.color === "purple" ? "#8b5cf6" :
                        kpi.color === "amber" ? "#f59e0b" : "#ef4444"
                      }
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between relative z-10">
        <h2 className="text-lg font-bold text-slate-900">
          {fusionMode ? "🤝 Co-Pilot Fusion Workspace" : "Mission Control"}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFlightSimOpen(true)}
            className="h-8 text-xs border-slate-200 bg-white hover:bg-slate-50"
          >
            <FlaskConical className="w-3 h-3 mr-1" />
            Flight Sim
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAiAssistOpen(true)}
            className="h-8 text-xs border-slate-200 bg-white hover:bg-slate-50"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            AI Assist
          </Button>
          <Button
            size="sm"
            onClick={() => setAiAssistOpen(true)}
            className="h-8 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-3 h-3 mr-1" />
            New Mission
          </Button>
        </div>
      </div>

      {/* Tabs for Command / Fusion / Reasoning / Timeline / Training */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="relative z-10">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg">
          <TabsTrigger value="command">Command</TabsTrigger>
          {fusionMode && <TabsTrigger value="orchestra">Orchestra</TabsTrigger>}
          {fusionMode && <TabsTrigger value="fusion">Fusion Map</TabsTrigger>}
          <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
          {fusionMode && <TabsTrigger value="canvas">Canvas</TabsTrigger>}
          {fusionMode && <TabsTrigger value="foresight">Foresight</TabsTrigger>}
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="autonomy">🧠 Autonomy</TabsTrigger>
        </TabsList>

        <TabsContent value="command" className="space-y-4 mt-4">
          {/* Command Center (New component) */}
          <CommandCenter onExecuteCommand={handleCommandExecute} />

          {/* Shared Cockpit Layout */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left: Pilot Command View */}
            <div className="col-span-12 lg:col-span-6 space-y-3">
              {/* AI Learning Panel */}
              <AILearningPanel
                mission={selectedMission}
                onGenerateReport={() => {
                  toast.success("Generating insight report...");
                }}
              />

              {/* Smart Scenarios Panel (New component) */}
              {selectedMission && (
                <SmartScenariosPanel
                  mission={selectedMission}
                  onApplyScenario={(scenario) => {
                    toast.success(`Applied scenario: ${scenario.name}`);
                    addFusionLogEntry(`Applied optimization scenario: ${scenario.name}`, "pilot", "completed");
                  }}
                />
              )}

              {/* Toolbar */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400" />
                      <Input
                        id="mission-search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search missions... (press / to focus)"
                        className="pl-8 h-8 text-xs"
                      />
                    </div>
                    <Select value={stateFilter} onValueChange={setStateFilter}>
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="queued">Queued</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={routeFilter} onValueChange={setRouteFilter}>
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Routes</SelectItem>
                        <SelectItem value="pilot">Pilot</SelectItem>
                        <SelectItem value="copilot">Copilot</SelectItem>
                        <SelectItem value="autopilot">Autopilot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Mission Cards */}
              <div className="space-y-3 overflow-y-auto">
                <AnimatePresence>
                  {filteredMissions.length === 0 ? (
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
                      <CardContent className="p-8 text-center">
                        <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm text-slate-600 mb-3">No missions match your filters</p>
                        <Button
                          size="sm"
                          onClick={() => setAiAssistOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Create from Template
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredMissions.map((mission, idx) => (
                      <motion.div
                        key={mission.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="space-y-2"
                      >
                        {/* Command Priority Toggle */}
                        <div className="flex items-center justify-between">
                          <CommandPriorityToggle
                            value={commandPriority}
                            onChange={setCommandPriority}
                            mission={mission}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleExplainDecision({
                              action: `Route to ${mission.route}`,
                              agent: mission.route,
                              mission: mission.name
                            })}
                            className="h-7 text-xs text-slate-600 hover:text-slate-900"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Explain
                          </Button>
                        </div>

                        <MissionCommandCard
                          mission={mission}
                          onLaunch={handleLaunch}
                          onPause={handlePause}
                          onAbort={handleAbort}
                          onReroute={handleReroute}
                          onExplain={handleExplain}
                          onOpenPlan={handleOpenPlan}
                          onClick={() => {
                            setSelectedMission(mission);
                            setDetailDrawerOpen(true);
                          }}
                        />

                        {/* AI Tuning Strip */}
                        {mission.state === "running" && (
                          <AITuningStrip
                            mission={mission}
                            onLockConfiguration={handleLockConfiguration}
                          />
                        )}

                        {/* AI Thread Workspace (Conversational Mission Building) */}
                        {fusionMode && selectedMission?.id === mission.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2"
                          >
                            <AIThreadWorkspace
                              mission={mission}
                              onConvertToWorkflow={handleConvertToWorkflow}
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Mission Impact Forecaster (New component) */}
              {fusionMode && (
                <MissionImpactForecaster
                  missions={missions}
                  onApplyHandoff={handleApplyHandoff}
                />
              )}
            </div>

            {/* Right: Co-Pilot Insight Panel */}
            <div className="col-span-12 lg:col-span-6 space-y-3">
              {/* Mission Memory Cards (New component) */}
              {fusionMode && selectedMission && (
                <MissionMemoryCard mission={selectedMission} />
              )}

              <FlightPlanVisualizer mission={selectedMission} />

              {/* Proactive Mitigation Engine (New component replacing AnomalyFeed) */}
              <ProactiveMitigationEngine
                anomalies={anomalies}
                onApplyMitigation={handleApplyMitigation}
                onReject={(anomaly) => {
                  setAnomalies(prev => prev.filter(a => a.id !== anomaly.id));
                  toast.info("Anomaly mitigation rejected.");
                }}
                learningEnabled={true}
              />

              {fusionMode ? (
                <>
                  <ForesightDashboard
                    missions={missions}
                    onApplyFix={(prediction) => {
                      toast.success("Proactive fix applied");
                      addFusionLogEntry(`Applied proactive fix: ${prediction.suggestedFix.action}`, "autopilot", "completed");
                    }}
                    onSimulateFix={() => {}}
                    onIgnore={() => {}}
                  />
                  <AINegotiationFeed negotiations={aiNegotiations} />
                  <AICoPilotSuggestions missions={missions} onApply={handleApplySuggestion} />
                </>
              ) : (
                <>
                  <FlightPlanEditor
                    mission={selectedMission}
                    onValidate={() => {}}
                    onRunDryRun={() => {}}
                  />
                </>
              )}

              <MissionPulse2
                missions={missions}
                onExplainSpike={(spike) => {
                  toast.info(`Analyzing ${spike.type} spike...`);
                }}
              />

              <ImpactFeed impacts={impacts} />
            </div>
          </div>

          {/* Fusion Flight Log at Bottom (New component) */}
          {fusionMode && fusionFlightLog.length > 0 && (
            <FusionFlightLog activities={fusionFlightLog} />
          )}
        </TabsContent>

        {/* New TabsContent for Orchestration View */}
        {fusionMode && (
          <TabsContent value="orchestra" className="mt-4">
            <AIOrchestrationView
              missions={missions}
              onMissionClick={(mission) => {
                setSelectedMission(mission);
                setDetailDrawerOpen(true);
              }}
            />
            <div className="mt-4">
              <BehavioralTimeline
                events={behavioralEvents}
                onReplay={handleReplayEvent}
              />
            </div>
          </TabsContent>
        )}

        {/* New TabsContent for Fusion Mode */}
        {fusionMode && (
          <TabsContent value="fusion" className="mt-4">
            <FusionMap decisions={aiDecisions} />
          </TabsContent>
        )}

        <TabsContent value="reasoning" className="mt-4">
          <ReasoningMap
            decisions={aiDecisions}
            onCompareWithCoPilot={() => {
              toast.info("Opening Co-Pilot comparison...");
            }}
          />
        </TabsContent>

        {/* New TabsContent for Collaborative Canvas */}
        {fusionMode && (
          <TabsContent value="canvas" className="mt-4">
            <CollaborativeCanvas
              mission={selectedMission}
              onStepUpdate={(step) => {
                toast.success("Workflow step updated");
              }}
            />
          </TabsContent>
        )}

        {/* New TabsContent for Foresight Dashboard & AI Negotiation Feed */}
        {fusionMode && (
          <TabsContent value="foresight" className="mt-4 space-y-4">
            <ForesightDashboard
              missions={missions}
              onApplyFix={(prediction) => {
                toast.success("Proactive fix applied");
                addFusionLogEntry(`Applied proactive fix: ${prediction.suggestedFix.action}`, "autopilot", "completed");
              }}
              onSimulateFix={() => {}}
              onIgnore={() => {}}
            />
            <AINegotiationFeed negotiations={aiNegotiations} />
          </TabsContent>
        )}

        {/* NEW: Training Tab Content */}
        <TabsContent value="training" className="mt-4">
          <AIAgentTrainingPipeline
            onStartTraining={(config) => {
              addFusionLogEntry(`Started training job for ${config.baseAgent}`, "pilot", "pending");
              toast.success(`Training job started for ${config.baseAgent}`);
            }}
            onStopTraining={(jobId) => {
              addFusionLogEntry(`Stopped training job #${jobId}`, "pilot", "completed");
              toast.info(`Training job #${jobId} stopped.`);
            }}
          />
        </TabsContent>

        {/* NEW: Autonomy Tab */}
        <TabsContent value="autonomy" className="mt-4 space-y-4">
          {/* Mission Brain + Self-Optimization Engine */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6">
              <MissionBrain
                missions={missions}
                onExplainDecision={handleExplainDecision}
              />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <SelfOptimizationEngine
                onOptimizationApplied={handleOptimizationApplied}
              />
            </div>
          </div>

          {/* Strategic Fusion Dashboard */}
          <StrategicFusionDashboard
            missions={missions}
            onSetObjective={handleSetObjective}
          />

          {/* Scenario Studio + Insight Engine */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6">
              <ScenarioStudio
                missions={missions}
                onApplyScenario={handleApplyScenario}
              />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <InsightEngine
                missions={missions}
                onExplainInsight={handleExplainInsight}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity Strip */}
      {recentActivity.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm relative z-10">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-900">Recent Activity</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRecentActivity([])}
                className="h-6 text-xs text-slate-600 hover:text-slate-900"
              >
                Clear
              </Button>
            </div>
            <div className="space-y-1">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-2 text-xs text-slate-700">
                  <span className="font-mono text-slate-500">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                  <Badge className={cn(
                    "text-[9px] py-0",
                    activity.actor === "pilot" && "bg-blue-100 text-blue-700",
                    activity.actor === "copilot" && "bg-purple-100 text-purple-700",
                    activity.actor === "autopilot" && "bg-emerald-100 text-emerald-700"
                  )}>
                    {activity.actor}
                  </Badge>
                  <span>{activity.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Co-Pilot Floating Avatar */}
      {fusionMode && ( // Now conditional on fusionMode
        <CoPilotAvatar
          active={fusionMode} // Use fusionMode to indicate active state
          hint={coPilotHint}
          onApprove={handleCoPilotHintApprove}
          onDismiss={handleCoPilotHintDismiss}
        />
      )}

      {/* Mission Detail Drawer */}
      <MissionDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        mission={selectedMission}
        onLaunch={handleLaunch}
        onPause={handlePause}
        onAbort={handleAbort}
        onReroute={handleReroute}
      />

      {/* AI Assist Drawer */}
      <AIAssistDrawer
        open={aiAssistOpen}
        onOpenChange={setAiAssistOpen}
        onInsert={handleInsertPlan}
      />

      {/* AI Flight Sim */}
      <AIFlightSim
        open={flightSimOpen}
        onOpenChange={setFlightSimOpen}
        mission={selectedMission}
        onPromoteToLive={(mission) => {
          addImpact({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            message: `${mission.name} optimizations promoted to live`,
            improvement: "Live",
            actor: mission.route,
            type: "enhancement"
          });
        }}
      />

      {/* Mission Explain Drawer */}
      <MissionExplainDrawer
        open={explainDrawerOpen}
        onOpenChange={setExplainDrawerOpen}
        mission={selectedMission}
        onApplyOptimization={handleApplyOptimization}
      />

      {/* Co-Pilot Chat Panel */}
      <CoPilotChatPanel
        open={coPilotChatOpen}
        onOpenChange={setCoPilotChatOpen}
        messages={coPilotMessages}
        onSendMessage={handleCoPilotMessage}
      />

      {/* Voice Command Console (New component) */}
      <VoiceCommandConsole
        open={voiceConsoleOpen}
        onOpenChange={setVoiceConsoleOpen}
        onExecuteCommand={handleCommandExecute}
      />

      {/* AI Explain Drawer (New component) */}
      <AIExplainDrawer
        open={aiExplainDrawerOpen}
        onOpenChange={setAiExplainDrawerOpen}
        decision={selectedDecision}
      />

      {/* Fusion Path Drawer (New component) */}
      <FusionPathDrawer
        open={fusionPathOpen}
        onOpenChange={setFusionPathOpen}
        missions={missions}
      />

      {/* NEW: Explain & Approve Drawer */}
      <ExplainApproveDrawer
        open={explainApproveOpen}
        onOpenChange={setExplainApproveOpen}
        action={pendingAction}
        onApprove={handleApproveAction}
        onReject={handleRejectAction}
        onUndo={handleUndoAction}
      />
    </div>
  );
}
