import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Sparkles, GitBranch, Check, AlertTriangle, TrendingUp, Loader2, Play, Eye, Plus, Calendar, DollarSign, Users, Zap, ChevronRight, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { orchestrateGoal } from "@/functions/orchestrateGoal";

export default function GoalOrchestrator() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const [newGoalPriority, setNewGoalPriority] = useState("2");
  const [targetDate, setTargetDate] = useState("");
  const [targetMetrics, setTargetMetrics] = useState("");
  const [orchestrating, setOrchestrating] = useState(false);

  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['strategic-goals'],
    queryFn: () => base44.entities.StrategicGoal.list('-created_date', 20)
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['ai-missions'],
    queryFn: () => base44.entities.AIMission.list()
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData) => base44.entities.StrategicGoal.create(goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-goals'] });
      toast.success("Strategic goal created");
      setCreateDialogOpen(false);
      setNewGoalName("");
      setNewGoalDesc("");
      setTargetDate("");
      setTargetMetrics("");
    }
  });

  const handleBreakdownGoal = async (goal) => {
    setOrchestrating(true);
    try {
      const response = await orchestrateGoal({
        goalId: goal.id,
        action: 'breakdown'
      });

      if (response.data.success) {
        toast.success("Goal broken down into missions! 🎯", {
          description: `${response.data.breakdown.suggested_missions.length} missions suggested`
        });
        queryClient.invalidateQueries({ queryKey: ['strategic-goals'] });
        
        // Update the selected goal with breakdown data
        const updatedGoal = await base44.entities.StrategicGoal.filter({ id: goal.id });
        setSelectedGoal(updatedGoal[0]);
        setDetailDialogOpen(true);
      }
    } catch (error) {
      console.error("Breakdown error:", error);
      toast.error("Failed to breakdown goal", {
        description: error.response?.data?.error || error.message
      });
    } finally {
      setOrchestrating(false);
    }
  };

  const handleMonitorGoal = async (goal) => {
    setOrchestrating(true);
    try {
      const response = await orchestrateGoal({
        goalId: goal.id,
        action: 'monitor'
      });

      if (response.data.success) {
        toast.success("Goal progress analyzed", {
          description: response.data.analysis.analysis?.substring(0, 100) || "Analysis complete"
        });
        queryClient.invalidateQueries({ queryKey: ['strategic-goals'] });
        
        // Refresh goal data
        const updatedGoal = await base44.entities.StrategicGoal.filter({ id: goal.id });
        setSelectedGoal(updatedGoal[0]);
      }
    } catch (error) {
      console.error("Monitor error:", error);
      toast.error("Failed to monitor goal", {
        description: error.response?.data?.error || error.message
      });
    } finally {
      setOrchestrating(false);
    }
  };

  const handleCreateGoal = () => {
    if (!newGoalName || !newGoalDesc) {
      toast.error("Please fill in all required fields");
      return;
    }

    const metrics = targetMetrics ? targetMetrics.split('\n').reduce((obj, line) => {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) obj[key] = value;
      return obj;
    }, {}) : {};

    createGoalMutation.mutate({
      name: newGoalName,
      description: newGoalDesc,
      priority: parseInt(newGoalPriority),
      status: "planning",
      target_metrics: metrics,
      target_date: targetDate || null,
      linked_missions: [],
      progress_percentage: 0
    });
  };

  const handleDeployMissions = async (goal) => {
    if (!goal.ai_suggested_missions || goal.ai_suggested_missions.length === 0) {
      toast.error("No missions to deploy");
      return;
    }

    try {
      toast.loading("Deploying missions...", { id: "deploy-missions" });

      // Create actual missions from suggestions
      const missionIds = [];
      for (const suggestion of goal.ai_suggested_missions) {
        const mission = await base44.entities.AIMission.create({
          name: suggestion.name,
          version: 1,
          intent: suggestion.intent,
          status: "armed",
          priority: suggestion.priority,
          risk_score: 0.2,
          simulation_metadata: {
            route: suggestion.route_suggestion,
            successRate: 92,
            avgLatency: 850,
            tokensPerRun: 450,
            spendPerRun: "0.042",
            confidence: 0.88
          }
        });
        missionIds.push(mission.id);
      }

      // Update goal with linked missions
      await base44.entities.StrategicGoal.update(goal.id, {
        linked_missions: missionIds,
        status: "on-track",
        progress_percentage: 10
      });

      toast.success("Missions deployed! 🚀", {
        id: "deploy-missions",
        description: `${missionIds.length} missions are now active`
      });

      queryClient.invalidateQueries({ queryKey: ['strategic-goals'] });
      queryClient.invalidateQueries({ queryKey: ['ai-missions'] });
      
      setDetailDialogOpen(false);
    } catch (error) {
      console.error("Deploy error:", error);
      toast.error("Failed to deploy missions", {
        id: "deploy-missions",
        description: error.message
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Strategic Goals
        </h3>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-2" />
          <p className="text-sm text-slate-600">Loading goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
            <h4 className="text-lg font-semibold text-slate-900 mb-2">No strategic goals yet</h4>
            <p className="text-sm text-slate-600 mb-4">Create high-level goals and let AI orchestrate missions</p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Target className="w-4 h-4 mr-2" />
              Create First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {goals.map((goal, idx) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={cn(
                  "border-2 hover:shadow-lg transition-all",
                  goal.status === "on-track" ? "border-emerald-300 bg-emerald-50" :
                  goal.status === "at-risk" ? "border-amber-300 bg-amber-50" :
                  goal.status === "achieved" ? "border-blue-300 bg-blue-50" :
                  "border-slate-300 bg-white"
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{goal.name}</h4>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-2">{goal.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={cn(
                            "text-xs",
                            goal.status === "on-track" ? "bg-emerald-100 text-emerald-700" :
                            goal.status === "at-risk" ? "bg-amber-100 text-amber-700" :
                            goal.status === "achieved" ? "bg-blue-100 text-blue-700" :
                            "bg-slate-100 text-slate-700"
                          )}>
                            {goal.status}
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            P{goal.priority}
                          </Badge>
                          {goal.target_date && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(goal.target_date).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span>Progress</span>
                        <span className="font-bold text-slate-900">{goal.progress_percentage || 0}%</span>
                      </div>
                      <Progress value={goal.progress_percentage || 0} className="h-2" />
                    </div>

                    {goal.linked_missions?.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-xs text-blue-900 font-semibold mb-1 flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {goal.linked_missions.length} active missions
                        </div>
                      </div>
                    )}

                    {goal.ai_suggested_missions?.length > 0 && (
                      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="text-xs text-purple-900 font-semibold mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {goal.ai_suggested_missions.length} AI-suggested missions ready
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!goal.ai_suggested_missions && (
                        <Button
                          size="sm"
                          onClick={() => handleBreakdownGoal(goal)}
                          disabled={orchestrating}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 h-8 text-xs"
                        >
                          {orchestrating ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <GitBranch className="w-3 h-3 mr-1" />
                          )}
                          AI Breakdown
                        </Button>
                      )}
                      {goal.linked_missions?.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMonitorGoal(goal)}
                          disabled={orchestrating}
                          className="flex-1 h-8 text-xs"
                        >
                          {orchestrating ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          )}
                          Monitor
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedGoal(goal);
                          setDetailDialogOpen(true);
                        }}
                        className="flex-1 h-8 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Goal Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Create Strategic Goal
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Define a high-level objective for AI orchestration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Goal Name</Label>
              <Input
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                placeholder="e.g., Reduce operational costs by 15%"
                className="bg-white border-slate-200"
              />
            </div>
            
            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Description</Label>
              <Textarea
                value={newGoalDesc}
                onChange={(e) => setNewGoalDesc(e.target.value)}
                placeholder="Detailed description of what you want to achieve..."
                className="bg-white border-slate-200 min-h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-900 text-sm mb-2 block">Priority (1-5)</Label>
                <Select value={newGoalPriority} onValueChange={setNewGoalPriority}>
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="1">P1 - Critical</SelectItem>
                    <SelectItem value="2">P2 - High</SelectItem>
                    <SelectItem value="3">P3 - Medium</SelectItem>
                    <SelectItem value="4">P4 - Low</SelectItem>
                    <SelectItem value="5">P5 - Background</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-900 text-sm mb-2 block">Target Date (Optional)</Label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="bg-white border-slate-200"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Target Metrics (Optional)</Label>
              <Textarea
                value={targetMetrics}
                onChange={(e) => setTargetMetrics(e.target.value)}
                placeholder="cost_reduction: 15%&#10;revenue_increase: 20%&#10;customer_satisfaction: 90%"
                className="bg-white border-slate-200 min-h-20 font-mono text-xs"
              />
              <p className="text-xs text-slate-500 mt-1">One metric per line in format: metric_name: value</p>
            </div>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-purple-900">
                    AI will automatically break down this goal into executable missions and suggest optimal execution strategies
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateGoal}
              disabled={!newGoalName || !newGoalDesc || createGoalMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {createGoalMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Goal Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-slate-900 text-xl">{selectedGoal?.name}</DialogTitle>
                <DialogDescription className="text-slate-600">
                  {selectedGoal?.description}
                </DialogDescription>
              </div>
              <Badge className={cn(
                "text-sm px-3 py-1",
                selectedGoal?.status === "on-track" ? "bg-emerald-100 text-emerald-700" :
                selectedGoal?.status === "at-risk" ? "bg-amber-100 text-amber-700" :
                selectedGoal?.status === "achieved" ? "bg-blue-100 text-blue-700" :
                "bg-slate-100 text-slate-700"
              )}>
                {selectedGoal?.status}
              </Badge>
            </div>
          </DialogHeader>

          {selectedGoal && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="missions">AI Missions</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-4 gap-3">
                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4 text-center">
                      <Target className="w-5 h-5 mx-auto mb-2 text-purple-600" />
                      <div className="text-xs text-slate-600 mb-1">Priority</div>
                      <Badge className="bg-purple-100 text-purple-700">P{selectedGoal.priority}</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4 text-center">
                      <Activity className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                      <div className="text-xs text-slate-600 mb-1">Progress</div>
                      <div className="text-xl font-bold text-slate-900">{selectedGoal.progress_percentage || 0}%</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4 text-center">
                      <Zap className="w-5 h-5 mx-auto mb-2 text-emerald-600" />
                      <div className="text-xs text-slate-600 mb-1">Missions</div>
                      <div className="text-xl font-bold text-slate-900">{selectedGoal.linked_missions?.length || 0}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4 text-center">
                      <Calendar className="w-5 h-5 mx-auto mb-2 text-amber-600" />
                      <div className="text-xs text-slate-600 mb-1">Target Date</div>
                      <div className="text-xs font-bold text-slate-900">
                        {selectedGoal.target_date ? new Date(selectedGoal.target_date).toLocaleDateString() : "Not set"}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {Object.keys(selectedGoal.target_metrics || {}).length > 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-900">Target Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(selectedGoal.target_metrics).map(([key, value]) => (
                          <div key={key} className="p-3 bg-white rounded border border-blue-200">
                            <div className="text-xs text-slate-600 mb-1 capitalize">{key.replace(/_/g, ' ')}</div>
                            <div className="text-base font-bold text-blue-900">{value}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedGoal.risk_assessment && (
                  <Card className="bg-amber-50 border-amber-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {selectedGoal.risk_assessment.risks?.map((risk, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2 bg-white rounded">
                            <Badge className="bg-amber-100 text-amber-700 text-xs">{risk.severity}</Badge>
                            <span className="text-slate-700">{risk.description}</span>
                          </div>
                        ))}
                        {selectedGoal.risk_assessment.overall_risk && (
                          <div className="pt-2 border-t border-amber-200">
                            <div className="text-xs text-amber-900 font-semibold">
                              Overall Risk: {selectedGoal.risk_assessment.overall_risk}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="missions" className="space-y-4 mt-4">
                {selectedGoal.ai_suggested_missions?.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">AI-Generated Mission Plan</h4>
                      {!selectedGoal.linked_missions?.length && (
                        <Button
                          size="sm"
                          onClick={() => handleDeployMissions(selectedGoal)}
                          className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Deploy All Missions
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {selectedGoal.ai_suggested_missions.map((mission, idx) => (
                        <Card key={idx} className="border-2 border-purple-200 bg-purple-50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <h5 className="text-base font-bold text-slate-900 mb-2">{mission.name}</h5>
                                <p className="text-sm text-slate-700 mb-3">{mission.intent}</p>
                                
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                  <Badge className="bg-purple-100 text-purple-700 text-xs">
                                    P{mission.priority} Priority
                                  </Badge>
                                  <Badge className={cn(
                                    "text-xs",
                                    mission.route_suggestion === "pilot" && "bg-blue-100 text-blue-700",
                                    mission.route_suggestion === "copilot" && "bg-purple-100 text-purple-700",
                                    mission.route_suggestion === "autopilot" && "bg-emerald-100 text-emerald-700"
                                  )}>
                                    {mission.route_suggestion}
                                  </Badge>
                                  <Badge className="bg-slate-100 text-slate-700 text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    ~{mission.estimated_duration}
                                  </Badge>
                                </div>

                                {mission.rationale && (
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-slate-700">
                                    <strong className="text-blue-900">Rationale:</strong> {mission.rationale}
                                  </div>
                                )}

                                {mission.dependencies?.length > 0 && (
                                  <div className="mt-2 text-xs text-slate-600">
                                    <strong>Dependencies:</strong> {mission.dependencies.join(", ")}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {selectedGoal.execution_strategy && (
                      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                        <CardContent className="p-4">
                          <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <GitBranch className="w-4 h-4" />
                            AI Execution Strategy
                          </h4>
                          <p className="text-sm text-slate-700 mb-2">{selectedGoal.execution_strategy}</p>
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="text-xs">
                              <span className="text-slate-600">Timeline: </span>
                              <span className="font-semibold text-slate-900">{selectedGoal.estimated_timeline}</span>
                            </div>
                            {selectedGoal.success_probability && (
                              <div className="text-xs">
                                <span className="text-slate-600">Success Prob: </span>
                                <span className="font-semibold text-emerald-700">
                                  {(selectedGoal.success_probability * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-12 text-center">
                      <GitBranch className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <h4 className="text-base font-semibold text-slate-900 mb-2">No mission plan yet</h4>
                      <p className="text-sm text-slate-600 mb-4">
                        Click "AI Breakdown" to let AI analyze this goal and suggest missions
                      </p>
                      <Button
                        onClick={() => {
                          setDetailDialogOpen(false);
                          handleBreakdownGoal(selectedGoal);
                        }}
                        disabled={orchestrating}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <GitBranch className="w-4 h-4 mr-2" />
                        AI Breakdown
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4 mt-4">
                {selectedGoal.risk_assessment ? (
                  <>
                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          Risk Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedGoal.risk_assessment.risks?.map((risk, idx) => (
                          <div key={idx} className="p-3 bg-white rounded-lg border border-amber-200">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="text-sm font-semibold text-slate-900">{risk.description}</h5>
                              <Badge className={cn(
                                "text-xs",
                                risk.severity === "critical" && "bg-red-100 text-red-700",
                                risk.severity === "high" && "bg-amber-100 text-amber-700",
                                risk.severity === "medium" && "bg-blue-100 text-blue-700",
                                risk.severity === "low" && "bg-slate-100 text-slate-700"
                              )}>
                                {risk.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600">
                              <strong>Mitigation:</strong> {risk.mitigation}
                            </p>
                          </div>
                        ))}

                        {selectedGoal.risk_assessment.overall_risk && (
                          <Card className="bg-amber-100 border-amber-300">
                            <CardContent className="p-3">
                              <div className="text-xs font-semibold text-amber-900">
                                Overall Risk Level: {selectedGoal.risk_assessment.overall_risk}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </CardContent>
                    </Card>

                    {selectedGoal.risk_assessment.recommendations?.length > 0 && (
                      <Card className="bg-emerald-50 border-emerald-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedGoal.risk_assessment.recommendations.map((rec, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                <ChevronRight className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-12 text-center">
                      <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <h4 className="text-base font-semibold text-slate-900 mb-2">No analysis available</h4>
                      <p className="text-sm text-slate-600 mb-4">
                        Monitor this goal to get AI-powered progress analysis
                      </p>
                      {selectedGoal.linked_missions?.length > 0 && (
                        <Button
                          onClick={() => {
                            setDetailDialogOpen(false);
                            handleMonitorGoal(selectedGoal);
                          }}
                          disabled={orchestrating}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Run Analysis
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
            {selectedGoal && !selectedGoal.ai_suggested_missions && (
              <Button
                onClick={() => {
                  setDetailDialogOpen(false);
                  handleBreakdownGoal(selectedGoal);
                }}
                disabled={orchestrating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <GitBranch className="w-4 h-4 mr-2" />
                AI Breakdown
              </Button>
            )}
            {selectedGoal?.ai_suggested_missions?.length > 0 && !selectedGoal.linked_missions?.length && (
              <Button
                onClick={() => handleDeployMissions(selectedGoal)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Deploy Missions
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}