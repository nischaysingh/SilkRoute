import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle, 
  X, CreditCard, Users, FileText, ArrowRight, Info,
  Send, MessageCircle, Sparkles, TrendingUp as TrendUp, AlertCircle, DollarSign as Dollar
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
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
      color: "from-emerald-500 to-teal-500"
    },
    {
      label: "Avg Monthly Burn",
      value: `$${avgMonthlyBurn.toLocaleString()}`,
      delta: "-3.1%",
      positive: true,
      icon: TrendingDown,
      tooltip: "Average net cash outflow per month over last 3 months",
      color: "from-blue-500 to-cyan-500"
    },
    {
      label: "Runway",
      value: `${runway} months`,
      delta: "+2 mo",
      positive: true,
      icon: Clock,
      tooltip: "Cash on hand ÷ Average monthly burn rate",
      color: runway < 3 ? "from-red-500 to-pink-500" : runway < 6 ? "from-orange-500 to-yellow-500" : "from-purple-500 to-pink-500",
      warning: runway < 6
    },
    {
      label: "Credit Utilization",
      value: `${creditUtilization}%`,
      delta: "+5%",
      positive: false,
      icon: CreditCard,
      tooltip: "Current credit used ÷ Total credit available",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  // Cash Balance Data
  const cashBalanceData = [
    { month: "Sep", balance: 180000, creditLine: 250000 },
    { month: "Oct", balance: 195000, creditLine: 250000 },
    { month: "Nov", balance: 210000, creditLine: 250000 },
    { month: "Dec", balance: 225000, creditLine: 250000 },
    { month: "Jan", balance: 238000, creditLine: 250000 },
    { month: "Feb", balance: 245680, creditLine: 250000 },
  ];

  // Revenue vs Expense Data
  const revenueExpenseDataMTD = [
    { month: "Sep", revenue: 75000, expenses: 45000 },
    { month: "Oct", revenue: 82000, expenses: 48000 },
    { month: "Nov", revenue: 79000, expenses: 46000 },
    { month: "Dec", revenue: 88000, expenses: 52000 },
    { month: "Jan", revenue: 91000, expenses: 49000 },
    { month: "Feb", revenue: 89450, expenses: 51220 },
  ];

  const revenueExpenseDataYTD = [
    { month: "Q2 2025", revenue: 225000, expenses: 135000 },
    { month: "Q3 2025", revenue: 245000, expenses: 145000 },
    { month: "Q4 2025", revenue: 268000, expenses: 152000 },
    { month: "Q1 2026", revenue: 268450, expenses: 152220 },
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
    { id: 1, title: "Sales Tax Filing Due Feb 28", severity: "critical", page: "Taxes", icon: FileText },
    { id: 2, title: "3 Bills Overdue", severity: "warning", page: "MoneyOut", icon: AlertTriangle },
    { id: 3, title: "Payroll Coverage Risk Next Week", severity: "critical", page: "Payroll", icon: Users },
  ];

  // Payroll Coverage Data
  const payrollCoverage = {
    nextPayDate: "Feb 28, 2026",
    grossDue: 42500,
    projectedCash: 38000,
  };
  const shortfall = payrollCoverage.projectedCash - payrollCoverage.grossDue;

  // Collections Data
  const collections = [
    { customer: "Acme Corp", amount: 15000, daysPastDue: 45, lastContact: "Feb 1" },
    { customer: "Beta Solutions", amount: 8500, daysPastDue: 15, lastContact: "Feb 8" },
    { customer: "Gamma LLC", amount: 3200, daysPastDue: 8, lastContact: "Feb 9" },
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
    { text: "Stripe fees increased by 1.2% vs 3-month average", severity: "warning", icon: Dollar },
    { text: "Payroll shortfall predicted next week", severity: "critical", icon: AlertCircle },
    { text: "Sales tax filing due in 12 days", severity: "warning", icon: TrendUp }
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
          "🔴 Sales tax filing due Feb 28",
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
          <Card className="bg-white/5 border-white/10 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                {msg.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-gray-300 leading-relaxed">{msg.content}</p>

              {msg.chart === "expense_variance" && (
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "Legal Co", last: 5000, this: 8500 },
                      { name: "AWS", last: 2800, this: 3200 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value) => `$${value.toLocaleString()}`}
                        contentStyle={{
                          backgroundColor: 'rgba(17, 24, 39, 0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          backdropFilter: 'blur(12px)',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                      <Legend wrapperStyle={{ color: '#fff', fontSize: '11px' }} />
                      <Bar dataKey="last" fill="#6b7280" radius={[4, 4, 0, 0]} name="Last Month" />
                      <Bar dataKey="this" fill="#f59e0b" radius={[4, 4, 0, 0]} name="This Month" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {msg.chart === "runway_simulation" && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 p-2 rounded">
                    <div className="text-gray-400">Current Runway</div>
                    <div className="text-emerald-400 font-bold">18 months</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <div className="text-gray-400">After Hiring</div>
                    <div className="text-orange-400 font-bold">7.7 months</div>
                  </div>
                </div>
              )}

              {msg.chart === "cash_trend" && (
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cashBalanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value) => `$${value.toLocaleString()}`}
                        contentStyle={{
                          backgroundColor: 'rgba(17, 24, 39, 0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          backdropFilter: 'blur(12px)',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 2, fill: '#3b82f6', strokeWidth: 1 }}
                      />
                    </LineChart>
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
          <Card className="bg-white/5 border-white/10 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                {msg.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {msg.items.map((item, i) => (
                  <div key={i} className="text-xs text-gray-300 py-1">
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
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl max-w-[85%] text-sm text-gray-300">
          {msg.content}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 relative">
      {/* AI Assistant Toggle Button */}
      <Button
        onClick={() => setAiPanelOpen(!aiPanelOpen)}
        className="fixed top-20 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg rounded-full w-12 h-12 p-0"
      >
        <MessageCircle className="w-5 h-5 text-white" />
      </Button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Overview</h2>
        <p className="text-gray-400 text-sm mt-1">Financial snapshot and key metrics</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* TOP ROW: KPI Cards - 3 columns each */}
        {kpis.map((kpi, idx) => (
            <Card 
              key={idx} 
              className="col-span-3 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl overflow-hidden group hover:bg-white/10 transition-all"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <TooltipProvider>
                    <UITooltip>
                      <UITooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-help">
                          <span className="text-xs font-medium text-gray-400">{kpi.label}</span>
                          <Info className="w-3 h-3 text-gray-500" />
                        </div>
                      </UITooltipTrigger>
                      <UITooltipContent className="bg-gray-900 border-white/20 text-white max-w-xs">
                        <p className="text-xs">{kpi.tooltip}</p>
                      </UITooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.color} shadow-lg`}>
                    <kpi.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white mb-2">{kpi.value}</div>
                  <Badge 
                    className={cn(
                      "text-xs",
                      kpi.warning && runway < 3 ? "bg-red-500/20 text-red-400 border-red-500/30" :
                      kpi.warning && runway < 6 ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                      kpi.positive ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : 
                      "bg-red-500/20 text-red-400 border-red-500/30"
                    )}
                  >
                    {kpi.positive ? <TrendingUp className="w-3 h-3 mr-1 inline" /> : <TrendingDown className="w-3 h-3 mr-1 inline" />}
                    {kpi.delta}
                  </Badge>
                </div>
              </CardContent>
            </Card>
        ))}

        {/* MIDDLE LEFT: Cash Balance Chart - 5 columns */}
        <Card className="col-span-5 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm">Cash Balance (Last 6 Months)</CardTitle>
              <Button
                variant={includeCreditLine ? "default" : "outline"}
                size="sm"
                onClick={() => setIncludeCreditLine(!includeCreditLine)}
                className={includeCreditLine ? 
                  "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 rounded-lg text-xs h-7" : 
                  "bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-lg text-xs h-7"
                }
              >
                Credit Line
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={cashBalanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(12px)',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#1e40af' }}
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
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* MIDDLE CENTER: Revenue vs Expenses - 4 columns */}
        <Card className="col-span-4 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm">Revenue vs Expenses</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant={revenueExpenseView === "MTD" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRevenueExpenseView("MTD")}
                  className={revenueExpenseView === "MTD" ? 
                    "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 rounded-lg text-xs h-7 px-3" : 
                    "bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-lg text-xs h-7 px-3"
                  }
                >
                  MTD
                </Button>
                <Button
                  variant={revenueExpenseView === "YTD" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRevenueExpenseView("YTD")}
                  className={revenueExpenseView === "YTD" ? 
                    "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 rounded-lg text-xs h-7 px-3" : 
                    "bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-lg text-xs h-7 px-3"
                  }
                >
                  YTD
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart 
                data={revenueExpenseView === "MTD" ? revenueExpenseDataMTD : revenueExpenseDataYTD}
                onClick={(data) => data?.activePayload && handleBarClick(data.activePayload[0].payload)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(12px)',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} cursor="pointer" />
                <Bar dataKey="expenses" fill="#f59e0b" radius={[6, 6, 0, 0]} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* MIDDLE RIGHT: Revenue Mix - 3 columns */}
        <Card className="col-span-3 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Revenue Mix</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={revenueMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {revenueMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value}% ($${props.payload.amount.toLocaleString()})`, name]}
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-1 mt-2">
              {revenueMixData.map((source, idx) => (
                <button
                  key={source.name}
                  onClick={() => handleSourceClick(source.name)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs text-white"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span>{source.name}</span>
                  <span className="text-gray-400">{source.value}%</span>
                  {source.change < -15 && (
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* BOTTOM LEFT: Top Vendors - 4 columns */}
        <Card className="col-span-4 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Top Vendors by Spend Variance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-gray-400 text-xs h-8">Vendor</TableHead>
                    <TableHead className="text-gray-400 text-xs h-8">This Month</TableHead>
                    <TableHead className="text-gray-400 text-xs h-8">Last Month</TableHead>
                    <TableHead className="text-gray-400 text-xs h-8">Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topVendors.map((vendor, idx) => {
                    const variance = ((vendor.thisMonth - vendor.lastMonth) / vendor.lastMonth * 100).toFixed(1);
                    const varianceNum = parseFloat(variance);
                    return (
                      <TableRow 
                        key={idx} 
                        className="cursor-pointer hover:bg-white/5 border-white/10 transition-all h-10"
                        onClick={() => handleVendorClick(vendor.vendor)}
                      >
                        <TableCell className="font-medium text-white text-xs">{vendor.vendor}</TableCell>
                        <TableCell className="text-white text-xs">${vendor.thisMonth.toLocaleString()}</TableCell>
                        <TableCell className="text-gray-400 text-xs">${vendor.lastMonth.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-xs",
                            varianceNum > 40 ? "bg-red-500/20 text-red-400 border-red-500/30" :
                            varianceNum > 20 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                            "bg-gray-500/20 text-gray-400 border-gray-500/30"
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

        {/* BOTTOM CENTER: Risk & Alerts - 3 columns */}
        <Card className="col-span-3 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Risk & Alerts</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {activeAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                  <CheckCircle className="w-8 h-8 mb-2 text-emerald-400" />
                  <p className="text-xs">All clear!</p>
                </div>
              ) : (
                activeAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-lg border cursor-pointer hover:bg-white/5 transition-all",
                      alert.severity === "critical" ? "bg-red-500/10 border-red-500/30" : "bg-amber-500/10 border-amber-500/30"
                    )}
                    onClick={() => navigate(createPageUrl(alert.page))}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1.5 rounded-md",
                        alert.severity === "critical" ? "bg-red-500/20" : "bg-amber-500/20"
                      )}>
                        <alert.icon className={cn(
                          "w-3.5 h-3.5",
                          alert.severity === "critical" ? "text-red-400" : "text-amber-400"
                        )} />
                      </div>
                      <p className="text-white font-medium text-xs">{alert.title}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissAlert(alert.id);
                      }}
                      className="text-gray-400 hover:text-white hover:bg-white/10 h-6 w-6"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* BOTTOM CENTER-RIGHT: Payroll Coverage - 3 columns */}
        <Card className={cn(
          "col-span-3 backdrop-blur-xl border rounded-xl",
          shortfall < 0 ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Payroll Coverage</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-400">Next Pay Run</div>
                <div className="text-sm font-semibold text-white">{payrollCoverage.nextPayDate}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Gross Due</div>
                <div className="text-sm font-semibold text-white">${payrollCoverage.grossDue.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Projected Cash</div>
                <div className="text-sm font-semibold text-white">${payrollCoverage.projectedCash.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Shortfall</div>
                <div className={cn(
                  "text-sm font-bold",
                  shortfall < 0 ? "text-red-400" : "text-emerald-400"
                )}>
                  {shortfall < 0 ? '-' : ''}${Math.abs(shortfall).toLocaleString()}
                </div>
              </div>
            </div>
            {shortfall < 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-lg text-xs h-7"
                onClick={() => navigate(createPageUrl("MoneyOut") + "?suggestedDelay=true")}
              >
                View Suggested Bills
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* BOTTOM RIGHT: Collections - 2 columns */}
        <Card className="col-span-2 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm">Collections</CardTitle>
              <Badge className={cn(
                "text-xs",
                totalOverdue > 50000 ? "bg-red-500/20 text-red-400 border-red-500/30" :
                totalOverdue > 10000 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              )}>
                ${totalOverdue.toLocaleString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {collections.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex-1">
                    <div className="text-xs font-medium text-white">{item.customer}</div>
                    <div className="text-xs text-gray-400">${item.amount.toLocaleString()}</div>
                  </div>
                  <Badge className={cn(
                    "text-xs",
                    item.daysPastDue > 30 ? "bg-red-500/20 text-red-400 border-red-500/30" :
                    item.daysPastDue > 15 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                    "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  )}>
                    {item.daysPastDue}d
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* NEW WIDGETS ROW */}

        {/* Financial Feed - 3 columns */}
        <Card className="col-span-3 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Financial Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {financialFeed.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <div className={cn(
                    "p-2 rounded-lg",
                    item.color === "emerald" && "bg-emerald-500/20",
                    item.color === "orange" && "bg-orange-500/20",
                    item.color === "blue" && "bg-blue-500/20",
                    item.color === "red" && "bg-red-500/20"
                  )}>
                    <item.icon className={cn(
                      "w-3 h-3",
                      item.color === "emerald" && "text-emerald-400",
                      item.color === "orange" && "text-orange-400",
                      item.color === "blue" && "text-blue-400",
                      item.color === "red" && "text-red-400"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{item.title}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{item.time}</span>
                      {item.amount > 0 && (
                        <span className="text-xs font-semibold text-white">${item.amount.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Anomaly Widget - 3 columns */}
        <Card className="col-span-3 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Unusual Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {anomalies.map((anomaly, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs text-white font-medium flex-1">{anomaly.title}</p>
                    {anomaly.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 text-orange-400 flex-shrink-0 ml-2" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-blue-400 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={cn(
                      "text-xs",
                      anomaly.severity === "warning" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    )}>
                      {anomaly.severity === "warning" ? "Warning" : "Info"}
                    </Badge>
                    <span className={cn(
                      "text-xs font-bold",
                      anomaly.trend === "up" ? "text-orange-400" : "text-blue-400"
                    )}>
                      {anomaly.value}
                    </span>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-8">
                View All Anomalies
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mini P&L Snapshot - 3 columns */}
        <Card className="col-span-3 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm">P&L Snapshot (MTD)</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPlExpanded(!plExpanded)}
                className="text-gray-400 hover:text-white hover:bg-white/10 h-6 px-2"
              >
                {plExpanded ? "Collapse" : "Expand"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Revenue</span>
                <span className="text-sm font-bold text-emerald-400">${plData.revenue.toLocaleString()}</span>
              </div>
              
              {plExpanded && (
                <>
                  <div className="flex justify-between items-center pl-3 border-l-2 border-white/10">
                    <span className="text-xs text-gray-400">COGS</span>
                    <span className="text-sm font-semibold text-red-400">-${plData.cogs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-xs text-white">Gross Profit</span>
                    <span className="text-sm text-white">${plData.grossProfit.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-white/10"></div>
                </>
              )}

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Operating Expenses</span>
                <span className="text-sm font-semibold text-orange-400">-${plData.opex.toLocaleString()}</span>
              </div>

              <div className="h-px bg-white/10"></div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-bold text-white">Net Income</span>
                <span className={cn(
                  "text-lg font-bold",
                  plData.net > 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  ${plData.net.toLocaleString()}
                </span>
              </div>

              <div className="pt-2">
                <div className="text-xs text-gray-500 mb-1">Net Margin</div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    style={{ width: `${((plData.net / plData.revenue) * 100).toFixed(0)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {((plData.net / plData.revenue) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Best Action - 3 columns */}
        <Card className="col-span-3 bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Next Best Action
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <Badge className={cn(
                  "text-xs mb-3",
                  nextBestAction.priority === "high" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                )}>
                  {nextBestAction.priority === "high" ? "High Priority" : "Medium Priority"}
                </Badge>
                <h4 className="text-base font-bold text-white mb-2">{nextBestAction.title}</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{nextBestAction.description}</p>
              </div>

              <div className="flex flex-col gap-2">
                {nextBestAction.actions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(createPageUrl(action.link))}
                    className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-8 justify-between"
                  >
                    {action.label}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-gray-400">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[30%] min-w-[400px] bg-gray-900/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Silkroute Copilot</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAiPanelOpen(false)}
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Insights Strip */}
                <div className="space-y-2">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 flex-1">
                        <insight.icon className={cn(
                          "w-3 h-3",
                          insight.severity === "critical" ? "text-red-400" : "text-amber-400"
                        )} />
                        <span className="text-xs text-gray-300">{insight.text}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 h-6 text-xs px-2">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-purple-400" />
                    </div>
                    <h4 className="text-white font-semibold mb-2">Ask Silkroute anything</h4>
                    <p className="text-gray-400 text-sm mb-4 max-w-xs">
                      Get insights about your finances, cash flow, expenses, and more.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => renderAIMessage(msg, idx))
                )}
              </div>

              {/* Quick Prompts */}
              <div className="px-6 pb-3 space-y-2">
                <div className="text-xs text-gray-400 mb-2">Quick prompts:</div>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickPrompt(prompt)}
                      className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white text-xs h-7"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputMessage)}
                    placeholder="Ask Silkroute anything..."
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
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