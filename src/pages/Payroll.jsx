import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle,
  Download, Eye, Plus, Search, Filter, Activity, Calendar, ArrowRight, Sparkles
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Payroll() {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personDrawerOpen, setPersonDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [peopleFilter, setPeopleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Mock Data
  const people = [
    { id: 1, name: "Alice Johnson", type: "Employee", dept: "Engineering", role: "Senior Engineer", base_pay: 120000, pay_type: "salary", next_pay_date: "2024-12-31", status: "Active", email: "alice@acme.com", hire_date: "2022-01-15" },
    { id: 2, name: "Bob Smith", type: "Employee", dept: "Sales", role: "Sales Manager", base_pay: 95000, pay_type: "salary", next_pay_date: "2024-12-31", status: "Active", email: "bob@acme.com", hire_date: "2021-06-20" },
    { id: 3, name: "Carol White", type: "Contractor", dept: "Marketing", role: "Marketing Consultant", base_pay: 8500, pay_type: "monthly", next_pay_date: "2024-12-31", status: "Active", email: "carol@external.com", hire_date: "2023-03-10" },
    { id: 4, name: "David Lee", type: "Employee", dept: "Engineering", role: "Product Manager", base_pay: 110000, pay_type: "salary", next_pay_date: "2024-12-31", status: "Active", email: "david@acme.com", hire_date: "2022-08-01" },
    { id: 5, name: "Eva Brown", type: "Contractor", dept: "Design", role: "UI/UX Designer", base_pay: 7000, pay_type: "monthly", next_pay_date: "2024-12-31", status: "Inactive", email: "eva@external.com", hire_date: "2023-09-15" },
    { id: 6, name: "Frank Wilson", type: "Employee", dept: "Finance", role: "Financial Analyst", base_pay: 85000, pay_type: "salary", next_pay_date: "2024-12-31", status: "Active", email: "frank@acme.com", hire_date: "2021-11-05" }
  ];

  const payRuns = [
    { id: 1, run_date: "2024-12-15", period: "Dec 1 - Dec 15", gross: 42500, taxes: 8500, net: 32800, employees: 4, contractors: 2, status: "Paid" },
    { id: 2, run_date: "2024-11-30", period: "Nov 16 - Nov 30", gross: 41800, taxes: 8360, net: 32290, employees: 4, contractors: 2, status: "Paid" },
    { id: 3, run_date: "2024-11-15", period: "Nov 1 - Nov 15", gross: 42100, taxes: 8420, net: 32500, employees: 4, contractors: 2, status: "Paid" }
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

  const payrollMetrics = {
    total_employees: 4,
    total_contractors: 2,
    total_active: 5,
    monthly_payroll: 44800,
    ytd_payroll: 537600,
    ytd_taxes: 107520
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
    { dept: "Marketing", headcount: 1, monthly_cost: 8500 },
    { dept: "Design", headcount: 1, monthly_cost: 7000 },
    { dept: "Finance", headcount: 1, monthly_cost: 7083 }
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

  const handleViewPerson = (person) => {
    setSelectedPerson(person);
    setPersonDrawerOpen(true);
  };

  const handleRunPayroll = () => {
    toast.success("Payroll run initiated", {
      description: "Processing payroll for 6 people"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Payroll</h2>
          <p className="text-gray-400 text-sm mt-1">Manage payroll, people, and tax compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleRunPayroll} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Run Payroll
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Active</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{payrollMetrics.total_active}</div>
            <div className="text-xs text-gray-400">Total People</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Monthly</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">${(payrollMetrics.monthly_payroll / 1000).toFixed(1)}k</div>
            <div className="text-xs text-gray-400">Monthly Payroll</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">YTD</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">${(payrollMetrics.ytd_payroll / 1000).toFixed(0)}k</div>
            <div className="text-xs text-gray-400">YTD Payroll</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Next</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{upcomingPayroll.days_until} days</div>
            <div className="text-xs text-gray-400">Until Next Payroll</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="pay-runs">Pay Runs</TabsTrigger>
          <TabsTrigger value="taxes">Tax Obligations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Payroll Trend */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Payroll Trend (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={payrollTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <Tooltip
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
                    <Line type="monotone" dataKey="gross" stroke="#10b981" strokeWidth={2} name="Gross" />
                    <Line type="monotone" dataKey="taxes" stroke="#f59e0b" strokeWidth={2} name="Taxes" />
                    <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} name="Net" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Breakdown */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Cost by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={departmentBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="dept" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value) => `$${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="monthly_cost" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Payroll */}
          <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">Next Payroll Run</h3>
                  <p className="text-blue-100 text-sm">{upcomingPayroll.period}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{upcomingPayroll.days_until}</div>
                  <div className="text-sm text-blue-100">days away</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-sm text-blue-100 mb-1">Gross Pay</div>
                  <div className="text-xl font-bold">${upcomingPayroll.estimated_gross.toLocaleString()}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-sm text-blue-100 mb-1">Taxes</div>
                  <div className="text-xl font-bold">${upcomingPayroll.estimated_taxes.toLocaleString()}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-sm text-blue-100 mb-1">Net Pay</div>
                  <div className="text-xl font-bold">${upcomingPayroll.estimated_net.toLocaleString()}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-sm text-blue-100 mb-1">People</div>
                  <div className="text-xl font-bold">{upcomingPayroll.employees + upcomingPayroll.contractors}</div>
                </div>
              </div>

              <Button className="w-full mt-4 bg-white text-blue-600 hover:bg-white/90">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve & Run Payroll
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* People Tab */}
        <TabsContent value="people" className="space-y-6 mt-6">
          {/* Filters */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search people..."
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
                <Select value={peopleFilter} onValueChange={setPeopleFilter}>
                  <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20 text-white">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="employee">Employees</SelectItem>
                    <SelectItem value="contractor">Contractors</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20 text-white">
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* People Table */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-gray-400">Name</TableHead>
                    <TableHead className="text-gray-400">Type</TableHead>
                    <TableHead className="text-gray-400">Department</TableHead>
                    <TableHead className="text-gray-400">Role</TableHead>
                    <TableHead className="text-gray-400">Base Pay</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPeople.map((person) => (
                    <TableRow key={person.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-white font-medium">{person.name}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-xs",
                          person.type === "Employee" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                        )}>
                          {person.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{person.dept}</TableCell>
                      <TableCell className="text-gray-300">{person.role}</TableCell>
                      <TableCell className="text-white">${person.base_pay.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-xs",
                          person.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"
                        )}>
                          {person.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewPerson(person)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-white/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pay Runs Tab */}
        <TabsContent value="pay-runs" className="space-y-6 mt-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm">Recent Pay Runs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-gray-400">Date</TableHead>
                    <TableHead className="text-gray-400">Period</TableHead>
                    <TableHead className="text-gray-400">Gross</TableHead>
                    <TableHead className="text-gray-400">Taxes</TableHead>
                    <TableHead className="text-gray-400">Net</TableHead>
                    <TableHead className="text-gray-400">People</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payRuns.map((run) => (
                    <TableRow key={run.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-white font-medium">{run.run_date}</TableCell>
                      <TableCell className="text-gray-300">{run.period}</TableCell>
                      <TableCell className="text-white">${run.gross.toLocaleString()}</TableCell>
                      <TableCell className="text-amber-400">${run.taxes.toLocaleString()}</TableCell>
                      <TableCell className="text-emerald-400">${run.net.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-300">{run.employees + run.contractors}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                          {run.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Obligations Tab */}
        <TabsContent value="taxes" className="space-y-6 mt-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Upcoming Tax Obligations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: "Federal Withholding", due: "Jan 15, 2025", amount: 15200, status: "Upcoming" },
                  { type: "Social Security & Medicare", due: "Jan 15, 2025", amount: 12800, status: "Upcoming" },
                  { type: "State Withholding (CA)", due: "Jan 31, 2025", amount: 4200, status: "Upcoming" }
                ].map((tax, idx) => (
                  <Card key={idx} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white mb-1">{tax.type}</div>
                          <div className="text-xs text-gray-400">Due: {tax.due}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">${tax.amount.toLocaleString()}</div>
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs mt-1">
                            {tax.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Person Detail Drawer */}
      <Sheet open={personDrawerOpen} onOpenChange={setPersonDrawerOpen}>
        <SheetContent className="bg-gray-900 border-white/10 text-white w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="text-white">Person Details</SheetTitle>
          </SheetHeader>
          {selectedPerson && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{selectedPerson.name}</h3>
                <p className="text-gray-400 text-sm">{selectedPerson.role}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Type</div>
                  <Badge className={cn(
                    "text-xs",
                    selectedPerson.type === "Employee" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                  )}>
                    {selectedPerson.type}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Status</div>
                  <Badge className={cn(
                    "text-xs",
                    selectedPerson.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"
                  )}>
                    {selectedPerson.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Department</div>
                  <div className="text-sm text-white">{selectedPerson.dept}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Email</div>
                  <div className="text-sm text-white">{selectedPerson.email}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Base Pay</div>
                  <div className="text-sm text-white font-semibold">${selectedPerson.base_pay.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Pay Type</div>
                  <div className="text-sm text-white">{selectedPerson.pay_type}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Hire Date</div>
                  <div className="text-sm text-white">{selectedPerson.hire_date}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Next Pay Date</div>
                  <div className="text-sm text-white">{selectedPerson.next_pay_date}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Edit Details
                </Button>
                <Button variant="outline" className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10">
                  View History
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}