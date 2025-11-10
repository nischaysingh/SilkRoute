import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, TrendingUp, AlertTriangle, Download, Upload, 
  Play, Pause, BarChart3, Sparkles, CheckCircle, XCircle 
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AIAgentTrainingStudio({ agent }) {
  const [trainingStatus, setTrainingStatus] = useState("idle"); // idle, training, completed
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState("production_logs");
  const [epochs, setEpochs] = useState(10);
  const [learningRate, setLearningRate] = useState(0.001);
  const [batchSize, setBatchSize] = useState(32);

  // AI-suggested training data
  const [suggestedDatasets] = useState([
    {
      id: 1,
      name: "Production Logs (Last 30 days)",
      samples: 15420,
      quality: 94,
      relevance: 98,
      bias: "low",
      description: "Real-world production data with high quality labels"
    },
    {
      id: 2,
      name: "Edge Cases Collection",
      samples: 3240,
      quality: 87,
      relevance: 92,
      bias: "medium",
      description: "Curated edge cases and failure scenarios"
    },
    {
      id: 3,
      name: "Synthetic Data (Balanced)",
      samples: 8500,
      quality: 91,
      relevance: 85,
      bias: "low",
      description: "AI-generated balanced training data"
    }
  ]);

  // Performance metrics
  const [performanceMetrics] = useState({
    accuracy: 94.2,
    precision: 92.8,
    recall: 95.1,
    f1Score: 93.9,
    avgLatency: 245,
    throughput: 42
  });

  // Bias detection
  const [biasAnalysis] = useState([
    {
      category: "Timezone Handling",
      severity: "high",
      impact: "Agent shows 15% lower accuracy for non-US timezones",
      suggestion: "Add 2,500 samples from EU/Asia timezone scenarios"
    },
    {
      category: "Language Variations",
      severity: "medium",
      impact: "Informal language reduces accuracy by 8%",
      suggestion: "Include casual language examples in training data"
    },
    {
      category: "Currency Formats",
      severity: "low",
      impact: "Minor issues with non-USD currencies (3% error rate)",
      suggestion: "Expand currency format examples"
    }
  ]);

  // Training history
  const [trainingHistory] = useState([
    { epoch: 1, loss: 0.45, accuracy: 78 },
    { epoch: 2, loss: 0.32, accuracy: 84 },
    { epoch: 3, loss: 0.24, accuracy: 88 },
    { epoch: 4, loss: 0.18, accuracy: 91 },
    { epoch: 5, loss: 0.14, accuracy: 93 },
    { epoch: 6, loss: 0.11, accuracy: 94 },
    { epoch: 7, loss: 0.09, accuracy: 95 },
    { epoch: 8, loss: 0.08, accuracy: 95.5 },
    { epoch: 9, loss: 0.07, accuracy: 96 },
    { epoch: 10, loss: 0.06, accuracy: 96.2 }
  ]);

  const handleStartTraining = () => {
    setTrainingStatus("training");
    setTrainingProgress(0);

    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTrainingStatus("completed");
          toast.success("Training completed successfully!");
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handlePauseTraining = () => {
    setTrainingStatus("idle");
    toast.info("Training paused");
  };

  const handleApplyBiasFix = (bias) => {
    toast.success(`Applying bias fix: ${bias.suggestion}`);
  };

  const getBiasSeverityColor = (severity) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-700 border-red-300";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-300";
      case "low": return "bg-blue-100 text-blue-700 border-blue-300";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">AI Agent Training Studio</h2>
                <p className="text-sm text-slate-600">Intelligent fine-tuning with AI-driven insights</p>
              </div>
            </div>
            <Badge className={cn(
              "text-xs",
              trainingStatus === "training" && "bg-blue-100 text-blue-700",
              trainingStatus === "completed" && "bg-emerald-100 text-emerald-700",
              trainingStatus === "idle" && "bg-slate-100 text-slate-700"
            )}>
              {trainingStatus === "training" ? "Training..." : trainingStatus === "completed" ? "Completed" : "Ready"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="configure" className="w-full">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200">
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="data">Training Data</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
          <TabsTrigger value="bias">Bias Analysis</TabsTrigger>
        </TabsList>

        {/* Configure Tab */}
        <TabsContent value="configure" className="space-y-4">
          {/* Training Parameters */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Training Configuration</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Epochs</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[epochs]}
                      onValueChange={(val) => setEpochs(val[0])}
                      min={1}
                      max={50}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold text-slate-900 w-12 text-right">{epochs}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Learning Rate</Label>
                  <Input
                    type="number"
                    value={learningRate}
                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                    step={0.0001}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-xs">Batch Size</Label>
                  <Select value={batchSize.toString()} onValueChange={(val) => setBatchSize(parseInt(val))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16">16</SelectItem>
                      <SelectItem value="32">32</SelectItem>
                      <SelectItem value="64">64</SelectItem>
                      <SelectItem value="128">128</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="mt-6 p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 mb-1">AI Recommendation</h4>
                    <p className="text-xs text-slate-700 mb-2">
                      Based on your agent's performance, we suggest: <strong>Epochs: 12</strong>, <strong>Learning Rate: 0.0008</strong>
                    </p>
                    <Button
                      size="sm"
                      className="h-6 text-xs bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setEpochs(12);
                        setLearningRate(0.0008);
                        toast.success("Applied AI-recommended settings");
                      }}
                    >
                      Apply Recommendations
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training Progress */}
          {trainingStatus !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white border-slate-200">
                <CardContent className="p-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Training Progress</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-bold text-slate-900">{trainingProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${trainingProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="text-center">
                        <div className="text-slate-600">Current Epoch</div>
                        <div className="font-bold text-slate-900">{Math.floor((trainingProgress / 100) * epochs)}/{epochs}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-600">Estimated Time</div>
                        <div className="font-bold text-slate-900">{Math.floor((100 - trainingProgress) / 10)} min</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-600">Loss</div>
                        <div className="font-bold text-emerald-600">↓ 0.{(100 - trainingProgress).toString().padStart(2, '0')}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {trainingStatus === "idle" || trainingStatus === "completed" ? (
              <Button
                onClick={handleStartTraining}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Training
              </Button>
            ) : (
              <Button
                onClick={handlePauseTraining}
                variant="outline"
                className="flex-1"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause Training
              </Button>
            )}
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export Model
            </Button>
          </div>
        </TabsContent>

        {/* Training Data Tab */}
        <TabsContent value="data" className="space-y-4">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">AI-Suggested Training Datasets</h3>
              <div className="space-y-3">
                {suggestedDatasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all",
                      selectedDataset === dataset.name.toLowerCase().replace(/\s+/g, '_') 
                        ? "border-purple-300 bg-purple-50" 
                        : "border-slate-200 hover:border-purple-200"
                    )}
                    onClick={() => setSelectedDataset(dataset.name.toLowerCase().replace(/\s+/g, '_'))}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-slate-900">{dataset.name}</h4>
                      <Badge className={cn(
                        "text-xs",
                        dataset.bias === "low" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {dataset.bias} bias
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">{dataset.description}</p>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-slate-500">Samples</div>
                        <div className="font-bold text-slate-900">{dataset.samples.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Quality</div>
                        <div className="font-bold text-blue-600">{dataset.quality}%</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Relevance</div>
                        <div className="font-bold text-purple-600">{dataset.relevance}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Custom Data
                </Button>
                <Button variant="outline" className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Synthetic Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(performanceMetrics).map(([key, value]) => (
              <Card key={key} className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-600 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {typeof value === 'number' && value < 100 ? `${value}%` : value}
                  </div>
                  <Badge className="mt-2 bg-emerald-100 text-emerald-700 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.1% vs baseline
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-white border-slate-200">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Training History</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trainingHistory}>
                  <XAxis dataKey="epoch" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bias Analysis Tab */}
        <TabsContent value="bias" className="space-y-4">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Detected Biases & Recommendations</h3>
              <div className="space-y-3">
                {biasAnalysis.map((bias, idx) => (
                  <div
                    key={idx}
                    className={cn("p-4 rounded-lg border-2", getBiasSeverityColor(bias.severity))}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={cn(
                        "w-5 h-5 flex-shrink-0 mt-0.5",
                        bias.severity === "high" && "text-red-600",
                        bias.severity === "medium" && "text-amber-600",
                        bias.severity === "low" && "text-blue-600"
                      )} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-slate-900">{bias.category}</h4>
                          <Badge className={cn(
                            "text-xs capitalize",
                            bias.severity === "high" && "bg-red-100 text-red-700",
                            bias.severity === "medium" && "bg-amber-100 text-amber-700",
                            bias.severity === "low" && "bg-blue-100 text-blue-700"
                          )}>
                            {bias.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-700 mb-2">{bias.impact}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-600 italic">💡 {bias.suggestion}</p>
                          <Button
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleApplyBiasFix(bias)}
                          >
                            Apply Fix
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}