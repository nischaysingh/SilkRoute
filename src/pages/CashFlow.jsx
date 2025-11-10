import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Download, Plus,
  ArrowUpCircle, ArrowDownCircle, Eye, Search, Sparkles, X, Info,
  AlertCircle, CheckCircle, Activity
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function CashFlow() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("30days");

  // Mock Data
  const inflows = [
    { id: 1, date: "2024-12-20", source: "Stripe", customer: "Acme Corp", amount: 15000, category: "Revenue", status: "Completed", method: "ACH" },
    { id: 2, date: "2024-12-19", source: "DoorDash", customer: "Beta Solutions", amount: 8500, category: "Revenue", status: "Completed", method: "Direct Deposit" },
    { id: 3, date: "2024-12-18", source: "App Store", customer: "Gamma Enterprises", amount: 3200, category: "Revenue", status: "Completed", method: "Wire" },
    { id: 4, date: "2024-12-17", source: "AWS", customer: "Delta Inc", amount: 12000, category: "Revenue", status: "Pending", method: "ACH" },
    { id: 5, date: "2024-12-16", source: "Stripe", customer: "Epsilon LLC", amount: 6800, category: "Revenue", status: "Completed", method: "Card" },
  ];

  const outflows = [
    { id: 1, date: "2024-12-20", vendor: "AWS", amount: 3200, category: "Infrastructure", status: "Paid", method: "ACH" },
    { id: 2, date: "2024-12-19", vendor: "Office Depot", amount: 850, category: "Office Supplies", status: "Paid", method: "Card" },
    { id: 3, date: "2024-12-18", vendor: "Legal Co", amount: 8500, category: "Professional Services", status: "Paid", method: "Wire" },
    { id: 4, date: "2024-12-17", vendor: "Payroll", amount: 42500, category: "Payroll", status: "Scheduled", method: "Direct Deposit" },
    { id: 5, date: "2024-12-16", vendor: "Marketing Agency", amount: 5000, category: "Marketing", status: "Paid", method: "ACH" },
  ];

  const cashFlowTrend = [
    { month: "Jul", inflow: 75000, outflow: 45000, net: 30000 },
    { month: "Aug", inflow: 82000, outflow: 48000, net: 34000 },
    { month: "Sep", inflow: 79000, outflow: 46000, net: 33000 },
    { month: "Oct", inflow: 88000, outflow: 52000, net: 36000 },
    { month: "Nov", inflow: 91000, outflow: 49000, net: 42000 },
    { month: "Dec", inflow: 89450, outflow: 51220, net: 38230 },
  ];

  const forecastData = [
    { month: "Jan", projected: 92000, optimistic: 98000, pessimistic: 85000 },
    { month: "Feb", projected: 95000, optimistic: 102000, pessimistic: 88000 },
    { month: "Mar", projected: 98000, optimistic: 106000, pessimistic: 91000 },
  ];

  const kpiMetrics = {
    totalInflow: 45500,
    totalOutflow: 60050,
    netCashFlow: -14550,
    projectedEOM: 231130
  };

  const filteredInflows = inflows.filter(t => {
    const matchesSearch = t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredOutflows = outflows.filter(t => {
    const matchesSearch = t.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Top Bar */}
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
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32 border-slate-300 bg-white text-slate-700 h-8 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 h-8 text-xs font-medium">
              <Download className="w-3 h-3 mr-1.5" />
              Export
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-medium">
              <Plus className="w-3 h-3 mr-1.5" />
              Add Transaction
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600">Total Inflow</span>
              <div className="p-2.5 rounded-lg bg-emerald-100">
                <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              ${kpiMetrics.totalInflow.toLocaleString()}
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-semibold">
              <TrendingUp className="w-3 h-3 mr-1 inline" />
              +12.3% vs last period
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600">Total Outflow</span>
              <div className="p-2.5 rounded-lg bg-orange-100">
                <ArrowDownCircle className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              ${kpiMetrics.totalOutflow.toLocaleString()}
            </div>
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs font-semibold">
              <TrendingUp className="w-3 h-3 mr-1 inline" />
              +8.1% vs last period
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600">Net Cash Flow</span>
              <div className={cn(
                "p-2.5 rounded-lg",
                kpiMetrics.netCashFlow >= 0 ? "bg-blue-100" : "bg-red-100"
              )}>
                <DollarSign className={cn(
                  "w-5 h-5",
                  kpiMetrics.netCashFlow >= 0 ? "text-blue-600" : "text-red-600"
                )} />
              </div>
            </div>
            <div className={cn(
              "text-3xl font-bold mb-2",
              kpiMetrics.netCashFlow >= 0 ? "text-blue-600" : "text-red-600"
            )}>
              {kpiMetrics.netCashFlow >= 0 ? '+' : ''}${kpiMetrics.netCashFlow.toLocaleString()}
            </div>
            <Badge className={cn(
              "text-xs font-semibold",
              kpiMetrics.netCashFlow >= 0 ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-red-100 text-red-700 border-red-200"
            )}>
              {kpiMetrics.netCashFlow >= 0 ? "Positive" : "Negative"} this period
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600">Projected EOM</span>
              <div className="p-2.5 rounded-lg bg-purple-100">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              ${kpiMetrics.projectedEOM.toLocaleString()}
            </div>
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs font-semibold">
              Dec 31, 2024
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="inflows" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Inflows</TabsTrigger>
          <TabsTrigger value="outflows" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Outflows</TabsTrigger>
          <TabsTrigger value="forecast" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Forecast</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-2 gap-6">
            {/* Cash Flow Trend */}
            <Card className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle className="text-slate-900 text-base font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Cash Flow Trend (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={cashFlowTrend}>
                    <defs>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
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
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="inflow" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Inflow" />
                    <Area type="monotone" dataKey="outflow" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Outflow" />
                    <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Net" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Inflow vs Outflow Comparison */}
            <Card className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle className="text-slate-900 text-base font-bold">Monthly Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={cashFlowTrend}>
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
                    <Bar dataKey="inflow" fill="#10b981" radius={[6, 6, 0, 0]} name="Inflow" />
                    <Bar dataKey="outflow" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Outflow" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inflows Tab */}
        <TabsContent value="inflows" className="space-y-6 mt-0">
          {/* Filters */}
          <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by customer or source..."
                    className="pl-10 border-slate-300 text-slate-900 placeholder:text-slate-400 h-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40 border-slate-300 bg-white text-slate-700 h-9 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Revenue">Revenue</SelectItem>
                    <SelectItem value="Refund">Refund</SelectItem>
                    <SelectItem value="Investment">Investment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Inflows Table */}
          <Card className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="text-slate-900 text-base font-bold flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
                Inflows ({filteredInflows.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="text-slate-600 font-semibold">Date</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Source</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Customer</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Amount</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Category</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInflows.map((transaction) => (
                    <TableRow key={transaction.id} className="border-slate-200 hover:bg-slate-50 transition-all cursor-pointer">
                      <TableCell className="font-medium text-slate-900">{transaction.date}</TableCell>
                      <TableCell className="text-slate-700">{transaction.source}</TableCell>
                      <TableCell className="text-slate-700">{transaction.customer}</TableCell>
                      <TableCell className="font-semibold text-emerald-600">${transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-semibold">
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-xs font-semibold",
                          transaction.status === "Completed" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"
                        )}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewTransaction(transaction)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 text-xs font-medium"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outflows Tab */}
        <TabsContent value="outflows" className="space-y-6 mt-0">
          {/* Filters */}
          <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by vendor..."
                    className="pl-10 border-slate-300 text-slate-900 placeholder:text-slate-400 h-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40 border-slate-300 bg-white text-slate-700 h-9 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Payroll">Payroll</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Professional Services">Professional Services</SelectItem>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Outflows Table */}
          <Card className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="text-slate-900 text-base font-bold flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-orange-600" />
                Outflows ({filteredOutflows.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="text-slate-600 font-semibold">Date</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Vendor</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Amount</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Category</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Method</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOutflows.map((transaction) => (
                    <TableRow key={transaction.id} className="border-slate-200 hover:bg-slate-50 transition-all cursor-pointer">
                      <TableCell className="font-medium text-slate-900">{transaction.date}</TableCell>
                      <TableCell className="text-slate-700 font-semibold">{transaction.vendor}</TableCell>
                      <TableCell className="font-semibold text-orange-600">${transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs font-semibold">
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-xs font-semibold",
                          transaction.status === "Paid" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : 
                          transaction.status === "Scheduled" ? "bg-blue-100 text-blue-700 border-blue-200" :
                          "bg-amber-100 text-amber-700 border-amber-200"
                        )}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">{transaction.method}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewTransaction(transaction)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 text-xs font-medium"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-6 mt-0">
          <Card className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="text-slate-900 text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                3-Month Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
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
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="optimistic" stroke="#10b981" fill="url(#colorRange)" fillOpacity={0.3} name="Optimistic" />
                  <Area type="monotone" dataKey="pessimistic" stroke="#ef4444" fill="url(#colorRange)" fillOpacity={0.3} name="Pessimistic" />
                  <Line type="monotone" dataKey="projected" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} name="Projected" />
                </AreaChart>
              </ResponsiveContainer>
              
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 mb-1 text-sm">AI Forecast Analysis</div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Based on historical trends and current pipeline, we project steady growth through Q1. 
                      Main upside drivers: Stripe revenue growth (+15%) and new enterprise contracts. 
                      Downside risks: seasonal slowdown in February and potential market headwinds.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="bg-white border-slate-200 text-slate-900 w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="text-slate-900 font-bold">Transaction Details</SheetTitle>
            <SheetDescription className="text-slate-600">
              View and manage transaction information
            </SheetDescription>
          </SheetHeader>
          {selectedTransaction && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {selectedTransaction.customer || selectedTransaction.vendor}
                </h3>
                <p className="text-slate-600 text-sm">
                  {selectedTransaction.source || selectedTransaction.category}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1 font-medium">Amount</div>
                  <div className={cn(
                    "text-2xl font-bold",
                    selectedTransaction.customer ? "text-emerald-600" : "text-orange-600"
                  )}>
                    ${selectedTransaction.amount.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1 font-medium">Date</div>
                  <div className="text-lg font-semibold text-slate-900">{selectedTransaction.date}</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1 font-medium">Status</div>
                  <Badge className={cn(
                    "text-xs font-semibold",
                    selectedTransaction.status === "Completed" || selectedTransaction.status === "Paid" 
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                      : "bg-amber-100 text-amber-700 border-amber-200"
                  )}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1 font-medium">Method</div>
                  <div className="text-sm font-semibold text-slate-900">{selectedTransaction.method}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  Edit Transaction
                </Button>
                <Button variant="outline" className="flex-1 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium">
                  Download Receipt
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}