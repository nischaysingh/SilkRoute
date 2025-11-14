
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity, TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle,
  Search, Play, Pause, Trash2, Eye, History, GitBranch, Sparkles,
  BarChart3, Zap, FileText, Download, RefreshCw, AlertTriangle, Target, BookOpen, User, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import RunbookManager from "../runbooks/RunbookManager";
import RealTimeMissionAnalytics from "../analytics/RealTimeMissionAnalytics";
import GoalOrchestrator from "../orchestration/GoalOrchestrator";
import PersonaBuilder from "../personas/PersonaBuilder";
import EnhancedAnalyticsDashboard from "../analytics/EnhancedAnalyticsDashboard";
import WorkflowOptimizer from "../optimization/WorkflowOptimizer";
import AIAuditCenter from "../audit/AIAuditCenter";
import AIMissionsList from "../silkroute/AIMissionsList";

export default function ManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [auditReport, setAuditReport] = useState(null);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [executionHistoryOpen, setExecutionHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("orchestration"); // Changed initial activeTab to "orchestration"
  const queryClient = useQueryClient();

  // Fetch all workflows
  const { data: workflows = [], isLoading: loadingWorkflows } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.Workflow.list('-updated_date', 50)
  });

  // Fetch executions for selected workflow
  const { data: executions = [] } = useQuery({
    queryKey: ['workflow-executions', selectedWorkflow?.id],
    queryFn: () => {
      if (!selectedWorkflow) return [];
      return base44.entities.WorkflowExecution.filter({ 
        workflow_id: selectedWorkflow.id 
      });
    },
    enabled: !!selectedWorkflow
  });

  // Execute workflow mutation
  const executeWorkflowMutation = useMutation({
    mutationFn: async (workflowId) => {
      const response = await base44.functions.invoke('executeWorkflow', { 
        workflow_id: workflowId 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
      toast.success('Workflow executed successfully');
    },
    onError: (error) => {
      toast.error('Failed to execute workflow', {
        description: error.message
      });
    }
  });

  // Update workflow status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ workflowId, status }) => {
      return base44.entities.Workflow.update(workflowId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow status updated');
    }
  });

  // Delete workflow mutation
  const deleteWorkflowMutation = useMutation({
    mutationFn: async (workflowId) => {
      return base44.entities.Workflow.delete(workflowId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setSelectedWorkflow(null);
      toast.success('Workflow deleted');
    }
  });

  // Run AI audit
  const runAudit = async (workflowId) => {
    setLoadingAudit(true);
    try {
      const response = await base44.functions.invoke('auditWorkflow', {
        workflow_id: workflowId,
        time_range_days: 30
      });
      setAuditReport(response.data);
      toast.success('AI audit completed');
    } catch (error) {
      toast.error('Failed to run audit', {
        description: error.message
      });
    } finally {
      setLoadingAudit(false);
    }
  };

  // Calculate real-time metrics for selected workflow
  const realtimeMetrics = React.useMemo(() => {
    if (!executions || executions.length === 0) {
      return {
        totalRuns: 0,
        successRate: 0,
        avgDuration: 0,
        activeRuns: 0,
        recentFailures: 0
      };
    }

    const totalRuns = executions.length;
    const successfulRuns = executions.filter(e => e.status === 'succeeded').length;
    const successRate = (successfulRuns / totalRuns * 100).toFixed(1);
    const durations = executions.filter(e => e.duration_ms).map(e => e.duration_ms);
    const avgDuration = durations.length > 0 
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
    const activeRuns = executions.filter(e => e.status === 'running').length;
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentFailures = executions.filter(e => 
      e.status === 'failed' && new Date(e.start_time) > last24h
    ).length;

    return { totalRuns, successRate, avgDuration, activeRuns, recentFailures };
  }, [executions]);

  // Performance trend data
  const trendData = React.useMemo(() => {
    if (!executions || executions.length === 0) return [];
    
    const last7Days = executions
      .filter(e => e.end_time)
      .slice(-7)
      .map(e => ({
        time: format(new Date(e.start_time), 'MMM dd'),
        duration: e.duration_ms,
        success: e.status === 'succeeded' ? 1 : 0
      }));
    
    return last7Days;
  }, [executions]);

  // Filter workflows
  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'draft': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getExecutionStatusColor = (status) => {
    switch (status) {
      case 'succeeded': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'running': return 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse';
      case 'partial': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Workflow Management</h2>
          <p className="text-sm text-slate-600 mt-1">Monitor, audit, and optimize your automated workflows</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (selectedWorkflow) {
                runAudit(selectedWorkflow.id);
              } else {
                toast.info('Select a workflow first');
              }
            }}
            disabled={loadingAudit}
            className="h-9"
          >
            {loadingAudit ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Run AI Audit
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="analytics">
            <Activity className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="optimizer">
            <Zap className="w-4 h-4 mr-2" />
            Optimizer
          </TabsTrigger>
          <TabsTrigger value="runbooks">
            <BookOpen className="w-4 h-4 mr-2" />
            Runbooks
          </TabsTrigger>
          <TabsTrigger value="orchestration">
            <Target className="w-4 h-4 mr-2" />
            Orchestration
          </TabsTrigger>
          <TabsTrigger value="personas">
            <User className="w-4 h-4 mr-2" />
            Personas
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Shield className="w-4 h-4 mr-2" />
            AI Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6 mt-6">
          {/* Search */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workflows..."
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-12 gap-6">
            {/* Workflow List */}
            <div className="col-span-4 space-y-4">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Workflows ({filteredWorkflows.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2 p-4 pt-0">
                      {loadingWorkflows ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                      ) : filteredWorkflows.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">
                          No workflows found
                        </div>
                      ) : (
                        filteredWorkflows.map((workflow) => (
                          <motion.div
                            key={workflow.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <Card
                              className={cn(
                                "cursor-pointer hover:shadow-md transition-all border",
                                selectedWorkflow?.id === workflow.id
                                  ? "border-blue-500 bg-blue-50/50"
                                  : "border-slate-200 bg-white"
                              )}
                              onClick={() => {
                                setSelectedWorkflow(workflow);
                                setAuditReport(null);
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-sm text-slate-900">{workflow.name}</h3>
                                  <Badge className={getStatusColor(workflow.status)}>
                                    {workflow.status}
                                  </Badge>
                                </div>
                                {workflow.description && (
                                  <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                                    {workflow.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-slate-50">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(workflow.updated_date || workflow.created_date), 'MMM dd, yyyy')}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Workflow Details & Monitoring */}
            <div className="col-span-8 space-y-4">
              {!selectedWorkflow ? (
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
                  <CardContent className="p-12 text-center">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Workflow Selected</h3>
                    <p className="text-sm text-slate-600">Select a workflow to view its monitoring dashboard and details</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Workflow Header */}
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900 mb-1">{selectedWorkflow.name}</h2>
                          <p className="text-sm text-slate-600">{selectedWorkflow.description || 'No description'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setVersionHistoryOpen(true)}
                            className="h-8"
                          >
                            <GitBranch className="w-3 h-3 mr-1" />
                            v{selectedWorkflow.version || 1}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setExecutionHistoryOpen(true)}
                            className="h-8"
                          >
                            <History className="w-3 h-3 mr-1" />
                            History
                          </Button>
                          {selectedWorkflow.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ 
                                workflowId: selectedWorkflow.id, 
                                status: 'inactive' 
                              })}
                              className="h-8"
                            >
                              <Pause className="w-3 h-3 mr-1" />
                              Pause
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ 
                                workflowId: selectedWorkflow.id, 
                                status: 'active' 
                              })}
                              className="h-8 bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Activate
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => executeWorkflowMutation.mutate(selectedWorkflow.id)}
                            disabled={selectedWorkflow.status !== 'active' || executeWorkflowMutation.isPending}
                            className="h-8 bg-blue-600 hover:bg-blue-700"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Test Run
                          </Button>
                        </div>
                      </div>

                      {/* Real-time Metrics */}
                      <div className="grid grid-cols-5 gap-3">
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600">Total Runs</span>
                            <Activity className="w-3 h-3 text-blue-500" />
                          </div>
                          <div className="text-xl font-bold text-slate-900">{realtimeMetrics.totalRuns}</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600">Success Rate</span>
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                          </div>
                          <div className="text-xl font-bold text-slate-900">{realtimeMetrics.successRate}%</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600">Avg Duration</span>
                            <Clock className="w-3 h-3 text-purple-500" />
                          </div>
                          <div className="text-xl font-bold text-slate-900">{realtimeMetrics.avgDuration}ms</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600">Active Runs</span>
                            <Zap className="w-3 h-3 text-amber-500" />
                          </div>
                          <div className="text-xl font-bold text-slate-900">{realtimeMetrics.activeRuns}</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600">Recent Failures</span>
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                          </div>
                          <div className="text-xl font-bold text-slate-900">{realtimeMetrics.recentFailures}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Charts */}
                  {trendData.length > 0 && (
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
                      <CardHeader>
                        <CardTitle className="text-sm">Performance Trends (Last 7 Runs)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Line type="monotone" dataKey="duration" stroke="#3b82f6" strokeWidth={2} name="Duration (ms)" />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Audit Report */}
                  {auditReport && (
                    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            AI Audit Report
                          </CardTitle>
                          <Badge className="bg-purple-500/20 text-purple-700 border-purple-500/30">
                            {auditReport.ai_analysis?.performance_grade || 'N/A'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {auditReport.ai_analysis ? (
                          <>
                            {/* Overall Summary */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200">
                              <h4 className="font-semibold text-sm text-slate-900 mb-2">Executive Summary</h4>
                              <p className="text-sm text-slate-700">{auditReport.ai_analysis.overall_summary}</p>
                            </div>

                            {/* Optimization Suggestions */}
                            {auditReport.ai_analysis.optimization_suggestions?.length > 0 && (
                              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
                                <h4 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
                                  <Target className="w-4 h-4 text-blue-600" />
                                  Optimization Suggestions
                                </h4>
                                <div className="space-y-2">
                                  {auditReport.ai_analysis.optimization_suggestions.map((suggestion, idx) => (
                                    <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                      <div className="flex items-start justify-between mb-1">
                                        <span className="font-medium text-sm text-slate-900">{suggestion.title}</span>
                                        <Badge className={cn(
                                          "text-xs",
                                          suggestion.priority === 'high' && "bg-red-500/20 text-red-700 border-red-500/30",
                                          suggestion.priority === 'medium' && "bg-amber-500/20 text-amber-700 border-amber-500/30",
                                          suggestion.priority === 'low' && "bg-emerald-500/20 text-emerald-700 border-emerald-500/30"
                                        )}>
                                          {suggestion.priority}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-slate-600 mb-1">{suggestion.description}</p>
                                      <p className="text-xs text-emerald-700 font-medium">
                                        Expected: {suggestion.expected_improvement}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Anomalies & Risks */}
                            {auditReport.ai_analysis.anomalies_and_risks?.length > 0 && (
                              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-red-200">
                                <h4 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                  Anomalies & Risks
                                </h4>
                                <div className="space-y-2">
                                  {auditReport.ai_analysis.anomalies_and_risks.map((risk, idx) => (
                                    <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-100">
                                      <div className="flex items-start justify-between mb-1">
                                        <span className="font-medium text-sm text-slate-900">{risk.type}</span>
                                        <Badge className={cn(
                                          "text-xs",
                                          risk.severity === 'critical' && "bg-red-600/20 text-red-700 border-red-600/30",
                                          risk.severity === 'high' && "bg-red-500/20 text-red-700 border-red-500/30",
                                          risk.severity === 'medium' && "bg-amber-500/20 text-amber-700 border-amber-500/30",
                                          risk.severity === 'low' && "bg-blue-500/20 text-blue-700 border-blue-500/30"
                                        )}>
                                          {risk.severity}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-slate-600 mb-1">{risk.description}</p>
                                      <p className="text-xs text-blue-700 font-medium">
                                        → {risk.recommendation}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Actionable Insights */}
                            {auditReport.ai_analysis.actionable_insights?.length > 0 && (
                              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-emerald-200">
                                <h4 className="font-semibold text-sm text-slate-900 mb-2">Actionable Insights</h4>
                                <ul className="space-y-1">
                                  {auditReport.ai_analysis.actionable_insights.map((insight, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                      <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                                      <span>{insight}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8 text-slate-600">
                            No AI analysis available
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Workflow Steps */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Workflow Steps ({selectedWorkflow.steps?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedWorkflow.steps?.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-slate-900">{step.name}</div>
                              <div className="text-xs text-slate-600">{step.type}</div>
                            </div>
                            <Badge className="bg-slate-200 text-slate-700 text-xs">
                              {step.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="bg-red-50/50 border-red-200">
                    <CardHeader>
                      <CardTitle className="text-sm text-red-900">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete workflow "${selectedWorkflow.name}"? This action cannot be undone.`)) {
                            deleteWorkflowMutation.mutate(selectedWorkflow.id);
                          }
                        }}
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Workflow
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab - Enhanced */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          {selectedWorkflow ? (
            <EnhancedAnalyticsDashboard missionId={selectedWorkflow.id} />
          ) : (
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-12 text-center">
                <Activity className="w-16 h-16 mx-auto mb-4 text-blue-400 opacity-50" />
                <h4 className="text-lg font-semibold text-slate-900 mb-2">No Mission Selected</h4>
                <p className="text-sm text-slate-600">Select a workflow to view enhanced analytics</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* NEW: Optimizer Tab */}
        <TabsContent value="optimizer" className="space-y-6 mt-6">
          <WorkflowOptimizer workflow={selectedWorkflow} />
        </TabsContent>

        {/* Runbooks Tab */}
        <TabsContent value="runbooks" className="space-y-6 mt-6">
          <RunbookManager 
            missionId={selectedWorkflow?.id} 
            incidentId={null}
          />
        </TabsContent>

        {/* Orchestration Tab */}
        <TabsContent value="orchestration" className="space-y-6 mt-6">
          <GoalOrchestrator />
          
          <div className="mt-8">
            <AIMissionsList />
          </div>
        </TabsContent>

        {/* NEW: Personas Tab */}
        <TabsContent value="personas" className="space-y-6 mt-6">
          <PersonaBuilder />
        </TabsContent>

        {/* NEW: AI Audit Tab */}
        <TabsContent value="audit" className="space-y-6 mt-6">
          <AIAuditCenter />
        </TabsContent>
      </Tabs>

      {/* Version History Modal */}
      <Dialog open={versionHistoryOpen} onOpenChange={setVersionHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History - {selectedWorkflow?.name}</DialogTitle>
            <DialogDescription>
              View and restore previous versions of this workflow
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-3 pr-4">
              {selectedWorkflow?.version_history?.length > 0 ? (
                selectedWorkflow.version_history.map((version, idx) => (
                  <Card key={idx} className="bg-slate-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30 mb-2">
                            v{version.version}
                          </Badge>
                          <p className="text-sm font-medium text-slate-900">{version.changes_summary}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {format(new Date(version.created_at), 'MMM dd, yyyy HH:mm')} by {version.created_by}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-slate-600">
                  No version history available
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Execution History Modal */}
      <Dialog open={executionHistoryOpen} onOpenChange={setExecutionHistoryOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Execution History - {selectedWorkflow?.name}</DialogTitle>
            <DialogDescription>
              Detailed log of all workflow executions
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-2 pr-4">
              {executions.length > 0 ? (
                executions.map((execution) => (
                  <Card key={execution.id} className="bg-slate-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getExecutionStatusColor(execution.status)}>
                              {execution.status}
                            </Badge>
                            <span className="text-xs text-slate-600">
                              {format(new Date(execution.start_time), 'MMM dd, yyyy HH:mm:ss')}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-3 text-xs">
                            <div>
                              <span className="text-slate-600">Duration:</span>
                              <span className="ml-1 font-medium text-slate-900">
                                {execution.duration_ms ? `${execution.duration_ms}ms` : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-600">Triggered by:</span>
                              <span className="ml-1 font-medium text-slate-900">
                                {execution.triggered_by}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-600">Version:</span>
                              <span className="ml-1 font-medium text-slate-900">
                                v{execution.workflow_version}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-600">Cost:</span>
                              <span className="ml-1 font-medium text-slate-900">
                                ${execution.resource_usage_summary?.total_cost_usd?.toFixed(4) || '0.0000'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-slate-600">
                  No executions yet
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
