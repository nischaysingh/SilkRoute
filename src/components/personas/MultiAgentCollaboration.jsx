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
import { Users, Plus, Play, MessageSquare, GitBranch, CheckCircle, Clock, Zap, Brain, TrendingUp, Target, Loader2, AlertCircle, ArrowRight, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function MultiAgentCollaboration() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);
  const [executionProgress, setExecutionProgress] = useState(0);

  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [orchestrationType, setOrchestrationType] = useState("sequential");

  const { data: personas = [] } = useQuery({
    queryKey: ['ai-personas'],
    queryFn: () => base44.entities.AIAgentPersona.list()
  });

  const activePersonas = personas.filter(p => p.status === 'active');

  // Mock collaborations for demo
  const collaborations = [
    {
      id: 1,
      name: "Financial Analysis Pipeline",
      objective: "Comprehensive financial analysis with automated reporting",
      personas: ["Financial Analyst Bot", "Data Insights Wizard", "Executive Briefing Bot"],
      type: "sequential",
      status: "active",
      executions: 47,
      avgDuration: "3.2s",
      successRate: 0.94
    },
    {
      id: 2,
      name: "Customer Success Workflow",
      objective: "End-to-end customer onboarding and support automation",
      personas: ["Customer Success Champion", "Support Ticket Resolver", "Sales Accelerator"],
      type: "parallel",
      status: "active",
      executions: 128,
      avgDuration: "1.8s",
      successRate: 0.97
    },
    {
      id: 3,
      name: "Product Development Cycle",
      objective: "Collaborative product planning, feedback analysis, and roadmap creation",
      personas: ["Product Strategist", "Data Insights Wizard", "Engineering Advisor"],
      type: "hierarchical",
      status: "active",
      executions: 23,
      avgDuration: "5.1s",
      successRate: 0.91
    }
  ];

  const handleCreate = () => {
    if (!name || !objective || selectedPersonas.length < 2) {
      toast.error("Please provide name, objective, and select at least 2 personas");
      return;
    }

    toast.success("Multi-agent collaboration created", {
      description: `${selectedPersonas.length} personas configured`
    });

    setCreateDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setObjective("");
    setSelectedPersonas([]);
    setOrchestrationType("sequential");
  };

  const togglePersona = (personaName) => {
    setSelectedPersonas(prev =>
      prev.includes(personaName)
        ? prev.filter(p => p !== personaName)
        : [...prev, personaName]
    );
  };

  const executeCollaboration = async (collab) => {
    setSelectedCollab(collab);
    setExecutionDialogOpen(true);
    setExecuting(true);
    setExecutionLog([]);
    setExecutionProgress(0);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Simulate a multi-agent collaboration execution for: "${collab.name}"

Objective: ${collab.objective}
Orchestration: ${collab.type}
Personas: ${collab.personas.join(", ")}

Simulate realistic agent interactions. Each agent should:
1. Receive task from previous agent or coordinator
2. Process information based on their specialization
3. Generate output and pass to next agent
4. Contribute unique insights based on their knowledge domains

Return a detailed execution log with agent interactions, insights, and final synthesis.`,
        response_json_schema: {
          type: "object",
          properties: {
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  agent: { type: "string" },
                  action: { type: "string" },
                  insight: { type: "string" },
                  duration_ms: { type: "number" },
                  output: { type: "string" }
                }
              }
            },
            final_result: {
              type: "object",
              properties: {
                summary: { type: "string" },
                key_insights: {
                  type: "array",
                  items: { type: "string" }
                },
                recommendations: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      });

      const steps = response.steps || [];
      
      // Animate execution
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setExecutionLog(prev => [...prev, steps[i]]);
        setExecutionProgress(((i + 1) / steps.length) * 100);
      }

      // Final result
      setExecutionLog(prev => [...prev, {
        agent: "System",
        action: "Synthesis Complete",
        insight: response.final_result.summary,
        output: JSON.stringify(response.final_result, null, 2),
        isFinal: true
      }]);

      toast.success("Collaboration executed successfully", {
        description: "All agents completed their tasks"
      });

      setExecuting(false);
    } catch (error) {
      console.error("Execution error:", error);
      toast.error("Execution failed", {
        description: error.message
      });
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Multi-Agent Collaborations
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Orchestrate multiple AI personas to solve complex problems together
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Collaboration
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Network className="w-5 h-5 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700 text-xs">Active</Badge>
            </div>
            <div className="text-2xl font-bold text-blue-900">{collaborations.length}</div>
            <div className="text-xs text-blue-700">Active Workflows</div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <Badge className="bg-emerald-100 text-emerald-700 text-xs">Total</Badge>
            </div>
            <div className="text-2xl font-bold text-emerald-900">
              {collaborations.reduce((sum, c) => sum + c.executions, 0)}
            </div>
            <div className="text-xs text-emerald-700">Executions</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700 text-xs">Avg</Badge>
            </div>
            <div className="text-2xl font-bold text-purple-900">94%</div>
            <div className="text-xs text-purple-700">Success Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <Badge className="bg-amber-100 text-amber-700 text-xs">Avg</Badge>
            </div>
            <div className="text-2xl font-bold text-amber-900">3.4s</div>
            <div className="text-xs text-amber-700">Duration</div>
          </CardContent>
        </Card>
      </div>

      {/* Collaborations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {collaborations.map((collab, idx) => (
            <motion.div
              key={collab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">{collab.name}</h4>
                      <p className="text-sm text-slate-600">{collab.objective}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">
                      {collab.status}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <Label className="text-xs text-slate-600 mb-2 block">Participating Personas</Label>
                    <div className="flex flex-wrap gap-1">
                      {collab.personas.map((persona, pidx) => (
                        <Badge key={pidx} className="bg-purple-100 text-purple-700 text-xs">
                          {pidx + 1}. {persona}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="p-2 bg-white rounded border border-slate-200 text-center">
                      <div className="text-xs text-slate-600 mb-1">Type</div>
                      <div className="text-xs font-bold text-slate-900 capitalize">{collab.type}</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200 text-center">
                      <div className="text-xs text-slate-600 mb-1">Executions</div>
                      <div className="text-xs font-bold text-slate-900">{collab.executions}</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200 text-center">
                      <div className="text-xs text-slate-600 mb-1">Success</div>
                      <div className="text-xs font-bold text-emerald-700">{(collab.successRate * 100).toFixed(0)}%</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => executeCollaboration(collab)}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-9"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Execute Workflow
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Create Multi-Agent Collaboration
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Configure multiple AI personas to work together on complex tasks
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Workflow Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Customer Onboarding Pipeline"
                className="bg-white border-slate-200"
              />
            </div>

            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Objective</Label>
              <Textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Describe what this collaboration should achieve..."
                className="bg-white border-slate-200 min-h-20"
              />
            </div>

            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Orchestration Type</Label>
              <Select value={orchestrationType} onValueChange={setOrchestrationType}>
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="sequential">Sequential (Chain)</SelectItem>
                  <SelectItem value="parallel">Parallel (Concurrent)</SelectItem>
                  <SelectItem value="hierarchical">Hierarchical (Coordinator)</SelectItem>
                  <SelectItem value="dynamic">Dynamic (AI-driven)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                {orchestrationType === "sequential" && "Agents work one after another in a chain"}
                {orchestrationType === "parallel" && "All agents work simultaneously"}
                {orchestrationType === "hierarchical" && "One agent coordinates others"}
                {orchestrationType === "dynamic" && "AI decides optimal coordination"}
              </p>
            </div>

            <div>
              <Label className="text-slate-900 text-sm mb-2 block">
                Select Personas ({selectedPersonas.length} selected)
              </Label>
              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="space-y-2">
                  {activePersonas.map((persona) => (
                    <div
                      key={persona.id}
                      onClick={() => togglePersona(persona.name)}
                      className={cn(
                        "p-3 rounded-lg border-2 cursor-pointer transition-all",
                        selectedPersonas.includes(persona.name)
                          ? "border-purple-500 bg-purple-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedPersonas.includes(persona.name) && (
                            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                              {selectedPersonas.indexOf(persona.name) + 1}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{persona.name}</div>
                            <div className="text-xs text-slate-600">
                              {persona.knowledge_domains?.slice(0, 2).join(", ")}
                            </div>
                          </div>
                        </div>
                        {selectedPersonas.includes(persona.name) && (
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {selectedPersonas.length >= 2 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="text-xs font-semibold text-blue-900 mb-2">Execution Flow</div>
                  <div className="flex items-center gap-2 text-sm">
                    {selectedPersonas.map((persona, idx) => (
                      <React.Fragment key={idx}>
                        <Badge className="bg-purple-100 text-purple-700 text-xs">
                          {persona}
                        </Badge>
                        {idx < selectedPersonas.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name || !objective || selectedPersonas.length < 2}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Collaboration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execution Dialog */}
      <Dialog open={executionDialogOpen} onOpenChange={setExecutionDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              {selectedCollab?.name} - Execution
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Real-time multi-agent collaboration execution
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {executing && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Processing...</div>
                      <div className="text-xs text-slate-600">{executionProgress.toFixed(0)}% complete</div>
                    </div>
                  </div>
                  <Progress value={executionProgress} className="h-2" />
                </CardContent>
              </Card>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {executionLog.map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className={cn(
                      "border-2",
                      log.isFinal
                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300"
                        : "bg-white border-blue-200"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {log.isFinal ? (
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Brain className="w-5 h-5 text-blue-600" />
                            )}
                            <div>
                              <div className="text-sm font-bold text-slate-900">{log.agent}</div>
                              <div className="text-xs text-slate-600">{log.action}</div>
                            </div>
                          </div>
                          {log.duration_ms && (
                            <Badge className="bg-slate-100 text-slate-700 text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {log.duration_ms}ms
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{log.insight}</p>
                        {log.output && !log.isFinal && (
                          <div className="p-2 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
                            {log.output}
                          </div>
                        )}
                        {log.isFinal && (
                          <div className="mt-3 p-3 bg-white rounded border border-emerald-300">
                            <pre className="text-xs text-slate-700 whitespace-pre-wrap">
                              {log.output}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {executionLog.length === 0 && !executing && (
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-sm text-slate-600">No execution log yet</p>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setExecutionDialogOpen(false);
                setExecutionLog([]);
                setExecutionProgress(0);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}