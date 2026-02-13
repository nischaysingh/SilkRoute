import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  Workflow, Search, Play, Pause, Trash2, Eye, Clock, 
  Sparkles, CheckCircle, GitBranch, Plus, TrendingUp, Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WorkflowHub() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.Workflow.list('-updated_date'),
    initialData: [],
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Workflow.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success("Workflow updated successfully");
    },
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: (id) => base44.entities.Workflow.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success("Workflow deleted");
    },
  });

  const handleToggleStatus = (workflow) => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    updateWorkflowMutation.mutate({
      id: workflow.id,
      data: { status: newStatus }
    });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this workflow?")) {
      deleteWorkflowMutation.mutate(id);
    }
  };

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = !searchQuery || 
      w.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case 'paused':
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case 'draft':
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Workflow Hub
          </h2>
          <p className="text-gray-400 mt-1">Manage your automated workflows</p>
        </div>
        <Button
          onClick={() => navigate(createPageUrl("SilkRouteAI"))}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Workflow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardContent className="p-4">
            <div className="text-xs text-gray-400 mb-1">Total Workflows</div>
            <div className="text-2xl font-bold text-white">{workflows.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardContent className="p-4">
            <div className="text-xs text-gray-400 mb-1">Active</div>
            <div className="text-2xl font-bold text-emerald-400">
              {workflows.filter(w => w.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardContent className="p-4">
            <div className="text-xs text-gray-400 mb-1">Paused</div>
            <div className="text-2xl font-bold text-amber-400">
              {workflows.filter(w => w.status === 'paused').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardContent className="p-4">
            <div className="text-xs text-gray-400 mb-1">Draft</div>
            <div className="text-2xl font-bold text-gray-400">
              {workflows.filter(w => w.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'paused', 'draft'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ?
                    "bg-blue-600 hover:bg-blue-700" :
                    "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  }
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflows Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
          <CardContent className="p-12 text-center">
            <Workflow className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No workflows found</p>
            <Button
              onClick={() => navigate(createPageUrl("SilkRouteAI"))}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((workflow) => (
            <Card 
              key={workflow.id}
              className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
              onClick={() => setSelectedWorkflow(workflow)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-sm mb-2">
                      {workflow.name || "Untitled Workflow"}
                    </CardTitle>
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status || 'draft'}
                    </Badge>
                  </div>
                  <Workflow className="w-5 h-5 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-gray-400 line-clamp-2">
                  {workflow.description || "No description"}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <GitBranch className="w-3 h-3" />
                  <span>{workflow.steps?.length || 0} steps</span>
                  {workflow.metadata?.integrations && (
                    <>
                      <span>•</span>
                      <span>{workflow.metadata.integrations.length} integrations</span>
                    </>
                  )}
                </div>

                {workflow.metadata?.integrations && (
                  <div className="flex flex-wrap gap-1">
                    {workflow.metadata.integrations.slice(0, 3).map((integration, idx) => (
                      <Badge key={idx} className="bg-cyan-100 text-cyan-700 text-[10px] border-cyan-300">
                        {integration}
                      </Badge>
                    ))}
                    {workflow.metadata.integrations.length > 3 && (
                      <Badge className="bg-gray-100 text-gray-600 text-[10px]">
                        +{workflow.metadata.integrations.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-xs text-gray-500">
                    {workflow.updated_date ? format(new Date(workflow.updated_date), 'MMM d, yyyy') : 'N/A'}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(workflow);
                      }}
                      className="h-7 px-2 text-white hover:bg-white/10"
                    >
                      {workflow.status === 'active' ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(workflow.id);
                      }}
                      className="h-7 px-2 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          onClick={() => setSelectedWorkflow(null)}
        >
          <Card 
            className="bg-gray-900/95 backdrop-blur-xl border-white/10 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-xl mb-2">
                    {selectedWorkflow.name || "Untitled Workflow"}
                  </CardTitle>
                  <Badge className={getStatusColor(selectedWorkflow.status)}>
                    {selectedWorkflow.status || 'draft'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedWorkflow(null)}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <span className="text-xl">×</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Description</h4>
                <p className="text-sm text-gray-300">{selectedWorkflow.description || "No description"}</p>
              </div>

              {/* Steps */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Workflow Steps</h4>
                <div className="space-y-3">
                  {selectedWorkflow.steps?.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 border-2",
                          step.config?.color === "blue" && "bg-blue-100 border-blue-300",
                          step.config?.color === "purple" && "bg-purple-100 border-purple-300",
                          step.config?.color === "emerald" && "bg-emerald-100 border-emerald-300",
                          step.config?.color === "amber" && "bg-amber-100 border-amber-300",
                          step.config?.color === "red" && "bg-red-100 border-red-300",
                          step.config?.color === "cyan" && "bg-cyan-100 border-cyan-300",
                          !step.config?.color && "bg-gray-100 border-gray-300"
                        )}>
                          {step.config?.icon || "⚙️"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-semibold text-white">{step.name}</span>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                              {step.type}
                            </Badge>
                            {step.config?.branch && (
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
                                {step.config.branch}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      </div>
                      {idx < selectedWorkflow.steps.length - 1 && (
                        <div className="ml-5 w-px h-3 bg-white/20" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              {selectedWorkflow.metadata && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Metadata</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedWorkflow.metadata.estimatedTime && (
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3 h-3 text-blue-400" />
                          <div className="text-xs text-gray-400">Estimated Time</div>
                        </div>
                        <div className="text-sm font-semibold text-white">
                          {selectedWorkflow.metadata.estimatedTime}
                        </div>
                      </div>
                    )}
                    {selectedWorkflow.metadata.estimatedCost && (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          <div className="text-xs text-gray-400">Estimated Cost</div>
                        </div>
                        <div className="text-sm font-semibold text-white">
                          {selectedWorkflow.metadata.estimatedCost}
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedWorkflow.metadata.integrations && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-400 mb-2">Integrations</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorkflow.metadata.integrations.map((integration, idx) => (
                          <Badge key={idx} className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                            📊 {integration}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(selectedWorkflow);
                    setSelectedWorkflow(null);
                  }}
                  className={selectedWorkflow.status === 'active' ? 
                    "flex-1 bg-amber-600 hover:bg-amber-700" : 
                    "flex-1 bg-emerald-600 hover:bg-emerald-700"
                  }
                >
                  {selectedWorkflow.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Workflow
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Activate Workflow
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(selectedWorkflow.id);
                    setSelectedWorkflow(null);
                  }}
                  className="bg-white/5 border-white/10 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}