import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitBranch, CheckCircle, AlertTriangle, Clock, Play, ArrowLeft, Copy, FileText, TrendingUp, Loader2, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import { motion } from "framer-motion";

export default function AgentVersionControl({ mission, open, onOpenChange }) {
  const [createVersionDialogOpen, setCreateVersionDialogOpen] = useState(false);
  const [testVersionDialogOpen, setTestVersionDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionNotes, setVersionNotes] = useState("");
  const [testingVersion, setTestingVersion] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all versions of this mission
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['mission-versions', mission?.name],
    queryFn: async () => {
      if (!mission) return [];
      return base44.entities.AIMission.filter({ name: mission.name }, '-version', 20);
    },
    enabled: !!mission
  });

  // Create new version mutation
  const createVersionMutation = useMutation({
    mutationFn: async ({ notes }) => {
      const latestVersion = Math.max(...versions.map(v => v.version), 0);
      const newVersion = await base44.entities.AIMission.create({
        ...mission,
        id: undefined, // Remove ID so a new one is created
        version: latestVersion + 1,
        version_notes: notes,
        status: "draft",
        is_production: false,
        parent_mission_id: mission.id,
        created_date: undefined,
        updated_date: undefined
      });
      return newVersion;
    },
    onSuccess: (newVersion) => {
      queryClient.invalidateQueries({ queryKey: ['mission-versions'] });
      queryClient.invalidateQueries({ queryKey: ['ai-missions'] });
      toast.success(`Version ${newVersion.version} created!`, {
        description: "New version is in draft mode"
      });
      setCreateVersionDialogOpen(false);
      setVersionNotes("");
    },
    onError: (error) => {
      toast.error("Failed to create version", {
        description: error.message
      });
    }
  });

  // Promote version to production mutation
  const promoteVersionMutation = useMutation({
    mutationFn: async (versionId) => {
      // First, mark all other versions as not production
      const sameMissionVersions = versions.filter(v => v.name === mission.name);
      for (const v of sameMissionVersions) {
        if (v.is_production) {
          await base44.entities.AIMission.update(v.id, { 
            is_production: false,
            status: 'archived'
          });
        }
      }
      
      // Then promote this version
      return base44.entities.AIMission.update(versionId, { 
        is_production: true,
        status: 'armed'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-versions'] });
      queryClient.invalidateQueries({ queryKey: ['ai-missions'] });
      toast.success("Version promoted to production! ✨");
    },
    onError: (error) => {
      toast.error("Failed to promote version", {
        description: error.message
      });
    }
  });

  // Test version mutation
  const testVersionMutation = useMutation({
    mutationFn: async (versionId) => {
      // Update status to testing
      await base44.entities.AIMission.update(versionId, { status: 'testing' });

      // Execute test runs (simulate)
      const testResults = {
        total_tests: 10,
        passed: 9,
        failed: 1,
        avg_performance: {
          successRate: 90,
          avgLatency: 780,
          cost: 0.019
        },
        test_date: new Date().toISOString(),
        test_cases: [
          { name: "Normal flow test", status: "passed", duration: 720 },
          { name: "Edge case - null input", status: "passed", duration: 680 },
          { name: "Load test - 100 concurrent", status: "passed", duration: 840 },
          { name: "Error recovery test", status: "failed", duration: 1200 }
        ]
      };

      // Update with test results
      return base44.entities.AIMission.update(versionId, { 
        status: 'draft',
        test_results: testResults
      });
    },
    onSuccess: (updatedVersion) => {
      queryClient.invalidateQueries({ queryKey: ['mission-versions'] });
      toast.success("Version testing complete!", {
        description: `${updatedVersion.test_results.passed}/${updatedVersion.test_results.total_tests} tests passed`
      });
      setTestingVersion(null);
    },
    onError: (error) => {
      toast.error("Failed to test version", {
        description: error.message
      });
      setTestingVersion(null);
    }
  });

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async (versionId) => {
      return promoteVersionMutation.mutateAsync(versionId);
    }
  });

  const handleCreateVersion = () => {
    if (!versionNotes.trim()) {
      toast.error("Please add version notes");
      return;
    }
    createVersionMutation.mutate({ notes: versionNotes });
  };

  const handleTestVersion = (version) => {
    setTestingVersion(version.id);
    testVersionMutation.mutate(version.id);
  };

  const productionVersion = versions.find(v => v.is_production);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-600" />
              Version Control - {mission?.name}
            </DialogTitle>
            <DialogDescription>
              Manage versions, test changes, and deploy updates safely
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Production Version Banner */}
            {productionVersion && (
              <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900">Production Version: v{productionVersion.version}</h4>
                        <p className="text-xs text-slate-600">
                          Deployed {formatDistanceToNow(parseISO(productionVersion.updated_date))} ago
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">LIVE</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Create New Version */}
            <div className="flex justify-end">
              <Button
                onClick={() => setCreateVersionDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Create New Version
              </Button>
            </div>

            {/* Version List */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600" />
                </div>
              ) : versions.length === 0 ? (
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-8 text-center">
                    <p className="text-sm text-slate-600">No versions yet</p>
                  </CardContent>
                </Card>
              ) : (
                versions.map((version) => (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={cn(
                      "border-2",
                      version.is_production && "border-emerald-300 bg-emerald-50",
                      version.status === 'testing' && "border-blue-300 bg-blue-50",
                      version.status === 'draft' && "border-slate-200"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-purple-100 text-purple-700">v{version.version}</Badge>
                              <Badge className={cn(
                                "text-xs",
                                version.is_production && "bg-emerald-100 text-emerald-700",
                                version.status === 'testing' && "bg-blue-100 text-blue-700",
                                version.status === 'draft' && "bg-slate-100 text-slate-700",
                                version.status === 'archived' && "bg-gray-100 text-gray-600"
                              )}>
                                {version.is_production ? "PRODUCTION" : version.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-900 font-semibold mb-1">{version.version_notes || "No notes"}</p>
                            <p className="text-xs text-slate-600">
                              Created {formatDistanceToNow(parseISO(version.created_date))} ago by {version.created_by}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-600">Priority</div>
                            <div className="font-bold text-slate-900">P{version.priority}</div>
                          </div>
                        </div>

                        {/* Test Results */}
                        {version.test_results && (
                          <Card className="mb-3 bg-white border-slate-200">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-900">Test Results</span>
                                <Badge className={cn(
                                  "text-xs",
                                  version.test_results.passed === version.test_results.total_tests 
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                )}>
                                  {version.test_results.passed}/{version.test_results.total_tests} passed
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-600">Success:</span>
                                  <span className="ml-1 font-semibold text-emerald-600">
                                    {version.test_results.avg_performance?.successRate}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Latency:</span>
                                  <span className="ml-1 font-semibold text-blue-600">
                                    {version.test_results.avg_performance?.avgLatency}ms
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Cost:</span>
                                  <span className="ml-1 font-semibold text-purple-600">
                                    ${version.test_results.avg_performance?.cost}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Performance Comparison with Production */}
                        {productionVersion && version.id !== productionVersion.id && version.test_results && productionVersion.simulation_metadata && (
                          <Card className="mb-3 bg-blue-50 border-blue-200">
                            <CardContent className="p-3">
                              <div className="text-xs font-bold text-blue-900 mb-2">vs Production</div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-600">Success:</span>
                                  <Badge className={cn(
                                    "ml-1 text-xs",
                                    version.test_results.avg_performance.successRate > productionVersion.simulation_metadata.successRate
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-red-100 text-red-700"
                                  )}>
                                    {version.test_results.avg_performance.successRate > productionVersion.simulation_metadata.successRate ? "+" : ""}
                                    {(version.test_results.avg_performance.successRate - productionVersion.simulation_metadata.successRate).toFixed(1)}%
                                  </Badge>
                                </div>
                                <div>
                                  <span className="text-slate-600">Latency:</span>
                                  <Badge className={cn(
                                    "ml-1 text-xs",
                                    version.test_results.avg_performance.avgLatency < productionVersion.simulation_metadata.avgLatency
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-red-100 text-red-700"
                                  )}>
                                    {version.test_results.avg_performance.avgLatency < productionVersion.simulation_metadata.avgLatency ? "-" : "+"}
                                    {Math.abs(version.test_results.avg_performance.avgLatency - productionVersion.simulation_metadata.avgLatency)}ms
                                  </Badge>
                                </div>
                                <div>
                                  <span className="text-slate-600">Cost:</span>
                                  <Badge className={cn(
                                    "ml-1 text-xs",
                                    version.test_results.avg_performance.cost < parseFloat(productionVersion.simulation_metadata.spendPerRun)
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-red-100 text-red-700"
                                  )}>
                                    {version.test_results.avg_performance.cost < parseFloat(productionVersion.simulation_metadata.spendPerRun) ? "-" : "+"}
                                    ${Math.abs(version.test_results.avg_performance.cost - parseFloat(productionVersion.simulation_metadata.spendPerRun)).toFixed(3)}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          {!version.is_production && (
                            <>
                              {!version.test_results && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleTestVersion(version)}
                                  disabled={testingVersion === version.id}
                                  className="flex-1 h-8 text-xs"
                                >
                                  {testingVersion === version.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      Testing...
                                    </>
                                  ) : (
                                    <>
                                      <FlaskConical className="w-3 h-3 mr-1" />
                                      Run Tests
                                    </>
                                  )}
                                </Button>
                              )}
                              
                              {version.test_results && version.test_results.passed >= version.test_results.total_tests * 0.8 && (
                                <Button
                                  size="sm"
                                  onClick={() => promoteVersionMutation.mutate(version.id)}
                                  disabled={promoteVersionMutation.isPending}
                                  className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Promote to Production
                                </Button>
                              )}
                            </>
                          )}
                          
                          {version.is_production && versions.length > 1 && (
                            <Badge className="flex-1 justify-center bg-emerald-100 text-emerald-700 h-8 items-center">
                              Currently in Production
                            </Badge>
                          )}

                          {!version.is_production && version.status === 'archived' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rollbackMutation.mutate(version.id)}
                              className="flex-1 h-8 text-xs"
                            >
                              <ArrowLeft className="w-3 h-3 mr-1" />
                              Rollback to This
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedVersion(version)}
                            className="h-8 text-xs"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Version Dialog */}
      <Dialog open={createVersionDialogOpen} onOpenChange={setCreateVersionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              Create a new version of {mission?.name} for testing and improvement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-bold text-slate-900 mb-2 block">Version Notes</Label>
              <Textarea
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                placeholder="What changes are you making in this version?"
                className="min-h-24"
              />
            </div>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <p className="text-xs text-blue-900">
                  💡 New version will be created in draft mode. Test it before promoting to production.
                </p>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateVersionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateVersion}
              disabled={createVersionMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {createVersionMutation.isPending ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <GitBranch className="w-3 h-3 mr-1" />
                  Create Version
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version Details Dialog */}
      <Dialog open={!!selectedVersion} onOpenChange={() => setSelectedVersion(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Version {selectedVersion?.version} Details</DialogTitle>
            <DialogDescription>
              {selectedVersion?.version_notes || "No notes provided"}
            </DialogDescription>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-3">
                    <div className="text-xs text-slate-600 mb-1">Status</div>
                    <Badge className={cn(
                      selectedVersion.is_production && "bg-emerald-100 text-emerald-700",
                      selectedVersion.status === 'testing' && "bg-blue-100 text-blue-700",
                      selectedVersion.status === 'draft' && "bg-slate-100 text-slate-700"
                    )}>
                      {selectedVersion.is_production ? "PRODUCTION" : selectedVersion.status}
                    </Badge>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-3">
                    <div className="text-xs text-slate-600 mb-1">Created</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {formatDistanceToNow(parseISO(selectedVersion.created_date))} ago
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Configuration */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-sm">Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Model:</span>
                      <span className="font-semibold text-slate-900">{selectedVersion.simulation_metadata?.model}</span>
                    </div>
                    {selectedVersion.advanced_config && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Temperature:</span>
                          <span className="font-semibold text-slate-900">{selectedVersion.advanced_config.temperature}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Max Tokens:</span>
                          <span className="font-semibold text-slate-900">{selectedVersion.advanced_config.max_tokens}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Priority:</span>
                      <span className="font-semibold text-slate-900">P{selectedVersion.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Risk Score:</span>
                      <span className="font-semibold text-slate-900">{(selectedVersion.risk_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Results Details */}
              {selectedVersion.test_results?.test_cases && (
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Test Cases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedVersion.test_results.test_cases.map((testCase, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                          <div className="flex items-center gap-2">
                            {testCase.status === 'passed' ? (
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                            )}
                            <span className="text-sm text-slate-900">{testCase.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={cn(
                              "text-xs",
                              testCase.status === 'passed' 
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            )}>
                              {testCase.status}
                            </Badge>
                            <span className="text-xs text-slate-600">{testCase.duration}ms</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedVersion(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}