import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip as UITooltip, TooltipContent as UITooltipContent, TooltipProvider, TooltipTrigger as UITooltipTrigger } from "@/components/ui/tooltip";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, Search,
  MessageCircle, FileText, CheckCircle, Clock, ArrowRight, Info, Sparkles,
  Play, AlertCircle, Target, Download, Tag, Split, Send, FileCheck, Keyboard, Copy, Bell, Plus, ChevronDown, X,
  Settings, AlertTriangle, Folder, History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SankeyDiagram from "../components/SankeyDiagram";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function CashFlow() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("inflows");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock Metrics Data
  const metrics = {
    totalInflows: 89450,
    totalOutflows: 51220,
    netCashFlow: 38230,
    upcomingPayments: 15400,
    trend: [12000, 15000, 13500, 18000, 16500, 14000, 17000]
  };

  // Mock Data
  const inflows = [
    { id: 1, date: "2024-12-20", source: "Stripe", customer: "Acme Corp", gross: 12500, fees: 375, net: 12125, status: "Paid", channel: "Stripe", customer_type: "Enterprise", tags: ["Recurring", "Subscription"], payout_delay: 2, transaction_id: "txn_stripe_12345", invoice_ref: "INV-001" },
    { id: 2, date: "2024-12-19", source: "DoorDash", customer: "Jane Doe", gross: 850, fees: 85, net: 765, status: "Paid", channel: "DoorDash", customer_type: "Consumer", tags: ["Marketplace"], payout_delay: 6, transaction_id: "txn_dd_67890", invoice_ref: "INV-002" },
    { id: 3, date: "2024-12-18", source: "App Store", customer: "Beta Inc", gross: 4200, fees: 1260, net: 2940, status: "Paid", channel: "App Store", customer_type: "Enterprise", tags: ["Subscription"], payout_delay: 3, transaction_id: "txn_app_24680", invoice_ref: "INV-003" },
    { id: 4, date: "2024-12-17", source: "AWS", customer: "Gamma LLC", gross: 8900, fees: 267, net: 8633, status: "Paid", channel: "AWS", customer_type: "Enterprise", tags: ["Recurring"], payout_delay: 7, transaction_id: "txn_aws_13579", invoice_ref: "INV-004" },
    { id: 5, date: "2024-12-16", source: "Stripe", customer: "Delta Corp", gross: 3400, fees: 102, net: 3298, status: "Pending", channel: "Stripe", customer_type: "Enterprise", tags: ["Subscription"], payout_delay: 1, transaction_id: "txn_stripe_97531", invoice_ref: "INV-005" },
  ];

  const topCustomers = [
    { name: "Acme Corp", total: 45000 },
    { name: "Beta Inc", total: 32000 },
    { name: "Gamma LLC", total: 28500 },
  ];

  const filteredInflows = inflows.filter(item => {
    const matchesChannel = channelFilter === "all" || item.channel === channelFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesSearch = searchQuery === "" ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Top Bar - Management Style */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Cash Flow</h2>
            <p className="text-slate-600 text-sm mt-1">Monitor money movement and forecast</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-slate-700">Last synced: just now</span>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-semibold">
              Live
            </Badge>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-semibold">Total Inflows (MTD)</span>
              <div className="p-1.5 rounded-lg bg-emerald-100">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600">${metrics.totalInflows.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>+8.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-semibold">Total Outflows (MTD)</span>
              <div className="p-1.5 rounded-lg bg-red-100">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600">${metrics.totalOutflows.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-red-600 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>+5.1%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-semibold">Net Cash Flow</span>
              <div className="p-1.5 rounded-lg bg-blue-100">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">${metrics.netCashFlow.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>+12.8%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-semibold">7-Day Trend</span>
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

        <Card className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-semibold">Upcoming Payments</span>
              <div className="p-1.5 rounded-lg bg-orange-100">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-orange-600">${metrics.upcomingPayments.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Next 7 days</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <TabsTrigger value="inflows" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white text-slate-700 rounded-lg font-medium">
            Inflows
          </TabsTrigger>
          <TabsTrigger value="outflows" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-slate-700 rounded-lg font-medium">
            Outflows
          </TabsTrigger>
          <TabsTrigger value="netflow" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-700 rounded-lg font-medium">
            Net Flow
          </TabsTrigger>
          <TabsTrigger value="forecast" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-violet-600 data-[state=active]:text-white text-slate-700 rounded-lg font-medium">
            Forecast
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inflows" className="mt-6 space-y-4">
          <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-3">
                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger className="border-slate-300 text-slate-900 text-xs h-8 bg-white">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900">
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="Stripe">Stripe</SelectItem>
                    <SelectItem value="DoorDash">DoorDash</SelectItem>
                    <SelectItem value="App Store">App Store</SelectItem>
                    <SelectItem value="AWS">AWS</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-slate-300 text-slate-900 text-xs h-8 bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs h-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-900">Receipts & Revenue</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableHead className="text-slate-600 text-xs font-semibold">Date</TableHead>
                      <TableHead className="text-slate-600 text-xs font-semibold">Source</TableHead>
                      <TableHead className="text-slate-600 text-xs font-semibold">Customer</TableHead>
                      <TableHead className="text-slate-600 text-xs font-semibold">Gross</TableHead>
                      <TableHead className="text-slate-600 text-xs font-semibold">Fees</TableHead>
                      <TableHead className="text-slate-600 text-xs font-semibold">Net</TableHead>
                      <TableHead className="text-slate-600 text-xs font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInflows.map((item) => (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer hover:bg-slate-50 border-slate-200 transition-all"
                        onClick={() => setSelectedTransaction({ ...item, type: "inflow" })}
                      >
                        <TableCell className="text-slate-700 text-xs font-medium">{format(new Date(item.date), 'MMM d')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-700 text-xs">
                            {item.source}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-900 text-xs font-semibold">{item.customer}</TableCell>
                        <TableCell className="text-slate-700 text-xs">${item.gross.toLocaleString()}</TableCell>
                        <TableCell className="text-red-600 text-xs font-medium">-${item.fees.toLocaleString()}</TableCell>
                        <TableCell className="text-emerald-600 font-semibold text-xs">${item.net.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-xs font-medium",
                            item.status === "Paid" && "bg-emerald-100 text-emerald-700 border-emerald-200",
                            item.status === "Pending" && "bg-amber-100 text-amber-700 border-amber-200",
                            item.status === "Failed" && "bg-red-100 text-red-700 border-red-200"
                          )}>
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-900 text-sm">Top 3 Customers</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {topCustomers.map((customer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all">
                    <span className="text-xs text-slate-900 font-semibold">{customer.name}</span>
                    <span className="text-xs text-emerald-600 font-bold">${customer.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outflows" className="mt-6">
          <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-slate-600">Outflows content here with white background theme</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="netflow" className="mt-6">
          <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-slate-600">Net flow content here with white background theme</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="mt-6">
          <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-slate-600">Forecast content here with white background theme</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Detail Drawer */}
      <Sheet open={!!selectedCustomer || !!selectedTransaction} onOpenChange={(open) => {
        if (!open) {
          setSelectedTransaction(null);
          setSelectedCustomer(null);
        }
      }}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-white border-slate-200 text-slate-900 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-slate-900">
              {selectedTransaction?.type === "inflow" ? "Receipt Details" : "Customer Details"}
            </SheetTitle>
          </SheetHeader>
          {selectedTransaction && selectedTransaction.type === "inflow" && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-600">Date</div>
                  <div className="font-medium text-slate-900">{format(new Date(selectedTransaction.date), 'MMM d, yyyy')}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Source</div>
                  <div className="font-medium text-slate-900">{selectedTransaction.source}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Customer</div>
                  <div className="font-medium text-slate-900">{selectedTransaction.customer}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Status</div>
                  <Badge className={selectedTransaction.status === "Paid" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gross Amount</span>
                    <span className="font-semibold text-slate-900">${selectedTransaction.gross.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Processing Fees</span>
                    <span>-${selectedTransaction.fees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
                    <span className="text-slate-900">Net Amount</span>
                    <span className="text-emerald-600">${selectedTransaction.net.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Explain Fees
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}