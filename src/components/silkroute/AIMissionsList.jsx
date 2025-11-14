import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Play, Pause, AlertTriangle, CheckCircle, Clock, Target, Loader2, GitBranch, Eye, TrendingUp, Plus, Wrench, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import AgentVersionControl from "./AgentVersionControl";

export default function AIMissionsList() {
  const queryClient = useQueryClient();
  const [expandedMissionId, setExpandedMissionId] = React.useState(null);
  const [executingMissionId, setExecutingMissionId] = React.useState(null);
  const [versionControlMission, setVersionControlMission] = React.useState(null);

  const { data: allMissions = [], isLoading, isError } = useQuery({
    queryKey: ['ai-missions'],
    queryFn: () => base44.entities.AIMission.list('-created_date', 100)
  });

  // Filter to show only production versions or latest version of each agent
  const missions = React.useMemo(() => {
    const missionMap = new Map();
    
    allMissions.forEach(mission => {
      if (mission.is_production) {
        missionMap.set(mission.name, mission);
      } else if (!missionMap.has(mission.name)) {
        missionMap.set(mission.name, mission);
      } else {
        const existing = missionMap.get(mission.name);
        if (mission.version > existing.version && !existing.is_production) {
          missionMap.set(mission.name, mission);
        }
      }
    });
    
    return Array.from(missionMap.values());
  }, [allMissions]);

  const updateMissionStatusMutation = useMutation({
    mutationFn: async ({ missionId, status }) => {
      return base44.entities.AIMission.update(missionId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-missions'] });
      toast.success("AI Mission status updated");
    },
    onError: (error) => {
      toast.error("Failed to update mission status", {
        description: error.message
      });
    }
  });

  const executeMissionMutation = useMutation({
    mutationFn: async ({ missionId, inputData }) => {
      const response = await base44.functions.invoke('executeAIMission', {
        mission_id: missionId,
        input_data: inputData || {}
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-missions'] });
      setExecutingMissionId(null);
      
      if (data.success) {
        toast.success(`Mission executed successfully! ✨`, {
          description: data.expected_outcome
        });
      } else {
        toast.warning(`Mission completed with some failures`, {
          description: `${data.results.filter(r => r.status === 'succeeded').length}/${data.results.length} steps succeeded`
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to execute mission", {
        description: error.message
      });
      setExecutingMissionId(null);
    }
  });

  const handleExecuteMission = (missionId) => {
    setExecutingMissionId(missionId);
    executeMissionMutation.mutate({ missionId, inputData: {} });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'armed': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'paused': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'failed': return 'bg-red-100 text-red-700 border-red-300';
      case 'succeeded': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'draft': return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'testing': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'archived': return 'bg-gray-100 text-gray-600 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getVersionCount = (missionName) => {
    return allMissions.filter(m => m.name === missionName).length;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-2" />
        <p className="text-sm text-slate-600">Loading AI Missions...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-600">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">Error loading AI Missions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          AI Missions / Agents
        </h2>
      </div>

      {missions.length === 0 ? (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
            <h4 className="text-lg font-semibold text-slate-900 mb-2">No AI Missions (Agents) yet</h4>
            <p className="text-sm text-slate-600 mb-4">Create new AI agents using the Agent Builder in Co-Pilot to see them here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {missions.map((mission) => {
            const versionCount = getVersionCount(mission.name);
            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className={cn(
                    "border-2 transition-all cursor-pointer hover:shadow-lg",
                    mission.status === 'running' && 'border-emerald-300 bg-emerald-50',
                    mission.status === 'armed' && 'border-blue-300 bg-blue-50',
                    mission.status === 'paused' && 'border-amber-300 bg-amber-50',
                    mission.status === 'failed' && 'border-red-300 bg-red-50',
                    mission.status === 'succeeded' && 'border-purple-300 bg-purple-50',
                    mission.status === 'draft' && 'border-slate-300 bg-slate-50',
                    mission.status === 'testing' && 'border-blue-300 bg-blue-50',
                    executingMissionId === mission.id && 'animate-pulse'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-slate-900">{mission.name}</h3>
                          {mission.is_production && (
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs">PROD</Badge>
                          )}
                        </div>
                        <Badge className={cn("text-xs", getStatusColor(mission.status))}>
                          {executingMissionId === mission.id ? 'executing...' : mission.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-600">Priority</div>
                        <div className="font-bold text-slate-900">P{mission.priority}</div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 mb-3 line-clamp-2">{mission.intent}</p>

                    {mission.simulation_metadata && (
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3 p-2 bg-slate-100 rounded border border-slate-200">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Success: {mission.simulation_metadata.successRate}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>Latency: {mission.simulation_metadata.avgLatency}ms</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-purple-600" />
                          <span>Route: {mission.simulation_metadata.route}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-amber-600" />
                          <span>Confidence: {((mission.simulation_metadata.confidence || 0) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                      <span>Created: {formatDistanceToNow(parseISO(mission.created_date))} ago</span>
                      <div className="flex items-center gap-1">
                        <span>v{mission.version}</span>
                        {versionCount > 1 && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            {versionCount} versions
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedMissionId(mission.id === expandedMissionId ? null : mission.id)}
                        className="flex-1 h-8 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setVersionControlMission(mission)}
                        className="h-8 text-xs"
                      >
                        <GitBranch className="w-3 h-3 mr-1" />
                        {versionCount > 1 ? versionCount : ""}
                      </Button>
                      {mission.status === 'armed' || mission.status === 'draft' ? (
                        <Button
                          size="sm"
                          onClick={() => handleExecuteMission(mission.id)}
                          disabled={executingMissionId === mission.id}
                          className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                        >
                          {executingMissionId === mission.id ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Executing
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Execute
                            </>
                          )}
                        </Button>
                      ) : mission.status === 'running' ? (
                        <Button
                          size="sm"
                          onClick={() => updateMissionStatusMutation.mutate({ missionId: mission.id, status: 'paused' })}
                          disabled={updateMissionStatusMutation.isPending}
                          className="flex-1 h-8 text-xs bg-amber-600 hover:bg-amber-700"
                        >
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleExecuteMission(mission.id)}
                          disabled={executingMissionId === mission.id}
                          className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700"
                        >
                          {executingMissionId === mission.id ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Running
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Re-run
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedMissionId === mission.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-slate-200 space-y-2"
                        >
                          <p className="text-xs text-slate-600 font-semibold mb-1">AI-Generated Details:</p>
                          <div className="space-y-1 text-xs text-slate-700">
                            {mission.simulation_metadata?.inputs?.length > 0 && (
                              <div><strong>Inputs:</strong> {mission.simulation_metadata.inputs.map(i => i.name || i).join(', ')}</div>
                            )}
                            {mission.simulation_metadata?.triggers?.length > 0 && (
                              <div><strong>Triggers:</strong> {mission.simulation_metadata.triggers.map(t => t.config || t).join(', ')}</div>
                            )}
                            {mission.simulation_metadata?.safeguards?.length > 0 && (
                              <div><strong>Safeguards:</strong> {mission.simulation_metadata.safeguards.map(s => s.name || s).join(', ')}</div>
                            )}
                            {mission.simulation_metadata?.outputs?.length > 0 && (
                              <div><strong>Outputs:</strong> {mission.simulation_metadata.outputs.map(o => o.name || o).join(', ')}</div>
                            )}
                            {mission.simulation_metadata?.model && (
                              <div><strong>Model:</strong> {mission.simulation_metadata.model}</div>
                            )}
                            {mission.advanced_config && (
                              <div><strong>Temperature:</strong> {mission.advanced_config.temperature}, <strong>Max Tokens:</strong> {mission.advanced_config.max_tokens}</div>
                            )}
                            {mission.simulation_metadata?.estimatedImpact && (
                              <div><strong>Impact:</strong> {mission.simulation_metadata.estimatedImpact}</div>
                            )}
                          </div>
                          <Button size="sm" variant="outline" className="w-full text-xs h-7 mt-2">
                            <Wrench className="w-3 h-3 mr-1" /> Edit Blueprint
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Version Control Dialog */}
      <AgentVersionControl
        mission={versionControlMission}
        open={!!versionControlMission}
        onOpenChange={(open) => !open && setVersionControlMission(null)}
      />
    </div>
  );
}