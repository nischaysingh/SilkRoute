import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Play, Save, TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { toast } from "sonner";

export default function ScenarioStudio({ missions, onApplyScenario }) {
  const [activeTab, setActiveTab] = useState("simulate");
  const [scenario, setScenario] = useState({
    name: "What if AI spend +20%?",
    spendIncrease: 20,
    concurrencyBoost: 5,
    modelUpgrade: false
  });

  const [simulation, setSimulation] = useState(null);
  const [savedScenarios] = useState([
    {
      name: "Cost-Crunch Mode",
      description: "Minimize spend while maintaining 90% success",
      config: { spendChange: -30, concurrency: -3, profile: "cost-save" },
      impact: { success: -8, cost: -30, latency: +180 }
    },
    {
      name: "Max-Accuracy Mode",
      description: "Prioritize accuracy at any cost",
      config: { spendChange: +45, concurrency: +8, profile: "high-accuracy" },
      impact: { success: +12, cost: +45, latency: -120 }
    },
    {
      name: "Compliance-Heavy Mode",
      description: "Triple-check PII, add audit logs",
      config: { spendChange: +15, concurrency: 0, profile: "compliance" },
      impact: { success: +3, cost: +15, latency: +90 }
    }
  ]);

  const [playbooks] = useState([
    {
      name: "Latency Spike Response",
      trigger: "If avg latency > 1s for 5 min",
      actions: ["Switch to gpt-4o-mini", "Enable caching", "Notify ATC"],
      confidence: 94
    },
    {
      name: "Cost Overrun Protection",
      trigger: "If daily spend > $500",
      actions: ["Pause low-priority missions", "Switch to cost-save profile", "Alert finance"],
      confidence: 89
    }
  ]);

  const runSimulation = () => {
    const baselineRunway = 18; // months
    const baselineBurn = 13650; // monthly
    const baselineSuccess = 94.2; // %
    const baselineLatency = 842; // ms

    const newBurn = baselineBurn * (1 + scenario.spendIncrease / 100);
    const newRunway = (245680 / newBurn).toFixed(1);
    const newSuccess = baselineSuccess + (scenario.spendIncrease / 20) * 2 + (scenario.concurrencyBoost * 0.5);
    const newLatency = baselineLatency - (scenario.spendIncrease * 2) - (scenario.concurrencyBoost * 10);

    const forecastData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      baseline: baselineSuccess + Math.random() * 2,
      scenario: newSuccess + Math.random() * 2
    }));

    setSimulation({
      current: {
        runway: baselineRunway,
        burn: baselineBurn,
        success: baselineSuccess,
        latency: baselineLatency
      },
      projected: {
        runway: parseFloat(newRunway),
        burn: Math.round(newBurn),
        success: newSuccess.toFixed(1),
        latency: Math.round(newLatency)
      },
      forecastData
    });

    toast.success("Simulation complete", {
      description: "Review projected impact below"
    });
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-bold text-slate-900">Scenario Studio</h4>
            <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
              AI-Native Simulation
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-100 mb-4">
            <TabsTrigger value="simulate" className="text-xs">Simulate</TabsTrigger>
            <TabsTrigger value="library" className="text-xs">Library</TabsTrigger>
            <TabsTrigger value="playbooks" className="text-xs">Playbooks</TabsTrigger>
          </TabsList>

          {/* Simulate Tab */}
          <TabsContent value="simulate" className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-slate-900 mb-2 block">
                Scenario Name
              </Label>
              <Input
                value={scenario.name}
                onChange={(e) => setScenario({ ...scenario, name: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-900 mb-2 block">
                AI Spend Change: {scenario.spendIncrease > 0 ? '+' : ''}{scenario.spendIncrease}%
              </Label>
              <Slider
                value={[scenario.spendIncrease]}
                onValueChange={([value]) => setScenario({ ...scenario, spendIncrease: value })}
                min={-50}
                max={50}
                step={5}
                className="mb-2"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-900 mb-2 block">
                Concurrency Boost: {scenario.concurrencyBoost > 0 ? '+' : ''}{scenario.concurrencyBoost}
              </Label>
              <Slider
                value={[scenario.concurrencyBoost]}
                onValueChange={([value]) => setScenario({ ...scenario, concurrencyBoost: value })}
                min={-10}
                max={10}
                step={1}
                className="mb-2"
              />
            </div>

            <Button
              onClick={runSimulation}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Simulation
            </Button>

            {/* Simulation Results */}
            {simulation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Impact Cards */}
                <div className="grid grid-cols-2 gap-2">
                  <Card className="border-slate-200">
                    <CardContent className="p-3">
                      <div className="text-xs text-slate-600 mb-1">Runway</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">
                          {simulation.current.runway}mo
                        </span>
                        <span className="text-xs">→</span>
                        <span className={cn(
                          "text-sm font-bold",
                          simulation.projected.runway < simulation.current.runway ? "text-red-700" : "text-emerald-700"
                        )}>
                          {simulation.projected.runway}mo
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardContent className="p-3">
                      <div className="text-xs text-slate-600 mb-1">Monthly Burn</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">
                          ${(simulation.current.burn / 1000).toFixed(0)}k
                        </span>
                        <span className="text-xs">→</span>
                        <span className={cn(
                          "text-sm font-bold",
                          simulation.projected.burn > simulation.current.burn ? "text-red-700" : "text-emerald-700"
                        )}>
                          ${(simulation.projected.burn / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardContent className="p-3">
                      <div className="text-xs text-slate-600 mb-1">Success Rate</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">
                          {simulation.current.success}%
                        </span>
                        <span className="text-xs">→</span>
                        <span className={cn(
                          "text-sm font-bold",
                          simulation.projected.success > simulation.current.success ? "text-emerald-700" : "text-red-700"
                        )}>
                          {simulation.projected.success}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardContent className="p-3">
                      <div className="text-xs text-slate-600 mb-1">Avg Latency</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">
                          {simulation.current.latency}ms
                        </span>
                        <span className="text-xs">→</span>
                        <span className={cn(
                          "text-sm font-bold",
                          simulation.projected.latency < simulation.current.latency ? "text-emerald-700" : "text-red-700"
                        )}>
                          {simulation.projected.latency}ms
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Forecast Chart */}
                <Card className="border-slate-200">
                  <CardContent className="p-3">
                    <h5 className="text-xs font-semibold text-slate-900 mb-3">12-Month Success Forecast</h5>
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={simulation.forecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis domain={[85, 100]} tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            fontSize: 10,
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="baseline" stroke="#6b7280" strokeWidth={2} name="Current" />
                        <Line type="monotone" dataKey="scenario" stroke="#8b5cf6" strokeWidth={2} name="Scenario" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      onApplyScenario?.(scenario);
                      toast.success("Scenario applied");
                    }}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    Apply Scenario
                  </Button>
                </div>
              </motion.div>
            )}
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-3">
            {savedScenarios.map((saved, idx) => (
              <Card key={idx} className="border-slate-200 hover:border-purple-300 transition-all cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900">{saved.name}</h5>
                      <p className="text-xs text-slate-600">{saved.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="text-center p-2 bg-slate-50 rounded">
                      <div className={cn(
                        "text-xs font-bold",
                        saved.impact.success > 0 ? "text-emerald-700" : "text-red-700"
                      )}>
                        {saved.impact.success > 0 ? '+' : ''}{saved.impact.success}%
                      </div>
                      <div className="text-[10px] text-slate-600">Success</div>
                    </div>
                    <div className="text-center p-2 bg-slate-50 rounded">
                      <div className={cn(
                        "text-xs font-bold",
                        saved.impact.cost < 0 ? "text-emerald-700" : "text-red-700"
                      )}>
                        {saved.impact.cost}%
                      </div>
                      <div className="text-[10px] text-slate-600">Cost</div>
                    </div>
                    <div className="text-center p-2 bg-slate-50 rounded">
                      <div className={cn(
                        "text-xs font-bold",
                        saved.impact.latency < 0 ? "text-emerald-700" : "text-red-700"
                      )}>
                        {saved.impact.latency > 0 ? '+' : ''}{saved.impact.latency}ms
                      </div>
                      <div className="text-[10px] text-slate-600">Latency</div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      onApplyScenario?.(saved);
                      toast.success(`Loaded: ${saved.name}`);
                    }}
                    className="w-full mt-3 h-7 text-xs"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Load Scenario
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Playbooks Tab */}
          <TabsContent value="playbooks" className="space-y-3">
            {playbooks.map((playbook, idx) => (
              <Card key={idx} className="border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="text-sm font-semibold text-slate-900">{playbook.name}</h5>
                    <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
                      {playbook.confidence}% conf
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-xs text-slate-600 mb-1">Trigger:</div>
                    <div className="text-xs text-slate-900 font-mono bg-slate-50 p-2 rounded">
                      {playbook.trigger}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-600 mb-1">Actions:</div>
                    <ul className="space-y-1">
                      {playbook.actions.map((action, i) => (
                        <li key={i} className="text-xs text-slate-900 flex items-start gap-2">
                          <span className="text-purple-600 font-semibold">{i + 1}.</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}