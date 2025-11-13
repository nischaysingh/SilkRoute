import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Sparkles, Check, Edit, Trash2, Play, Eye, ChevronRight, AlertTriangle, Loader2, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { generateRunbook } from "@/functions/generateRunbook";

export default function RunbookManager({ missionId, incidentId }) {
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRunbook, setSelectedRunbook] = useState(null);
  const [scenario, setScenario] = useState("");
  const [generating, setGenerating] = useState(false);

  const queryClient = useQueryClient();

  const { data: runbooks = [], isLoading } = useQuery({
    queryKey: ['runbooks', missionId, incidentId],
    queryFn: async () => {
      const all = await base44.entities.Runbook.list('-created_date', 50);
      return all.filter(r => 
        (!missionId || r.associated_missions?.includes(missionId)) &&
        (!incidentId || r.associated_incidents?.includes(incidentId))
      );
    }
  });

  const handleGenerate = async () => {
    if (!scenario && !missionId && !incidentId) {
      toast.error("Please provide a scenario or select a mission/incident");
      return;
    }

    setGenerating(true);

    try {
      const response = await generateRunbook({
        missionId,
        incidentId,
        scenario
      });

      if (response.data.success) {
        toast.success("Runbook generated! 🎉", {
          description: response.data.runbook.name
        });
        queryClient.invalidateQueries({ queryKey: ['runbooks'] });
        setGenerateDialogOpen(false);
        setScenario("");
      }
    } catch (error) {
      toast.error("Failed to generate runbook", {
        description: error.message
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleActivate = async (runbook) => {
    try {
      await base44.entities.Runbook.update(runbook.id, { status: 'active' });
      toast.success(`Activated: ${runbook.name}`);
      queryClient.invalidateQueries({ queryKey: ['runbooks'] });
    } catch (error) {
      toast.error("Failed to activate runbook");
    }
  };

  const handleArchive = async (runbook) => {
    try {
      await base44.entities.Runbook.update(runbook.id, { status: 'archived' });
      toast.success(`Archived: ${runbook.name}`);
      queryClient.invalidateQueries({ queryKey: ['runbooks'] });
    } catch (error) {
      toast.error("Failed to archive runbook");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          AI Runbooks
        </h3>
        <Button
          onClick={() => setGenerateDialogOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Runbook
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-sm text-slate-600">Loading runbooks...</p>
        </div>
      ) : runbooks.length === 0 ? (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-400 opacity-50" />
            <h4 className="text-lg font-semibold text-slate-900 mb-2">No runbooks yet</h4>
            <p className="text-sm text-slate-600 mb-4">Generate AI-powered runbooks for common scenarios</p>
            <Button
              onClick={() => setGenerateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create First Runbook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {runbooks.map((runbook, idx) => (
              <motion.div
                key={runbook.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={cn(
                  "border-2 cursor-pointer hover:shadow-lg transition-all",
                  runbook.status === "active" ? "border-emerald-300 bg-emerald-50" :
                  runbook.status === "draft" ? "border-blue-300 bg-blue-50" :
                  "border-slate-300 bg-slate-50 opacity-70"
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-slate-900 mb-1">{runbook.name}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{runbook.description}</p>
                      </div>
                      <Badge className={cn(
                        "text-xs ml-2",
                        runbook.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-300" :
                        runbook.status === "draft" ? "bg-blue-100 text-blue-700 border-blue-300" :
                        "bg-slate-100 text-slate-700 border-slate-300"
                      )}>
                        {runbook.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">AI Confidence</span>
                        <Badge className="bg-purple-100 text-purple-700 text-xs">
                          {((runbook.ai_confidence_score || 0) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Steps</span>
                        <span className="font-semibold text-slate-900">{runbook.steps?.length || 0}</span>
                      </div>
                      {runbook.execution_count > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Success Rate</span>
                          <span className="font-semibold text-emerald-600">
                            {((runbook.success_rate || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRunbook(runbook);
                          setDetailDialogOpen(true);
                        }}
                        className="flex-1 h-8 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {runbook.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => handleActivate(runbook)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-8 text-xs"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Activate
                        </Button>
                      )}
                      {runbook.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleArchive(runbook)}
                          className="flex-1 h-8 text-xs"
                        >
                          Archive
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Generate Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Generate AI Runbook
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              AI will analyze your mission/incident and create a detailed operational runbook
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Scenario Description</Label>
              <Textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Describe the scenario... e.g., 'High latency recovery procedure' or 'Cost optimization for invoice processing'"
                className="bg-white border-slate-200 text-slate-900 min-h-24"
                disabled={generating}
              />
            </div>

            {missionId && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900">✓ Linked to current mission context</p>
              </div>
            )}

            {incidentId && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-900">✓ Linked to current incident context</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setGenerateDialogOpen(false);
                setScenario("");
              }}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generating || (!scenario && !missionId && !incidentId)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Runbook
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Runbook Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {selectedRunbook?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {selectedRunbook?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedRunbook && (
            <div className="space-y-6 py-4">
              {/* Metadata */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Status</div>
                  <Badge className={cn(
                    selectedRunbook.status === "active" ? "bg-emerald-100 text-emerald-700" :
                    selectedRunbook.status === "draft" ? "bg-blue-100 text-blue-700" :
                    "bg-slate-100 text-slate-700"
                  )}>
                    {selectedRunbook.status}
                  </Badge>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">AI Confidence</div>
                  <div className="text-xl font-bold text-purple-600">
                    {((selectedRunbook.ai_confidence_score || 0) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Executions</div>
                  <div className="text-xl font-bold text-slate-900">
                    {selectedRunbook.execution_count || 0}
                  </div>
                </div>
              </div>

              {/* Trigger Conditions */}
              {selectedRunbook.trigger_conditions?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Trigger Conditions</h4>
                  <div className="space-y-1">
                    {selectedRunbook.trigger_conditions.map((condition, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                        <ChevronRight className="w-4 h-4 text-blue-600" />
                        {condition}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">Execution Steps</h4>
                <div className="space-y-3">
                  {selectedRunbook.steps?.map((step, idx) => (
                    <Card key={idx} className="border-2 border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {step.step_number}
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-bold text-slate-900 mb-2">{step.action}</h5>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-slate-600">Expected: </span>
                                <span className="text-emerald-700">{step.expected_outcome}</span>
                              </div>
                              {step.fallback_action && (
                                <div>
                                  <span className="text-slate-600">Fallback: </span>
                                  <span className="text-amber-700">{step.fallback_action}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Mitigation Strategies */}
              {selectedRunbook.mitigation_strategies?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Mitigation Strategies</h4>
                  <div className="space-y-1">
                    {selectedRunbook.mitigation_strategies.map((strategy, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 p-2 bg-emerald-50 rounded border border-emerald-200">
                        <Target className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        {strategy}
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
            {selectedRunbook?.status === "draft" && (
              <Button
                onClick={() => {
                  handleActivate(selectedRunbook);
                  setDetailDialogOpen(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Activate
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}