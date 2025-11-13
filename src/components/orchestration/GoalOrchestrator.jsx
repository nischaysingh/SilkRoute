import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Target, Sparkles, GitBranch, Check, AlertTriangle, TrendingUp, Loader2, Play, Eye, Plus } from "lucide-react";
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
  const [orchestrating, setOrchestrating] = useState(false);

  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['strategic-goals'],
    queryFn: () => base44.entities.StrategicGoal.list('-created_date', 20)
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData) => base44.entities.StrategicGoal.create(goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-goals'] });
      toast.success("Strategic goal created");
      setCreateDialogOpen(false);
      setNewGoalName("");
      setNewGoalDesc("");
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
        setSelectedGoal({ ...goal, ...response.data.breakdown });
        setDetailDialogOpen(true);
      }
    } catch (error) {
      toast.error("Failed to breakdown goal");
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
          description: response.data.analysis.analysis
        });
        queryClient.invalidateQueries({ queryKey: ['strategic-goals'] });
      }
    } catch (error) {
      toast.error("Failed to monitor goal");
    } finally {
      setOrchestrating(false);
    }
  };

  const handleCreateGoal = () => {
    if (!newGoalName || !newGoalDesc) {
      toast.error("Please fill in all fields");
      return;
    }

    createGoalMutation.mutate({
      name: newGoalName,
      description: newGoalDesc,
      priority: parseInt(newGoalPriority),
      status: "planning",
      target_metrics: {},
      linked_missions: [],
      progress_percentage: 0
    });
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
                  "border-2",
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
                        <div className="flex items-center gap-2">
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
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span>Progress</span>
                        <span className="font-bold text-slate-900">{goal.progress_percentage}%</span>
                      </div>
                      <Progress value={goal.progress_percentage} className="h-2" />
                    </div>

                    {/* Linked Missions */}
                    {goal.linked_missions?.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-slate-600 mb-1">
                          {goal.linked_missions.length} linked missions
                        </div>
                      </div>
                    )}

                    {/* AI Suggestions */}
                    {goal.ai_suggested_missions?.length > 0 && (
                      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="text-xs text-purple-900 font-semibold mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {goal.ai_suggested_missions.length} AI-suggested missions
                        </div>
                      </div>
                    )}

                    {/* Actions */}
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
                          Breakdown
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
                          <TrendingUp className="w-3 h-3 mr-1" />
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
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Create Strategic Goal</DialogTitle>
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
            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Priority</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={newGoalPriority}
                onChange={(e) => setNewGoalPriority(e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateGoal}
              disabled={!newGoalName || !newGoalDesc}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goal Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900">{selectedGoal?.name}</DialogTitle>
            <DialogDescription className="text-slate-600">
              {selectedGoal?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedGoal && (
            <div className="space-y-6 py-4">
              {/* Status Overview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Status</div>
                  <Badge className={cn(
                    selectedGoal.status === "on-track" ? "bg-emerald-100 text-emerald-700" :
                    selectedGoal.status === "at-risk" ? "bg-amber-100 text-amber-700" :
                    "bg-slate-100 text-slate-700"
                  )}>
                    {selectedGoal.status}
                  </Badge>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Progress</div>
                  <div className="text-xl font-bold text-slate-900">
                    {selectedGoal.progress_percentage}%
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Priority</div>
                  <Badge className="bg-purple-100 text-purple-700">
                    P{selectedGoal.priority}
                  </Badge>
                </div>
              </div>

              {/* AI Suggested Missions */}
              {selectedGoal.ai_suggested_missions?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">AI-Suggested Missions</h4>
                  <div className="space-y-2">
                    {selectedGoal.ai_suggested_missions.map((mission, idx) => (
                      <Card key={idx} className="border-2 border-purple-200 bg-purple-50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-bold text-slate-900 mb-1">{mission.name}</h5>
                              <p className="text-xs text-slate-700 mb-2">{mission.intent}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-purple-100 text-purple-700 text-xs">
                                  P{mission.priority}
                                </Badge>
                                <Badge className={cn(
                                  "text-xs",
                                  mission.route_suggestion === "pilot" && "bg-blue-100 text-blue-700",
                                  mission.route_suggestion === "copilot" && "bg-purple-100 text-purple-700",
                                  mission.route_suggestion === "autopilot" && "bg-emerald-100 text-emerald-700"
                                )}>
                                  {mission.route_suggestion}
                                </Badge>
                                <span className="text-xs text-slate-600">~{mission.estimated_duration}</span>
                              </div>
                              {mission.dependencies?.length > 0 && (
                                <div className="text-xs text-slate-600">
                                  Depends on: {mission.dependencies.join(", ")}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Execution Strategy */}
              {selectedGoal.execution_strategy && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="text-xs font-semibold text-blue-900 mb-1">Execution Strategy</div>
                    <p className="text-sm text-slate-700 mb-2">
                      {selectedGoal.execution_strategy} execution
                    </p>
                    <div className="text-xs text-slate-600">
                      Timeline: {selectedGoal.estimated_timeline}
                    </div>
                    {selectedGoal.success_probability && (
                      <div className="mt-2">
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                          {(selectedGoal.success_probability * 100).toFixed(0)}% success probability
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Risk Factors */}
              {selectedGoal.risk_factors?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Risk Factors</h4>
                  <div className="space-y-1">
                    {selectedGoal.risk_factors.map((risk, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 p-2 bg-amber-50 rounded border border-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        {risk}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}