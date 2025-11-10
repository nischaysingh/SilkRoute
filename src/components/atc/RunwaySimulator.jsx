import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingDown, TrendingUp, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RunwaySimulator({ 
  profiles = [], 
  selectedProfile,
  setSelectedProfile,
  concurrency,
  setConcurrency,
  currentProfile, 
  hourlySpend,
  onApplyProfile,
  onRunSimulation 
}) {
  const [simModel, setSimModel] = useState("gpt-4o-mini");
  const [simConcurrency, setSimConcurrency] = useState([12]);
  const [simToggles, setSimToggles] = useState({
    pii_masking: true,
    vendor_lock: false,
    finops_guard: true,
    compliance_mode: true
  });

  // Calculate delta estimates
  const baselineLatency = 842;
  const baselineCost = hourlySpend || 1.23;

  const modelImpact = {
    "gpt-4o-mini": { costMult: 1.0, latencyMult: 1.0 },
    "gpt-4o": { costMult: 3.5, latencyMult: 0.85 },
    "gpt-4o-1": { costMult: 2.8, latencyMult: 0.9 }
  };

  const impact = modelImpact[simModel] || modelImpact["gpt-4o-mini"];
  const newLatency = baselineLatency * impact.latencyMult;
  const newCost = baselineCost * impact.costMult * (simConcurrency[0] / 12);

  const latencyDelta = newLatency - baselineLatency;
  const costDelta = newCost - baselineCost;

  // Profile comparison data
  const profileComparison = [
    { profile: "Current", cost: 1.23, latency: 842, quality: 85 },
    { profile: "Prod-Bal", cost: 1.35, latency: 820, quality: 88 },
    { profile: "Cost-Save", cost: 0.68, latency: 920, quality: 80 },
    { profile: "High-Acc", cost: 2.85, latency: 750, quality: 95 }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardHeader className="border-b border-slate-200 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Runway & Simulator
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSimModel("gpt-4o-mini");
              setSimConcurrency([12]);
            }}
            className="h-6 text-xs bg-white border-slate-200 hover:bg-slate-50">
            <RefreshCw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Profile Selector */}
        <div>
          <Label className="text-xs text-slate-700 mb-1 block">Active Profile</Label>
          <Select value={selectedProfile} onValueChange={setSelectedProfile}>
            <SelectTrigger className="bg-white border-slate-200 text-slate-900 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              {profiles.map(p => (
                <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Concurrency */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs text-slate-700">Max Concurrency</Label>
            <span className="text-xs font-mono text-slate-900">{concurrency[0]}</span>
          </div>
          <Slider
            value={concurrency}
            onValueChange={setConcurrency}
            min={1}
            max={64}
            step={1}
            className="[&_[role=slider]]:bg-blue-600"
          />
        </div>

        {/* Cost Cap Display */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700">Cost Cap</span>
            <span className="font-mono text-slate-900">
              ${((currentProfile.cost_cap_cents_per_hour || 1500) / 100).toFixed(2)}/hr
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-slate-700">Current Rate</span>
            <span className="font-mono text-emerald-700">${hourlySpend.toFixed(2)}/hr</span>
          </div>
        </div>

        {/* Policy Toggles */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <Label className="text-xs text-slate-700">Policy Toggles</Label>
          {Object.entries(currentProfile.toggles_json || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-sm text-slate-900 capitalize">
                {key.replace(/_/g, ' ')}
              </span>
              <Switch checked={value} disabled />
            </div>
          ))}
        </div>

        <Button
          onClick={onApplyProfile}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
          Apply Profile
        </Button>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-xs font-semibold text-slate-700 mb-3">What-If Simulator</h4>
          
          {/* Input Controls */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-slate-700 mb-1 block">Model</Label>
              <Select value={simModel} onValueChange={setSimModel}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-900 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                  <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                  <SelectItem value="gpt-4o-1">gpt-4o-1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs text-slate-700">Sim. Concurrency</Label>
                <span className="text-xs font-mono text-slate-900">{simConcurrency[0]}</span>
              </div>
              <Slider
                value={simConcurrency}
                onValueChange={setSimConcurrency}
                min={1}
                max={64}
                step={1}
                className="[&_[role=slider]]:bg-purple-600"
              />
            </div>
          </div>

          {/* Impact Display */}
          <div className="p-3 rounded-lg bg-purple-50 border-2 border-purple-200 mt-3">
            <h4 className="text-xs font-semibold text-purple-900 mb-3">Projected Impact</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700">Latency Change:</span>
                <div className="flex items-center gap-1">
                  {latencyDelta > 0 ? (
                    <TrendingUp className="w-3 h-3 text-red-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-emerald-600" />
                  )}
                  <span className={cn(
                    "text-xs font-mono font-semibold",
                    latencyDelta > 0 ? "text-red-700" : "text-emerald-700"
                  )}>
                    {latencyDelta > 0 ? '+' : ''}{latencyDelta.toFixed(0)}ms
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700">Cost Change:</span>
                <div className="flex items-center gap-1">
                  {costDelta > 0 ? (
                    <TrendingUp className="w-3 h-3 text-red-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-emerald-600" />
                  )}
                  <span className={cn(
                    "text-xs font-mono font-semibold",
                    costDelta > 0 ? "text-red-700" : "text-emerald-700"
                  )}>
                    {costDelta > 0 ? '+' : ''}${costDelta.toFixed(2)}/hr
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700">Policy Risk:</span>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                  Low
                </Badge>
              </div>
            </div>
          </div>

          {/* Profile Comparison */}
          <div className="pt-3 border-t border-slate-200 mt-3">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">Profile Comparison</h4>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={profileComparison} layout="horizontal">
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis dataKey="profile" type="category" tick={{ fontSize: 9 }} width={70} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgb(226, 232, 240)',
                    borderRadius: '8px',
                    fontSize: '10px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="cost" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Cost ($/hr)" />
                <Bar dataKey="latency" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Latency (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Button
            onClick={() => onRunSimulation?.({ model: simModel, concurrency: simConcurrency[0], toggles: simToggles })}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
            Run Simulation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}