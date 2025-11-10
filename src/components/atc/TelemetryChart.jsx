
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { Activity, DollarSign, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TelemetryChart({ onTimeRangeSelect, onExplainTrend }) {
  const [dashboardMode, setDashboardMode] = useState("performance");
  const [selectedRange, setSelectedRange] = useState(null);

  // Mock telemetry data
  const performanceData = Array.from({ length: 24 }, (_, i) => ({
    time: i,
    requests: 40 + Math.random() * 30,
    runs: 35 + Math.random() * 25,
    incidents: Math.random() > 0.8 ? 1 : 0,
    spend: 0.8 + Math.random() * 0.4
  }));

  const policyData = Array.from({ length: 24 }, (_, i) => ({
    time: i,
    blocks: Math.floor(Math.random() * 8),
    warnings: Math.floor(Math.random() * 15),
    passes: 50 + Math.floor(Math.random() * 20)
  }));

  const spendData = Array.from({ length: 24 }, (_, i) => ({
    time: i,
    spend: 0.5 + Math.random() * 1.2,
    budget: 1.5
  }));

  const anomalyPoints = [
    { time: 8, requests: 58, note: "Latency spike after retry logic update" },
    { time: 16, requests: 72, note: "Policy block burst from webhook source" }
  ];

  const currentData = dashboardMode === "performance" ? performanceData :
                      dashboardMode === "policy" ? policyData : spendData;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm rounded-lg">
      <CardHeader className="border-b border-slate-200 pb-2 px-3 pt-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 text-xs flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-blue-600" />
            Live Telemetry
          </CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={dashboardMode} onValueChange={setDashboardMode}>
              <TabsList className="h-6 bg-slate-100">
                <TabsTrigger value="performance" className="text-[10px] h-5 px-2">Performance</TabsTrigger>
                <TabsTrigger value="policy" className="text-[10px] h-5 px-2">Policy</TabsTrigger>
                <TabsTrigger value="spend" className="text-[10px] h-5 px-2">Spend</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExplainTrend?.(dashboardMode)}
              className="h-6 text-[10px] bg-white border-slate-200 hover:bg-slate-50 px-2">
              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
              Explain
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <ResponsiveContainer width="100%" height={140}>
          <LineChart 
            data={currentData}
            onMouseMove={(e) => {
              if (e?.activeTooltipIndex !== undefined) {
                setSelectedRange({ start: e.activeTooltipIndex, end: e.activeTooltipIndex + 2 });
              }
            }}
            onMouseLeave={() => setSelectedRange(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(226, 232, 240)" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 9, fill: "#64748b" }}
            />
            <YAxis tick={{ fontSize: 9, fill: "#64748b" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgb(226, 232, 240)',
                borderRadius: '8px',
                fontSize: '10px'
              }}
            />
            
            {dashboardMode === "performance" && (
              <>
                <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Requests" />
                <Line type="monotone" dataKey="runs" stroke="#10b981" strokeWidth={1.5} dot={false} name="Runs" />
                <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Incidents" />
                {anomalyPoints.map((point, idx) => (
                  <ReferenceDot 
                    key={idx}
                    x={point.time} 
                    y={point.requests} 
                    r={4} 
                    fill="#ef4444" 
                    stroke="#fff"
                    strokeWidth={1.5}
                  />
                ))}
              </>
            )}
            
            {dashboardMode === "policy" && (
              <>
                <Line type="monotone" dataKey="passes" stroke="#10b981" strokeWidth={1.5} dot={false} name="Passes" />
                <Line type="monotone" dataKey="warnings" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Warnings" />
                <Line type="monotone" dataKey="blocks" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Blocks" />
              </>
            )}
            
            {dashboardMode === "spend" && (
              <>
                <Line type="monotone" dataKey="spend" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="Spend" />
                <Line type="monotone" dataKey="budget" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" dot={false} name="Budget" />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>

        {dashboardMode === "performance" && anomalyPoints.length > 0 && (
          <div className="mt-2 space-y-1">
            {anomalyPoints.slice(0, 1).map((point, idx) => (
              <div key={idx} className="flex items-start gap-1.5 p-1.5 rounded-lg bg-red-50 border border-red-200">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1"></div>
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-red-900">{point.time}:00</div>
                  <div className="text-[9px] text-slate-700 leading-tight">{point.note}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedRange && (
          <div className="mt-2 p-2 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-[10px] text-blue-900 mb-1">
              <strong>Selected:</strong> Hour {selectedRange.start} - {selectedRange.end}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onTimeRangeSelect?.(selectedRange)}
              className="w-full h-5 text-[10px] text-blue-600 hover:bg-blue-100">
              Filter Queue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
