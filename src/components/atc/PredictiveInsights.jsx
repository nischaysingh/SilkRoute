import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle, TrendingUp, Activity, Target, Zap, 
  GitBranch, Clock, ArrowRight, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function PredictiveInsights({ requests = [], onApplyScenario }) {
  const [predictions, setPredictions] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);

  useEffect(() => {
    // Simulate AI prediction calculation
    const calculatePredictions = () => {
      const queuedRequests = requests.filter(r => r.state === 'queued');
      const highPriorityCount = queuedRequests.filter(r => ['High', 'Critical'].includes(r.priority)).length;
      
      // Calculate breach probability
      const breachProbability = Math.min(95, highPriorityCount * 15 + queuedRequests.length * 5);
      
      // Generate forecast data
      const forecastData = Array.from({ length: 7 }, (_, i) => {
        const baseLoad = queuedRequests.length;
        const predictedLoad = baseLoad + Math.floor(Math.random() * 8) - 2;
        const breachRisk = Math.min(100, predictedLoad * 6 + highPriorityCount * 12);
        
        return {
          time: `+${i * 5}m`,
          current: i === 0 ? baseLoad : null,
          predicted: predictedLoad,
          breachThreshold: 12,
          breachRisk: breachRisk
        };
      });

      // Generate what-if scenarios
      const scenarios = [
        {
          id: 1,
          title: "Reroute to Autopilot",
          description: "Route 6 low-priority requests to autopilot channel",
          impact: {
            breach_risk_reduction: "45%",
            avg_latency_increase: "+80ms",
            cost_savings: "$0.35/hr"
          },
          confidence: 91,
          affected_requests: 6,
          type: "reroute"
        },
        {
          id: 2,
          title: "Enable Aggressive Throttling",
          description: "Throttle webhook source to 150 RPS (from 200 RPS)",
          impact: {
            breach_risk_reduction: "30%",
            queue_stabilization: "3-5 min",
            rejected_requests: "~12/hr"
          },
          confidence: 87,
          affected_requests: 12,
          type: "throttle"
        },
        {
          id: 3,
          title: "Increase Concurrency",
          description: "Temporarily boost concurrency from 12 to 16 workers",
          impact: {
            breach_risk_reduction: "60%",
            processing_speedup: "35%",
            additional_cost: "$0.22/hr"
          },
          confidence: 94,
          affected_requests: queuedRequests.length,
          type: "scale"
        }
      ];

      setPredictions({
        breachProbability,
        forecastData,
        scenarios,
        atRiskRequests: highPriorityCount,
        timeToFirstBreach: breachProbability > 50 ? Math.floor(15 + Math.random() * 10) : null
      });
    };

    calculatePredictions();
  }, [requests.length]);

  if (!predictions) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm rounded-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-blue-600 animate-pulse" />
            <p className="text-xs text-slate-600">Calculating predictions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBreachRiskColor = (probability) => {
    if (probability >= 70) return "text-red-600";
    if (probability >= 40) return "text-amber-600";
    return "text-emerald-600";
  };

  const getBreachRiskBg = (probability) => {
    if (probability >= 70) return "bg-red-50 border-red-300";
    if (probability >= 40) return "bg-amber-50 border-amber-300";
    return "bg-emerald-50 border-emerald-300";
  };

  const getScenarioIcon = (type) => {
    switch (type) {
      case "reroute": return <GitBranch className="w-4 h-4 text-blue-600" />;
      case "throttle": return <Shield className="w-4 h-4 text-amber-600" />;
      case "scale": return <Zap className="w-4 h-4 text-purple-600" />;
      default: return <Target className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm rounded-lg">
      <CardHeader className="border-b border-slate-200 pb-3 px-4 pt-3">
        <CardTitle className="text-slate-900 text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Predictive Insights — Next 30 Minutes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* SLA Breach Forecast */}
        <div className={cn("p-3 rounded-lg border-2", getBreachRiskBg(predictions.breachProbability))}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn("w-5 h-5", predictions.breachProbability >= 70 ? "text-red-600 animate-pulse" : "text-amber-600")} />
              <div>
                <h4 className="text-xs font-semibold text-slate-900">SLA Breach Forecast</h4>
                <p className="text-[10px] text-slate-600">Based on current queue velocity</p>
              </div>
            </div>
            <div className="text-right">
              <div className={cn("text-2xl font-bold", getBreachRiskColor(predictions.breachProbability))}>
                {predictions.breachProbability}%
              </div>
              <p className="text-[9px] text-slate-600">probability</p>
            </div>
          </div>

          {predictions.timeToFirstBreach && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-white rounded border border-slate-200">
              <Clock className="w-3 h-3 text-red-600" />
              <span className="text-[10px] text-slate-700">
                <strong>First breach predicted in ~{predictions.timeToFirstBreach} minutes</strong>
              </span>
            </div>
          )}

          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-white rounded border border-slate-200">
              <div className="text-lg font-bold text-slate-900">{predictions.atRiskRequests}</div>
              <div className="text-[9px] text-slate-600">At-risk requests</div>
            </div>
            <div className="text-center p-2 bg-white rounded border border-slate-200">
              <div className="text-lg font-bold text-slate-900">{requests.filter(r => r.state === 'queued').length}</div>
              <div className="text-[9px] text-slate-600">In queue</div>
            </div>
          </div>
        </div>

        {/* Load Forecast Chart */}
        <div>
          <h4 className="text-xs font-semibold text-slate-900 mb-2">Load Forecast</h4>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={predictions.forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 9, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgb(226, 232, 240)',
                  borderRadius: '8px',
                  fontSize: '10px'
                }}
              />
              <ReferenceLine y={12} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'SLA Threshold', fontSize: 9, fill: '#ef4444' }} />
              <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
              <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* What-If Scenarios */}
        <div>
          <h4 className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            What-If Scenarios
          </h4>
          <div className="space-y-2">
            {predictions.scenarios.map((scenario) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "p-2 rounded-lg border transition-all",
                  selectedScenario?.id === scenario.id ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-start gap-2 flex-1">
                    {getScenarioIcon(scenario.type)}
                    <div className="flex-1">
                      <h5 className="text-[10px] font-semibold text-slate-900">{scenario.title}</h5>
                      <p className="text-[9px] text-slate-600 leading-tight">{scenario.description}</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 text-[9px] py-0 h-4">
                    {scenario.confidence}% AI
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-1 mb-2">
                  {Object.entries(scenario.impact).map(([key, value]) => (
                    <div key={key} className="text-[9px] text-center p-1 bg-slate-50 rounded">
                      <div className="text-slate-600 leading-tight">{key.replace(/_/g, ' ')}</div>
                      <div className="font-semibold text-slate-900">{value}</div>
                    </div>
                  ))}
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedScenario(scenario);
                    onApplyScenario?.(scenario);
                  }}
                  className="w-full h-5 text-[9px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Apply Scenario
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}