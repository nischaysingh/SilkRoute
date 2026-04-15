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

function KPICard({ kpi, runway }) {
  const { explainableProps } = useExplainableWidget({
    title: kpi.label,
    metric: kpi.value,
    delta: kpi.delta,
    trend: kpi.positive ? 'up' : 'down',
    period: "This Month",
    actions: ['simulate', 'alert', 'create_policy']
  });
  return (
    <Card
      {...explainableProps}
      className="col-span-3 backdrop-blur-xl rounded-xl overflow-hidden group transition-all"
      style={{background:'#1e1d1b',border:'1px solid #2a2927'}}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <TooltipProvider>
            <UITooltip>
              <UITooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help">
                  <span className="ov-heading text-xs font-medium" style={{color:'#b0aea5'}}>{kpi.label}</span>
                  <Info className="w-3 h-3" style={{color:'#b0aea5'}} />
                </div>
              </UITooltipTrigger>
              <UITooltipContent style={{background:'#1e1d1b',border:'1px solid #2a2927',color:'#faf9f5'}} className="max-w-xs">
                <p className="text-xs">{kpi.tooltip}</p>
              </UITooltipContent>
            </UITooltip>
          </TooltipProvider>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.color} shadow-lg`}>
            <kpi.icon className="w-4 h-4 text-white" />
          </div>
        </div>
        <div>
          <div className="ov-heading text-2xl font-bold mb-2" style={{color:'#faf9f5'}}>{kpi.value}</div>
          <Badge
            className={cn(
              "text-xs border",
              kpi.warning && runway < 3 ? "bg-red-500/20 text-red-400 border-red-500/30" :
              kpi.warning && runway < 6 ? "border-[#d97757]/40 text-[#d97757]" :
              kpi.positive ? "border-[#788c5d]/40 text-[#788c5d]" :
              "bg-red-500/20 text-red-400 border-red-500/30"
            )}
            style={kpi.positive && !kpi.warning ? {background:'rgba(120,140,93,0.15)'} : {}}
          >
            {kpi.positive ? <TrendingUp className="w-3 h-3 mr-1 inline" /> : <TrendingDown className="w-3 h-3 mr-1 inline" />}
            {kpi.delta}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

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
      color: "from-[#788c5d] to-[#5d7048]"
    },
    {
      label: "Avg Monthly Burn",
      value: `$${avgMonthlyBurn.toLocaleString()}`,
      delta: "-3.1%",
      positive: true,
      icon: TrendingDown,
      tooltip: "Average net cash outflow per month over last 3 months",
      color: "from-[#6a9bcc] to-[#4a7bac]"
    },
    {
      label: "Runway",
      value: `${runway} months`,
      delta: "+2 mo",
      positive: true,
      icon: Clock,
      tooltip: "Cash on hand ÷ Average monthly burn rate",
      color: runway < 3 ? "from-red-500 to-red-700" : runway < 6 ? "from-[#d97757] to-[#CC785C]" : "from-[#CC785C] to-[#d97757]",
      warning: runway < 6
    },
    {
      label: "Credit Utilization",
      value: `${creditUtilization}%`,
      delta: "+5%",
      positive: false,
      icon: CreditCard,
      tooltip: "Current credit used ÷ Total credit available",
      color: "from-[#6a9bcc] to-[#CC785C]"
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
  const COLORS = ["#6a9bcc", "#d97757", "#788c5d", "#CC785C"];

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
    <div className="min-h-screen p-6 relative" style={{background:'#141413'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        .ov-heading{font-family:'Poppins',sans-serif!important}
        .ov-body{font-family:'Lora',serif!important}
      `}</style>
      {/* AI Assistant Toggle Button */}
      <Button
        onClick={() => setAiPanelOpen(!aiPanelOpen)}
        className="fixed top-20 right-6 z-50 shadow-lg rounded-full w-12 h-12 p-0"
        style={{background:'linear-gradient(135deg,#d97757,#CC785C)'}}
      >
        <MessageCircle className="w-5 h-5 text-white" />
      </Button>

      <div className="mb-6">
        <h2 className="ov-heading text-2xl font-bold text-[#faf9f5]">Overview</h2>
        <p className="ov-body text-sm mt-1" style={{color:'#b0aea5'}}>Financial snapshot and key metrics</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* TOP ROW: KPI Cards - 3 columns each with Explain Mode support */}
        {kpis.map((kpi, idx) => (
          <KPICard key={idx} kpi={kpi} runway={runway} />
        ))}

        {/* MIDDLE LEFT: Cash Balance Chart - 5 columns */}
        <Card className="col-span-5 backdrop-blur-xl rounded-xl" style={{background:'#1e1d1b',border:'1px solid #2a2927'}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="ov-heading text-sm font-semibold" style={{color:'#faf9f5'}}>Cash Balance (Last 6 Months)</CardTitle>
              <Button
                size="sm"
                onClick={() => setIncludeCreditLine(!includeCreditLine)}
                className="rounded-lg text-xs h-7 border"
                style={includeCreditLine ? {background:'#d97757',color:'#faf9f5',border:'none'} : {background:'transparent',color:'#b0aea5',borderColor:'#2a2927'}}
              >
                Credit Line
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={cashBalanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#b0aea5" tick={{ fontSize: 11, fill:'#b0aea5' }} axisLine={false} tickLine={false}/>
                <YAxis stroke="#b0aea5" tick={{ fontSize: 11, fill:'#b0aea5' }} axisLine={false} tickLine={false}/>
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor:'#1e1d1b', border:'1px solid #2a2927', borderRadius:'8px', color:'#faf9f5', fontSize:'11px' }}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2927" vertical={false} />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#6a9bcc" 
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#6a9bcc', strokeWidth: 2, stroke: '#4a7bac' }}
                />
                {includeCreditLine && (
                  <Line 
                    type="monotone" 
                    dataKey="creditLine" 
                    stroke="#CC785C" 
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
        <Card className="col-span-4 backdrop-blur-xl rounded-xl" style={{background:'#1e1d1b',border:'1px solid #2a2927'}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="ov-heading text-sm font-semibold" style={{color:'#faf9f5'}}>Revenue vs Expenses</CardTitle>
              <div className="flex gap-1">
                <Button size="sm" onClick={() => setRevenueExpenseView("MTD")} className="rounded-lg text-xs h-7 px-3 border"
                  style={revenueExpenseView==="MTD"?{background:'#d97757',color:'#faf9f5',border:'none'}:{background:'transparent',color:'#b0aea5',borderColor:'#2a2927'}}>MTD</Button>
                <Button size="sm" onClick={() => setRevenueExpenseView("YTD")} className="rounded-lg text-xs h-7 px-3 border"
                  style={revenueExpenseView==="YTD"?{background:'#d97757',color:'#faf9f5',border:'none'}:{background:'transparent',color:'#b0aea5',borderColor:'#2a2927'}}>YTD</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart 
                data={revenueExpenseView === "MTD" ? revenueExpenseDataMTD : revenueExpenseDataYTD}
                onClick={(data) => data?.activePayload && handleBarClick(data.activePayload[0].payload)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2927" vertical={false} />
                <XAxis dataKey="month" stroke="#b0aea5" tick={{ fontSize: 11, fill:'#b0aea5' }} axisLine={false} tickLine={false}/>
                <YAxis stroke="#b0aea5" tick={{ fontSize: 11, fill:'#b0aea5' }} axisLine={false} tickLine={false}/>
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor:'#1e1d1b', border:'1px solid #2a2927', borderRadius:'8px', color:'#faf9f5', fontSize:'11px' }}
                />
                <Legend wrapperStyle={{ color: '#b0aea5', fontSize: '11px' }} />
                <Bar dataKey="revenue" fill="#788c5d" radius={[6, 6, 0, 0]} cursor="pointer" />
                <Bar dataKey="expenses" fill="#d97757" radius={[6, 6, 0, 0]} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* MIDDLE RIGHT: Revenue Mix - 3 columns */}
        <Card className="col-span-3 backdrop-blur-xl rounded-xl" style={{background:'#1e1d1b',border:'1px solid #2a2927'}}>
          <CardHeader className="pb-2">
            <CardTitle className="ov-heading text-sm font-semibold" style={{color:'#faf9f5'}}>Revenue Mix</CardTitle>
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
                  contentStyle={{ backgroundColor:'#1e1d1b', border:'1px solid #2a2927', borderRadius:'8px', color:'#faf9f5', fontSize:'11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-1 mt-2">
              {revenueMixData.map((source, idx) => (
                <button
                  key={source.name}
                  onClick={() => handleSourceClick(source.name)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-all text-xs ov-body"
                  style={{background:'rgba(255,255,255,0.04)',border:'1px solid #2a2927',color:'#e8e6dc'}}
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
        <Card className="col-span-4 backdrop-blur-xl rounded-xl" style={{background:'#1e1d1b',border:'1px solid #2a2927'}}>
          <CardHeader className="pb-2">
            <CardTitle className="ov-heading text-sm font-semibold" style={{color:'#faf9f5'}}>Top Vendors by Spend Variance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{borderColor:'#2a2927'}} className="hover:bg-transparent">
                    <TableHead className="ov-heading text-xs h-8" style={{color:'#b0aea5'}}>Vendor</TableHead>
                    <TableHead className="ov-heading text-xs h-8" style={{color:'#b0aea5'}}>This Month</TableHead>
                    <TableHead className="ov-heading text-xs h-8" style={{color:'#b0aea5'}}>Last Month</TableHead>
                    <TableHead className="ov-heading text-xs h-8" style={{color:'#b0aea5'}}>Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topVendors.map((vendor, idx) => {
                    const variance = ((vendor.thisMonth - vendor.lastMonth) / vendor.lastMonth * 100).toFixed(1);
                    const varianceNum = parseFloat(variance);
                    return (
                      <TableRow 
                        key={idx} 
                        className="cursor-pointer transition-all h-10"
                        style={{borderColor:'#2a2927'}}
                        onClick={() => handleVendorClick(vendor.vendor)}
                      >
                        <TableCell className="ov-body font-medium text-xs" style={{color:'#faf9f5'}}>{vendor.vendor}</TableCell>
                        <TableCell className="ov-body text-xs" style={{color:'#e8e6dc'}}>${vendor.thisMonth.toLocaleString()}</TableCell>
                        <TableCell className="ov-body text-xs" style={{color:'#b0aea5'}}>${vendor.lastMonth.toLocaleString()}</TableCell>
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
        <Card className="col-span-3 backdrop-blur-xl rounded-xl" style={{background:'#1e1d1b',border:'1px solid #2a2927'}}>
          <CardHeader className="pb-2">
            <CardTitle className="ov-heading text-sm font-semibold" style={{color:'#faf9f5'}}>Risk & Alerts</CardTitle>
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
                    className="flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all"
                    style={alert.severity==="critical"?{background:'rgba(217,119,87,0.1)',borderColor:'rgba(217,119,87,0.35)'}:{background:'rgba(204,120,92,0.1)',borderColor:'rgba(204,120,92,0.35)'}}
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
                      <p className="ov-body font-medium text-xs" style={{color:'#faf9f5'}}>{alert.title}</p>
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
        <Card className="col-span-3 backdrop-blur-xl rounded-xl"
          style={shortfall<0?{background:'rgba(217,119,87,0.1)',border:'1px solid rgba(217,119,87,0.35)'}:{background:'#1e1d1b',border:'1px solid #2a2927'}}>
          <CardHeader className="pb-2">
            <CardTitle className="ov-heading text-sm font-semibold" style={{color:'#faf9f5'}}>Payroll Coverage</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="ov-body text-xs" style={{color:'#b0aea5'}}>Next Pay Run</div>
                <div className="ov-heading text-sm font-semibold" style={{color:'#faf9f5'}}>{payrollCoverage.nextPayDate}</div>
              </div>
              <div>
                <div className="ov-body text-xs" style={{color:'#b0aea5'}}>Gross Due</div>
                <div className="ov-heading text-sm font-semibold" style={{color:'#faf9f5'}}>${payrollCoverage.grossDue.toLocaleString()}</div>
              </div>
              <div>
                <div className="ov-body text-xs" style={{color:'#b0aea5'}}>Projected Cash</div>
                <div className="ov-heading text-sm font-semibold" style={{color:'#faf9f5'}}>${payrollCoverage.projectedCash.toLocaleString()}</div>
              </div>
              <div>
                <div className="ov-body text-xs" style={{color:'#b0aea5'}}>Shortfall</div>
                <div className="ov-heading text-sm font-bold" style={{color: shortfall<0?'#d97757':'#788c5d'}}>
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
        <Card className="col-span-2 backdrop-blur-xl rounded-xl" style={{background:'#1e1d1b',border:'1px solid #2a2927'}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="ov-heading text-sm font-semibold" style={{color:'#faf9f5'}}>Collections</CardTitle>
              <Badge className="text-xs border" style={totalOverdue>10000?{background:'rgba(217,119,87,0.15)',color:'#d97757',borderColor:'rgba(217,119,87,0.4)'}:{background:'rgba(120,140,93,0.15)',color:'#788c5d',borderColor:'rgba(120,140,93,0.4)'}}>
                ${totalOverdue.toLocaleString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {collections.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg" style={{background:'rgba(255,255,255,0.03)',border:'1px solid #2a2927'}}>
                  <div className="flex-1">
                    <div className="ov-body text-xs font-medium" style={{color:'#faf9f5'}}>{item.customer}</div>
                    <div className="ov-body text-xs" style={{color:'#b0aea5'}}>${item.amount.toLocaleString()}</div>
                  </div>
                  <Badge className="text-xs border" style={item.daysPastDue>30?{background:'rgba(217,119,87,0.15)',color:'#d97757',borderColor:'rgba(217,119,87,0.4)'}:item.daysPastDue>15?{background:'rgba(204,120,92,0.15)',color:'#CC785C',borderColor:'rgba(204,120,92,0.4)'}:{background:'rgba(176,174,165,0.1)',color:'#b0aea5',borderColor:'#2a2927'}}>
                    {item.daysPastDue}d
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* NEW WIDGETS ROW */}

        {/* Financial Feed - 3 columns */}
        <Card className="col-span-3 backdrop-blur-xl rounded-xl overflow-hidden" style={{background:'#1e1d1b',border:'1px solid #2a2927'}}>
          <CardHeader className="pb-2">
            <CardTitle className="ov-heading text-sm font-semibold flex items-center gap-2" style={{color:'#faf9f5'}}>
              <Clock className="w-4 h-4" style={{color:'#CC785C'}} />
              Financial Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {financialFeed.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg transition-all cursor-pointer" style={{background:'rgba(255,255,255,0.03)',border:'1px solid #2a2927'}}>
                  <div className="p-2 rounded-lg" style={{background: item.color==="emerald"?'rgba(120,140,93,0.2)':item.color==="blue"?'rgba(106,155,204,0.2)':'rgba(217,119,87,0.2)'}}>
                    <item.icon className="w-3 h-3" style={{color: item.color==="emerald"?'#788c5d':item.color==="blue"?'#6a9bcc':'#d97757'}} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="ov-body text-xs font-medium truncate" style={{color:'#faf9f5'}}>{item.title}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="ov-body text-xs" style={{color:'#b0aea5'}}>{item.time}</span>
                      {item.amount > 0 && (
                        <span className="ov-heading text-xs font-semibold" style={{color:'#e8e6dc'}}>${item.amount.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Anomaly Widget - 3 columns */}
        <Card className="col-span-3 backdrop-blur-xl rounded-xl" style={{background:'#1e1d1b',border:'1px solid #2a2927'}}>
          <CardHeader className="pb-2">
            <CardTitle className="ov-heading text-sm font-semibold flex items-center gap-2" style={{color:'#faf9f5'}}>
              <AlertTriangle className="w-4 h-4" style={{color:'#d97757'}} />
              Unusual Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {anomalies.map((anomaly, idx) => (
                <div key={idx} className="p-3 rounded-lg transition-all cursor-pointer" style={{background:'rgba(255,255,255,0.03)',border:'1px solid #2a2927'}}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="ov-body text-xs font-medium flex-1" style={{color:'#faf9f5'}}>{anomaly.title}</p>
                    {anomaly.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 flex-shrink-0 ml-2" style={{color:'#d97757'}} />
                    ) : (
                      <TrendingDown className="w-3 h-3 flex-shrink-0 ml-2" style={{color:'#6a9bcc'}} />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="text-xs border" style={anomaly.severity==="warning"?{background:'rgba(217,119,87,0.15)',color:'#d97757',borderColor:'rgba(217,119,87,0.4)'}:{background:'rgba(106,155,204,0.15)',color:'#6a9bcc',borderColor:'rgba(106,155,204,0.4)'}}>
                      {anomaly.severity === "warning" ? "Warning" : "Info"}
                    </Badge>
                    <span className="ov-heading text-xs font-bold" style={{color: anomaly.trend==="up"?'#d97757':'#6a9bcc'}}>{anomaly.value}</span>
                  </div>
                </div>
              ))}
              <Button size="sm" className="w-full text-xs h-8 border" style={{background:'transparent',color:'#b0aea5',borderColor:'#2a2927'}}>
                View All Anomalies
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mini P&L Snapshot - 3 columns */}
        <Card className="col-span-3 backdrop-blur-xl rounded-xl" style={{background:'#1e1d1b',border:'1px solid #2a2927'}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="ov-heading text-sm font-semibold" style={{color:'#faf9f5'}}>P&L Snapshot (MTD)</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setPlExpanded(!plExpanded)} className="h-6 px-2" style={{color:'#b0aea5'}}>
                {plExpanded ? "Collapse" : "Expand"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="ov-body text-xs" style={{color:'#b0aea5'}}>Revenue</span>
                <span className="ov-heading text-sm font-bold" style={{color:'#788c5d'}}>${plData.revenue.toLocaleString()}</span>
              </div>
              {plExpanded && (
                <>
                  <div className="flex justify-between items-center pl-3" style={{borderLeft:'2px solid #2a2927'}}>
                    <span className="ov-body text-xs" style={{color:'#b0aea5'}}>COGS</span>
                    <span className="ov-heading text-sm font-semibold" style={{color:'#d97757'}}>-${plData.cogs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold">
                    <span className="ov-body text-xs" style={{color:'#e8e6dc'}}>Gross Profit</span>
                    <span className="ov-heading text-sm" style={{color:'#faf9f5'}}>${plData.grossProfit.toLocaleString()}</span>
                  </div>
                  <div className="h-px" style={{background:'#2a2927'}}></div>
                </>
              )}
              <div className="flex justify-between items-center">
                <span className="ov-body text-xs" style={{color:'#b0aea5'}}>Operating Expenses</span>
                <span className="ov-heading text-sm font-semibold" style={{color:'#d97757'}}>-${plData.opex.toLocaleString()}</span>
              </div>
              <div className="h-px" style={{background:'#2a2927'}}></div>
              <div className="flex justify-between items-center pt-2">
                <span className="ov-heading text-sm font-bold" style={{color:'#faf9f5'}}>Net Income</span>
                <span className="ov-heading text-lg font-bold" style={{color: plData.net>0?'#788c5d':'#d97757'}}>${plData.net.toLocaleString()}</span>
              </div>
              <div className="pt-2">
                <div className="ov-body text-xs mb-1" style={{color:'#b0aea5'}}>Net Margin</div>
                <div className="w-full rounded-full h-2 overflow-hidden" style={{background:'#2a2927'}}>
                  <div className="h-full rounded-full" style={{width:`${((plData.net/plData.revenue)*100).toFixed(0)}%`,background:'linear-gradient(to right,#788c5d,#5d7048)'}}></div>
                </div>
                <div className="ov-body text-xs mt-1" style={{color:'#b0aea5'}}>{((plData.net/plData.revenue)*100).toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Best Action - 3 columns */}
        <Card className="col-span-3 backdrop-blur-xl rounded-xl" style={{background:'#1e1d1b',border:'1px solid #2a2927'}}>
          <CardHeader className="pb-2">
            <CardTitle className="ov-heading text-sm font-semibold flex items-center gap-2" style={{color:'#faf9f5'}}>
              <Sparkles className="w-4 h-4" style={{color:'#CC785C'}} />
              Next Best Action
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <Badge className="text-xs mb-3 border" style={nextBestAction.priority==="high"?{background:'rgba(217,119,87,0.15)',color:'#d97757',borderColor:'rgba(217,119,87,0.4)'}:{background:'rgba(204,120,92,0.15)',color:'#CC785C',borderColor:'rgba(204,120,92,0.4)'}}>
                  {nextBestAction.priority === "high" ? "High Priority" : "Medium Priority"}
                </Badge>
                <h4 className="ov-heading text-base font-bold mb-2" style={{color:'#faf9f5'}}>{nextBestAction.title}</h4>
                <p className="ov-body text-xs leading-relaxed" style={{color:'#b0aea5'}}>{nextBestAction.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                {nextBestAction.actions.map((action, idx) => (
                  <Button key={idx} size="sm" onClick={() => navigate(createPageUrl(action.link))}
                    className="w-full text-xs h-8 justify-between border" style={{background:'transparent',color:'#e8e6dc',borderColor:'#3a3835'}}>
                    {action.label}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                ))}
              </div>
              <div className="pt-2" style={{borderTop:'1px solid #2a2927'}}>
                <p className="ov-body text-xs" style={{color:'#b0aea5'}}>
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
              className="fixed top-0 right-0 h-full w-[30%] min-w-[400px] backdrop-blur-xl z-50 flex flex-col shadow-2xl"
              style={{background:'#1a1917',borderLeft:'1px solid #2a2927'}}
            >
              {/* Header */}
              <div className="p-6" style={{borderBottom:'1px solid #2a2927'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#d97757,#CC785C)'}}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="ov-heading text-lg font-bold" style={{color:'#faf9f5'}}>Silkroute Copilot</h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setAiPanelOpen(false)} style={{color:'#b0aea5'}}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg" style={{background:'rgba(255,255,255,0.03)',border:'1px solid #2a2927'}}>
                      <div className="flex items-center gap-2 flex-1">
                        <insight.icon className="w-3 h-3" style={{color: insight.severity==="critical"?'#d97757':'#CC785C'}} />
                        <span className="ov-body text-xs" style={{color:'#e8e6dc'}}>{insight.text}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 text-xs px-2" style={{color:'#6a9bcc'}}>View</Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{background:'rgba(204,120,92,0.15)'}}>
                      <Sparkles className="w-8 h-8" style={{color:'#CC785C'}} />
                    </div>
                    <h4 className="ov-heading font-semibold mb-2" style={{color:'#faf9f5'}}>Ask Silkroute anything</h4>
                    <p className="ov-body text-sm mb-4 max-w-xs" style={{color:'#b0aea5'}}>
                      Get insights about your finances, cash flow, expenses, and more.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => renderAIMessage(msg, idx))
                )}
              </div>

              {/* Quick Prompts */}
              <div className="px-6 pb-3 space-y-2">
                <div className="ov-body text-xs mb-2" style={{color:'#b0aea5'}}>Quick prompts:</div>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, idx) => (
                    <Button key={idx} size="sm" onClick={() => handleQuickPrompt(prompt)} className="text-xs h-7 border"
                      style={{background:'rgba(255,255,255,0.04)',borderColor:'#2a2927',color:'#e8e6dc'}}>
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="p-6" style={{borderTop:'1px solid #2a2927'}}>
                <div className="flex gap-2">
                  <Input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputMessage)}
                    placeholder="Ask Silkroute anything..."
                    className="flex-1" style={{background:'rgba(255,255,255,0.05)',border:'1px solid #3a3835',color:'#faf9f5'}}
                  />
                  <Button onClick={() => handleSendMessage(inputMessage)} style={{background:'linear-gradient(135deg,#d97757,#CC785C)'}}>
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