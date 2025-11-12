import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  GitBranch, Play, Pause, Trash2, Plus, Search, TrendingUp, Activity, 
  Clock, CheckCircle, XCircle, AlertCircle, Eye, Edit, Zap, Target, BarChart3, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import WorkflowComposer from "../components/explain/WorkflowComposer";

export default function Workflows() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch workflows
  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.Workflow.list('-created_date', 100),
  });

  // Fetch executions
  const { data: executions = [] } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: () => base44.entities.WorkflowExecution.list('-created_date', 100),
  });

  // Update workflow mutation
  const updateWorkflowMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Workflow.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success("Workflow updated");
    },
  });

  // Delete workflow mutation
  const deleteWorkflowMutation = useMutation({
    mutationFn: (id) => base44.entities.Workflow.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success("Workflow deleted");
    },
  });

  // Execute workflow (simulate)
  const executeWorkflowMutation = useMutation({
    mutationFn: async (workflow) => {
      const execution = await base44.entities.WorkflowExecution.create({
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        status: 'running',
        triggered_by: 'manual',
        trigger_data: {},
        steps_executed: 0,
        total_steps: workflow.steps?.length || 0,
        started_at: new Date().toISOString()
      });

      // Simulate execution
      setTimeout(async () => {
        await base44.entities.WorkflowExecution.update(execution.id, {
          status: 'completed',
          steps_executed: workflow.steps?.length || 0,
          execution_time_ms: Math.floor(Math.random() * 3000) + 1000,
          completed_at: new Date().toISOString(),
          result: { success: true }
        });

        await base44.entities.Workflow.update(workflow.id, {
          execution_count: (workflow.execution_count || 0) + 1,
          last_executed: new Date().toISOString(),
          success_rate: Math.min(100, (workflow.success_rate || 0) + Math.random() * 5)
        });

        queryClient.invalidateQueries({ queryKey: ['workflows'] });
        queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
      }, 2000);

      return execution;
    },
    onSuccess: (execution) => {
      toast.success("Workflow execution started", {
        description: "Running in background..."
      });
    },
  });

  const toggleWorkflowStatus = (workflow) => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    updateWorkflowMutation.mutate({
      id: workflow.id,
      data: { status: newStatus }
    });
  };

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    paused: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    archived: "bg-slate-500/20 text-slate-400 border-slate-500/30"
  };

  const statusIcons = {
    draft: Edit,
    active: CheckCircle,
    paused: Pause,
    archived: XCircle
  };

  // Calculate metrics
  const activeWorkflows = workflows.filter(w => w.status === 'active').length;
  const totalExecutions = executions.length;
  const recentExecutions = executions.slice(0, 10);
  const avgSuccessRate = workflows.reduce((sum, w) => sum + (w.success_rate || 0), 0) / (workflows.length || 1);

  const executionTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayExecutions = executions.filter(e => {
      const execDate = new Date(e.created_date);
      return execDate.toDateString() === date.toDateString();
    });
    return {
      date: format(date, 'MMM d'),
      count: dayExecutions.length,
      success: dayExecutions.filter(e => e.status === 'completed').length
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Workflows</h2>
          <p className="text-gray-400 text-sm mt-1">Automated workflows from Explain Mode</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setComposerOpen(true)}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Active</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{activeWorkflows}</div>
            <div className="text-xs text-gray-400">Active Workflows</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Total</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{workflows.length}</div>
            <div className="text-xs text-gray-400">Total Workflows</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">Runs</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{totalExecutions}</div>
            <div className="text-xs text-gray-400">Total Executions</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Avg</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{avgSuccessRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Execution Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={executionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Recent Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {recentExecutions.map((exec) => (
                <div key={exec.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white">{exec.workflow_name}</div>
                    <div className="text-xs text-gray-500">{format(new Date(exec.created_date), 'MMM d, h:mm a')}</div>
                  </div>
                  <Badge className={cn(
                    "text-xs",
                    exec.status === 'completed' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                    exec.status === 'failed' && "bg-red-500/20 text-red-400 border-red-500/30",
                    exec.status === 'running' && "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  )}>
                    {exec.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workflows..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20 text-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflows Table */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Source</TableHead>
                <TableHead className="text-gray-400">Trigger</TableHead>
                <TableHead className="text-gray-400">Steps</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Executions</TableHead>
                <TableHead className="text-gray-400">Success Rate</TableHead>
                <TableHead className="text-gray-400">Last Run</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <GitBranch className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">No workflows yet</p>
                    <Button
                      onClick={() => setComposerOpen(true)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Workflow
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkflows.map((workflow, idx) => {
                  const StatusIcon = statusIcons[workflow.status];
                  return (
                    <TableRow key={workflow.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">
                        <div>
                          <div className="font-semibold">{workflow.name}</div>
                          <div className="text-xs text-gray-500">{workflow.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="text-white">{workflow.source_widget || 'Manual'}</div>
                          <div className="text-gray-500">{workflow.source_page || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                          {workflow.trigger?.type?.replace('_', ' ') || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{workflow.steps?.length || 0}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[workflow.status]}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {workflow.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{workflow.execution_count || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500"
                              style={{ width: `${workflow.success_rate || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-white">{(workflow.success_rate || 0).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-400 text-xs">
                        {workflow.last_executed ? format(new Date(workflow.last_executed), 'MMM d, h:mm a') : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedWorkflow(workflow);
                              setDetailSheetOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleWorkflowStatus(workflow)}
                            className="h-7 w-7 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          >
                            {workflow.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => executeWorkflowMutation.mutate(workflow)}
                            disabled={workflow.status !== 'active'}
                            className="h-7 w-7 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                          >
                            <Zap className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm('Delete this workflow?')) {
                                deleteWorkflowMutation.mutate(workflow.id);
                              }
                            }}
                            className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="bg-gray-900 border-white/10 text-white w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-400" />
              {selectedWorkflow?.name}
            </SheetTitle>
          </SheetHeader>

          {selectedWorkflow && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
                <p className="text-sm text-gray-300">{selectedWorkflow.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Trigger</h3>
                <Card className="bg-blue-500/10 border-blue-500/30">
                  <CardContent className="p-3">
                    <div className="text-xs text-gray-400 mb-1">Type</div>
                    <div className="text-sm text-white font-semibold mb-2">
                      {selectedWorkflow.trigger?.type?.replace('_', ' ') || 'N/A'}
                    </div>
                    {selectedWorkflow.trigger?.condition && (
                      <>
                        <div className="text-xs text-gray-400 mb-1">Condition</div>
                        <div className="text-sm text-white">{selectedWorkflow.trigger.condition}</div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Workflow Steps ({selectedWorkflow.steps?.length || 0})</h3>
                <div className="space-y-3">
                  {selectedWorkflow.steps?.map((step, idx) => {
                    const stepConfig = STEP_TYPES.find(s => s.id === step.type);
                    return (
                      <Card key={step.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-white mb-1">{step.name}</div>
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs mb-2">
                                {stepConfig?.name || step.type}
                              </Badge>
                              {step.config && Object.keys(step.config).length > 0 && (
                                <div className="mt-2 p-2 bg-black/30 rounded text-xs">
                                  <pre className="text-gray-300">{JSON.stringify(step.config, null, 2)}</pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Execution History</h3>
                <div className="space-y-2">
                  {executions
                    .filter(e => e.workflow_id === selectedWorkflow.id)
                    .slice(0, 5)
                    .map((exec) => (
                      <div key={exec.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                        <div>
                          <div className="text-xs text-white">{format(new Date(exec.created_date), 'MMM d, h:mm a')}</div>
                          <div className="text-xs text-gray-500">
                            {exec.steps_executed}/{exec.total_steps} steps • {exec.execution_time_ms}ms
                          </div>
                        </div>
                        <Badge className={cn(
                          "text-xs",
                          exec.status === 'completed' && "bg-emerald-500/20 text-emerald-400",
                          exec.status === 'failed' && "bg-red-500/20 text-red-400"
                        )}>
                          {exec.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => executeWorkflowMutation.mutate(selectedWorkflow)}
                  disabled={selectedWorkflow.status !== 'active'}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Execute Now
                </Button>
                <Button
                  onClick={() => toggleWorkflowStatus(selectedWorkflow)}
                  variant="outline"
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  {selectedWorkflow.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Activate
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Workflow Composer */}
      <WorkflowComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        widgetContext={{}}
      />
    </div>
  );
}