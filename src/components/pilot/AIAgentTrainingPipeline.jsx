import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  Brain, Upload, Play, Pause, CheckCircle, TrendingUp, Activity,
  Cpu, Zap, Target, Award, Clock, Database, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

export default function AIAgentTrainingPipeline({ onStartTraining, onStopTraining }) {
  const [activeTab, setActiveTab] = useState("configure");
  const [trainingConfig, setTrainingConfig] = useState({
    baseAgent: "pilot",
    trainingData: "",
    epochs: 10,
    learningRate: 0.001,
    batchSize: 32,
    validationSplit: 0.2
  });
  const [trainingJobs, setTrainingJobs] = useState([
    {
      id: 1,
      name: "Pilot Fine-tune v2.5",
      baseAgent: "pilot",
      status: "completed",
      progress: 100,
      startTime: "2024-12-20 9:15 AM",
      duration: "2h 34m",
      metrics: {
        finalAccuracy: 96.8,
        finalLoss: 0.032,
        trainingExamples: 15000,
        validationAccuracy: 95.2
      },
      resourceUsage: {
        cpu: 78,
        memory: 84,
        gpu: 92
      }
    },
    {
      id: 2,
      name: "Co-Pilot Latency Optimizer",
      baseAgent: "copilot",
      status: "running",
      progress: 67,
      startTime: "2024-12-20 2:30 PM",
      currentEpoch: 7,
      totalEpochs: 10,
      metrics: {
        currentAccuracy: 94.3,
        currentLoss: 0.045,
        trainingExamples: 12000,
        validationAccuracy: 93.1
      },
      resourceUsage: {
        cpu: 85,
        memory: 88,
        gpu: 95
      }
    }
  ]);
  const [benchmarkResults, setBenchmarkResults] = useState([
    {
      agent: "Pilot v2.5",
      accuracy: 96.8,
      latency: 842,
      throughput: 245,
      cost: 0.025
    },
    {
      agent: "Pilot v2.4",
      accuracy: 94.2,
      latency: 920,
      throughput: 210,
      cost: 0.028
    },
    {
      agent: "Co-Pilot Optimized",
      accuracy: 95.1,
      latency: 780,
      throughput: 280,
      cost: 0.021
    }
  ]);

  // Training data templates
  const dataTemplates = [
    { 
      name: "Latency Optimization", 
      description: "Historical data of latency patterns and successful optimizations",
      examples: 5000 
    },
    { 
      name: "Cost Reduction", 
      description: "Model selection decisions and cost-accuracy trade-offs",
      examples: 3500 
    },
    { 
      name: "Error Recovery", 
      description: "Failed requests and successful retry strategies",
      examples: 8200 
    }
  ];

  // Mock training progress data
  const generateTrainingData = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      epoch: i + 1,
      trainLoss: 0.5 - (i * 0.04) + Math.random() * 0.02,
      valLoss: 0.52 - (i * 0.038) + Math.random() * 0.025,
      trainAcc: 70 + (i * 2.5) + Math.random() * 2,
      valAcc: 68 + (i * 2.4) + Math.random() * 2
    }));
  };

  const trainingProgress = generateTrainingData();

  const handleStartTraining = () => {
    const newJob = {
      id: trainingJobs.length + 1,
      name: `${trainingConfig.baseAgent} Training Job`,
      baseAgent: trainingConfig.baseAgent,
      status: "running",
      progress: 0,
      startTime: new Date().toLocaleString(),
      currentEpoch: 0,
      totalEpochs: trainingConfig.epochs,
      metrics: {
        currentAccuracy: 0,
        currentLoss: 0,
        trainingExamples: parseInt(trainingConfig.trainingData.split('\n').length) || 1000,
        validationAccuracy: 0
      },
      resourceUsage: {
        cpu: 0,
        memory: 0,
        gpu: 0
      }
    };

    setTrainingJobs(prev => [newJob, ...prev]);
    setActiveTab("monitor");
    
    toast.success("Training job started", {
      description: `${trainingConfig.baseAgent} is now training`
    });

    onStartTraining?.(trainingConfig);

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setTrainingJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { 
              ...job, 
              progress, 
              currentEpoch: Math.floor((progress / 100) * trainingConfig.epochs),
              metrics: {
                ...job.metrics,
                currentAccuracy: 70 + (progress / 100) * 25,
                currentLoss: 0.5 - (progress / 100) * 0.4,
                validationAccuracy: 68 + (progress / 100) * 24
              },
              resourceUsage: {
                cpu: 75 + Math.random() * 10,
                memory: 80 + Math.random() * 10,
                gpu: 90 + Math.random() * 5
              },
              status: progress >= 100 ? "completed" : "running"
            }
          : job
      ));

      if (progress >= 100) {
        clearInterval(interval);
        toast.success("Training completed", {
          description: "Agent is ready for evaluation"
        });
      }
    }, 1000);
  };

  const handleStopTraining = (jobId) => {
    setTrainingJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: "stopped" } : job
    ));
    toast.warning("Training stopped", {
      description: "Job has been terminated"
    });
    onStopTraining?.(jobId);
  };

  const runningJobs = trainingJobs.filter(j => j.status === "running");

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-bold text-slate-900">AI Agent Training Pipeline</h4>
            <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
              Advanced
            </Badge>
          </div>
          {runningJobs.length > 0 && (
            <Badge className="bg-emerald-100 text-emerald-700 text-xs animate-pulse">
              {runningJobs.length} job{runningJobs.length > 1 ? 's' : ''} running
            </Badge>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-100 mb-4">
            <TabsTrigger value="configure" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Configure
            </TabsTrigger>
            <TabsTrigger value="monitor" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="benchmark" className="text-xs">
              <Award className="w-3 h-3 mr-1" />
              Benchmark
            </TabsTrigger>
          </TabsList>

          {/* Configure Tab */}
          <TabsContent value="configure" className="space-y-4">
            {/* Base Agent Selection */}
            <div>
              <Label className="text-xs font-semibold text-slate-900 mb-2 block">
                Base Agent
              </Label>
              <Select 
                value={trainingConfig.baseAgent} 
                onValueChange={(value) => setTrainingConfig({ ...trainingConfig, baseAgent: value })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pilot">✈️ Pilot - Routing & Decision Making</SelectItem>
                  <SelectItem value="copilot">🧩 Co-Pilot - Analysis & Optimization</SelectItem>
                  <SelectItem value="autopilot">⚙️ Autopilot - Autonomous Execution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Training Data */}
            <div>
              <Label className="text-xs font-semibold text-slate-900 mb-2 block">
                Training Data
              </Label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {dataTemplates.map((template) => (
                  <Button
                    key={template.name}
                    size="sm"
                    variant="outline"
                    onClick={() => setTrainingConfig({ 
                      ...trainingConfig, 
                      trainingData: `Template: ${template.name}\n${template.examples} examples`
                    })}
                    className="h-auto py-2 flex flex-col items-start text-left"
                  >
                    <span className="text-xs font-semibold">{template.name}</span>
                    <span className="text-[10px] text-slate-600">{template.examples} examples</span>
                  </Button>
                ))}
              </div>
              <Textarea
                value={trainingConfig.trainingData}
                onChange={(e) => setTrainingConfig({ ...trainingConfig, trainingData: e.target.value })}
                placeholder="Paste training data or select a template..."
                className="h-24 text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                className="mt-2 h-7 text-xs"
              >
                <Upload className="w-3 h-3 mr-1" />
                Upload CSV/JSON
              </Button>
            </div>

            {/* Training Parameters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-900 mb-2 block">
                  Epochs: {trainingConfig.epochs}
                </Label>
                <Slider
                  value={[trainingConfig.epochs]}
                  onValueChange={([value]) => setTrainingConfig({ ...trainingConfig, epochs: value })}
                  min={1}
                  max={50}
                  step={1}
                  className="mb-2"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-900 mb-2 block">
                  Batch Size: {trainingConfig.batchSize}
                </Label>
                <Slider
                  value={[trainingConfig.batchSize]}
                  onValueChange={([value]) => setTrainingConfig({ ...trainingConfig, batchSize: value })}
                  min={8}
                  max={128}
                  step={8}
                  className="mb-2"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-900 mb-2 block">
                  Learning Rate
                </Label>
                <Input
                  type="number"
                  value={trainingConfig.learningRate}
                  onChange={(e) => setTrainingConfig({ ...trainingConfig, learningRate: parseFloat(e.target.value) })}
                  step={0.0001}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-900 mb-2 block">
                  Validation Split
                </Label>
                <Input
                  type="number"
                  value={trainingConfig.validationSplit}
                  onChange={(e) => setTrainingConfig({ ...trainingConfig, validationSplit: parseFloat(e.target.value) })}
                  step={0.05}
                  min={0.1}
                  max={0.5}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <Button
              onClick={handleStartTraining}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Training Job
            </Button>
          </TabsContent>

          {/* Monitor Tab */}
          <TabsContent value="monitor" className="space-y-4">
            {trainingJobs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-xs text-slate-600">No training jobs yet</p>
              </div>
            ) : (
              trainingJobs.map((job) => (
                <Card key={job.id} className={cn(
                  "border-2",
                  job.status === "running" && "border-emerald-300 bg-emerald-50",
                  job.status === "completed" && "border-blue-300 bg-blue-50",
                  job.status === "stopped" && "border-slate-300 bg-slate-50"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-slate-900 mb-1">
                          {job.name}
                        </h5>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Clock className="w-3 h-3" />
                          <span>{job.startTime}</span>
                          {job.duration && <span>• {job.duration}</span>}
                        </div>
                      </div>
                      <Badge className={cn(
                        "text-[9px] py-0",
                        job.status === "running" && "bg-emerald-100 text-emerald-700",
                        job.status === "completed" && "bg-blue-100 text-blue-700",
                        job.status === "stopped" && "bg-slate-100 text-slate-700"
                      )}>
                        {job.status}
                      </Badge>
                    </div>

                    {/* Progress */}
                    {job.status === "running" && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-700">
                            Epoch {job.currentEpoch}/{job.totalEpochs}
                          </span>
                          <span className="text-xs font-semibold text-slate-900">
                            {job.progress}%
                          </span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <div className="p-2 bg-white rounded border border-slate-200 text-center">
                        <div className="text-xs font-bold text-slate-900">
                          {job.metrics.currentAccuracy?.toFixed(1) || job.metrics.finalAccuracy}%
                        </div>
                        <div className="text-[10px] text-slate-600">Accuracy</div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200 text-center">
                        <div className="text-xs font-bold text-slate-900">
                          {job.metrics.currentLoss?.toFixed(3) || job.metrics.finalLoss}
                        </div>
                        <div className="text-[10px] text-slate-600">Loss</div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200 text-center">
                        <div className="text-xs font-bold text-slate-900">
                          {job.metrics.validationAccuracy.toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-slate-600">Val Acc</div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200 text-center">
                        <div className="text-xs font-bold text-slate-900">
                          {job.metrics.trainingExamples.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-600">Examples</div>
                      </div>
                    </div>

                    {/* Resource Usage */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-3 h-3 text-blue-600" />
                          <span className="text-xs text-slate-700">CPU</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-900">
                          {job.resourceUsage.cpu}%
                        </span>
                      </div>
                      <Progress value={job.resourceUsage.cpu} className="h-1" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="w-3 h-3 text-purple-600" />
                          <span className="text-xs text-slate-700">Memory</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-900">
                          {job.resourceUsage.memory}%
                        </span>
                      </div>
                      <Progress value={job.resourceUsage.memory} className="h-1" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-amber-600" />
                          <span className="text-xs text-slate-700">GPU</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-900">
                          {job.resourceUsage.gpu}%
                        </span>
                      </div>
                      <Progress value={job.resourceUsage.gpu} className="h-1" />
                    </div>

                    {/* Actions */}
                    {job.status === "running" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStopTraining(job.id)}
                        className="w-full mt-3 h-7 text-xs"
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        Stop Training
                      </Button>
                    )}

                    {job.status === "completed" && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-7 text-xs"
                        >
                          View Logs
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-7 text-xs bg-purple-600 hover:bg-purple-700"
                        >
                          Deploy Agent
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}

            {/* Training Progress Chart */}
            {runningJobs.length > 0 && (
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <h5 className="text-sm font-bold text-slate-900 mb-3">Training Progress</h5>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={trainingProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="epoch" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ 
                          fontSize: 10,
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px'
                        }}
                      />
                      <Line type="monotone" dataKey="trainLoss" stroke="#3b82f6" strokeWidth={2} name="Train Loss" />
                      <Line type="monotone" dataKey="valLoss" stroke="#8b5cf6" strokeWidth={2} name="Val Loss" />
                      <Line type="monotone" dataKey="trainAcc" stroke="#10b981" strokeWidth={2} name="Train Acc" />
                      <Line type="monotone" dataKey="valAcc" stroke="#f59e0b" strokeWidth={2} name="Val Acc" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Benchmark Tab */}
          <TabsContent value="benchmark" className="space-y-4">
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <h5 className="text-sm font-bold text-slate-900 mb-3">Performance Comparison</h5>
                <div className="space-y-2">
                  {benchmarkResults.map((result, idx) => (
                    <div key={idx} className={cn(
                      "p-3 rounded-lg border-2",
                      idx === 0 ? "border-purple-300 bg-purple-50" : "border-slate-200 bg-white"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {result.agent}
                        </span>
                        {idx === 0 && (
                          <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
                            <Award className="w-2 h-2 mr-1" />
                            Best
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                          <div className="text-xs font-bold text-slate-900">{result.accuracy}%</div>
                          <div className="text-[10px] text-slate-600">Accuracy</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-slate-900">{result.latency}ms</div>
                          <div className="text-[10px] text-slate-600">Latency</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-slate-900">{result.throughput}</div>
                          <div className="text-[10px] text-slate-600">Throughput</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-slate-900">${result.cost}</div>
                          <div className="text-[10px] text-slate-600">Cost/Run</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="w-full"
            >
              <Target className="w-4 h-4 mr-2" />
              Run Benchmark Suite
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}