
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Radio, Radar, Gauge, AlertCircle, CheckCircle, Clock, Zap,
  PlayCircle, PauseCircle, Shield, Settings, FileText, DollarSign,
  Package, RefreshCw, TrendingDown, Sparkles, Terminal, Eye, Play,
  Pause, Ban, Filter, ChevronDown, Activity, TrendingUp, XCircle,
  AlertTriangle, Flame, Wifi, Box, Brain, Loader2, Check, ChevronRight,
  ScrollText, GitBranch, Target
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

import MissionMetricsWall from "../atc/MissionMetricsWall";
import RadarView from "../atc/RadarView";
import AIAwarenessPanel from "../atc/AIAwarenessPanel";
import TelemetryChart from "../atc/TelemetryChart";
import SmartSuggestionsFeed from "../atc/SmartSuggestionsFeed";
import RunwaySimulator from "../atc/RunwaySimulator";
import CommandBar from "../atc/CommandBar";
import IncidentVisualizer from "../atc/IncidentVisualizer";
import AuditLogViewer from "../atc/AuditLogViewer";
import AIRunbookSuggestions from "../atc/AIRunbookSuggestions";
import PredictiveInsights from "../atc/PredictiveInsights";
import { generateMissionSimulation } from "@/functions/generateMissionSimulation"; // ADDED IMPORT

// Helper Components
const KPICard = ({ title, value, unit, icon: Icon, trend, onClick }) => (
  <Card
    className={cn(
      "bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm hover:shadow-md transition-all",
      onClick && "cursor-pointer"
    )}
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-blue-50">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        {trend && (
          <Badge className={cn(
            "text-xs",
            trend > 0 ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"
          )}>
            {trend > 0 ? "+" : ""}{trend}%
          </Badge>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}{unit}</div>
      <div className="text-xs text-slate-600">{title}</div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }) => {
  const colors = {
    queued: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-blue-50 text-blue-700 border-blue-200",
    running: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blocked: "bg-red-50 text-red-700 border-red-200",
    error: "bg-red-50 text-red-700 border-red-200",
    succeeded: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "on hold": "bg-slate-100 text-slate-600 border-slate-300"
  };
  return <Badge className={cn("text-xs", colors[status] || colors.queued)}>{status}</Badge>;
};

const PriorityBadge = ({ priority }) => {
  const colors = {
    Critical: "bg-red-50 text-red-700 border-red-200",
    High: "bg-orange-50 text-orange-700 border-orange-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-blue-50 text-blue-700 border-blue-200"
  };
  return <Badge className={cn("text-xs", colors[priority])}>{priority}</Badge>;
};

const RoutePill = ({ route }) => {
  const colors = {
    pilot: "bg-blue-500/20 text-blue-700 border-blue-300",
    copilot: "bg-purple-500/20 text-purple-700 border-purple-300",
    autopilot: "bg-emerald-500/20 text-emerald-700 border-emerald-300"
  };
  return <Badge className={cn("text-xs font-mono", colors[route])}>{route}</Badge>;
};

const RiskIndicator = ({ score, breachProb }) => {
  const getColor = () => {
    if (score >= 0.7 || breachProb >= 0.5) return "text-red-600";
    if (score >= 0.4 || breachProb >= 0.25) return "text-amber-600";
    return "text-emerald-600";
  };

  return (
    <div className="flex items-center gap-1">
      <div className={cn("w-2 h-2 rounded-full",
        score >= 0.7 || breachProb >= 0.5 ? "bg-red-600 animate-pulse" :
        score >= 0.4 ? "bg-amber-600" : "bg-emerald-600"
      )}></div>
      <span className={cn("text-xs font-mono", getColor())}>
        {(score * 100).toFixed(0)}%
      </span>
    </div>
  );
};

const EventTypeIcon = ({ type }) => {
  if (type === "error") return <AlertCircle className="w-3 h-3 text-red-600" />;
  if (type === "warn") return <AlertCircle className="w-3 h-3 text-amber-600" />;
  if (type === "policy") return <Shield className="w-3 h-3 text-purple-600" />;
  if (type === "incident") return <Flame className="w-3 h-3 text-red-600" />;
  return <CheckCircle className="w-3 h-3 text-blue-600" />;
};

export default function ATCTab() {
  const [globalPause, setGlobalPause] = useState(false);
  const [safeMode, setSafeMode] = useState(false);
  const [newMissionOpen, setNewMissionOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reasoningDrawerOpen, setReasoningDrawerOpen] = useState(false);
  const [incidentsOpen, setIncidentsOpen] = useState(false);
  const [runbookModalOpen, setRunbookModalOpen] = useState(null);
  const [selectedRunbook, setSelectedRunbook] = useState(null);
  const [streamingLogs, setStreamingLogs] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("Prod-Balanced");
  const [concurrency, setConcurrency] = useState([12]);
  const [eventFilter, setEventFilter] = useState("all");
  const [liveEvents, setLiveEvents] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [throttleEnabled, setThrottleEnabled] = useState(false);
  const [fallbackActive, setFallbackActive] = useState(true);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentVisualizerOpen, setIncidentVisualizerOpen] = useState(false);
  
  // New state for AI interactions
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisContent, setAiAnalysisContent] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [requestStates, setRequestStates] = useState({});
  const [autoPrioritizeOpen, setAutoPrioritizeOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchResults, setBatchResults] = useState(null); 
  const [profileConfirmOpen, setProfileConfirmOpen] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState([]);
  const [telemetryPulse, setTelemetryPulse] = useState(false);
  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // New mission creation state
  const [newMissionName, setNewMissionName] = useState("");
  const [newMissionObjective, setNewMissionObjective] = useState("");
  const [newMissionPriority, setNewMissionPriority] = useState("2"); // Default to P2 (High)
  const [creatingMission, setCreatingMission] = useState(false);
  const [missionSimulationResult, setMissionSimulationResult] = useState(null);

  // Fetch current user
  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Audit logging helper
  const logAudit = async (actionType, description, resourceType, resourceId = null, metadata = {}, severity = "low", complianceRelevant = false) => {
    try {
      if (!currentUser) {
        console.warn("Audit log attempted without current user, skipping.", { actionType, description });
        // Optionally, log to a temporary in-memory store or a default user if needed
        return;
      }
      
      await base44.entities.AuditLog.create({
        timestamp: new Date().toISOString(),
        user_email: currentUser.email,
        user_name: currentUser.full_name || currentUser.email,
        action_type: actionType,
        action_description: description,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata: metadata,
        status: "success",
        severity: severity,
        compliance_relevant: complianceRelevant
      });
    } catch (error) {
      console.error("Failed to log audit:", error);
    }
  };

  // Fetch data
  const { data: requests = [] } = useQuery({
    queryKey: ['ai-requests'],
    queryFn: () => base44.entities.AIRequest.list('-created_date', 50),
    refetchInterval: 5000
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['ai-profiles'],
    queryFn: () => base44.entities.AIProfile.list(),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['ai-incidents'],
    queryFn: () => base44.entities.AIIncident.filter({ status: 'open' }),
    refetchInterval: 10000
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['ai-missions'],
    queryFn: () => base44.entities.AIMission.list(),
  });

  // Mock initial events
  useEffect(() => {
    setLiveEvents([
      { ts: new Date(Date.now() - 2000).toISOString(), type: "info", message: "Mission invoice_chase_v1 started", agent: "pilot" },
      { ts: new Date(Date.now() - 5000).toISOString(), type: "policy", message: "PII masking applied to REQ-10120", agent: "copilot" },
      { ts: new Date(Date.now() - 8000).toISOString(), type: "warn", message: "High latency detected (1540ms)", agent: "autopilot" },
      { ts: new Date(Date.now() - 12000).toISOString(), type: "error", message: "Webhook validation failed", agent: "pilot" },
      { ts: new Date(Date.now() - 15000).toISOString(), type: "info", message: "Batch operation completed (42 items)", agent: "autopilot" },
      { ts: new Date(Date.now() - 20000).toISOString(), type: "incident", message: "Incident opened: latency_spike", agent: "system" },
    ]);
  }, []);

  // Streaming logs simulator
  useEffect(() => {
    if (!logsOpen) return;

    const logMessages = [
      "[INFO] Processing inbound request REQ-10131",
      "[INFO] Policy validation passed (4 checks)",
      "[DEBUG] Allocating worker thread",
      "[INFO] Model inference started (gpt-4o-mini)",
      "[DEBUG] Token count: 487 in, 324 out",
      "[INFO] Response generated (842ms)",
      "[INFO] Cost tracking updated: $0.003",
      "[INFO] Request completed successfully"
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < logMessages.length) {
        setStreamingLogs(prev => [...prev, {
          ts: new Date().toISOString(),
          message: logMessages[index]
        }]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [logsOpen]);

  // Command Bar keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add activity log entry
  const addActivity = (message, type = "info") => {
    const newActivity = {
      id: Date.now(),
      message,
      type,
      ts: new Date().toISOString()
    };
    setActivityLog(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  // KPIs calculation
  const activeRequests = requests.filter(r => ['queued', 'approved', 'running'].includes(r.state)).length;
  const queuedRequests = requests.filter(r => r.state === 'queued').length;
  const avgLatency = 842;
  const errorRate = 1.8;
  const activeMissions = missions.filter(m => m.status === 'running').length;
  const completedMissions = 12;
  const hourlySpend = requests.reduce((sum, r) => sum + (r.cost_estimate_cents || 0), 0) / 100;
  const costBudget = 15.0;

  const currentProfile = profiles.find(p => p.name === selectedProfile) || {
    concurrency_limit: 12,
    toggles_json: { pii_masking: true, vendor_lock: false, finops_guard: true, compliance_mode: true },
    cost_cap_cents_per_hour: 1500
  };

  // Enhanced handlers with AI feedback and audit logging
  const handleExplainKPI = (metric) => {
    setAiAnalysisContent({ type: 'kpi', metric });
    setAiAnalysisOpen(true);
    setAiAnalysisLoading(true);
    
    addActivity(`AI analyzing ${metric}...`, "info");
    logAudit("request_explain", `Requested AI analysis for ${metric} KPI`, "system", null, { metric }, "low");
    
    setTimeout(() => {
      setAiAnalysisLoading(false);
      setLiveEvents(prev => [{
        ts: new Date().toISOString(),
        type: "info",
        message: `AI analysis completed for ${metric}`,
        agent: "ai-copilot"
      }, ...prev]);
    }, 2000);
  };

  const handleExplainRequest = (req) => {
    setSelectedRequest(req);
    setAiAnalysisContent({ type: 'request', data: req });
    setAiAnalysisOpen(true);
    setAiAnalysisLoading(true);
    
    addActivity(`Analyzing request ${req.id.substring(0, 8)}...`, "info");
    logAudit("request_explain", `Requested AI analysis for request ${req.id}`, "request", req.id, { intent: req.intent }, "low");
    
    setTimeout(() => {
      setAiAnalysisLoading(false);
    }, 1500);
  };

  const handleApprove = async (req) => {
    setRequestStates(prev => ({ ...prev, [req.id]: 'approved' }));
    
    toast.success(`Request approved`, {
      description: `Routed to ${req.route} channel`
    });
    
    addActivity(`Request ${req.id.substring(0, 8)} approved → ${req.route}`, "success");
    
    // Audit log with high severity for approvals
    await logAudit(
      "request_approve",
      `Approved request ${req.id} for ${req.intent} - routed to ${req.route}`,
      "request",
      req.id,
      {
        intent: req.intent,
        route: req.route,
        priority: req.priority,
        risk_score: req.risk_score,
        cost_estimate_cents: req.cost_estimate_cents
      },
      "medium",
      true // Compliance relevant
    );
    
    setLiveEvents(prev => [{
      ts: new Date().toISOString(),
      type: "info",
      message: `Request ${req.id.substring(0, 8)} approved → ${req.route}`,
      agent: req.route
    }, ...prev]);

    // Trigger telemetry pulse
    setTelemetryPulse(true);
    setTimeout(() => setTelemetryPulse(false), 1000);
  };

  const handleHold = async (req) => {
    setRequestStates(prev => ({ ...prev, [req.id]: 'on hold' }));
    
    toast.warning(`Request placed on hold`, {
      description: "Waiting for manual review"
    });
    
    addActivity(`Request ${req.id.substring(0, 8)} placed on hold`, "warn");
    
    // Audit log holds with medium severity
    await logAudit(
      "request_hold",
      `Placed request ${req.id} on hold - ${req.intent}`,
      "request",
      req.id,
      {
        intent: req.intent,
        priority: req.priority,
        risk_score: req.risk_score
      },
      "medium",
      true
    );
    
    setLiveEvents(prev => [{
      ts: new Date().toISOString(),
      type: "warn",
      message: `Request ${req.id.substring(0, 8)} placed on hold`,
      agent: "copilot"
    }, ...prev]);
  };

  const handleSandbox = (req) => {
    setRequestStates(prev => ({ ...prev, [req.id]: 'sandbox' }));
    
    toast.success(`Sandbox run queued`, {
      description: "Testing in isolated environment"
    });
    
    addActivity(`Sandbox run started for ${req.id.substring(0, 8)}`, "info");
    
    logAudit(
      "request_sandbox",
      `Initiated sandbox test for request ${req.id}`,
      "request",
      req.id,
      { intent: req.intent },
      "low"
    );
    
    setLiveEvents(prev => [{
      ts: new Date().toISOString(),
      type: "info",
      message: `🧪 Sandbox run started for ${req.id.substring(0, 8)}`,
      agent: "sandbox"
    }, ...prev]);
  };

  const handleAutoPrioritize = () => {
    setAutoPrioritizeOpen(true);
  };

  const confirmAutoPrioritize = async () => {
    setAutoPrioritizeOpen(false);
    
    toast.success("Queue reordered by AI", {
      description: "3 high-risk requests elevated"
    });
    
    addActivity("Auto-prioritized queue (3 elevated, 2 deprioritized)", "success");
    
    await logAudit(
      "auto_prioritize",
      "Auto-prioritized queue - 3 requests elevated, 2 deprioritized",
      "system",
      null,
      { elevated: 3, deprioritized: 2 },
      "medium",
      true
    );
    
    setLiveEvents(prev => [{
      ts: new Date().toISOString(),
      type: "info",
      message: "Auto-prioritization complete: 3 elevated, 2 deprioritized",
      agent: "ai-copilot"
    }, ...prev]);

    setTelemetryPulse(true);
    setTimeout(() => setTelemetryPulse(false), 1000);
  };

  const handleBatchAction = (action) => {
    setSelectedRunbook(action);
    setBatchModalOpen(true);
  };

  const startBatchOperation = async () => {
    setBatchRunning(true);
    setBatchProgress(0);
    setBatchResults(null); 
    
    addActivity(`Batch operation "${selectedRunbook}" started`, "info");
    
    await logAudit(
      "batch_operation",
      `Started batch operation: ${selectedRunbook}`,
      "batch",
      null,
      { operation: selectedRunbook, dry_run: true },
      "medium",
      true
    );
    
    const interval = setInterval(() => {
      setBatchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBatchRunning(false);
          
          // Generate mock results based on runbook type
          const results = {
            "Batch Approve": {
              items_processed: 42,
              items_created: 35,
              items_updated: 7,
              errors: 0,
              duration_seconds: 23,
              summary: "Successfully processed 42 batch items"
            },
            "AR": {
              items_processed: 28,
              invoices_sent: 15,
              reminders_sent: 13,
              total_amount: 145230.50,
              errors: 0,
              duration_seconds: 18,
              summary: "Sent 28 collection notices totaling $145,230.50"
            },
            "Cost": {
              items_analyzed: 156,
              savings_identified: 2340.20,
              recommendations: 12,
              errors: 0,
              duration_seconds: 31,
              summary: "Identified $2,340.20 in potential cost savings"
            },
            "Tax": {
              items_recalculated: 89,
              adjustments_made: 23,
              total_adjustment: 1847.65,
              errors: 0,
              duration_seconds: 27,
              summary: "Recalculated taxes for 89 items with $1,847.65 in adjustments"
            },
            "Price": {
              items_repriced: 67,
              price_increases: 34,
              price_decreases: 33,
              avg_change_pct: 4.2,
              errors: 0,
              duration_seconds: 19,
              summary: "Repriced 67 SKUs with 4.2% average price adjustment"
            },
            "Clean": {
              items_scanned: 234,
              orphans_found: 18,
              orphans_cleaned: 18,
              storage_freed_mb: 456,
              errors: 0,
              duration_seconds: 15,
              summary: "Cleaned 18 orphaned records, freed 456MB storage"
            }
          };
          
          const result = results[selectedRunbook] || results["Batch Approve"];
          setBatchResults(result); 
          
          toast.success("Batch operation successful", {
            description: result.summary 
          });
          
          addActivity(`Batch "${selectedRunbook}" completed (${result.items_processed || result.items_analyzed || result.items_scanned} items)`, "success"); 
          
          logAudit(
            "batch_operation_complete",
            `Completed batch operation: ${selectedRunbook} - ${result.summary}`, 
            "batch",
            null,
            result, 
            "medium",
            true
          );
          
          setLiveEvents(prev => [{
            ts: new Date().toISOString(),
            type: "info",
            message: `Batch operation ${selectedRunbook} completed - ${result.summary}`, 
            agent: "autopilot"
          }, ...prev]);
          
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleApplyProfile = () => {
    setProfileConfirmOpen(true);
  };

  const confirmApplyProfile = async () => {
    setProfileConfirmOpen(false);
    
    // Simulate loading state
    toast.loading("Applying profile...", { id: "profile-apply" });
    
    const previousProfile = selectedProfile; // Assuming selectedProfile holds the *new* value after selection but before confirmation
    const previousConcurrency = concurrency[0]; // Assuming concurrency holds the *new* value

    // To properly log the *change*, we'd need to fetch the *actual previous* state,
    // or pass it down. For this demo, let's assume `selectedProfile` and `concurrency`
    // represent the *new* desired state, and we're logging the action of setting it.
    // If there were an API call to fetch previous state, it would go here.
    
    setTimeout(async () => {
      toast.success("Profile applied successfully", {
        id: "profile-apply",
        description: `${selectedProfile} is now active`
      });
      
      addActivity(`Profile switched to ${selectedProfile} (${concurrency[0]} concurrent)`, "success");
      
      await logAudit(
        "profile_change",
        `Changed profile to ${selectedProfile} with concurrency ${concurrency[0]}`,
        "profile",
        null,
        {
          new_profile: selectedProfile,
          new_concurrency: concurrency[0],
          cost_cap: currentProfile.cost_cap_cents_per_hour 
        },
        "high",
        true
      );
      
      setLiveEvents(prev => [{
        ts: new Date().toISOString(),
        type: "info",
        message: `Profile switched to ${selectedProfile} (${concurrency[0]} concurrent)`,
        agent: "system"
      }, ...prev]);

      setTelemetryPulse(true);
      setTimeout(() => setTelemetryPulse(false), 1000);
    }, 1500);
  };

  const handleApplySuggestion = async (suggestion) => {
    setAppliedSuggestions(prev => [...prev, suggestion.id]);
    
    toast.success(`Fix applied: ${suggestion.title}`, {
      description: `Impact: ${suggestion.impact.cost < 0 ? 'Cost ↓' : ''} ${suggestion.impact.latency !== 0 ? 'Latency ' + (suggestion.impact.latency < 0 ? '↓' : '↑') : ''}`
    });
    
    addActivity(`Applied: ${suggestion.title}`, "success");
    
    await logAudit(
      "suggestion_apply",
      `Applied AI suggestion: ${suggestion.title}`,
      "suggestion",
      suggestion.id.toString(),
      {
        suggestion: suggestion.title,
        confidence: suggestion.confidence,
        cost_impact: suggestion.impact.cost,
        latency_impact: suggestion.impact.latency
      },
      "medium",
      true
    );
    
    setLiveEvents(prev => [{
      ts: new Date().toISOString(),
      type: "info",
      message: `Auto-applied: ${suggestion.title}`,
      agent: "ai-copilot"
    }, ...prev]);

    setTelemetryPulse(true);
    setTimeout(() => setTelemetryPulse(false), 1000);
  };

  const handleRunbook = (name) => {
    logAudit(
      "runbook_execute",
      `Initiated runbook execution: ${name}`,
      "batch",
      null,
      { runbook: name },
      "medium"
    );
    handleBatchAction(name);
  };

  const handleClearEvents = () => {
    setLiveEvents([]);
    toast.success("Events cleared");
    logAudit("config_change", "Cleared live event stream", "system", null, {}, "low");
  };

  const handleMitigateIncident = async (incident) => {
    try {
      await base44.entities.AIIncident.update(incident.id, { status: 'mitigating' });
      toast.success("Mitigation started");
      addActivity(`Incident ${incident.type} mitigation started`, "info");
      
      await logAudit(
        "incident_mitigate",
        `Initiated mitigation for incident: ${incident.type}`,
        "incident",
        incident.id,
        {
          incident_type: incident.type,
          started_at: incident.started_at
        },
        "critical",
        true
      );
      
      setLiveEvents(prev => [{
        ts: new Date().toISOString(),
        type: "info",
        message: `Incident ${incident.type} mitigation started`,
        agent: "system"
      }, ...prev]);
    } catch (error) {
      toast.error("Failed to start mitigation");
    }
  };

  const handleInvestigate = (metric) => {
    handleExplainKPI(metric);
  };

  const handleTimeRangeFilter = (range) => {
    toast.success(`Queue filtered to hour ${range.start}-${range.end}`);
    addActivity(`Queue filtered: hour ${range.start}-${range.end}`, "info");
  };

  const handleExplainTrend = async (mode) => {
    setAiAnalysisContent({ type: 'telemetry', mode });
    setAiAnalysisOpen(true);
    setAiAnalysisLoading(true);
    
    addActivity(`AI analyzing ${mode} trend...`, "info");
    
    setTimeout(() => {
      setAiAnalysisLoading(false);
    }, 1800);
  };

  const handleExecuteCommand = async (command) => {
    await logAudit(
      "command_execute",
      `Executed command: ${command.label}`,
      "system",
      command.id,
      { command: command.label, category: command.category },
      "medium", 
      command.category === "critical" || command.id === "pause-source-webhook" 
    );
    
    switch (command.id) {
      case "pause-source-webhook":
        toast.success("Webhook source paused");
        addActivity("Webhook source paused via command", "info");
        setLiveEvents(prev => [{
          ts: new Date().toISOString(),
          type: "info",
          message: "Webhook source paused via command",
          agent: "system"
        }, ...prev]);
        break;
      case "switch-profile-cost-save":
        setSelectedProfile("Cost-Save");
        toast.success("Switched to Cost-Save profile");
        addActivity("Switched to Cost-Save profile", "success");
        break;
      case "switch-profile-high-accuracy":
        setSelectedProfile("High-Accuracy");
        toast.success("Switched to High-Accuracy profile");
        addActivity("Switched to High-Accuracy profile", "success");
        break;
      case "dispatch-mission":
        setNewMissionOpen(true);
        break;
      case "refresh-queue":
        toast.success("Queue refreshed");
        addActivity("Queue refreshed", "info");
        break;
      case "auto-prioritize":
        handleAutoPrioritize();
        break;
      default:
        toast.info(`Executing: ${command.label}`);
        addActivity(`Executed: ${command.label}`, "info");
    }
    setCommandBarOpen(false);
  };

  const handleOpenIncidentVisualizer = (incident) => {
    setSelectedIncident(incident);
    setIncidentVisualizerOpen(true);
  };

  const handleApplyScenario = async (scenario) => {
    toast.success(`Applying scenario: ${scenario.title}`, {
      description: `Confidence: ${scenario.confidence}%`
    });
    
    addActivity(`Applied what-if scenario: ${scenario.title}`, "success");
    
    await logAudit(
      "command_execute",
      `Applied predictive scenario: ${scenario.title}`,
      "system",
      scenario.id.toString(),
      {
        scenario: scenario.title,
        type: scenario.type,
        confidence: scenario.confidence,
        affected_requests: scenario.affected_requests
      },
      "medium",
      true
    );
    
    setLiveEvents(prev => [{
      ts: new Date().toISOString(),
      type: "info",
      message: `Applied scenario: ${scenario.title}`,
      agent: "ai-copilot"
    }, ...prev]);

    setTelemetryPulse(true);
    setTimeout(() => setTelemetryPulse(false), 1000);
  };

  const handleCreateMission = async () => {
    if (!newMissionName || !newMissionObjective) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCreatingMission(true);
    setMissionSimulationResult(null);

    try {
      const response = await generateMissionSimulation({
        missionName: newMissionName,
        objective: newMissionObjective,
        priority: parseInt(newMissionPriority)
      });

      if (response.data.success) {
        setMissionSimulationResult(response.data.mission);
        
        toast.success("Mission simulated successfully! 🚀", {
          description: `"${newMissionName}" is ready for deployment`
        });
        
        addActivity(`AI-generated mission: ${newMissionName}`, "success");
        
        await logAudit(
          "mission_create",
          `Created AI-generated mission: ${newMissionName}`,
          "mission",
          response.data.mission.id,
          {
            missionName: newMissionName,
            objective: newMissionObjective,
            priority: newMissionPriority,
            aiGenerated: true,
            simulation: response.data.mission.simulation_metadata
          },
          "medium",
          true
        );
        
        setLiveEvents(prev => [{
          ts: new Date().toISOString(),
          type: "info",
          message: `AI mission created: ${newMissionName}`,
          agent: "ai-copilot"
        }, ...prev]);
        
      } else {
        throw new Error(response.data.error || "Failed to create mission");
      }
    } catch (error) {
      console.error('Error creating mission:', error);
      toast.error("Failed to create mission", {
        description: error.response?.data?.details || error.message || "Please try again"
      });
    } finally {
      setCreatingMission(false);
    }
  };

  const handleCloseMissionDialog = () => {
    setNewMissionOpen(false);
    setNewMissionName("");
    setNewMissionObjective("");
    setNewMissionPriority("2");
    setMissionSimulationResult(null);
  };

  const filteredEvents = eventFilter === "all" ? liveEvents :
    liveEvents.filter(e => e.type === eventFilter);

  const getSLAColor = (deadline) => {
    if (!deadline) return "text-slate-600";
    const hoursLeft = (new Date(deadline) - new Date()) / (1000 * 60 * 60);
    if (hoursLeft < 1) return "text-red-600 font-semibold";
    if (hoursLeft < 4) return "text-amber-600";
    return "text-slate-600";
  };

  const getSLAText = (deadline) => {
    if (!deadline) return "No SLA";
    const msLeft = new Date(deadline) - new Date();
    const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
    const minsLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
    if (hoursLeft < 1) return `${minsLeft}m`;
    return `${hoursLeft}h ${minsLeft}m`;
  };

  return (
    <div className="space-y-3 relative">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:40px_40px] animate-[slide_60s_linear_infinite]"></div>
      </div>

      {/* Pause Overlay */}
      <AnimatePresence>
        {globalPause && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 border-2 border-amber-400">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-amber-50">
                  <PauseCircle className="w-8 h-8 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">🛑 ATC Paused</h3>
                  <p className="text-sm text-slate-600">New requests are queuing</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe Mode Border Glow */}
      {safeMode && (
        <div className="fixed inset-0 pointer-events-none z-30">
          <div className="absolute inset-0 border-4 border-amber-400/50 animate-pulse rounded-lg"></div>
        </div>
      )}

      {/* Fallback Badge */}
      {fallbackActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-20 right-6 z-50"
        >
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 shadow-lg">
            <Wifi className="w-3 h-3 mr-1 animate-pulse" />
            Fallback routing active
          </Badge>
        </motion.div>
      )}

      {/* Compact Page Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            ATC — Mission Control
            {globalPause && <span className="text-amber-600 animate-pulse">⏸</span>}
          </h1>
          <p className="text-xs text-slate-600">Intelligent routing, policy enforcement & cost optimization</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Switch 
              checked={globalPause} 
              onCheckedChange={async (checked) => {
                setGlobalPause(checked);
                if (checked) {
                  toast.warning("ATC Paused", { description: "New requests queuing" });
                  addActivity("ATC paused - requests queuing", "warn");
                  await logAudit("global_pause_toggle", "ATC system paused", "system", null, { paused: true }, "high", true);
                } else {
                  toast.success("ATC Resumed", { description: "Processing requests" });
                  addActivity("ATC resumed", "success");
                  await logAudit("global_pause_toggle", "ATC system resumed", "system", null, { paused: false }, "high", true);
                }
              }}
              id="global-pause" 
              className="scale-75" 
            />
            <Label htmlFor="global-pause" className="text-xs text-slate-700 cursor-pointer">Pause</Label>
          </div>
          <div className="flex items-center gap-1.5">
            <Switch 
              checked={safeMode} 
              onCheckedChange={async (checked) => {
                setSafeMode(checked);
                if (checked) {
                  toast.warning("Safe Mode Enabled", { description: "Strict policy routing active" });
                  addActivity("Safe Mode enabled - strict routing", "warn");
                  await logAudit("safe_mode_toggle", "Safe Mode enabled - all approvals require manual review", "system", null, { enabled: true }, "high", true);
                } else {
                  toast.success("Safe Mode Disabled");
                  addActivity("Safe Mode disabled", "success");
                  await logAudit("safe_mode_toggle", "Safe Mode disabled", "system", null, { enabled: false }, "high", true);
                }
              }}
              id="safe-mode" 
              className="scale-75" 
            />
            <Label htmlFor="safe-mode" className="text-xs text-slate-700 cursor-pointer">Safe</Label>
          </div>
          
          {/* Audit Log Button - Now available to everyone */}
          <Button
            onClick={() => setAuditLogOpen(true)}
            variant="outline"
            size="sm"
            className="border-slate-200 bg-white hover:bg-slate-50 rounded-lg h-7 text-xs">
            <ScrollText className="w-3 h-3 mr-1" />
            Audit Log
          </Button>
          
          <Button
            onClick={() => setIncidentsOpen(true)}
            variant="outline"
            size="sm"
            className={cn(
              "border-slate-200 bg-white hover:bg-slate-50 rounded-lg relative h-7 text-xs",
              incidents.length > 0 && "border-red-300 bg-red-50"
            )}>
            <AlertTriangle className={cn("w-3 h-3 mr-1", incidents.length > 0 ? "text-red-600" : "text-slate-600")} />
            {incidents.length}
            {incidents.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </Button>
          <Button
            onClick={() => setNewMissionOpen(true)}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm rounded-lg h-7 text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            New
          </Button>
        </div>
      </div>

      {/* Safe Mode Banner */}
      {safeMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-2"
        >
          <Shield className="w-4 h-4 text-amber-600" />
          <span className="text-xs text-amber-900 font-medium">🛡 Safe Mode — strict policy routing active</span>
        </motion.div>
      )}

      {/* Fallback Badge */}
      {fallbackActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-20 right-6 z-50"
        >
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 shadow-lg">
            <Wifi className="w-3 h-3 mr-1 animate-pulse" />
            Fallback routing active
          </Badge>
        </motion.div>
      )}

      {/* Mission Metrics Wall */}
      <MissionMetricsWall
        activeMissions={activeMissions}
        completedMissions={completedMissions}
        avgLatency={avgLatency}
        hourlySpend={hourlySpend}
        costBudget={costBudget}
        onInvestigate={handleInvestigate}
      />

      {/* Ultra-Compact Bento Grid */}
      <div className="grid grid-cols-12 gap-3">
        {/* Main Queue - Spans 6 columns */}
        <div className="col-span-12 lg:col-span-6 space-y-3">
          {/* View Toggle + Actions Bar */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "outline"}
              onClick={() => setViewMode("table")}
              className={viewMode === "table" ?
                "bg-gradient-to-r from-blue-600 to-purple-600 text-white h-7 text-xs rounded-lg px-3" :
                "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 h-7 text-xs rounded-lg px-3"
              }>
              Table
            </Button>
            <Button
              size="sm"
              variant={viewMode === "radar" ? "default" : "outline"}
              onClick={() => setViewMode("radar")}
              className={viewMode === "radar" ?
                "bg-gradient-to-r from-blue-600 to-purple-600 text-white h-7 text-xs rounded-lg px-3" :
                "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 h-7 text-xs rounded-lg px-3"
              }>
              Radar
            </Button>

            {viewMode === "table" && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleAutoPrioritize}
                  className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 h-7 text-xs rounded-lg px-2">
                  Auto-Prioritize
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBatchAction("Batch Approve")}
                  className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 h-7 text-xs rounded-lg px-2">
                  Batch
                </Button>
              </div>
            )}
          </div>

          {/* Queue View */}
          {viewMode === "radar" ? (
            <RadarView
              requests={requests}
              onApprove={handleApprove}
              onHold={handleHold}
              onSandbox={handleSandbox}
              onExplain={handleExplainRequest}
            />
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm rounded-lg">
              <CardHeader className="border-b border-slate-200 pb-2 px-3 pt-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900 text-xs flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-blue-600" />
                    Flight Strip — Queue
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] py-0">
                      {queuedRequests} queued
                    </Badge>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0">
                      {activeRequests} active
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <Radio className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs text-slate-500">No requests</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-slate-50 z-10">
                        <TableRow className="border-slate-200 hover:bg-transparent">
                          <TableHead className="text-slate-700 text-[10px] font-semibold py-2">ID</TableHead>
                          <TableHead className="text-slate-700 text-[10px] font-semibold py-2">Source</TableHead>
                          <TableHead className="text-slate-700 text-[10px] font-semibold py-2">Intent</TableHead>
                          <TableHead className="text-slate-700 text-[10px] font-semibold py-2">Risk</TableHead>
                          <TableHead className="text-slate-700 text-[10px] font-semibold py-2">Priority</TableHead>
                          <TableHead className="text-slate-700 text-[10px] font-semibold py-2">SLA</TableHead>
                          <TableHead className="text-slate-700 text-[10px] font-semibold py-2">State</TableHead>
                          <TableHead className="text-slate-700 text-[10px] font-semibold py-2">Route</TableHead>
                          <TableHead className="text-slate-700 text-[10px] font-semibold py-2">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requests.map((req) => {
                          const breachRisk = req.breach_probability >= 0.5;
                          const currentState = requestStates[req.id] || req.state;
                          const isSandbox = requestStates[req.id] === 'sandbox';
                          
                          return (
                            <motion.tr
                              key={req.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                "border-slate-200 hover:bg-slate-50 transition-all",
                                breachRisk && "bg-red-50/50 border-l-2 border-l-red-500",
                                currentState === 'approved' && "bg-emerald-50/50 border-l-2 border-l-emerald-500",
                                currentState === 'on hold' && "bg-slate-100/50 opacity-60"
                              )}
                            >
                              <TableCell className="text-slate-900 text-[10px] font-mono py-2">
                                {req.id.substring(0, 6)}
                                {req.pii && <Shield className="w-2.5 h-2.5 text-purple-600 inline ml-0.5" />}
                                {req.vip && <span className="ml-0.5 text-amber-600 text-[10px]">⭐</span>}
                                {isSandbox && <span className="ml-0.5 text-[9px]">🧪</span>}
                              </TableCell>
                              <TableCell className="text-slate-700 text-[10px] py-2">{req.source}</TableCell>
                              <TableCell className="text-slate-700 text-[10px] py-2">{req.intent}</TableCell>
                              <TableCell className="py-2">
                                <RiskIndicator score={req.risk_score || 0} breachProb={req.breach_probability || 0} />
                              </TableCell>
                              <TableCell className="py-2"><PriorityBadge priority={req.priority} /></TableCell>
                              <TableCell className={cn("text-[10px] font-mono py-2", getSLAColor(req.sla_deadline))}>
                                {getSLAText(req.sla_deadline)}
                              </TableCell>
                              <TableCell className="py-2"><StatusBadge status={currentState} /></TableCell>
                              <TableCell className="py-2"><RoutePill route={req.route} /></TableCell>
                              <TableCell className="py-2">
                                <div className="flex gap-0.5">
                                  {currentState === 'queued' && !safeMode && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => handleApprove(req)} 
                                        className="h-5 w-5 p-0 text-emerald-600 hover:bg-emerald-50"
                                        title="Approve request">
                                        <Play className="w-2.5 h-2.5" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => handleSandbox(req)} 
                                        className="h-5 w-5 p-0 text-blue-600 hover:bg-blue-50"
                                        title="Run in sandbox">
                                        <Box className="w-2.5 h-2.5" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => handleHold(req)} 
                                        className="h-5 w-5 p-0 text-amber-600 hover:bg-amber-50"
                                        title="Place on hold">
                                        <Pause className="w-2.5 h-2.5" />
                                      </Button>
                                    </>
                                  )}
                                  {safeMode && currentState === 'queued' && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      disabled
                                      className="h-5 w-5 p-0 text-slate-400"
                                      title="Disabled in Safe Mode">
                                      <Ban className="w-2.5 h-2.5" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleExplainRequest(req)}
                                    className="h-5 w-5 p-0 text-slate-600 hover:bg-slate-100"
                                    title="Explain routing decision">
                                    <Eye className="w-2.5 h-2.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Predictive Insights - NEW */}
          <PredictiveInsights 
            requests={requests}
            onApplyScenario={handleApplyScenario}
          />

          {/* Live Events - More Compact */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm rounded-lg">
            <CardHeader className="border-b border-slate-200 pb-1.5 px-3 pt-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900 text-xs flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-blue-600" />
                  Live Events
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="w-20 h-6 text-[10px] bg-white border-slate-200 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="error">Errors</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="incident">Incidents</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" onClick={handleClearEvents} className="h-5 text-[10px] text-slate-600 hover:text-slate-900 px-1.5">
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-0.5 max-h-40 overflow-y-auto">
                <AnimatePresence>
                  {filteredEvents.map((event, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-start gap-1.5 p-1.5 rounded hover:bg-slate-50 transition-colors"
                    >
                      <EventTypeIcon type={event.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(event.ts).toLocaleTimeString()}
                          </span>
                          <Badge className={cn(
                            "text-[9px] py-0 h-4",
                            event.agent === "pilot" && "bg-blue-50 text-blue-700 border-blue-200",
                            event.agent === "copilot" && "bg-purple-50 text-purple-700 border-purple-200",
                            event.agent === "autopilot" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                            event.agent === "system" && "bg-slate-100 text-slate-700 border-slate-200",
                            event.agent === "ai-copilot" && "bg-purple-100 text-purple-800 border-purple-300",
                            event.agent === "sandbox" && "bg-cyan-50 text-cyan-700 border-cyan-200"
                          )}>
                            {event.agent}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-700 leading-tight">{event.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Compact Stack (6 columns) */}
        <div className="col-span-12 lg:col-span-6 space-y-3">
          {/* AI Runbook Suggestions - NEW */}
          <AIRunbookSuggestions
            requests={requests}
            incidents={incidents}
            avgLatency={avgLatency}
            errorRate={errorRate}
            onExecuteRunbook={handleRunbook}
          />

          {/* AI Awareness - Ultra Compact */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm rounded-lg">
            <CardHeader className="border-b border-slate-200 pb-1.5 px-3 pt-2">
              <CardTitle className="text-slate-900 text-xs flex items-center gap-1.5">
                <Brain className="w-3 h-3 text-blue-600" />
                AI System
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-600 mb-0.5">Throttle</div>
                  <Switch 
                    checked={throttleEnabled} 
                    onCheckedChange={(checked) => {
                      setThrottleEnabled(checked);
                      if (checked) {
                        toast.success("Throttling enabled");
                        addActivity("Request throttling enabled", "info");
                      } else {
                        toast.success("Throttling disabled");
                        addActivity("Request throttling disabled", "info");
                      }
                    }}
                    className="scale-75" 
                  />
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-600 mb-0.5">Safe Mode</div>
                  <Switch checked={safeMode} onCheckedChange={setSafeMode} className="scale-75" />
                </div>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-blue-900">Fallback</span>
                  <Badge className="bg-emerald-50 text-emerald-700 text-[9px] py-0 h-4">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      ON
                    </motion.div>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Runway Simulator - Compact */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm rounded-lg">
            <CardHeader className="border-b border-slate-200 pb-1.5 px-3 pt-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900 text-xs flex items-center gap-1.5">
                  <Settings className="w-3 h-3 text-blue-600" />
                  Runway
                </CardTitle>
                <Button size="sm" variant="ghost" className="h-5 text-[10px] text-slate-600 hover:text-slate-900 px-1.5">
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <div>
                <Label className="text-[10px] text-slate-700 mb-1 block">Profile</Label>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger className="w-full h-7 text-[10px] bg-white border-slate-200 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="Prod-Balanced">Prod-Balanced</SelectItem>
                    <SelectItem value="Cost-Save">Cost-Save</SelectItem>
                    <SelectItem value="High-Accuracy">High-Accuracy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] text-slate-700 mb-1 flex justify-between">
                  <span>Concurrency</span>
                  <span className="font-mono">{concurrency[0]}</span>
                </Label>
                <Slider
                  value={concurrency}
                  onValueChange={setConcurrency}
                  min={1}
                  max={24}
                  step={1}
                  className="py-2"
                />
              </div>
              <Button
                onClick={handleApplyProfile}
                className="w-full h-7 text-[10px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Apply Profile
              </Button>
            </CardContent>
          </Card>

          {/* Smart Suggestions - Compact */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm rounded-lg">
            <CardHeader className="border-b border-slate-200 pb-1.5 px-3 pt-2">
              <CardTitle className="text-slate-900 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-600" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[
                  { id: 1, title: "Reroute low-priority to Autopilot", impact: { cost: -0.45, latency: +50 }, confidence: 94, color: "emerald" },
                  { id: 2, title: "Switch to Cost-Save profile", impact: { cost: -1.20, latency: +120 }, confidence: 87, color: "purple" },
                  { id: 3, title: "Enable webhook throttling", impact: { cost: 0, latency: -80 }, confidence: 91, color: "amber" }
                ].map((suggestion) => {
                  const isApplied = appliedSuggestions.includes(suggestion.id);
                  
                  return (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: isApplied ? 0.5 : 1 }}
                      className={cn(
                        "p-2 rounded-lg border transition-all",
                        `border-${suggestion.color}-200 bg-${suggestion.color}-50/50`,
                        isApplied && "opacity-50"
                      )}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-[10px] font-semibold text-slate-900 leading-tight flex-1">
                          {suggestion.title}
                        </h4>
                        <Badge className={cn(
                          "text-[9px] ml-1 flex-shrink-0 py-0 h-3.5",
                          suggestion.confidence >= 90 ? "bg-emerald-100 text-emerald-700 border-emerald-300" :
                          "bg-blue-100 text-blue-700 border-blue-300"
                        )}>
                          {suggestion.confidence}%
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-1.5">
                        {suggestion.impact.cost !== 0 && (
                          <div className="flex items-center gap-0.5 text-[9px]">
                            <DollarSign className="w-2 h-2" />
                            <span className={cn(
                              "font-mono font-semibold",
                              suggestion.impact.cost < 0 ? "text-emerald-700" : "text-red-700"
                            )}>
                              {suggestion.impact.cost < 0 ? '' : '+'}{suggestion.impact.cost.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {suggestion.impact.latency !== 0 && (
                          <div className="flex items-center gap-0.5 text-[9px]">
                            <Clock className="w-2 h-2" />
                            <span className={cn(
                              "font-mono font-semibold",
                              suggestion.impact.latency < 0 ? "text-emerald-700" : "text-amber-700"
                            )}>
                              {suggestion.impact.latency < 0 ? '' : '+'}{suggestion.impact.latency}ms
                            </span>
                          </div>
                        )}
                      </div>

                      {!isApplied ? (
                        <Button
                          size="sm"
                          onClick={() => handleApplySuggestion(suggestion)}
                          className={cn(
                            "w-full h-5 text-[9px] text-white",
                            suggestion.color === "emerald" && "bg-emerald-600 hover:bg-emerald-700",
                            suggestion.color === "purple" && "bg-purple-600 hover:bg-purple-700",
                            suggestion.color === "amber" && "bg-amber-600 hover:bg-amber-700"
                          )}
                        >
                          <CheckCircle className="w-2 h-2 mr-0.5" />
                          Apply
                        </Button>
                      ) : (
                        <div className="flex items-center justify-center h-5 text-[9px] text-emerald-700 font-semibold">
                          <Check className="w-2.5 h-2.5 mr-0.5" />
                          Applied
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Runbooks - Compact Grid */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm rounded-lg">
            <CardHeader className="border-b border-slate-200 pb-1.5 px-3 pt-2">
              <CardTitle className="text-slate-900 text-xs flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-blue-600" />
                Runbooks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { name: "Batch", icon: Package, color: "blue" },
                  { name: "AR", icon: DollarSign, color: "emerald" },
                  { name: "Cost", icon: TrendingDown, color: "purple" },
                  { name: "Tax", icon: RefreshCw, color: "amber" },
                  { name: "Price", icon: DollarSign, color: "cyan" },
                  { name: "Clean", icon: Sparkles, color: "pink" }
                ].map((rb) => (
                  <Button
                    key={rb.name}
                    variant="outline"
                    onClick={() => handleRunbook(rb.name)}
                    className="h-12 flex flex-col gap-0.5 bg-white border-slate-200 hover:bg-slate-50 hover:scale-105 transition-transform p-1 rounded">
                    <rb.icon className={`w-3 h-3 text-${rb.color}-600`} />
                    <span className="text-[9px] text-slate-700 leading-tight">{rb.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Log - New */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm rounded-lg">
            <CardHeader className="border-b border-slate-200 pb-1.5 px-3 pt-2">
              <CardTitle className="text-slate-900 text-xs flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1 max-h-32 overflow-y-auto">
                <AnimatePresence>
                  {activityLog.slice(0, 5).map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-50 text-[9px]"
                    >
                      <div className={cn(
                        "w-1 h-1 rounded-full flex-shrink-0",
                        activity.type === "success" && "bg-emerald-500",
                        activity.type === "warn" && "bg-amber-500",
                        activity.type === "error" && "bg-red-500",
                        activity.type === "info" && "bg-blue-500"
                      )}></div>
                      <span className="text-slate-700 leading-tight flex-1">{activity.message}</span>
                      <span className="text-slate-500 text-[8px]">
                        {new Date(activity.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Telemetry Full Width */}
        <div className="col-span-12">
          <motion.div
            animate={telemetryPulse ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <TelemetryChart
              onTimeRangeSelect={handleTimeRangeFilter}
              onExplainTrend={handleExplainTrend}
            />
          </motion.div>
        </div>
      </div>

      {/* Enhanced AI Analysis Drawer with Trace & Reasoning */}
      <Sheet open={aiAnalysisOpen} onOpenChange={setAiAnalysisOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600 animate-pulse" />
              AI Analysis & Decision Trace
            </SheetTitle>
          </SheetHeader>
          
          {aiAnalysisLoading ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-slate-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : (
            <Tabs defaultValue="analysis" className="mt-6">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="trace">Decision Trace</TabsTrigger>
                <TabsTrigger value="reasoning">Why This Response</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="space-y-4 mt-4">
                {/* What Happened */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">What Happened</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {aiAnalysisContent?.type === 'kpi' && `The ${aiAnalysisContent.metric} metric showed a significant change in the past hour, likely due to increased request volume and routing adjustments.`}
                    {aiAnalysisContent?.type === 'request' && `This request was evaluated for routing based on intent complexity, payload size, and risk factors. The AI routing engine recommended ${aiAnalysisContent.data?.route} channel for optimal performance.`}
                    {aiAnalysisContent?.type === 'telemetry' && `The ${aiAnalysisContent.mode} trend shows patterns consistent with typical workload fluctuations, with a slight increase during peak hours.`}
                  </p>
                </div>

                {/* Why It Happened */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="text-sm font-semibold text-purple-900 mb-2">Why It Happened</h3>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Webhook source increased request volume by 45%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Policy validation added 120ms average latency</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Auto-routing shifted 30% of load to autopilot channel</span>
                    </li>
                  </ul>
                </div>

                {/* Blast Radius */}
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h3 className="text-sm font-semibold text-amber-900 mb-2">Blast Radius</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-900">12</div>
                      <div className="text-xs text-amber-700">Requests Affected</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-900">3</div>
                      <div className="text-xs text-amber-700">Channels Impacted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-900">$0.45</div>
                      <div className="text-xs text-amber-700">Cost Impact</div>
                    </div>
                  </div>
                </div>

                {/* Next Actions */}
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h3 className="text-sm font-semibold text-emerald-900 mb-3">Suggested Actions</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Increase concurrency by 2", impact: "Latency ↓ 15%" },
                      { label: "Throttle webhook to 200 RPS", impact: "Cost ↓ $0.30/hr" },
                      { label: "Enable aggressive caching", impact: "Latency ↓ 25%" }
                    ].map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="w-full justify-between bg-white hover:bg-emerald-50 border-emerald-300 text-sm"
                        onClick={() => {
                          toast.success(`Fix applied: ${action.label}`);
                          addActivity(`Applied: ${action.label}`, "success");
                          setTelemetryPulse(true);
                          setTimeout(() => setTelemetryPulse(false), 1000);
                        }}
                      >
                        <span className="text-slate-900">{action.label}</span>
                        <span className="text-emerald-700 text-xs">{action.impact}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="trace" className="space-y-4 mt-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Decision Trace Flow</h3>
                  
                  {/* Decision Steps */}
                  <div className="space-y-3">
                    {[
                      { step: 1, title: "Input Processing", confidence: 100, data: ["Intent: invoice_processing", "Payload: 2.4KB", "Priority: High"], time: "12ms" },
                      { step: 2, title: "Risk Assessment", confidence: 94, data: ["PII: Detected", "Risk Score: 0.32", "Breach Prob: 0.15"], time: "28ms" },
                      { step: 3, title: "Policy Validation", confidence: 98, data: ["PII Masking: Applied", "Compliance: Passed", "Budget Check: OK"], time: "45ms" },
                      { step: 4, title: "Route Selection", confidence: 91, data: ["Model: gpt-4o-mini", "Channel: pilot", "Est. Cost: $0.045"], time: "18ms" },
                      { step: 5, title: "Final Decision", confidence: 93, data: ["Route: pilot", "Priority: Elevated", "SLA: 15min"], time: "5ms" }
                    ].map((step, idx) => (
                      <motion.div
                        key={step.step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                              step.confidence >= 95 ? "bg-emerald-100 text-emerald-700" :
                              step.confidence >= 90 ? "bg-blue-100 text-blue-700" :
                              "bg-amber-100 text-amber-700"
                            )}>
                              {step.step}
                            </div>
                            {idx < 4 && (
                              <div className="w-0.5 h-12 bg-slate-300 my-1"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 pb-3">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-semibold text-slate-900">{step.title}</h4>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-purple-100 text-purple-800 text-xs">
                                  {step.confidence}% confident
                                </Badge>
                                <Badge className="bg-slate-100 text-slate-700 text-xs">
                                  {step.time}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {step.data.map((point, i) => (
                                <div key={i} className="text-xs p-2 bg-white rounded border border-slate-200">
                                  <span className="text-slate-700">{point}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-900 font-semibold">Total Decision Time</span>
                      <span className="text-blue-700 font-mono">108ms</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reasoning" className="space-y-4 mt-4">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Why This Response?
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 mb-2">Primary Factors</h4>
                      <div className="space-y-2">
                        {[
                          { factor: "Intent Complexity", weight: 35, value: "Medium", explanation: "invoice_processing requires structured extraction and validation" },
                          { factor: "Payload Size", weight: 20, value: "2.4KB", explanation: "Small payload allows fast processing on standard models" },
                          { factor: "Risk Score", weight: 25, value: "0.32", explanation: "PII detected but within acceptable risk threshold" },
                          { factor: "Cost Optimization", weight: 20, value: "High", explanation: "Selected cost-efficient model without compromising quality" }
                        ].map((factor) => (
                          <div key={factor.factor} className="p-3 bg-white rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-slate-900">{factor.factor}</span>
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                {factor.weight}% weight
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-700 mb-1">
                              <strong>Value:</strong> {factor.value}
                            </div>
                            <p className="text-xs text-slate-600 leading-tight">{factor.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 mb-2">Model Selection Logic</h4>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-700 leading-relaxed mb-2">
                          The AI selected <strong className="text-blue-600">gpt-4o-mini</strong> because:
                        </p>
                        <ul className="space-y-1 text-xs text-slate-700">
                          <li className="flex items-start gap-2">
                            <Check className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>Handles structured data extraction efficiently</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>Cost-optimal for medium complexity tasks ($0.045 vs $0.12)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>Historical success rate: 94% for similar intents</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>Latency target met: 842ms (well below 1200ms threshold)</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 mb-2">Alternative Paths Considered</h4>
                      <div className="space-y-2">
                        {[
                          { path: "Copilot + claude-3-haiku", confidence: 78, reason: "Rejected: Slower processing time for similar accuracy" },
                          { path: "Autopilot + gpt-3.5-turbo", confidence: 65, reason: "Rejected: Insufficient accuracy for PII handling" }
                        ].map((alt) => (
                          <div key={alt.path} className="p-2 bg-white rounded border border-slate-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-900">{alt.path}</span>
                              <Badge className="bg-slate-100 text-slate-700 text-xs">
                                {alt.confidence}%
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600">{alt.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>

      {/* Auto-Prioritize Dialog */}
      <Dialog open={autoPrioritizeOpen} onOpenChange={setAutoPrioritizeOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Auto-Prioritize Queue
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              AI will reorder the queue based on risk, SLA, and business rules
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Proposed Changes</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">High-risk requests elevated</span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Low-risk requests deprioritized</span>
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200">2</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">VIP requests moved to top</span>
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200">1</Badge>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAutoPrioritizeOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAutoPrioritize}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Operation Modal */}
      <Dialog open={batchModalOpen} onOpenChange={(open) => {
        setBatchModalOpen(open);
        if (!open) {
          setBatchResults(null);
          setBatchProgress(0);
        }
      }}>
        <DialogContent className="bg-white border-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Batch Operation: {selectedRunbook}</DialogTitle>
            <DialogDescription className="text-slate-600">
              {batchResults ? "Operation completed" : batchRunning ? "Running batch operation" : "Configure and run batch operation"}
            </DialogDescription>
          </DialogHeader>
          
          {batchResults ? (
            <div className="space-y-4 py-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Operation Successful</h3>
                <p className="text-sm text-slate-600">{batchResults.summary}</p>
              </div>
              
              <Card className="bg-slate-50 border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-900">Results Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(batchResults).map(([key, value]) => {
                    if (key === 'summary') return null;
                    const formattedKey = key.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ');
                    
                    return (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-slate-600">{formattedKey}</span>
                        <span className="text-slate-900 font-medium">
                          {typeof value === 'number' ? 
                            (key.includes('amount') || key.includes('savings') || key.includes('adjustment') ? 
                              `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                              value.toLocaleString()
                            ) : 
                            value
                          }
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
              
              <DialogFooter>
                <Button 
                  onClick={() => {
                    setBatchModalOpen(false);
                    setBatchResults(null);
                    setBatchProgress(0);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : batchRunning ? (
            <div className="space-y-4 py-6">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-3" />
                <p className="text-sm text-slate-700 font-medium">Running batch operation...</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Progress</span>
                  <span>{batchProgress}%</span>
                </div>
                <Progress value={batchProgress} className="h-2" />
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-slate-900 text-sm mb-2 block">Scope</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all">All Records</SelectItem>
                    <SelectItem value="filtered">Filtered Subset</SelectItem>
                    <SelectItem value="single">Single Entity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-sm font-medium text-slate-900">Dry Run</div>
                  <div className="text-xs text-slate-600">Preview results without executing</div>
                </div>
                <Switch defaultChecked />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setBatchModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={startBatchOperation}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Run Batch
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Confirmation Modal */}
      <Dialog open={profileConfirmOpen} onOpenChange={setProfileConfirmOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Apply Profile: {selectedProfile}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              This will update routing rules and concurrency limits
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
              <h4 className="text-sm font-semibold text-blue-900">Configuration Changes</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Profile</span>
                  <Badge className="bg-blue-100 text-blue-700 font-mono">{selectedProfile}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Max Concurrency</span>
                  <Badge className="bg-purple-100 text-purple-700 font-mono">{concurrency[0]}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Cost Cap</span>
                  <Badge className="bg-emerald-100 text-emerald-700 font-mono">${(currentProfile.cost_cap_cents_per_hour / 100).toFixed(2)}/hr</Badge>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmApplyProfile}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Check className="w-4 h-4 mr-2" />
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reasoning Drawer */}
      <Sheet open={reasoningDrawerOpen} onOpenChange={setReasoningDrawerOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Request Details & Reasoning
            </SheetTitle>
          </SheetHeader>
          {selectedRequest && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="bg-slate-100 p-1">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="policy" className="text-xs">Policy Checks</TabsTrigger>
                <TabsTrigger value="routing" className="text-xs">Routing</TabsTrigger>
                <TabsTrigger value="cost" className="text-xs">Cost</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Request ID</span>
                    <span className="font-mono text-slate-900">{selectedRequest.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Source</span>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      {selectedRequest.source}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Intent</span>
                    <span className="text-slate-900 font-medium">{selectedRequest.intent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Priority</span>
                    <PriorityBadge priority={selectedRequest.priority} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Risk Score</span>
                    <RiskIndicator score={selectedRequest.risk_score || 0} breachProb={selectedRequest.breach_probability || 0} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">SLA Deadline</span>
                    <span className={getSLAColor(selectedRequest.sla_deadline)}>
                      {selectedRequest.sla_deadline ? getSLAText(selectedRequest.sla_deadline) : "No SLA"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">PII Detected</span>
                    <Badge className={selectedRequest.pii ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-100 text-slate-700"}>
                      {selectedRequest.pii ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">VIP Customer</span>
                    <span>{selectedRequest.vip ? "⭐ Yes" : "No"}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Payload Preview</h4>
                  <pre className="text-xs bg-slate-50 rounded-lg p-3 border border-slate-200 overflow-x-auto">
                    {JSON.stringify(selectedRequest.payload_json || {}, null, 2)}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="policy" className="mt-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-900">Pre-Flight Policy Checks</h4>
                {[
                  { check: "PII Masking", status: selectedRequest.pii ? "Applied" : "N/A", severity: selectedRequest.pii ? "warn" : "info" },
                  { check: "Vendor Lock", status: "Passed", severity: "info" },
                  { check: "FinOps Budget", status: "Within Limit", severity: "info" },
                  { check: "Compliance Mode", status: "Active", severity: "info" }
                ].map((check, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm text-slate-700">{check.check}</span>
                    <Badge className={cn(
                      "text-xs",
                      check.severity === "warn" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    )}>
                      {check.status}
                    </Badge>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="routing" className="mt-4 space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Routing Decision</h4>
                  <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex justify-between">
                      <span>Assigned Route:</span>
                      <RoutePill route={selectedRequest.route} />
                    </div>
                    <div className="flex justify-between">
                      <span>Suggested Model:</span>
                      <Badge className="bg-slate-100 text-slate-900 text-xs font-mono">
                        {selectedRequest.model_suggestion || "gpt-4o-mini"}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-slate-600">
                    <strong>Rationale:</strong> Intent complexity is low, payload &lt;50KB, no tool calls required. Routing to {selectedRequest.route} with {selectedRequest.model_suggestion}.
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cost" className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Estimated Cost</div>
                    <div className="text-lg font-bold text-slate-900">
                      ¢{selectedRequest.cost_estimate_cents || 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Est. Tokens</div>
                    <div className="text-lg font-bold text-slate-900">~650</div>
                  </div>
                </div>
                <div className="text-xs text-slate-600">
                  Based on payload size ({JSON.stringify(selectedRequest.payload_json || {}).length} bytes) and historical averages for {selectedRequest.intent} intent.
                </div>
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>

      {/* Enhanced Incidents Sheet with Visualizer Option */}
      <Sheet open={incidentsOpen} onOpenChange={setIncidentsOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-600" />
              Open Incidents
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {incidents.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                <p className="text-sm text-slate-600">No open incidents</p>
              </div>
            ) : (
              incidents.map((incident) => (
                <Card key={incident.id} className={cn(
                  "border-2 cursor-pointer hover:shadow-lg transition-all",
                  incident.status === "open" && "border-red-300 bg-red-50/50",
                  incident.status === "mitigating" && "border-amber-300 bg-amber-50/50"
                )}
                onClick={() => handleOpenIncidentVisualizer(incident)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-red-600" />
                        <div>
                          <h3 className="font-semibold text-slate-900 capitalize">
                            {incident.type.replace(/_/g, ' ')}
                          </h3>
                          <p className="text-xs text-slate-600">
                            Started {new Date(incident.started_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn(
                        incident.status === "open" ? "bg-red-100 text-red-700 border-red-300" : "bg-amber-100 text-amber-700 border-amber-300"
                      )}>
                        {incident.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-slate-600">
                      Click to view detailed analysis and mitigation options
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
                        {incident.blast_radius_json?.requests_impacted || 0} requests affected
                      </Badge>
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                        AI: 92% confidence
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Incident Visualizer Modal */}
      <Sheet open={incidentVisualizerOpen} onOpenChange={setIncidentVisualizerOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-5xl overflow-y-auto">
          <IncidentVisualizer
            incident={selectedIncident}
            onClose={() => setIncidentVisualizerOpen(false)}
            onMitigate={(incident, action) => {
              handleMitigateIncident(incident);
              setIncidentVisualizerOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* New Mission Dialog - ENHANCED */}
      <Dialog open={newMissionOpen} onOpenChange={(open) => {
        if (!open) handleCloseMissionDialog();
        else setNewMissionOpen(open);
      }}>
        <DialogContent className="bg-white border-slate-200 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              {missionSimulationResult ? "Mission Simulation Complete" : "Create New AI Mission"}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {missionSimulationResult 
                ? "AI has generated realistic operational metrics for your mission" 
                : "Define mission parameters and let AI simulate expected performance"}
            </DialogDescription>
          </DialogHeader>
          
          {!missionSimulationResult ? (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-slate-900 text-sm mb-2 block">Mission Name</Label>
                <Input
                  value={newMissionName}
                  onChange={(e) => setNewMissionName(e.target.value)}
                  placeholder="e.g., invoice_chase_v2"
                  className="bg-white border-slate-200 text-slate-900"
                  disabled={creatingMission}
                />
              </div>
              <div>
                <Label className="text-slate-900 text-sm mb-2 block">Objective</Label>
                <Textarea
                  value={newMissionObjective}
                  onChange={(e) => setNewMissionObjective(e.target.value)}
                  placeholder="Describe what this mission should accomplish..."
                  className="bg-white border-slate-200 text-slate-900 min-h-24"
                  disabled={creatingMission}
                />
              </div>
              <div>
                <Label className="text-slate-900 text-sm mb-2 block">Priority</Label>
                <Select value={newMissionPriority} onValueChange={setNewMissionPriority} disabled={creatingMission}>
                  <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="1">P1 (Critical)</SelectItem>
                    <SelectItem value="2">P2 (High)</SelectItem>
                    <SelectItem value="3">P3 (Medium)</SelectItem>
                    <SelectItem value="4">P4 (Low)</SelectItem>
                    <SelectItem value="5">P5 (Background)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                  onClick={handleCloseMissionDialog}
                  disabled={creatingMission}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  onClick={handleCreateMission}
                  disabled={creatingMission || !newMissionName || !newMissionObjective}>
                  {creatingMission ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      AI Simulating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create & Simulate Mission
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Success Header */}
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{missionSimulationResult.name}</h3>
                <p className="text-sm text-slate-600">{missionSimulationResult.intent}</p>
              </div>

              {/* AI-Generated Metrics */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    AI-Simulated Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Success Rate</div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {missionSimulationResult.simulation_metadata.successRate}%
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Avg Latency</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {missionSimulationResult.simulation_metadata.avgLatency}ms
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Cost/Run</div>
                    <div className="text-2xl font-bold text-purple-600">
                      ${missionSimulationResult.simulation_metadata.spendPerRun}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Route</div>
                    <Badge className={cn(
                      "text-xs",
                      missionSimulationResult.simulation_metadata.route === "pilot" && "bg-blue-500/20 text-blue-700 border-blue-300",
                      missionSimulationResult.simulation_metadata.route === "copilot" && "bg-purple-500/20 text-purple-700 border-purple-300",
                      missionSimulationResult.simulation_metadata.route === "autopilot" && "bg-emerald-500/20 text-emerald-700 border-emerald-300"
                    )}>
                      {missionSimulationResult.simulation_metadata.route}
                    </Badge>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Tokens/Run</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {missionSimulationResult.simulation_metadata.tokensPerRun}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Risk Score</div>
                    <div className="text-2xl font-bold text-amber-600">
                      {(missionSimulationResult.risk_score * 100).toFixed(0)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              {missionSimulationResult.simulation_metadata.estimatedImpact && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-purple-900 mb-1">AI Analysis</div>
                        <p className="text-sm text-slate-700">{missionSimulationResult.simulation_metadata.estimatedImpact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Simulated Run History */}
              {missionSimulationResult.simulation_metadata.lastRuns && (
                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-900">Simulated Run History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-1">
                      {missionSimulationResult.simulation_metadata.lastRuns.map((run, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex-1 h-8 rounded",
                            run.success === 1 ? "bg-emerald-400" : "bg-red-400"
                          )}
                          title={run.success === 1 ? "Success" : "Failure"}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 mt-2">
                      <span>Last 10 Runs (Simulated)</span>
                      <span>{missionSimulationResult.simulation_metadata.lastRuns.filter(r => r.success === 1).length}/10 Success</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Optimizations */}
              {missionSimulationResult.simulation_metadata.suggestedOptimizations?.length > 0 && (
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      Suggested Optimizations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {missionSimulationResult.simulation_metadata.suggestedOptimizations.map((opt, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                          <ChevronRight className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{opt}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  className="flex-1 bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                  onClick={handleCloseMissionDialog}>
                  Close
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                  onClick={() => {
                    toast.success("Mission deployed to Pilot!", {
                      description: `${missionSimulationResult.name} is now active`
                    });
                    handleCloseMissionDialog();
                  }}>
                  <Play className="w-4 h-4 mr-2" />
                  Deploy to Production
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Logs Drawer */}
      <Sheet open={logsOpen} onOpenChange={setLogsOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-600" />
              Live System Logs
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <div className="bg-slate-900 rounded-lg p-4 h-[calc(100vh-200px)] overflow-y-auto font-mono text-xs">
              {streamingLogs.map((log, idx) => (
                <div key={idx} className="mb-1 text-slate-300">
                  <span className="text-slate-500">{new Date(log.ts).toLocaleTimeString()}</span>
                  {" "}
                  <span>{log.message}</span>
                </div>
              ))}
              {streamingLogs.length > 0 && (
                <div className="text-emerald-400 animate-pulse">█</div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Command Bar */}
      <CommandBar
        open={commandBarOpen}
        onOpenChange={setCommandBarOpen}
        onExecuteCommand={handleExecuteCommand}
      />

      {/* Audit Log Viewer */}
      <AuditLogViewer 
        open={auditLogOpen}
        onOpenChange={setAuditLogOpen}
      />
    </div>
  );
}
