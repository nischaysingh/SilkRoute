import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Flame, CheckCircle, AlertTriangle, Zap, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export default function IncidentVisualizer({ incident, onClose, onMitigate }) {
  const [mitigationProgress, setMitigationProgress] = useState(0);
  const [isApplying, setIsApplying] = useState(false);

  if (!incident) return null;

  // Mock timeline data
  const timelineData = Array.from({ length: 30 }, (_, i) => ({
    time: i,
    latency: incident.type === "latency_spike" 
      ? (i < 15 ? 800 + Math.random() * 100 : 1200 + Math.random() * 400)
      : 800 + Math.random() * 100,
    errors: incident.type === "error_spike"
      ? (i < 15 ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 12))
      : Math.floor(Math.random() * 2),
    threshold: incident.type === "latency_spike" ? 1200 : null
  }));

  // Root cause tree data
  const rootCauseTree = [
    { level: 0, node: "Incident", label: incident.type.replace(/_/g, ' '), status: "error" },
    { level: 1, node: "Triggered By", label: "OpenAI API Degradation", status: "warn" },
    { level: 2, node: "Run", label: "Mission: invoice_chase_v1", status: "info" },
    { level: 2, node: "Policy", label: "Cost Guard: Active", status: "success" }
  ];

  const handleApplyMitigation = async (action) => {
    setIsApplying(true);
    setMitigationProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setMitigationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsApplying(false);
            onMitigate?.(incident, action);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "error": return "text-red-500";
      case "warn": return "text-amber-500";
      case "success": return "text-emerald-500";
      default: return "text-blue-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "error": return <Flame className="w-4 h-4" />;
      case "warn": return <AlertTriangle className="w-4 h-4" />;
      case "success": return <CheckCircle className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-slate-900 capitalize">
              {incident.type.replace(/_/g, ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            Started {new Date(incident.started_at).toLocaleString()}
          </div>
        </div>
        <Badge className={cn(
          "text-sm",
          incident.status === "open" && "bg-red-100 text-red-700 border-red-300",
          incident.status === "mitigating" && "bg-amber-100 text-amber-700 border-amber-300"
        )}>
          {incident.status}
        </Badge>
      </div>

      {/* AI Summary */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-purple-900 mb-1">AI Analysis</h3>
              <p className="text-sm text-slate-700">
                Incident #{incident.id.substring(0, 8)} likely due to upstream API degradation (92% confidence).
                Affected {incident.blast_radius_json?.requests_impacted || 0} requests across {(incident.blast_radius_json?.affected_routes || []).length} routes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="root-cause">Root Cause</TabsTrigger>
          <TabsTrigger value="blast-radius">Blast Radius</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Metrics Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgb(226, 232, 240)',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fill="url(#colorLatency)"
                  />
                  {incident.type === "latency_spike" && (
                    <Line 
                      type="monotone" 
                      dataKey="threshold" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-xs text-red-900">
                  <TrendingUp className="w-3 h-3" />
                  <span><strong>Spike detected</strong> at ~15min mark: p95 latency increased from 842ms to 1540ms (+83%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="root-cause" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Root Cause Tree</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rootCauseTree.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3"
                    style={{ paddingLeft: `${item.level * 24}px` }}
                  >
                    {item.level > 0 && (
                      <div className="w-6 h-6 flex items-center justify-center">
                        <div className="w-px h-6 bg-slate-300"></div>
                        <div className="w-6 h-px bg-slate-300"></div>
                      </div>
                    )}
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-lg flex-1",
                      item.status === "error" && "bg-red-50 border border-red-200",
                      item.status === "warn" && "bg-amber-50 border border-amber-200",
                      item.status === "success" && "bg-emerald-50 border border-emerald-200",
                      item.status === "info" && "bg-blue-50 border border-blue-200"
                    )}>
                      <span className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                      </span>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-slate-900">{item.node}</div>
                        <div className="text-xs text-slate-600">{item.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-xs font-semibold text-slate-900 mb-2">Analysis</h4>
                <ReactMarkdown className="prose prose-sm max-w-none text-xs text-slate-700">
                  {incident.root_cause_md}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blast-radius" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Impact Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="text-2xl font-bold text-red-700">
                    {incident.blast_radius_json?.requests_impacted || 24}
                  </div>
                  <div className="text-xs text-slate-600">Requests Impacted</div>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="text-2xl font-bold text-amber-700">
                    {(incident.blast_radius_json?.affected_routes || ['pilot', 'copilot']).length}
                  </div>
                  <div className="text-xs text-slate-600">Affected Routes</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-700">Affected Systems</h4>
                {(incident.blast_radius_json?.affected_routes || ['pilot', 'copilot']).map((route, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-sm text-slate-700 capitalize">{route}</span>
                    <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
                      {Math.floor(Math.random() * 15) + 5} failures
                    </Badge>
                  </div>
                ))}
              </div>

              {incident.blast_radius_json && (
                <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-900 mb-2">Full Details</h4>
                  <pre className="text-xs text-slate-700 overflow-auto">
                    {JSON.stringify(incident.blast_radius_json, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mitigation Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Suggested Mitigations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(incident.suggested_mitigation || []).map((action, idx) => (
            <Button
              key={idx}
              variant="outline"
              onClick={() => handleApplyMitigation(action)}
              disabled={isApplying}
              className="w-full justify-start text-left bg-white border-slate-200 hover:bg-slate-50 h-auto py-3">
              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-emerald-600" />
              <span className="text-sm text-slate-700">{action}</span>
            </Button>
          ))}

          {isApplying && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-900">Applying Mitigation...</span>
                <span className="text-sm text-blue-700">{mitigationProgress}%</span>
              </div>
              <Progress value={mitigationProgress} className="h-2" />
              <div className="mt-2 text-xs text-slate-600">
                Estimated recovery time: {Math.ceil((100 - mitigationProgress) / 10)}s
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}