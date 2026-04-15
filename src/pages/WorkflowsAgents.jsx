import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Plus, Search, Play, Pause, Trash2, Edit, Zap, Bot,
  GitBranch, Clock, Activity, CheckCircle, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import WorkflowBuilderModal from "@/components/workflows/WorkflowBuilderModal";
import WorkflowRunPanel from "@/components/workflows/WorkflowRunPanel";
import AgentBuilderModal from "@/components/agents/AgentBuilderModal";
import AgentRunPanel from "@/components/agents/AgentRunPanel";

// ─── Helpers ────────────────────────────────────────────────────────────────

const workflowStatusColor = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  paused: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const agentStatusColor = {
  armed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  running: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  paused: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  succeeded: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  testing: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  archived: "bg-gray-700/30 text-gray-500 border-gray-500/20",
};

const riskBg = (score) => {
  if (!score || score < 0.3) return "bg-emerald-500/20 text-emerald-400";
  if (score < 0.6) return "bg-amber-500/20 text-amber-400";
  return "bg-red-500/20 text-red-400";
};

// ─── Workflow Card ───────────────────────────────────────────────────────────

function WorkflowCard({ workflow, onEdit, onRun, onDelete, onToggle }) {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl hover:bg-white/8 transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-white text-sm truncate mb-1.5">{workflow.name || "Untitled"}</CardTitle>
            <Badge className={workflowStatusColor[workflow.status] || workflowStatusColor.draft}>
              {workflow.status || "draft"}
            </Badge>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
            <GitBranch className="w-4 h-4 text-purple-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-gray-400 line-clamp-2 min-h-[32px]">
          {workflow.description || "No description"}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{workflow.steps?.length || 0} steps</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
            {workflow.updated_date ? format(new Date(workflow.updated_date), "MMM d") : "—"}
          </span>
        </div>
        <div className="flex gap-1.5 pt-2 border-t border-white/10">
          <Button
            size="sm"
            onClick={() => onRun(workflow)}
            className="flex-1 bg-purple-600/80 hover:bg-purple-600 text-white h-7 text-xs"
          >
            <Play className="w-3 h-3 mr-1" /> Run
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(workflow)} className="h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10">
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onToggle(workflow)} className="h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10">
            {workflow.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(workflow.id)} className="h-7 px-2 text-red-400 hover:bg-red-500/10">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Agent Card ──────────────────────────────────────────────────────────────

function AgentCard({ agent, onEdit, onRun, onDelete }) {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl hover:bg-white/8 transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-white text-sm truncate mb-1.5">{agent.name}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={agentStatusColor[agent.status] || agentStatusColor.draft}>
                {agent.status || "draft"}
              </Badge>
              <Badge className={cn("text-[10px]", riskBg(agent.risk_score))}>
                risk {agent.risk_score ?? "—"}
              </Badge>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-gray-400 line-clamp-2 min-h-[32px]">{agent.intent}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Priority {agent.priority}</span>
          <span>v{agent.version}</span>
          {agent.simulation_metadata?.lastRun && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(agent.simulation_metadata.lastRun), "MMM d")}
            </span>
          )}
        </div>
        <div className="flex gap-1.5 pt-2 border-t border-white/10">
          <Button
            size="sm"
            onClick={() => onRun(agent)}
            className="flex-1 bg-blue-600/80 hover:bg-blue-600 text-white h-7 text-xs"
          >
            <Play className="w-3 h-3 mr-1" /> Run
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(agent)} className="h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10">
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(agent.id)} className="h-7 px-2 text-red-400 hover:bg-red-500/10">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function WorkflowsAgents() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("workflows");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Workflow modals
  const [wfBuilderOpen, setWfBuilderOpen] = useState(false);
  const [wfEditTarget, setWfEditTarget] = useState(null);
  const [wfRunTarget, setWfRunTarget] = useState(null);

  // Agent modals
  const [agentBuilderOpen, setAgentBuilderOpen] = useState(false);
  const [agentEditTarget, setAgentEditTarget] = useState(null);
  const [agentRunTarget, setAgentRunTarget] = useState(null);

  // Data
  const { data: workflows = [], isLoading: wfLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => base44.entities.Workflow.list("-updated_date"),
  });

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ["ai-missions"],
    queryFn: () => base44.entities.AIMission.list("-updated_date"),
  });

  // Mutations
  const updateWf = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Workflow.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["workflows"] }); toast.success("Workflow updated"); },
  });

  const deleteWf = useMutation({
    mutationFn: (id) => base44.entities.Workflow.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["workflows"] }); toast.success("Workflow deleted"); },
  });

  const deleteAgent = useMutation({
    mutationFn: (id) => base44.entities.AIMission.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["ai-missions"] }); toast.success("Agent deleted"); },
  });

  // Filtered lists
  const filteredWf = workflows.filter((w) => {
    const q = search.toLowerCase();
    const matchSearch = !q || w.name?.toLowerCase().includes(q) || w.description?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredAgents = agents.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name?.toLowerCase().includes(q) || a.intent?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleToggleWf = (wf) => {
    const next = wf.status === "active" ? "paused" : "active";
    updateWf.mutate({ id: wf.id, data: { status: next } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Workflows & Agents
          </h2>
          <p className="text-gray-400 mt-1">Build, deploy and run automated workflows and AI agents</p>
        </div>
        <div className="flex gap-2">
          {tab === "workflows" ? (
            <Button
              onClick={() => { setWfEditTarget(null); setWfBuilderOpen(true); }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" /> New Workflow
            </Button>
          ) : (
            <Button
              onClick={() => { setAgentEditTarget(null); setAgentBuilderOpen(true); }}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Plus className="w-4 h-4 mr-2" /> New Agent
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Workflows", value: workflows.length, color: "text-white" },
          { label: "Active Workflows", value: workflows.filter(w => w.status === "active").length, color: "text-emerald-400" },
          { label: "Total Agents", value: agents.length, color: "text-blue-400" },
          { label: "Armed Agents", value: agents.filter(a => a.status === "armed").length, color: "text-purple-400" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-white/5 backdrop-blur-xl border-white/10 rounded-xl">
            <CardContent className="p-4">
              <div className="text-xs text-gray-400 mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs + Filters */}
      <Tabs value={tab} onValueChange={(v) => { setTab(v); setStatusFilter("all"); setSearch(""); }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1">
            <TabsTrigger value="workflows" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-gray-400 rounded-lg gap-2">
              <GitBranch className="w-4 h-4" /> Workflows ({workflows.length})
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-gray-400 rounded-lg gap-2">
              <Bot className="w-4 h-4" /> AI Agents ({agents.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            {tab === "workflows" ? (
              <div className="flex gap-1">
                {["all", "active", "paused", "draft"].map((s) => (
                  <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"}
                    onClick={() => setStatusFilter(s)}
                    className={statusFilter === s ? "bg-blue-600 hover:bg-blue-700 h-8 text-xs" : "bg-white/5 border-white/10 text-white hover:bg-white/10 h-8 text-xs"}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex gap-1">
                {["all", "armed", "draft", "testing"].map((s) => (
                  <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"}
                    onClick={() => setStatusFilter(s)}
                    className={statusFilter === s ? "bg-blue-600 hover:bg-blue-700 h-8 text-xs" : "bg-white/5 border-white/10 text-white hover:bg-white/10 h-8 text-xs"}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Workflows Tab ── */}
        <TabsContent value="workflows" className="mt-6">
          {wfLoading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>
          ) : filteredWf.length === 0 ? (
            <Card className="bg-white/5 border-white/10 rounded-xl">
              <CardContent className="p-12 text-center">
                <GitBranch className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No workflows found</p>
                <Button onClick={() => { setWfEditTarget(null); setWfBuilderOpen(true); }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" /> Create Workflow
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWf.map((wf) => (
                <WorkflowCard
                  key={wf.id}
                  workflow={wf}
                  onEdit={(w) => { setWfEditTarget(w); setWfBuilderOpen(true); }}
                  onRun={(w) => setWfRunTarget(w)}
                  onDelete={(id) => { if (confirm("Delete this workflow?")) deleteWf.mutate(id); }}
                  onToggle={handleToggleWf}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Agents Tab ── */}
        <TabsContent value="agents" className="mt-6">
          {agentsLoading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>
          ) : filteredAgents.length === 0 ? (
            <Card className="bg-white/5 border-white/10 rounded-xl">
              <CardContent className="p-12 text-center">
                <Bot className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No AI agents found</p>
                <Button onClick={() => { setAgentEditTarget(null); setAgentBuilderOpen(true); }}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <Plus className="w-4 h-4 mr-2" /> Create Agent
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onEdit={(a) => { setAgentEditTarget(a); setAgentBuilderOpen(true); }}
                  onRun={(a) => setAgentRunTarget(a)}
                  onDelete={(id) => { if (confirm("Delete this agent?")) deleteAgent.mutate(id); }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <WorkflowBuilderModal
        open={wfBuilderOpen}
        onClose={() => { setWfBuilderOpen(false); setWfEditTarget(null); }}
        workflow={wfEditTarget}
      />
      <WorkflowRunPanel
        open={!!wfRunTarget}
        onClose={() => setWfRunTarget(null)}
        workflow={wfRunTarget}
      />
      <AgentBuilderModal
        open={agentBuilderOpen}
        onClose={() => { setAgentBuilderOpen(false); setAgentEditTarget(null); }}
        agent={agentEditTarget}
      />
      <AgentRunPanel
        open={!!agentRunTarget}
        onClose={() => setAgentRunTarget(null)}
        agent={agentRunTarget}
      />
    </div>
  );
}