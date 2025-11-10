import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Shield, Search, Filter, Download, Eye, AlertCircle, CheckCircle,
  XCircle, Clock, User, Activity, Settings, Lock, RefreshCw
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

const getSeverityColor = (severity) => {
  switch (severity) {
    case "critical": return "bg-red-100 text-red-800 border-red-300";
    case "high": return "bg-orange-100 text-orange-800 border-orange-300";
    case "medium": return "bg-amber-100 text-amber-800 border-amber-300";
    case "low": return "bg-blue-100 text-blue-800 border-blue-300";
    default: return "bg-slate-100 text-slate-800 border-slate-300";
  }
};

const getActionIcon = (actionType) => {
  if (actionType.includes("approve") || actionType === "success") return <CheckCircle className="w-4 h-4 text-emerald-600" />;
  if (actionType.includes("hold") || actionType.includes("pause")) return <Clock className="w-4 h-4 text-amber-600" />;
  if (actionType.includes("incident") || actionType === "failure") return <AlertCircle className="w-4 h-4 text-red-600" />;
  if (actionType.includes("login") || actionType.includes("logout")) return <User className="w-4 h-4 text-blue-600" />;
  if (actionType.includes("config") || actionType.includes("profile")) return <Settings className="w-4 h-4 text-purple-600" />;
  if (actionType.includes("safe_mode") || actionType.includes("throttle")) return <Shield className="w-4 h-4 text-indigo-600" />;
  return <Activity className="w-4 h-4 text-slate-600" />;
};

const getStatusColor = (status) => {
  switch (status) {
    case "success": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "failure": return "bg-red-50 text-red-700 border-red-200";
    case "partial": return "bg-amber-50 text-amber-700 border-amber-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

export default function AuditLogViewer({ open, onOpenChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [timeRangeFilter, setTimeRangeFilter] = useState("24h");
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: auditLogs = [], isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', timeRangeFilter],
    queryFn: async () => {
      const logs = await base44.entities.AuditLog.list('-timestamp', 100);
      
      // Filter by time range
      const now = new Date();
      const timeRanges = {
        "1h": 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
        "all": Infinity
      };
      
      const rangeMs = timeRanges[timeRangeFilter] || timeRanges["24h"];
      
      return logs.filter(log => {
        const logTime = new Date(log.timestamp);
        return (now - logTime) <= rangeMs;
      });
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesActionType = actionTypeFilter === "all" || log.action_type === actionTypeFilter;
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    
    return matchesSearch && matchesActionType && matchesSeverity;
  });

  const handleExportLogs = () => {
    const csv = [
      ["Timestamp", "User", "Action Type", "Description", "Resource", "Status", "Severity"].join(","),
      ...filteredLogs.map(log => [
        format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
        log.user_email,
        log.action_type,
        `"${log.action_description}"`,
        log.resource_type,
        log.status,
        log.severity
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    
    toast.success("Audit log exported", {
      description: `${filteredLogs.length} records exported to CSV`
    });
  };

  const complianceRelevantCount = filteredLogs.filter(l => l.compliance_relevant).length;
  const criticalCount = filteredLogs.filter(l => l.severity === "critical").length;
  const failureCount = filteredLogs.filter(l => l.status === "failure").length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-slate-200 w-full sm:max-w-6xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Audit Log — Security & Compliance
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-900">{filteredLogs.length}</div>
                    <div className="text-xs text-blue-700">Total Events</div>
                  </div>
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{complianceRelevantCount}</div>
                    <div className="text-xs text-purple-700">Compliance</div>
                  </div>
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-900">{criticalCount}</div>
                    <div className="text-xs text-red-700">Critical</div>
                  </div>
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-amber-900">{failureCount}</div>
                    <div className="text-xs text-amber-700">Failures</div>
                  </div>
                  <XCircle className="w-6 h-6 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader className="border-b border-slate-200 pb-3">
              <CardTitle className="text-slate-900 text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-600" />
                  Filters & Search
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => refetch()}
                    className="h-7 text-xs">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportLogs}
                    className="h-7 text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    Export CSV
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Action Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="request_approve">Approvals</SelectItem>
                    <SelectItem value="request_hold">Holds</SelectItem>
                    <SelectItem value="profile_change">Profile Changes</SelectItem>
                    <SelectItem value="safe_mode_toggle">Safe Mode</SelectItem>
                    <SelectItem value="batch_operation">Batch Ops</SelectItem>
                    <SelectItem value="command_execute">Commands</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log Table */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 mx-auto mb-3 text-slate-400 animate-spin" />
                  <p className="text-sm text-slate-500">Loading audit logs...</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm text-slate-500">No audit logs found</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50 z-10">
                      <TableRow className="border-slate-200">
                        <TableHead className="text-slate-700 text-xs font-semibold">Time</TableHead>
                        <TableHead className="text-slate-700 text-xs font-semibold">User</TableHead>
                        <TableHead className="text-slate-700 text-xs font-semibold">Action</TableHead>
                        <TableHead className="text-slate-700 text-xs font-semibold">Description</TableHead>
                        <TableHead className="text-slate-700 text-xs font-semibold">Resource</TableHead>
                        <TableHead className="text-slate-700 text-xs font-semibold">Status</TableHead>
                        <TableHead className="text-slate-700 text-xs font-semibold">Severity</TableHead>
                        <TableHead className="text-slate-700 text-xs font-semibold">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={cn(
                            "border-slate-200 hover:bg-slate-50 transition-colors",
                            log.severity === "critical" && "bg-red-50/50",
                            log.compliance_relevant && "border-l-4 border-l-purple-500"
                          )}
                        >
                          <TableCell className="text-xs text-slate-700 font-mono">
                            {format(new Date(log.timestamp), "MMM dd, HH:mm:ss")}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex flex-col">
                              <span className="text-slate-900 font-medium">{log.user_name || "Unknown"}</span>
                              <span className="text-slate-600 text-[10px]">{log.user_email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {getActionIcon(log.action_type)}
                              <span className="text-xs text-slate-700 capitalize">
                                {log.action_type.replace(/_/g, " ")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-700 max-w-xs truncate">
                            {log.action_description}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-slate-100 text-slate-700 text-xs capitalize">
                              {log.resource_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs capitalize", getStatusColor(log.status))}>
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs capitalize", getSeverityColor(log.severity))}>
                              {log.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedLog(log);
                                setDetailsOpen(true);
                              }}
                              className="h-6 w-6 p-0">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details Drawer */}
        <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
          <SheetContent className="bg-white border-slate-200 w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Audit Log Details
              </SheetTitle>
            </SheetHeader>
            
            {selectedLog && (
              <div className="mt-6 space-y-4">
                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-900">Event Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Timestamp</span>
                      <span className="text-slate-900 font-mono">
                        {format(new Date(selectedLog.timestamp), "yyyy-MM-dd HH:mm:ss")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">User</span>
                      <div className="text-right">
                        <div className="text-slate-900 font-medium">{selectedLog.user_name || "Unknown"}</div>
                        <div className="text-slate-600 text-xs">{selectedLog.user_email}</div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Action Type</span>
                      <Badge className="bg-blue-100 text-blue-800 capitalize">
                        {selectedLog.action_type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status</span>
                      <Badge className={cn(getStatusColor(selectedLog.status), "capitalize")}>
                        {selectedLog.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Severity</span>
                      <Badge className={cn(getSeverityColor(selectedLog.severity), "capitalize")}>
                        {selectedLog.severity}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Compliance Relevant</span>
                      <Badge className={selectedLog.compliance_relevant ? 
                        "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-600"}>
                        {selectedLog.compliance_relevant ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-blue-900">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700">{selectedLog.action_description}</p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-purple-900">Resource Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Resource Type</span>
                      <Badge className="bg-purple-100 text-purple-800 capitalize">
                        {selectedLog.resource_type}
                      </Badge>
                    </div>
                    {selectedLog.resource_id && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Resource ID</span>
                        <span className="text-slate-900 font-mono text-xs">
                          {selectedLog.resource_id}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-900">Additional Metadata</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-white rounded-lg p-3 border border-slate-200 overflow-x-auto">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {selectedLog.ip_address && (
                  <Card className="bg-amber-50 border-amber-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-amber-900">Security Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">IP Address</span>
                        <span className="text-slate-900 font-mono">{selectedLog.ip_address}</span>
                      </div>
                      {selectedLog.user_agent && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">User Agent</span>
                          <span className="text-slate-900 text-xs max-w-xs truncate">
                            {selectedLog.user_agent}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </SheetContent>
    </Sheet>
  );
}