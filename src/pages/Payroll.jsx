import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Users, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle,
  Calendar, Download, Send, Edit, Trash2, Plus, Filter, Search,
  FileText, Settings as SettingsIcon, BarChart3, Eye, ChevronDown, MessageCircle,
  X, Mic, Sparkles, Settings, TrendingDown, ArrowLeft, ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { TooltipProvider, Tooltip as UiTooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function Payroll() {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedPayRun, setSelectedPayRun] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState("Acme Corp");
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [peopleFilter, setPeopleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [showSummaryBar, setShowSummaryBar] = useState(true);
  const [distributionView, setDistributionView] = useState("cost");
  const [showExplainProjection, setShowExplainProjection] = useState(false);
  const [showCoverageSuggestion, setShowCoverageSuggestion] = useState(false);
  const [selectedIssueForResolve, setSelectedIssueForResolve] = useState(null);
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [payRunDrawerOpen, setPayRunDrawerOpen] = useState(false);
  const [selectedPayRunDetails, setSelectedPayRunDetails] = useState(null);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);
  const [createPayRunOpen, setCreatePayRunOpen] = useState(false);
  const [payRunStep, setPayRunStep] = useState(1);
  const [showPayRunSuccess, setShowPayRunSuccess] = useState(false);
  const [payRunFormData, setPayRunFormData] = useState({
    payGroup: "All Employees",
    frequency: "Bi-weekly",
    periodStart: "2024-12-16",
    periodEnd: "2024-12-31",
    payDate: "2024-12-31",
    fundingMethod: "ACH",
    autoCalculateTaxes: true,
    employees: [
      { id: 1, name: "Alice Johnson", role: "Senior Engineer", dept: "Engineering", basePay: 10000, bonus: 0, deductions: 200, taxes: 2000, net: 7800 },
      { id: 2, name: "Bob Smith", role: "Sales Manager", dept: "Sales", basePay: 7917, bonus: 500, deductions: 158, taxes: 1583, net: 6676 },
      { id: 3, name: "David Lee", role: "Product Manager", dept: "Engineering", basePay: 9167, bonus: 0, deductions: 183, taxes: 1833, net: 7151 },
      { id: 4, name: "Carol White", role: "Marketing Consultant", dept: "Marketing", basePay: 8500, bonus: 1200, deductions: 170, taxes: 1700, net: 7830 },
      { id: 5, name: "Frank Wilson", role: "Financial Analyst", dept: "Finance", basePay: 7083, bonus: 0, deductions: 142, taxes: 1417, net: 5524 },
      { id: 6, name: "Eva Brown", role: "UI/UX Designer", dept: "Design", basePay: 7000, bonus: 0, deductions: 140, taxes: 1400, net: 5460 }
    ],
    autoSubmitTaxFilings: true,
    notifyEmployees: true
  });
  const [taxesSubTab, setTaxesSubTab] = useState("quarterly");
  const [eFileModalOpen, setEFileModalOpen] = useState(false);
  const [schedulePaymentModalOpen, setSchedulePaymentModalOpen] = useState(false);
  const [returnDetailDrawerOpen, setReturnDetailDrawerOpen] = useState(false);
  const [selectedTaxObligation, setSelectedTaxObligation] = useState(null);
  const [expandedTaxRowId, setExpandedTaxRowId] = useState(null);
  const [showPaidPayments, setShowPaidPayments] = useState(false);
  const [selectedTaxFilters, setSelectedTaxFilters] = useState({
    jurisdiction: "all",
    type: "all",
    period: "all",
    status: "all"
  });

  // Mock Data
  const companies = ["Acme Corp", "Beta Solutions", "Gamma Enterprises"];
  const people = [
    { id: 1, name: "Alice Johnson", type: "Employee", dept: "Engineering", role: "Senior Engineer", base_pay: 120000, pay_type: "salary", next_pay_date: "2024-12-31", status: "Active", email: "alice@acme.com", hire_date: "2022-01-15", hours_ytd: 2080 },
    { id: 2, name: "Bob Smith", type: "Employee", dept: "Sales", role: "Sales Manager", base_pay: 95000, pay_type: "salary", next_pay_date: "2024-12-31", status: "Active", email: "bob@acme.com", hire_date: "2021-06-20", hours_ytd: 2080 },
    { id: 3, name: "Carol White", type: "Contractor", dept: "Marketing", role: "Marketing Consultant", base_pay: 8500, pay_type: "monthly", next_pay_date: "2024-12-31", status: "Active", email: "carol@external.com", hire_date: "2023-03-10", hours_ytd: 1560 },
    { id: 4, name: "David Lee", type: "Employee", dept: "Engineering", role: "Product Manager", base_pay: 110000, pay_type: "salary", next_pay_date: "2024-12-31", status: "Active", email: "david@acme.com", hire_date: "2022-08-01", hours_ytd: 2080 },
    { id: 5, name: "Eva Brown", type: "Contractor", dept: "Design", role: "UI/UX Designer", base_pay: 7000, pay_type: "monthly", next_pay_date: "2024-12-31", status: "Inactive", email: "eva@external.com", hire_date: "2023-09-15", hours_ytd: 980 },
    { id: 6, name: "Frank Wilson", type: "Employee", dept: "Finance", role: "Financial Analyst", base_pay: 85000, pay_type: "salary", next_pay_date: "2021-12-31", status: "Active", email: "frank@acme.com", hire_date: "2021-11-05", hours_ytd: 2080 },
    { id: 7, name: "Grace Taylor", type: "Employee", dept: "Engineering", role: "Software Engineer", base_pay: 105000, pay_type: "salary", next_pay_date: "2025-01-15", status: "Active", email: "grace@acme.com", hire_date: "2023-05-20", hours_ytd: 1600 },
    { id: 8, name: "Henry Green", type: "Employee", dept: "Sales", role: "Account Executive", base_pay: 80000, pay_type: "salary", next_pay_date: "2025-01-15", status: "Active", email: "henry@acme.com", hire_date: "2023-01-10", hours_ytd: 2080 },
    { id: 9, name: "Ivy King", type: "Contractor", dept: "Marketing", role: "Content Creator", base_pay: 6000, pay_type: "monthly", next_pay_date: "2025-01-15", status: "Active", email: "ivy@external.com", hire_date: "2024-02-01", hours_ytd: 960 },
    { id: 10, name: "Jack Adams", type: "Employee", dept: "Finance", role: "Payroll Specialist", base_pay: 75000, pay_type: "salary", next_pay_date: "2025-01-15", status: "Active", email: "jack@acme.com", hire_date: "2023-07-01", hours_ytd: 1040 }
  ];
  const payRuns = [
    { id: 1, run_date: "2024-12-15", period: "Dec 1 - Dec 15", period_type: "Bi-weekly", gross: 42500, taxes: 8500, deductions: 1200, net: 32800, employees: 4, contractors: 2, status: "Paid", approved_by: "Admin" },
    { id: 2, run_date: "2024-11-30", period: "Nov 16 - Nov 30", period_type: "Bi-weekly", gross: 41800, taxes: 8360, deductions: 1150, net: 32290, employees: 4, contractors: 2, status: "Paid", approved_by: "Admin" },
    { id: 3, run_date: "2024-11-15", period: "Nov 1 - Nov 15", period_type: "Bi-weekly", gross: 42100, taxes: 8420, deductions: 1180, net: 32500, employees: 4, contractors: 2, status: "Paid", approved_by: "Admin" },
    { id: 4, run_date: "2024-10-31", period: "Oct 16 - Oct 31", period_type: "Bi-weekly", gross: 41200, taxes: 8240, deductions: 1100, net: 31860, employees: 4, contractors: 2, status: "Paid", approved_by: "Admin" }
  ];
  const upcomingPayroll = {
    next_date: "2024-12-31",
    period: "Dec 16 - Dec 31",
    estimated_gross: 43200,
    estimated_taxes: 8640,
    estimated_net: 33460,
    employees: 4,
    contractors: 2,
    status: "Pending Approval",
    days_until: 11
  };
  const timeEntries = [
    { id: 1, person: "Alice Johnson", date: "2024-12-19", hours: 8, overtime: 0, status: "Approved", project: "Project Alpha" },
    { id: 2, person: "Bob Smith", date: "2024-12-19", hours: 7.5, overtime: 0, status: "Approved", project: "Sales Pipeline" },
    { id: 3, person: "Carol White", date: "2024-12-19", hours: 6, overtime: 0, status: "Pending", project: "Marketing Campaign" },
    { id: 4, person: "David Lee", date: "2024-12-19", hours: 8.5, overtime: 0.5, status: "Approved", project: "Product Roadmap" },
    { id: 5, person: "Alice Johnson", date: "2024-12-18", hours: 9, overtime: 1, status: "Approved", project: "Project Alpha" }
  ];
  const taxObligations = [
    { id: 1, type: "Federal Withholding", jurisdiction: "US", period: "2024-Q4", dueDate: "2025-01-15", amount: 15200, status: "Upcoming", form: "Form 941", grossWages: 168000, rate: 0.0905, paymentMethod: "ACH Debit", filingMethod: "e-File" },
    { id: 2, type: "Social Security & Medicare", jurisdiction: "US", period: "2024-Q4", dueDate: "2025-01-15", amount: 12800, status: "Upcoming", form: "Form 941", grossWages: 168000, rate: 0.0762, paymentMethod: "ACH Debit", filingMethod: "e-File" },
    { id: 3, type: "State Withholding", jurisdiction: "CA", period: "2024-Q4", dueDate: "2025-01-31", amount: 4200, status: "Upcoming", form: "DE-9", grossWages: 84000, rate: 0.05, paymentMethod: "ACH Credit", filingMethod: "e-File" },
    { id: 4, type: "State Unemployment (SUI)", jurisdiction: "CA", period: "2024-Q4", dueDate: "2025-01-31", amount: 1680, status: "Upcoming", form: "DE-9C", grossWages: 84000, rate: 0.02, paymentMethod: "ACH Credit", filingMethod: "e-File" },
    { id: 5, type: "State Withholding", jurisdiction: "NY", period: "2024-Q4", dueDate: "2025-02-01", amount: 2950, status: "Upcoming", form: "NYS-45", grossWages: 59000, rate: 0.05, paymentMethod: "ACH Credit", filingMethod: "e-File" }
  ];
  const scheduledPayments = [
    { id: 1, date: "2025-01-15", jurisdiction: "US - Federal", amount: 28000, method: "ACH Debit", status: "Scheduled" },
    { id: 2, date: "2025-01-31", jurisdiction: "CA", amount: 5880, method: "ACH Credit", status: "Scheduled" },
    { id: 3, date: "2025-02-01", jurisdiction: "NY", amount: 2950, method: "ACH Credit", status: "Scheduled" },
    { id: 4, date: "2024-12-15", jurisdiction: "US - Federal", amount: 26500, method: "ACH Debit", status: "Paid" }
  ];
  const taxNotices = [
    { id: 1, severity: "info", title: "CA SUI rate update effective Jan 1", description: "New rate: 2.1% (up from 2.0%)", date: "2024-12-10", actionRequired: true },
    { id: 2, severity: "success", title: "IRS deposit schedule confirmed", description: "Semiweekly deposit schedule maintained for 2025", date: "2024-12-01", actionRequired: false }
  ];
  const taxMetrics = {
    total_obligations: 34350,
    next_deadline: "Jan 15, 2025",
    next_deadline_item: "Social Security & Medicare",
    filings_upcoming: 5,
    filings_overdue: 0,
    cash_impact_14d: 22000,
    compliance_score: 98
  };
  const payrollMetrics = {
    total_employees: 4,
    total_contractors: 2,
    total_active: 5,
    avg_salary: 102500,
    monthly_payroll: 44800,
    ytd_payroll: 537600,
    ytd_taxes: 107520,
    next_payroll_date: "2024-12-31",
    payroll_growth: 3.2
  };
  const payrollTrendData = [
    { month: "Jul", gross: 40200, taxes: 8040, net: 32160 },
    { month: "Aug", gross: 41500, taxes: 8300, net: 33200 },
    { month: "Sep", gross: 40800, taxes: 8160, net: 32640 },
    { month: "Oct", gross: 41200, taxes: 8240, net: 32960 },
    { month: "Nov", gross: 42100, taxes: 8420, net: 33680 },
    { month: "Dec", gross: 43200, taxes: 8640, net: 34560 }
  ];
  const departmentBreakdown = [
    { dept: "Engineering", headcount: 3, monthly_cost: 20417 },
    { dept: "Sales", headcount: 2, monthly_cost: 14583 },
    { dept: "Marketing", headcount: 2, monthly_cost: 14500 },
    { dept: "Design", headcount: 1, monthly_cost: 7000 },
    { dept: "Finance", headcount: 2, monthly_cost: 13333 }
  ];
  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
  const filteredPeople = people.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = peopleFilter === "all" || p.type.toLowerCase() === peopleFilter;
    const matchesDept = departmentFilter === "all" || p.dept === departmentFilter;
    return matchesSearch && matchesType && matchesDept;
  });
  const navigate = (path) => console.log("Navigating to:", path);
  const createPageUrl = (pageName) => `/dashboard/${pageName.toLowerCase()}`;
  const currentCoverage = 84;
  const totalOutstandingIssues = 3 - resolvedIssues.length;
  const dynamicAICopilotPrompts = () => {
    if (totalOutstandingIssues > 0) {
      return ["Fix missing hours for Marketing team", "Simulate delaying 2 AP payments", "Why did payroll increase?"];
    } else if (currentCoverage < 90) {
      return ["Simulate delaying 2 AP payments", "Can we afford this payroll?", "Explain coverage drop"];
    } else {
      return ["Generate Payroll Summary for CFO", "Who will hit overtime?", "Simulate 2 new hires"];
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Filed": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Upcoming": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Due Today": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Overdue": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Scheduled": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Paid": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-gray-400">Payroll page - temporarily simplified to fix build error</div>
    </div>
  );
}