import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, Search,
  MessageCircle, FileText, CheckCircle, Clock, ArrowRight, Info, Sparkles,
  Play, AlertCircle, Target, Download, Tag, Split, Send, FileCheck, Keyboard, Copy, Bell, Plus, ChevronDown, X,
  Settings, AlertTriangle, Folder, History // NEW ICONS
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SankeyDiagram from "../components/SankeyDiagram";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion"; // Assuming framer-motion is installed for modal animations

export default function CashFlow() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("inflows");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeRangeFilter, setTimeRangeFilter] = useState("this_month");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  const [tagsFilter, setTagsFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showForecast, setShowForecast] = useState(true);

  // New state variables for advanced inflows features
  const [narrativeMode, setNarrativeMode] = useState(false);
  const [auditView, setAuditView] = useState(false);
  const [showRevenueFlow, setShowRevenueFlow] = useState(false);
  const [flowViewMode, setFlowViewMode] = useState("gross");
  const [selectedRows, setSelectedRows] = useState([]);
  const [isExplainingFlow, setIsExplainingFlow] = useState(false);
  const [flowExplanation, setFlowExplanation] = useState(null);

  // Outflows specific filters (added for enhancement)
  const [outflowCategoryFilter, setOutflowCategoryFilter] = useState("all");
  const [outflowStatusFilter, setOutflowStatusFilter] = useState("all");
  const [outflowTagsFilter, setOutflowTagsFilter] = useState("all");
  const [outflowTimeRangeFilter, setOutflowTimeRangeFilter] = useState("this_month");
  const [vendorHealthFilter, setVendorHealthFilter] = useState("all");

  // NEW: Cash Impact & Anomalies states
  const [showCashImpact, setShowCashImpact] = useState(true);
  const [showImpactForecast, setShowImpactForecast] = useState(false);
  const [cashImpactDelta, setCashImpactDelta] = useState(0); // For dynamic updates
  const [showCostPatterns, setShowCostPatterns] = useState(false);
  const [hoveredBill, setHoveredBill] = useState(null); // Used for Bill Impact Preview
  const [showImpactPreview, setShowImpactPreview] = useState(false); // Controls visibility of the Bill Impact Preview Modal
  const [selectedVendor, setSelectedVendor] = useState(null); // For the new vendor detail sheet
  const [vendorCopilotQuery, setVendorCopilotQuery] = useState(""); // For the AI copilot in vendor sheet

  // NEW: Net Flow Tab states
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [netFlowRange, setNetFlowRange] = useState("7D"); // Changed from "30D" to "7D" based on outline
  const [sourceTypeFilter, setSourceTypeFilter] = useState("all");
  const [hoveredNetFlowDate, setHoveredNetFlowDate] = useState(null);
  const [selectedDayStatement, setSelectedDayStatement] = useState(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [showAISummary, setShowAISummary] = useState(true);
  const [scenarioType, setScenarioType] = useState("revenue_drop");
  const [scenarioPercent, setScenarioPercent] = useState(0);
  const [scenarioDuration, setScenarioDuration] = useState("1_month");

  // NEW: Forecast Tab states
  const [forecastRange, setForecastRange] = useState("6W");
  const [forecastChartView, setForecastChartView] = useState("cash_flow");
  const [showConfidenceHeatmap, setShowConfidenceHeatmap] = useState(false);
  const [showScenarioComparison, setShowScenarioComparison] = useState(false);
  const [showForecastNarrative, setShowForecastNarrative] = useState(false);
  const [showScenarioDrawer, setShowScenarioDrawer] = useState(false); // For individual movement simulation
  const [selectedMovement, setSelectedMovement] = useState(null); // The movement clicked for simulation
  const [expectedMovementCategory, setExpectedMovementCategory] = useState("all");
  const [expectedMovementRisk, setExpectedMovementRisk] = useState("all");
  const [expectedMovementTime, setExpectedMovementTime] = useState("30D");
  const [showBuildForecastModal, setShowBuildForecastModal] = useState(false);

  // NEW: Forecast Engine Controls state
  const [showEngineControls, setShowEngineControls] = useState(false);
  const [forecastSensitivity, setForecastSensitivity] = useState(50);
  const [confidenceWeight, setConfidenceWeight] = useState(50);
  const [aiAdaptiveness, setAiAdaptiveness] = useState(50);
  const [smoothingMode, setSmoothingMode] = useState("rolling");
  const [showDeltaMap, setShowDeltaMap] = useState(false);
  const [deltaMapView, setDeltaMapView] = useState("absolute");
  const [showScenarioLibrary, setShowScenarioLibrary] = useState(false);
  const [showExplainForecast, setShowExplainForecast] = useState(false);
  const [showRevenueSimulation, setShowRevenueSimulation] = useState(false);
  const [newRevenueChannel, setNewRevenueChannel] = useState({
    name: "",
    start_week: 4,
    inflow: 12000,
    confidence: 65
  });
  const [showAILookback, setShowAILookback] = useState(false);
  const [macroStressMode, setMacroStressMode] = useState(false);
  const [macroInputs, setMacroInputs] = useState({
    interestRate: 0.5,
    inflation: 1.0,
    stripeFee: 0.2
  });
  const [syncedFPAPlan, setSyncedFPAPlan] = useState(null);


  // Mock Metrics Data
  const metrics = {
    totalInflows: 89450,
    totalOutflows: 51220,
    netCashFlow: 38230,
    upcomingPayments: 15400,
    trend: [12000, 15000, 13500, 18000, 16500, 14000, 17000]
  };

  // Enhanced Inflows Metrics
  const inflowsMetrics = {
    totalInflows: 89450,
    avgPaymentSize: 17890,
    payoutsReceived: 5,
    feeRatio: 9.8,
    last3MonthsTrend: [75000, 82000, 89450]
  };

  // NEW: Cash Impact Data
  const cashImpact = {
    cashOnHand: 246680,
    runway: 14.2,
    netOutflowChange: -1250,
    lastUpdated: new Date()
  };

  // NEW: Cost Patterns & Anomalies
  const costPatterns = [
    {
      id: 1,
      title: "AWS spend increases 3 days before payroll — cyclical pattern detected",
      severity: "info",
      category: "Cyclical"
    },
    {
      id: 2,
      title: "Legal fees spike every quarter — retainer-based",
      severity: "info",
      category: "Recurring"
    },
    {
      id: 3,
      title: "Office Depot charges vary >50% MoM — inconsistent recurring spend",
      severity: "warning",
      category: "Anomaly"
    }
  ];

  // NEW: Bill Impact Calculator
  const calculateBillImpact = (bill) => {
    // Mock calculation based on bill amount
    const baseRunwayReduction = bill.amount / 100000; // Small reduction per $100k
    const baseOpexIncrease = bill.amount / 50000; // % increase for a $50k bill
    const riskLevel = bill.amount > 5000 ? "medium" : "low";

    return {
      runwayReduction: parseFloat(baseRunwayReduction.toFixed(1)),
      opexIncrease: parseFloat(baseOpexIncrease.toFixed(1)),
      cashReduction: bill.amount,
      riskLevel: riskLevel
    };
  };

  // Mock Inflows Data (Enhanced)
  const inflows = [
    {
      id: 1,
      date: "2026-02-10",
      source: "Stripe",
      customer: "Acme Corp",
      gross: 12500,
      fees: 375,
      net: 12125,
      status: "Paid",
      channel: "Stripe",
      customer_type: "Enterprise",
      tags: ["Recurring", "Subscription"],
      payout_delay: 2,
      transaction_id: "txn_stripe_12345",
      invoice_ref: "INV-001"
    },
    {
      id: 2,
      date: "2026-02-09",
      source: "DoorDash",
      customer: "Jane Doe",
      gross: 850,
      fees: 85,
      net: 765,
      status: "Paid",
      channel: "DoorDash",
      customer_type: "Consumer",
      tags: ["Marketplace"],
      payout_delay: 6,
      transaction_id: "txn_dd_67890",
      invoice_ref: "INV-002"
    },
    {
      id: 3,
      date: "2026-02-08",
      source: "App Store",
      customer: "Beta Inc",
      gross: 4200,
      fees: 1260,
      net: 2940,
      status: "Paid",
      channel: "App Store",
      customer_type: "Enterprise",
      tags: ["Subscription"],
      payout_delay: 3,
      transaction_id: "txn_app_24680",
      invoice_ref: "INV-003"
    },
    {
      id: 4,
      date: "2026-02-07",
      source: "AWS",
      customer: "Gamma LLC",
      gross: 8900,
      fees: 267,
      net: 8633,
      status: "Paid",
      channel: "AWS",
      customer_type: "Enterprise",
      tags: ["Recurring"],
      payout_delay: 7,
      transaction_id: "txn_aws_13579",
      invoice_ref: "INV-004"
    },
    {
      id: 5,
      date: "2026-02-06",
      source: "Stripe",
      customer: "Delta Corp",
      gross: 3400,
      fees: 102,
      net: 3298,
      status: "Pending",
      channel: "Stripe",
      customer_type: "Enterprise",
      tags: ["Subscription"],
      payout_delay: 1,
      transaction_id: "txn_stripe_97531",
      invoice_ref: "INV-005"
    },
  ];

  // Mock Outflows Data
  const outflows = [
    { id: 1, vendor: "AWS", due_date: "2026-02-18", category: "COGS", amount: 3200, status: "Approved", tags: "recurring", bill_id: "BILL-001" },
    { id: 2, vendor: "Office Depot", due_date: "2026-02-15", category: "OpEx", amount: 450, status: "Draft", tags: "", bill_id: "BILL-002" },
    { id: 3, vendor: "Legal Co", due_date: "2026-02-20", category: "OpEx", amount: 8500, status: "Scheduled", tags: "legal", bill_id: "BILL-003" },
    { id: 4, vendor: "WeWork", due_date: "2026-02-05", category: "OpEx", amount: 5200, status: "Paid", tags: "recurring", bill_id: "BILL-004" },
    { id: 5, vendor: "Salesforce", due_date: "2026-02-22", category: "OpEx", amount: 1200, status: "Approved", tags: "recurring,saas", bill_id: "BILL-005" },
    { id: 6, vendor: "Google Ads", due_date: "2026-02-21", category: "Marketing", amount: 2500, status: "Scheduled", tags: "recurring", bill_id: "BILL-006" },
    { id: 7, vendor: "ServerSpace", due_date: "2026-02-01", category: "COGS", amount: 1800, status: "Paid", tags: "cloud", bill_id: "BILL-007" },
    { id: 8, vendor: "Stripe", due_date: "2026-02-04", category: "Fees", amount: 375, status: "Paid", tags: "payment processor", bill_id: "BILL-008" },
    { id: 9, vendor: "Payroll Inc", due_date: "2026-02-10", category: "Payroll", amount: 25000, status: "Approved", tags: "payroll", bill_id: "BILL-009" },
    { id: 10, vendor: "Legal Co", due_date: "2026-01-31", category: "OpEx", amount: 6000, status: "Overdue", tags: "legal", bill_id: "BILL-010" },
  ];

  // Mock Net Flow Data (UPDATED)
  const netFlowData = [
    { date: "Feb 4", inflows: 12500, outflows: 8900, net: 3600, balance: 232000, cumulativeNet: 3600, keyEvent: null, ocf: 15000, icf: -2000, fcf: 13000, projectedHigh: 235000, projectedLow: 230000, momentum_index: 2000 },
    { date: "Feb 5", inflows: 8200, outflows: 15300, net: -7100, balance: 224900, cumulativeNet: -3500, keyEvent: "Payroll Run", ocf: 12000, icf: -1500, fcf: 10500, projectedHigh: 228000, projectedLow: 222000, momentum_index: -3000 },
    { date: "Feb 6", inflows: 15800, outflows: 9400, net: 6400, balance: 231300, cumulativeNet: 2900, keyEvent: "Stripe Payout", ocf: 18000, icf: -3000, fcf: 15000, projectedHigh: 235000, projectedLow: 228000, momentum_index: 4000 },
    { date: "Feb 7", inflows: 9500, outflows: 11200, net: -1700, balance: 229600, cumulativeNet: 1200, keyEvent: null, ocf: 13000, icf: -2500, fcf: 10500, projectedHigh: 233000, projectedLow: 227000, momentum_index: -1000 },
    { date: "Feb 8", inflows: 7200, outflows: 12800, net: -5600, balance: 224000, cumulativeNet: -4400, keyEvent: "AWS Bill", ocf: 10000, icf: -3500, fcf: 6500, projectedHigh: 228000, projectedLow: 221000, momentum_index: -2500 },
    { date: "Feb 9", inflows: 18950, outflows: 8200, net: 10750, balance: 234750, cumulativeNet: 6350, keyEvent: "App Store Payout", ocf: 22000, icf: -1000, fcf: 21000, projectedHigh: 238000, projectedLow: 232000, momentum_index: 5000 },
    { date: "Feb 10", inflows: 14300, outflows: 10500, net: 3800, balance: 238550, cumulativeNet: 10150, keyEvent: null, ocf: 17000, icf: -2000, fcf: 15000, projectedHigh: 242000, projectedLow: 236000, momentum_index: 1000 },
  ];

  // Mock Forecast Data
  const forecastData = [
    { week: "Week 1", projected: 248000, low: 240000, high: 255000, confidence: 90 },
    { week: "Week 2", projected: 252000, low: 244000, high: 260000, confidence: 88 },
    { week: "Week 3", projected: 245000, low: 237000, high: 253000, confidence: 85 },
    { week: "Week 4", projected: 250000, low: 242000, high: 258000, confidence: 82 },
    { week: "Week 5", projected: 255000, low: 247000, high: 263000, confidence: 80 },
    { week: "Week 6", projected: 260000, low: 252000, high: 268000, confidence: 78 },
  ];

  // Mock Upcoming Movements
  const upcomingMovements = [
    { date: "2026-02-28", type: "outflow", title: "Payroll Run", amount: 42500, category: "Payroll" },
    { date: "2026-02-20", type: "outflow", title: "Legal Co Payment", amount: 8500, category: "OpEx" },
    { date: "2026-02-17", type: "inflow", title: "Stripe Payout", amount: 15200, category: "Revenue" },
    { date: "2026-02-22", type: "outflow", title: "AWS Bill", amount: 3200, category: "COGS" },
  ];

  // Top Customers
  const topCustomers = [
    { name: "Acme Corp", total: 45000 },
    { name: "Beta Inc", total: 32000 },
    { name: "Gamma LLC", total: 28500 },
  ];

  // Spend by Category
  const spendByCategory = [
    { name: "OpEx", value: 15350, color: "#f59e0b" },
    { name: "COGS", value: 3200, color: "#3b82f6" },
    { name: "Payroll", value: 42500, color: "#8b5cf6" },
    { name: "Marketing", value: 2500, color: "#a855f7" },
    { name: "Fees", value: 375, color: "#eab308" },
    { name: "Taxes", value: 0, color: "#10b981" },
  ];

  // Top Vendors
  const topVendors = [
    { name: "Legal Co", amount: 8500 },
    { name: "WeWork", amount: 5200 },
    { name: "AWS", amount: 3200 },
    { name: "Salesforce", amount: 1200 },
    { name: "Office Depot", amount: 850 },
  ];

  // Revenue Insights
  const revenueInsights = {
    topChannel: { name: "Stripe", amount: 45000, percentage: 51 },
    fastestPayer: { name: "Acme Corp", avgDays: 2 },
    highestFeeSource: { name: "App Store", feePercent: 30 }
  };

  // AI Insights
  const aiInsights = [
    { id: 1, text: "Fees trending ↑ 8% vs last month — mostly App Store.", severity: "warning" },
    { id: 2, text: "2 payouts delayed over 5 days: DoorDash, AWS.", severity: "info" },
    { id: 3, text: "Recurring revenue up 12% MoM from Acme and Gamma.", severity: "success" }
  ];

  // Customer Historical Data
  const customerHistory = {
    "Acme Corp": {
      totalYTD: 145000,
      avgDelay: 2,
      channels: ["Stripe", "AWS"],
      monthlyData: [20000, 22000, 24000, 26000, 25000, 28000],
      tags: ["Recurring", "Enterprise"],
      predictabilityScore: 95
    },
    "Beta Inc": {
      totalYTD: 48000,
      avgDelay: 3,
      channels: ["App Store"],
      monthlyData: [6000, 7000, 8000, 9000, 8500, 9500],
      tags: ["Subscription", "Enterprise"],
      predictabilityScore: 88
    },
    "Jane Doe": {
      totalYTD: 15000,
      avgDelay: 1,
      channels: ["DoorDash"],
      monthlyData: [2000, 2500, 3000, 3500, 4000, 4500],
      tags: ["Consumer"],
      predictabilityScore: 98
    },
    "Gamma LLC": {
      totalYTD: 110000,
      avgDelay: 4,
      channels: ["AWS"],
      monthlyData: [15000, 16000, 17000, 18000, 19000, 20000],
      tags: ["Recurring", "Enterprise"],
      predictabilityScore: 92
    },
    "Delta Corp": {
      totalYTD: 30000,
      avgDelay: 3,
      channels: ["Stripe"],
      monthlyData: [5000, 5500, 6000, 6500, 7000, 7500],
      tags: ["Subscription", "Enterprise"],
      predictabilityScore: 85
    }
  };

  // Revenue by Channel (for analysis)
  const revenueByChannel = [
    { channel: "Stripe", amount: 45000 },
    { channel: "DoorDash", amount: 12500 },
    { channel: "App Store", amount: 18950 },
    { channel: "AWS", amount: 13000 }
  ];

  // Top Customers by Growth
  const topGrowthCustomers = [
    { name: "Acme Corp", lastMonth: 24000, thisMonth: 28000, growth: 16.7 },
    { name: "Beta Inc", lastMonth: 8500, thisMonth: 9500, growth: 11.8 },
    { name: "Gamma LLC", lastMonth: 7800, thisMonth: 8900, growth: 14.1 }
  ];

  // Forecast Data
  const inflowsForecast = {
    projectedTotal: 92400,
    growthPercent: 4.2,
    weeklyData: [
      { week: "Week 1", projected: 22000 },
      { week: "Week 2", projected: 23500 },
      { week: "Week 3", projected: 22800 },
      { week: "Week 4", projected: 24100 }
    ]
  };

  // Predicted Inflow Events
  const predictedInflows = [
    { date: "2026-02-17", source: "Stripe", amount: 13500, confidence: "High", type: "Recurring" },
    { date: "2026-02-18", source: "DoorDash", amount: 920, confidence: "Medium", type: "Variable" },
    { date: "2026-02-19", source: "AWS", amount: 8900, confidence: "High", type: "Monthly" },
    { date: "2026-02-20", source: "App Store", amount: 4200, confidence: "High", type: "Subscription" },
    { date: "2026-02-22", source: "Stripe", amount: 11200, confidence: "Medium", type: "Recurring" },
  ];

  // Customer Health Scores
  const customerHealthScores = {
    "Acme Corp": 95,
    "Beta Inc": 88,
    "Jane Doe": 72,
    "Gamma LLC": 85,
    "Delta Corp": 55
  };

  // At-Risk Customers
  const atRiskCustomers = [
    { name: "Delta Corp", score: 55, issue: "Payment delays increasing", lastPayment: "2026-02-06" }
  ];

  // NRR Data
  const nrrData = {
    current: 112,
    change: 3.4,
    expansions: 6200,
    contractions: -1400,
    churn: -800
  };

  // Revenue Flow Data (Sankey-style)
  // This mock data is illustrative. A real Sankey component would take 'nodes' and 'links'.
  // For demonstration, we'll keep it simple for the SankeyDiagram component to interpret.
  const revenueFlowData = {
    nodes: [
      { id: 'Stripe', type: 'source' },
      { id: 'DoorDash', type: 'source' },
      { id: 'App Store', type: 'source' },
      { id: 'AWS', type: 'source' },

      { id: 'Acme Corp', type: 'customer' },
      { id: 'Beta Inc', type: 'customer' },
      { id: 'Gamma LLC', type: 'customer' },
      { id: 'Delta Corp', type: 'customer' },
      { id: 'Jane Doe', type: 'customer' },

      { id: 'Subscription', type: 'category' },
      { id: 'Marketplace', type: 'category' },
      { id: 'Cloud Income', type: 'category' },
      { id: 'One-Time', type: 'category' },
    ],
    links: [
      // Source to Customer
      { source: 'Stripe', target: 'Acme Corp', value: 12500, fees: 375 },
      { source: 'Stripe', target: 'Delta Corp', value: 3400, fees: 102 },
      { source: 'DoorDash', target: 'Jane Doe', value: 850, fees: 85 },
      { source: 'App Store', target: 'Beta Inc', value: 4200, fees: 1260 },
      { source: 'AWS', target: 'Gamma LLC', value: 8900, fees: 267 },

      // Customer to Category (simplified for mock, typically based on transaction types)
      { source: 'Acme Corp', target: 'Subscription', value: 12125, fees: 0 }, // net value
      { source: 'Jane Doe', target: 'Marketplace', value: 765, fees: 0 },
      { source: 'Beta Inc', target: 'Subscription', value: 2940, fees: 0 },
      { source: 'Gamma LLC', target: 'Cloud Income', value: 8633, fees: 0 },
      { source: 'Delta Corp', target: 'Subscription', value: 3298, fees: 0 },
    ]
  };

  const handleExplainFlow = async () => {
    setIsExplainingFlow(true);
    setFlowExplanation(null);

    try {
      const conversation = await base44.agents.createConversation({
        agent_name: "revenue_flow_analyzer",
        metadata: {
          name: "Revenue Flow Analysis",
          description: "Analyzing current revenue flow patterns"
        }
      });

      const flowContext = "Analyze this revenue flow:\n\nPayment Sources:\n- Stripe: $45,000 (51% of total)\n- DoorDash: $12,500 (14%)\n- App Store: $18,950 (21%)\n- AWS: $13,000 (14%)\n\nKey Customer Flows:\n- Acme Corp: $12,500 from Stripe to Subscription revenue\n- Beta Inc: $4,200 from App Store to Subscription revenue\n- Gamma LLC: $8,900 from AWS to Cloud Income\n- Delta Corp: $3,400 from Stripe to Subscription revenue\n- Jane Doe: $850 from DoorDash to Marketplace revenue\n\nCurrent view mode: " + flowViewMode + "\n\nPlease explain:\n1. What this flow tells us about our revenue structure\n2. Channel concentration and diversification\n3. Customer-channel relationships\n4. Any risks or opportunities you see\n5. Optimization suggestions";

      await base44.agents.addMessage(conversation.id, {
        role: "user",
        content: flowContext
      });

      let unsubscribeFunction = null;

      unsubscribeFunction = base44.agents.subscribeToConversation(
        conversation.id,
        (data) => {
          try {
            if (!data) {
              console.log("No data received from subscription");
              return;
            }

            if (!data.messages) {
              console.log("No messages in data");
              return;
            }

            if (!Array.isArray(data.messages)) {
              console.log("Messages is not an array", typeof data.messages);
              return;
            }

            if (data.messages.length === 0) {
              console.log("Messages array is empty");
              return;
            }

            const lastMessage = data.messages[data.messages.length - 1];

            if (lastMessage && lastMessage.role === "assistant" && lastMessage.content) {
              setFlowExplanation({
                conversationId: conversation.id,
                content: lastMessage.content
              });
              setIsExplainingFlow(false);

              if (unsubscribeFunction) {
                unsubscribeFunction();
              }
            }
          } catch (subError) {
            console.error("Error in subscription callback:", subError);
          }
        }
      );

      setTimeout(() => {
        setIsExplainingFlow(false);
        if (unsubscribeFunction) {
          try {
            unsubscribeFunction();
          } catch (e) {
            console.error("Error unsubscribing:", e);
          }
        }
      }, 30000);

    } catch (error) {
      console.error("Error explaining flow:", error);
      setFlowExplanation({
        conversationId: null,
        content: "I encountered an error analyzing the revenue flow. This could be because the agent is still initializing. Please try again in a moment."
      });
      setIsExplainingFlow(false);
    }
  };

  const filteredInflows = inflows.filter(item => {
    const matchesChannel = channelFilter === "all" || item.channel === channelFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCustomerType = customerTypeFilter === "all" || item.customer_type === customerTypeFilter;
    const matchesTags = tagsFilter === "all" || (item.tags && item.tags.some(tag => tag === tagsFilter));
    const matchesSearch = searchQuery === "" ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesStatus && matchesCustomerType && matchesTags && matchesSearch;
  });

  const filteredOutflows = outflows.filter(item => {
    const matchesCategory = outflowCategoryFilter === "all" || item.category === outflowCategoryFilter;
    const matchesStatus = outflowStatusFilter === "all" || item.status === outflowStatusFilter;
    const matchesTags = outflowTagsFilter === "all" || (item.tags && item.tags.includes(outflowTagsFilter)); // Simple contains check for now
    const matchesSearch = searchQuery === "" ||
      item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.toLowerCase().includes(searchQuery.toLowerCase()));

    // Time range filter (simplified for mock, assuming 'this_month' is current month)
    const itemDate = new Date(item.due_date);
    const now = new Date();
    const isThisMonth = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    const matchesTimeRange = outflowTimeRangeFilter === "all" || (outflowTimeRangeFilter === "this_month" && isThisMonth);

    // Vendor Health filter (simplified based on hardcoded health scores, needs actual data)
    const vendorHealth = item.vendor === "AWS" ? 85 : item.vendor === "Legal Co" ? 65 : 90;
    const matchesVendorHealth = vendorHealthFilter === "all" ||
      (vendorHealthFilter === "stable" && vendorHealth >= 80) ||
      (vendorHealthFilter === "at_risk" && vendorHealth < 80) ||
      (vendorHealthFilter === "new" && false); // Placeholder for new vendor logic

    return matchesCategory && matchesStatus && matchesTags && matchesSearch && matchesTimeRange && matchesVendorHealth;
  });

  const getHealthColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const handleRowSelect = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const cashBalanceData = [
    { month: "Jan 10", balance: 180000 },
    { month: "Jan 17", balance: 195000 },
    { month: "Jan 24", balance: 210000 },
    { month: "Jan 31", balance: 225000 },
    { month: "Feb 7", balance: 238000 },
  ];


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Cash Flow</h2>
        <p className="text-gray-400 mt-1">Monitor money movement and forecast</p>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Total Inflows (MTD)</span>
              <Info className="w-3 h-3 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">${metrics.totalInflows.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+8.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Total Outflows (MTD)</span>
              <Info className="w-3 h-3 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-red-400">${metrics.totalOutflows.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-red-400 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+5.1%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Net Cash Flow</span>
              <Info className="w-3 h-3 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-white">${metrics.netCashFlow.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12.8%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">7-Day Trend</span>
            </div>
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.trend.map((val, idx) => ({ value: val }))}>
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Upcoming Payments</span>
              <Info className="w-3 h-3 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-orange-400">${metrics.upcomingPayments.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Next 7 days</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1">
          <TabsTrigger value="inflows" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white text-gray-400 rounded-lg">
            Inflows
          </TabsTrigger>
          <TabsTrigger value="outflows" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-400 rounded-lg">
            Outflows
          </TabsTrigger>
          <TabsTrigger value="netflow" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 rounded-lg">
            Net Flow
          </TabsTrigger>
          <TabsTrigger value="forecast" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-violet-600 data-[state=active]:text-white text-gray-400 rounded-lg">
            Forecast
          </TabsTrigger>
        </TabsList>

        {/* INFLOWS TAB - ENHANCED */}
        <TabsContent value="inflows" className="mt-6 space-y-6">

          {/* Top Controls Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant={narrativeMode ? "default" : "outline"}
                size="sm"
                onClick={() => setNarrativeMode(!narrativeMode)}
                className={narrativeMode ?
                  "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 text-white" :
                  "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }
              >
                <Play className="w-3 h-3 mr-1" />
                Narrative Mode
              </Button>

              <Button
                variant={auditView ? "default" : "outline"}
                size="sm"
                onClick={() => setAuditView(!auditView)}
                className={auditView ?
                  "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0 text-white" :
                  "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }
              >
                <FileCheck className="w-3 h-3 mr-1" />
                Audit View
              </Button>

              {selectedRows.length > 0 && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {selectedRows.length} selected
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {auditView && (
                <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-7 text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Export CSV
                </Button>
              )}
              <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-7 text-xs">
                <Keyboard className="w-3 h-3 mr-1" />
                Press / to search
              </Button>
            </div>
          </div>

          {/* Narrative Mode View */}
          {narrativeMode ? (
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Revenue Narrative
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed">
                    This month, total inflows grew <span className="font-bold text-emerald-400">8.2%</span>,
                    driven by Stripe (<span className="text-emerald-400">+12%</span>) and recurring payments from Acme Corp.
                    Fees rose slightly (<span className="text-amber-400">0.8%</span>), mainly from App Store transactions.
                    Two payouts delayed more than 5 days, but net cash efficiency remains strong at
                    <span className="font-bold text-white"> 91%</span>.
                  </p>
                  <p className="text-gray-300 leading-relaxed mt-4">
                    Key trends: Recurring revenue accounts for <span className="font-bold text-white">68%</span> of total inflows.
                    Enterprise customers show <span className="text-emerald-400">14% growth</span> MoM.
                    DoorDash marketplace revenue stabilized after Q3 dip.
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                    <FileText className="w-4 h-4 mr-2" />
                    Summarize for Investor Update
                  </Button>
                  <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                    <Send className="w-4 h-4 mr-2" />
                    Draft Slack Summary
                  </Button>
                  <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={() => setNarrativeMode(false)}>
                    View Data Tables
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Enhanced Top Summary */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-400 mb-1">Avg Payment Size</div>
                    <div className="text-xl font-bold text-white">${inflowsMetrics.avgPaymentSize.toLocaleString()}</div>
                    <div className="text-xs text-emerald-400 mt-1">+5.2% vs last month</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-400 mb-1"># of Payouts Received</div>
                    <div className="text-xl font-bold text-white">{inflowsMetrics.payoutsReceived}</div>
                    <div className="text-xs text-gray-400 mt-1">This month</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardContent className="p-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 cursor-help">
                            <div className="text-xs text-gray-400 mb-1">Fee Ratio</div>
                            <Info className="w-3 h-3 text-gray-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900 border-white/10 text-white">
                          <p className="text-xs">Total fees ÷ Total gross inflows</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="text-xl font-bold text-white">{inflowsMetrics.feeRatio}%</div>
                    <div className="text-xs text-orange-400 mt-1">+0.8% vs last month</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-400 mb-1">3-Month Trend</div>
                    <div className="h-12 mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={inflowsMetrics.last3MonthsTrend.map((val, idx) => ({ value: val, month: idx }))}>
                          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid - REORGANIZED */}
              <div className="grid grid-cols-12 gap-6">
                {/* Left: Filters + Table + Key Metrics (now takes 8 columns) */}
                <div className="col-span-8 space-y-4">
                  {/* Advanced Filters */}
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">Filters</span>
                        <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7">
                          Save Filter
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        <Select value={channelFilter} onValueChange={setChannelFilter}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8">
                            <SelectValue placeholder="Channel" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                            <SelectItem value="all">All Channels</SelectItem>
                            <SelectItem value="Stripe">Stripe</SelectItem>
                            <SelectItem value="DoorDash">DoorDash</SelectItem>
                            <SelectItem value="App Store">App Store</SelectItem>
                            <SelectItem value="AWS">AWS</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8">
                            <SelectValue placeholder="Time Range" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                            <SelectItem value="this_month">This Month</SelectItem>
                            <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8">
                            <SelectValue placeholder="Customer Type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="Consumer">Consumer</SelectItem>
                            <SelectItem value="Enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={tagsFilter} onValueChange={setTagsFilter}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8">
                            <SelectValue placeholder="Tags" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                            <SelectItem value="all">All Tags</SelectItem>
                            <SelectItem value="Marketplace">Marketplace</SelectItem>
                            <SelectItem value="Recurring">Recurring</SelectItem>
                            <SelectItem value="Subscription">Subscription</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="relative mt-3">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                        <Input
                          placeholder="Search customers or sources..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-xs h-9"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Revenue Insights Bar */}
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400 text-xs">
                          Top Channel: {revenueInsights.topChannel.name} (${revenueInsights.topChannel.amount.toLocaleString()}, {revenueInsights.topChannel.percentage}%)
                        </Badge>
                        <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs">
                          Fastest Payer: {revenueInsights.fastestPayer.name} (Avg {revenueInsights.fastestPayer.avgDays} days)
                        </Badge>
                        <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30 text-orange-400 text-xs">
                          Highest Fee Source: {revenueInsights.highestFeeSource.name} ({revenueInsights.highestFeeSource.feePercent}%)
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Receipts & Revenue Table */}
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">Receipts & Revenue</CardTitle>
                        {selectedRows.length > 0 && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-7 text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              Tag as Recurring
                            </Button>
                            <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-7 text-xs">
                              <FileCheck className="w-3 h-3 mr-1" />
                              Mark Reconciled
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-white/10 hover:bg-transparent">
                              {auditView && (
                                <TableHead className="text-gray-400 text-xs w-12">
                                  <input
                                    type="checkbox"
                                    className="rounded bg-white/5 border-white/30 text-blue-500 focus:ring-blue-500"
                                    checked={selectedRows.length === filteredInflows.length && filteredInflows.length > 0}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedRows(filteredInflows.map(item => item.id));
                                      } else {
                                        setSelectedRows([]);
                                      }
                                    }}
                                  />
                                </TableHead>
                              )}
                              <TableHead className="text-gray-400 text-xs">Date</TableHead>
                              <TableHead className="text-gray-400 text-xs">Source</TableHead>
                              <TableHead className="text-gray-400 text-xs">Customer</TableHead>
                              <TableHead className="text-gray-400 text-xs">Gross</TableHead>
                              <TableHead className="text-gray-400 text-xs">Fees</TableHead>
                              <TableHead className="text-gray-400 text-xs">Net</TableHead>
                              <TableHead className="text-gray-400 text-xs">Status</TableHead>
                              {auditView && (
                                <>
                                  <TableHead className="text-gray-400 text-xs">Transaction ID</TableHead>
                                  <TableHead className="text-gray-400 text-xs">Reconciliation</TableHead>
                                </>
                              )}
                              <TableHead className="text-gray-400 text-xs">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredInflows.map((item) => {
                              const healthScore = customerHealthScores[item.customer] || 70;
                              return (
                                <TableRow
                                  key={item.id}
                                  className="cursor-pointer hover:bg-white/5 border-white/10 transition-all group"
                                >
                                  {auditView && (
                                    <TableCell>
                                      <input
                                        type="checkbox"
                                        className="rounded bg-white/5 border-white/30 text-blue-500 focus:ring-blue-500"
                                        checked={selectedRows.includes(item.id)}
                                        onChange={() => handleRowSelect(item.id)}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </TableCell>
                                  )}
                                  <TableCell className="text-gray-300 text-xs">{format(new Date(item.date), 'MMM d')}</TableCell>
                                  <TableCell>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge
                                            variant="outline"
                                            className="bg-white/5 border-white/20 text-white text-xs cursor-pointer hover:bg-white/10"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedTransaction({ ...item, type: "inflow" });
                                            }}
                                          >
                                            {item.source}
                                            {item.fees / item.gross > 0.1 && (
                                              <Badge className="ml-1 bg-orange-500/20 text-orange-400 border-0 text-[10px] px-1">High Fee</Badge>
                                            )}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-900 border-white/10 text-white">
                                          <p className="text-xs">Click to view payout details</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className={cn("w-2 h-2 rounded-full",
                                              healthScore >= 80 ? "bg-emerald-400" :
                                                healthScore >= 60 ? "bg-amber-400" : "bg-red-400"
                                            )} />
                                          </TooltipTrigger>
                                          <TooltipContent className="bg-gray-900 border-white/10 text-white">
                                            <p className="text-xs">Health Score: {healthScore}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <span
                                        className="text-white text-xs font-medium cursor-pointer hover:text-blue-400 underline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedCustomer(item.customer);
                                        }}
                                      >
                                        {item.customer}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="text-gray-300 text-xs cursor-help">${item.gross.toLocaleString()}</span>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-900 border-white/10 text-white">
                                          <p className="text-xs">Gross ${item.gross.toLocaleString()} - Fees ${item.fees.toLocaleString()} = Net ${item.net.toLocaleString()}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </TableCell>
                                  <TableCell className="text-red-400 text-xs">-${item.fees.toLocaleString()}</TableCell>
                                  <TableCell className="text-emerald-400 font-semibold text-xs">${item.net.toLocaleString()}</TableCell>
                                  <TableCell>
                                    <Badge
                                      className={cn(
                                        "text-xs cursor-pointer",
                                        item.status === "Paid" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30",
                                        item.status === "Pending" && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30",
                                        item.status === "Failed" && "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setStatusFilter(item.status);
                                      }}
                                    >
                                      {item.status}
                                    </Badge>
                                  </TableCell>
                                  {auditView && (
                                    <>
                                      <TableCell className="text-gray-400 text-xs font-mono">{item.transaction_id}</TableCell>
                                      <TableCell>
                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                                          Reconciled
                                        </Badge>
                                      </TableCell>
                                    </>
                                  )}
                                  <TableCell>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10">
                                              <FileText className="w-3 h-3" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent className="bg-gray-900 border-white/10 text-white">
                                            <p className="text-xs">View Invoice</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10">
                                              <Tag className="w-3 h-3" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent className="bg-gray-900 border-white/10 text-white">
                                            <p className="text-xs">Tag as Recurring</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10">
                                              <Split className="w-3 h-3" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent className="bg-gray-900 border-white/10 text-white">
                                            <p className="text-xs">Split Payment</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* MOVED METRICS - Top 3 Customers */}
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-sm">Top 3 Customers</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {topCustomers.map((customer, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-xs text-white font-medium">{customer.name}</span>
                            <span className="text-xs text-emerald-400 font-bold">${customer.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* MOVED METRICS - Predicted Inflow Events */}
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-sm">Predicted Inflow Events</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 max-h-[250px] overflow-y-auto">
                        {predictedInflows.map((pred, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-white font-medium">{pred.source}</span>
                                <Badge className={cn(
                                  "text-[10px] px-1.5",
                                  pred.confidence === "High" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                                    pred.confidence === "Medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                                      "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                )}>
                                  {pred.confidence}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-400">{format(new Date(pred.date), 'MMM d')}</div>
                            </div>
                            <div className="text-sm font-bold text-emerald-400">${pred.amount.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        Show Forecast Confidence Factors
                      </Button>
                    </CardContent>
                  </Card>

                  {/* MOVED METRICS - Next 30 Days Projection */}
                  {showForecast && (
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white text-sm">Next 30 Days Projection</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <ResponsiveContainer width="100%" height={120}>
                          <BarChart data={inflowsForecast.weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="week" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 9 }} />
                            <ChartTooltip
                              formatter={(value) => `$${value.toLocaleString()}`}
                              contentStyle={{
                                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '11px'
                              }}
                            />
                            <Bar dataKey="projected" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="text-xs text-gray-300">
                          Expected total inflows: <span className="font-bold text-white">${inflowsForecast.projectedTotal.toLocaleString()}</span>
                          <span className="text-emerald-400 ml-1">(+{inflowsForecast.growthPercent}%)</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-8 gap-2"
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Simulate Drop in DoorDash Revenue
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right: Sticky Sidebar with Key Metrics (4 columns) - UNCHANGED */}
                <div className="col-span-4 space-y-4">
                  <div className="sticky top-20 space-y-4">
                    {/* AI Insights Panel */}
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          AI Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        {aiInsights.map((insight) => (
                          <div
                            key={insight.id}
                            className={cn(
                              "p-3 rounded-lg border text-xs",
                              insight.severity === "warning" && "bg-orange-500/10 border-orange-500/30 text-orange-300",
                              insight.severity === "info" && "bg-blue-500/10 border-blue-500/30 text-blue-300",
                              insight.severity === "success" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            )}
                          >
                            {insight.text}
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-8 gap-2"
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Explain This Month's Revenue
                        </Button>
                      </CardContent>
                    </Card>

                    {/* NRR Card */}
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white text-sm">Net Revenue Retention</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="mb-3">
                          <div className="text-3xl font-bold text-emerald-400">{nrrData.current}%</div>
                          <div className="text-xs text-emerald-400 mt-1">+{nrrData.change}% MoM</div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="space-y-2 text-xs cursor-help">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Expansions</span>
                                  <span className="text-emerald-400 font-semibold">+${nrrData.expansions.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Contractions</span>
                                  <span className="text-red-400 font-semibold">${nrrData.contractions.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Churn</span>
                                  <span className="text-red-400 font-semibold">${nrrData.churn.toLocaleString()}</span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-900 border-white/10 text-white">
                              <p className="text-xs">Hover for breakdown details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </CardContent>
                    </Card>

                    {/* At-Risk Customers */}
                    {atRiskCustomers.length > 0 && (
                      <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-white text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            At-Risk Customers
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            {atRiskCustomers.map((cust, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-white">{cust.name}</span>
                                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">
                                    Score: {cust.score}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-400 mb-2">{cust.issue}</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-6"
                                >
                                  <Target className="w-3 h-3 mr-1" />
                                  Predict next payment date
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Daily Cash In Chart */}
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white text-sm">Daily Cash In (Last 30 Days)</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={150}>
                          <LineChart data={cashBalanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                            <ChartTooltip
                              formatter={(value) => `$${value.toLocaleString()}`}
                              contentStyle={{
                                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '11px'
                              }}
                            />
                            <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Collapsible Analysis & Flow Map */}
              <div className="space-y-4">
                {/* Collapsible Analysis Section */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowAnalysis(!showAnalysis)}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-sm">Inflows Analysis</CardTitle>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                        {showAnalysis ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </CardHeader>
                  {showAnalysis && (
                    <CardContent className="pt-0 space-y-6">
                      {/* Revenue by Channel */}
                      <div>
                        <div className="text-xs text-gray-400 mb-3">Revenue by Channel (MTD)</div>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={revenueByChannel.map(c => ({ name: c.channel, value: c.amount }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                            <ChartTooltip
                              formatter={(value) => `$${value.toLocaleString()}`}
                              contentStyle={{
                                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '11px'
                              }}
                            />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Top Customers by Growth */}
                      <div>
                        <div className="text-xs text-gray-400 mb-3">Top Customers by Growth Rate</div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-gray-400 text-xs">Customer</TableHead>
                                <TableHead className="text-gray-400 text-xs">Last Month</TableHead>
                                <TableHead className="text-gray-400 text-xs">This Month</TableHead>
                                <TableHead className="text-gray-400 text-xs">Growth</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {topGrowthCustomers.map((cust, idx) => (
                                <TableRow key={idx} className="border-white/10">
                                  <TableCell className="text-white text-xs font-medium">{cust.name}</TableCell>
                                  <TableCell className="text-gray-300 text-xs">${cust.lastMonth.toLocaleString()}</TableCell>
                                  <TableCell className="text-white text-xs font-semibold">${cust.thisMonth.toLocaleString()}</TableCell>
                                  <TableCell className="text-emerald-400 font-bold text-xs">+{cust.growth}%</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Revenue Flow Map */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowRevenueFlow(!showRevenueFlow)}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-sm">Revenue Flow Map</CardTitle>
                      <div className="flex items-center gap-2">
                        <Select value={flowViewMode} onValueChange={setFlowViewMode}>
                          <SelectTrigger className="w-28 h-7 text-xs bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                            <SelectItem value="gross">Show Gross</SelectItem>
                            <SelectItem value="net">Show Net</SelectItem>
                            <SelectItem value="fees">Show Fees</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          {showRevenueFlow ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {showRevenueFlow && (
                    <CardContent className="pt-0">
                      <SankeyDiagram data={revenueFlowData} viewMode={flowViewMode} />
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                            onClick={handleExplainFlow}
                            disabled={isExplainingFlow}
                          >
                            {isExplainingFlow ? (
                              <>
                                <div className="w-3 h-3 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <MessageCircle className="w-3 h-3 mr-2" />
                                Explain this flow
                              </>
                            )}
                          </Button>
                        </div>

                        {flowExplanation && (
                          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                AI Analysis
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFlowExplanation(null)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                              >
                                &times;
                              </Button>
                            </div>
                            <div className="prose prose-sm prose-invert max-w-none">
                              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {flowExplanation.content}
                              </p>
                            </div>
                            <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(createPageUrl("CashFlow"))}
                                className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                              >
                                View Full Analysis
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExplainFlow}
                                className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                              >
                                Ask Follow-up
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* OUTFLOWS TAB - ENHANCED */}
        <TabsContent value="outflows" className="mt-6 space-y-6">

          {/* Top Controls Bar with Link Dropdown */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Select defaultValue="none">
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white text-xs h-8">
                  <SelectValue placeholder="Link to..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                  <SelectItem value="none">Link to...</SelectItem>
                  <SelectItem value="related_inflows">Related Inflows</SelectItem>
                  <SelectItem value="payroll_deps">Payroll Dependencies</SelectItem>
                  <SelectItem value="fpa_scenario">FP&A Scenario</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={auditView ? "default" : "outline"}
                size="sm"
                onClick={() => setAuditView(!auditView)}
                className={auditView ?
                  "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0 text-white" :
                  "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }
              >
                <FileCheck className="w-3 h-3 mr-1" />
                Audit Mode
              </Button>

              {selectedRows.length > 0 && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {selectedRows.length} selected
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {auditView && (
                <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-7 text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Export CSV
                </Button>
              )}
              <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-7 text-xs">
                <Keyboard className="w-3 h-3 mr-1" />
                Press / to search
              </Button>
            </div>
          </div>

          {/* Enhanced Top Summary */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
              <CardContent className="p-4">
                <div className="text-xs text-gray-400 mb-1">Total Outflows (MTD)</div>
                <div className="text-xl font-bold text-red-400">${metrics.totalOutflows.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-red-400 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+5.1%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
              <CardContent className="p-4">
                <div className="text-xs text-gray-400 mb-1">Avg Bill Size</div>
                <div className="text-xl font-bold text-white">$8,203</div>
                <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
                  <TrendingDown className="w-3 h-3" />
                  <span>-2.3%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
              <CardContent className="p-4">
                <div className="text-xs text-gray-400 mb-1"># Bills Due This Week</div>
                <div className="text-xl font-bold text-white">4</div>
                <div className="text-xs text-orange-400 mt-1">2 approaching deadline</div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
              <CardContent className="p-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help">
                        <div className="text-xs text-gray-400 mb-1">Approval Rate</div>
                        <Info className="w-3 h-3 text-gray-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-900 border-white/10 text-white">
                      <p className="text-xs">Approved bills ÷ Total bills</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="text-xl font-bold text-white">85%</div>
                <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+3.2%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left: Filters + Table (8 columns) */}
            <div className="col-span-8 space-y-4">
              {/* Advanced Filters */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">Filters</span>
                    <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7">
                      Save Filter
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    <Select value={outflowCategoryFilter} onValueChange={setOutflowCategoryFilter}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="COGS">COGS</SelectItem>
                        <SelectItem value="OpEx">OpEx</SelectItem>
                        <SelectItem value="Payroll">Payroll</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Fees">Fees</SelectItem>
                        <SelectItem value="Tax">Tax</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={outflowStatusFilter} onValueChange={setOutflowStatusFilter}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={outflowTagsFilter} onValueChange={setOutflowTagsFilter}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8">
                        <SelectValue placeholder="Tags" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                        <SelectItem value="all">All Tags</SelectItem>
                        <SelectItem value="recurring">Recurring</SelectItem>
                        <SelectItem value="saas">SaaS</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="cloud">Cloud</SelectItem>
                        <SelectItem value="payroll">Payroll</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={outflowTimeRangeFilter} onValueChange={setOutflowTimeRangeFilter}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8">
                        <SelectValue placeholder="Time Range" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                        <SelectItem value="this_month">This Month</SelectItem>
                        <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={vendorHealthFilter} onValueChange={setVendorHealthFilter}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8">
                        <SelectValue placeholder="Vendor Health" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                        <SelectItem value="all">All Vendors</SelectItem>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="at_risk">At-Risk</SelectItem>
                        <SelectItem value="new">New Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Search vendors or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-xs h-9"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Spend Insights Bar */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30 text-orange-400 text-xs">
                      Top Category: OpEx ($14,950, 72%)
                    </Badge>
                    <Badge variant="outline" className="bg-red-500/10 border-red-500/30 text-red-400 text-xs">
                      Highest Vendor: Legal Co ($8,500)
                    </Badge>
                    <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-400 text-xs">
                      Recurring Spend: 3 vendors, $9,600 MTD
                    </Badge>
                    <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-400 text-xs">
                      Fastest-Growing: SaaS (+21%)
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Payments & Spend Table */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Payments & Spend</CardTitle>
                    {selectedRows.length > 0 && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-7 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve Selected
                        </Button>
                        <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-7 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                          {auditView && (
                            <TableHead className="text-gray-400 text-xs w-12">
                              <input
                                type="checkbox"
                                className="rounded bg-white/5 border-white/30 text-blue-500 focus:ring-blue-500"
                                checked={selectedRows.length === filteredOutflows.length && filteredOutflows.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRows(filteredOutflows.map(item => item.id));
                                  } else {
                                    setSelectedRows([]);
                                  }
                                }}
                              />
                            </TableHead>
                          )}
                          <TableHead className="text-gray-400 text-xs">Vendor</TableHead>
                          <TableHead className="text-gray-400 text-xs">Due Date</TableHead>
                          <TableHead className="text-gray-400 text-xs">Category</TableHead>
                          <TableHead className="text-gray-400 text-xs">Amount</TableHead>
                          <TableHead className="text-gray-400 text-xs">Status</TableHead>
                          <TableHead className="text-gray-400 text-xs">Tags</TableHead>
                          {auditView && (
                            <>
                              <TableHead className="text-gray-400 text-xs">Bill ID</TableHead>
                              <TableHead className="text-gray-400 text-xs">Reconciled</TableHead>
                            </>
                          )}
                          <TableHead className="text-gray-400 text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOutflows.map((item) => {
                          const vendorHealth = item.vendor === "AWS" ? 85 : item.vendor === "Legal Co" ? 65 : 90;
                          const isOverdue = item.status === "Overdue";
                          return (
                            <TableRow
                              key={item.id}
                              className={cn(
                                "cursor-pointer hover:bg-white/5 border-white/10 transition-all group",
                                item.status === "Paid" && "opacity-80",
                                isOverdue && "animate-pulse border-l-2 border-l-red-500/50"
                              )}
                              onClick={() => setSelectedTransaction({ ...item, type: "outflow" })}
                            >
                              {auditView && (
                                <TableCell>
                                  <input
                                    type="checkbox"
                                    className="rounded bg-white/5 border-white/30 text-blue-500 focus:ring-blue-500"
                                    checked={selectedRows.includes(item.id)}
                                    onChange={() => handleRowSelect(item.id)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </TableCell>
                              )}
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className={cn("w-2 h-2 rounded-full",
                                          vendorHealth >= 80 ? "bg-emerald-400" :
                                            vendorHealth >= 60 ? "bg-amber-400" : "bg-red-400"
                                        )} />
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-gray-900 border-white/10 text-white">
                                        <p className="text-xs">Health Score: {vendorHealth}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <span
                                    className="text-white text-xs font-medium cursor-pointer hover:text-blue-400 underline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedVendor(item.vendor);
                                    }}
                                  >
                                    {item.vendor}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-300 text-xs">{format(new Date(item.due_date), 'MMM d')}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-white/5 border-white/20 text-white text-xs">
                                  {item.category}
                                </Badge>
                              </TableCell>
                              <TableCell
                                className="text-white font-semibold text-xs"
                                onMouseEnter={() => { setHoveredBill(item); setShowImpactPreview(true); }}
                                onMouseLeave={() => { setHoveredBill(null); setShowImpactPreview(false); }}
                              >
                                ${item.amount.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge className={cn(
                                  "text-xs",
                                  item.status === "Paid" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                                  item.status === "Approved" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                                  item.status === "Scheduled" && "bg-purple-500/20 text-purple-400 border-purple-500/30",
                                  item.status === "Draft" && "bg-gray-500/20 text-gray-400 border-gray-500/30",
                                  item.status === "Overdue" && "bg-red-500/20 text-red-400 border-red-500/30"
                                )}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {item.tags && item.tags.split(',').map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="mr-1 bg-white/5 border-white/20 text-gray-400 text-xs">
                                    {tag.trim()}
                                  </Badge>
                                ))}
                              </TableCell>
                              {auditView && (
                                <>
                                  <TableCell className="text-gray-400 text-xs font-mono">{item.bill_id}</TableCell>
                                  <TableCell>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                                      Reconciled
                                    </Badge>
                                  </TableCell>
                                </>
                              )}
                              <TableCell>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10">
                                          <MessageCircle className="w-3 h-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-gray-900 border-white/10 text-white">
                                        <p className="text-xs">Ask AI</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  {item.status === "Draft" && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10">
                                            <CheckCircle className="w-3 h-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-900 border-white/10 text-white">
                                          <p className="text-xs">Approve (A)</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  {item.status === "Approved" && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10">
                                            <Clock className="w-3 h-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-900 border-white/10 text-white">
                                          <p className="text-xs">Schedule (S)</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  {item.status === "Scheduled" && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10">
                                            <DollarSign className="w-3 h-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-900 border-white/10 text-white">
                                          <p className="text-xs">Mark Paid (P)</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10">
                                          <FileText className="w-3 h-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-gray-900 border-white/10 text-white">
                                        <p className="text-xs">View Details</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Collapsible Spend Analytics */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowAnalysis(!showAnalysis)}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">Spend Analytics</CardTitle>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      {showAnalysis ? "Hide" : "Show"}
                    </Button>
                  </div>
                </CardHeader>
                {showAnalysis && (
                  <CardContent className="pt-0 space-y-6">
                    {/* Spend by Category */}
                    <div>
                      <div className="text-xs text-gray-400 mb-3">Spend by Category (MTD)</div>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={spendByCategory.map(c => ({ name: c.name, value: c.value }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                          <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                          <ChartTooltip
                            formatter={(value) => `$${value.toLocaleString()}`}
                            contentStyle={{
                              backgroundColor: 'rgba(17, 24, 39, 0.95)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '11px'
                            }}
                          />
                          <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Top 5 Vendors by MoM Change */}
                    <div>
                      <div className="text-xs text-gray-400 mb-3">Top 5 Vendors by MoM Change</div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-white/10 hover:bg-transparent">
                              <TableHead className="text-gray-400 text-xs">Vendor</TableHead>
                              <TableHead className="text-gray-400 text-xs">Last Month</TableHead>
                              <TableHead className="text-gray-400 text-xs">This Month</TableHead>
                              <TableHead className="text-gray-400 text-xs">Change</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-white/10">
                              <TableCell className="text-white text-xs font-medium">Legal Co</TableCell>
                              <TableCell className="text-gray-300 text-xs">$5,000</TableCell>
                              <TableCell className="text-white text-xs font-semibold">$8,500</TableCell>
                              <TableCell className="text-red-400 font-bold text-xs">+70%</TableCell>
                            </TableRow>
                            <TableRow className="border-white/10">
                              <TableCell className="text-white text-xs font-medium">Salesforce</TableCell>
                              <TableCell className="text-gray-300 text-xs">$1,000</TableCell>
                              <TableCell className="text-white text-xs font-semibold">$1,200</TableCell>
                              <TableCell className="text-orange-400 font-bold text-xs">+20%</TableCell>
                            </TableRow>
                            <TableRow className="border-white/10">
                              <TableCell className="text-white text-xs font-medium">AWS</TableCell>
                              <TableCell className="text-gray-300 text-xs">$3,100</TableCell>
                              <TableCell className="text-white text-xs font-semibold">$3,200</TableCell>
                              <TableCell className="text-emerald-400 font-bold text-xs">+3.2%</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Next 30 Days Spend Projection */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm">Next 30 Days Spend Projection</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={[
                      { week: "Week 1", projected: 14500 },
                      { week: "Week 2", projected: 13800 },
                      { week: "Week 3", projected: 14200 },
                      { week: "Week 4", projected: 14900 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="week" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                      <YAxis stroke="#9ca3af" tick={{ fontSize: 9 }} />
                      <ChartTooltip
                        formatter={(value) => `$${value.toLocaleString()}`}
                        contentStyle={{
                          backgroundColor: 'rgba(17, 24, 39, 0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                      <Bar dataKey="projected" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="text-xs text-gray-300">
                    Expected outflows: <span className="font-bold text-white">$56,400</span>
                    <span className="text-red-400 ml-1">(+3.8%)</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-8 gap-2"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Simulate Cutting Non-Critical Spend by 10%
                  </Button>
                </CardContent>
              </Card>

              {/* Copilot Prompt Row */}
              <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl border-purple-500/20 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Quick AI Prompts</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs">
                      Explain variance in Legal Co spend
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs">
                      What if we delay AWS bill by a week?
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs">
                      How much can we cut without affecting payroll?
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs">
                      List all recurring vendors above $2k
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* NEW: Cost Patterns & Anomalies */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowCostPatterns(!showCostPatterns)}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-400" />
                      Cost Patterns & Anomalies
                    </CardTitle>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      {showCostPatterns ? "Hide" : "Show"}
                    </Button>
                  </div>
                </CardHeader>
                {showCostPatterns && (
                  <CardContent className="pt-0 space-y-3">
                    {costPatterns.map((pattern) => (
                      <div
                        key={pattern.id}
                        className={cn(
                          "p-4 rounded-lg border",
                          pattern.severity === "warning" && "bg-orange-500/10 border-orange-500/30",
                          pattern.severity === "info" && "bg-blue-500/10 border-blue-500/30"
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <Badge className={cn(
                              "text-[10px] mb-2",
                              pattern.severity === "warning" && "bg-orange-500/20 text-orange-400 border-orange-500/30",
                              pattern.severity === "info" && "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            )}>
                              {pattern.category}
                            </Badge>
                            <p className="text-xs text-white">{pattern.title}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Explain Pattern
                          </Button>
                          <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Create Policy to Monitor
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>

            </div>

            {/* Right: Sidebar (4 columns) */}
            <div className="col-span-4 space-y-4">
              <div className="sticky top-20 space-y-4">
                {/* AI Spend Analysis */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      AI Spend Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="p-3 rounded-lg border bg-red-500/10 border-red-500/30 text-xs text-red-300">
                      1️⃣ Legal fees up 70% MoM — driven by Legal Co retainer.
                    </div>
                    <div className="p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-xs text-emerald-300">
                      2️⃣ AWS costs steady, utilization normal.
                    </div>
                    <div className="p-3 rounded-lg border bg-orange-500/10 border-orange-500/30 text-xs text-orange-300">
                      3️⃣ 2 upcoming bills may impact payroll buffer.
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-8 gap-2"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Explain This Month's Spend
                    </Button>
                  </CardContent>
                </Card>

                {/* Spend Controls */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-sm">Spend Controls</CardTitle>
                      <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 text-xs h-6">
                        Add Policy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-3 h-3 text-orange-400" />
                        <span className="text-xs font-medium text-white">Soft Limit Breach</span>
                      </div>
                      <p className="text-xs text-gray-400">AWS exceeded $3,500 cap</p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span className="text-xs font-medium text-white">Pending Approvals</span>
                      </div>
                      <p className="text-xs text-gray-400">3 bills awaiting approval</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-3 h-3 text-red-400" />
                        <span className="text-xs font-medium text-white">Vendor Warning</span>
                      </div>
                      <p className="text-xs text-gray-400">Legal Co payment overdue 2×</p>
                    </div>
                  </CardContent>
                </Card>

                {/* At-Risk Vendors */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      At-Risk Vendors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-white">Legal Co</span>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">
                          Score: 65
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">Payment volatility +40%, expense growth +70%</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-6"
                      >
                        View Risk Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Spend Trend Chart */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">Outflow Velocity (Last 30 Days)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={[
                        { day: "Nov 20", amount: 1800 },
                        { day: "Nov 27", amount: 2100 },
                        { day: "Dec 4", amount: 1950 },
                        { day: "Dec 11", amount: 2200 },
                        { day: "Dec 18", amount: 2050 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="day" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                        <ChartTooltip
                          formatter={(value) => `$${value.toLocaleString()}`}
                          contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '11px'
                          }}
                        />
                        <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* NEW: Floating Cash Impact Meter */}
          {showCashImpact && activeView === "outflows" && (
            <div className="fixed bottom-6 right-6 z-50">
              <Card className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-white/20 rounded-xl shadow-2xl w-[280px]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Cash Impact
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      onClick={() => setShowCashImpact(false)}
                    >
                      &times;
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Cash on Hand</div>
                    <div className="text-2xl font-bold text-white">
                      ${cashImpact.cashOnHand.toLocaleString()}
                    </div>
                    {cashImpactDelta !== 0 && (
                      <div className={cn(
                        "text-xs font-semibold animate-pulse",
                        cashImpactDelta > 0 ? "text-emerald-400" : "text-red-400"
                      )}>
                        {cashImpactDelta > 0 ? "+" : ""}{cashImpactDelta.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-1">Runway</div>
                    <div className="text-xl font-bold text-white">{cashImpact.runway} months</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-1">Net Outflow Change (vs yesterday)</div>
                    <div className="text-lg font-bold text-red-400">
                      {cashImpact.netOutflowChange.toLocaleString()}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                    onClick={() => setShowImpactForecast(!showImpactForecast)}
                  >
                    {showImpactForecast ? "Hide" : "Show"} Impact Forecast
                  </Button>

                  {showImpactForecast && (
                    <div className="pt-3 border-t border-white/10">
                      <div className="text-xs text-gray-400 mb-2">Baseline vs New Scenario</div>
                      <ResponsiveContainer width="100%" height={80}>
                        <BarChart data={[
                          { name: "Baseline", value: 246680 },
                          { name: "New", value: 238450 }
                        ]}>
                          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* NEW: Bill Impact Preview Modal */}
          {showImpactPreview && hoveredBill && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowImpactPreview(false)}>
              <Card className="bg-gray-900/95 backdrop-blur-xl border-white/10 rounded-xl w-[500px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                <CardHeader>
                  <CardTitle className="text-white">Preview Impact: {hoveredBill.vendor}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Current Cash</div>
                      <div className="text-lg font-bold text-white">$246,680</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Post-Approval Cash</div>
                      <div className="text-lg font-bold text-orange-400">
                        ${(246680 - hoveredBill.amount).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-2">Category Trend Impact</div>
                    <div className="text-sm text-white">
                      {hoveredBill.category} will increase by {calculateBillImpact(hoveredBill).opexIncrease}% MTD
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                    <div className="text-xs text-orange-300">
                      ⚠️ This will reduce runway by {calculateBillImpact(hoveredBill).runwayReduction} months
                    </div>
                  </div>

                  {calculateBillImpact(hoveredBill).riskLevel === "medium" && (
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <div className="text-xs text-yellow-300">
                        💡 Suggested: Consider delaying by 7 days to maintain buffer
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Approve Anyway
                    </Button>
                    <Button variant="outline" className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={() => setShowImpactPreview(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* NET FLOW TAB - ENHANCED */}
        <TabsContent value="netflow" className="mt-6 space-y-6">

          {/* Header with Export Dropdown */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Net Flow & Liquidity</h3>
              <p className="text-sm text-gray-400 mt-1">Real-time balance movement and cash continuity insights.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showAdvancedMetrics ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                className={showAdvancedMetrics ?
                  "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0 text-white" :
                  "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }
              >
                Advanced Metrics
              </Button>
              <Select defaultValue="none">
                <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white text-xs h-8">
                  <SelectValue placeholder="Export..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                  <SelectItem value="none">Export...</SelectItem>
                  <SelectItem value="pdf">Export as PDF</SelectItem>
                  <SelectItem value="csv">Export as CSV</SelectItem>
                  <SelectItem value="board">Generate Board Summary</SelectItem>
                  <SelectItem value="slack">Share via Slack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Slim Metrics Row - EXPANDED */}
          <div className="grid grid-cols-5 gap-3">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
              <CardContent className="p-3">
                <div className="text-xs text-gray-400 mb-1">Today's Net Flow</div>
                <div className="text-lg font-bold text-emerald-400">+$8,000</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
              <CardContent className="p-3">
                <div className="text-xs text-gray-400 mb-1">7D Avg Net Flow</div>
                <div className="text-lg font-bold text-white">+$4,300</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
              <CardContent className="p-3">
                <div className="text-xs text-gray-400 mb-1">Cash Stability Score</div>
                <div className="text-lg font-bold text-emerald-400">82/100</div>
              </CardContent>
            </Card>

            {/* Liquidity Stress Index */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
              <CardContent className="p-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs text-gray-400">Liquidity Stress Index</span>
                          <Info className="w-3 h-3 text-gray-500" />
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-lg font-bold text-orange-400">65/100</div>
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px]">
                            Medium
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <ResponsiveContainer width="100%" height={20}>
                            <LineChart data={[
                              { v: 72 }, { v: 68 }, { v: 70 }, { v: 65 }, { v: 63 }, { v: 65 }
                            ]}>
                              <Line
                                type="monotone"
                                dataKey="v"
                                stroke="#f97316"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-900 border-white/10 text-white max-w-xs">
                      <div className="space-y-2 text-xs">
                        <div className="font-semibold">Liquidity Stress Index</div>
                        <div className="text-gray-300">
                          Formula: (Volatility × Outflow Velocity) / Inflow Regularity
                        </div>
                        <div className="pt-2 border-t border-white/10">
                          <div className="text-orange-300">Moderate volatility driven by uneven inflows</div>
                        </div>
                        <div className="pt-2 space-y-1 text-gray-400">
                          <div>• Volatility: 8.2%</div>
                          <div>• Outflow Velocity: High</div>
                          <div>• Inflow Regularity: 72%</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2 bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open Copilot with query
                          }}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Explain This Score
                        </Button>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
              <CardContent className="p-3">
                <div className="text-xs text-gray-400 mb-1">Runway</div>
                <div className="text-lg font-bold text-white">18.4 months</div>
              </CardContent>
            </Card>
          </div>

          {/* Anomaly Alert */}
          <Card className="bg-orange-500/10 backdrop-blur-xl border-orange-500/30 rounded-xl">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-sm font-semibold text-orange-300">⚠️ Cash anomaly detected on Dec 18 — investigate?</div>
                    <div className="text-xs text-orange-400 mt-1">Net flow deviated 18% from 7-day average</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-orange-500/30 text-orange-300 hover:bg-orange-500/20 text-xs"
                  onClick={() => setSelectedAnomaly("dec18")}
                >
                  Investigate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column: Charts and Table */}
            <div className="col-span-8 space-y-6">
              {/* Net Cash Movement Chart */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">Net Cash Movement</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                        {["7D", "30D", "90D", "Custom"].map((range) => (
                          <Button
                            key={range}
                            variant={netFlowRange === range ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setNetFlowRange(range)}
                            className={netFlowRange === range ?
                              "bg-blue-600 hover:bg-blue-700 text-white h-6 text-xs px-2" :
                              "text-gray-400 hover:text-white h-6 text-xs px-2"
                            }
                          >
                            {range}
                          </Button>
                        ))}
                      </div>
                      <Select value={sourceTypeFilter} onValueChange={setSourceTypeFilter}>
                        <SelectTrigger className="w-[130px] bg-white/5 border-white/10 text-white text-xs h-7">
                          <SelectValue placeholder="Source Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                          <SelectItem value="all">All Sources</SelectItem>
                          <SelectItem value="operational">Operational</SelectItem>
                          <SelectItem value="financing">Financing</SelectItem>
                          <SelectItem value="investment">Investment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                      data={netFlowData}
                      onMouseMove={(e) => {
                        if (e && e.activeLabel) {
                          setHoveredNetFlowDate(e.activeLabel);
                        }
                      }}
                      onMouseLeave={() => setHoveredNetFlowDate(null)}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            let momentumColor = "text-gray-400";
                            let momentumText = "Stable";

                            if (data.momentum_index > 1000) {
                              momentumColor = "text-emerald-400";
                              momentumText = "Positive acceleration";
                            } else if (data.momentum_index < -1000) {
                              momentumColor = "text-red-400";
                              momentumText = "Deceleration";
                            } else if (data.momentum_index >= -1000 && data.momentum_index <= 1000 && data.momentum_index !== 0) {
                              momentumColor = "text-yellow-400";
                              momentumText = "Flattening";
                            }

                            return (
                              <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg p-3 text-xs">
                                <div className="font-semibold text-white mb-2">{data.date}</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between gap-4">
                                    <span className="text-emerald-400">Inflows:</span>
                                    <span className="text-white font-semibold">${data.inflows.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-red-400">Outflows:</span>
                                    <span className="text-white font-semibold">${data.outflows.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between gap-4 pt-1 border-t border-white/10">
                                    <span className="text-gray-400">Net:</span>
                                    <span className={cn(
                                      "font-bold",
                                      data.net >= 0 ? "text-emerald-400" : "text-red-400"
                                    )}>
                                      {data.net >= 0 ? "+" : ""}${data.net.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-gray-400">Ending Balance:</span>
                                    <span className="text-blue-400 font-semibold">${data.balance.toLocaleString()}</span>
                                  </div>
                                  {data.keyEvent && (
                                    <div className="pt-2 mt-2 border-t border-white/10">
                                      <div className="text-purple-400">Key Event: {data.keyEvent}</div>
                                    </div>
                                  )}
                                  {/* Predicted Cash Momentum Tooltip */}
                                  <div className="pt-2 mt-2 border-t border-white/10">
                                    <div className={cn("flex items-center gap-2", momentumColor)}>
                                      <span className="font-semibold">Cash Momentum:</span>
                                      <span>{momentumText}</span>
                                    </div>
                                    <div className="text-gray-400 mt-1">Momentum dropping for 3 days — watch upcoming vendor payments.</div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend wrapperStyle={{ color: '#fff', fontSize: '11px' }} />

                      {/* Predicted Range Area */}
                      <Area
                        type="monotone"
                        dataKey="projectedHigh"
                        fill="#3b82f6"
                        fillOpacity={0.1}
                        stroke="none"
                        name="Projected High"
                      />
                      <Area
                        type="monotone"
                        dataKey="projectedLow"
                        fill="#3b82f6"
                        fillOpacity={0.1}
                        stroke="none"
                        name="Projected Low"
                      />

                      {/* Bars */}
                      <Bar dataKey="inflows" fill="#10b981" radius={[4, 4, 0, 0]} name="Inflows" />
                      <Bar dataKey="outflows" fill="#ef4444" radius={[4, 4, 0, 0]} name="Outflows" />

                      {/* Ending Balance Line */}
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3b82f6' }}
                        name="Ending Balance"
                      />

                      {/* Predicted Cash Momentum Line */}
                      <Line
                        type="monotone"
                        dataKey="momentum_index"
                        stroke="#9ca3af"
                        strokeDasharray="5 5"
                        strokeWidth={1}
                        dot={false}
                        name="Predicted Cash Momentum"
                      />

                      {showAdvancedMetrics && (
                        <>
                          <Line type="monotone" dataKey="ocf" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="OCF" dot={false} />
                          <Line type="monotone" dataKey="icf" stroke="#ec4899" strokeWidth={2} strokeDasharray="5 5" name="ICF" dot={false} />
                          <Line type="monotone" dataKey="fcf" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="FCF" dot={false} />
                        </>
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>

                  {showAdvancedMetrics && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold text-white">Advanced Financial Metrics</div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-6"
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Explain FCF Variance
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <div className="text-gray-400">OCF</div>
                          <div className="text-purple-400 font-semibold">$107,000</div>
                        </div>
                        <div>
                          <div className="text-gray-400">ICF</div>
                          <div className="text-pink-400 font-semibold">-$13,500</div>
                        </div>
                        <div>
                          <div className="text-gray-400">FCF</div>
                          <div className="text-orange-400 font-semibold">$76,000</div>
                        </div>
                        <div>
                          <div className="text-gray-400">FFC</div>
                          <div className="text-amber-400 font-semibold">$93,500</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Daily Statement Table */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">Daily Statement</CardTitle>
                    <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7">
                      <Download className="w-3 h-3 mr-1" />
                      Download CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="text-gray-400 text-xs">Date</TableHead>
                          <TableHead className="text-gray-400 text-xs">Inflows</TableHead>
                          <TableHead className="text-gray-400 text-xs">Outflows</TableHead>
                          <TableHead className="text-gray-400 text-xs">Net</TableHead>
                          <TableHead className="text-gray-400 text-xs">Cumulative Net</TableHead>
                          <TableHead className="text-gray-400 text-xs">Ending Balance</TableHead>
                          <TableHead className="text-gray-400 text-xs">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {netFlowData.map((row, idx) => (
                          <TooltipProvider key={idx}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <TableRow
                                  className={cn(
                                    "border-white/10 cursor-pointer hover:bg-white/5 transition-all",
                                    hoveredNetFlowDate === row.date && "bg-white/10",
                                    row.net < 0 && "border-l-2 border-l-red-500/50"
                                  )}
                                  onClick={() => setSelectedDayStatement(row)}
                                >
                                  <TableCell className="font-medium text-white text-xs">{row.date}</TableCell>
                                  <TableCell className="text-emerald-400 font-semibold text-xs">${row.inflows.toLocaleString()}</TableCell>
                                  <TableCell className="text-red-400 font-semibold text-xs">${row.outflows.toLocaleString()}</TableCell>
                                  <TableCell className={cn(
                                    "font-bold text-xs",
                                    row.net >= 0 ? "text-emerald-400" : "text-red-400"
                                  )}>
                                    {row.net >= 0 ? "+" : ""}${row.net.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-white font-semibold text-xs">${row.cumulativeNet.toLocaleString()}</TableCell>
                                  <TableCell className="text-blue-400 font-semibold text-xs">${row.balance.toLocaleString()}</TableCell>
                                  <TableCell className="text-gray-400 text-xs">{row.keyEvent || "-"}</TableCell>
                                </TableRow>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-900 border-white/10 text-white max-w-xs">
                                <div className="text-xs space-y-1">
                                  <div className="font-semibold mb-2">Top Sources on {row.date}</div>
                                  <div className="text-emerald-400">Inflows: Stripe ($8,500), DoorDash ($1,200)</div> {/* Mocked data for tooltip */}
                                  <div className="text-red-400">Outflows: AWS ($3,200), Payroll ($12,500)</div> {/* Mocked data for tooltip */}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Scenario Simulator */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    Scenario Simulator
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-2 block">Scenario Type</label>
                      <Select value={scenarioType} onValueChange={setScenarioType}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                          <SelectItem value="revenue_drop">Revenue Drop</SelectItem>
                          <SelectItem value="expense_surge">Expense Surge</SelectItem>
                          <SelectItem value="delay_payments">Delay Payments</SelectItem>
                          <SelectItem value="increase_payroll">Increase Payroll</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-2 block">Change: {scenarioPercent}%</label>
                      <input
                        type="range"
                        min="-30"
                        max="30"
                        value={scenarioPercent}
                        onChange={(e) => setScenarioPercent(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-2 block">Duration</label>
                      <Select value={scenarioDuration} onValueChange={setScenarioDuration}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                          <SelectItem value="1_week">1 Week</SelectItem>
                          <SelectItem value="1_month">1 Month</SelectItem>
                          <SelectItem value="3_months">3 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <div className="text-sm font-semibold text-white mb-3">Projected Results</div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-gray-400">Projected Ending Balance</div>
                        <div className="text-lg font-bold text-purple-400">$234,500</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Runway Impact</div>
                        <div className="text-lg font-bold text-orange-400">-1.2 months</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Variance vs Current</div>
                        <div className="text-lg font-bold text-red-400">-$12,180</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Risk Level</div>
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Medium</Badge>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="text-xs font-semibold text-white mb-2">Suggested Actions</div>
                      <div className="space-y-1 text-xs text-gray-300">
                        <div>• Delay 2 vendor payments (~$9,500)</div>
                        <div>• Reallocate marketing budget by 15%</div>
                        <div>• Accelerate collections from Beta Inc</div>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={() => navigate(createPageUrl("FPA"))}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Open in Forecast Tab
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Insights */}
            <div className="col-span-4 space-y-4">
              <div className="sticky top-20 space-y-4">
                {/* Liquidity Insights */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm">Liquidity Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-xs text-gray-400 mb-1">Liquidity Ratio</div>
                        <div className="text-lg font-bold text-white">1.45x</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-xs text-gray-400 mb-1">CCC (Days)</div>
                        <div className="text-lg font-bold text-white">38</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-xs text-gray-400 mb-1">Avg Net/Week</div>
                        <div className="text-lg font-bold text-emerald-400">+$4,300</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-xs text-gray-400 mb-1">Days of Cash</div>
                        <div className="text-lg font-bold text-white">184</div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/10">
                      <div className="text-xs font-semibold text-white mb-2">AI Insights</div>
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                        ✓ Net cash inflow trend improving for 3 consecutive days
                      </div>
                      <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300">
                        ⚠️ Liquidity ratio below 1.5x — consider delaying CapEx
                      </div>
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300">
                        ℹ️ High inflow volatility driven by DoorDash payouts
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7 gap-2"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Explain Cash Volatility
                    </Button>
                  </CardContent>
                </Card>

                {/* AI Summary */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowAISummary(!showAISummary)}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        AI Summary
                      </CardTitle>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-6 px-2">
                        {showAISummary ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </CardHeader>
                  {showAISummary && (
                    <CardContent className="pt-0 space-y-3">
                      <p className="text-xs text-gray-300 leading-relaxed">
                        This week's net inflow is <span className="text-emerald-400 font-semibold">$12,300</span>, extending runway by <span className="text-blue-400 font-semibold">0.6 months</span>.
                        <br /><br />
                        Cash stability score: <span className="text-emerald-400 font-semibold">82/100</span> (improving).
                        <br /><br />
                        Top drivers: AWS payment delay (+$3,200 impact), strong Stripe collections.
                      </p>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                          onClick={() => {
                            navigator.clipboard.writeText("This week's net inflow is $12,300, extending runway by 0.6 months...");
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy Summary
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Share to Slack
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* NEW: Weekly Digest Card */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      Weekly Digest
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <p className="text-xs text-gray-300 leading-relaxed">
                      <span className="font-semibold text-white">Week of Feb 4–10:</span>
                      <br />
                      Net inflows: <span className="font-semibold text-emerald-400">+$12,300</span>
                      <br />
                      Runway change: <span className="font-semibold text-blue-400">+0.6 months</span>
                      <br />
                      Top variance driver: <span className="font-semibold text-orange-400">AWS bill delay</span>
                      <br />
                      Liquidity stress: <span className="font-semibold text-emerald-400">Low (65/100)</span>
                      <br />
                      Recommended actions: <span className="font-semibold text-white">Reduce OpEx 3% next week.</span>
                    </p>

                    <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                        onClick={() => {
                          navigator.clipboard.writeText(`Week of Feb 4–10:\nNet inflows: +$12,300\nRunway change: +0.6 months\nTop variance driver: AWS bill delay\nLiquidity stress: Low (65/100)\nRecommended actions: Reduce OpEx 3% next week.`);
                        }}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Summary
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Export PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Share to Slack
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Jump To Section */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm">Quick Navigation</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                      onClick={() => setActiveView("inflows")}
                    >
                      <ArrowRight className="w-3 h-3 mr-2" />
                      View Today's Inflows
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                      onClick={() => setActiveView("outflows")}
                    >
                      <ArrowRight className="w-3 h-3 mr-2" />
                      View Today's Outflows
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                      onClick={() => navigate(createPageUrl("FPA"))}
                    >
                      <ArrowRight className="w-3 h-3 mr-2" />
                      Open FP&A Scenario
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Persistent Copilot Bar */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl border-purple-500/30 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-white">Ask Silkroute</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                >
                  What's driving today's net cash drop?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                >
                  How many days until cash &lt; $200k?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                >
                  If I delay payroll by 3 days, what happens?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                >
                  Which vendors impact liquidity most?
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FORECAST TAB - FULLY ENHANCED */}
        <TabsContent value="forecast" className="mt-6 space-y-6">

          {/* Header with Export Dropdown and Macro Stress Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Forecast & Planning</h3>
              <p className="text-sm text-gray-400 mt-1">Plan, simulate, and optimize future cash performance.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={macroStressMode ? "default" : "outline"}
                size="sm"
                onClick={() => setMacroStressMode(!macroStressMode)}
                className={macroStressMode ?
                  "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 border-0 text-white" :
                  "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                Macro Stress Mode
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={() => setShowBuildForecastModal(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Build Forecast Plan
              </Button>
              <Select defaultValue="none">
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white text-xs h-8">
                  <SelectValue placeholder="Export..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                  <SelectItem value="none">Export...</SelectItem>
                  <SelectItem value="pdf">Export Forecast as PDF</SelectItem>
                  <SelectItem value="scenarios">Export Scenario Comparison</SelectItem>
                  <SelectItem value="investor">Generate Investor Summary</SelectItem>
                  <SelectItem value="slack">Share to Slack</SelectItem>
                  <SelectItem value="fpa">Save to FP&A Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Macro Stress Mode Panel */}
          {macroStressMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="bg-red-500/10 backdrop-blur-xl border-red-500/30 rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Macroeconomic Stress Testing
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-2 block">Interest Rate Change</label>
                      <div className="flex items-center gap-2">
                       <input
                         type="range"
                         min="0"
                         max="2"
                         step="0.1"
                         value={macroInputs.interestRate}
                         onChange={(e) => setMacroInputs({...macroInputs, interestRate: parseFloat(e.target.value)})}
                         className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                       />
                       <span className="text-sm font-semibold text-white w-12 text-right">+{macroInputs.interestRate}%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-2 block">Inflation Impact</label>
                      <div className="flex items-center gap-2">
                       <input
                         type="range"
                         min="0"
                         max="3"
                         step="0.1"
                         value={macroInputs.inflation}
                         onChange={(e) => setMacroInputs({...macroInputs, inflation: parseFloat(e.target.value)})}
                         className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                       />
                       <span className="text-sm font-semibold text-white w-12 text-right">+{macroInputs.inflation}%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-2 block">Stripe Fee Change</label>
                      <div className="flex items-center gap-2">
                       <input
                         type="range"
                         min="0"
                         max="1"
                         step="0.05"
                         value={macroInputs.stripeFee}
                         onChange={(e) => setMacroInputs({...macroInputs, stripeFee: parseFloat(e.target.value)})}
                         className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                       />
                       <span className="text-sm font-semibold text-white w-12 text-right">+{macroInputs.stripeFee}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Projected Impact:</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Runway Change:</span>
                      <span className="text-lg font-bold text-red-400">-0.8 months</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-white">Cash Impact:</span>
                      <span className="text-lg font-bold text-red-400">-$8,200</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* NEW: Forecast Engine Controls */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
            <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowEngineControls(!showEngineControls)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-400" />
                  Forecast Engine Controls
                </CardTitle>
                <div className="flex items-center gap-2">
                  {showEngineControls && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Save configuration
                      }}
                    >
                      Save Configuration
                    </Button>
                  )}
                  <ChevronDown className={cn(
                    "w-4 h-4 text-gray-400 transition-transform",
                    showEngineControls && "rotate-180"
                  )} />
                </div>
              </div>
            </CardHeader>
            {showEngineControls && (
              <CardContent className="pt-0 space-y-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 mb-2 cursor-help">
                        <Info className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-400">This defines how Silkroute's AI projects future trends</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-900 border-white/10 text-white max-w-xs">
                      <p className="text-xs">Adjust these controls to fine-tune the forecast engine's behavior and confidence levels</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-400">Forecast Sensitivity</label>
                      <span className="text-xs text-white">{forecastSensitivity < 33 ? "Cautious" : forecastSensitivity > 66 ? "Aggressive" : "Balanced"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-500">Cautious</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={forecastSensitivity}
                        onChange={(e) => setForecastSensitivity(parseInt(e.target.value))}
                        className="flex-1 accent-blue-500"
                      />
                      <span className="text-[10px] text-gray-500">Aggressive</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-400">Confidence Weight</label>
                      <span className="text-xs text-white">{confidenceWeight < 33 ? "Historical" : confidenceWeight > 66 ? "Predictive" : "Mixed"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-500">Historical</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={confidenceWeight}
                        onChange={(e) => setConfidenceWeight(parseInt(e.target.value))}
                        className="flex-1 accent-blue-500"
                      />
                      <span className="text-[10px] text-gray-500">Predictive</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-400">AI Adaptiveness</label>
                      <span className="text-xs text-white">{aiAdaptiveness < 33 ? "Static" : aiAdaptiveness > 66 ? "Dynamic" : "Moderate"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-500">Static</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={aiAdaptiveness}
                        onChange={(e) => setAiAdaptiveness(parseInt(e.target.value))}
                        className="flex-1 accent-blue-500"
                      />
                      <span className="text-[10px] text-gray-500">Dynamic</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-2 block">Smoothing Mode</label>
                    <Select value={smoothingMode} onValueChange={setSmoothingMode}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="rolling">Rolling Average</SelectItem>
                        <SelectItem value="realtime">Real-Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Top Metric Strip with Enhanced Metrics */}
          <div className="space-y-3">
            <div className="flex justify-end">
              <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                {["6W", "13W", "6M", "Custom"].map((range) => (
                  <Button
                    key={range}
                    variant={forecastRange === range ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setForecastRange(range)}
                    className={forecastRange === range ?
                      "bg-blue-600 hover:bg-blue-700 text-white h-6 text-xs px-3" :
                      "text-gray-400 hover:text-white h-6 text-xs px-3"
                    }
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardContent className="p-3">
                  <div className="text-xs text-gray-400 mb-1">Projected Cash (6 Weeks)</div>
                  <div className="text-lg font-bold text-white">$255,000</div>
                  <div className="text-xs text-emerald-400 mt-1">+5.3% vs current</div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardContent className="p-3">
                  <div className="text-xs text-gray-400 mb-1">Variance vs Plan</div>
                  <div className="text-lg font-bold text-white">-$2,400</div>
                  <div className="text-xs text-orange-400 mt-1">-0.9% vs plan</div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardContent className="p-3">
                  <div className="text-xs text-gray-400 mb-1">Avg Weekly Burn</div>
                  <div className="text-lg font-bold text-white">$3,200</div>
                  <div className="text-xs text-emerald-400 mt-1">-4.1% vs last 4W</div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardContent className="p-3">
                  <div className="text-xs text-gray-400 mb-1">Runway (Projected)</div>
                  <div className="text-lg font-bold text-white">19.2 mo</div>
                  <div className="text-xs text-emerald-400 mt-1">+0.8 mo vs current</div>
                </CardContent>
              </Card>

              {/* NEW: Forecast Stability Index */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardContent className="p-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs text-gray-400">Forecast Stability</span>
                            <Info className="w-3 h-3 text-gray-500" />
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-lg font-bold text-emerald-400">88</div>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                              Stable
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <ResponsiveContainer width="100%" height={16}>
                              <LineChart data={[
                                { v: 82 }, { v: 84 }, { v: 86 }, { v: 88 }
                              ]}>
                                <Line
                                  type="monotone"
                                  dataKey="v"
                                  stroke="#10b981"
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 border-white/10 text-white max-w-xs">
                        <div className="space-y-2 text-xs">
                          <div className="font-semibold">Forecast Stability Index</div>
                          <div className="text-gray-300">
                            Composite of variance, data volatility, and external dependencies
                          </div>
                          <div className="pt-2 border-t border-white/10 space-y-1 text-gray-400">
                            <div>• Variance Score: 92%</div>
                            <div>• Data Volatility: 15%</div>
                            <div>• External Deps: Low</div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardContent className="p-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-400">Forecast Confidence</span>
                              <Info className="w-3 h-3 text-gray-500" />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 px-1 text-[10px] text-blue-400 hover:text-blue-300"
                              onClick={() => setShowExplainForecast(true)}
                            >
                              Explain
                            </Button>
                          </div>
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                          >
                            <div className="text-lg font-bold text-emerald-400">84%</div>
                          </motion.div>
                          <div className="text-xs text-gray-400 mt-1">High confidence</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 border-white/10 text-white max-w-xs">
                        <div className="text-xs">
                          <div className="font-semibold mb-1">Confidence Breakdown:</div>
                          <div className="space-y-1 text-gray-300">
                            <div>• Data coverage: 92%</div>
                            <div>• Trend stability: 81%</div>
                            <div>• Variance score: 78%</div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column: Charts and Tables */}
            <div className="col-span-8 space-y-6">
              {/* Enhanced Forecast Chart */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="text-white text-sm">Cash Forecast Projection</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={showConfidenceHeatmap ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowConfidenceHeatmap(!showConfidenceHeatmap)}
                        className={showConfidenceHeatmap ?
                          "bg-purple-600 hover:bg-purple-700 text-white h-6 text-xs" :
                          "bg-white/5 border-white/10 text-white hover:bg-white/10 h-6 text-xs"
                        }
                      >
                        Confidence Heatmap
                      </Button>
                    </div>
                  </div>

                  {/* Toggle Bar */}
                  <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                    {[
                      { value: "cash_flow", label: "Cash Flow" },
                      { value: "revenue", label: "Revenue Forecast" },
                      { value: "expense", label: "Expense Forecast" },
                      { value: "runway", label: "Runway Trend" }
                    ].map((tab) => (
                      <Button
                        key={tab.value}
                        variant={forecastChartView === tab.value ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setForecastChartView(tab.value)}
                        className={forecastChartView === tab.value ?
                          "bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs flex-1" :
                          "text-gray-400 hover:text-white h-7 text-xs flex-1"
                        }
                      >
                        {tab.label}
                      </Button>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {forecastChartView === "cash_flow" && (
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="week" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg p-3 text-xs">
                                  <div className="font-semibold text-white mb-2">{data.week}</div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between gap-4">
                                      <span className="text-emerald-400">Expected Inflows:</span>
                                      <span className="text-white font-semibold">${(data.projected * 0.4).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                      <span className="text-red-400">Expected Outflows:</span>
                                      <span className="text-white font-semibold">${(data.projected * 0.35).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between gap-4 pt-1 border-t border-white/10">
                                      <span className="text-gray-400">Net:</span>
                                      <span className="text-emerald-400 font-bold">+${(data.projected * 0.05).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                      <span className="text-blue-400">Projected Balance:</span>
                                      <span className="text-white font-semibold">${data.projected.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between gap-4 pt-1 border-t border-white/10">
                                      <span className="text-purple-400">Confidence:</span>
                                      <span className="text-white font-semibold">{data.confidence || "85"}%</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend wrapperStyle={{ color: '#fff', fontSize: '11px' }} />

                        {/* Forecast Range Area */}
                        <Area
                          type="monotone"
                          dataKey="high"
                          fill="#3b82f6"
                          fillOpacity={0.2}
                          stroke="none"
                          name="High Case"
                        />
                        <Area
                          type="monotone"
                          dataKey="low"
                          fill="#3b82f6"
                          fillOpacity={0.2}
                          stroke="none"
                          name="Low Case"
                        />

                        {/* Lines */}
                        <Line
                          type="monotone"
                          dataKey="high"
                          stroke="#10b981"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 3, fill: '#10b981' }}
                          name="High Case"
                        />
                        <Line
                          type="monotone"
                          dataKey="projected"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#3b82f6' }}
                          name="Projected"
                        />
                        <Line
                          type="monotone"
                          dataKey="low"
                          stroke="#ef4444"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 3, fill: '#ef4444' }}
                          name="Low Case"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}

                  {forecastChartView === "revenue" && (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { week: "Week 1", Stripe: 15000, DoorDash: 3500, AppStore: 4200, AWS: 2800 },
                        { week: "Week 2", Stripe: 16200, DoorDash: 3800, AppStore: 4100, AWS: 3000 },
                        { week: "Week 3", Stripe: 14800, DoorDash: 3600, AppStore: 4300, AWS: 2900 },
                        { week: "Week 4", Stripe: 17000, DoorDash: 4000, AppStore: 4400, AWS: 3100 },
                        { week: "Week 5", Stripe: 16500, DoorDash: 3700, AppStore: 4200, AWS: 2950 },
                        { week: "Week 6", Stripe: 17500, DoorDash: 4100, AppStore: 4500, AWS: 3200 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="week" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <ChartTooltip
                          formatter={(value) => `$${value.toLocaleString()}`}
                          contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '11px'
                          }}
                        />
                        <Legend wrapperStyle={{ color: '#fff', fontSize: '11px' }} />
                        <Bar dataKey="Stripe" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="DoorDash" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="AppStore" stackId="a" fill="#ec4899" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="AWS" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {forecastChartView === "expense" && (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { week: "Week 1", Payroll: 42500, OpEx: 8900, Tax: 3200 },
                        { week: "Week 2", Payroll: 0, OpEx: 9200, Tax: 0 },
                        { week: "Week 3", Payroll: 42500, OpEx: 8700, Tax: 3200 },
                        { week: "Week 4", Payroll: 0, OpEx: 9500, Tax: 0 },
                        { week: "Week 5", Payroll: 42500, OpEx: 8800, Tax: 3200 },
                        { week: "Week 6", Payroll: 0, OpEx: 9100, Tax: 0 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="week" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <ChartTooltip
                          formatter={(value) => `$${value.toLocaleString()}`}
                          contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '11px'
                          }}
                        />
                        <Legend wrapperStyle={{ color: '#fff', fontSize: '11px' }} />
                        <Bar dataKey="Payroll" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="OpEx" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Tax" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {forecastChartView === "runway" && (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={[
                        { week: "Week 1", runway: 18.4 },
                        { week: "Week 2", runway: 18.6 },
                        { week: "Week 3", runway: 18.8 },
                        { week: "Week 4", runway: 19.0 },
                        { week: "Week 5", runway: 19.1 },
                        { week: "Week 6", runway: 19.2 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="week" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} domain={[17, 20]} />
                        <ChartTooltip
                          formatter={(value) => `${value} months`}
                          contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '11px'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="runway"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#10b981' }}
                          name="Runway (months)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}

                  {/* Confidence Heatmap */}
                  {showConfidenceHeatmap && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="text-xs font-semibold text-white mb-3">Forecast Confidence Heatmap</div>
                      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr] gap-1">
                        <div />
                        {["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"].map((week, idx) => (
                          <div key={idx} className="text-[10px] text-gray-400 text-center mb-1">{week}</div>
                        ))}
                        {[
                          { cat: "Stripe", conf: [95, 93, 90, 88, 85, 82] },
                          { cat: "DoorDash", conf: [67, 70, 68, 65, 63, 60] },
                          { cat: "AppStore", conf: [91, 89, 87, 86, 84, 82] },
                          { cat: "Payroll", conf: [98, 98, 98, 98, 98, 98] },
                          { cat: "OpEx", conf: [85, 83, 81, 79, 77, 75] },
                        ].map((row) => (
                          <React.Fragment key={row.cat}>
                            <div className="text-[10px] text-gray-400 text-right pr-1 flex items-center justify-end">{row.cat}</div>
                            {row.conf.map((conf, idx) => (
                              <TooltipProvider key={idx}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={cn(
                                        "h-8 rounded cursor-help transition-all",
                                        conf >= 90 ? "bg-emerald-500/60" :
                                        conf >= 70 ? "bg-yellow-500/60" :
                                        "bg-red-500/60"
                                      )}
                                    ></div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-gray-900 border-white/10 text-white">
                                    <div className="text-xs">
                                      <div className="font-semibold">{row.cat} - Week {idx + 1}</div>
                                      <div className="text-gray-300">Confidence: {conf}%</div>
                                      {conf < 70 && <div className="text-red-400 mt-1">High uncertainty</div>}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-[10px] justify-center">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-emerald-500/60"></div>
                          <span className="text-gray-400">90-100%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-yellow-500/60"></div>
                          <span className="text-gray-400">70-89%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-red-500/60"></div>
                          <span className="text-gray-400">&lt;70%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* NEW: Forecast Delta Map */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowDeltaMap(!showDeltaMap)}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <BarChart className="w-4 h-4 text-purple-400" />
                      Forecast Delta Map
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {showDeltaMap && (
                        <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                          <Button
                            variant={deltaMapView === "absolute" ? "default" : "ghost"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeltaMapView("absolute");
                            }}
                            className={deltaMapView === "absolute" ?
                              "bg-purple-600 hover:bg-purple-700 text-white h-5 text-[10px] px-2" :
                              "text-gray-400 hover:text-white h-5 text-[10px] px-2"
                            }
                          >
                            $
                          </Button>
                          <Button
                            variant={deltaMapView === "percent" ? "default" : "ghost"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeltaMapView("percent");
                            }}
                            className={deltaMapView === "percent" ?
                              "bg-purple-600 hover:bg-purple-700 text-white h-5 text-[10px] px-2" :
                              "text-gray-400 hover:text-white h-5 text-[10px] px-2"
                            }
                          >
                            %
                          </Button>
                        </div>
                      )}
                      <ChevronDown className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        showDeltaMap && "rotate-180"
                      )} />
                    </div>
                  </div>
                </CardHeader>
                {showDeltaMap && (
                  <CardContent className="pt-0">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { week: "W1", delta: 1200, percent: 2.1, reason: "On track" },
                        { week: "W2", delta: -800, percent: -1.4, reason: "Minor delay" },
                        { week: "W3", delta: 2400, percent: 4.2, reason: "Early payout" },
                        { week: "W4", delta: 6200, percent: 10.8, reason: "Deferred AWS bill" },
                        { week: "W5", delta: -1500, percent: -2.6, reason: "Accelerated payment" },
                        { week: "W6", delta: 300, percent: 0.5, reason: "Stable" },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="week" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg p-3 text-xs">
                                  <div className="font-semibold text-white mb-2">{data.week} Variance</div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between gap-4">
                                      <span className="text-gray-400">Change:</span>
                                      <span className={cn(
                                        "font-semibold",
                                        data.delta > 0 ? "text-emerald-400" : data.delta < 0 ? "text-red-400" : "text-gray-400"
                                      )}>
                                        {deltaMapView === "absolute" ?
                                          `${data.delta > 0 ? "+" : ""}${data.delta.toLocaleString()}` :
                                          `${data.percent > 0 ? "+" : ""}${data.percent}%`
                                        }
                                      </span>
                                    </div>
                                    <div className="pt-1 border-t border-white/10">
                                      <span className="text-gray-400">Reason: </span>
                                      <span className="text-white">{data.reason}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey={deltaMapView === "absolute" ? "delta" : "percent"}
                          radius={[4, 4, 0, 0]}
                        >
                          {[
                            { week: "W1", delta: 1200, percent: 2.1 },
                            { week: "W2", delta: -800, percent: -1.4 },
                            { week: "W3", delta: 2400, percent: 4.2 },
                            { week: "W4", delta: 6200, percent: 10.8 },
                            { week: "W5", delta: -1500, percent: -2.6 },
                            { week: "W6", delta: 300, percent: 0.5 },
                          ].map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.delta > 500 ? "#10b981" : entry.delta < -500 ? "#ef4444" : "#6b7280"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-4 mt-3 text-[10px]">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-emerald-500"></div>
                        <span className="text-gray-400">Positive</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-red-500"></div>
                        <span className="text-gray-400">Negative</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-gray-500"></div>
                        <span className="text-gray-400">Stable</span>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Revenue & Expense Breakdown Charts */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-xs">Revenue by Source (Next 8W)</CardTitle>
                      <Select defaultValue="gross">
                        <SelectTrigger className="w-[80px] bg-white/5 border-white/10 text-white text-[10px] h-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                          <SelectItem value="gross">Gross</SelectItem>
                          <SelectItem value="net">Net</SelectItem>
                          <SelectItem value="percent">% of Total</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={[
                        { week: "W1", Stripe: 15000, DoorDash: 3500, AppStore: 4200, AWS: 2800 },
                        { week: "W2", Stripe: 16200, DoorDash: 3800, AppStore: 4100, AWS: 3000 },
                        { week: "W3", Stripe: 14800, DoorDash: 3600, AppStore: 4300, AWS: 2900 },
                        { week: "W4", Stripe: 17000, DoorDash: 4000, AppStore: 4400, AWS: 3100 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="week" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 9 }} />
                        <ChartTooltip
                          formatter={(value) => `$${value.toLocaleString()}`}
                          contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '10px'
                          }}
                        />
                        <Bar dataKey="Stripe" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="DoorDash" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="AppStore" stackId="a" fill="#ec4899" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="AWS" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="text-[10px] text-gray-400 mt-2">Recurring inflows cover 82% of forecasted expenses</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-xs">Expense by Category (Next 8W)</CardTitle>
                      <Select defaultValue="gross">
                        <SelectTrigger className="w-[80px] bg-white/5 border-white/10 text-white text-[10px] h-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                          <SelectItem value="gross">Gross</SelectItem>
                          <SelectItem value="net">Net</SelectItem>
                          <SelectItem value="percent">% of Total</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={[
                        { week: "W1", Payroll: 42500, OpEx: 8900, Tax: 3200 },
                        { week: "W2", Payroll: 0, OpEx: 9200, Tax: 0 },
                        { week: "W3", Payroll: 42500, OpEx: 8700, Tax: 3200 },
                        { week: "W4", Payroll: 0, OpEx: 9500, Tax: 0 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="week" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 9 }} />
                        <ChartTooltip
                          formatter={(value) => `$${value.toLocaleString()}`}
                          contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '10px'
                          }}
                        />
                        <Bar dataKey="Payroll" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="OpEx" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Tax" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* NEW: Revenue Simulation Stack */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowRevenueSimulation(!showRevenueSimulation)}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      Revenue Simulation Stack
                    </CardTitle>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-gray-400 transition-transform",
                      showRevenueSimulation && "rotate-180"
                    )} />
                  </div>
                </CardHeader>
                {showRevenueSimulation && (
                  <CardContent className="pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Channel Name</label>
                        <Input
                          placeholder="e.g., New Subscription Tier"
                          value={newRevenueChannel.name}
                          onChange={(e) => setNewRevenueChannel({...newRevenueChannel, name: e.target.value})}
                          className="bg-white/5 border-white/10 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Expected Start Week</label>
                        <Select
                          value={newRevenueChannel.start_week.toString()}
                          onValueChange={(value) => setNewRevenueChannel({...newRevenueChannel, start_week: parseInt(value)})}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                            {[1, 2, 3, 4, 5, 6].map(week => (
                              <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Est. Inflow</label>
                        <Input
                          type="number"
                          placeholder="12000"
                          value={newRevenueChannel.inflow}
                          onChange={(e) => setNewRevenueChannel({...newRevenueChannel, inflow: parseInt(e.target.value)})}
                          className="bg-white/5 border-white/10 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Confidence %</label>
                        <Input
                          type="number"
                          placeholder="65"
                          value={newRevenueChannel.confidence}
                          onChange={(e) => setNewRevenueChannel({...newRevenueChannel, confidence: parseInt(e.target.value)})}
                          className="bg-white/5 border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Simulate New Channel Impact
                    </Button>
                    <div className="pt-3 border-t border-white/10 text-xs text-gray-400">
                      Simulated channel will appear as a dashed green line on the forecast chart
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Expected Movements - Enhanced */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">Expected Movements</CardTitle>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="all" onValueChange={setExpectedMovementCategory}>
                        <SelectTrigger className="w-[100px] bg-white/5 border-white/10 text-white text-xs h-7">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="payroll">Payroll</SelectItem>
                          <SelectItem value="opex">OpEx</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="tax">Tax</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select defaultValue="all" onValueChange={setExpectedMovementRisk}>
                        <SelectTrigger className="w-[100px] bg-white/5 border-white/10 text-white text-xs h-7">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                          <SelectItem value="all">All Risks</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select defaultValue="30D" onValueChange={setExpectedMovementTime}>
                        <SelectTrigger className="w-[80px] bg-white/5 border-white/10 text-white text-xs h-7">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                          <SelectItem value="30D">30D</SelectItem>
                          <SelectItem value="60D">60D</SelectItem>
                          <SelectItem value="90D">90D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {[
                     { vendor: "Payroll Run", date: "Feb 28", category: "Payroll", amount: 42500, confidence: 98, tag: "Recurring", risk: "low" },
                     { vendor: "AWS", date: "Mar 1", category: "OpEx", amount: 3200, confidence: 85, tag: "Recurring", risk: "medium" },
                     { vendor: "Stripe Payout", date: "Feb 20", category: "Revenue", amount: 15800, confidence: 92, tag: "Recurring", risk: "low" },
                     { vendor: "Legal Co", date: "Mar 5", category: "OpEx", amount: 8500, confidence: 75, tag: "One-time", risk: "high" },
                    ].map((movement, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedMovement(movement);
                          setShowScenarioDrawer(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-white">{movement.vendor}</span>
                              <Badge className={cn(
                                "text-[10px]",
                                movement.category === "Payroll" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                movement.category === "OpEx" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                                "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              )}>
                                {movement.category}
                              </Badge>
                              <Badge className={cn(
                                "text-[10px]",
                                movement.tag === "Recurring" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                                "bg-gray-500/20 text-gray-400 border-gray-500/30"
                              )}>
                                {movement.tag}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>{movement.date}</span>
                              <span>•</span>
                              <span>Confidence: {movement.confidence}%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "text-lg font-bold",
                              movement.category === "Revenue" ? "text-emerald-400" : "text-white"
                            )}>
                              {movement.category === "Revenue" ? "+" : ""}${movement.amount.toLocaleString()}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-6 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMovement(movement);
                                setShowScenarioDrawer(true);
                              }}
                            >
                              Simulate Impact
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Scenario Comparison with Library */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowScenarioComparison(!showScenarioComparison)}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">Scenario Comparison</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Reset to base case
                        }}
                      >
                        Reset to Base Case
                      </Button>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        showScenarioComparison && "rotate-180"
                      )} />
                    </div>
                  </div>
                </CardHeader>
                {showScenarioComparison && (
                  <CardContent className="pt-0 space-y-4">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-gray-400 text-xs">Scenario</TableHead>
                            <TableHead className="text-gray-400 text-xs">Runway</TableHead>
                            <TableHead className="text-gray-400 text-xs">Ending Balance</TableHead>
                            <TableHead className="text-gray-400 text-xs">Risk Level</TableHead>
                            <TableHead className="text-gray-400 text-xs">Confidence</TableHead>
                            <TableHead className="text-gray-400 text-xs">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { name: "Base Case", runway: "18.4 mo", balance: "$234,500", risk: "Low", confidence: "94%" },
                            { name: "Revenue Drop (-15%)", runway: "17.2 mo", balance: "$220,100", risk: "Medium", confidence: "81%" },
                            { name: "Add 2 Hires", runway: "16.3 mo", balance: "$212,800", risk: "High", confidence: "73%" },
                          ].map((scenario, idx) => (
                            <TableRow key={idx} className="border-white/10 hover:bg-white/5 cursor-pointer transition-all">
                              <TableCell className="font-medium text-white text-xs">{scenario.name}</TableCell>
                              <TableCell className="text-white text-xs">{scenario.runway}</TableCell>
                              <TableCell className="text-white text-xs">{scenario.balance}</TableCell>
                              <TableCell>
                                <Badge className={cn(
                                  "text-[10px]",
                                  scenario.risk === "Low" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                                  scenario.risk === "Medium" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                                  "bg-red-500/20 text-red-400 border-red-500/30"
                                )}>
                                  {scenario.risk}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-white text-xs">{scenario.confidence}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-400 hover:text-blue-300 h-6 px-2 text-xs"
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* NEW: Scenario Library */}
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setShowScenarioLibrary(!showScenarioLibrary)}>
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                          <Folder className="w-4 h-4 text-purple-400" />
                          Scenario Library
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Save current simulation
                            }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Save Current
                          </Button>
                          <ChevronDown className={cn(
                            "w-4 h-4 text-gray-400 transition-transform",
                            showScenarioLibrary && "rotate-180"
                          )} />
                        </div>
                      </div>

                      {showScenarioLibrary && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="origin-top" // Ensures animation scales from the top
                        >
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                  <TableHead className="text-gray-400 text-xs">Name</TableHead>
                                  <TableHead className="text-gray-400 text-xs">Created On</TableHead>
                                  <TableHead className="text-gray-400 text-xs">Runway</TableHead>
                                  <TableHead className="text-gray-400 text-xs">Confidence</TableHead>
                                  <TableHead className="text-gray-400 text-xs">Tags</TableHead>
                                  <TableHead className="text-gray-400 text-xs">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {[
                                  { name: "Base Case", created: "Feb 10", runway: "18.4 mo", confidence: "92%", tag: "baseline" },
                                  { name: "Revenue Drop (-10%)", created: "Feb 9", runway: "17.3 mo", confidence: "84%", tag: "risk" },
                                  { name: "2 New Hires", created: "Feb 8", runway: "16.1 mo", confidence: "75%", tag: "growth" },
                                ].map((scenario, idx) => (
                                  <TableRow key={idx} className="border-white/10 hover:bg-white/5 transition-all">
                                    <TableCell className="font-medium text-white text-xs">{scenario.name}</TableCell>
                                    <TableCell className="text-gray-400 text-xs">{scenario.created}</TableCell>
                                    <TableCell className="text-white text-xs">{scenario.runway}</TableCell>
                                    <TableCell className="text-white text-xs">{scenario.confidence}</TableCell>
                                    <TableCell>
                                      <Badge className={cn(
                                        "text-[10px]",
                                        scenario.tag === "baseline" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                                        scenario.tag === "risk" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                        "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                      )}>
                                        {scenario.tag}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-blue-400 hover:text-blue-300 h-5 px-2 text-[10px]"
                                        >
                                          Open
                                        </Button>
                                        {idx !== 0 && (
                                          <>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="text-gray-400 hover:text-gray-300 h-5 px-2 text-[10px]"
                                            >
                                              Rename
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="text-red-400 hover:text-red-300 h-5 px-2 text-[10px]"
                                            >
                                              Delete
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Enhanced Runway Optimizer with FP&A Sync */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      Runway Optimizer
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Select value={syncedFPAPlan || "none"} onValueChange={setSyncedFPAPlan}>
                        <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white text-xs h-7">
                          <SelectValue placeholder="Sync with FP&A" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                          <SelectItem value="none">No sync</SelectItem>
                          <SelectItem value="fy2025">FY2025 Plan</SelectItem>
                          <SelectItem value="q1_2025">Q1 2025 Plan</SelectItem>
                        </SelectContent>
                      </Select>
                      {syncedFPAPlan && syncedFPAPlan !== "none" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                        >
                          Lock as Baseline
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {syncedFPAPlan && syncedFPAPlan !== "none" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300"
                    >
                      Current forecast within <span className="font-semibold">1.8%</span> of {syncedFPAPlan === "fy2025" ? "FY2025 Plan" : "Q1 2025 Plan"}
                    </motion.div>
                  )}

                  <p className="text-xs text-gray-300 leading-relaxed">
                    Extending runway by <span className="font-semibold text-white">3 months</span> requires a <span className="font-semibold text-orange-400">$15,200/month</span> reduction.
                  </p>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-white mb-2">Top Levers:</div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                      • Reduce Legal Co spend (<span className="text-red-400">-$8.5k</span>)
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                      • Delay SaaS renewals (<span className="text-red-400">-$3.2k</span>)
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                      • Improve Stripe collection rate (<span className="text-emerald-400">+$4.6k</span>)
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                    >
                      Simulate 3-Month Extension
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs h-7"
                    >
                      Apply Adjustments
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* NEW: AI Lookback Summary */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowAILookback(!showAILookback)}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <History className="w-4 h-4 text-indigo-400" />
                      AI Lookback Summary
                    </CardTitle>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-gray-400 transition-transform",
                      showAILookback && "rotate-180"
                    )} />
                  </div>
                </CardHeader>
                {showAILookback && (
                  <CardContent className="pt-0 space-y-3">
                    <p className="text-xs text-gray-300 leading-relaxed">
                      <span className="font-semibold text-white">Last month's forecast accuracy: 93%</span>
                      <br /><br />
                      <span className="text-gray-400">Top variance drivers:</span>
                      <br />
                      • Unexpected DoorDash delay (<span className="text-red-400">-$8.5k</span>)
                      <br />
                      • Payroll under budget (<span className="text-emerald-400">+$2.4k</span>)
                      <br /><br />
                      AI has adjusted predictive weights accordingly (<span className="text-emerald-400">+4% accuracy</span>).
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                    >
                      <History className="w-3 h-3 mr-1" />
                      View Past Forecasts
                    </Button>
                  </CardContent>
                )}
              </Card>

              {/* AI Forecast Narrative - Collapsible */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowForecastNarrative(!showForecastNarrative)}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      AI Forecast Narrative
                    </CardTitle>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-gray-400 transition-transform",
                      showForecastNarrative && "rotate-180"
                    )} />
                  </div>
                </CardHeader>
                {showForecastNarrative && (
                  <CardContent className="pt-0 space-y-3">
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Over the next <span className="font-semibold text-white">6 weeks</span>, projected balance remains steady at <span className="font-semibold text-blue-400">$234k</span>,
                      but runway may drop by <span className="font-semibold text-orange-400">1.2 months</span> due to upcoming payroll and OpEx.
                      <br /><br />
                      AI confidence: <span className="font-semibold text-emerald-400">84%</span>.
                      <br /><br />
                      Suggested optimization: defer Legal Co payment to Week 5.
                    </p>

                    <div className="flex gap-2 pt-3 border-t border-white/10">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                        onClick={() => {
                          navigator.clipboard.writeText("Over the next 6 weeks, projected balance remains steady at $234k...");
                        }}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Summary
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Send to Stakeholders
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                      >
                        View Breakdown
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Right Column: Insights and Quick Links */}
            <div className="col-span-4 space-y-4">
              <div className="sticky top-20 space-y-4">
                {/* AI Forecast Insights with Expense Drift Detector */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        AI Forecast Insights
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-400 hover:text-purple-300 h-6 px-2 text-xs"
                        onClick={() => setShowExplainForecast(true)}
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Explain Confidence
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                      ✓ Cash runway stable — within 2% variance of last plan
                    </div>
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300">
                      ⚠️ High variance risk detected in Payroll (next 3 weeks)
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300">
                      ℹ️ Revenue dependency: 68% from Stripe — monitor volatility
                    </div>
                  </CardContent>
                </Card>

                {/* NEW: Expense Drift Detector */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                      Expense Drift Detector
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300"
                    >
                      • Marketing spend trending <span className="font-semibold">18% above plan</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-300"
                    >
                      • SaaS renewals spiking Week 3
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300"
                    >
                      • Legal Co payment moved <span className="font-semibold">5 days earlier</span> than expected
                    </motion.div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs mt-2"
                    >
                      <Bell className="w-3 h-3 mr-1" />
                      Create Alert Rule
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-8"
                      onClick={() => setActiveView("netflow")}
                    >
                      <ArrowRight className="w-3 h-3 mr-2" />
                      View Source Data in Net Flow
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-8"
                      onClick={() => navigate(createPageUrl("FPA"))}
                    >
                      <ArrowRight className="w-3 h-3 mr-2" />
                      Open Matching FP&A Scenario
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-8"
                    >
                      <ArrowRight className="w-3 h-3 mr-2" />
                      Compare with Last Forecast
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-8"
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Download Forecast PDF
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Persistent Copilot Bar - Dynamic for Forecast Tab */}
          <Card className="bg-purple-500/10 backdrop-blur-xl border-purple-500/30 rounded-xl sticky bottom-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-semibold text-white">Ask Silkroute about your forecast</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "What's my projected balance in 3 months?",
                  "Which scenario gives the longest runway?",
                  "Simulate a 10% drop in Stripe revenue",
                  "Explain why forecast confidence dropped this week"
                ].map((prompt, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="outline"
                    className="bg-white/5 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs h-7"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Customer Detail Drawer */}
      <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-gray-900/95 backdrop-blur-xl border-white/10 text-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{selectedCustomer?.[0]}</span>
              </div>
              {selectedCustomer}
            </SheetTitle>
          </SheetHeader>
          {selectedCustomer && customerHistory[selectedCustomer] && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Total Revenue YTD</div>
                  <div className="text-2xl font-bold text-white">${customerHistory[selectedCustomer].totalYTD.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Avg Payout Delay</div>
                  <div className="text-2xl font-bold text-white">{customerHistory[selectedCustomer].avgDelay} days</div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="text-sm text-gray-500 mb-2">Channels Used</div>
                <div className="flex gap-2">
                  {customerHistory[selectedCustomer].channels.map((channel, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white/5 border-white/20 text-white">
                      {channel}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="text-sm text-gray-500 mb-3">Historical Revenue (6 Months)</div>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={customerHistory[selectedCustomer].monthlyData.map((val, idx) => ({ month: idx + 1, revenue: val }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                    <ChartTooltip
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="text-sm text-gray-500 mb-2">Tags</div>
                <div className="flex gap-2 flex-wrap">
                  {customerHistory[selectedCustomer].tags.map((tag, idx) => (
                    <Badge key={idx} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="text-sm text-gray-500 mb-2">Payment Predictability Score</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      style={{ width: `${customerHistory[selectedCustomer].predictabilityScore}%` }}
                    ></div>
                  </div>
                  <span className="text-xl font-bold text-white">{customerHistory[selectedCustomer].predictabilityScore}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">View All Transactions</Button>
                <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10">
                  Add Note
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <MessageCircle className="w-4 h-4" />
                  Predict Next Month's Payment
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Enhanced Transaction/Vendor Detail Sheet */}
      <Sheet open={!!selectedTransaction || !!selectedVendor} onOpenChange={(open) => {
        if (!open) {
          setSelectedTransaction(null);
          setSelectedVendor(null);
          setVendorCopilotQuery(""); // Clear copilot query when closing
          setHoveredBill(null); // Clear hovered bill
          setShowImpactPreview(false); // Hide impact preview
        }
      }}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-gray-900/95 backdrop-blur-xl border-white/10 text-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-white">
              {selectedTransaction?.type === "inflow" ? "Receipt Details" : selectedVendor ? "Vendor Profile" : "Bill Details"}
            </SheetTitle>
          </SheetHeader>

          {/* NEW: Vendor Profile with Copilot */}
          {selectedVendor && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{selectedVendor?.[0]}</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{selectedVendor}</div>
                  <div className="text-xs text-gray-400">Active Vendor</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Total Spend YTD</div>
                  <div className="text-2xl font-bold text-white">$42,500</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Avg Payment Delay</div>
                  <div className="text-2xl font-bold text-white">3 days</div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="text-sm text-gray-500 mb-2">Category & Tags</div>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">OpEx</Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Recurring</Badge>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Legal</Badge>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="text-sm text-gray-500 mb-3">Payment History (6 Months)</div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={[
                    { month: "Jul", amount: 6000 },
                    { month: "Aug", amount: 6500 },
                    { month: "Sep", amount: 7000 },
                    { month: "Oct", amount: 7200 },
                    { month: "Nov", amount: 7500 },
                    { month: "Dec", amount: 8300 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                    <ChartTooltip
                      formatter={(value) => `$${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* AI Copilot Section */}
              <div className="border-t border-white/10 pt-4">
                <div className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Ask Silkroute About This Vendor
                </div>

                <div className="space-y-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                    onClick={() => setVendorCopilotQuery("Why is this vendor's spend increasing?")}
                  >
                    <MessageCircle className="w-3 h-3 mr-2" />
                    Why is this vendor's spend increasing?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                    onClick={() => setVendorCopilotQuery("Can we defer their payment safely?")}
                  >
                    <Clock className="w-3 h-3 mr-2" />
                    Can we defer their payment safely?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                    onClick={() => setVendorCopilotQuery("Is this vendor under any policy limits?")}
                  >
                    <AlertCircle className="w-3 h-3 mr-2" />
                    Is this vendor under any policy limits?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                    onClick={() => setVendorCopilotQuery("Forecast next 3 months' spend with them")}
                  >
                    <TrendingUp className="w-3 h-3 mr-2" />
                    Forecast next 3 months' spend with them
                  </Button>
                </div>

                {vendorCopilotQuery && (
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <div className="text-xs text-purple-300 mb-2 font-semibold">AI Response:</div>
                    <p className="text-xs text-white mb-3">
                      Based on the last 6 months, this vendor's spend is increasing at ~8% MoM, primarily due to expanded retainer services. Next 3 months forecast: $8,800, $9,200, $9,600.
                    </p>
                    <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-6">
                      View Related Bills
                    </Button>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">View All Bills</Button>
                <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10">
                  Freeze Future Payments
                </Button>
                <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10">
                  <Target className="w-4 h-4 mr-2" />
                  Predict Next Invoice
                </Button>
              </div>
            </div>
          )}

          {selectedTransaction && selectedTransaction.type === "inflow" && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium text-white">{format(new Date(selectedTransaction.date), 'MMM d, yyyy')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Source</div>
                  <div className="font-medium text-white">{selectedTransaction.source}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Customer</div>
                  <div className="font-medium text-white">{selectedTransaction.customer}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <Badge className={selectedTransaction.status === "Paid" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gross Amount</span>
                    <span className="font-semibold text-white">${selectedTransaction.gross.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-400">
                    <span>Processing Fees</span>
                    <span>-${selectedTransaction.fees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-2">
                    <span className="text-white">Net Amount</span>
                    <span className="text-emerald-400">${selectedTransaction.net.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <MessageCircle className="w-4 h-4" />
                  Explain Fees
                </Button>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="text-sm text-gray-500 mb-2">Related Invoice</div>
                <div className="text-blue-400 hover:underline cursor-pointer">{selectedTransaction.invoice_ref}</div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="text-sm text-gray-500 mb-2">Transaction ID</div>
                <div className="text-white">{selectedTransaction.transaction_id}</div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="text-sm text-gray-500 mb-2">Payout Delay</div>
                <div className="text-white">{selectedTransaction.payout_delay} days</div>
              </div>
            </div>
          )}

          {selectedTransaction && selectedTransaction.type === "outflow" && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Vendor</div>
                  <div className="font-medium text-white">{selectedTransaction.vendor}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Due Date</div>
                  <div className="font-medium text-white">{format(new Date(selectedTransaction.due_date), 'MMM d, yyyy')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="font-medium text-white">{selectedTransaction.category}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <Badge className={cn(
                    "text-xs",
                    selectedTransaction.status === "Paid" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                    selectedTransaction.status === "Approved" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                    selectedTransaction.status === "Scheduled" && "bg-purple-500/20 text-purple-400 border-purple-500/30",
                    selectedTransaction.status === "Draft" && "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  )}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="text-lg font-bold text-white">
                  Amount: ${selectedTransaction.amount.toLocaleString()}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                {selectedTransaction.status === "Draft" && (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Approve</Button>
                )}
                {selectedTransaction.status === "Approved" && (
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Schedule Payment</Button>
                )}
                {selectedTransaction.status === "Scheduled" && (
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Mark as Paid</Button>
                )}
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <MessageCircle className="w-4 h-4" />
                  Ask AI: Can we afford this?
                </Button>
              </div>

              {selectedTransaction.tags && (
                <div className="border-t border-white/10 pt-4">
                  <div className="text-sm text-gray-500 mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTransaction.tags.split(',').map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="bg-white/5 border-white/20 text-white">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Day Statement Detail Drawer */}
      <Sheet open={!!selectedDayStatement} onOpenChange={(open) => !open && setSelectedDayStatement(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-gray-900/95 backdrop-blur-xl border-white/10 text-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-white">Daily Transactions: {selectedDayStatement?.date}</SheetTitle>
          </SheetHeader>
          {selectedDayStatement && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Inflows</div>
                  <div className="text-xl font-bold text-emerald-400">${selectedDayStatement.inflows.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Outflows</div>
                  <div className="text-xl font-bold text-red-400">${selectedDayStatement.outflows.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Net</div>
                  <div className={cn(
                    "text-xl font-bold",
                    selectedDayStatement.net >= 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {selectedDayStatement.net >= 0 ? "+" : ""}${selectedDayStatement.net.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-start gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs font-semibold text-white">AI Summary</div>
                </div>
                <p className="text-xs text-purple-300 leading-relaxed">
                  Cash improved $8k due to delayed Legal Co payment and early DoorDash payout. OpEx was 12% below average.
                </p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="text-sm font-semibold text-white mb-3">All Transactions</div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-xs font-medium text-white">Stripe Payout</div>
                      <div className="text-sm font-bold text-emerald-400">+$8,500</div>
                    </div>
                    <div className="text-xs text-gray-400">10:30 AM</div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-xs font-medium text-white">DoorDash Payout</div>
                      <div className="text-sm font-bold text-emerald-400">+$1,200</div>
                    </div>
                    <div className="text-xs text-gray-400">2:15 PM</div>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-xs font-medium text-white">AWS Bill</div>
                      <div className="text-sm font-bold text-red-400">-$3,200</div>
                    </div>
                    <div className="text-xs text-gray-400">9:00 AM</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setActiveView("inflows")}
                >
                  View All Inflows That Day
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                  onClick={() => setActiveView("outflows")}
                >
                  View All Outflows That Day
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Anomaly Investigation Drawer */}
      <Sheet open={!!selectedAnomaly} onOpenChange={(open) => !open && setSelectedAnomaly(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-gray-900/95 backdrop-blur-xl border-white/10 text-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-white">Cash Anomaly Investigation</SheetTitle>
          </SheetHeader>
          {selectedAnomaly && (
            <div className="mt-6 space-y-6">
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="text-sm font-semibold text-white mb-2">Detected on Feb 8, 2026</div>
                <p className="text-xs text-orange-300 leading-relaxed">
                  Net flow deviated 18% from the 7-day average. This was caused by:
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-white mb-2">Contributing Factors</div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-start gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-white mb-1">DoorDash Payout Delay</div>
                      <div className="text-xs text-gray-400">Expected $1,200 payout was delayed by 2 days</div>
                      <div className="text-sm font-bold text-red-400 mt-1">-$1,200 impact</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-white mb-1">Increased AWS OpEx</div>
                      <div className="text-xs text-gray-400">AWS bill was 15% higher than forecast</div>
                      <div className="text-sm font-bold text-red-400 mt-1">-$450 impact</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 gap-2">
                  <Bell className="w-4 h-4" />
                  Create Alert Rule
                </Button>
                <p className="text-xs text-gray-400 mt-2">
                  Get notified when net flow deviates &gt;15% from average
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* NEW: Scenario Simulation Drawer */}
      <Sheet open={showScenarioDrawer} onOpenChange={setShowScenarioDrawer}>
        <SheetContent className="w-[500px] overflow-y-auto bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
          <SheetHeader>
            <SheetTitle className="text-white">Scenario Simulation</SheetTitle>
          </SheetHeader>
          {selectedMovement && (
            <div className="mt-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Scenario Name</label>
                <Input
                  placeholder="e.g., Delay AWS Payment"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Scenario Type</label>
                <Select defaultValue="expense_spike">
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                    <SelectItem value="expense_spike">Expense Spike</SelectItem>
                    <SelectItem value="revenue_drop">Revenue Drop</SelectItem>
                    <SelectItem value="delay_payout">Delay Payout</SelectItem>
                    <SelectItem value="add_hire">Add Hire</SelectItem>
                    <SelectItem value="capex">CapEx</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Change %</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    defaultValue="0"
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-sm font-semibold text-white w-12 text-right">0%</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Duration</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10">
                    1 Week
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10">
                    1 Month
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10">
                    3 Months
                  </Button>
                </div>
              </div>

              {/* Output Box */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                <div className="text-sm font-semibold text-white mb-3">Simulation Results</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-400">New Ending Balance</div>
                    <div className="text-lg font-bold text-white">$231,300</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Runway Change</div>
                    <div className="text-lg font-bold text-orange-400">-0.4 mo</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Risk Level</div>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Medium</Badge>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Confidence</div>
                    <div className="text-sm font-semibold text-white">78%</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="text-xs text-gray-400 mb-1">AI Explanation:</div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Delaying this expense by 1 week reduces immediate cash outflow, improving short-term runway by 0.2 months. However, total impact is minimal due to recurring nature.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Save Scenario
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Compare to Base
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate(createPageUrl("FPA"))}
                >
                  Send to FP&A
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* NEW: Build Forecast Plan Modal */}
      {showBuildForecastModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create Planning Scenario</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBuildForecastModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Forecast Start Month</label>
                  <Select defaultValue="jan2025">
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                     <SelectItem value="mar2026">Mar 2026</SelectItem>
                     <SelectItem value="apr2026">Apr 2026</SelectItem>
                     <SelectItem value="may2026">May 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Horizon</label>
                  <Select defaultValue="6M">
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                      <SelectItem value="6M">6 Months</SelectItem>
                      <SelectItem value="12M">12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Revenue Growth Assumption (%)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Expense Growth Assumption (%)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 3"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Headcount Plan (+/- employees)</label>
                <Input
                  type="number"
                  placeholder="e.g., +2"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Mock Output */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3 mt-6">
                <div className="text-sm font-semibold text-white mb-3">Projected Results</div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-gray-400">Projected Cash</div>
                    <div className="text-lg font-bold text-white">$298,500</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Runway</div>
                    <div className="text-lg font-bold text-emerald-400">21.3 mo</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Confidence</div>
                    <div className="text-lg font-bold text-white">79%</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={[
                    { month: "Jan", value: 238000 },
                    { month: "Feb", value: 245000 },
                    { month: "Mar", value: 258000 },
                    { month: "Apr", value: 271000 },
                    { month: "May", value: 285000 },
                    { month: "Jun", value: 298500 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 9 }} />
                    <ChartTooltip
                      formatter={(value) => `$${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '10px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                  onClick={() => setShowBuildForecastModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setShowBuildForecastModal(false);
                    navigate(createPageUrl("FPA"));
                  }}
                >
                  Save as FP&A Scenario
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* NEW: Explain Forecast Modal */}
      {showExplainForecast && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">AI Forecast Breakdown</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowExplainForecast(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Data Influence Pie Chart */}
              <div>
                <div className="text-sm font-semibold text-white mb-3">Data Influence Distribution</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Historical Inflows", value: 42, color: "#3b82f6" },
                        { name: "Recurring Patterns", value: 28, color: "#8b5cf6" },
                        { name: "Vendor Seasonality", value: 18, color: "#ec4899" },
                        { name: "External Indexes", value: 12, color: "#f59e0b" },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {[
                        { name: "Historical Inflows", value: 42, color: "#3b82f6" },
                        { name: "Recurring Patterns", value: 28, color: "#8b5cf6" },
                        { name: "Vendor Seasonality", value: 18, color: "#ec4899" },
                        { name: "External Indexes", value: 12, color: "#f59e0b" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-gray-300 leading-relaxed">
                  Forecast confidence (<span className="font-semibold text-emerald-400">84%</span>) driven primarily by stable Stripe inflows and predictable payroll cadence.
                </p>
              </div>

              <div>
                <div className="text-sm font-semibold text-white mb-3">Improve Forecast Accuracy</div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-white">Add more Stripe data history</span>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">+3% accuracy</Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-400" />
                      <span className="text-xs text-white">Connect Bank of America account</span>
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px]">+2% accuracy</Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-white">Tag irregular inflows for model clarity</span>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">+1% accuracy</Badge>
                  </div>
                </div>
              </div>

              <Button
                variant="default"
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowExplainForecast(false)}
              >
                Got it
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}