import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Activity, DollarSign, Clock, Zap, AlertTriangle, Eye, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { detectAnomalies } from "@/functions/detectAnomalies";
import { predictMissionPerformance } from "@/functions/predictMissionPerformance";
import { motion, AnimatePresence } from "framer-motion";

export default function RealTimeMissionAnalytics({ missionId }) {
  const [predictionData, setPredictionData] = useState(null);
  const [anomalyData, setAnomalyData] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [loadingAnomalies, setLoadingAnomalies] = useState(false);

  const { data: mission } = useQuery({
    queryKey: ['mission', missionId],
    queryFn: async () => {
      const missions = await base44.entities.AIMission.list();
      return missions.find(m => m.id === missionId);
    },
    enabled: !!missionId
  });

  const { data: kpis = [] } = useQuery({
    queryKey: ['mission-kpis', missionId],
    queryFn: async () => {
      return await base44.entities.MissionKPI.filter(
        { mission_id: missionId },
        '-timestamp',
        50
      );
    },
    enabled: !!missionId,
    refetchInterval: 5000
  });

  // Auto-run anomaly detection every 30 seconds
  useEffect(() => {
    if (!missionId) return;

    const runAnomalyDetection = async () => {
      setLoadingAnomalies(true);
      try {
        const response = await detectAnomalies({ missionId });
        if (response.data.success) {
          setAnomalyData(response.data);
          
          if (response.data.anomalies?.length > 0) {
            toast.warning(`${response.data.anomalies.length} anomalies detected`, {
              description: response.data.summary
            });
          }
        }
      } catch (error) {
        console.error('Anomaly detection failed:', error);
      } finally {
        setLoadingAnomalies(false);
      }
    };

    runAnomalyDetection();
    const interval = setInterval(runAnomalyDetection, 30000);
    return () => clearInterval(interval);
  }, [missionId]);

  const handleRunPrediction = async () => {
    setLoadingPrediction(true);
    try {
      const response = await predictMissionPerformance({
        missionId,
        forecastHours: 24
      });

      if (response.data.success) {
        setPredictionData(response.data.prediction);
        toast.success("Prediction generated", {
          description: `Outlook: ${response.data.prediction.overall_outlook}`
        });
      }
    } catch (error) {
      toast.error("Failed to generate prediction");
    } finally {
      setLoadingPrediction(false);
    }
  };

  // Calculate current metrics
  const currentMetrics = kpis.length > 0 ? {
    success_rate: (kpis[0]?.success_rate || 0) * 100,
    avg_latency: kpis[0]?.avg_latency_ms || 0,
    error_rate: (kpis[0]?.error_rate || 0) * 100,
    cost: kpis[0]?.cost_per_run || 0
  } : null;

  // Prepare chart data
  const chartData = kpis.slice(0, 20).reverse().map((kpi, idx) => ({
    time: new Date(kpi.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    success_rate: (kpi.success_rate || 0) * 100,
    latency: kpi.avg_latency_ms || 0,
    error_rate: (kpi.error_rate || 0) * 100,
    cost: kpi.cost_per_run || 0,
    cpu: kpi.cpu_utilization || 0,
    memory: kpi.memory_utilization || 0
  }));

  if (!mission) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p className="text-sm text-slate-600">Select a mission to view analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Real-time KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <Badge className="bg-emerald-100 text-emerald-700 text-xs">Live</Badge>
            </div>
            <div className="text-2xl font-bold text-emerald-900 mb-1">
              {currentMetrics?.success_rate.toFixed(1) || 0}%
            </div>
            <div className="text-xs text-emerald-700">Success Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700 text-xs">p95</Badge>
            </div>
            <div className="text-2xl font-bold text-blue-900 mb-1">
              {currentMetrics?.avg_latency.toFixed(0) || 0}ms
            </div>
            <div className="text-xs text-blue-700">Latency</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700 text-xs">$/run</Badge>
            </div>
            <div className="text-2xl font-bold text-purple-900 mb-1">
              ${currentMetrics?.cost.toFixed(3) || 0}
            </div>
            <div className="text-xs text-purple-700">Cost</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <Badge className="bg-red-100 text-red-700 text-xs">Rate</Badge>
            </div>
            <div className="text-2xl font-bold text-red-900 mb-1">
              {currentMetrics?.error_rate.toFixed(2) || 0}%
            </div>
            <div className="text-xs text-red-700">Errors</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Success Rate & Latency */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-900">Success Rate & Latency Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#6b7280" />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="#6b7280" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line yAxisId="left" type="monotone" dataKey="success_rate" stroke="#10b981" strokeWidth={2} name="Success %" />
                <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} name="Latency (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resource Utilization */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-900">Resource Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="cpu" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="CPU %" />
                <Area type="monotone" dataKey="memory" stackId="1" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} name="Memory %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Detection */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              AI Anomaly Detection
              {loadingAnomalies && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
            </CardTitle>
            <Badge className={cn(
              "text-xs",
              anomalyData?.overall_health_score >= 90 ? "bg-emerald-100 text-emerald-700" :
              anomalyData?.overall_health_score >= 70 ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            )}>
              Health: {anomalyData?.overall_health_score || 0}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!anomalyData ? (
            <div className="text-center py-8 text-sm text-slate-600">
              Running initial anomaly scan...
            </div>
          ) : anomalyData.anomalies?.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-100 mx-auto mb-3 flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-emerald-900">All metrics normal</p>
              <p className="text-xs text-slate-600 mt-1">{anomalyData.summary}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {anomalyData.anomalies.map((anomaly, idx) => (
                <Card key={idx} className={cn(
                  "border-2",
                  anomaly.severity === "critical" ? "border-red-300 bg-red-50" :
                  anomaly.severity === "high" ? "border-orange-300 bg-orange-50" :
                  anomaly.severity === "medium" ? "border-amber-300 bg-amber-50" :
                  "border-blue-300 bg-blue-50"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={cn(
                            "text-xs",
                            anomaly.severity === "critical" ? "bg-red-100 text-red-700" :
                            anomaly.severity === "high" ? "bg-orange-100 text-orange-700" :
                            anomaly.severity === "medium" ? "bg-amber-100 text-amber-700" :
                            "bg-blue-100 text-blue-700"
                          )}>
                            {anomaly.severity}
                          </Badge>
                          <span className="text-xs font-semibold text-slate-900">{anomaly.metric}</span>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{anomaly.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div>
                            <span className="text-slate-600">Current: </span>
                            <span className="font-bold text-slate-900">{anomaly.current_value?.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Baseline: </span>
                            <span className="font-bold text-slate-900">{anomaly.baseline_value?.toFixed(2)}</span>
                          </div>
                        </div>
                        <Badge className="bg-red-100 text-red-700 text-xs">
                          {anomaly.deviation_percentage?.toFixed(0)}% deviation
                        </Badge>
                      </div>
                    </div>
                    {anomaly.recommended_actions?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="text-xs font-semibold text-slate-900 mb-2">Recommended Actions:</div>
                        <div className="space-y-1">
                          {anomaly.recommended_actions.map((action, aidx) => (
                            <div key={aidx} className="text-xs text-slate-700 flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              {action}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Predictive Insights */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              AI Predictive Insights (24h)
            </CardTitle>
            <Button
              size="sm"
              onClick={handleRunPrediction}
              disabled={loadingPrediction || kpis.length < 5}
              className="bg-purple-600 hover:bg-purple-700 h-8 text-xs"
            >
              {loadingPrediction ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3 mr-1" />
              )}
              Refresh Forecast
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!predictionData ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto text-purple-400 opacity-50 mb-3" />
              <p className="text-sm text-slate-600 mb-4">Click to generate AI predictions</p>
              <Button
                onClick={handleRunPrediction}
                disabled={kpis.length < 5}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Generate Forecast
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Forecast Summary */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-xs text-emerald-700 mb-1">Success Rate</div>
                  <div className="text-lg font-bold text-emerald-900">
                    {(predictionData.forecast.expected_success_rate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700 mb-1">Latency</div>
                  <div className="text-lg font-bold text-blue-900">
                    {predictionData.forecast.expected_avg_latency_ms.toFixed(0)}ms
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xs text-purple-700 mb-1">Cost</div>
                  <div className="text-lg font-bold text-purple-900">
                    ${predictionData.forecast.expected_cost_per_run.toFixed(3)}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Confidence</div>
                  <div className="text-lg font-bold text-slate-900">
                    {(predictionData.forecast.confidence_level * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Outlook */}
              <Card className={cn(
                "border-2",
                predictionData.overall_outlook === "positive" ? "border-emerald-300 bg-emerald-50" :
                predictionData.overall_outlook === "concerning" ? "border-amber-300 bg-amber-50" :
                predictionData.overall_outlook === "critical" ? "border-red-300 bg-red-50" :
                "border-blue-300 bg-blue-50"
              )}>
                <CardContent className="p-4">
                  <div className="text-xs font-semibold text-slate-900 mb-1">Overall Outlook</div>
                  <Badge className={cn(
                    "text-xs",
                    predictionData.overall_outlook === "positive" ? "bg-emerald-100 text-emerald-700" :
                    predictionData.overall_outlook === "concerning" ? "bg-amber-100 text-amber-700" :
                    predictionData.overall_outlook === "critical" ? "bg-red-100 text-red-700" :
                    "bg-blue-100 text-blue-700"
                  )}>
                    {predictionData.overall_outlook}
                  </Badge>
                </CardContent>
              </Card>

              {/* Risks */}
              {predictionData.risks?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Predicted Risks</h4>
                  <div className="space-y-2">
                    {predictionData.risks.map((risk, idx) => (
                      <Card key={idx} className="border-2 border-red-200 bg-red-50">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-red-100 text-red-700 text-xs">
                                  {(risk.probability * 100).toFixed(0)}% probability
                                </Badge>
                                <Badge className="bg-orange-100 text-orange-700 text-xs">
                                  {risk.impact} impact
                                </Badge>
                              </div>
                              <p className="text-sm font-semibold text-slate-900 mb-1">{risk.description}</p>
                              <p className="text-xs text-slate-700">→ {risk.suggested_mitigation}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Opportunities */}
              {predictionData.opportunities?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Optimization Opportunities</h4>
                  <div className="space-y-2">
                    {predictionData.opportunities.map((opp, idx) => (
                      <Card key={idx} className="border-2 border-emerald-200 bg-emerald-50">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-slate-900 mb-1">{opp.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                  {opp.potential_improvement}
                                </Badge>
                                <Badge className="bg-blue-100 text-blue-700 text-xs">
                                  {opp.effort} effort
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {predictionData.recommendations?.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-bold text-blue-900 mb-2">AI Recommendations</h4>
                  <div className="space-y-1">
                    {predictionData.recommendations.map((rec, idx) => (
                      <div key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-blue-600">→</span>
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}