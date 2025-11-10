import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle, 
  X, CreditCard, Users, FileText, ArrowRight, Info,
  Send, MessageCircle, Sparkles, AlertCircle, Activity, Plus
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { cn } from "@/lib/utils";
import {
  Tooltip as UITooltip,
  TooltipContent as UITooltipContent,
  TooltipProvider,
  TooltipTrigger as UITooltipTrigger,
} from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useExplainableWidget } from "../components/explain/useExplainableWidget";

export default function Overview() {
  const navigate = useNavigate();
  const [includeCreditLine, setIncludeCreditLine] = useState(false);
  const [revenueExpenseView, setRevenueExpenseView] = useState("MTD");
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [plExpanded, setPlExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock KPI Data
  const cashOnHand = 245680;
  const avgMonthlyBurn = 13650;
  const runway = (cashOnHand / avgMonthlyBurn).toFixed(1);
  const creditUtilization = 32;
  
  const kpis = [
    {
      label: "Cash on Hand",
      value: `$${cashOnHand.toLocaleString()}`,
      delta: "+12.3%",
      positive: true,
      icon: DollarSign,
      tooltip: "Total liquid cash across all bank accounts",
      color: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600"
    },
    {
      label: "Avg Monthly Burn",
      value: `$${avgMonthlyBurn.toLocaleString()}`,
      delta: "-3.1%",
      positive: true,
      icon: TrendingDown,
      tooltip: "Average net cash outflow per month over last 3 months",
      color: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Runway",
      value: `${runway} months`,
      delta: "+2 mo",
      positive: true,
      icon: Clock,
      tooltip: "Cash on hand ÷ Average monthly burn rate",
      color: runway < 3 ? "from-red-500 to-pink-500" : runway < 6 ? "from-orange-500 to-yellow-500" : "from-purple-500 to-pink-500",
      warning: runway < 6,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      label: "Credit Utilization",
      value: `${creditUtilization}%`,
      delta: "+5%",
      positive: false,
      icon: CreditCard,
      tooltip: "Current credit used ÷ Total credit available",
      color: "from-indigo-500 to-purple-500",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600"
    }
  ];

  // Cash Balance Data
  const cashBalanceData = [
    { month: "Jul", balance: 180000, creditLine: 250000 },
    { month: "Aug", balance: 195000, creditLine: 250000 },
    { month: "Sep", balance: 210000, creditLine: 250000 },
    { month: "Oct", balance: 225000, creditLine: 250000 },
    { month: "Nov", balance: 238000, creditLine: 250000 },
    { month: "Dec", balance: 245680, creditLine: 250000 },
  ];

  // Revenue vs Expense Data
  const revenueExpenseDataMTD = [
    { month: "Jul", revenue: 75000, expenses: 45000 },
    { month: "Aug", revenue: 82000, expenses: 48000 },
    { month: "Sep", revenue: 79000, expenses: 46000 },
    { month: "Oct", revenue: 88000, expenses: 52000 },
    { month: "Nov", revenue: 91000, expenses: 49000 },
    { month: "Dec", revenue: 89450, expenses: 51220 },
  ];

  const revenueExpenseDataYTD = [
    { month: "Q1", revenue: 225000, expenses: 135000 },
    { month: "Q2", revenue: 245000, expenses: 145000 },
    { month: "Q3", revenue: 268000, expenses: 152000 },
    { month: "Q4", revenue: 268450, expenses: 152220 },
  ];

  // Revenue Mix Data
  const revenueMixData = [
    { name: "Stripe", value: 45, amount: 112500, change: -18 },
    { name: "DoorDash", value: 25, amount: 62500, change: 5 },
    { name: "App Store", value: 20, amount: 50000, change: 12 },
    { name: "AWS", value: 10, amount: 25000, change: -3 },
  ];
  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

  // Top Vendors Data
  const topVendors = [
    { vendor: "AWS", thisMonth: 3200, lastMonth: 2800, tags: "recurring" },
    { vendor: "Office Depot", thisMonth: 850, lastMonth: 450, tags: "" },
    { vendor: "Legal Co", thisMonth: 8500, lastMonth: 5000, tags: "legal" },
  ];

  // Risk & Alerts Data
  const alerts = [
    { id: 1, title: "Sales Tax Filing Due Dec 31", severity: "critical", page: "Taxes", icon: FileText },
    { id: 2, title: "3 Bills Overdue", severity: "warning", page: "MoneyOut", icon: AlertTriangle },
    { id: 3, title: "Payroll Coverage Risk Next Week", severity: "critical", page: "Payroll", icon: Users },
  ];

  // Payroll Coverage Data
  const payrollCoverage = {
    nextPayDate: "Dec 31, 2024",
    grossDue: 42500,
    projectedCash: 38000,
  };
  const shortfall = payrollCoverage.projectedCash - payrollCoverage.grossDue;

  // Collections Data
  const collections = [
    { customer: "Acme Corp", amount: 15000, daysPastDue: 45, lastContact: "Dec 10" },
    { customer: "Beta Solutions", amount: 8500, daysPastDue: 15, lastContact: "Dec 18" },
    { customer: "Gamma LLC", amount: 3200, daysPastDue: 8, lastContact: "Dec 19" },
  ];
  const totalOverdue = collections.reduce((sum, c) => sum + c.amount, 0);

  // Financial Feed Data
  const financialFeed = [
    { time: "10:30 AM", type: "payout", title: "Stripe payout received", amount: 12500, status: "completed", icon: DollarSign, color: "emerald" },
    { time: "9:15 AM", type: "bill", title: "AWS bill due", amount: 3200, status: "pending", icon: CreditCard, color: "orange" },
    { time: "Yesterday", type: "payrun", title: "Payroll processed", amount: 42500, status: "completed", icon: Users, color: "blue" },
    { time: "2 days ago", type: "tax", title: "Sales tax filing reminder", amount: 0, status: "action_needed", icon: FileText, color: "red" },
    { time: "3 days ago", type: "payout", title: "DoorDash payout", amount: 850, status: "completed", icon: DollarSign, color: "emerald" },
  ];

  // Anomaly Data
  const anomalies = [
    { title: "AWS bill 40% higher than normal", value: "+$1,280", severity: "warning", trend: "up" },
    { title: "DoorDash revenue dipped 12%", value: "-$1,950", severity: "info", trend: "down" },
    { title: "Office supplies spike detected", value: "+$400", severity: "warning", trend: "up" },
  ];

  // P&L Data
  const plData = {
    revenue: 89450,
    cogs: 26835,
    grossProfit: 62615,
    opex: 51220,
    net: 11395
  };

  // Next Best Action
  const nextBestAction = {
    title: "Move $20k to payroll buffer",
    description: "Your payroll shortfall risk is high next week. Consider moving funds or delaying $8.5k in non-critical AP.",
    priority: "high",
    actions: [
      { label: "View Cash Flow", link: "Overview" },
      { label: "Review Bills", link: "MoneyOut" }
    ]
  };

  const handleBarClick = (data) => {
    navigate(createPageUrl("FPA") + `?month=${data.month}`);
  };

  const handleSourceClick = (source) => {
    navigate(createPageUrl("MoneyIn") + `?source=${source}`);
  };

  const handleVendorClick = (vendor) => {
    navigate(createPageUrl("MoneyOut") + `?vendor=${vendor}`);
  };

  const dismissAlert = (id) => {
    setDismissedAlerts([...dismissedAlerts, id]);
  };

  const activeAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id));

  // AI Assistant functions
  const quickPrompts = [
    "Why did expenses rise this month?",
    "Summarize key risks",
    "Simulate hiring two employees",
    "Explain my cash flow trend",
    "Show me overdue bills",
    "Do I have enough cash for payroll?"
  ];

  const insights = [
    { text: "Stripe fees increased by 1.2% vs 3-month average", severity: "warning", icon: DollarSign },
    { text: "Payroll shortfall predicted next week", severity: "critical", icon: AlertCircle },
    { text: "Sales tax filing due in 12 days", severity: "warning", icon: TrendingUp }
  ];

  const generateAIResponse = (question) => {
    const responses = {
      "Why did expenses rise this month?": {
        type: "card",
        title: "Expense Analysis",
        content: "Expenses increased by 8.2% mainly due to Legal Co ($8,500) and AWS ($3,200).",
        chart: "expense_variance",
        action: { label: "View Details", link: "MoneyOut" }
      },
      "Do I have enough cash for payroll?": {
        type: "card",
        title: "Payroll Coverage Check",
        content: `Projected cash before payroll: $${payrollCoverage.projectedCash.toLocaleString()} | Gross due: $${payrollCoverage.grossDue.toLocaleString()} | Shortfall: $${Math.abs(shortfall).toLocaleString()}.`,
        highlight: "warning",
        action: { label: "View Suggested Bills", link: "MoneyOut" }
      },
      "Summarize key risks": {
        type: "list",
        title: "Key Risks This Week",
        items: [
          "🔴 Sales tax filing due Dec 31",
          "🟠 3 bills overdue totaling $12,450",
          "🔴 Payroll shortfall of $4,500 projected"
        ]
      },
      "Simulate hiring two employees": {
        type: "card",
        title: "Hiring Impact Simulation",
        content: "Adding 2 employees at avg $110k/year would increase monthly burn to $31,983. New runway: 7.7 months (vs current 18 months).",
        chart: "runway_simulation"
      },
      "Explain my cash flow trend": {
        type: "card",
        title: "Cash Flow Analysis",
        content: "Your cash balance has grown 36% over 6 months. Average monthly net inflow: $10,947. Main drivers: Stripe revenue growth (+15%) and stable operating expenses.",
        chart: "cash_trend"
      },
      "Show me overdue bills": {
        type: "redirect",
        content: "You have 3 overdue bills totaling $12,450. Redirecting to Money Out...",
        action: { label: "Go to Money Out", link: "MoneyOut" }
      }
    };

    return responses[question] || {
      type: "text",
      content: "I can help you with financial insights. Try asking about cash flow, expenses, payroll, or risks."
    };
  };

  const handleSendMessage = (message) => {
    if (!message.trim()) return;
    
    setChatMessages(prev => [...prev, { role: "user", content: message }]);
    setInputMessage("");
    
    setTimeout(() => {
      const response = generateAIResponse(message);
      setChatMessages(prev => [...prev, { role: "assistant", ...response }]);

      if (response.type === "redirect" && response.action?.link) {
        // Optionally navigate after a short delay
        // setTimeout(() => navigate(createPageUrl(response.action.link)), 1500);
      }
    }, 500);
  };

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt);
    handleSendMessage(prompt);
  };

  const renderAIMessage = (msg, idx) => {
    if (msg.role === "user") {
      return (
        <div key={idx} className="flex justify-end mb-3">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl max-w-[80%] text-sm">
            {msg.content}
          </div>
        </div>
      );
    }

    if (msg.type === "card") {
      return (
        <div key={idx} className="mb-4">
          <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                {msg.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-700 leading-relaxed">{msg.content}</p>

              {msg.chart === "expense_variance" && (
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "Legal Co", last: 5000, this: 8500 },
                      { name: "AWS", last: 2800, this: 3200 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value) => `$${value.toLocaleString()}`}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="last" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Last Month" />
                      <Bar dataKey="this" fill="#f59e0b" radius={[4, 4, 0, 0]} name="This Month" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {msg.action && (
                <Button
                  size="sm"
                  onClick={() => navigate(createPageUrl(msg.action.link))}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                >
                  {msg.action.label}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (msg.type === "list") {
      return (
        <div key={idx} className="mb-4">
          <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                {msg.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {msg.items.map((item, i) => (
                  <div key={i} className="text-xs text-slate-700 py-1">
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div key={idx} className="mb-3">
        <div className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-2xl max-w-[85%] text-sm text-slate-700">
          {msg.content}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Top Bar - Management Style */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-slate-700">Last synced: just now</span>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-semibold">
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAiPanelOpen(true)}
              className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 h-8 text-xs font-medium"
            >
              <Info className="w-3 h-3 mr-1.5" />
              Explain This View
            </Button>
            <Button
              size="sm"
              onClick={() => setAiPanelOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-medium"
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              AI Copilot
            </Button>
            <Button
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white h-8 text-xs font-medium"
            >
              <Plus className="w-3 h-3 mr-1.5" />
              Quick Action
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - 4 columns */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, idx) => {
          const { explainableProps } = useExplainableWidget({
            title: kpi.label,
            metric: kpi.value,
            delta: kpi.delta,
            trend: kpi.positive ? 'up' : 'down',
            period: "This Month",
            actions: ['simulate', 'alert', 'create_policy']
          });

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card 
                {...explainableProps}
                className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <TooltipProvider>
                      <UITooltip>
                        <UITooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 cursor-help">
                            <span className="text-xs font-semibold text-slate-600">{kpi.label}</span>
                            <Info className="w-3 h-3 text-slate-400" />
                          </div>
                        </UITooltipTrigger>
                        <UITooltipContent className="bg-slate-900 text-white max-w-xs">
                          <p className="text-xs">{kpi.tooltip}</p>
                        </UITooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                    <div className={cn("p-2.5 rounded-lg", kpi.iconBg)}>
                      <kpi.icon className={cn("w-5 h-5", kpi.iconColor)} />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">{kpi.value}</div>
                    <Badge 
                      className={cn(
                        "text-xs font-semibold",
                        kpi.warning && runway < 3 ? "bg-red-100 text-red-700 border-red-200" :
                        kpi.warning && runway < 6 ? "bg-orange-100 text-orange-700 border-orange-200" :
                        kpi.positive ? "bg-emerald-100 text-emerald-700 border-emerald-200" : 
                        "bg-red-100 text-red-700 border-red-200"
                      )}
                    >
                      {kpi.positive ? <TrendingUp className="w-3 h-3 mr-1 inline" /> : <TrendingDown className="w-3 h-3 mr-1 inline" />}
                      {kpi.delta}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Cash Balance Chart - 6 columns */}
        <Card className="col-span-6 bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 text-base font-bold">Cash Balance Trend</CardTitle>
              <Button
                variant={includeCreditLine ? "default" : "outline"}
                size="sm"
                onClick={() => setIncludeCreditLine(!includeCreditLine)}
                className={includeCreditLine ? 
                  "bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-lg text-xs h-7 px-3 font-medium" : 
                  "border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs h-7 px-3 font-medium"
                }
              >
                Credit Line
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={cashBalanceData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  fill="url(#colorBalance)"
                />
                {includeCreditLine && (
                  <Line 
                    type="monotone" 
                    dataKey="creditLine" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue vs Expenses - 6 columns */}
        <Card className="col-span-6 bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 text-base font-bold">Revenue vs Expenses</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant={revenueExpenseView === "MTD" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRevenueExpenseView("MTD")}
                  className={revenueExpenseView === "MTD" ? 
                    "bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-lg text-xs h-7 px-3 font-medium" : 
                    "border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs h-7 px-3 font-medium"
                  }
                >
                  MTD
                </Button>
                <Button
                  variant={revenueExpenseView === "YTD" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRevenueExpenseView("YTD")}
                  className={revenueExpenseView === "YTD" ? 
                    "bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-lg text-xs h-7 px-3 font-medium" : 
                    "border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs h-7 px-3 font-medium"
                  }
                >
                  YTD
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart 
                data={revenueExpenseView === "MTD" ? revenueExpenseDataMTD : revenueExpenseDataYTD}
                onClick={(data) => data?.activePayload && handleBarClick(data.activePayload[0].payload)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} cursor="pointer" />
                <Bar dataKey="expenses" fill="#f59e0b" radius={[6, 6, 0, 0]} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Mix - 3 columns */}
        <Card className="col-span-3 bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-900 text-base font-bold">Revenue Mix</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={revenueMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {revenueMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value}% ($${props.payload.amount.toLocaleString()})`, name]}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {revenueMixData.map((source, idx) => (
                <button
                  key={source.name}
                  onClick={() => handleSourceClick(source.name)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all text-xs text-slate-700 font-medium"
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span>{source.name}</span>
                  <span className="text-slate-500">{source.value}%</span>
                  {source.change < -15 && (
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Vendors - 3 columns */}
        <Card className="col-span-3 bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-900 text-base font-bold">Top Vendors</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="text-slate-600 text-xs h-8 font-semibold">Vendor</TableHead>
                    <TableHead className="text-slate-600 text-xs h-8 font-semibold text-right">This Mo</TableHead>
                    <TableHead className="text-slate-600 text-xs h-8 font-semibold text-right">Δ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topVendors.map((vendor, idx) => {
                    const variance = ((vendor.thisMonth - vendor.lastMonth) / vendor.lastMonth * 100).toFixed(1);
                    const varianceNum = parseFloat(variance);
                    return (
                      <TableRow 
                        key={idx} 
                        className="cursor-pointer hover:bg-slate-50 border-slate-200 transition-all h-10"
                        onClick={() => handleVendorClick(vendor.vendor)}
                      >
                        <TableCell className="font-semibold text-slate-900 text-sm">{vendor.vendor}</TableCell>
                        <TableCell className="text-slate-900 text-sm font-medium text-right">${vendor.thisMonth.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={cn(
                            "text-xs font-semibold",
                            varianceNum > 40 ? "bg-red-100 text-red-700 border-red-200" :
                            varianceNum > 20 ? "bg-amber-100 text-amber-700 border-amber-200" :
                            "bg-slate-100 text-slate-700 border-slate-200"
                          )}>
                            {varianceNum > 0 ? '+' : ''}{variance}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Risk & Alerts - 3 columns */}
        <Card className="col-span-3 bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-900 text-base font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {activeAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                  <CheckCircle className="w-8 h-8 mb-2 text-emerald-500" />
                  <p className="text-xs font-medium text-slate-600">All clear!</p>
                </div>
              ) : (
                activeAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer hover:shadow-sm transition-all",
                      alert.severity === "critical" ? "bg-red-50 border-red-200 hover:border-red-300" : "bg-amber-50 border-amber-200 hover:border-amber-300"
                    )}
                    onClick={() => navigate(createPageUrl(alert.page))}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "p-2 rounded-lg",
                        alert.severity === "critical" ? "bg-red-100" : "bg-amber-100"
                      )}>
                        <alert.icon className={cn(
                          "w-4 h-4",
                          alert.severity === "critical" ? "text-red-600" : "text-amber-600"
                        )} />
                      </div>
                      <p className="text-slate-900 font-semibold text-sm">{alert.title}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissAlert(alert.id);
                      }}
                      className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 h-6 w-6"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Collections - 3 columns */}
        <Card className="col-span-3 bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 text-sm font-bold">Collections</CardTitle>
              <Badge className={cn(
                "text-xs font-semibold",
                totalOverdue > 50000 ? "bg-red-100 text-red-700 border-red-200" :
                totalOverdue > 10000 ? "bg-amber-100 text-amber-700 border-amber-200" :
                "bg-emerald-100 text-emerald-700 border-emerald-200"
              )}>
                ${totalOverdue.toLocaleString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {collections.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">{item.customer}</div>
                    <div className="text-xs text-slate-600">${item.amount.toLocaleString()}</div>
                  </div>
                  <Badge className={cn(
                    "text-xs font-semibold",
                    item.daysPastDue > 30 ? "bg-red-100 text-red-700 border-red-200" :
                    item.daysPastDue > 15 ? "bg-amber-100 text-amber-700 border-amber-200" :
                    "bg-slate-100 text-slate-700 border-slate-200"
                  )}>
                    {item.daysPastDue}d
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Feed - 4 columns */}
        <Card className="col-span-4 bg-white border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-900 text-base font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[240px] overflow-y-auto">
              {financialFeed.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer">
                  <div className={cn(
                    "p-2 rounded-lg",
                    item.color === "emerald" && "bg-emerald-100",
                    item.color === "orange" && "bg-orange-100",
                    item.color === "blue" && "bg-blue-100",
                    item.color === "red" && "bg-red-100"
                  )}>
                    <item.icon className={cn(
                      "w-4 h-4",
                      item.color === "emerald" && "text-emerald-600",
                      item.color === "orange" && "text-orange-600",
                      item.color === "blue" && "text-blue-600",
                      item.color === "red" && "text-red-600"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">{item.title}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">{item.time}</span>
                      {item.amount > 0 && (
                        <span className="text-xs font-semibold text-slate-900">${item.amount.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Anomaly Widget - 4 columns */}
        <Card className="col-span-4 bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-900 text-base font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Unusual Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2.5">
              {anomalies.map((anomaly, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs text-slate-900 font-semibold flex-1">{anomaly.title}</p>
                    {anomaly.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-orange-500 flex-shrink-0 ml-2" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={cn(
                      "text-xs font-semibold",
                      anomaly.severity === "warning" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-blue-100 text-blue-700 border-blue-200"
                    )}>
                      {anomaly.severity === "warning" ? "Warning" : "Info"}
                    </Badge>
                    <span className={cn(
                      "text-sm font-bold",
                      anomaly.trend === "up" ? "text-orange-600" : "text-blue-600"
                    )}>
                      {anomaly.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mini P&L Snapshot - 4 columns */}
        <Card className="col-span-4 bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 text-base font-bold">P&L Snapshot (MTD)</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPlExpanded(!plExpanded)}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-6 px-2 text-xs"
              >
                {plExpanded ? "Collapse" : "Expand"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 font-medium">Revenue</span>
                <span className="text-lg font-bold text-emerald-600">${plData.revenue.toLocaleString()}</span>
              </div>
              
              {plExpanded && (
                <>
                  <div className="flex justify-between items-center pl-3 border-l-2 border-slate-200">
                    <span className="text-sm text-slate-600 font-medium">COGS</span>
                    <span className="text-base font-semibold text-red-600">-${plData.cogs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-sm text-slate-900">Gross Profit</span>
                    <span className="text-base font-bold text-slate-900">${plData.grossProfit.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-slate-200"></div>
                </>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 font-medium">Operating Expenses</span>
                <span className="text-base font-semibold text-orange-600">-${plData.opex.toLocaleString()}</span>
              </div>

              <div className="h-px bg-slate-200"></div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-slate-900">Net Income</span>
                <span className={cn(
                  "text-2xl font-bold",
                  plData.net > 0 ? "text-emerald-600" : "text-red-600"
                )}>
                  ${plData.net.toLocaleString()}
                </span>
              </div>

              <div className="pt-2">
                <div className="text-xs text-slate-500 mb-1.5 font-medium">Net Margin</div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    style={{ width: `${((plData.net / plData.revenue) * 100).toFixed(0)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-600 mt-1.5 font-semibold">
                  {((plData.net / plData.revenue) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Coverage - 6 columns - HERO CARD */}
        <Card className={cn(
          "col-span-6 border-2 rounded-xl shadow-lg transition-all",
          shortfall < 0 ? "bg-gradient-to-br from-red-500 to-orange-500 border-red-300 text-white" : "bg-gradient-to-br from-blue-500 to-purple-500 border-blue-300 text-white"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Payroll Coverage</h3>
                <p className="text-white/90 text-sm font-medium">{payrollCoverage.nextPayDate}</p>
              </div>
              <div className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold",
                shortfall < 0 ? "bg-white/20 text-white" : "bg-white/20 text-white"
              )}>
                {shortfall < 0 ? 'At Risk' : 'Covered'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                <div className="text-xs text-white/80 mb-1 font-medium">Gross Due</div>
                <div className="text-2xl font-bold text-white">${payrollCoverage.grossDue.toLocaleString()}</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                <div className="text-xs text-white/80 mb-1 font-medium">Projected Cash</div>
                <div className="text-2xl font-bold text-white">${payrollCoverage.projectedCash.toLocaleString()}</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                <div className="text-xs text-white/80 mb-1 font-medium">Shortfall</div>
                <div className="text-2xl font-bold text-white">
                  {shortfall < 0 ? '-' : '+'}${Math.abs(shortfall).toLocaleString()}
                </div>
              </div>
            </div>

            {shortfall < 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-white text-red-600 hover:bg-white/90 border-0 font-semibold h-10 shadow-md"
                onClick={() => navigate(createPageUrl("MoneyOut") + "?suggestedDelay=true")}
              >
                View Suggested Bills to Delay
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Next Best Action - 6 columns - HERO CARD */}
        <Card className="col-span-6 bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-purple-300 rounded-xl shadow-lg text-white">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <Badge className={cn(
                    "text-xs font-bold",
                    nextBestAction.priority === "high" ? "bg-white/25 text-white border-white/40" : "bg-white/20 text-white border-white/30"
                  )}>
                    {nextBestAction.priority === "high" ? "High Priority" : "Medium Priority"}
                  </Badge>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{nextBestAction.title}</h4>
                <p className="text-sm text-white/95 leading-relaxed">{nextBestAction.description}</p>
              </div>

              <div className="flex gap-3">
                {nextBestAction.actions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(createPageUrl(action.link))}
                    className="flex-1 bg-white/15 backdrop-blur-sm border-white/30 text-white hover:bg-white/25 text-sm h-10 justify-between font-semibold shadow-md"
                  >
                    {action.label}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ))}
              </div>

              <div className="pt-3 border-t border-white/30">
                <p className="text-xs text-white/80 font-medium">
                  💡 AI-powered recommendation based on your current financial position
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {aiPanelOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiPanelOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[30%] min-w-[400px] bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">AI Copilot</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAiPanelOpen(false)}
                    className="text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Insights Strip */}
                <div className="space-y-2">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 flex-1">
                        <insight.icon className={cn(
                          "w-3.5 h-3.5",
                          insight.severity === "critical" ? "text-red-600" : "text-amber-600"
                        )} />
                        <span className="text-xs text-slate-700 font-medium">{insight.text}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-6 text-xs px-2">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="text-slate-900 font-bold mb-2">Ask AI anything</h4>
                    <p className="text-slate-600 text-sm mb-4 max-w-xs">
                      Get insights about your finances, cash flow, expenses, and more.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => renderAIMessage(msg, idx))
                )}
              </div>

              {/* Quick Prompts */}
              <div className="px-6 pb-3 bg-white border-t border-slate-200">
                <div className="text-xs text-slate-600 mb-2 font-medium">Quick prompts:</div>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickPrompt(prompt)}
                      className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs h-7 font-medium"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-slate-200 bg-white">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputMessage)}
                    placeholder="Ask AI anything..."
                    className="flex-1 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500"
                  />
                  <Button
                    onClick={() => handleSendMessage(inputMessage)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}