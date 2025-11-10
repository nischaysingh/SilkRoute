
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Search, Filter, Mail, Phone, MapPin, Calendar, DollarSign,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Tag, Eye, Edit,
  MessageSquare, FileText, Star, Activity, BarChart3, Target, Zap, Brain,
  ThumbsUp, ThumbsDown, Building2, User, ShoppingCart, CreditCard, Heart,
  AlertTriangle, Send, Copy, Download, X, ChevronRight, Info, Sparkles,
  GitBranch, Link2, Bell, Settings, Inbox, Layers, Play, Pause, MoreHorizontal,
  ArrowRight, TrendingDown as ChurnIcon, Award, Workflow,
  BarChart2, Shield, Archive, Repeat, Cpu, // Cpu is moved here as per outline
  Globe, Slack, MessageCircle, Video, RefreshCw, Circle, CheckCircle2,
  XCircle, AlertOctagon, Briefcase, UserPlus, Percent, ChevronDown, ChevronUp,
  Command, Lightbulb, Rocket, TrendingDown as SlipRisk, Gauge, Network,
  Loader2, FileDown, Share2, Hash, Layers3, UserCog // UserCog is re-added here to preserve functionality
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, addDays, differenceInDays } from "date-fns";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Legend, ComposedChart
} from "recharts";
import { toast } from "sonner";
import DealHealthChip from "./crm/DealHealthChip";
import PersonaChip from "./crm/PersonaChip";
import OwnerAvatar from "./crm/OwnerAvatar";
import ActivitySparkline from "./crm/ActivitySparkline";
import TimeSLAPips from "./crm/TimeSLAPips";
import AISidePanel from "./crm/AISidePanel";
import {
  generateDeals,
  generateThreads,
  generateAccounts,
  generateTickets,
  generateJourneys,
  generateRevenueData,
  generatePipelineByStage
} from "./crm/mockData";

export default function CustomerManagement() {
  const now = new Date();

  const [deals, setDeals] = useState([]);
  const [threads, setThreads] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState("pipeline");
  const [activeSubTab, setActiveSubTab] = useState("kanban");
  const [filters, setFilters] = useState({
    stage: [],
    health: [],
    owner: []
  });

  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [dealDrawerOpen, setDealDrawerOpen] = useState(false);
  const [threadDrawerOpen, setThreadDrawerOpen] = useState(false);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [ticketDrawerOpen, setTicketDrawerOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const [draggedDeal, setDraggedDeal] = useState(null);
  const [aiContext, setAiContext] = useState({});

  // Phase 3: AI Intelligence Layer States
  const [aiCopilotOpen, setAiCopilotOpen] = useState(false);
  const [aiCopilotMode, setAiCopilotMode] = useState("chat"); // chat | actions | suggestions
  const [aiChatMessages, setAiChatMessages] = useState([]);
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [forecastSandboxOpen, setForecastSandboxOpen] = useState(false);
  const [forecastParams, setForecastParams] = useState({
    winRate: 50,
    avgDealSize: 50000,
    churnRate: 5
  });
  const [reportGenerating, setReportGenerating] = useState(false);
  const [narrativeOpen, setNarrativeOpen] = useState(false);
  const [businessNarrative, setBusinessNarrative] = useState("");
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [peopleGraphOpen, setPeopleGraphOpen] = useState(false);

  // Phase 4: Autonomous AI Operations State
  const [autonomyLevel, setAutonomyLevel] = useState(3); // 1-5 scale
  const [activeAgents, setActiveAgents] = useState([
    {
      id: 'deal_idle_manager',
      name: 'Deal Idle Manager',
      status: 'active',
      confidence: 94,
      actionsToday: 12,
      successRate: 89,
      description: 'Auto-reassign stale deals'
    },
    {
      id: 'account_health_monitor',
      name: 'Account Health Monitor',
      status: 'active',
      confidence: 91,
      actionsToday: 8,
      successRate: 92,
      description: 'Flag at-risk accounts'
    },
    {
      id: 'sla_optimizer',
      name: 'SLA Optimizer',
      status: 'active',
      confidence: 88,
      actionsToday: 15,
      successRate: 85,
      description: 'Auto-upgrade shipping'
    },
    {
      id: 'inbox_prioritizer',
      name: 'Inbox Prioritizer',
      status: 'active',
      confidence: 93,
      actionsToday: 24,
      successRate: 91,
      description: 'Auto-route high-intent emails'
    }
  ]);

  const [decisionFeed, setDecisionFeed] = useState([
    {
      id: 1,
      timestamp: new Date(),
      agent: 'deal_idle_manager',
      action: 'Reassigned deal DEAL-10234 to Carol Martinez',
      confidence: 92,
      reason: 'Deal idle 18d + Owner bandwidth low',
      expectedImpact: '+12% follow-up rate',
      impact: '$45K pipeline',
      status: 'approved',
      reviewer: 'System',
      reversible: true,
      simulationData: {
        nodes: [
          { id: 'deal', label: 'Deal Pipeline', delta: '+$45K', color: 'emerald' },
          { id: 'owner', label: 'Owner Capacity', delta: '-2h/week', color: 'amber' },
          { id: 'velocity', label: 'Stage Velocity', delta: '+8%', color: 'emerald' }
        ],
        edges: [
          { from: 'deal', to: 'velocity', impact: 'positive' },
          { from: 'deal', to: 'owner', impact: 'neutral' }
        ]
      }
    },
    {
      id: 2,
      timestamp: subDays(new Date(), 0.5),
      agent: 'account_health_monitor',
      action: 'Created QBR task for Acme Corp',
      confidence: 89,
      reason: 'Health score dropped 12pts in 7 days',
      expectedImpact: '-65% churn risk',
      impact: '$85K ARR protected',
      status: 'approved',
      reviewer: 'alice@company.com',
      reversible: true,
      simulationData: {
        nodes: [
          { id: 'account', label: 'Account Health', delta: '+15pts', color: 'emerald' },
          { id: 'revenue', label: 'ARR Risk', delta: '-$85K', color: 'emerald' },
          { id: 'csm', label: 'CSM Time', delta: '+3h', color: 'amber' }
        ],
        edges: [
          { from: 'account', to: 'revenue', impact: 'positive' },
          { from: 'account', to: 'csm', impact: 'neutral' }
        ]
      }
    },
    {
      id: 3,
      timestamp: subDays(new Date(), 1),
      agent: 'sla_optimizer',
      action: 'Auto-upgraded shipping for 3 orders',
      confidence: 95,
      reason: 'SLA breach risk >80%',
      expectedImpact: '0 breaches prevented',
      impact: '-$45 cost vs breach penalty',
      status: 'rolled_back',
      reviewer: 'System',
      reversible: true,
      rollbackReason: 'Customer requested standard shipping',
      simulationData: {
        nodes: [
          { id: 'sla', label: 'SLA Compliance', delta: '+3%', color: 'emerald' },
          { id: 'cost', label: 'Shipping Cost', delta: '+$45', color: 'red' },
          { id: 'csat', label: 'CSAT', delta: '+2pts', color: 'emerald' }
        ],
        edges: [
          { from: 'sla', to: 'csat', impact: 'positive' },
          { from: 'sla', to: 'cost', impact: 'negative' }
        ]
      }
    }
  ]);

  const [pendingDecisions, setPendingDecisions] = useState([
    {
      id: 'pending_1',
      agent: 'inbox_prioritizer',
      action: 'Auto-respond to 5 low-priority inquiries',
      confidence: 87,
      reason: 'FAQ topics detected with high confidence',
      expectedImpact: '-2.5h CSM time',
      requiresApproval: true,
      autonomyThreshold: 4,
      simulationData: {
        nodes: [
          { id: 'inbox', label: 'Inbox Volume', delta: '-5 items', color: 'emerald' },
          { id: 'csm_time', label: 'CSM Time', delta: '-2.5h', color: 'emerald' },
          { id: 'response_time', label: 'Response Time', delta: '+10%', color: 'emerald' }
        ],
        edges: []
      }
    }
  ]);

  const [learningMetrics, setLearningMetrics] = useState({
    totalDecisions: 248,
    approved: 223,
    rejected: 18,
    rolledBack: 7,
    accuracy: 89.9,
    impactRealized: '$127K',
    timesSaved: '42h'
  });

  const [simulationOpen, setSimulationOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [autonomyDashboardOpen, setAutonomyDashboardOpen] = useState(false);
  const [policyFrameworkOpen, setPolicyFrameworkOpen] = useState(false);

  const [policies, setPolicies] = useState({
    hardGuards: [
      { id: 1, rule: 'Cannot delete records', active: true },
      { id: 2, rule: 'Cannot process payments', active: true },
      { id: 3, rule: 'Cannot create billing entries', active: true }
    ],
    softGuards: [
      { id: 1, rule: 'Require 90% confidence for deal reassignment', active: true, threshold: 90 },
      { id: 2, rule: 'Human approval for actions >$10K impact', active: true, threshold: 10000 },
      { id: 3, rule: 'Limit 50 actions per day per agent', active: true, threshold: 50 }
    ],
    learningGuards: [
      { id: 1, rule: 'Auto-adjust after 20 successful runs', active: true, runs: 20, adjusted: false },
      { id: 2, rule: 'Increase autonomy if >95% approval rate', active: true, rate: 95, adjusted: true }
    ]
  });

  // Cross-System Insights (mock)
  const [insights, setInsights] = useState([
    {
      id: 1,
      type: "correlation",
      title: "Payroll spike correlates with deal velocity",
      description: "3 new AEs hired → 18% increase in weighted pipeline",
      impact: "+$420K",
      confidence: 87,
      linkedEntities: ["Pipeline", "Payroll"],
      action: "View Details",
      severity: "positive"
    },
    {
      id: 2,
      type: "anomaly",
      title: "Inbox response time degraded 40%",
      description: "Average response time increased from 1.2h to 2.8h",
      impact: "-12% conv",
      confidence: 92,
      linkedEntities: ["Inbox", "Conversion"],
      action: "Investigate",
      severity: "warning"
    },
    {
      id: 3,
      type: "prediction",
      title: "Churn risk elevated for 3 accounts",
      description: "Health scores dropped 15+ points, NPS declined",
      impact: "-$85K ARR",
      confidence: 78,
      linkedEntities: ["Accounts", "Revenue"],
      action: "Act Now",
      severity: "critical"
    }
  ]);

  // Predictive Alerts (mock)
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      severity: "high",
      title: "Deal slip risk: ACME Corp",
      cause: "No activity in 14 days, exec sponsor missing",
      suggestedFix: "Schedule CEO intro call",
      timestamp: new Date()
    },
    {
      id: 2,
      severity: "medium",
      title: "Support ticket SLA breach imminent",
      cause: "3 P1 tickets approaching 4h mark",
      suggestedFix: "Auto-escalate to senior engineer",
      timestamp: subDays(new Date(), 0.5)
    },
    {
      id: 3,
      severity: "low",
      title: "Revenue forecast accuracy drifting",
      cause: "Actual vs. forecast variance at 8%",
      suggestedFix: "Review pipeline weighting model",
      timestamp: subDays(new Date(), 1)
    }
  ]);

  // Phase 5: Inbox Intelligence Layer States
  const [inboxView, setInboxView] = useState("all"); // all | needs_action | drafts | escalations | waiting_customer | auto_resolved
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [threadCommandOpen, setThreadCommandOpen] = useState(false);
  const [threadCommandInput, setThreadCommandInput] = useState("");
  const [aiDraftDialogOpen, setAiDraftDialogOpen] = useState(false);
  const [selectedDraftThread, setSelectedDraftThread] = useState(null);
  const [smartRulesOpen, setSmartRulesOpen] = useState(false);
  const [convertToTaskOpen, setConvertToTaskOpen] = useState(false);
  const [selectedThreadForAction, setSelectedThreadForAction] = useState(null);

  // Smart Rules (mock)
  const [smartRules, setSmartRules] = useState([
    {
      id: 1,
      name: "Auto-route renewals to CSM",
      condition: "intent = renewal AND sentiment = negative",
      action: "Assign to CSM + Create task",
      active: true
    },
    {
      id: 2,
      name: "VIP auto-priority",
      condition: "tag = vip AND no reply in 2 days",
      action: "Send follow-up email",
      active: true
    },
    {
      id: 3,
      name: "SLA breach prevention",
      condition: "urgency = immediate AND slaBreachRisk = true",
      action: "Escalate to manager",
      active: false
    }
  ]);

  // Enhanced Accounts Tab States
  const [accountsViewMode, setAccountsViewMode] = useState("table"); // table | portfolio
  const [accountsAIConsoleOpen, setAccountsAIConsoleOpen] = useState(false);
  const [selectedAccountForAI, setSelectedAccountForAI] = useState(null);
  const [accountsFilter, setAccountsFilter] = useState("all"); // all | at_risk | expansion_ready | renewal_soon
  const [accountInsights, setAccountInsights] = useState([
    {
      id: 1,
      type: "risk",
      icon: "🧠",
      text: "12 accounts show signs of renewal hesitation — avg NPS: -38",
      severity: "high",
      accountIds: ['ACC-10001', 'ACC-10003', 'ACC-10007']
    },
    {
      id: 2,
      type: "expansion",
      icon: "⚡",
      text: "Delta Inc likely to expand to 1.4× ARR within 90 days",
      severity: "positive",
      accountIds: ['ACC-10002']
    },
    {
      id: 3,
      type: "engagement",
      icon: "🚨",
      text: "Epsilon Inc engagement down 48% — exec champion inactive for 3 weeks",
      severity: "critical",
      accountIds: ['ACC-10004']
    }
  ]);

  // Calculate Composite Account Health (CAH)
  const calculateCAH = (account) => {
    // Usage & Adoption (0-100)
    const adoptionScore = Math.min(100, (account.usage.activeUsers / account.seats) * 100);

    // Financials (0-100) - based on ARR growth
    const financialScore = account.arr > 50000 ? 85 : 70;

    // Engagement (0-100) - based on sentiment and activity
    const engagementScore = account.nps > 50 ? 90 : account.nps > 0 ? 70 : 50;

    // Support (0-100) - inverse of open tickets
    const supportScore = Math.max(0, 100 - (account.ticketsOpen * 20));

    // Relationship Depth (0-100) - mock calculation
    const relationshipScore = 75;

    // Weighted formula
    const cah = Math.round(
      0.25 * adoptionScore +
      0.20 * engagementScore +
      0.25 * financialScore +
      0.15 * supportScore +
      0.15 * relationshipScore
    );

    return {
      score: cah,
      breakdown: {
        adoption: adoptionScore,
        engagement: engagementScore,
        financial: financialScore,
        support: supportScore,
        relationship: relationshipScore
      },
      trend: Array.from({ length: 7 }, () => Math.max(0, cah + Math.random() * 20 - 10))
    };
  };

  // Enhanced accounts with CAH
  const accountsWithCAH = useMemo(() => {
    return accounts.map(account => ({
      ...account,
      cah: calculateCAH(account),
      expansionPotential: account.expansionLikely > 70 ? Math.floor(account.arr * 0.3) : 0,
      renewalRisk: account.churnLikely > 60 ? 'high' : account.churnLikely > 30 ? 'medium' : 'low'
    }));
  }, [accounts]);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    if (accountsFilter === "all") return accountsWithCAH;
    if (accountsFilter === "at_risk") return accountsWithCAH.filter(a => a.churnLikely > 60);
    if (accountsFilter === "expansion_ready") return accountsWithCAH.filter(a => a.expansionLikely > 70);
    if (accountsFilter === "renewal_soon") return accountsWithCAH.filter(a => differenceInDays(new Date(a.renewalDate), now) < 90);
    return accountsWithCAH;
  }, [accountsWithCAH, accountsFilter]);

  // Account trends data
  const accountTrendsData = useMemo(() => {
    return {
      churnProbability: [
        { range: '0-20%', count: accountsWithCAH.filter(a => a.churnLikely <= 20).length },
        { range: '21-40%', count: accountsWithCAH.filter(a => a.churnLikely > 20 && a.churnLikely <= 40).length },
        { range: '41-60%', count: accountsWithCAH.filter(a => a.churnLikely > 40 && a.churnLikely <= 60).length },
        { range: '61-80%', count: accountsWithCAH.filter(a => a.churnLikely > 60 && a.churnLikely <= 80).length },
        { range: '81-100%', count: accountsWithCAH.filter(a => a.churnLikely > 80).length }
      ],
      expansionVsRisk: [
        { name: 'Expansion Ready', value: accountsWithCAH.filter(a => a.expansionLikely > 70).length, color: '#10b981' },
        { name: 'Healthy', value: accountsWithCAH.filter(a => a.churnLikely < 30 && a.expansionLikely <= 70).length, color: '#3b82f6' },
        { name: 'At Risk', value: accountsWithCAH.filter(a => a.churnLikely >= 60).length, color: '#ef4444' }
      ],
      arrBySegment: [
        { segment: 'Enterprise', arr: accountsWithCAH.filter(a => a.segment === 'Enterprise').reduce((sum, a) => sum + a.arr, 0) },
        { segment: 'Mid-Market', arr: accountsWithCAH.filter(a => a.segment === 'Mid-Market').reduce((sum, a) => sum + a.arr, 0) },
        { segment: 'SMB', arr: accountsWithCAH.filter(a => a.segment === 'SMB').reduce((sum, a) => sum + a.arr, 0) },
        { segment: 'Startup', arr: accountsWithCAH.filter(a => a.segment === 'Startup').reduce((sum, a) => sum + a.arr, 0) }
      ],
      engagementTrend: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        engagement: Math.floor(Math.random() * 30) + 60
      }))
    };
  }, [accountsWithCAH]);

  // Handle account AI actions
  const handleAccountAIAction = (account, action) => {
    if (action === 'qbr') {
      toast.success(`Generating QBR summary for ${account.name}...`);
      setTimeout(() => {
        toast.success("QBR summary ready!", {
          description: `90-day analysis: ${account.usage.last30d}% usage, ${account.ticketsOpen} open tickets, NPS ${account.nps}`
        });
      }, 1500);
    } else if (action === 'forecast') {
      setSelectedAccountForAI(account);
      setAccountsAIConsoleOpen(true);
    } else if (action === 'upsell') {
      toast.success(`Generating upsell plan for ${account.name}...`);
      setTimeout(() => {
        toast.success("Upsell opportunity identified!", {
          description: `Analytics module: $${(account.arr * 0.2 / 1000).toFixed(0)}K ARR potential`
        });
      }, 1500);
    } else if (action === 'reengage') {
      toast.success(`Drafting re-engagement email for ${account.name}...`);
    } else if (action === 'journey') {
      toast.success(`Adding ${account.name} to ${account.churnLikely > 60 ? 'Risk Recovery' : 'Expansion'} journey`);
    }
  };


  useEffect(() => {
    const dealsData = generateDeals();
    setDeals(dealsData);
    setThreads(generateThreads());
    setAccounts(generateAccounts());
    setTickets(generateTickets());
    setJourneys(generateJourneys());
    setRevenueData(generateRevenueData());
  }, []);

  const pipelineByStage = useMemo(() => {
    return generatePipelineByStage(deals);
  }, [deals]);

  const pipelineMetrics = useMemo(() => {
    const weighted = pipelineByStage.reduce((sum, s) => sum + s.weightedValue, 0);
    const total = pipelineByStage.reduce((sum, s) => sum + s.value, 0);
    const commit = deals.filter(d => d.stage === 'Commit').reduce((sum, d) => sum + d.amount, 0);
    const upside = total - commit;
    const atRisk = deals.filter(d => d.health === 'risk').reduce((sum, d) => sum + d.amount, 0);
    const avgStageAge = deals.length > 0 ? deals.reduce((sum, d) => sum + d.stageAgeDays, 0) / deals.length : 0;

    return {
      weighted,
      commit,
      upside,
      slipRisk: atRisk,
      stageVelocity: avgStageAge,
      forecastAccuracy: 94.2
    };
  }, [deals, pipelineByStage]);

  // Inbox-specific clustering logic
  const threadClusters = useMemo(() => {
    const clusters = {
      renewal: threads.filter(t => t.intent === 'renewal'),
      technical: threads.filter(t => t.topic === 'technical_bug' || t.topic === 'integration'),
      legal: threads.filter(t => t.tags.includes('legal') || t.topic === 'contract_terms'),
      pricing: threads.filter(t => t.intent === 'pricing_question' || t.topic === 'pricing'),
      escalations: threads.filter(t => t.urgency === 'immediate' || t.intent === 'escalation')
    };

    return Object.entries(clusters).map(([key, items]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      count: items.length,
      threads: items
    })).filter(c => c.count > 0);
  }, [threads]);

  // Smart folder filtering
  const filteredThreads = useMemo(() => {
    if (inboxView === "all") return threads;
    if (inboxView === "needs_action") return threads.filter(t => t.actionNeeded || t.waitingOn === 'us');
    if (inboxView === "drafts") return threads.filter(t => t.aiDraftReply);
    if (inboxView === "escalations") return threads.filter(t => t.urgency === 'immediate' || t.slaBreachRisk);
    if (inboxView === "waiting_customer") return threads.filter(t => t.waitingOn === 'customer');
    if (inboxView === "auto_resolved") return threads.filter(t => t.tags.includes('auto_resolved'));
    return threads;
  }, [threads, inboxView]);

  const handleDragStart = (deal) => {
    setDraggedDeal(deal);
  };

  const handleDrop = (newStage) => {
    if (draggedDeal) {
      setDeals(prev => prev.map(d =>
        d.id === draggedDeal.id ? { ...d, stage: newStage, stageAgeDays: 0 } : d
      ));
      toast.success(`Deal moved to ${newStage}`);
      setDraggedDeal(null);
    }
  };

  const handleAIInsights = (context) => {
    setAiContext(context);
    setAiPanelOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandBarOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autonomous Decision Handler
  const handleAutonomousDecision = (decision, approved = true) => {
    if (approved) {
      setDecisionFeed(prev => [
        {
          id: Date.now(),
          timestamp: new Date(),
          agent: decision.agent,
          action: decision.action,
          confidence: decision.confidence,
          reason: decision.reason,
          expectedImpact: decision.expectedImpact,
          impact: decision.expectedImpact,
          status: 'approved',
          reviewer: 'You',
          reversible: true,
          simulationData: decision.simulationData || {
            nodes: [{ id: 'default', label: 'Impact', delta: '+$0', color: 'blue' }],
            edges: []
          }
        },
        ...prev
      ]);

      setPendingDecisions(prev => prev.filter(d => d.id !== decision.id));

      setLearningMetrics(prev => ({
        ...prev,
        totalDecisions: prev.totalDecisions + 1,
        approved: prev.approved + 1,
        accuracy: (((prev.approved + 1) / (prev.totalDecisions + 1)) * 100).toFixed(1)
      }));

      toast.success('Decision approved and executed', {
        description: decision.action
      });
    } else {
      setLearningMetrics(prev => ({
        ...prev,
        totalDecisions: prev.totalDecisions + 1,
        rejected: prev.rejected + 1,
        accuracy: ((prev.approved / (prev.totalDecisions + 1)) * 100).toFixed(1)
      }));

      setPendingDecisions(prev => prev.filter(d => d.id !== decision.id));

      toast.info('Decision rejected', {
        description: 'Agent will learn from this feedback'
      });
    }
  };

  // Undo Action Handler
  const handleUndoDecision = (decisionId) => {
    setDecisionFeed(prev => prev.map(d =>
      d.id === decisionId
        ? { ...d, status: 'rolled_back', rollbackReason: 'Manual rollback by user' }
        : d
    ));

    setLearningMetrics(prev => ({
      ...prev,
      approved: prev.approved - 1,
      rolledBack: prev.rolledBack + 1,
      accuracy: ((prev.approved - 1) / prev.totalDecisions * 100).toFixed(1)
    }));

    toast.success('Action rolled back successfully');
  };

  // View Decision Simulation
  const handleViewSimulation = (decision) => {
    setSelectedDecision(decision);
    setSimulationOpen(true);
  };

  // Handle thread quick actions
  const handleThreadAction = (thread, action) => {
    setSelectedThreadForAction(thread);

    if (action === 'summarize') {
      handleAIChat(`Summarize the thread with ${thread.accountName}: ${thread.subject}`);
      setAiCopilotOpen(true);
    } else if (action === 'draft') {
      setSelectedDraftThread(thread);
      setAiDraftDialogOpen(true);
    } else if (action === 'assign') {
      toast.success(`Thread reassigned to ${['Alice Chen', 'Bob Wilson'][Math.floor(Math.random() * 2)]}`);
    } else if (action === 'automate') {
      setSmartRulesOpen(true);
    } else if (action === 'convert') {
      setConvertToTaskOpen(true);
    }
  };

  // Thread command handler
  const handleThreadCommand = (cmd) => {
    if (!selectedThread) return;

    setThreadCommandInput("");
    setThreadCommandOpen(false);

    if (cmd.includes('summarize')) {
      handleAIChat(`Summarize thread: ${selectedThread.subject}`);
      setAiCopilotOpen(true);
    } else if (cmd.includes('draft')) {
      handleThreadAction(selectedThread, 'draft');
    } else if (cmd.includes('sentiment')) {
      handleAIChat(`What's the sentiment history with ${selectedThread.accountName}?`);
      setAiCopilotOpen(true);
    } else if (cmd.includes('task')) {
      handleThreadAction(selectedThread, 'convert');
    }
  };

  // Main AI Chat Handler (enhanced for inbox context)
  const handleAIChat = (message) => { // This was handleEnhancedAIChat previously
    setAiChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setAiChatInput("");
    setAiTyping(true);

    setTimeout(() => {
      let response = "";
      const lowerMsg = message.toLowerCase();

      // NEW Inbox capabilities if selectedThread is active and message is inbox-related
      if (selectedThread && (lowerMsg.includes('summarize thread') || lowerMsg.includes('sentiment history') || lowerMsg.includes('renewal') || lowerMsg.includes('escalation'))) {
          if (lowerMsg.includes('summarize') && lowerMsg.includes('thread')) {
            response = `**Thread Summary:**\n\n📧 ${selectedThread?.accountName} - ${selectedThread?.subject}\n\n**AI Analysis:**\n• Intent: ${selectedThread?.intent?.replace(/_/g, ' ')}\n• Sentiment: ${selectedThread?.sentiment}\n• Urgency: ${selectedThread?.urgency}\n• Confidence: ${selectedThread?.confidence}%\n\n**Last message:** ${selectedThread?.messages?.[selectedThread?.messages.length - 1]?.body || 'No messages'}\n\n**Suggested actions:**\n${selectedThread?.aiSuggestedActions?.map(a => `• ${a}`).join('\n')}`;
          } else if (lowerMsg.includes('sentiment history')) {
            const accountThreads = threads.filter(t => t.accountName === selectedThread?.accountName);
            const sentiments = accountThreads.map(t => t.sentiment);
            response = `**Sentiment History for ${selectedThread?.accountName}:**\n\n📊 Recent threads: ${accountThreads.length}\n• Positive: ${sentiments.filter(s => s === 'positive').length}\n• Neutral: ${sentiments.filter(s => s === 'neutral').length}\n• Negative: ${sentiments.filter(s => s === 'negative').length}\n\n**Trend:** Overall sentiment is ${sentiments.filter(s => s === 'positive').length > sentiments.filter(s => s === 'negative').length ? 'positive ✅' : 'needs attention ⚠️'}`;
          } else if (lowerMsg.includes('renewal') || lowerMsg.includes('renewals')) {
            const renewalThreads = threads.filter(t => t.intent === 'renewal');
            response = `**Renewal Activity:**\n\n📬 ${renewalThreads.length} renewal-related threads\n• Urgent: ${renewalThreads.filter(t => t.urgency === 'immediate' || t.urgency === 'high').length}\n• Negative sentiment: ${renewalThreads.filter(t => t.sentiment === 'negative').length}\n\n**Top accounts:**\n${renewalThreads.slice(0, 3).map(t => `• ${t.accountName} - ${t.subject}`).join('\n')}\n\n💡 **Recommendation:** Schedule QBRs for accounts with negative sentiment.`;
          } else if (lowerMsg.includes('escalation') || lowerMsg.includes('urgent')) {
            const urgentThreads = threads.filter(t => t.urgency === 'immediate' || t.slaBreachRisk);
            response = `**Urgent Threads Requiring Immediate Action:**\n\n🚨 ${urgentThreads.length} threads flagged\n• SLA breach risk: ${urgentThreads.filter(t => t.slaBreachRisk).length}\n• Immediate urgency: ${urgentThreads.filter(t => t.urgency === 'immediate').length}\n\n**Top priorities:**\n${urgentThreads.slice(0, 3).map(t => `• ${t.accountName} - ${t.subject}`).join('\n')}\n\n**Action needed:** Respond within next hour to prevent SLA breach.`;
          }
      }

      // If no specific inbox context, or not relevant, use general AI chat logic
      if (!response) { // Only if no response was generated by inbox context
        if (lowerMsg.includes('why') && lowerMsg.includes('reassign')) {
          const recentReassign = decisionFeed.find(d => d.action.includes('Reassigned'));
          if (recentReassign) {
            response = `**Why I reassigned that deal:**\n\n📊 **Context:** ${recentReassign.reason}\n\n🎯 **Expected Impact:** ${recentReassign.expectedImpact}\n\n💡 **Confidence:** ${recentReassign.confidence}% based on:\n• Historical reassignment success rate: 89%\n• Owner bandwidth analysis\n• Deal stage age vs. benchmark\n\n✅ **Outcome:** This decision was ${recentReassign.status}`;
          } else {
            response = "I haven't reassigned any deals recently. Would you like me to analyze current deal distribution?";
          }
        } else if (lowerMsg.includes('what next') || lowerMsg.includes('what should')) {
          response = `**Recommended Next Actions (prioritized):**\n\n🔴 **High Priority:**\n1. Review ${deals.filter(d => d.health === 'risk').length} at-risk deals\n2. Schedule QBRs for ${accounts.filter(a => a.health === 'Poor').length} declining accounts\n3. Address ${alerts.filter(a => a.severity === 'high').length} critical alerts\n\n🟡 **Medium Priority:**\n4. Follow up on ${threads.filter(t => t.actionNeeded).length} actionable emails\n5. Update pipeline forecast based on recent velocity\n6. Review automation performance (${learningMetrics.accuracy}% accuracy)\n\n💡 **Would you like me to execute any of these with your approval?**`;
        } else if (lowerMsg.includes('fix') || lowerMsg.includes('execute')) {
          response = `**Autonomous Execution Mode**\n\nI can help execute actions with your approval:\n\n✅ **Available Actions:**\n• Auto-reassign ${deals.filter(d => d.stageAgeDays > 30).length} stale deals\n• Create QBR tasks for at-risk accounts\n• Send follow-up emails for idle threads\n• Upgrade shipping for SLA-risk orders\n\n⚙️ **Current Autonomy Level:** ${autonomyLevel}/5\n\n${autonomyLevel >= 4 ? '✅ I can execute these immediately with soft guard approval.' : '⏸️ Increase autonomy level to enable direct execution.'}\n\nShall I proceed with any of these?`;
        } else if (lowerMsg.includes('learning') || lowerMsg.includes('performance')) {
          response = `**AI Learning Performance:**\n\n📈 **Overall Stats:**\n• Total Decisions: ${learningMetrics.totalDecisions}\n• Accuracy: ${learningMetrics.accuracy}%\n• Approved: ${learningMetrics.approved}\n• Rejected: ${learningMetrics.rejected}\n• Rolled Back: ${learningMetrics.rolledBack}\n\n💰 **Impact Realized:**\n• Revenue Protected: ${learningMetrics.impactRealized}\n• Time Saved: ${learningMetrics.timesSaved}\n\n🎯 **Top Performing Agent:** ${activeAgents.sort((a, b) => b.successRate - a.successRate)[0]?.name} (${activeAgents.sort((a, b) => b.successRate - a.successRate)[0]?.successRate}% success rate)\n\n📚 **Learning Insights:**\n• Deal reassignments: 92% approval rate → confidence increased\n• SLA upgrades: 85% success → threshold adjusted\n• QBR scheduling: 94% effective → autonomy granted`;
        } else {
          // Keep existing responses
          if (lowerMsg.includes('summarize') || lowerMsg.includes('overview')) {
            response = `Based on current data:\n\n📊 Pipeline: $${(pipelineMetrics.weighted / 1000).toFixed(0)}K weighted across ${deals.length} deals\n💰 Revenue: ${accounts.length} accounts, $${(accounts.reduce((s, a) => s + a.arr, 0) / 1000000).toFixed(2)}M ARR\n⚠️ Risk: ${deals.filter(d => d.health === 'risk').length} deals at risk\n\n🤖 **Autonomous Operations:**\n• ${activeAgents.filter(a => a.status === 'active').length} agents active\n• ${learningMetrics.totalDecisions} decisions today\n• ${learningMetrics.accuracy}% accuracy\n\nTop priority: Review deals stuck >30 days and schedule exec alignment for top 5 opportunities.`;
          } else if (lowerMsg.includes('churn') || lowerMsg.includes('risk')) {
            const atRiskAccounts = accounts.filter(a => a.health === 'Poor' || a.health === 'Critical');
            response = `Found ${atRiskAccounts.length} accounts at churn risk:\n\n${atRiskAccounts.slice(0, 3).map(a => `• ${a.name}: Health ${a.healthScore}%, NPS ${a.nps}`).join('\n')}\n\n🤖 **AI Actions Taken:**\n• Auto-created ${atRiskAccounts.length} QBR tasks\n• Scheduled health check-ins\n• Flagged to CSM team\n\nRecommended action: Launch QBR campaign and engage customer success for immediate outreach.`;
          } else {
            response = "I can help you with:\n• **Why** - Explain AI decisions and reasoning\n• **What next** - Suggest and plan actions\n• **Fix this** - Execute actions with approval\n• Summarizing pipeline and revenue data\n• Identifying at-risk deals and accounts\n• Forecasting revenue and trends\n• Managing autonomous operations\n\nWhat would you like to know?";
          }
        }
      }

      setAiTyping(false);
      setAiChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 1500);
  };


  // Command Handler
  const handleCommand = (cmd) => {
    setCommandInput("");
    setCommandBarOpen(false);

    if (cmd.includes('summarize')) {
      handleAIChat('summarize current state');
      setAiCopilotOpen(true);
    } else if (cmd.includes('email')) {
      toast.success("Email draft generated", { description: "Check AI Copilot for the draft" });
      handleAIChat('draft an email');
      setAiCopilotOpen(true);
    } else if (cmd.includes('forecast')) {
      setForecastSandboxOpen(true);
    } else if (cmd.includes('report')) {
      handleGenerateReport();
    } else {
      toast.info(`Command "${cmd}" received. Processing...`);
    }
  };

  // Generate Board Report
  const handleGenerateReport = () => {
    setReportGenerating(true);
    setTimeout(() => {
      setReportGenerating(false);
      toast.success("Board report generated", {
        description: "Report ready for download and sharing",
        action: {
          label: "Download",
          onClick: () => console.log("Downloading report...")
        }
      });
    }, 2000);
  };

  // Business Narrative
  const generateBusinessNarrative = () => {
    setNarrativeOpen(true);
    setBusinessNarrative("");

    setTimeout(() => {
      const narrative = `**Business Health Summary** (${format(now, 'MMM d, yyyy')})\n\nOverall Status: Strong with selective areas requiring attention.\n\nRevenue trajectory is healthy with $${(accounts.reduce((s, a) => s + a.arr, 0) / 1000000).toFixed(2)}M ARR across ${accounts.length} active accounts. Pipeline coverage stands at ${(pipelineMetrics.weighted / (pipelineMetrics.commit * 3) * 100).toFixed(0)}%, slightly above target. However, ${deals.filter(d => d.health === 'risk').length} deals show elevated slip risk due to extended stage duration and missing executive sponsorship.\n\nCustomer health metrics indicate ${accounts.filter(a => a.health === 'Excellent' || a.health === 'Good').length} accounts in good standing, with average NPS of ${(accounts.reduce((s, a) => s + a.nps, 0) / accounts.length).toFixed(0)}. Support ticket resolution averages 4.8 hours with 96% CSAT.\n\nImmediate priorities: (1) Address ${alerts.filter(a => a.severity === 'high').length} high-priority operational alerts, (2) Engage at-risk accounts with QBR campaigns, (3) Accelerate deals stuck >30 days with executive alignment.\n\nConfidence in achieving quarterly targets: ${pipelineMetrics.forecastAccuracy}%.`;

      setBusinessNarrative(narrative);
    }, 500);
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = "blue", onClick, isRisk }) => (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
      onClick={onClick}
      className={cn(
        "cursor-pointer",
        isRisk && pipelineMetrics.slipRisk > 15000 && "animate-pulse"
      )}
    >
      <Card className="bg-white border-2 border-slate-200 shadow-sm hover:shadow-lg transition-all h-full relative overflow-hidden">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 hover:opacity-5 transition-opacity",
          isRisk && pipelineMetrics.slipRisk > 15000 ? "from-red-500 to-orange-500" : "from-blue-500 to-purple-500"
        )}></div>
        <CardContent className="p-4 relative z-10">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-lg",
                (color === "blue" && !isRisk) && "bg-blue-100",
                (color === "emerald" && !isRisk) && "bg-emerald-100",
                (color === "purple" && !isRisk) && "bg-purple-100",
                (color === "red" && !isRisk) && "bg-red-100",
                (color === "amber" && !isRisk) && "bg-amber-100",
                (color === "cyan" && !isRisk) && "bg-cyan-100",
                isRisk && "bg-red-100" // Override color if it's a risk metric
              )}>
                <Icon className={cn(
                  "w-4 h-4",
                  (color === "blue" && !isRisk) && "text-blue-600",
                  (color === "emerald" && !isRisk) && "text-emerald-600",
                  (color === "purple" && !isRisk) && "text-purple-600",
                  (color === "red" && !isRisk) && "text-red-600",
                  (color === "amber" && !isRisk) && "text-amber-600",
                  (color === "cyan" && !isRisk) && "text-cyan-600",
                  isRisk && "text-red-600" // Override color if it's a risk metric
                )} />
              </div>
              <span className="text-xs font-medium text-slate-700">{title}</span>
            </div>
            {trend && (
              <Badge className={cn(
                "text-xs",
                trend > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              )}>
                {trend > 0 ? '+' : ''}{trend}%
              </Badge>
            )}
          </div>
          <div className="text-2xl font-semibold text-slate-900 mb-1">{value}</div>
          {subtitle && <div className="text-xs text-slate-600">{subtitle}</div>}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Top Command Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search deals, accounts, threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-slate-300 text-slate-900 rounded-xl placeholder:text-slate-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Badge className="bg-slate-200 text-slate-700 text-xs border-0">⌘K</Badge>
              <Badge className="bg-slate-200 text-slate-700 text-xs border-0">⌘/</Badge>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setFilterSheetOpen(true)}
            className="border-slate-300 hover:bg-slate-100 rounded-xl bg-white text-slate-900"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-slate-300 hover:bg-slate-100 rounded-xl bg-white text-slate-900 relative"
            onClick={() => setAlertsOpen(true)}
          >
            <Bell className="w-4 h-4 mr-2" />
            Alerts
            {alerts.filter(a => a.severity === 'high').length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white border-0 px-1.5 py-0 text-xs animate-pulse">
                {alerts.filter(a => a.severity === 'high').length}
              </Badge>
            )}
          </Button>

          <Button
            variant="outline"
            className="border-blue-300 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-700 relative"
            onClick={() => setAutonomyDashboardOpen(true)}
          >
            <Cpu className="w-4 h-4 mr-2" />
            AI Ops
            <Badge className="ml-2 bg-blue-600 text-white border-0 px-1.5 py-0 text-xs">
              {activeAgents.reduce((sum, a) => sum + a.actionsToday, 0)}
            </Badge>
          </Button>

          <Button
            variant="outline"
            className="border-slate-300 hover:bg-slate-100 rounded-xl bg-white text-slate-900"
            onClick={() => setAiCopilotOpen(!aiCopilotOpen)}
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Copilot
          </Button>
        </div>
      </div>

      {/* Autonomous Operations Status Banner */}
      <AnimatePresence>
        {activeAgents.filter(a => a.status === 'active').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full absolute top-0 left-0 animate-ping"></div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {activeAgents.filter(a => a.status === 'active').length} AI Agents Active
                  </div>
                  <div className="text-xs text-slate-600">
                    {learningMetrics.totalDecisions} decisions today • {learningMetrics.accuracy}% accuracy • Autonomy Level {autonomyLevel}/5
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                  {learningMetrics.impactRealized} impact
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                  {learningMetrics.timesSaved} saved
                </Badge>
                {pendingDecisions.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs animate-pulse">
                    {pendingDecisions.length} pending approval
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Decisions Banner */}
      <AnimatePresence>
        {pendingDecisions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {pendingDecisions.map(decision => (
              <Card key={decision.id} className="bg-amber-50 border-2 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-semibold text-slate-900">AI Decision Pending Approval</span>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                          {decision.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{decision.action}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span>💡 {decision.reason}</span>
                        <span>•</span>
                        <span>📈 {decision.expectedImpact}</span>
                        <span>•</span>
                        <span className="text-amber-600">Requires Level {decision.autonomyThreshold}+ autonomy</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleViewSimulation(decision)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Activity className="w-3 h-3 mr-1" />
                        Simulate
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAutonomousDecision(decision, true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAutonomousDecision(decision, false)}
                        className="border-slate-300 hover:bg-slate-100"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cross-System Insights Feed */}
      <AnimatePresence>
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {insights.map((insight) => (
              <motion.div
                key={insight.id}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
              >
                <Card className={cn(
                  "bg-gradient-to-br border-2 shadow-lg hover:shadow-xl transition-all",
                  insight.severity === "positive" && "from-emerald-50 to-teal-50 border-emerald-200",
                  insight.severity === "warning" && "from-amber-50 to-orange-50 border-amber-200",
                  insight.severity === "critical" && "from-red-50 to-pink-50 border-red-200"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4"
                          style={{
                            color: insight.severity === "positive" ? "#10b981" :
                                   insight.severity === "warning" ? "#f59e0b" :
                                   "#ef4444"
                          }}
                        />
                        <span className="text-xs font-medium text-slate-700 uppercase tracking-wide">
                          {insight.type}
                        </span>
                      </div>
                      <Badge className="bg-white/80 text-slate-700 border-slate-300 text-xs">
                        {insight.confidence}% conf
                      </Badge>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 mb-1">{insight.title}</h3>
                    <p className="text-xs text-slate-600 mb-3">{insight.description}</p>

                    <div className="flex items-center justify-between">
                      <Badge className={cn(
                        "text-xs font-mono",
                        insight.severity === "positive" && "bg-emerald-100 text-emerald-700 border-emerald-300",
                        insight.severity === "warning" && "bg-amber-100 text-amber-700 border-amber-300",
                        insight.severity === "critical" && "bg-red-100 text-red-700 border-red-300"
                      )}>
                        {insight.impact}
                      </Badge>

                      <Button size="sm" variant="ghost" className="h-7 text-xs">
                        {insight.action} <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1 mt-3">
                      {insight.linkedEntities.map((entity, idx) => (
                        <Badge key={idx} className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-white border border-slate-200 rounded-xl p-1">
            <TabsTrigger value="pipeline" className="rounded-lg text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Target className="w-4 h-4 mr-2" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="inbox" className="rounded-lg text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Inbox className="w-4 h-4 mr-2" />
              Inbox
            </TabsTrigger>
            <TabsTrigger value="accounts" className="rounded-lg text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="tickets" className="rounded-lg text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="journeys" className="rounded-lg text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Workflow className="w-4 h-4 mr-2" />
              Journeys
            </TabsTrigger>
            <TabsTrigger value="revenue" className="rounded-lg text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Revenue
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setForecastSandboxOpen(true)}
              className="border-slate-300 hover:bg-slate-100 rounded-xl bg-white text-slate-900"
            >
              <Gauge className="w-4 h-4 mr-2" />
              Forecast
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={generateBusinessNarrative}
              className="border-slate-300 hover:bg-slate-100 rounded-xl bg-white text-slate-900"
            >
              <FileText className="w-4 h-4 mr-2" />
              Narrative
            </Button>

            <Button
              size="sm"
              onClick={handleGenerateReport}
              disabled={reportGenerating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg"
            >
              {reportGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
              ) : (
                <><FileDown className="w-4 h-4 mr-2" />Board Report</>
              )}
            </Button>
          </div>
        </div>

        {/* 1. PIPELINE TAB */}
        <TabsContent value="pipeline" className="space-y-6">
          {/* Pipeline Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <MetricCard
              title="Weighted Pipeline"
              value={`$${(pipelineMetrics.weighted / 1000).toFixed(0)}K`}
              icon={Target}
              trend={12.3}
              color="blue"
            />
            <MetricCard
              title="Commit"
              value={`$${(pipelineMetrics.commit / 1000).toFixed(0)}K`}
              icon={CheckCircle}
              trend={8.5}
              color="emerald"
            />
            <MetricCard
              title="Upside"
              value={`$${(pipelineMetrics.upside / 1000).toFixed(0)}K`}
              icon={TrendingUp}
              trend={15.2}
              color="purple"
            />
            <MetricCard
              title="Slip Risk"
              value={`$${(pipelineMetrics.slipRisk / 1000).toFixed(0)}K`}
              icon={SlipRisk}
              trend={-5.1}
              color="red"
              isRisk={true}
              onClick={() => setAlertsOpen(true)}
            />
            <MetricCard
              title="Stage Velocity"
              value={`${pipelineMetrics.stageVelocity.toFixed(0)}d`}
              icon={Gauge}
              color="amber"
            />
            <MetricCard
              title="Forecast Accuracy"
              value={`${pipelineMetrics.forecastAccuracy}%`}
              icon={BarChart2}
              trend={2.1}
              color="cyan"
            />
          </div>

          <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
            <div className="flex items-center justify-between">
              <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
                <TabsTrigger value="kanban" className="text-xs text-slate-700 data-[state=active]:bg-slate-100">Kanban</TabsTrigger>
                <TabsTrigger value="list" className="text-xs text-slate-700 data-[state=active]:bg-slate-100">List</TabsTrigger>
                <TabsTrigger value="forecast" className="text-xs text-slate-700 data-[state=active]:bg-slate-100">Forecast</TabsTrigger>
              </TabsList>
              <Button
                size="sm"
                onClick={() => handleAIInsights({
                  type: 'pipeline',
                  summary: `Pipeline forecast: $${(pipelineMetrics.weighted / 1000).toFixed(0)}K weighted across ${deals.length} deals. ${deals.filter(d => d.health === 'risk').length} deals at risk requiring immediate action.`,
                  risks: deals.filter(d => d.health === 'risk').slice(0, 3).map(d => ({
                    title: d.name,
                    severity: 'high',
                    impact: d.riskReasons.join(', ')
                  })),
                  actions: [
                    { action: 'Review deals stuck >30 days', priority: 'high', draftAvailable: true },
                    { action: 'Schedule exec intros for top 5 deals', priority: 'medium', draftAvailable: true }
                  ]
                })}
                className="bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200 text-xs"
              >
                <Brain className="w-3 h-3 mr-1" />
                AI Forecast
              </Button>
            </div>

            {/* Kanban View */}
            <TabsContent value="kanban" className="space-y-4 mt-4">
              <div className="grid grid-cols-4 gap-4">
                {pipelineByStage.map((stage) => (
                  <div
                    key={stage.stage}
                    className="space-y-3"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(stage.stage)}
                  >
                    <Card className="bg-white border-slate-200 rounded-xl">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm text-slate-900">{stage.stage}</CardTitle>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            {stage.count}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-600">
                          ${(stage.value / 1000).toFixed(0)}K • ${(stage.weightedValue / 1000).toFixed(0)}K weighted
                        </div>
                      </CardHeader>
                    </Card>

                    <div className="space-y-2 min-h-[400px]">
                      {deals
                        .filter(d => d.stage === stage.stage)
                        .map((deal) => (
                          <motion.div
                            key={deal.id}
                            draggable
                            onDragStart={() => handleDragStart(deal)}
                            whileHover={{ scale: 1.02 }}
                            className="p-3 bg-white border border-slate-200 rounded-lg cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
                            onClick={() => {
                              setSelectedDeal(deal);
                              setDealDrawerOpen(true);
                            }}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-slate-900 truncate">{deal.name}</div>
                                  <div className="text-xs text-slate-600 truncate">{deal.account}</div>
                                </div>
                                <DealHealthChip health={deal.health} reasons={deal.riskReasons} />
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-slate-900">
                                  ${(deal.amount / 1000).toFixed(0)}K
                                </span>
                                <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                                  {deal.winProb}%
                                </Badge>
                              </div>

                              <div className="flex items-center gap-1">
                                <TimeSLAPips days={deal.stageAgeDays} />
                                <span className="text-xs text-slate-600 ml-1">{deal.stageAgeDays}d</span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <OwnerAvatar name={deal.owner} weeklyTouches={deal.ownerTouches} />
                                <span className="truncate">{deal.nextStep}</span>
                              </div>

                              <div className="flex items-center gap-1 flex-wrap">
                                {deal.hasExecSponsor && (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                                    <Star className="w-2.5 h-2.5 mr-1" />
                                    Exec
                                  </Badge>
                                )}
                                {deal.hasSecurityReview && (
                                  <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                                    <Shield className="w-2.5 h-2.5 mr-1" />
                                    Sec
                                  </Badge>
                                )}
                                {deal.isARR && (
                                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                                    ARR
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Forecast Bar */}
              <Card className="bg-white border-slate-200 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-900">Pipeline Forecast by Month</span>
                    <div className="flex items-center gap-2">
                      <Switch id="include-expansion" />
                      <Label htmlFor="include-expansion" className="text-xs text-slate-600 cursor-pointer">
                        Include Expansion
                      </Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-xs text-slate-600 mb-1">Commit</div>
                      <div className="text-xl font-bold text-blue-700">
                        ${(pipelineMetrics.commit / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-xs text-slate-600 mb-1">Best Case</div>
                      <div className="text-xl font-bold text-purple-700">
                        ${((pipelineMetrics.commit + pipelineMetrics.upside * 0.5) / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="text-xs text-slate-600 mb-1">Total Pipeline</div>
                      <div className="text-xl font-bold text-emerald-700">
                        ${((pipelineMetrics.commit + pipelineMetrics.upside) / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* List View */}
            <TabsContent value="list" className="mt-4">
              <Card className="bg-white border-slate-200 rounded-2xl">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 border-b border-slate-200">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-slate-700"><Checkbox /></TableHead>
                          <TableHead className="text-slate-700">Deal</TableHead>
                          <TableHead className="text-slate-700">Amount</TableHead>
                          <TableHead className="text-slate-700">Stage</TableHead>
                          <TableHead className="text-slate-700">Age</TableHead>
                          <TableHead className="text-slate-700">Win %</TableHead>
                          <TableHead className="text-slate-700">Health</TableHead>
                          <TableHead className="text-slate-700">Owner</TableHead>
                          <TableHead className="text-slate-700">Next Step</TableHead>
                          <TableHead className="text-slate-700">Activity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deals.slice(0, 20).map((deal) => (
                          <TableRow
                            key={deal.id}
                            className="border-slate-200 hover:bg-slate-50 cursor-pointer"
                            onClick={() => {
                              setSelectedDeal(deal);
                              setDealDrawerOpen(true);
                            }}
                          >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox />
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium text-slate-900">{deal.name}</div>
                              <div className="text-xs text-slate-600">{deal.account}</div>
                            </TableCell>
                            <TableCell className="font-mono font-semibold text-slate-900">
                              ${deal.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                                {deal.stage}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <TimeSLAPips days={deal.stageAgeDays} />
                                <span className={cn(
                                  "text-sm",
                                  deal.stageAgeDays > 30 ? "text-red-700 font-semibold" : "text-slate-600"
                                )}>
                                  {deal.stageAgeDays}d
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500"
                                    style={{ width: `${deal.winProb}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-600">{deal.winProb}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DealHealthChip health={deal.health} reasons={deal.riskReasons} />
                            </TableCell>
                            <TableCell>
                              <OwnerAvatar name={deal.owner} weeklyTouches={deal.ownerTouches} />
                            </TableCell>
                            <TableCell className="text-xs text-slate-600 max-w-[150px] truncate">
                              {deal.nextStep}
                            </TableCell>
                            <TableCell>
                              <div className="w-16">
                                <ActivitySparkline data={deal.activityTrend} />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Forecast View */}
            <TabsContent value="forecast" className="mt-4">
              <Card className="bg-white border-slate-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-slate-900">Stage Conversion & Velocity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={pipelineByStage}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="stage" tick={{ fill: '#4a5568', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#4a5568', fontSize: 11 }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '8px',
                          color: '#000'
                        }}
                      />
                      <Legend wrapperStyle={{ color: '#4a5568' }} />
                      <Bar dataKey="value" fill="#3b82f6" name="Total Value" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="weightedValue" fill="#8b5cf6" name="Weighted Value" radius={[8, 8, 0, 0]} />
                      <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} name="Deal Count" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* 2. INBOX TAB - SIMPLIFIED VERSION */}
        <TabsContent value="inbox" className="space-y-6">
          {/* Alert Banner */}
          <Card className="bg-blue-50 border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Inbox className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">AI-Powered Inbox (Beta)</h3>
                  <p className="text-sm text-slate-700 mb-4">
                    The enhanced inbox with AI understanding, smart folders, and contextual insights is currently being optimized.
                    In the meantime, you can view your threads below.
                  </p>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      {threads.length} threads
                    </Badge>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                      {threads.filter(t => t.actionNeeded).length} need action
                    </Badge>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                      {threads.filter(t => t.unread).length} unread
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Simple Thread List */}
          <div className="grid grid-cols-1 gap-4">
            {threads.map(thread => (
              <Card
                key={thread.id}
                className={cn(
                  "bg-white border-2 cursor-pointer hover:shadow-lg transition-all",
                  thread.unread ? "border-blue-300" : "border-slate-200"
                )}
                onClick={() => {
                  setSelectedThread(thread);
                  setThreadDrawerOpen(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={cn(
                          "text-xs",
                          thread.channel === 'email' && "bg-blue-100 text-blue-700",
                          thread.channel === 'slack' && "bg-purple-100 text-purple-700",
                          thread.channel === 'intercom' && "bg-emerald-100 text-emerald-700"
                        )}>
                          {thread.channel}
                        </Badge>

                        {thread.unread && (
                          <Badge className="bg-blue-600 text-white text-xs">New</Badge>
                        )}

                        {thread.urgency === 'immediate' && (
                          <Badge className="bg-red-100 text-red-700 text-xs">Urgent</Badge>
                        )}

                        <Badge className="bg-purple-100 text-purple-700 text-xs">
                          {thread.intent?.replace('_', ' ')}
                        </Badge>
                      </div>

                      <h3 className="text-sm font-semibold text-slate-900 mb-1">
                        {thread.accountName} - {thread.subject}
                      </h3>

                      <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                        {thread.summary}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{format(new Date(thread.lastMessageTs), 'MMM d, h:mm a')}</span>
                        <span>•</span>
                        <span>{thread.messages?.length || 0} messages</span>
                        {thread.waitingOn && (
                          <>
                            <span>•</span>
                            <span className={thread.waitingOn === 'us' ? 'text-amber-600 font-medium' : 'text-blue-600'}>
                              Waiting on {thread.waitingOn}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success("AI is analyzing this thread...");
                        }}
                        className="text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Action
                      </Button>
                    </div>
                  </div>

                  {thread.aiSuggestedActions && thread.aiSuggestedActions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-3 h-3 text-amber-600" />
                        <span className="text-xs font-medium text-slate-700">AI Suggestions:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {thread.aiSuggestedActions.slice(0, 3).map((action, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success(`Action: ${action}`);
                            }}
                            className="h-6 text-xs bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 3. ENHANCED ACCOUNTS TAB */}
        <TabsContent value="accounts" className="space-y-6">
          {/* Enhanced Metrics Cards with Interactive Features */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <MetricCard
              title="Total ARR"
              value={`$${(accounts.reduce((sum, a) => sum + a.arr, 0) / 1000000).toFixed(2)}M`}
              subtitle={
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">+12.3% (30d)</span>
                </div>
              }
              icon={DollarSign}
              trend={15.3}
              color="blue"
            />
            <MetricCard
              title="Avg Health (CAH)"
              value={`${(accountsWithCAH.reduce((sum, a) => sum + a.cah.score, 0) / accountsWithCAH.length).toFixed(0)}%`}
              subtitle={
                <div className="w-full h-6 mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={Array.from({ length: 20 }, (_, i) => ({ x: i, y: Math.random() * 30 + 60 }))}>
                      <Area type="monotone" dataKey="y" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              }
              icon={Activity}
              trend={5.2}
              color="purple"
            />
            <MetricCard
              title="At Risk"
              value={accountsWithCAH.filter(a => a.churnLikely > 60).length}
              subtitle="Click to filter"
              icon={AlertTriangle}
              trend={-3.1}
              isRisk={true}
              onClick={() => setAccountsFilter("at_risk")}
              color="red"
            />
            <MetricCard
              title="Expansion Ready"
              value={accountsWithCAH.filter(a => a.expansionLikely > 70).length}
              subtitle="Click for upsell view"
              icon={Rocket}
              trend={12.4}
              onClick={() => setAccountsFilter("expansion_ready")}
              color="emerald"
            />
            <MetricCard
              title="AI Impact"
              value={`$${(127).toFixed(0)}K`}
              subtitle="Revenue influenced (30d)"
              icon={Sparkles}
              trend={28.5}
              color="purple"
            />
          </div>

          {/* Predictive Insights Ticker */}
          <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 border-2 border-purple-200 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-slate-900">AI Predictive Insights</span>
                <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs ml-auto">
                  Live
                </Badge>
              </div>
              <div className="space-y-2">
                {accountInsights.map((insight) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                      insight.severity === "critical" && "bg-red-50 border-red-200 hover:bg-red-100",
                      insight.severity === "high" && "bg-amber-50 border-amber-200 hover:bg-amber-100",
                      insight.severity === "positive" && "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                    )}
                    onClick={() => {
                      const affectedAccounts = accounts.filter(a => insight.accountIds.includes(a.id));
                      if (affectedAccounts.length > 0) {
                        setSelectedAccount(affectedAccounts[0]); // Keep old selectedAccount for original drawer
                        setSelectedAccountForAI(affectedAccounts[0]); // New state for AI console
                        setAccountsAIConsoleOpen(true);
                      }
                    }}
                  >
                    <span className="text-2xl">{insight.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">{insight.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-white/50 text-slate-700 border-slate-300 text-xs">
                          {insight.accountIds.length} accounts
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs text-purple-600 hover:bg-purple-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success("Analyzing affected accounts...");
                          }}
                        >
                          Investigate <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* View Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={accountsFilter === "all" ? "default" : "outline"}
                onClick={() => setAccountsFilter("all")}
                className={accountsFilter === "all" ?
                  "bg-blue-600 hover:bg-blue-700 text-white" :
                  "bg-white border-slate-300 hover:bg-slate-100 text-slate-900"
                }
              >
                All Accounts ({accountsWithCAH.length})
              </Button>
              <Button
                size="sm"
                variant={accountsFilter === "at_risk" ? "default" : "outline"}
                onClick={() => setAccountsFilter("at_risk")}
                className={accountsFilter === "at_risk" ?
                  "bg-red-600 hover:bg-red-700 text-white" :
                  "bg-white border-slate-300 hover:bg-slate-100 text-slate-900"
                }
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                At Risk ({accountsWithCAH.filter(a => a.churnLikely > 60).length})
              </Button>
              <Button
                size="sm"
                variant={accountsFilter === "expansion_ready" ? "default" : "outline"}
                onClick={() => setAccountsFilter("expansion_ready")}
                className={accountsFilter === "expansion_ready" ?
                  "bg-emerald-600 hover:bg-emerald-700 text-white" :
                  "bg-white border-slate-300 hover:bg-slate-100 text-slate-900"
                }
              >
                <Rocket className="w-3 h-3 mr-1" />
                Expansion Ready ({accountsWithCAH.filter(a => a.expansionLikely > 70).length})
              </Button>
              <Button
                size="sm"
                variant={accountsFilter === "renewal_soon" ? "default" : "outline"}
                onClick={() => setAccountsFilter("renewal_soon")}
                className={accountsFilter === "renewal_soon" ?
                  "bg-amber-600 hover:bg-amber-700 text-white" :
                  "bg-white border-slate-300 hover:bg-slate-100 text-slate-900"
                }
              >
                <Clock className="w-3 h-3 mr-1" />
                Renewal {"<"}90d ({accountsWithCAH.filter(a => differenceInDays(new Date(a.renewalDate), now) < 90).length})
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={accountsViewMode === "table" ? "default" : "ghost"}
                  onClick={() => setAccountsViewMode("table")}
                  className={cn(
                    "h-7 px-3",
                    accountsViewMode === "table" ? "bg-blue-600 text-white" : "text-slate-600"
                  )}
                >
                  <Layers className="w-3 h-3 mr-1" />
                  Table
                </Button>
                <Button
                  size="sm"
                  variant={accountsViewMode === "portfolio" ? "default" : "ghost"}
                  onClick={() => setAccountsViewMode("portfolio")}
                  className={cn(
                    "h-7 px-3",
                    accountsViewMode === "portfolio" ? "bg-blue-600 text-white" : "text-slate-600"
                  )}
                >
                  <Layers3 className="w-3 h-3 mr-1" />
                  Portfolio
                </Button>
              </div>
            </div>
          </div>

          {/* Table View - WITH SCROLL */}
          {accountsViewMode === "table" && (
            <Card className="bg-white border-slate-200 rounded-2xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-slate-700">Account</TableHead>
                        <TableHead className="text-slate-700">Segment</TableHead>
                        <TableHead className="text-slate-700">ARR/MRR</TableHead>
                        <TableHead className="text-slate-700">CAH Score</TableHead>
                        <TableHead className="text-slate-700">Adoption</TableHead>
                        <TableHead className="text-slate-700">Tickets</TableHead>
                        <TableHead className="text-slate-700">NPS</TableHead>
                        <TableHead className="text-slate-700">Renewal</TableHead>
                        <TableHead className="text-slate-700">AI Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccounts.slice(0, 20).map((account) => (
                        <TableRow
                          key={account.id}
                          className="border-slate-200 hover:bg-slate-50 cursor-pointer"
                          onClick={() => {
                            setSelectedAccountForAI(account);
                            setAccountsAIConsoleOpen(true);
                          }}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                                {account.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-900">{account.name}</div>
                                <div className="text-xs text-slate-600">{account.owner}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                              {account.segment}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-mono text-slate-900">${(account.arr / 1000).toFixed(0)}K</div>
                            <div className="text-xs text-slate-600">${(account.mrr / 1000).toFixed(1)}K/mo</div>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="cursor-help">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                          className={cn(
                                            "h-full rounded-full transition-all",
                                            account.cah.score >= 80 ? "bg-emerald-500" :
                                              account.cah.score >= 60 ? "bg-blue-500" :
                                                account.cah.score >= 40 ? "bg-amber-500" :
                                                  "bg-red-500"
                                          )}
                                          style={{ width: `${account.cah.score}%` }}
                                        />
                                      </div>
                                      <span className="text-sm font-medium text-slate-900 w-10">{account.cah.score}%</span>
                                    </div>
                                    <div className="w-20 h-6">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={account.cah.trend.map((v, i) => ({ x: i, y: v }))}>
                                          <Line type="monotone" dataKey="y" stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
                                        </LineChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 border-slate-700 text-white">
                                  <div className="text-xs space-y-1">
                                    <div className="font-semibold mb-2">CAH Breakdown:</div>
                                    <div>Adoption: {account.cah.breakdown.adoption.toFixed(0)}%</div>
                                    <div>Engagement: {account.cah.breakdown.engagement.toFixed(0)}%</div>
                                    <div>Financial: {account.cah.breakdown.financial.toFixed(0)}%</div>
                                    <div>Support: {account.cah.breakdown.support.toFixed(0)}%</div>
                                    <div>Relationship: {account.cah.breakdown.relationship.toFixed(0)}%</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <div className="w-20">
                              <ActivitySparkline data={account.adoptionTrend.slice(-7)} color="#3b82f6" />
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              {account.usage.activeUsers}/{account.seats} seats
                            </div>
                          </TableCell>
                          <TableCell>
                            {account.ticketsOpen > 0 ? (
                              <Badge className="bg-red-100 text-red-700 border-red-300">
                                {account.ticketsOpen}
                              </Badge>
                            ) : (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "text-sm font-medium",
                              account.nps > 50 ? "text-emerald-700" :
                                account.nps > 0 ? "text-amber-700" :
                                  "text-red-700"
                            )}>
                              {account.nps}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-slate-600">
                              {differenceInDays(new Date(account.renewalDate), now)}d
                            </div>
                            {account.renewalRisk === 'high' && (
                              <Badge className="bg-red-100 text-red-700 border-red-300 text-xs mt-1">
                                High Risk
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-purple-600 hover:bg-purple-50"
                                      onClick={() => handleAccountAIAction(account, 'qbr')}
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 border-slate-700 text-white"><p className="text-xs">Generate QBR Summary</p></TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                                      onClick={() => handleAccountAIAction(account, 'forecast')}
                                    >
                                      <TrendingUp className="w-3.5 h-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 border-slate-700 text-white"><p className="text-xs">Forecast Renewal</p></TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-emerald-600 hover:bg-emerald-50"
                                      onClick={() => handleAccountAIAction(account, 'upsell')}
                                    >
                                      <Rocket className="w-3.5 h-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 border-slate-700 text-white"><p className="text-xs">Upsell Plan</p></TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-amber-600 hover:bg-amber-50"
                                      onClick={() => handleAccountAIAction(account, 'reengage')}
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 border-slate-700 text-white"><p className="text-xs">Re-engage Contact</p></TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-indigo-600 hover:bg-indigo-50"
                                      onClick={() => handleAccountAIAction(account, 'journey')}
                                    >
                                      <Workflow className="w-3.5 h-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 border-slate-700 text-white"><p className="text-xs">Add to Journey</p></TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Portfolio Grid View - WITH SCROLL */}
          {accountsViewMode === "portfolio" && (
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAccounts.map((account) => (
                  <motion.div
                    key={account.id}
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedAccountForAI(account);
                      setAccountsAIConsoleOpen(true);
                    }}
                  >
                    <Card className={cn(
                      "bg-white border-2 transition-all h-full",
                      account.churnLikely > 60 && "border-red-300 bg-red-50/30",
                      account.expansionLikely > 70 && "border-emerald-300 bg-emerald-50/30",
                      account.churnLikely <= 60 && account.expansionLikely <= 70 && "border-slate-200"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                            {account.name.slice(0, 2).toUpperCase()}
                          </div>
                          {account.expansionLikely > 70 && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Expansion Ready
                            </Badge>
                          )}
                          {account.churnLikely > 60 && (
                            <Badge className="bg-red-100 text-red-700 border-red-300 text-xs flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              At Risk
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-sm font-semibold text-slate-900 mb-1 truncate">{account.name}</h3>
                        <p className="text-xs text-slate-600 mb-3">{account.segment}</p>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">ARR</span>
                            <span className="font-mono font-semibold text-slate-900">${(account.arr / 1000).toFixed(0)}K</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">CAH Score</span>
                            <span className="font-semibold text-slate-900">{account.cah.score}%</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">NPS</span>
                            <span className={cn(
                              "font-semibold",
                              account.nps > 50 ? "text-emerald-700" :
                                account.nps > 0 ? "text-amber-700" :
                                  "text-red-700"
                            )}>{account.nps}</span>
                          </div>
                        </div>

                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              account.cah.score >= 80 ? "bg-emerald-500" :
                                account.cah.score >= 60 ? "bg-blue-500" :
                                  account.cah.score >= 40 ? "bg-amber-500" :
                                    "bg-red-500"
                            )}
                            style={{ width: `${account.cah.score}%` }}
                          />
                        </div>

                        <div className="h-12 mb-3">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={account.adoptionTrend.slice(-10).map((v, i) => ({ x: i, y: v }))}>
                              <Area
                                type="monotone"
                                dataKey="y"
                                stroke={account.churnLikely > 60 ? "#ef4444" : account.expansionLikely > 70 ? "#10b981" : "#3b82f6"}
                                fill={account.churnLikely > 60 ? "#ef4444" : account.expansionLikely > 70 ? "#10b981" : "#3b82f6"}
                                fillOpacity={0.2}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAccountForAI(account);
                            setAccountsAIConsoleOpen(true);
                          }}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          AI Actions
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Account Trends Visual Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border-slate-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm text-slate-900">Churn Probability Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={accountTrendsData.churnProbability}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="range" tick={{ fill: '#4a5568', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm text-slate-900">Portfolio Health Mix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[250px]">
                  <div className="grid grid-cols-3 gap-6 w-full">
                    {accountTrendsData.expansionVsRisk.map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div className="relative w-24 h-24 mx-auto mb-2">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              fill="none"
                              stroke="#e2e8f0"
                              strokeWidth="8"
                            />
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              fill="none"
                              stroke={item.color}
                              strokeWidth="8"
                              strokeDasharray={`${(item.value / accountsWithCAH.length) * 251} 251`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-slate-900">{item.value}</span>
                          </div>
                        </div>
                        <div className="text-xs font-medium text-slate-700">{item.name}</div>
                        <div className="text-xs text-slate-500">{((item.value / accountsWithCAH.length) * 100).toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm text-slate-900">ARR Heatmap by Segment</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={accountTrendsData.arrBySegment} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis type="number" tick={{ fill: '#4a5568', fontSize: 10 }} />
                    <YAxis dataKey="segment" type="category" tick={{ fill: '#4a5568', fontSize: 10 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                    <Bar dataKey="arr" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm text-slate-900">Engagement Trendline (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={accountTrendsData.engagementTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="day" tick={{ fill: '#4a5568', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="engagement" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 4. TICKETS TAB */}
        <TabsContent value="tickets" className="space-y-6">
          <div className="grid grid-cols-5 gap-4">
            <MetricCard title="First Response" value="1.2h" subtitle="Avg" icon={Clock} color="blue" />
            <MetricCard title="Resolution" value="4.8h" subtitle="Avg" icon={CheckCircle} color="emerald" />
            <MetricCard title="Reopen Rate" value="3.2%" icon={RefreshCw} trend={-1.2} color="amber" />
            <MetricCard title="CSAT" value="4.7" subtitle="/ 5.0" icon={ThumbsUp} trend={2.3} color="purple" />
            <MetricCard title="Breach Risk 24h" value={tickets.filter(t => t.breachRiskHrs > 0 && t.breachRiskHrs < 24).length} icon={AlertCircle} color="red" isRisk={true} onClick={() => setAlertsOpen(true)} />
          </div>

          <Card className="bg-white border-slate-200 rounded-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-200">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-slate-700">ID</TableHead>
                      <TableHead className="text-slate-700">Subject</TableHead>
                      <TableHead className="text-slate-700">Account</TableHead>
                      <TableHead className="text-slate-700">Severity</TableHead>
                      <TableHead className="text-slate-700">Area</TableHead>
                      <TableHead className="text-slate-700">Age</TableHead>
                      <TableHead className="text-slate-700">SLA Breach</TableHead>
                      <TableHead className="text-slate-700">Sentiment</TableHead>
                      <TableHead className="text-slate-700">AI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.slice(0, 20).map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        className="border-slate-200 hover:bg-slate-50 cursor-pointer"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setTicketDrawerOpen(true);
                        }}
                      >
                        <TableCell className="font-mono text-xs text-slate-600">{ticket.id}</TableCell>
                        <TableCell className="text-sm text-slate-900 max-w-[200px] truncate">
                          {ticket.subject}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">{ticket.account}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            ticket.severity === 'Critical' ? "bg-red-100 text-red-700" :
                              ticket.severity === 'High' ? "bg-orange-100 text-orange-700" :
                                ticket.severity === 'Medium' ? "bg-amber-100 text-amber-700" :
                                  "bg-blue-100 text-blue-700"
                          )}>
                            {ticket.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">{ticket.productArea}</TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {differenceInDays(now, new Date(ticket.createdAt)) * 24}h
                        </TableCell>
                        <TableCell>
                          {ticket.breachRiskHrs > 0 && (
                            <Badge className="bg-red-100 text-red-700 border-red-300 text-xs animate-pulse">
                              {ticket.breachRiskHrs.toFixed(0)}h
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-xs",
                            ticket.sentiment === 'positive' ? "bg-emerald-100 text-emerald-700" :
                              ticket.sentiment === 'negative' ? "bg-red-100 text-red-700" :
                                "bg-slate-100 text-slate-700"
                          )}>
                            {ticket.sentiment}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-blue-600 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success('AI suggestion: ' + ticket.suggestion);
                            }}
                          >
                            Suggest
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. JOURNEYS TAB */}
        <TabsContent value="journeys" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold text-slate-900">Automation Playbooks</div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Journey
            </Button>
          </div>

          <div className="space-y-4">
            {journeys.map((journey) => (
              <Card key={journey.id} className="bg-white border-slate-200 rounded-xl hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Workflow className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{journey.name}</div>
                          <div className="text-xs text-slate-600">{journey.goal}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span>{journey.nodes.length} steps</span>
                        <span>•</span>
                        <span>{journey.audienceSize} enrolled</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-medium">{journey.convRate}% conv</span>
                      </div>
                    </div>
                    <Badge className={cn(
                      journey.status === 'Active' ? "bg-emerald-100 text-emerald-700 border-emerald-300" :
                        journey.status === 'Paused' ? "bg-amber-100 text-amber-700 border-amber-300" :
                          "bg-slate-100 text-slate-700 border-slate-300"
                    )}>
                      {journey.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="text-xs bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit Flow
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100">
                      <BarChart2 className="w-3 h-3 mr-1" />
                      Live Stats
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100">
                      {journey.status === 'Active' ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                      {journey.status === 'Active' ? 'Pause' : 'Run'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 6. REVENUE TAB */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              title="NRR"
              value={`${revenueData[revenueData.length - 1]?.nrr || 115}%`}
              subtitle="Net Revenue Retention"
              icon={Repeat}
              trend={3.2}
            />
            <MetricCard
              title="GRR"
              value={`${revenueData[revenueData.length - 1]?.grr || 95}%`}
              subtitle="Gross Revenue Retention"
              icon={Shield}
              trend={1.8}
            />
            <MetricCard
              title="New ARR"
              value={`$${((revenueData[revenueData.length - 1]?.newARR || 50000) / 1000).toFixed(0)}K`}
              subtitle="This month"
              icon={Sparkles}
              trend={18.5}
            />
            <MetricCard
              title="Expansion"
              value={`$${((revenueData[revenueData.length - 1]?.expansion || 15000) / 1000).toFixed(0)}K`}
              subtitle="This month"
              icon={TrendingUp}
              trend={12.3}
            />
          </div>

          {/* AI Narrative */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">AI Revenue Narrative</h3>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    Q4 NRR = 118% (+3.2pp): expansion from Gamma Corp (+$82k) offset SMB churn (–$24k).
                    Top 3 levers: (1) Upsell analytics module to 12 high-usage accounts ($180K pipeline),
                    (2) Accelerate 8 renewals at risk with exec alignment ($95K ARR),
                    (3) Convert 15 trials via product-led activation (+$45K ARR).
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200 text-xs">
                      <Copy className="w-3 h-3 mr-1" />
                      Copy for Board
                    </Button>
                    <Button size="sm" className="bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200 text-xs">
                      <Send className="w-3 h-3 mr-1" />
                      Share to Slack
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Charts */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white border-slate-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm text-slate-900">Revenue Waterfall</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" tick={{ fill: '#4a5568', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#4a5568' }} />
                    <Bar dataKey="newARR" stackId="a" fill="#10b981" name="New" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expansion" stackId="a" fill="#3b82f6" name="Expansion" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="contraction" stackId="a" fill="#f59e0b" name="Contraction" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="churn" stackId="a" fill="#ef4444" name="Churn" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm text-slate-900">NRR & GRR Trend</CardTitle>
                </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" tick={{ fill: '#4a5568', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} domain={[80, 130]} />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#4a5568' }} />
                    <Line type="monotone" dataKey="nrr" stroke="#10b981" strokeWidth={2} name="NRR %" dot={{ fill: '#10b981' }} />
                    <Line type="monotone" dataKey="grr" stroke="#3b82f6" strokeWidth={2} name="GRR %" dot={{ fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Side Panel */}
      <AISidePanel
        open={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        context={aiContext}
      />

      {/* Command Palette */}
      <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Command className="w-5 h-5 text-blue-600" />
              AI Command Palette
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {[
              "Summarize ACME Corp this quarter; draft QBR bullets",
              "Show expansions >$10k closing in 30d without exec sponsor",
              "Draft 3-step re-engagement for dormant MQLs",
              "Which tickets will breach today? Propose staffing swap",
              "Create renewal task bundle for all -90d accounts"
            ].map((cmd, idx) => (
              <Button
                key={idx}
                variant="ghost"
                className="w-full justify-start text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => {
                  toast.success(`Executing: ${cmd}`);
                  setCommandPaletteOpen(false);
                }}
              >
                <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                {cmd}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Deal Drawer */}
      <Sheet open={dealDrawerOpen} onOpenChange={setDealDrawerOpen}>
        <SheetContent className="bg-white border-slate-200 text-slate-900 w-[600px] overflow-y-auto">
          {selectedDeal && (
            <>
              <SheetHeader className="border-b border-slate-200 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-xl text-slate-900">{selectedDeal.name}</SheetTitle>
                    <div className="text-sm text-slate-600 mt-1">{selectedDeal.account}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-blue-100 text-blue-700">{selectedDeal.stage}</Badge>
                      <DealHealthChip health={selectedDeal.health} reasons={selectedDeal.riskReasons} />
                      {selectedDeal.isARR && (
                        <Badge className="bg-purple-100 text-purple-700">ARR</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setDealDrawerOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Amount</div>
                    <div className="text-2xl font-bold text-slate-900">${selectedDeal.amount.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Win Probability</div>
                    <div className="text-2xl font-bold text-emerald-600">{selectedDeal.winProb}%</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Stage Age</div>
                    <div className="text-2xl font-bold text-slate-900">{selectedDeal.stageAgeDays}d</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Close Date</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {format(new Date(selectedDeal.closeDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-slate-900">Next Best Action</span>
                  </div>
                  <div className="text-sm text-slate-700 mb-3">{selectedDeal.nextStep}</div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 text-xs">
                      <Send className="w-3 h-3 mr-1" />
                      Draft Email
                    </Button>
                    <Button size="sm" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-sm font-semibold text-slate-900 mb-3">Decision Group</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDeal.decisionGroup.map((person, idx) => (
                      <PersonaChip key={idx} persona={person} />
                    ))}
                  </div>
                </div>

                {selectedDeal.competitors.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="text-sm font-semibold text-slate-900 mb-2">Competitors</div>
                    <div className="text-xs text-slate-700">{selectedDeal.competitors.join(', ')}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* SIMPLIFIED THREAD DRAWER */}
      <Sheet open={threadDrawerOpen} onOpenChange={setThreadDrawerOpen}>
        <SheetContent className="bg-white w-[700px] max-w-[90vw] overflow-y-auto">
          {selectedThread && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="text-slate-900">{selectedThread.accountName}</SheetTitle>
                    <p className="text-sm text-slate-600 mt-1">{selectedThread.subject}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setThreadDrawerOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* AI Understanding Card */}
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      AI Understanding
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-slate-600">Intent:</span>
                        <div className="font-medium text-slate-900">{selectedThread.intent?.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <span className="text-xs text-slate-600">Confidence:</span>
                        <Badge className="bg-blue-100 text-blue-700">{selectedThread.confidence}%</Badge>
                      </div>
                      <div>
                        <span className="text-xs text-slate-600">Sentiment:</span>
                        <Badge className={cn(
                          selectedThread.sentiment === 'positive' && "bg-emerald-100 text-emerald-700",
                          selectedThread.sentiment === 'neutral' && "bg-slate-100 text-slate-700",
                          selectedThread.sentiment === 'negative' && "bg-red-100 text-red-700"
                        )}>
                          {selectedThread.sentiment}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-xs text-slate-600">Urgency:</span>
                        <Badge className={cn(
                          selectedThread.urgency === 'immediate' && "bg-red-100 text-red-700",
                          selectedThread.urgency === 'high' && "bg-orange-100 text-orange-700",
                          selectedThread.urgency === 'normal' && "bg-slate-100 text-slate-700",
                          selectedThread.urgency === 'low' && "bg-emerald-100 text-emerald-700"
                        )}>
                          {selectedThread.urgency}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Messages */}
                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Conversation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedThread.messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "p-3 rounded-lg",
                          msg.from.includes('customer')
                            ? "bg-white border-2 border-slate-200"
                            : "bg-blue-50 border-2 border-blue-200"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-700">
                            {msg.from.includes('customer') ? msg.from : 'You'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {format(new Date(msg.sentAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-900">{msg.body}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* AI Draft Reply */}
                {selectedThread.aiDraftReply && (
                  <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        AI-Generated Draft Reply
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        value={selectedThread.aiDraftReply}
                        className="bg-white border-slate-300 text-slate-900 min-h-[100px]"
                        readOnly
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            toast.success("Reply sent!");
                            setThreadDrawerOpen(false);
                          }}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Send Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.info("Draft copied!")}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast.success("Summarizing thread...")}
                    >
                      <Sparkles className="w-3 h-3 mr-2" />
                      Summarize this thread
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast.success("Generating follow-up...")}
                    >
                      <Mail className="w-3 h-3 mr-2" />
                      Generate polite follow-up
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast.success("Converting to task...")}
                    >
                      <CheckCircle className="w-3 h-3 mr-2" />
                      Convert to CRM Task
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Account Drawer */}
      <Sheet open={accountDrawerOpen} onOpenChange={setAccountDrawerOpen}>
        <SheetContent className="bg-white border-slate-200 text-slate-900 w-[700px] overflow-y-auto">
          {selectedAccount && (
            <>
              <SheetHeader className="border-b border-slate-200 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-2xl text-slate-900">{selectedAccount.name}</SheetTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-purple-100 text-purple-700">{selectedAccount.segment}</Badge>
                      <div className="flex items-center gap-1">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          selectedAccount.health === 'Excellent' ? "bg-emerald-500" :
                            selectedAccount.health === 'Good' ? "bg-green-500" :
                              selectedAccount.health === 'Fair' ? "bg-amber-500" :
                                "bg-red-500"
                        )} />
                        <span className="text-xs text-slate-600">Health: {selectedAccount.healthScore}%</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setAccountDrawerOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="bg-slate-50 p-1 rounded-xl">
                  <TabsTrigger value="overview" className="text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Overview</TabsTrigger>
                  <TabsTrigger value="adoption" className="text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Adoption</TabsTrigger>
                  <TabsTrigger value="timeline" className="text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Timeline</TabsTrigger>
                  <TabsTrigger value="renewal" className="text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Renewal</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1">ARR</div>
                      <div className="text-2xl font-bold text-slate-900">${(selectedAccount.arr / 1000).toFixed(0)}K</div>
                      <div className="text-xs text-slate-600 mt-1">MRR: ${(selectedAccount.mrr / 1000).toFixed(1)}K/mo</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1">Seats</div>
                      <div className="text-2xl font-bold text-slate-900">{selectedAccount.seats}</div>
                      <div className="text-xs text-slate-600 mt-1">{selectedAccount.usage.activeUsers} active</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1">Expansion Likely</div>
                      <div className="text-2xl font-bold text-emerald-600">{selectedAccount.expansionLikely}%</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1">Churn Risk</div>
                      <div className={cn(
                        "text-2xl font-bold",
                        selectedAccount.churnLikely < 30 ? "text-emerald-600" :
                          selectedAccount.churnLikely < 60 ? "text-amber-600" :
                            "text-red-600"
                      )}>{selectedAccount.churnLikely}%</div>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Rocket className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-slate-900">Expansion Play</span>
                    </div>
                    <div className="text-sm text-slate-700 mb-3">
                      Usage at {selectedAccount.usage.last30d}% in last 30d. Strong adoption signals.
                      Recommended: Upsell analytics module ($12K ARR) + 10 additional seats ($3K ARR).
                    </div>
                    <Button size="sm" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 text-xs">
                      <Send className="w-3 h-3 mr-1" />
                      Launch Upsell Campaign
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="adoption" className="mt-4">
                  <Card className="bg-white border-slate-200 rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-900">30-Day Adoption Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={selectedAccount.adoptionTrend.map((v, i) => ({ day: i + 1, usage: v }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                          <XAxis dataKey="day" tick={{ fill: '#4a5568', fontSize: 10 }} />
                          <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} />
                          <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="usage" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline" className="mt-4">
                  <div className="text-sm text-slate-600 text-center py-8">
                    Multi-object timeline: emails, calls, meetings, tickets, invoices would appear here
                  </div>
                </TabsContent>

                <TabsContent value="renewal" className="mt-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1">Renewal Date</div>
                      <div className="text-lg font-semibold text-slate-900">
                        {format(new Date(selectedAccount.renewalDate), 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {differenceInDays(new Date(selectedAccount.renewalDate), now)} days away
                      </div>
                    </div>
                    <Button className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule QBR
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Global AI Copilot Panel - Enhanced */}
      <AnimatePresence>
        {aiCopilotOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed top-0 right-0 h-screen w-[450px] bg-white border-l-2 border-slate-200 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/20">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">AI Copilot</h2>
                    <p className="text-xs text-blue-100">Enhanced with autonomous capabilities</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAiCopilotOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <Tabs value={aiCopilotMode} onValueChange={setAiCopilotMode} className="w-full">
                <TabsList className="bg-white/20 p-1 rounded-lg w-full grid grid-cols-3">
                  <TabsTrigger value="chat" className="text-xs text-white data-[state=active]:bg-white data-[state=active]:text-blue-600">
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="actions" className="text-xs text-white data-[state=active]:bg-white data-[state=active]:text-blue-600">
                    Actions
                  </TabsTrigger>
                  <TabsTrigger value="suggestions" className="text-xs text-white data-[state=active]:bg-white data-[state=active]:text-blue-600">
                    Suggestions
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {aiCopilotMode === "chat" && (
                <div className="space-y-4">
                  {aiChatMessages.length === 0 && (
                    <div className="text-center py-12">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                      <p className="text-sm text-slate-600 mb-4">Ask me anything about your business</p>
                      <div className="space-y-2">
                        {[
                          "Why did you reassign that deal?",
                          "What should I prioritize next?",
                          "Can you fix the at-risk accounts?",
                          "Show me your learning performance"
                        ].map((q, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant="outline"
                            className="w-full text-xs text-left justify-start border-slate-200"
                            onClick={() => handleAIChat(q)}
                          >
                            {q}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiChatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex gap-2",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[85%] p-3 rounded-xl text-sm whitespace-pre-wrap",
                          msg.role === 'user'
                            ? "bg-blue-600 text-white ml-auto"
                            : "bg-slate-100 text-slate-900"
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {aiTyping && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-slate-100 p-3 rounded-xl">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {aiCopilotMode === "actions" && (
                <div className="space-y-3">
                  {[
                    { title: "Schedule QBRs for at-risk accounts", priority: "high", time: "~15min" },
                    { title: "Follow up on deals stuck >30 days", priority: "high", time: "~10min" },
                    { title: "Generate pipeline forecast report", priority: "medium", time: "~5min" },
                    { title: "Review ticket SLA breaches", priority: "medium", time: "~8min" },
                    { title: "Update revenue projections", priority: "low", time: "~20min" }
                  ].map((action, idx) => (
                    <Card key={idx} className="bg-slate-50 border-slate-200">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-slate-900">{action.title}</h4>
                          <Badge className={cn(
                            "text-xs",
                            action.priority === "high" && "bg-red-100 text-red-700 border-red-300",
                            action.priority === "medium" && "bg-amber-100 text-amber-700 border-amber-300",
                            action.priority === "low" && "bg-blue-100 text-blue-700 border-blue-300"
                          )}>
                            {action.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600">{action.time}</span>
                          <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                            Execute
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {aiCopilotMode === "suggestions" && (
                <div className="space-y-3">
                  {[
                    {
                      title: "Optimize deal stages for faster velocity",
                      impact: "+18% close rate",
                      confidence: 87,
                      description: "Analysis shows Legal stage takes 3x longer than industry average"
                    },
                    {
                      title: "Implement auto-escalation for P1 tickets",
                      impact: "-40% breach rate",
                      confidence: 92,
                      description: "3 P1 tickets breached SLA in past week"
                    },
                    {
                      title: "Launch account health monitoring",
                      impact: "-$120K churn risk",
                      confidence: 78,
                      description: "5 accounts show declining engagement patterns"
                    }
                  ].map((suggestion, idx) => (
                    <Card key={idx} className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <Lightbulb className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                          <Badge className="bg-white/80 text-purple-700 border-purple-300 text-xs ml-2">
                            {suggestion.confidence}% conf
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-1">{suggestion.title}</h4>
                        <p className="text-xs text-slate-600 mb-2">{suggestion.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs font-mono">
                            {suggestion.impact}
                          </Badge>
                          <Button size="sm" variant="outline" className="h-7 text-xs border-purple-300 hover:bg-purple-100">
                            Learn More
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {aiCopilotMode === "chat" && (
              <div className="p-4 border-t border-slate-200 bg-slate-50">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask AI anything..."
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && aiChatInput && handleAIChat(aiChatInput)}
                    className="flex-1 text-sm bg-white border-slate-300"
                  />
                  <Button
                    size="sm"
                    onClick={() => aiChatInput && handleAIChat(aiChatInput)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Bar Dialog */}
      <Dialog open={commandBarOpen} onOpenChange={setCommandBarOpen}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="w-5 h-5 text-blue-600" />
              AI Command Bar
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Input
              placeholder="Type a command... (e.g. 'summarize pipeline', 'draft email for at-risk deals')"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && commandInput && handleCommand(commandInput)}
              autoFocus
              className="text-sm"
            />
            <div className="space-y-1">
              <p className="text-xs text-slate-600 font-medium mb-2">Quick Commands:</p>
              {[
                "summarize pipeline and forecast next quarter",
                "draft email for deals stuck >30 days",
                "show accounts at churn risk",
                "generate board report",
                "analyze ticket response times"
              ].map((cmd, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="ghost"
                  className="w-full justify-start text-xs text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    setCommandInput(cmd);
                    handleCommand(cmd);
                  }}
                >
                  <Sparkles className="w-3 h-3 mr-2 text-purple-600" />
                  {cmd}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Thread Command Bar Dialog */}
      <Dialog open={threadCommandOpen} onOpenChange={setThreadCommandOpen}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-600">
              <Command className="w-5 h-5 text-purple-600" />
              Thread Command Bar
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Input
              placeholder="Type a command... (e.g. 'summarize this thread', 'draft a reply')"
              value={threadCommandInput}
              onChange={(e) => setThreadCommandInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && threadCommandInput && handleThreadCommand(threadCommandInput)}
              autoFocus
              className="text-sm border-slate-300"
            />
            <div className="space-y-1">
              <p className="text-xs text-slate-600 font-medium mb-2">Quick Commands:</p>
              {[
                "summarize this thread",
                "draft a polite reply",
                "what's the sentiment history?",
                "create a follow-up task"
              ].map((cmd, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="ghost"
                  className="w-full justify-start text-xs text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    setCommandInput(cmd);
                    handleThreadCommand(cmd);
                  }}
                >
                  <Sparkles className="w-3 h-3 mr-2 text-purple-600" />
                  {cmd}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forecast Sandbox */}
      <Dialog open={forecastSandboxOpen} onOpenChange={setForecastSandboxOpen}>
        <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-blue-600" />
              Revenue Forecast Sandbox
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-slate-700 mb-2 block">Win Rate %</Label>
                <Slider
                  value={[forecastParams.winRate]}
                  onValueChange={(val) => setForecastParams(prev => ({ ...prev, winRate: val[0] }))}
                  max={100}
                  step={5}
                  className="mb-2"
                />
                <div className="text-center text-sm font-mono text-slate-900">{forecastParams.winRate}%</div>
              </div>
              <div>
                <Label className="text-sm text-slate-700 mb-2 block">Avg Deal Size</Label>
                <Slider
                  value={[forecastParams.avgDealSize / 1000]}
                  onValueChange={(val) => setForecastParams(prev => ({ ...prev, avgDealSize: val[0] * 1000 }))}
                  max={200}
                  step={5}
                  className="mb-2"
                />
                <div className="text-center text-sm font-mono text-slate-900">${(forecastParams.avgDealSize / 1000).toFixed(0)}K</div>
              </div>
              <div>
                <Label className="text-sm text-slate-700 mb-2 block">Churn Rate %</Label>
                <Slider
                  value={[forecastParams.churnRate]}
                  onValueChange={(val) => setForecastParams(prev => ({ ...prev, churnRate: val[0] }))}
                  max={20}
                  step={1}
                  className="mb-2"
                />
                <div className="text-center text-sm font-mono text-slate-900">{forecastParams.churnRate}%</div>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Forecasted Impact</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      ${((pipelineMetrics.weighted * forecastParams.winRate / 50) / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-slate-600 mt-1">Expected Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.floor(deals.length * forecastParams.winRate / 100)}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">Expected Closes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">
                      ${((accounts.reduce((s, a) => s + a.arr, 0) * (100 - forecastParams.churnRate) / 100) / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-xs text-slate-600 mt-1">Retained ARR</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/80 rounded-lg border border-blue-200">
                  <p className="text-sm text-slate-700">
                    <strong>AI Narrative:</strong> Based on adjusted parameters, projected quarterly revenue is ${((pipelineMetrics.weighted * forecastParams.winRate / 50) / 1000).toFixed(0)}K
                    with {Math.floor(deals.length * forecastParams.winRate / 100)} expected closes. Churn impact reduces net ARR by
                    ${((accounts.reduce((s, a) => s + a.arr, 0) * forecastParams.churnRate / 100) / 1000000).toFixed(2)}M.
                    Confidence level: {(100 - Math.abs(forecastParams.winRate - 50) * 0.5).toFixed(0)}%.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Business Narrative Dialog */}
      <Dialog open={narrativeOpen} onOpenChange={setNarrativeOpen}>
        <DialogContent className="bg-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Business Health Narrative
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">
              {businessNarrative || <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />}
            </div>
            {businessNarrative && (
              <div className="flex gap-2 mt-4">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
                  navigator.clipboard.writeText(businessNarrative);
                  toast.success("Narrative copied to clipboard!");
                }}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button variant="outline" className="flex-1 border-slate-300 hover:bg-slate-100">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share to Slack
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Predictive Alerts Sheet */}
      <Sheet open={alertsOpen} onOpenChange={setAlertsOpen}>
        <SheetContent className="bg-white w-[500px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Predictive Alerts
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {alerts.map((alert) => (
              <Card key={alert.id} className={cn(
                "border-2",
                alert.severity === "high" && "bg-red-50 border-red-200",
                alert.severity === "medium" && "bg-amber-50 border-amber-200",
                alert.severity === "low" && "bg-blue-50 border-blue-200"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <AlertCircle className={cn(
                      "w-5 h-5",
                      alert.severity === "high" && "text-red-600",
                      alert.severity === "medium" && "text-amber-600",
                      alert.severity === "low" && "text-blue-600"
                    )} />
                    <Badge className={cn(
                      "text-xs",
                      alert.severity === "high" && "bg-red-100 text-red-700 border-red-300",
                      alert.severity === "medium" && "bg-amber-100 text-amber-700 border-amber-300",
                      alert.severity === "low" && "bg-blue-100 text-blue-700 border-blue-300"
                    )}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">{alert.title}</h4>
                  <p className="text-xs text-slate-600 mb-2">{alert.cause}</p>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 mb-2">
                    <span className="text-xs text-slate-700">💡 {alert.suggestedFix}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                      Apply Fix
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs border-slate-300">
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* People Graph Sheet */}
      <Sheet open={peopleGraphOpen} onOpenChange={setPeopleGraphOpen}>
        <SheetContent className="bg-white w-[700px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-600" />
              People Network Graph
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <div className="h-[600px] bg-slate-50 rounded-xl border-2 border-slate-200 flex items-center justify-center">
              <div className="text-center">
                <Network className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-sm text-slate-600 mb-2">Interactive people network visualization</p>
                <p className="text-xs text-slate-500">Nodes: People • Edges: Interaction frequency & sentiment</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Convert to Task Dialog */}
      <Dialog open={convertToTaskOpen} onOpenChange={setConvertToTaskOpen}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Convert to CRM Task
            </DialogTitle>
          </DialogHeader>
          {selectedThreadForAction && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="task-title" className="text-slate-700">Task Title</Label>
                <Input
                  id="task-title"
                  defaultValue={`Follow up: ${selectedThreadForAction.subject}`}
                  className="mt-1 border-slate-300"
                />
              </div>
              <div>
                <Label htmlFor="assign-to" className="text-slate-700">Assign To</Label>
                <Select defaultValue="me">
                  <SelectTrigger id="assign-to" className="mt-1 border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-300">
                    <SelectItem value="me">Me</SelectItem>
                    <SelectItem value="alice">Alice Chen</SelectItem>
                    <SelectItem value="bob">Bob Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="due-date" className="text-slate-700">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  defaultValue={format(addDays(now, 2), 'yyyy-MM-dd')}
                  className="mt-1 border-slate-300"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    toast.success("Task created successfully!");
                    setConvertToTaskOpen(false);
                  }}
                >
                  Create Task
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-slate-300 hover:bg-slate-100"
                  onClick={() => setConvertToTaskOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Draft Dialog */}
      <Dialog open={aiDraftDialogOpen} onOpenChange={setAiDraftDialogOpen}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Draft Reply
            </DialogTitle>
          </DialogHeader>
          {selectedDraftThread && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-slate-600">Drafting reply for: <span className="font-medium">{selectedDraftThread.subject}</span></p>
              <div>
                <Label htmlFor="draft-text" className="text-slate-700">Draft Content</Label>
                <Textarea
                  id="draft-text"
                  defaultValue={selectedDraftThread.aiDraftReply || "AI is generating a draft reply..."}
                  className="mt-1 border-slate-300 min-h-[150px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    toast.success("Draft sent!");
                    setAiDraftDialogOpen(false);
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Draft
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-slate-300 hover:bg-slate-100"
                  onClick={() => {
                    toast.info("Draft regenerating...");
                    setThreads(prev => prev.map(t =>
                      t.id === selectedDraftThread.id
                        ? { ...t, aiDraftReply: "Here's a regenerated draft: I understand your concerns about X. We can offer Y solution. How about a quick call?" }
                        : t
                    ));
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ENHANCED AI ACCOUNT CONSOLE - Right Panel */}
      <AnimatePresence>
        {accountsAIConsoleOpen && selectedAccountForAI && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed top-0 right-0 h-screen w-[500px] bg-white border-l-2 border-slate-200 shadow-2xl z-50 flex flex-col overflow-y-auto"
          >
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                    {selectedAccountForAI.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{selectedAccountForAI.name}</h2>
                    <p className="text-xs text-blue-100">{selectedAccountForAI.segment}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAccountsAIConsoleOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-xs text-blue-100 mb-1">ARR</div>
                  <div className="text-xl font-bold">${(selectedAccountForAI.arr / 1000).toFixed(0)}K</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-xs text-blue-100 mb-1">CAH Score</div>
                  <div className="text-xl font-bold">{selectedAccountForAI.cah.score}%</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-xs text-blue-100 mb-1">NPS</div>
                  <div className="text-xl font-bold">{selectedAccountForAI.nps}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-xs text-blue-100 mb-1">Renewal</div>
                  <div className="text-xl font-bold">{differenceInDays(new Date(selectedAccountForAI.renewalDate), now)}d</div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-6">
              {/* AI Narrative */}
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    AI Narrative
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedAccountForAI.churnLikely > 60
                      ? `Account health declining due to ${selectedAccountForAI.usage.last30d < 50 ? 'low feature adoption' : 'recent support issues'}. ${selectedAccountForAI.ticketsOpen} open tickets. Recommend immediate CSM engagement and QBR scheduling.`
                      : selectedAccountForAI.expansionLikely > 70
                      ? `Strong expansion signals detected. Usage at ${selectedAccountForAI.usage.last30d}% in last 30d with ${selectedAccountForAI.usage.activeUsers} active users. Estimated upsell potential: $${(selectedAccountForAI.expansionPotential / 1000).toFixed(0)}K ARR.`
                      : `Healthy account with stable engagement. Current adoption trend positive. Continue normal cadence and monitor for expansion opportunities.`
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Forecast Panel */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Forecast Panel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-600">Renewal Likelihood</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-lg font-bold",
                        selectedAccountForAI.churnLikely < 30 ? "text-emerald-600" :
                          selectedAccountForAI.churnLikely < 60 ? "text-amber-600" :
                            "text-red-600"
                      )}>
                        {100 - selectedAccountForAI.churnLikely}%
                      </span>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                        +6%
                      </Badge>
                    </div>
                  </div>

                  {selectedAccountForAI.expansionPotential > 0 && (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-xs text-slate-600">Expansion Potential</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-emerald-600">
                          ${(selectedAccountForAI.expansionPotential / 1000).toFixed(0)}K
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                          Analytics module
                        </Badge>
                      </div>
                    </div>
                  )}

                  {selectedAccountForAI.churnLikely > 60 && (
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="text-xs text-slate-600">Churn Risk</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">
                          ${(selectedAccountForAI.arr / 1000).toFixed(0)}K
                        </span>
                        <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                          ARR at risk
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CAH Breakdown */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-sm">Composite Health Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(selectedAccountForAI.cah.breakdown).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600 capitalize">{key}</span>
                        <span className="font-semibold text-slate-900">{value.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            value >= 80 ? "bg-emerald-500" :
                              value >= 60 ? "bg-blue-500" :
                                value >= 40 ? "bg-amber-500" :
                                  "bg-red-500"
                          )}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Actions */}
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    Quick AI Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    size="sm"
                    className="w-full justify-start bg-white hover:bg-slate-50 text-slate-900 border-slate-300"
                    onClick={() => handleAccountAIAction(selectedAccountForAI, 'qbr')}
                  >
                    <FileText className="w-3.5 h-3.5 mr-2" />
                    Generate QBR Summary
                  </Button>
                  <Button
                    size="sm"
                    className="w-full justify-start bg-white hover:bg-slate-50 text-slate-900 border-slate-300"
                    onClick={() => handleAccountAIAction(selectedAccountForAI, 'forecast')}
                  >
                    <TrendingUp className="w-3.5 h-3.5 mr-2" />
                    Forecast Renewal
                  </Button>
                  {selectedAccountForAI.expansionLikely > 70 && (
                    <Button
                      size="sm"
                      className="w-full justify-start bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-300"
                      onClick={() => handleAccountAIAction(selectedAccountForAI, 'upsell')}
                    >
                      <Rocket className="w-3.5 h-3.5 mr-2" />
                      Generate Upsell Plan
                    </Button>
                  )}
                  {selectedAccountForAI.churnLikely > 60 && (
                    <Button
                      size="sm"
                      className="w-full justify-start bg-red-100 hover:bg-red-200 text-red-700 border-red-300"
                      onClick={() => handleAccountAIAction(selectedAccountForAI, 'reengage')}
                    >
                      <Mail className="w-3.5 h-3.5 mr-2" />
                      Re-engage Stakeholders
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="w-full justify-start bg-white hover:bg-slate-50 text-slate-900 border-slate-300"
                    onClick={() => handleAccountAIAction(selectedAccountForAI, 'journey')}
                  >
                    <Workflow className="w-3.5 h-3.5 mr-2" />
                    Add to {selectedAccountForAI.churnLikely > 60 ? 'Risk Recovery' : 'Expansion'} Journey
                  </Button>
                </CardContent>
              </Card>

              {/* Integration Data */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-sm">Cross-Module Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Open Tickets
                    </span>
                    <Badge className={selectedAccountForAI.ticketsOpen > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}>
                      {selectedAccountForAI.ticketsOpen}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Inbox className="w-4 h-4" />
                      Recent Emails
                    </span>
                    <span className="font-medium text-slate-900">{Math.floor(Math.random() * 15) + 5}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Workflow className="w-4 h-4" />
                      Active Journeys
                    </span>
                    <span className="font-medium text-slate-900">{Math.floor(Math.random() * 3) + 1}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Invoice Status
                    </span>
                    <Badge className="bg-emerald-100 text-emerald-700">Current</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
