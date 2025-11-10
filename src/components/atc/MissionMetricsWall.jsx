
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Radar, Clock, Gauge, DollarSign, AlertCircle, TrendingUp, TrendingDown,
  Activity, Target
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { 
  TooltipProvider, 
  Tooltip as UITooltip, 
  TooltipTrigger as UITooltipTrigger, 
  TooltipContent as UITooltipContent 
} from "@/components/ui/tooltip";

const MiniSparkline = ({ data, color = "#3b82f6", threshold }) => (
  <ResponsiveContainer width="100%" height={40}>
    <LineChart data={data}>
      <Line 
        type="monotone" 
        dataKey="value" 
        stroke={color} 
        strokeWidth={2} 
        dot={false}
      />
      {threshold && (
        <Line 
          type="monotone" 
          dataKey="threshold" 
          stroke="#ef4444" 
          strokeWidth={1} 
          strokeDasharray="3 3" 
          dot={false}
        />
      )}
    </LineChart>
  </ResponsiveContainer>
);

const MiniBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={50}>
    <BarChart data={data}>
      <XAxis dataKey="name" tick={{ fontSize: 8 }} />
      <Tooltip
        contentStyle={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgb(226, 232, 240)',
          borderRadius: '8px',
          fontSize: '11px'
        }}
      />
      <Bar dataKey="pilot" stackId="a" fill="#3b82f6" />
      <Bar dataKey="copilot" stackId="a" fill="#8b5cf6" />
      <Bar dataKey="autopilot" stackId="a" fill="#10b981" />
    </BarChart>
  </ResponsiveContainer>
);

const BudgetRing = ({ current, total }) => {
  const percentage = (current / total) * 100;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative w-20 h-20">
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="rgb(226, 232, 240)"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={percentage > 80 ? "#ef4444" : percentage > 50 ? "#f59e0b" : "#10b981"}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xs font-bold text-slate-900">${current.toFixed(2)}</div>
        <div className="text-[10px] text-slate-600">${total}/hr</div>
      </div>
    </div>
  );
};

export default function MissionMetricsWall({ 
  activeMissions = 3,
  completedMissions = 12,
  avgLatency = 842,
  errorsByRoute = [],
  hourlySpend = 1.23,
  costBudget = 15.00,
  onInvestigate
}) {
  // Mock data for trends
  const missionTrendData = Array.from({ length: 7 }, (_, i) => ({
    day: i,
    active: Math.floor(Math.random() * 5) + 2,
    completed: Math.floor(Math.random() * 3) + 1
  }));

  const latencyTrendData = Array.from({ length: 20 }, (_, i) => ({
    time: i,
    value: 800 + Math.random() * 400,
    threshold: 1200
  }));

  const errorData = errorsByRoute.length > 0 ? errorsByRoute : [
    { name: "pilot", pilot: 2, copilot: 0, autopilot: 0 },
    { name: "copilot", pilot: 1, copilot: 3, autopilot: 0 },
    { name: "autopilot", pilot: 0, copilot: 1, autopilot: 1 }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {/* Active vs Completed Missions */}
      <TooltipProvider>
        <UITooltip>
          <UITooltipTrigger asChild>
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm hover:shadow-md transition-all cursor-help">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 rounded-lg bg-blue-50">
                      <Radar className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">Missions</span>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] py-0 h-4">
                    +{completedMissions}
                  </Badge>
                </div>
                <div className="mb-1.5">
                  <div className="text-xl font-bold text-slate-900">{activeMissions}</div>
                  <div className="text-[10px] text-slate-600">active</div>
                </div>
                <div className="h-8">
                  <MiniSparkline 
                    data={missionTrendData.map(d => ({ value: d.active + d.completed }))} 
                    color="#3b82f6"
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onInvestigate?.('missions')}
                  className="w-full mt-1.5 h-5 text-[10px] text-blue-600 hover:bg-blue-50">
                  Investigate
                </Button>
              </CardContent>
            </Card>
          </UITooltipTrigger>
          <UITooltipContent className="bg-white border-slate-200 text-slate-900">
            <div className="text-xs space-y-1">
              <div><strong>Delta:</strong> +3 vs yesterday</div>
              <div><strong>Last anomaly:</strong> 2h ago (latency spike)</div>
            </div>
          </UITooltipContent>
        </UITooltip>
      </TooltipProvider>

      {/* Avg Latency Trend */}
      <TooltipProvider>
        <UITooltip>
          <UITooltipTrigger asChild>
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm hover:shadow-md transition-all cursor-help">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 rounded-lg bg-amber-50">
                      <Gauge className="w-3 h-3 text-amber-600" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">Latency</span>
                  </div>
                  <Badge className="bg-red-50 text-red-700 border-red-200 text-[9px] py-0 h-4">
                    +12%
                  </Badge>
                </div>
                <div className="mb-1.5">
                  <div className="text-xl font-bold text-slate-900">{avgLatency}ms</div>
                  <div className="text-[10px] text-slate-600">p95</div>
                </div>
                <div className="h-8">
                  <MiniSparkline 
                    data={latencyTrendData} 
                    color="#f59e0b"
                    threshold={true}
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onInvestigate?.('latency')}
                  className="w-full mt-1.5 h-5 text-[10px] text-amber-600 hover:bg-amber-50">
                  Investigate
                </Button>
              </CardContent>
            </Card>
          </UITooltipTrigger>
          <UITooltipContent className="bg-white border-slate-200 text-slate-900">
            <div className="text-xs space-y-1">
              <div><strong>Delta:</strong> +104ms vs 1h avg</div>
              <div><strong>Breach count:</strong> 2 in last hour</div>
            </div>
          </UITooltipContent>
        </UITooltip>
      </TooltipProvider>

      {/* Error Rate by Route */}
      <TooltipProvider>
        <UITooltip>
          <UITooltipTrigger asChild>
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm hover:shadow-md transition-all cursor-help">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 rounded-lg bg-red-50">
                      <AlertCircle className="w-3 h-3 text-red-600" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">Errors</span>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] py-0 h-4">
                    -8%
                  </Badge>
                </div>
                <div className="mb-1.5">
                  <div className="text-xl font-bold text-slate-900">1.8%</div>
                  <div className="text-[10px] text-slate-600">rate</div>
                </div>
                <div className="h-8">
                  <MiniBarChart data={errorData} />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onInvestigate?.('errors')}
                  className="w-full mt-1.5 h-5 text-[10px] text-red-600 hover:bg-red-50">
                  Investigate
                </Button>
              </CardContent>
            </Card>
          </UITooltipTrigger>
          <UITooltipContent className="bg-white border-slate-200 text-slate-900">
            <div className="text-xs space-y-1">
              <div><strong>Pilot:</strong> 3 errors (0.2%)</div>
              <div><strong>Copilot:</strong> 4 errors (0.5%)</div>
              <div><strong>Autopilot:</strong> 1 error (0.1%)</div>
            </div>
          </UITooltipContent>
        </UITooltip>
      </TooltipProvider>

      {/* Hourly Spend */}
      <TooltipProvider>
        <UITooltip>
          <UITooltipTrigger asChild>
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm hover:shadow-md transition-all cursor-help">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 rounded-lg bg-purple-50">
                      <DollarSign className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">Spend</span>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] py-0 h-4">
                    82%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-slate-900">${hourlySpend.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-600">/hr</div>
                  </div>
                  <div className="scale-75 origin-right">
                    <BudgetRing current={hourlySpend} total={costBudget} />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onInvestigate?.('spend')}
                  className="w-full mt-1.5 h-5 text-[10px] text-purple-600 hover:bg-purple-50">
                  Investigate
                </Button>
              </CardContent>
            </Card>
          </UITooltipTrigger>
          <UITooltipContent className="bg-white border-slate-200 text-slate-900">
            <div className="text-xs space-y-1">
              <div><strong>Projected:</strong> $28.80 today</div>
              <div><strong>Budget:</strong> $360/day</div>
              <div><strong>Savings:</strong> $12.40 vs High-Accuracy</div>
            </div>
          </UITooltipContent>
        </UITooltip>
      </TooltipProvider>
    </div>
  );
}
