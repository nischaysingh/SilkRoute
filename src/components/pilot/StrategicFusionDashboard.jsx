import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, DollarSign, Activity, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function StrategicFusionDashboard({ missions, onSetObjective }) {
  const [enterpriseObjective, setEnterpriseObjective] = useState({
    goal: "Reduce Ops Cost by 15%",
    target: 15,
    current: 8.2,
    deadline: "Q1 2025"
  });

  const [missionPortfolio] = useState([
    { mission: "invoice_chase_v1", success: 94, cost: 25, risk: 15, roi: 78 },
    { mission: "batch_pick_opt_v2", success: 88, cost: 32, risk: 25, roi: 56 },
    { mission: "ar_collection_push", success: 0, cost: 22, risk: 10, roi: 0 },
    { mission: "price_rebalance_weekly", success: 96, cost: 19, risk: 8, roi: 89 }
  ]);

  const [agentState] = useState({
    pilot: {
      status: "active",
      missions: 2,
      avgSuccess: 95,
      avgLatency: 820,
      decisions: 127
    },
    copilot: {
      status: "active",
      missions: 1,
      avgSuccess: 88,
      avgLatency: 1240,
      suggestions: 43
    },
    autopilot: {
      status: "learning",
      missions: 1,
      avgSuccess: 96,
      avgLatency: 680,
      rulesLearned: 15
    }
  });

  const getColorForROI = (roi) => {
    if (roi > 80) return "#10b981"; // emerald
    if (roi > 60) return "#3b82f6"; // blue
    if (roi > 40) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-bold text-slate-900">Strategic Fusion Dashboard</h4>
            <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
              Enterprise Command
            </Badge>
          </div>
        </div>

        {/* Enterprise Objective */}
        <Card className="mb-4 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-bold text-purple-900">Enterprise Objective</h5>
              <Badge className="bg-purple-100 text-purple-700 text-xs">
                {enterpriseObjective.deadline}
              </Badge>
            </div>
            
            <p className="text-sm text-slate-900 font-semibold mb-3">{enterpriseObjective.goal}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700">Progress</span>
                <span className="font-semibold text-purple-900">
                  {enterpriseObjective.current}% / {enterpriseObjective.target}%
                </span>
              </div>
              <Progress 
                value={(enterpriseObjective.current / enterpriseObjective.target) * 100} 
                className="h-2"
              />
              <div className="text-xs text-slate-600">
                {((enterpriseObjective.target - enterpriseObjective.current) / enterpriseObjective.target * 100).toFixed(0)}% to goal
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-purple-200">
              <div className="text-xs font-semibold text-purple-900 mb-2">AI Mission Alignment:</div>
              <div className="space-y-1 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>invoice_chase_v1: Cost ↓ 4.8%</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>ar_collection_push: Cost ↓ 8.2%</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-blue-600" />
                  <span>batch_pick_opt_v2: Optimizing...</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global Decision Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Object.entries(agentState).map(([agent, state]) => (
            <Card key={agent} className={cn(
              "border-2",
              agent === "pilot" && "border-blue-300 bg-blue-50",
              agent === "copilot" && "border-purple-300 bg-purple-50",
              agent === "autopilot" && "border-emerald-300 bg-emerald-50"
            )}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-900 capitalize">{agent}</span>
                  <Badge className={cn(
                    "text-[9px] py-0",
                    state.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {state.status}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Missions:</span>
                    <span className="font-semibold text-slate-900">{state.missions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Success:</span>
                    <span className="font-semibold text-emerald-700">{state.avgSuccess}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Latency:</span>
                    <span className="font-semibold text-blue-700">{state.avgLatency}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Portfolio Heat Map */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <h5 className="text-sm font-bold text-slate-900 mb-3">Mission Portfolio (Success vs Cost)</h5>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="cost" 
                  name="Cost/Run (¢)" 
                  tick={{ fontSize: 10 }}
                  label={{ value: "Cost per Run", position: "insideBottom", fontSize: 10, offset: -5 }}
                />
                <YAxis 
                  dataKey="success" 
                  name="Success Rate (%)" 
                  tick={{ fontSize: 10 }}
                  label={{ value: "Success %", angle: -90, position: "insideLeft", fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    fontSize: 10,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px'
                  }}
                  formatter={(value, name, props) => [
                    name === "success" ? `${value}%` : `$${value}`,
                    props.payload.mission
                  ]}
                />
                <Scatter data={missionPortfolio} fill="#8884d8">
                  {missionPortfolio.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorForROI(entry.roi)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>

            <div className="mt-3 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-600" />
                <span className="text-slate-600">High ROI</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-slate-600">Medium ROI</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <span className="text-slate-600">Low ROI</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Objective Input */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-900 mb-2 block">
            Set New Enterprise Objective
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Increase success rate to 97%"
              className="h-9 text-xs"
            />
            <Button
              size="sm"
              onClick={() => {
                onSetObjective?.({ goal: "Increase success rate to 97%" });
              }}
              className="h-9 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Set Goal
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}