
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  FileText, AlertCircle, CheckCircle, Calendar, DollarSign,
  TrendingUp, TrendingDown, Download, Send, Upload, Eye, Plus,
  Sparkles, X, ArrowRight, BarChart3, Info
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { TaxInsightsProvider } from "../components/taxes/TaxInsightsContext";
import ExplainThisViewModal from "../components/taxes/ExplainThisViewModal";
import TaxDrilldownDrawer from "../components/taxes/TaxDrilldownDrawer";

export default function Taxes() {
  const [eFileModalOpen, setEFileModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [aiCopilotOpen, setAiCopilotOpen] = useState(false);
  const [yearEndView, setYearEndView] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [scenarioView, setScenarioView] = useState("Quarterly");
  const [showAnomalies, setShowAnomalies] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [auditModeEnabled, setAuditModeEnabled] = useState(false);

  const [explainViewOpen, setExplainViewOpen] = useState(false);
  const [selectedTaxForDrawer, setSelectedTaxForDrawer] = useState(null);

  const taxTypes = [
    {
      id: "sales",
      title: "Sales Tax",
      icon: FileText,
      status: "Ready",
      period: "2024-Q4",
      taxable_sales: 245000,
      tax_due: 20125,
      paid_to_date: 20125,
      next_due_date: "2025-01-31",
      jurisdiction: "Multi-State",
      filing_method: "E-File",
      color: "from-emerald-500 to-teal-500",
      variance: -2.3,
      effective_rate: 8.21,
      detail_data: {
        filing_frequency: "Quarterly",
        last_filing_date: "2024-10-31",
        sales_data_source: "Shopify, Stripe",
        tax_rate_breakdown: [
          { state: "CA", rate: 7.25, collected: 12000 },
          { state: "NY", rate: 4.00, collected: 5000 },
          { state: "TX", rate: 6.25, collected: 3125 }
        ]
      }
    },
    {
      id: "payroll",
      title: "Payroll Tax",
      icon: FileText,
      status: "Info Needed",
      period: "2024-Q4",
      taxable_wages: 420000,
      tax_due: 32000,
      paid_to_date: 24000,
      next_due_date: "2025-01-15",
      jurisdiction: "Federal + State",
      filing_method: "E-File",
      color: "from-yellow-500 to-orange-500",
      variance: 6.2,
      effective_rate: 7.62,
      detail_data: {
        filing_frequency: "Bi-weekly",
        last_filing_date: "2024-12-30",
        wages_data_source: "Gusto",
        employee_count: 25,
        overtime_impact: 2800,
        tax_components: [
          { name: "Federal Withholding", amount: 15000 },
          { name: "FICA", amount: 8000 },
          { name: "State Withholding (CA)", amount: 9000 }
        ]
      }
    },
    {
      id: "income",
      title: "Income Tax",
      icon: FileText,
      status: "Not Started",
      period: "2024",
      taxable_income: 180000,
      tax_due: 45000,
      paid_to_date: 0,
      next_due_date: "2025-04-15",
      jurisdiction: "Federal + State",
      filing_method: "Manual",
      color: "from-gray-500 to-gray-600",
      variance: 0,
      effective_rate: 25.0,
      detail_data: {
        filing_frequency: "Annual",
        last_filing_date: "2024-04-15",
        income_source: "Quickbooks",
        estimated_payments_made: 3,
        tax_planning_notes: "Consider R&D credit for 2024"
      }
    },
  ];

  const jurisdictionBreakdown = [
    { name: "Federal", amount: 28000, percentage: 58 },
    { name: "California", amount: 12500, percentage: 26 },
    { name: "New York", amount: 7700, percentage: 16 }
  ];

  const upcomingDeadlines = [
    { date: "2025-01-15", type: "Social Security & Medicare", amount: 12800, status: "Scheduled" },
    { date: "2025-01-31", type: "State Withholding (CA)", amount: 4200, status: "Pending" },
    { date: "2025-01-31", type: "Sales Tax", amount: 20125, status: "Ready" },
    { date: "2025-02-01", type: "State Withholding (NY)", amount: 2950, status: "Pending" }
  ];

  const filingHistory = [
    { id: 1, date: "2024-10-15", type: "Payroll Tax", form: "Form 941", method: "E-File", status: "Filed", confirmation: "EFTPS123456" },
    { id: 2, date: "2024-10-31", type: "Sales Tax", form: "ST-1", method: "E-File", status: "Filed", confirmation: "CA789012" },
    { id: 3, date: "2024-09-15", type: "Payroll Tax", form: "Form 941", method: "E-File", status: "Filed", confirmation: "EFTPS654321" }
  ];

  const complianceMetrics = {
    health_score: 98,
    on_time_filings: 95,
    upcoming_count: 5,
    overdue_count: 0,
    penalties_avoided: 3200
  };

  const cashImpactForecast = [
    { date: "Jan 15", amount: 28000 },
    { date: "Jan 31", amount: 16700 },
    { date: "Feb 1", amount: 2950 },
    { date: "Feb 15", amount: 29500 }
  ];

  const taxTrendData = [
    { month: "Jul", current: 27000, prior: 26500 },
    { month: "Aug", current: 28500, prior: 27200 },
    { month: "Sep", current: 29200, prior: 28100 },
    { month: "Oct", current: 30800, prior: 29400 },
    { month: "Nov", current: 31500, prior: 29800 },
    { month: "Dec", current: 32000, prior: 30100 }
  ];

  const yearEndForms = [
    { type: "W-2", count: 6, ready: 6, status: "Ready", due_date: "2025-01-31" },
    { type: "1099-NEC", count: 3, ready: 2, status: "Info Needed", due_date: "2025-01-31" },
    { type: "1099-MISC", count: 1, ready: 1, status: "Ready", due_date: "2025-01-31" }
  ];

  const anomalies = [
    { type: "Payroll Tax", variance: "+12.3%", reason: "Overtime spike in Q4", severity: "warning" },
    { type: "Sales Tax", variance: "-8.1%", reason: "Revenue dip in retail channel", severity: "info" }
  ];

  const crossLinks = [
    { module: "Net Flow", action: "View Source Data", link: "CashFlow" },
    { module: "FP&A", action: "Compare to Forecast", link: "FPA" },
    { module: "Payroll", action: "Sync to Deductions", link: "Payroll" },
    { module: "Accounting", action: "View Journal Entry", link: "Settings" }
  ];

  const statusColors = {
    "Ready": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "Info Needed": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Not Started": "bg-gray-500/20 text-gray-400 border-gray-500/30",
    "Filed": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Scheduled": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "Pending": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "Overdue": "bg-red-500/20 text-red-400 border-red-500/30"
  };

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899"];

  const aiPrompts = [
    "What's due this week?",
    "Why did payroll tax jump 6%?",
    "Generate payment schedule for Q4 taxes",
    "Show impact on cash flow",
    "Explain sales tax variance"
  ];

  const handleSendMessage = (message) => {
    if (!message.trim()) return;

    setChatMessages(prev => [...prev, { role: "user", content: message }]);
    setInputMessage("");

    setTimeout(() => {
      const responses = {
        "What's due this week?": "You have 2 filings due this week: Social Security & Medicare ($12,800) on Jan 15, and State Withholding CA ($4,200) on Jan 31. Both are scheduled for E-File.",
        "Why did payroll tax jump 6%?": "Payroll tax increased 6.2% mainly from overtime payouts (+$2,800) and 2 new engineering hires. Average tax per employee rose to $1,480.",
        "Generate payment schedule for Q4 taxes": "Q4 Schedule: Jan 15: $28,000 (Federal) · Jan 31: $16,700 (State) · Feb 1: $2,950 (NY). Total: $47,650. Recommend early CA filing to optimize cash timing.",
        "Show impact on cash flow": "Next 14 days tax outflow: $44,700. This represents 18% of current cash position. Recommend maintaining $50k buffer for upcoming obligations.",
        "Explain sales tax variance": "Sales tax decreased 2.3% due to lower retail revenue in Q4. Offset by increased online sales in CA (+$1,200).",
        "Explain This View": "This is your main Tax Overview Dashboard. It provides a comprehensive summary of your tax obligations, upcoming deadlines, compliance status, and financial impact. You can drill down into specific tax types, view historical trends, and interact with the AI Copilot for quick insights."
      };

      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: responses[message] || "I can help you with tax obligations, filings, and compliance questions. Try asking about upcoming deadlines or tax trends."
      }]);
    }, 500);
  };

  const TaxCard = ({ tax }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Card
        className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all relative overflow-hidden"
        onClick={() => setSelectedTaxForDrawer(tax)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${tax.color}`}>
                <tax.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">{tax.title}</CardTitle>
                <p className="text-xs text-gray-400 mt-1">{tax.jurisdiction}</p>
              </div>
            </div>
            <Badge className={statusColors[tax.status]}>{tax.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Period</span>
              <span className="font-medium text-white">{tax.period}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tax Due</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">${tax.tax_due.toLocaleString()}</span>
                {tax.variance !== 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge className={cn(
                          "text-xs",
                          tax.variance > 0 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                        )}>
                          {tax.variance > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 border-white/10 text-white">
                        <p className="text-xs">{Math.abs(tax.variance)}% vs last period</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Paid to Date</span>
              <span className="font-medium text-emerald-400">${tax.paid_to_date.toLocaleString()}</span>
            </div>

            {isHovered && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Next Due Date</span>
                  <span className="text-white">{format(new Date(tax.next_due_date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Filing Method</span>
                  <span className="text-white">{tax.filing_method}</span>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTaxForDrawer(tax);
                  }}
                >
                  View Details
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <TaxInsightsProvider>
      <div className="space-y-6 relative">
        <Button
          onClick={() => setAiCopilotOpen(!aiCopilotOpen)}
          className="fixed top-20 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg rounded-full w-12 h-12 p-0"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Taxes</h2>
            <p className="text-gray-400 mt-1">Track obligations, e-file returns, and schedule payments across jurisdictions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              onClick={() => setExplainViewOpen(true)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explain This View
            </Button>
            <Select value={scenarioView} onValueChange={setScenarioView}>
              <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Custom">Custom Period</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setYearEndView(!yearEndView)}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {yearEndView ? "Quarterly View" : "Year-End Hub"}
            </Button>
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Summary
            </Button>
            <Button
              onClick={() => setPaymentModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Payment
            </Button>
            <Button
              onClick={() => setEFileModalOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              E-File Return
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Info className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {yearEndView ? (
          <div className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Year-End Forms & Filings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {yearEndForms.map((form, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-blue-500/20">
                        <FileText className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{form.type}</div>
                        <div className="text-sm text-gray-400">
                          {form.ready}/{form.count} forms ready · Due {format(new Date(form.due_date), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[form.status]}>{form.status}</Badge>
                      <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                        <Eye className="w-3 h-3 mr-1" />
                        Review
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <Download className="w-3 h-3 mr-1" />
                        Generate
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Delivery Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 justify-start">
                    <Send className="w-4 h-4 mr-2" />
                    Email to Employees
                  </Button>
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Download All PDFs
                  </Button>
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload to Portal
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Error Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-white">1 contractor missing W-9</span>
                      </div>
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        Fix
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-white">All W-2 addresses validated</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-4">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardContent className="p-4">
                  <div className="text-xs text-gray-400 mb-2">Total Obligations ({scenarioView})</div>
                  <div className="text-2xl font-bold text-white mb-1">$34,350</div>
                  <div className="text-xs text-emerald-400">Q4 2024</div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardContent className="p-4">
                  <div className="text-xs text-gray-400 mb-2">Next Deadline</div>
                  <div className="text-lg font-bold text-white mb-1">Jan 15, 2025</div>
                  <div className="text-xs text-gray-400">Social Security & Medicare</div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardContent className="p-4">
                  <div className="text-xs text-gray-400 mb-2">Filings Status</div>
                  <div className="text-2xl font-bold text-white mb-1">{complianceMetrics.upcoming_count}</div>
                  <div className="text-xs text-amber-400">{complianceMetrics.upcoming_count} upcoming · {complianceMetrics.overdue_count} overdue</div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardContent className="p-4">
                  <div className="text-xs text-gray-400 mb-2">Cash Impact (Next 14d)</div>
                  <div className="text-2xl font-bold text-orange-400 mb-1">$22,000</div>
                  <div className="text-xs text-gray-400">2 payments scheduled</div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
                <CardContent className="p-4">
                  <div className="text-xs text-gray-400 mb-2">Compliance Score</div>
                  <div className="text-2xl font-bold text-emerald-400 mb-1">{complianceMetrics.health_score}/100</div>
                  <div className="text-xs text-emerald-400">No active notices</div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Tax Overview Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {taxTypes.map((tax) => (
                  <TaxCard key={tax.id} tax={tax} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Compliance Monitor</CardTitle>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        {complianceMetrics.health_score}% Health Score
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-2xl font-bold text-emerald-400 mb-1">{complianceMetrics.on_time_filings}%</div>
                        <div className="text-xs text-gray-400">On-Time Filings</div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-2xl font-bold text-white mb-1">{complianceMetrics.upcoming_count}</div>
                        <div className="text-xs text-gray-400">Upcoming Filings</div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-2xl font-bold text-emerald-400 mb-1">${complianceMetrics.penalties_avoided.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Penalties Avoided</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Tax Risk & Anomaly Detection</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAnomalies(!showAnomalies)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {showAnomalies ? "Hide" : "Show"} Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showAnomalies ? (
                      <div className="space-y-3">
                        {anomalies.map((anomaly, idx) => (
                          <div key={idx} className={cn(
                            "p-3 rounded-lg border",
                            anomaly.severity === "warning" ? "bg-amber-500/10 border-amber-500/30" : "bg-blue-500/10 border-blue-500/30"
                          )}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-medium text-white text-sm">{anomaly.type}</div>
                              <Badge className={cn(
                                "text-xs",
                                anomaly.severity === "warning" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
                              )}>
                                {anomaly.variance}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-300 mb-2">{anomaly.reason}</p>
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 h-6 text-xs">
                              Explain Variance
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">2 anomalies detected this period</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">Cross-Linked Modules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {crossLinks.map((link, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10 justify-start"
                        >
                          <ArrowRight className="w-3 h-3 mr-2" />
                          <div className="text-left">
                            <div className="text-xs font-medium">{link.module}</div>
                            <div className="text-[10px] text-gray-400">{link.action}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">Upcoming Deadlines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingDeadlines.map((deadline, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                              <Calendar className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <div className="font-medium text-white">{deadline.type}</div>
                              <div className="text-xs text-gray-400">{format(new Date(deadline.date), 'MMM d, yyyy')}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-semibold text-white">${deadline.amount.toLocaleString()}</div>
                            <Badge className={statusColors[deadline.status]}>{deadline.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">Tax Trends - Current vs Prior Year</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={taxTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 11 }} />
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
                        <Bar dataKey="current" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Current Year" />
                        <Bar dataKey="prior" fill="#6b7280" radius={[4, 4, 0, 0]} name="Prior Year" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Tax by Jurisdiction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={jurisdictionBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={3}
                          dataKey="amount"
                        >
                          {jurisdictionBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
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
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-4">
                      {jurisdictionBreakdown.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                            <span className="text-gray-400">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">${item.amount.toLocaleString()}</span>
                            <span className="text-gray-500">({item.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Cash Impact Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={cashImpactForecast}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 10 }} />
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
                        <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                      <div className="text-xs text-orange-400 mb-1">Next 30 Days</div>
                      <div className="text-lg font-bold text-white">$77,150</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl border-purple-500/20 rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <CardTitle className="text-white text-sm">AI Tax Narrative</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-300 leading-relaxed mb-4">
                      Total tax liability for Q4 increased by 6.2%, mainly from payroll expansion.
                      Average remittance per employee rose to $1,480. AI recommends early filing for CA and TX to optimize cash flow timing.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs bg-white/5 border-white/10 text-white hover:bg-white/10">
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs bg-white/5 border-white/10 text-white hover:bg-white/10">
                        <Send className="w-3 h-3 mr-1" />
                        Send to FP&A
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Recent Filings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filingHistory.slice(0, 3).map((filing) => (
                        <div key={filing.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-semibold text-white">{filing.type}</div>
                            <Badge className={statusColors[filing.status]}>{filing.status}</Badge>
                          </div>
                          <div className="text-xs text-gray-400">{filing.form} · {format(new Date(filing.date), 'MMM d')}</div>
                          <div className="text-xs text-gray-500 mt-1">{filing.confirmation}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Settings Modal */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Tax Policy & Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Jurisdictions</Label>
                <div className="space-y-2">
                  {jurisdictionBreakdown.map((jur, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-sm text-white">{jur.name}</span>
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 h-7">
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Auto-File Threshold</Label>
                <Input
                  type="number"
                  defaultValue="500"
                  className="bg-white/5 border-white/10 text-white"
                />
                <p className="text-xs text-gray-500">Automatically roll over filings below this amount</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Linked Bank Accounts</Label>
                <Select>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                    <SelectItem value="chase">JPMorgan Chase - *4532</SelectItem>
                    <SelectItem value="boa">Bank of America - *7821</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <div className="text-sm font-medium text-white">Audit Mode</div>
                  <div className="text-xs text-gray-400">Show reconciliation columns and export options</div>
                </div>
                <Button
                  size="sm"
                  variant={auditModeEnabled ? "default" : "outline"}
                  onClick={() => setAuditModeEnabled(!auditModeEnabled)}
                  className={auditModeEnabled ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}
                >
                  {auditModeEnabled ? "On" : "Off"}
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Notifications</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-white/5">
                    <span className="text-xs text-white">Email alerts for upcoming deadlines</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-white/5">
                    <span className="text-xs text-white">Slack notifications</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSettingsOpen(false)} className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {aiCopilotOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setAiCopilotOpen(false)}
            />
            <div className="fixed top-0 right-0 h-full w-[30%] min-w-[400px] bg-gray-900/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Tax Copilot</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAiCopilotOpen(false)}
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-purple-400" />
                    </div>
                    <h4 className="text-white font-semibold mb-2">Ask about your taxes</h4>
                    <p className="text-gray-400 text-sm mb-4 max-w-xs">
                      Get insights about filings, deadlines, and compliance.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 max-w-[85%]",
                        msg.role === "user" ? "bg-blue-600 text-white" : "bg-white/5 border border-white/10 text-gray-300"
                      )}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-6 pb-3 space-y-2">
                <div className="text-xs text-gray-400 mb-2">Quick prompts:</div>
                <div className="flex flex-wrap gap-2">
                  {aiPrompts.map((prompt, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setInputMessage(prompt);
                        handleSendMessage(prompt);
                      }}
                      className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white text-xs h-7"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputMessage)}
                    placeholder="Ask about taxes..."
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                  <Button
                    onClick={() => handleSendMessage(inputMessage)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        <ExplainThisViewModal
          open={explainViewOpen}
          onClose={() => setExplainViewOpen(false)}
        />

        <TaxDrilldownDrawer
          open={!!selectedTaxForDrawer}
          onClose={() => setSelectedTaxForDrawer(null)}
          taxData={selectedTaxForDrawer}
        />
      </div>
    </TaxInsightsProvider>
  );
}
