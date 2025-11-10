import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Brain, Zap, Shield, DollarSign, Activity } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

const ModelUtilizationGauge = ({ models = [] }) => {
  const modelColors = {
    "gpt-4o-mini": "#3b82f6",
    "gpt-4o": "#8b5cf6",
    "gpt-4o-1": "#ec4899"
  };

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        {models.map((model, idx) => {
          const radius = 40 - idx * 12;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (model.usage / 100) * circumference;
          
          return (
            <circle
              key={model.name}
              cx="50"
              cy="50"
              r={radius}
              stroke={modelColors[model.name] || "#94a3b8"}
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Activity className="w-5 h-5 text-blue-600 mb-1" />
        <div className="text-xs text-slate-600">Models</div>
      </div>
    </div>
  );
};

const PolicyHeatMatrix = ({ violations = [] }) => {
  const policies = ["PII", "Vendor", "Budget", "Compliance"];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getHeatColor = (count) => {
    if (count === 0) return "bg-slate-100";
    if (count <= 2) return "bg-amber-200";
    if (count <= 5) return "bg-orange-300";
    return "bg-red-400";
  };

  return (
    <div className="space-y-1">
      {policies.map((policy, pIdx) => (
        <div key={policy} className="flex items-center gap-1">
          <div className="w-16 text-[10px] text-slate-600 truncate">{policy}</div>
          <div className="flex gap-0.5">
            {hours.slice(0, 12).map((hour) => {
              const count = Math.floor(Math.random() * 3); // Mock
              return (
                <div
                  key={hour}
                  className={cn("w-2 h-2 rounded-sm", getHeatColor(count))}
                  title={`${policy} at ${hour}:00 - ${count} blocks`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const CostTrajectory = ({ current, budget, projected }) => {
  const percentage = (current / budget) * 100;
  const projPercentage = (projected / budget) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600">Current</span>
        <span className="font-mono text-slate-900">${current.toFixed(2)}/hr</span>
      </div>
      <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn(
            "absolute h-full rounded-full transition-all duration-500",
            percentage > 80 ? "bg-red-500" : percentage > 60 ? "bg-amber-500" : "bg-emerald-500"
          )}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
        {projected > current && (
          <div
            className="absolute h-full bg-slate-300 rounded-full opacity-40"
            style={{ width: `${Math.min(100, projPercentage)}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-600">Projected (EOD)</span>
        <span className="font-mono text-slate-900">${projected.toFixed(2)}/hr</span>
      </div>
    </div>
  );
};

export default function AIAwarenessPanel({ 
  throttleEnabled = false,
  onThrottleChange,
  fallbackActive = false,
  safeMode = false,
  onSafeModeChange
}) {
  const models = [
    { name: "gpt-4o-mini", usage: 78 },
    { name: "gpt-4o", usage: 45 },
    { name: "gpt-4o-1", usage: 12 }
  ];

  const tokenFlowData = Array.from({ length: 12 }, (_, i) => ({
    time: i,
    in: 400 + Math.random() * 200,
    out: 300 + Math.random() * 150
  }));

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardHeader className="border-b border-slate-200 pb-3">
        <CardTitle className="text-slate-900 text-sm flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-600" />
          AI System State
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Model Utilization */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 mb-3">Model Utilization</h4>
          <ModelUtilizationGauge models={models} />
          <div className="mt-3 space-y-1">
            {models.map((model) => (
              <div key={model.name} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-mono">{model.name}</span>
                <span className="font-semibold text-slate-900">{model.usage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Token Flow */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 mb-2">Token Flow (last hour)</h4>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={tokenFlowData}>
              <XAxis dataKey="time" tick={{ fontSize: 8 }} />
              <YAxis tick={{ fontSize: 8 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgb(226, 232, 240)',
                  borderRadius: '8px',
                  fontSize: '10px'
                }}
              />
              <Line type="monotone" dataKey="in" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="out" stroke="#10b981" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 text-xs mt-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <span className="text-slate-600">In</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
              <span className="text-slate-600">Out</span>
            </div>
          </div>
        </div>

        {/* Policy Heat */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 mb-2">Policy Activity (24h)</h4>
          <PolicyHeatMatrix />
        </div>

        {/* Cost Trajectory */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 mb-2">Cost Trajectory</h4>
          <CostTrajectory current={1.23} budget={15.0} projected={2.45} />
        </div>

        {/* Auto-Mitigation Controls */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <h4 className="text-xs font-semibold text-slate-700">Auto-Mitigation</h4>
          
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-slate-900">Throttle</span>
            </div>
            <Switch checked={throttleEnabled} onCheckedChange={onThrottleChange} />
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <Label className="text-sm text-slate-900">Fallback Active</Label>
            </div>
            <Badge className={fallbackActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}>
              {fallbackActive ? "ON" : "OFF"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-slate-900">Safe Mode</span>
            </div>
            <Switch checked={safeMode} onCheckedChange={onSafeModeChange} />
          </div>

          {safeMode && (
            <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded-lg border border-purple-200">
              <strong>Safe Mode Active:</strong> All requests require manual approval. Autopilot shifted 90% load to gpt-4o-mini.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}