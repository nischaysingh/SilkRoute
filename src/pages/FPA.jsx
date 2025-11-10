import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from
"recharts";
import {
  TrendingUp, TrendingDown, Sparkles, Download, Send, Copy,
  Play, RefreshCw, CheckCircle, AlertCircle, Plus, Zap,
  BarChart3, Eye, Info, ArrowRight, Clock, Target, Brain,
  Activity, AlertTriangle, Layers, GitBranch, MessageCircle,
  DollarSign, Users, TrendingDown as TrendingDownIcon, Percent,
  Radio, Shield, Bell, FileText, ChevronRight, Maximize2, Command,
  TrendingUpIcon, Award, Gauge, LineChart as LineChartIcon } from
"lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function FPA() {
  const [mode, setMode] = useState("Forecast");
  const [timeHorizon, setTimeHorizon] = useState("Quarter");
  const [selectedVariance, setSelectedVariance] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [varianceModalOpen, setVarianceModalOpen] = useState(false);
  const [scenarioSimOpen, setScenarioSimOpen] = useState(false);
  const [storyModeOpen, setStoryModeOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotMessages, setCopilotMessages] = useState([]);
  const [varianceTreeOpen, setVarianceTreeOpen] = useState(false);
  const [dealDetailOpen, setDealDetailOpen] = useState(false);
  const [causalChainOpen, setCausalChainOpen] = useState(false);
  const [valuationModalOpen, setValuationModalOpen] = useState(false);
  const [agentFeedOpen, setAgentFeedOpen] = useState(false);
  const [autonomousAgentActive, setAutonomousAgentActive] = useState(true);
  const [forecastConfidence, setForecastConfidence] = useState(89);
  const [healthIndex, setHealthIndex] = useState(92);
  const [insightTicker, setInsightTicker] = useState(0);
  const [dealFilter, setDealFilter] = useState("all");

  // Mock Data
  const syncStatus = {
    payroll: { status: "synced", lastSync: "2 mins ago" },
    taxes: { status: "synced", lastSync: "5 mins ago" },
    cashFlow: { status: "syncing", lastSync: "syncing..." },
    accounting: { status: "synced", lastSync: "1 min ago" }
  };

  const macroSignals = {
    inflation: { value: 3.2, change: -0.1, exposure: "Medium", risk: "yellow" },
    fxUSD: { value: 1.08, change: +0.02, exposure: "Low", risk: "green" },
    interestRate: { value: 5.25, change: 0, exposure: "High", risk: "red" }
  };

  const aiInsights = [
  "Revenue concentration risk up 12% due to top 3 clients representing 67% of ARR",
  "Engineering overtime trending +18% vs Q3 — suggest hiring freeze review",
  "AR aging improved: 45+ days down to 8% from 14% last quarter",
  "Tax liability spike predicted Mar 15 due to payroll + sales tax overlap",
  "Marketing CAC improved 23% after channel reallocation to content",
  "Liquidity tightening across AR and Payroll — 8-day delay risk emerging",
  "Sales velocity up 14% but conversion rate declining 3% — suggest pipeline review"];


  const aiContextNarrative = "Liquidity tightening across AR and Payroll — 8-day delay risk emerging. Revenue forecast adjusted -2.1% from delayed Stripe payout. Tax remittance timing overlap with payroll detected.";

  const forecastData = [
  { month: "Jan", actual: 75000, forecast: 78000, lower: 73000, upper: 83000 },
  { month: "Feb", actual: 78000, forecast: 82000, lower: 77000, upper: 87000 },
  { month: "Mar", actual: 80000, forecast: 85000, lower: 80000, upper: 90000 },
  { month: "Apr", actual: null, forecast: 88000, lower: 83000, upper: 93000 },
  { month: "May", actual: null, forecast: 91000, lower: 86000, upper: 96000 },
  { month: "Jun", actual: null, forecast: 94000, lower: 89000, upper: 99000 }];


  const varianceData = [
  {
    dept: "Engineering",
    budget: 125000,
    actual: 143500,
    variance: 18500,
    variancePct: 14.8,
    insight: "2 new contractors onboarded mid-cycle",
    severity: "high",
    rootCause: ["Payroll", "Overtime", "Engineering", "2 new contractors"],
    rValue: 0.87,
    volatility: "High",
    lagEffect: "+2 weeks"
  },
  {
    dept: "Sales",
    budget: 85000,
    actual: 82300,
    variance: -2700,
    variancePct: -3.2,
    insight: "One rep on leave in Q4",
    severity: "low",
    rootCause: ["Payroll", "Base Salary", "Sales", "PTO"],
    rValue: 0.42,
    volatility: "Low",
    lagEffect: "Immediate"
  },
  {
    dept: "Marketing",
    budget: 45000,
    actual: 48200,
    variance: 3200,
    variancePct: 7.1,
    insight: "Campaign spend shifted from Q3",
    severity: "medium",
    rootCause: ["OpEx", "Marketing", "Digital Ads", "Q4 Campaign"],
    rValue: 0.68,
    volatility: "Medium",
    lagEffect: "+1 week"
  }];


  const scenarios = [
  { name: "Base", runway: 7.4, ebitda: -12500, revenue: 567000, roi: 0, risk: "low", irr: 0, payback: "N/A", capitalEfficiency: 1.0 },
  { name: "Hire 2 Engineers", runway: 6.8, ebitda: -24800, revenue: 567000, roi: -0.6, risk: "medium", irr: -8.2, payback: "Never", capitalEfficiency: 0.87 },
  { name: "10% Marketing Boost", runway: 7.1, ebitda: -17200, revenue: 595000, roi: 0.8, risk: "low", irr: 12.4, payback: "8 months", capitalEfficiency: 1.12 },
  { name: "Series A in March", runway: 18.2, ebitda: -12500, revenue: 567000, roi: 10.8, risk: "low", irr: 38.5, payback: "2 months", capitalEfficiency: 2.4 }];


  const dealCards = [
  {
    id: 1,
    title: "Delay Non-Critical Hiring",
    impact: "+0.8mo runway",
    priority: "high",
    roi: 12.5,
    cashImpact: "+$92K",
    runwayEffect: "+0.8mo",
    timeline: "14 days",
    risk: "low",
    tag: "Payroll",
    reasoning: "Two open engineering roles can be delayed until Q2 without impacting delivery timelines. Historical analysis shows 87% of projects remain on track with current capacity.",
    actions: ["Review Headcount Plan", "Notify Recruiting"],
    beforeAfter: { runway: [7.4, 8.2], cash: [245000, 337000] },
    executionDifficulty: "Easy"
  },
  {
    id: 2,
    title: "Accelerate AR Collection",
    impact: "+$45K cash",
    priority: "high",
    roi: 8.2,
    cashImpact: "+$45K",
    runwayEffect: "+0.3mo",
    timeline: "7 days",
    risk: "low",
    tag: "AR",
    reasoning: "Three invoices over 45 days past due (Acme Corp $28K, Beta Inc $12K, Gamma LLC $5K). Early outreach can recover 70% within 2 weeks based on historical patterns.",
    actions: ["Contact Customers", "Review Terms", "Offer Early Payment Discount"],
    beforeAfter: { dso: [42, 35], cash: [245000, 290000] },
    executionDifficulty: "Medium"
  },
  {
    id: 3,
    title: "Optimize Marketing Spend",
    impact: "-$9K/mo",
    priority: "medium",
    roi: 6.1,
    cashImpact: "-$9K/mo",
    runwayEffect: "+0.4mo",
    timeline: "30 days",
    risk: "low",
    tag: "Marketing",
    reasoning: "CAC analysis shows paid search underperforming by 23% vs content marketing. Reallocating $9K/mo from Facebook/Google Ads to SEO + content yields 2.4% higher ROAS.",
    actions: ["Run A/B Test", "Adjust Budget", "Pause Low-ROI Campaigns"],
    beforeAfter: { cac: [485, 373], roas: [2.1, 2.6] },
    executionDifficulty: "Easy"
  },
  {
    id: 4,
    title: "Delay Vendor Payout by 10 Days",
    impact: "+0.6mo runway",
    priority: "medium",
    roi: 4.8,
    cashImpact: "+$68K",
    runwayEffect: "+0.6mo",
    timeline: "immediate",
    risk: "low",
    tag: "Payables",
    reasoning: "Three major vendor invoices totaling $68K due Jan 20. Negotiating 10-day extensions improves short-term liquidity without penalty.",
    actions: ["Contact Vendors", "Negotiate Terms"],
    beforeAfter: { runway: [7.4, 8.0], liquidityCrisis: ["Mar 15", "Mar 28"] },
    executionDifficulty: "Easy"
  }];


  const tradeTape = [
  { id: 1, date: "2024-12-15", action: "Accelerated AR Collection", expectedROI: 8.2, realizedROI: 9.1, cashImpact: "$45K", status: "outperformed" },
  { id: 2, date: "2024-12-10", action: "Marketing Channel Reallocation", expectedROI: 6.1, realizedROI: 5.8, cashImpact: "-$9K/mo", status: "on-track" },
  { id: 3, date: "2024-12-01", action: "Delayed Contractor Hiring", expectedROI: 12.5, realizedROI: 11.9, cashImpact: "$92K", status: "on-track" },
  { id: 4, date: "2024-11-20", action: "Vendor Payment Extension", expectedROI: 4.8, realizedROI: 4.2, status: "underperformed" }];


  const capitalEfficiency = [
  { team: "Engineering", spend: 180000, revenue: 420000, roi: 2.33, efficiency: 92 },
  { team: "Sales", spend: 95000, revenue: 380000, roi: 4.0, efficiency: 95 },
  { team: "Marketing", spend: 62000, revenue: 145000, roi: 2.34, efficiency: 78 },
  { team: "Operations", spend: 38000, revenue: 0, roi: 0, efficiency: 85 }];


  const profitabilityMap = [
  { name: "Product A", margin: 68, costToRevenue: 0.32, revenue: 180000 },
  { name: "Product B", margin: 45, costToRevenue: 0.55, revenue: 95000 },
  { name: "Services", margin: 82, costToRevenue: 0.18, revenue: 220000 },
  { name: "Consulting", margin: 38, costToRevenue: 0.62, revenue: 72000 }];


  const correlationData = [
  { factor: "Marketing", profitCorr: 85, burnCorr: 62 },
  { factor: "Payroll", profitCorr: 45, burnCorr: 95 },
  { factor: "R&D", profitCorr: 78, burnCorr: 72 },
  { factor: "Sales", profitCorr: 92, burnCorr: 48 },
  { factor: "OpEx", profitCorr: 35, burnCorr: 88 }];


  const valuationMetrics = {
    ev: 18500000,
    arr: 2250000,
    multiple: 8.2,
    industryMedian: 9.5,
    growthRate: 42,
    burnMultiple: 1.8,
    benchmarkData: [
    { metric: "ARR Multiple", yours: 8.2, industry: 9.5, percentile: 48 },
    { metric: "Growth Rate", yours: 42, industry: 38, percentile: 64 },
    { metric: "Burn Multiple", yours: 1.8, industry: 1.6, percentile: 42 },
    { metric: "CAC Payback", yours: 9.2, industry: 11.3, percentile: 68 }]

  };

  const storyChapters = [
  {
    chapter: "Q1 2024 — Growth Phase",
    narrative: "Revenue grew 18% QoQ driven by enterprise expansion. Payroll increased 12% from strategic hires.",
    metrics: { revenue: "+18%", burn: "+12%", runway: "8.2mo" },
    sentiment: "positive",
    inflectionPoint: { date: "Feb 2024", event: "First enterprise contract ($180K ARR)", causal: "Hiring surge → Payroll ↑ 12% → Burn ↑ 0.3x → Runway ↓ 0.6mo" }
  },
  {
    chapter: "Q2 2024 — Efficiency Mode",
    narrative: "Gross margin improved 4.6% through operational efficiency. Customer retention stabilized at 94%.",
    metrics: { margin: "+4.6%", retention: "94%", runway: "8.5mo" },
    sentiment: "positive",
    inflectionPoint: { date: "Apr 2024", event: "Churn reduction initiative launched", causal: "Marketing optimization → CAC ↓ 15% → Efficiency ↑ → Runway ↑ 0.3mo" }
  },
  {
    chapter: "Q3 2024 — Optimization",
    narrative: "Cost optimization initiatives extended runway by 1.2 months without impacting growth velocity.",
    metrics: { runway: "+1.2mo", efficiency: "+8%", churn: "-2.1%" },
    sentiment: "positive",
    inflectionPoint: { date: "Aug 2024", event: "Marketing channel reallocation", causal: "Paid ads ↓ 20% → Content ↑ → ROAS ↑ 2.4% → Cash preserved" }
  },
  {
    chapter: "Q4 2024 — Strategic Investment",
    narrative: "Increased R&D and sales capacity to capture market opportunity. Burn rose 6% but pipeline grew 23%.",
    metrics: { burn: "+6%", pipeline: "+23%", runway: "7.4mo" },
    sentiment: "strategic",
    inflectionPoint: { date: "Nov 2024", event: "Headcount scaling initiated", causal: "2 engineers hired → Payroll ↑ $18.5K → Tax ↑ $2.8K → Runway ↓ 0.3mo" }
  }];


  const crossModuleInsights = [
  { module: "Cash Flow", alert: "Cash deficit predicted Mar 15 due to tax filing + payroll overlap", severity: "high", impact: "-$42K" },
  { module: "Payroll", alert: "3 bonus payouts scheduled Feb 28 — $18.5K impact", severity: "medium", impact: "-$18.5K" },
  { module: "Taxes", alert: "Sales tax remittance moved to Jan 31 from Feb 1", severity: "low", impact: "-$20.1K" }];


  const causalChain = [
  { trigger: "Engineering overtime", amount: "+$3.2K", module: "Payroll" },
  { trigger: "Payroll increase", amount: "+$620", module: "Tax" },
  { trigger: "Tax liability up", amount: "-0.12mo", module: "Runway" },
  { trigger: "Runway shortened", amount: "Alert triggered", module: "FP&A" }];


  const agentActivity = [
  { time: "2 mins ago", agent: "CashFlowAgent", message: "Revenue forecast adjusted -2.1% based on delayed Stripe payout", status: "processed", severity: "medium" },
  { time: "15 mins ago", agent: "PayrollAgent", message: "Variance detected: overtime +$3.2K vs projection", status: "flagged", severity: "high" },
  { time: "1 hr ago", agent: "RiskAgent", message: "68% likelihood of cash crunch on Feb 28 — AR acceleration recommended", status: "action_needed", severity: "high" },
  { time: "2 hrs ago", agent: "TaxAgent", message: "Tax obligation recalculated: $32K due Jan 15", status: "processed", severity: "medium" },
  { time: "5 hrs ago", agent: "ValuationAgent", message: "ARR multiple dropped to 8.2x from 8.4x — market correction", status: "processed", severity: "low" },
  { time: "Yesterday", agent: "ComplianceAgent", message: "All tax filings on track — no compliance risks detected", status: "processed", severity: "low" }];


  const riskHeatmap = [
  { date: "Feb 28", event: "Potential cash crunch", probability: 68, mitigation: "Accelerate AR by 7 days", severity: "high", daysOut: 28 },
  { date: "Mar 15", event: "Tax + Payroll overlap", probability: 95, mitigation: "Delay vendor payouts", severity: "critical", daysOut: 43 },
  { date: "Apr 1", event: "Runway below 6 months", probability: 42, mitigation: "Initiate fundraise or cut burn", severity: "medium", daysOut: 60 }];


  const getSyncStatusColor = (status) => {
    switch (status) {
      case "synced":return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "syncing":return "bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse";
      case "error":return "bg-red-500/20 text-red-400 border-red-500/30";
      default:return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getVarianceColor = (severity) => {
    switch (severity) {
      case "high":return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "low":return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default:return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "low":return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "medium":return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "high":return "bg-red-500/20 text-red-400 border-red-500/30";
      case "critical":return "bg-red-600/30 text-red-300 border-red-600/40";
      default:return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleCopilotSend = () => {
    if (!copilotInput.trim()) return;

    const userMessage = { role: "user", content: copilotInput };
    setCopilotMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      let response = "";
      let hasChart = false;

      if (copilotInput.toLowerCase().includes("hire") || copilotInput.toLowerCase().includes("afford")) {
        response = "Based on current runway (7.4 months) and projected revenue, hiring 3 sales reps would reduce runway to 6.2 months. However, if they hit 75% of quota by month 4, runway extends to 9.1 months by Q3. Recommended: Hire 2 now, 1 in Q2. ROI projection: 3.2x by month 8.";
        hasChart = true;
      } else if (copilotInput.toLowerCase().includes("marketing")) {
        response = "Cutting marketing by 20% saves $9K/mo, extending runway to 8.1 months. However, pipeline growth may slow 15-20%. Alternative: Reallocate from paid search ($6K) to content ($6K) for same cost, +2.4% ROAS based on historical data.";
      } else if (copilotInput.toLowerCase().includes("benchmark")) {
        response = "Comparing to SaaS companies with $2-3M ARR: Your burn multiple (1.8x) is 14% above median (1.6x). Runway (7.4mo) aligns with 52nd percentile. CAC payback (9.2mo) is better than average (11.3mo). Recommendation: Focus on burn optimization.";
        hasChart = true;
      } else if (copilotInput.toLowerCase().includes("memo") || copilotInput.toLowerCase().includes("board")) {
        response = "Generated board memo: Q4 performance shows 6% burn increase offset by 23% pipeline growth. Runway stable at 7.4 months. Key risk: cash timing in March. Mitigation: AR acceleration initiative underway. Ready to export as PDF.";
      } else if (copilotInput.toLowerCase().includes("valuation")) {
        response = "Current valuation: $18.5M at 8.2x ARR multiple vs 9.5x industry median (48th percentile). You're trading below market due to slower growth (42% vs 38% industry avg). Recommendation: Accelerate growth to reach 10x multiple target.";
        hasChart = true;
      } else {
        response = "I can help you simulate financial outcomes, compare to benchmarks, analyze variance drivers, generate board summaries, or explain valuation metrics. What would you like to explore?";
      }

      const aiResponse = {
        role: "assistant",
        content: response,
        actions: hasChart ? ["View Chart", "Run Simulation", "Export Report"] : ["Run Simulation", "View Details", "Add to Report"]
      };
      setCopilotMessages((prev) => [...prev, aiResponse]);
    }, 1200);

    setCopilotInput("");
  };

  // Simulate autonomous agent updates
  useEffect(() => {
    if (autonomousAgentActive) {
      const interval = setInterval(() => {
        setForecastConfidence((prev) => Math.min(95, Math.max(75, prev + (Math.random() > 0.5 ? 1 : -1))));
        setHealthIndex((prev) => Math.min(98, Math.max(85, prev + (Math.random() > 0.6 ? 0.5 : -0.5))));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [autonomousAgentActive]);

  // AI Insight Ticker Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setInsightTicker((prev) => (prev + 1) % aiInsights.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const filteredDeals = dealFilter === "all" ? dealCards :
  dealCards.filter((d) => {
    if (dealFilter === "roi") return d.roi > 8;
    if (dealFilter === "liquidity") return parseFloat(d.cashImpact.replace(/[^0-9.-]/g, '')) > 50000;
    if (dealFilter === "easy") return d.executionDifficulty === "Easy";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Strategic Layer - Financial Brainstem */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent flex items-center gap-2">
            <Command className="w-7 h-7 text-blue-400" />
            FP&A Command Floor
          </h2>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Where Finance Thinks, Trades, and Learns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white backdrop-blur-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
              <SelectItem value="Forecast">Forecast</SelectItem>
              <SelectItem value="Actuals">Actuals</SelectItem>
              <SelectItem value="Simulation">Simulation</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeHorizon} onValueChange={setTimeHorizon}>
            <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white backdrop-blur-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
              <SelectItem value="Month">Month</SelectItem>
              <SelectItem value="Quarter">Quarter</SelectItem>
              <SelectItem value="Year">Year</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => setAgentFeedOpen(!agentFeedOpen)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 backdrop-blur-xl">

            <Activity className="w-4 h-4 mr-2" />
            Agent Feed
          </Button>

          <Button
            onClick={() => setCopilotOpen(!copilotOpen)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 backdrop-blur-xl">

            <Sparkles className="w-4 h-4 mr-2" />
            AI Copilot
          </Button>
        </div>
      </div>

      {/* AI Context Bar */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-xl border-purple-500/20 rounded-xl overflow-hidden shadow-lg shadow-purple-500/10">
        <CardContent className="bg-cyan-800 p-4">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
            <div className="flex-1">
              <div className="text-xs text-purple-300 font-medium mb-1">AI FINANCIAL CONTEXT — LIVE STREAM</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={insightTicker}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-sm text-white font-medium leading-relaxed">

                  {aiContextNarrative}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                <Brain className="w-3 h-3 mr-1" />
                {forecastConfidence}% Confident
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                Live
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Status Strip */}
      <div className="flex items-center gap-2">
        {Object.entries(syncStatus).map(([key, data]) =>
        <Badge key={key} className={cn("text-xs backdrop-blur-xl", getSyncStatusColor(data.status))}>
            <CheckCircle className="w-3 h-3 mr-1" />
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Badge>
        )}
      </div>

      {/* Intelligence Grid - 3 Tiers */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* TIER 1: STRATEGIC METRICS */}
        {/* Financial Health Index */}
        <Card className="col-span-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border-emerald-500/20 rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-300">Health Index</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">{healthIndex.toFixed(1)}</div>
            <Progress value={healthIndex} className="h-2 mb-2 bg-emerald-950/50" />
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.1% vs last week
            </Badge>
          </CardContent>
        </Card>

        {/* Forecast Confidence */}
        <Card className="col-span-2 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl border-purple-500/20 rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-300">Confidence</span>
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">{forecastConfidence}%</div>
            <Progress value={forecastConfidence} className="h-2 mb-2 bg-purple-950/50" />
            <div className="text-xs text-gray-400">847 data points</div>
          </CardContent>
        </Card>

        {/* Runway */}
        <Card className="col-span-2 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border-blue-500/20 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-300">Net Runway</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">7.4mo</div>
            <div className="text-xs text-gray-400 mb-1">Optimized: 8.9mo</div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              +0.3 vs last month
            </Badge>
          </CardContent>
        </Card>

        {/* Burn Multiple */}
        <Card className="col-span-2 bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-xl border-amber-500/20 rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-300">Burn Multiple</span>
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">1.8x</div>
            <div className="text-xs text-gray-400 mb-1">Target: 1.5x</div>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
              14% above target
            </Badge>
          </CardContent>
        </Card>

        {/* Macro Signals */}
        <Card className="col-span-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border-cyan-500/20 rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-300">Macro Signals</span>
              <DollarSign className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="space-y-2">
              {Object.entries(macroSignals).map(([key, data]) =>
              <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 capitalize">{key.replace('USD', ' (EUR/USD)')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{data.value}%</span>
                    <Badge className={cn(
                    "text-xs",
                    data.risk === "green" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                    data.risk === "yellow" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                    "bg-red-500/20 text-red-400 border-red-500/30"
                  )}>
                      {data.exposure}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* TIER 2: FORECAST + DEAL DESK */}
        {/* Strategic Forecast */}
        <Card className="col-span-8 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl hover:shadow-xl transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <LineChartIcon className="w-4 h-4 text-blue-400" />
                Strategic Forecast — Self-Updating Model
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Live
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                  {forecastConfidence}% confident
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-cyan-400 hover:text-cyan-300"
                  onClick={() => setValuationModalOpen(true)}>

                  <Award className="w-3 h-3 mr-1" />
                  Valuation
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(12px)',
                    color: '#fff',
                    fontSize: '11px'
                  }} />

                <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confidenceBand)" />
                <Area type="monotone" dataKey="lower" stroke="none" fill="url(#confidenceBand)" />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 mt-0.5" />
                <div className="text-xs text-gray-300">
                  <strong className="text-purple-300">AI Causal Reasoning:</strong> Cash runway shortened by 0.4 months due to tax remittance timing overlap with payroll. 
                  Revenue forecast adjusted -2.1% from delayed Stripe payout (expected Jan 22 vs Jan 15).
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CFO DEAL DESK */}
        <Card className="col-span-4 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl hover:shadow-xl transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                CFO Deal Desk
              </CardTitle>
              <Select value={dealFilter} onValueChange={setDealFilter}>
                <SelectTrigger className="w-20 h-6 text-xs bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="roi">High ROI</SelectItem>
                  <SelectItem value="liquidity">Liquidity+</SelectItem>
                  <SelectItem value="easy">Easy Wins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {filteredDeals.slice(0, 3).map((deal) =>
            <div
              key={deal.id}
              className={cn(
                "p-3 rounded-lg border cursor-pointer hover:shadow-lg transition-all",
                deal.priority === "high" ? "bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 hover:shadow-red-500/20" :
                "bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30 hover:shadow-amber-500/20"
              )}
              onClick={() => {
                setSelectedDeal(deal);
                setDealDetailOpen(true);
              }}>

                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white mb-1">{deal.title}</div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge className={getRiskColor(deal.risk)}>
                        {deal.risk}
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                        {deal.tag}
                      </Badge>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    {deal.roi}x ROI
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-gray-500">Cash:</span>
                    <span className="text-white font-semibold ml-1">{deal.cashImpact}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Runway:</span>
                    <span className="text-emerald-400 font-semibold ml-1">{deal.runwayEffect}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{deal.timeline}</span>
                  <ChevronRight className="w-3 h-3 text-blue-400" />
                </div>
              </div>
            )}
            <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7 mt-2">
              View All Deals ({dealCards.length})
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* TIER 3: ANALYTICAL DEPTH */}
        {/* Variance DNA */}
        <Card className="col-span-4 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-400" />
              Variance DNA
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {varianceData.map((variance, idx) =>
              <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => {
                setSelectedVariance(variance);
                setVarianceTreeOpen(true);
              }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{variance.dept}</span>
                    <div className="flex items-center gap-1">
                      <Badge className={getVarianceColor(variance.severity)}>
                        {variance.variancePct > 0 ? '+' : ''}{variance.variancePct}%
                      </Badge>
                      <Layers className="w-3 h-3 text-blue-400" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{variance.insight}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
                      r={variance.rValue}
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                      {variance.volatility}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Capital Efficiency */}
        <Card className="col-span-4 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Percent className="w-4 h-4 text-green-400" />
              Capital Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {capitalEfficiency.map((team, idx) =>
              <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{team.team}</span>
                    <Badge className={cn(
                    "text-xs",
                    team.roi > 3 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                    team.roi > 1.5 ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                    "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  )}>
                      {team.roi.toFixed(1)}x ROI
                    </Badge>
                  </div>
                  <Progress value={team.efficiency} className="h-1.5 mb-1" />
                  <div className="text-[10px] text-gray-400">Efficiency: {team.efficiency}%</div>
                </div>
              )}
            </div>
            <div className="mt-3 p-2 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <div className="text-xs text-emerald-300">
                <strong>AI Insight:</strong> Sales team shows 4.0x ROI — consider expansion
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profitability Map */}
        <Card className="col-span-4 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Profitability Map
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="costToRevenue" type="number" stroke="#9ca3af" tick={{ fontSize: 9 }} label={{ value: 'Cost/Rev', position: 'bottom', fontSize: 9, fill: '#9ca3af' }} />
                <YAxis dataKey="margin" type="number" stroke="#9ca3af" tick={{ fontSize: 9 }} label={{ value: 'Margin %', angle: -90, position: 'left', fontSize: 9, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(12px)',
                    color: '#fff',
                    fontSize: '10px'
                  }}
                  cursor={{ strokeDasharray: '3 3' }} />

                <Scatter data={profitabilityMap} fill="#3b82f6">
                  {profitabilityMap.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry.margin > 60 ? '#10b981' : entry.margin > 40 ? '#3b82f6' : '#f59e0b'} />
                  )}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-2 p-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="text-xs text-cyan-300">
                <strong>AI Insight:</strong> Services offering has 82% margin — expansion opportunity
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Correlation Radar */}
        <Card className="col-span-4 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Correlation Radar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <RadarChart data={correlationData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="factor" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <PolarRadiusAxis stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <Radar name="Profit" dataKey="profitCorr" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                <Radar name="Burn" dataKey="burnCorr" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Legend wrapperStyle={{ fontSize: '9px' }} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-2 p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="text-xs text-purple-300">
                <strong>AI Insight:</strong> Sales shows 92% profit correlation — primary growth lever
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trade Tape */}
        <Card className="col-span-4 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Trade Tape — Executed Deals
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {tradeTape.slice(0, 3).map((trade) =>
            <div key={trade.id} className="p-2 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white truncate">{trade.action}</span>
                  <Badge className={cn(
                  "text-xs",
                  trade.status === "outperformed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                  trade.status === "on-track" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                  "bg-red-500/20 text-red-400 border-red-500/30"
                )}>
                    {trade.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">{trade.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Exp: {trade.expectedROI}x</span>
                    <span className="text-white font-semibold">Real: {trade.realizedROI}x</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Simulation Studio */}
        <Card className="col-span-4 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Simulation Studio
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {scenarios.slice(0, 3).map((s, idx) =>
              <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">{s.name}</span>
                    <Badge className={getRiskColor(s.risk)}>
                      {s.risk}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div>
                      <span className="text-gray-400">Runway:</span>
                      <span className="text-white font-semibold ml-1">{s.runway}mo</span>
                    </div>
                    <div>
                      <span className="text-gray-400">IRR:</span>
                      <span className={cn(
                      "font-semibold ml-1",
                      s.irr > 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                        {s.irr > 0 ? '+' : ''}{s.irr}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <Button
                onClick={() => setScenarioSimOpen(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs h-7">

                <Plus className="w-3 h-3 mr-1" />
                New Scenario
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cross-Module Signals */}
        <Card className="col-span-3 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Cross-Module Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {crossModuleInsights.map((insight, idx) =>
            <div
              key={idx}
              className={cn(
                "p-2 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                insight.severity === "high" ? "bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30" :
                insight.severity === "medium" ? "bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30" :
                "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30"
              )}
              onClick={() => setCausalChainOpen(true)}>

                <div className="flex items-start gap-2">
                  <AlertTriangle className={cn(
                  "w-3 h-3 mt-0.5",
                  insight.severity === "high" ? "text-red-400" :
                  insight.severity === "medium" ? "text-amber-400" :
                  "text-blue-400"
                )} />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white mb-1">{insight.module}</div>
                    <div className="text-[10px] text-gray-400 leading-relaxed">{insight.alert}</div>
                  </div>
                  <span className="text-xs font-semibold text-red-400">{insight.impact}</span>
                </div>
              </div>
            )}
            <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-6 mt-2"
            onClick={() => setCausalChainOpen(true)}>
              <GitBranch className="w-3 h-3 mr-1" />
              Causal Chain
            </Button>
          </CardContent>
        </Card>

        {/* Predictive Risk Heatmap */}
        <Card className="bg-slate-950 text-card-foreground rounded-xl border shadow-sm col-span-3 from-red-500/10 to-orange-500/10 backdrop-blur-xl border-red-500/20 hover:shadow-xl hover:shadow-red-500/20 transition-all">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-red-400" />
              Risk Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {riskHeatmap.map((risk, idx) =>
            <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white">{risk.event}</span>
                  <Badge className={getRiskColor(risk.severity)}>
                    {risk.probability}%
                  </Badge>
                </div>
                <div className="text-[10px] text-gray-400 mb-1">{risk.date} ({risk.daysOut}d)</div>
                <div className="text-[10px] text-emerald-400">→ {risk.mitigation}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Story Mode */}
        <Card className="col-span-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border-blue-500/20 rounded-xl cursor-pointer hover:shadow-xl hover:shadow-blue-500/20 transition-all"
        onClick={() => setStoryModeOpen(true)}>

          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Play className="w-4 h-4 text-blue-400" />
                  Story Mode
                </h3>
                <p className="text-xs text-gray-300 mb-2">Narrative with inflection points</p>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                  {storyChapters.length} chapters
                </Badge>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        {/* Watchtower Agent */}
        <Card className="col-span-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border-emerald-500/20 rounded-xl hover:shadow-xl hover:shadow-emerald-500/20 transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Watchtower
              </CardTitle>
              <Badge className={cn(
                "text-xs",
                autonomousAgentActive ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"
              )}>
                {autonomousAgentActive ? "Active" : "Paused"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {agentActivity.slice(0, 2).map((alert, idx) =>
            <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-500">{alert.time}</span>
                  <Badge className={cn(
                  "text-[10px]",
                  alert.status === "processed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                  alert.status === "action_needed" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                  "bg-amber-500/20 text-amber-400 border-amber-500/30"
                )}>
                    {alert.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="text-[10px] text-gray-300 leading-relaxed">{alert.message}</div>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutonomousAgentActive(!autonomousAgentActive)}
              className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-6 mt-2">

              {autonomousAgentActive ? "Pause" : "Activate"}
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* MODALS */}
      
      {/* Deal Detail Modal */}
      <Dialog open={dealDetailOpen} onOpenChange={setDealDetailOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              {selectedDeal?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              AI-powered deal analysis and implementation plan
            </DialogDescription>
          </DialogHeader>

          {selectedDeal &&
          <div className="space-y-6 py-4">
              <div className="grid grid-cols-5 gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                  <div className="text-xs text-gray-400 mb-1">ROI</div>
                  <div className="text-xl font-bold text-emerald-400">{selectedDeal.roi}x</div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                  <div className="text-xs text-gray-400 mb-1">Cash Impact</div>
                  <div className="text-lg font-bold text-white">{selectedDeal.cashImpact}</div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                  <div className="text-xs text-gray-400 mb-1">Runway Effect</div>
                  <div className="text-lg font-bold text-purple-400">{selectedDeal.runwayEffect}</div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                  <div className="text-xs text-gray-400 mb-1">Timeline</div>
                  <div className="text-lg font-bold text-white">{selectedDeal.timeline}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Risk</div>
                  <Badge className={getRiskColor(selectedDeal.risk)}>
                    {selectedDeal.risk.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <div className="font-semibold text-white mb-2">AI Reasoning</div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {selectedDeal.reasoning}
                    </p>
                  </div>
                </div>
              </div>

              {selectedDeal.beforeAfter &&
            <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Before / After Comparison</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30">
                      <div className="text-xs text-gray-400 mb-2">BEFORE</div>
                      {Object.entries(selectedDeal.beforeAfter).map(([key, values]) =>
                  <div key={key} className="text-sm text-white mb-1">
                          {key}: <span className="font-semibold">{Array.isArray(values) ? values[0] : values}</span>
                        </div>
                  )}
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                      <div className="text-xs text-gray-400 mb-2">AFTER</div>
                      {Object.entries(selectedDeal.beforeAfter).map(([key, values]) =>
                  <div key={key} className="text-sm text-white mb-1">
                          {key}: <span className="font-semibold">{Array.isArray(values) ? values[1] : values}</span>
                        </div>
                  )}
                    </div>
                  </div>
                </div>
            }

              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Implementation Steps</h3>
                <div className="space-y-2">
                  {selectedDeal.actions.map((action, idx) =>
                <Button key={idx} variant="outline" className="w-full justify-start bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      {action}
                    </Button>
                )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Execute
                </Button>
                <Button variant="outline" className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10">
                  <Eye className="w-4 h-4 mr-2" />
                  Run Simulation
                </Button>
              </div>
            </div>
          }
        </DialogContent>
      </Dialog>

      {/* Valuation Modal */}
      <Dialog open={valuationModalOpen} onOpenChange={setValuationModalOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Valuation & Benchmark Analysis
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              SaaS comps and growth metrics
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                <div className="text-xs text-gray-400 mb-1">Enterprise Value</div>
                <div className="text-2xl font-bold text-white">${(valuationMetrics.ev / 1000000).toFixed(1)}M</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                <div className="text-xs text-gray-400 mb-1">ARR</div>
                <div className="text-2xl font-bold text-white">${(valuationMetrics.arr / 1000000).toFixed(2)}M</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                <div className="text-xs text-gray-400 mb-1">Multiple</div>
                <div className="text-2xl font-bold text-amber-400">{valuationMetrics.multiple}x</div>
                <div className="text-xs text-gray-500 mt-1">vs {valuationMetrics.industryMedian}x median</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                <div className="text-xs text-gray-400 mb-1">Growth Rate</div>
                <div className="text-2xl font-bold text-emerald-400">{valuationMetrics.growthRate}%</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Benchmark Comparison</h3>
              <div className="space-y-3">
                {valuationMetrics.benchmarkData.map((item, idx) =>
                <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{item.metric}</span>
                      <Badge className={cn(
                      "text-xs",
                      item.percentile > 60 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                      item.percentile > 40 ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                      "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    )}>
                        {item.percentile}th percentile
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">Yours</span>
                          <span className="text-white font-semibold">{item.yours}</span>
                        </div>
                        <Progress value={item.yours / item.industry * 100} className="h-1.5" />
                      </div>
                      <div className="text-xs text-gray-400">
                        Industry: {item.industry}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <div className="font-semibold text-white mb-2">AI Valuation Analysis</div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    You're trading at 8.2x ARR multiple vs 9.5x industry median (48th percentile). Growth rate of 42% is above average (64th percentile), 
                    but burn multiple at 1.8x is higher than target. To reach 10x multiple, focus on improving capital efficiency and extending runway.
                  </p>
                </div>
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Download className="w-4 h-4 mr-2" />
              Export Valuation Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Agent Feed Modal */}
      <Dialog open={agentFeedOpen} onOpenChange={setAgentFeedOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Multi-Agent Finance Cloud — Live Feed
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Autonomous intelligence layer processing financial signals
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {agentActivity.map((activity, idx) =>
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "p-4 rounded-xl border",
                activity.severity === "high" ? "bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30" :
                activity.severity === "medium" ? "bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30" :
                "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30"
              )}>

                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                      {activity.agent}
                    </Badge>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  <Badge className={cn(
                  "text-xs",
                  activity.status === "processed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                  activity.status === "action_needed" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                  "bg-amber-500/20 text-amber-400 border-amber-500/30"
                )}>
                    {activity.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-white leading-relaxed">{activity.message}</p>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Keep existing modals */}
      {/* Causal Chain Modal */}
      <Dialog open={causalChainOpen} onOpenChange={setCausalChainOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-cyan-400" />
              Causal Chain Analysis
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              How changes ripple through the financial system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {causalChain.map((item, idx) =>
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-8">

                <div className={cn(
                "absolute left-0 top-2 w-4 h-4 rounded-full",
                idx === 0 ? "bg-blue-500" :
                idx === causalChain.length - 1 ? "bg-red-500" : "bg-purple-500"
              )}></div>
                {idx < causalChain.length - 1 &&
              <div className="absolute left-2 top-6 w-0.5 h-full bg-white/10"></div>
              }
                
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                      {item.module}
                    </Badge>
                    <span className="text-sm font-semibold text-white">{item.amount}</span>
                  </div>
                  <p className="text-sm text-gray-300">{item.trigger}</p>
                </div>
              </motion.div>
            )}

            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <div className="font-semibold text-white mb-2">AI Analysis</div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    This causal chain shows how a seemingly small payroll increase ($3.2K) cascades through tax obligations (+$620) 
                    and ultimately impacts runway (-0.12mo). The system detected this automatically and flagged it for review.
                  </p>
                </div>
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <Download className="w-4 h-4 mr-2" />
              Export Full Chain Analysis
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Variance Tree Modal */}
      <Dialog open={varianceTreeOpen} onOpenChange={setVarianceTreeOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-400" />
              Variance DNA — {selectedVariance?.dept}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Root cause analysis with regression data
            </DialogDescription>
          </DialogHeader>

          {selectedVariance &&
          <div className="space-y-6 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30">
                  <div className="text-xs text-gray-400 mb-1">Variance $</div>
                  <div className={cn(
                  "text-2xl font-bold",
                  selectedVariance.variance > 0 ? "text-red-400" : "text-emerald-400"
                )}>
                    {selectedVariance.variance > 0 ? '+' : ''}${selectedVariance.variance.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/30">
                  <div className="text-xs text-gray-400 mb-1">Variance %</div>
                  <div className={cn(
                  "text-2xl font-bold",
                  selectedVariance.variance > 0 ? "text-red-400" : "text-emerald-400"
                )}>
                    {selectedVariance.variancePct > 0 ? '+' : ''}{selectedVariance.variancePct}%
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                  <div className="text-xs text-gray-400 mb-1">r-value</div>
                  <div className="text-2xl font-bold text-purple-400">{selectedVariance.rValue}</div>
                  <div className="text-xs text-gray-500 mt-1">{selectedVariance.volatility}</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                  <div className="text-xs text-gray-400 mb-1">Lag Effect</div>
                  <div className="text-lg font-bold text-white">{selectedVariance.lagEffect}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Root Cause Tree</h3>
                <div className="space-y-3">
                  {selectedVariance.rootCause.map((cause, idx) =>
                <div key={idx} className="flex items-center gap-3 pl-4" style={{ paddingLeft: `${idx * 20 + 16}px` }}>
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-sm text-white">{cause}</span>
                      </div>
                    </div>
                )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <div className="font-semibold text-white mb-2">AI Analysis</div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-3">
                      {selectedVariance.dept} exceeded budget by ${selectedVariance.variance.toLocaleString()} due to {selectedVariance.insight}. 
                      High correlation (r={selectedVariance.rValue}) suggests direct causality. Lag effect of {selectedVariance.lagEffect} indicates immediate impact.
                    </p>
                    <div className="text-xs text-purple-300">
                      <strong>Suggested Fix:</strong> Reclassify contractor expenses under OpEx for Q1 baseline adjustment.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-white mb-3">Recommended Actions</div>
                <Button variant="outline" className="w-full justify-start bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Simulate Correction Impact
                </Button>
                <Button variant="outline" className="w-full justify-start bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                  <Send className="w-4 h-4 mr-2" />
                  Notify Finance Team
                </Button>
                <Button variant="outline" className="w-full justify-start bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Adjust Baseline for Next Quarter
                </Button>
              </div>
            </div>
          }
        </DialogContent>
      </Dialog>

      {/* Scenario Simulator Modal */}
      <Dialog open={scenarioSimOpen} onOpenChange={setScenarioSimOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Live Simulation Studio — What-If Analysis
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">Marketing Budget Adjustment</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    defaultValue={[0]}
                    max={30}
                    min={-30}
                    step={5}
                    className="flex-1" />

                  <span className="text-white font-semibold w-12">+10%</span>
                </div>
              </div>

              <div>
                <Label className="text-gray-400">Headcount Change</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    defaultValue={[0]}
                    max={10}
                    min={-5}
                    step={1}
                    className="flex-1" />

                  <span className="text-white font-semibold w-12">+2</span>
                </div>
              </div>

              <div>
                <Label className="text-gray-400">Revenue Growth Assumption</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    defaultValue={[5]}
                    max={20}
                    min={-10}
                    step={1}
                    className="flex-1" />

                  <span className="text-white font-semibold w-12">+5%</span>
                </div>
              </div>

              <div>
                <Label className="text-gray-400">Vendor Payment Delay (days)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    defaultValue={[0]}
                    max={30}
                    min={0}
                    step={5}
                    className="flex-1" />

                  <span className="text-white font-semibold w-12">+10d</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="text-sm font-semibold text-white mb-3">Real-Time Impact</div>
              <div className="grid grid-cols-5 gap-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Δ Runway</div>
                  <div className="text-lg font-bold text-emerald-400">+0.9mo</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Δ EBITDA</div>
                  <div className="text-lg font-bold text-red-400">-$6.2K</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Δ IRR</div>
                  <div className="text-lg font-bold text-purple-400">+8.4%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Δ Cash</div>
                  <div className="text-lg font-bold text-blue-400">+$78K</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Risk Level</div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    Low
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setScenarioSimOpen(false)} className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Save Scenario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Story Mode Modal */}
      <Dialog open={storyModeOpen} onOpenChange={setStoryModeOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-400" />
              Financial Story Mode — Company Journey with Inflection Points
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {storyChapters.map((story, idx) =>
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-8 border-l-2 border-white/10">

                <div className={cn(
                "absolute -left-[9px] w-4 h-4 rounded-full",
                story.sentiment === "positive" ? "bg-emerald-500" :
                story.sentiment === "strategic" ? "bg-purple-500" : "bg-gray-500"
              )}></div>
                
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {story.chapter}
                    </Badge>
                    {story.inflectionPoint &&
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Inflection
                      </Badge>
                  }
                  </div>
                  <p className="text-white font-medium mb-3">{story.narrative}</p>
                  {story.inflectionPoint &&
                <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                      <div className="text-xs text-amber-300 mb-2">
                        <strong>{story.inflectionPoint.date}:</strong> {story.inflectionPoint.event}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {story.inflectionPoint.causal}
                      </div>
                    </div>
                }
                  <div className="flex items-center gap-3 flex-wrap">
                    {Object.entries(story.metrics).map(([key, value]) =>
                  <Badge key={key} className="bg-white/5 text-gray-300 border-white/10 text-xs">
                        {key}: {value}
                      </Badge>
                  )}
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className="flex gap-2">
              <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                <Download className="w-4 h-4 mr-2" />
                Export Investor Deck (PDF)
              </Button>
              <Button variant="outline" className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10">
                <Send className="w-4 h-4 mr-2" />
                Send to Board
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Copilot Dock - Enhanced */}
      <AnimatePresence>
        {copilotOpen &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 w-[420px] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50">

            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-white">FP&A Copilot</h3>
                <Badge className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-purple-500/30 text-xs">
                  Enhanced
                </Badge>
              </div>
              <Button
              variant="ghost"
              size="icon"
              onClick={() => setCopilotOpen(false)}
              className="text-gray-400 hover:text-white h-6 w-6">

                ×
              </Button>
            </div>

            <div className="p-4 h-72 overflow-y-auto space-y-3">
              {copilotMessages.length === 0 ?
            <div className="text-center text-gray-400 text-sm py-8">
                  <p className="mb-4">Ask me anything about forecasts, benchmarks, valuation, or scenarios...</p>
                  <div className="space-y-2">
                    <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCopilotInput("Can we afford to hire 3 more sales reps?");
                    handleCopilotSend();
                  }}
                  className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs justify-start">

                      💼 Can we afford 3 new sales reps?
                    </Button>
                    <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCopilotInput("Compare our metrics to SaaS benchmarks");
                    handleCopilotSend();
                  }}
                  className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs justify-start">

                      📊 Compare to SaaS benchmarks
                    </Button>
                    <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCopilotInput("Explain our current valuation");
                    handleCopilotSend();
                  }}
                  className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs justify-start">

                      💎 Explain valuation metrics
                    </Button>
                    <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCopilotInput("Generate board memo for Q4");
                    handleCopilotSend();
                  }}
                  className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs justify-start">

                      📝 Generate board memo
                    </Button>
                  </div>
                </div> :

            copilotMessages.map((msg, idx) =>
            <div key={idx} className={cn(
              "p-3 rounded-lg",
              msg.role === "user" ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 ml-8 border border-blue-500/30" : "bg-white/5 mr-8 border border-white/10"
            )}>
                    <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                    {msg.actions &&
              <div className="flex gap-2 mt-2 flex-wrap">
                        {msg.actions.map((action, i) =>
                <Button key={i} variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-6">
                            {action}
                          </Button>
                )}
                      </div>
              }
                  </div>
            )
            }
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCopilotSend()}
                placeholder="Ask about forecasts, benchmarks, scenarios..."
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-sm" />

                <Button
                onClick={handleCopilotSend}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">

                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}