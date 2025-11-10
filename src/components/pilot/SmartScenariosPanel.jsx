import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FlaskConical, TrendingUp, TrendingDown, DollarSign, Activity, Target, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { toast } from "sonner";

export default function SmartScenariosPanel({ mission, onApplyScenario }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);

  // AI-generated scenarios
  const scenarios = [
    {
      id: 1,
      name: "Latency Optimization",
      description: "Reduce latency target by 15%",
      changes: [
        "Switch to gpt-4o-mini",
        "Enable aggressive caching",
        "Reduce retry timeout by 100ms"
      ],
      projectedMetrics: {
        success: { current: 94, projected: 96.3, delta: +2.3 },
        latency: { current: 842, projected: 715, delta: -127 },
        cost: { current: 0.025, projected: 0.021, delta: -0.004 },
        risk: "Low"
      },
      chartData: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        current: 840 + Math.random() * 40,
        projected: 710 + Math.random() * 30
      })),
      aiRecommendation: "High confidence - 92% similar scenarios succeeded"
    },
    {
      id: 2,
      name: "Cost Compression",
      description: "Switch model gpt-4o-mini vs 4o",
      changes: [
        "Model: gpt-4o → gpt-4o-mini",
        "Adjust temperature to 0.7",
        "Enable token optimization"
      ],
      projectedMetrics: {
        success: { current: 94, projected: 91.2, delta: -2.8 },
        latency: { current: 842, projected: 780, delta: -62 },
        cost: { current: 0.025, projected: 0.0165, delta: -0.0085 },
        risk: "Medium"
      },
      chartData: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        current: 0.025 + Math.random() * 0.005,
        projected: 0.0165 + Math.random() * 0.003
      })),
      aiRecommendation: "Savings: -34% cost with acceptable accuracy trade-off"
    },
    {
      id: 3,
      name: "Throughput Scaling",
      description: "Boost concurrency from 12 to 16",
      changes: [
        "Concurrency: 12 → 16",
        "Add circuit breaker",
        "Increase queue timeout"
      ],
      projectedMetrics: {
        success: { current: 94, projected: 96.3, delta: +2.3 },
        latency: { current: 842, projected: 820, delta: -22 },
        cost: { current: 0.025, projected: 0.027, delta: +0.002 },
        risk: "Low"
      },
      chartData: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        current: 11 + Math.random() * 2,
        projected: 15 + Math.random() * 2
      })),
      aiRecommendation: "Recommended for peak hours - handles 35% more throughput"
    }
  ];

  const handleRunSimulation = (scenario) => {
    setSelectedScenario(scenario);
  };

  const handleApply = () => {
    onApplyScenario?.(selectedScenario);
    toast.success("Scenario applied", {
      description: `${selectedScenario.name} is now active`
    });
    setSelectedScenario(null);
    setDrawerOpen(false);
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">Smart Scenarios</h4>
              <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
                AI-Generated
              </Badge>
            </div>
            <Button
              size="sm"
              onClick={() => setDrawerOpen(true)}
              className="h-7 text-xs bg-purple-600 hover:bg-purple-700"
            >
              Run Simulation
            </Button>
          </div>

          <div className="space-y-2">
            {scenarios.slice(0, 2).map((scenario, idx) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
                onClick={() => {
                  setDrawerOpen(true);
                  handleRunSimulation(scenario);
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-900">
                    {scenario.name}
                  </span>
                  <Badge className={cn(
                    "text-[9px] py-0",
                    scenario.projectedMetrics.risk === "Low" ? "bg-emerald-100 text-emerald-700" :
                    scenario.projectedMetrics.risk === "Medium" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {scenario.projectedMetrics.risk} Risk
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">{scenario.description}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulation Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-purple-600" />
              Scenario Simulations
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {scenarios.map((scenario) => (
              <Card key={scenario.id} className={cn(
                "border-2 cursor-pointer transition-all",
                selectedScenario?.id === scenario.id 
                  ? "border-purple-500 bg-purple-50" 
                  : "border-slate-200 hover:border-purple-300"
              )}
              onClick={() => handleRunSimulation(scenario)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 mb-1">
                        {scenario.name}
                      </h5>
                      <p className="text-xs text-slate-600">{scenario.description}</p>
                    </div>
                    <Badge className={cn(
                      "text-[9px] py-0",
                      scenario.projectedMetrics.risk === "Low" ? "bg-emerald-100 text-emerald-700" :
                      scenario.projectedMetrics.risk === "Medium" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {scenario.projectedMetrics.risk} Risk
                    </Badge>
                  </div>

                  {/* Changes */}
                  <div className="mb-3 p-2 bg-slate-50 rounded">
                    <div className="text-xs font-semibold text-slate-900 mb-1">Changes:</div>
                    <ul className="space-y-1">
                      {scenario.changes.map((change, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-purple-600" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Projected Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-white rounded border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1">Success</div>
                      <div className="text-sm font-bold text-slate-900">
                        {scenario.projectedMetrics.success.projected}%
                      </div>
                      <div className={cn(
                        "text-[10px] font-semibold flex items-center justify-center gap-0.5",
                        scenario.projectedMetrics.success.delta > 0 ? "text-emerald-700" : "text-red-700"
                      )}>
                        {scenario.projectedMetrics.success.delta > 0 ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
                        {scenario.projectedMetrics.success.delta > 0 ? '+' : ''}{scenario.projectedMetrics.success.delta}%
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1">Latency</div>
                      <div className="text-sm font-bold text-slate-900">
                        {scenario.projectedMetrics.latency.projected}ms
                      </div>
                      <div className={cn(
                        "text-[10px] font-semibold flex items-center justify-center gap-0.5",
                        scenario.projectedMetrics.latency.delta < 0 ? "text-emerald-700" : "text-red-700"
                      )}>
                        {scenario.projectedMetrics.latency.delta < 0 ? <TrendingDown className="w-2 h-2" /> : <TrendingUp className="w-2 h-2" />}
                        {scenario.projectedMetrics.latency.delta}ms
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1">Cost</div>
                      <div className="text-sm font-bold text-slate-900">
                        ${scenario.projectedMetrics.cost.projected.toFixed(3)}
                      </div>
                      <div className={cn(
                        "text-[10px] font-semibold flex items-center justify-center gap-0.5",
                        scenario.projectedMetrics.cost.delta < 0 ? "text-emerald-700" : "text-red-700"
                      )}>
                        {scenario.projectedMetrics.cost.delta < 0 ? <TrendingDown className="w-2 h-2" /> : <TrendingUp className="w-2 h-2" />}
                        {scenario.projectedMetrics.cost.delta > 0 ? '+' : ''}${Math.abs(scenario.projectedMetrics.cost.delta).toFixed(3)}
                      </div>
                    </div>
                  </div>

                  {/* Chart Preview */}
                  {selectedScenario?.id === scenario.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3"
                    >
                      <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={scenario.chartData}>
                          <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip 
                            contentStyle={{ 
                              fontSize: 10,
                              backgroundColor: 'rgba(255,255,255,0.95)',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px'
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Line 
                            type="monotone" 
                            dataKey="current" 
                            stroke="#94a3b8" 
                            strokeWidth={2}
                            name="Current"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="projected" 
                            stroke="#8b5cf6" 
                            strokeWidth={2}
                            name="Projected"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}

                  {/* AI Recommendation */}
                  <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <Target className="w-3 h-3 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-900">AI Recommendation</span>
                    </div>
                    <p className="text-xs text-slate-700">{scenario.aiRecommendation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {selectedScenario && (
              <Button
                onClick={handleApply}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve & Apply {selectedScenario.name}
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}