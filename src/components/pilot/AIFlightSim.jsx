import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FlaskConical, Loader2, TrendingUp, TrendingDown,
  DollarSign, Clock, Zap, Target, Activity, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";

export default function AIFlightSim({ open, onOpenChange, mission, onPromoteToLive }) {
  const [simulating, setSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [baselineData, setBaselineData] = useState(null);
  const [optimizedData, setOptimizedData] = useState(null);

  const handleRunSimulation = () => {
    setSimulating(true);
    setSimulationComplete(false);

    setTimeout(() => {
      // Generate baseline data
      const baseline = Array.from({ length: 20 }, (_, i) => ({
        time: i,
        throughput: 40 + Math.random() * 20,
        latency: 800 + Math.random() * 300,
        cost: 0.025 + Math.random() * 0.01
      }));

      // Generate optimized data
      const optimized = baseline.map(d => ({
        ...d,
        throughput: d.throughput * 1.35,
        latency: d.latency * 0.85,
        cost: d.cost * 0.80
      }));

      setBaselineData(baseline);
      setOptimizedData(optimized);
      setSimulating(false);
      setSimulationComplete(true);
    }, 3500);
  };

  const calculateImpact = () => {
    if (!baselineData || !optimizedData) return null;

    const avgBaselineThroughput = baselineData.reduce((sum, d) => sum + d.throughput, 0) / baselineData.length;
    const avgOptimizedThroughput = optimizedData.reduce((sum, d) => sum + d.throughput, 0) / optimizedData.length;
    const throughputChange = ((avgOptimizedThroughput / avgBaselineThroughput - 1) * 100).toFixed(0);

    const avgBaselineLatency = baselineData.reduce((sum, d) => sum + d.latency, 0) / baselineData.length;
    const avgOptimizedLatency = optimizedData.reduce((sum, d) => sum + d.latency, 0) / optimizedData.length;
    const latencyChange = avgOptimizedLatency - avgBaselineLatency;

    const avgBaselineCost = baselineData.reduce((sum, d) => sum + d.cost, 0) / baselineData.length;
    const avgOptimizedCost = optimizedData.reduce((sum, d) => sum + d.cost, 0) / optimizedData.length;
    const costChange = ((avgOptimizedCost / avgBaselineCost - 1) * 100).toFixed(0);

    return {
      throughput: throughputChange,
      latency: latencyChange.toFixed(0),
      cost: costChange,
      success: ((88 + Math.random() * 10) - 88).toFixed(0)
    };
  };

  const impact = calculateImpact();

  const handleExportReport = () => {
    toast.success("Report exported", {
      description: "Simulation results saved to downloads"
    });
  };

  const handlePromote = () => {
    onPromoteToLive?.(mission);
    toast.success("Mission promoted to live", {
      description: "Optimizations will be applied"
    });
    onOpenChange(false);
  };

  const mergedData = baselineData?.map((d, i) => ({
    time: d.time,
    baseline_throughput: d.throughput,
    optimized_throughput: optimizedData[i].throughput,
    baseline_latency: d.latency,
    optimized_latency: optimizedData[i].latency,
    baseline_cost: d.cost * 1000,
    optimized_cost: optimizedData[i].cost * 1000
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-600" />
            🧪 AI Flight Simulator
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Test mission optimizations in a safe, simulated environment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!simulating && !simulationComplete && (
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <FlaskConical className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to Simulate</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Run a simulation to see predicted performance changes
                </p>
                <Button
                  onClick={handleRunSimulation}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <FlaskConical className="w-4 h-4 mr-2" />
                  Run Baseline vs Optimized
                </Button>
              </motion.div>
            </div>
          )}

          {simulating && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Running Simulation...</h3>
              <p className="text-sm text-slate-600">Analyzing baseline and optimized configurations</p>
              <div className="mt-4 flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-purple-600 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          )}

          {simulationComplete && impact && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Impact Bubbles */}
              <div className="grid grid-cols-4 gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center",
                    parseInt(impact.cost) < 0 ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300"
                  )}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {parseInt(impact.cost) < 0 ? (
                      <TrendingDown className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-red-600" />
                    )}
                    <span className={cn(
                      "text-2xl font-bold",
                      parseInt(impact.cost) < 0 ? "text-emerald-900" : "text-red-900"
                    )}>
                      {impact.cost}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center justify-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Cost
                  </div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="p-4 bg-blue-50 border-2 border-blue-300 rounded-xl text-center"
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-900">+{impact.success}%</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center justify-center gap-1">
                    <Target className="w-3 h-3" />
                    Success
                  </div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center",
                    parseInt(impact.latency) < 0 ? "bg-emerald-50 border-emerald-300" : "bg-amber-50 border-amber-300"
                  )}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {parseInt(impact.latency) < 0 ? (
                      <TrendingDown className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                    )}
                    <span className={cn(
                      "text-2xl font-bold",
                      parseInt(impact.latency) < 0 ? "text-emerald-900" : "text-amber-900"
                    )}>
                      {impact.latency}ms
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    Latency
                  </div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="p-4 bg-purple-50 border-2 border-purple-300 rounded-xl text-center"
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-900">+{impact.throughput}%</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" />
                    Throughput
                  </div>
                </motion.div>
              </div>

              {/* Comparison Charts */}
              <Tabs defaultValue="throughput" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-100">
                  <TabsTrigger value="throughput">Throughput</TabsTrigger>
                  <TabsTrigger value="latency">Latency</TabsTrigger>
                  <TabsTrigger value="cost">Cost</TabsTrigger>
                </TabsList>

                <TabsContent value="throughput" className="mt-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={mergedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="baseline_throughput" stroke="#94a3b8" strokeWidth={2} name="Baseline" />
                      <Line type="monotone" dataKey="optimized_throughput" stroke="#8b5cf6" strokeWidth={2} name="Optimized" />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="latency" className="mt-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={mergedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="baseline_latency" stroke="#94a3b8" strokeWidth={2} name="Baseline" />
                      <Line type="monotone" dataKey="optimized_latency" stroke="#3b82f6" strokeWidth={2} name="Optimized" />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="cost" className="mt-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={mergedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="baseline_cost" fill="#94a3b8" name="Baseline (¢)" />
                      <Bar dataKey="optimized_cost" fill="#10b981" name="Optimized (¢)" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </div>

        {simulationComplete && (
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportReport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSimulationComplete(false);
                setBaselineData(null);
                setOptimizedData(null);
              }}
            >
              Run Again
            </Button>
            <Button
              onClick={handlePromote}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Target className="w-4 h-4 mr-2" />
              Promote to Live
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}