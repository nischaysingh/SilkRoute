import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  FlaskConical, Play, Loader2, CheckCircle, AlertTriangle, Clock, 
  DollarSign, TrendingUp, Plus, X, Sparkles, BarChart3 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function WorkflowTestingModule({ workflow, open, onClose }) {
  const [activeTab, setActiveTab] = useState("auto");
  const [generating, setGenerating] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testData, setTestData] = useState([]);
  const [customScenario, setCustomScenario] = useState({ name: "", description: "", data: "" });
  const [testResults, setTestResults] = useState(null);
  const [testProgress, setTestProgress] = useState(0);

  const handleGenerateTestData = async () => {
    setGenerating(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate realistic test data for this workflow.

WORKFLOW DETAILS:
Name: ${workflow.name}
Steps: ${JSON.stringify(workflow.steps, null, 2)}
Integrations: ${workflow.integrations.join(', ')}

Generate 5 diverse test scenarios that cover:
1. Happy path (normal successful execution)
2. Edge cases (boundary values, empty data)
3. Error scenarios (invalid data, missing fields)
4. Performance stress (large datasets)
5. Integration failures (API timeouts, connection errors)

For each scenario, provide realistic input data that would trigger this workflow.`,
        response_json_schema: {
          type: "object",
          properties: {
            scenarios: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string", enum: ["happy_path", "edge_case", "error", "performance", "integration_failure"] },
                  description: { type: "string" },
                  inputData: { type: "object", additionalProperties: true },
                  expectedOutcome: { type: "string" },
                  expectedDuration: { type: "string" }
                }
              }
            }
          }
        }
      });

      setTestData(response.scenarios);
      toast.success("Test scenarios generated! 🧪");
    } catch (error) {
      console.error('Error generating test data:', error);
      toast.error("Failed to generate test data", {
        description: error.message
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleRunTests = async () => {
    if (testData.length === 0) {
      toast.error("No test scenarios to run");
      return;
    }

    setTesting(true);
    setTestProgress(0);
    setTestResults(null);

    try {
      const results = [];
      
      for (let i = 0; i < testData.length; i++) {
        const scenario = testData[i];
        setTestProgress(((i + 1) / testData.length) * 100);

        // Simulate test execution with AI
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Simulate execution of this workflow with the given test data.

WORKFLOW: ${workflow.name}
STEPS: ${workflow.steps.length}
TEST SCENARIO: ${scenario.name}
INPUT DATA: ${JSON.stringify(scenario.inputData, null, 2)}

Simulate realistic execution and predict:
- Which steps succeed/fail
- Execution time per step
- API calls made
- Cost per operation
- Potential errors or warnings
- Overall result`,
          response_json_schema: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              executionTime: { type: "number" },
              cost: { type: "number" },
              stepsExecuted: { type: "number" },
              stepResults: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    stepId: { type: "number" },
                    status: { type: "string", enum: ["success", "failed", "skipped"] },
                    duration: { type: "number" },
                    output: { type: "string" }
                  }
                }
              },
              errors: {
                type: "array",
                items: { type: "string" }
              },
              warnings: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        });

        results.push({
          scenario: scenario.name,
          type: scenario.type,
          ...result
        });

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Calculate aggregate metrics
      const totalTests = results.length;
      const passedTests = results.filter(r => r.success).length;
      const successRate = (passedTests / totalTests * 100).toFixed(1);
      const avgTime = (results.reduce((sum, r) => sum + r.executionTime, 0) / totalTests).toFixed(0);
      const avgCost = (results.reduce((sum, r) => sum + r.cost, 0) / totalTests).toFixed(4);
      const totalErrors = results.reduce((sum, r) => sum + (r.errors?.length || 0), 0);
      const totalWarnings = results.reduce((sum, r) => sum + (r.warnings?.length || 0), 0);

      setTestResults({
        summary: {
          totalTests,
          passedTests,
          failedTests: totalTests - passedTests,
          successRate,
          avgExecutionTime: avgTime,
          avgCost,
          totalErrors,
          totalWarnings
        },
        results,
        chartData: results.map(r => ({
          name: r.scenario.substring(0, 15) + '...',
          time: r.executionTime,
          cost: r.cost * 1000 // Convert to smaller unit for visibility
        }))
      });

      toast.success("Testing complete! 🎉", {
        description: `${passedTests}/${totalTests} tests passed`
      });
    } catch (error) {
      console.error('Error running tests:', error);
      toast.error("Testing failed", {
        description: error.message
      });
    } finally {
      setTesting(false);
      setTestProgress(0);
    }
  };

  const handleAddCustomScenario = () => {
    if (!customScenario.name || !customScenario.data) {
      toast.error("Name and data are required");
      return;
    }

    try {
      const parsedData = JSON.parse(customScenario.data);
      
      setTestData([...testData, {
        name: customScenario.name,
        type: "custom",
        description: customScenario.description,
        inputData: parsedData,
        expectedOutcome: "User-defined",
        expectedDuration: "Unknown"
      }]);

      setCustomScenario({ name: "", description: "", data: "" });
      toast.success("Custom scenario added");
    } catch (error) {
      toast.error("Invalid JSON data");
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "happy_path": return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "edge_case": return "bg-blue-100 text-blue-700 border-blue-300";
      case "error": return "bg-red-100 text-red-700 border-red-300";
      case "performance": return "bg-purple-100 text-purple-700 border-purple-300";
      case "integration_failure": return "bg-amber-100 text-amber-700 border-amber-300";
      case "custom": return "bg-cyan-100 text-cyan-700 border-cyan-300";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  if (!workflow) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <FlaskConical className="w-5 h-5 text-purple-600" />
            Workflow Testing Module
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-100">
            <TabsTrigger value="auto">Auto-Generated</TabsTrigger>
            <TabsTrigger value="custom">Custom Scenarios</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
          </TabsList>

          {/* Auto-Generated Tests */}
          <TabsContent value="auto" className="space-y-4 mt-4">
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">AI Test Generation</h4>
                    <p className="text-xs text-slate-600">Generate realistic test scenarios automatically</p>
                  </div>
                  <Button
                    onClick={handleGenerateTestData}
                    disabled={generating}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {generating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Generate Tests
                  </Button>
                </div>
              </CardContent>
            </Card>

            {testData.length > 0 && (
              <div className="space-y-3">
                {testData.map((scenario, idx) => (
                  <Card key={idx} className="border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="text-sm font-bold text-slate-900">{scenario.name}</h5>
                            <Badge className={cn("text-xs", getTypeColor(scenario.type))}>
                              {scenario.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600">{scenario.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setTestData(testData.filter((_, i) => i !== idx))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="bg-slate-50 rounded p-2 mt-2">
                        <div className="text-xs text-slate-600 mb-1">Input Data:</div>
                        <pre className="text-xs text-slate-800 overflow-x-auto">
                          {JSON.stringify(scenario.inputData, null, 2)}
                        </pre>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                        <span>Expected: {scenario.expectedOutcome}</span>
                        <span>Duration: {scenario.expectedDuration}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Custom Scenarios */}
          <TabsContent value="custom" className="space-y-4 mt-4">
            <Card className="border-slate-200">
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label className="text-xs text-slate-700 mb-1 block">Scenario Name</Label>
                  <Input
                    value={customScenario.name}
                    onChange={(e) => setCustomScenario({...customScenario, name: e.target.value})}
                    placeholder="e.g., Large order test"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700 mb-1 block">Description</Label>
                  <Input
                    value={customScenario.description}
                    onChange={(e) => setCustomScenario({...customScenario, description: e.target.value})}
                    placeholder="What does this test verify?"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700 mb-1 block">Input Data (JSON)</Label>
                  <Textarea
                    value={customScenario.data}
                    onChange={(e) => setCustomScenario({...customScenario, data: e.target.value})}
                    placeholder='{"order_id": "12345", "amount": 999.99}'
                    className="font-mono text-xs min-h-32"
                  />
                </div>
                <Button onClick={handleAddCustomScenario} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Scenario
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Results */}
          <TabsContent value="results" className="space-y-4 mt-4">
            {!testResults ? (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-blue-400 opacity-50" />
                  <h4 className="text-base font-semibold text-slate-900 mb-2">No Test Results Yet</h4>
                  <p className="text-sm text-slate-600">Run tests to see detailed performance metrics</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-3">
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                      <div className="text-2xl font-bold text-emerald-900">{testResults.summary.successRate}%</div>
                      <div className="text-xs text-emerald-700">Success Rate</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-900">{testResults.summary.avgExecutionTime}ms</div>
                      <div className="text-xs text-blue-700">Avg Time</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <DollarSign className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-900">${testResults.summary.avgCost}</div>
                      <div className="text-xs text-purple-700">Avg Cost</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                      <div className="text-2xl font-bold text-amber-900">{testResults.summary.totalErrors}</div>
                      <div className="text-xs text-amber-700">Errors</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={testResults.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Bar dataKey="time" fill="#3b82f6" name="Time (ms)" />
                        <Bar dataKey="cost" fill="#8b5cf6" name="Cost ($×1000)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Detailed Results */}
                <div className="space-y-2">
                  {testResults.results.map((result, idx) => (
                    <Card key={idx} className={cn(
                      "border-2",
                      result.success ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            )}
                            <h5 className="text-sm font-bold text-slate-900">{result.scenario}</h5>
                            <Badge className={cn("text-xs", getTypeColor(result.type))}>
                              {result.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-slate-600">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {result.executionTime}ms
                            </span>
                            <span className="text-slate-600">
                              <DollarSign className="w-3 h-3 inline mr-1" />
                              ${result.cost.toFixed(4)}
                            </span>
                          </div>
                        </div>

                        {result.errors?.length > 0 && (
                          <div className="bg-red-100 border border-red-200 rounded p-2 mb-2">
                            <div className="text-xs font-bold text-red-900 mb-1">Errors:</div>
                            {result.errors.map((error, eidx) => (
                              <div key={eidx} className="text-xs text-red-800">• {error}</div>
                            ))}
                          </div>
                        )}

                        {result.warnings?.length > 0 && (
                          <div className="bg-amber-100 border border-amber-200 rounded p-2">
                            <div className="text-xs font-bold text-amber-900 mb-1">Warnings:</div>
                            {result.warnings.map((warning, widx) => (
                              <div key={widx} className="text-xs text-amber-800">• {warning}</div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-xs text-slate-600">
            {testData.length} scenario{testData.length !== 1 ? 's' : ''} loaded
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={handleRunTests}
              disabled={testing || testData.length === 0}
              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing... {testProgress.toFixed(0)}%
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>
        </DialogFooter>

        {testing && (
          <div className="mt-4">
            <Progress value={testProgress} className="h-2" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}