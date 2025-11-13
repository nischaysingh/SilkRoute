import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity, AlertTriangle, TrendingUp, Brain, Sparkles, Eye, Settings, Plus, Loader2, Target, GitBranch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { performRootCauseAnalysis } from "@/functions/performRootCauseAnalysis";
import { generateLongTermForecast } from "@/functions/generateLongTermForecast";

import RealTimeMissionAnalytics from "./RealTimeMissionAnalytics";

export default function EnhancedAnalyticsDashboard({ missionId }) {
  const [rcaDialogOpen, setRcaDialogOpen] = useState(false);
  const [forecastDialogOpen, setForecastDialogOpen] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [rcaData, setRcaData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loadingRCA, setLoadingRCA] = useState(false);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecastDays, setForecastDays] = useState(30);

  const { data: widgets = [] } = useQuery({
    queryKey: ['dashboard-widgets'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.DashboardWidget.filter(
        { user_email: user.email },
        '-created_date',
        20
      );
    }
  });

  const handleRootCauseAnalysis = async (anomaly) => {
    setSelectedAnomaly(anomaly);
    setLoadingRCA(true);
    setRcaDialogOpen(true);

    try {
      const response = await performRootCauseAnalysis({
        anomalyData: anomaly,
        missionId
      });

      if (response.data.success) {
        setRcaData(response.data.rca);
        toast.success("Root cause analysis complete");
      }
    } catch (error) {
      toast.error("Failed to perform root cause analysis");
      setRcaDialogOpen(false);
    } finally {
      setLoadingRCA(false);
    }
  };

  const handleGenerateForecast = async () => {
    setLoadingForecast(true);
    setForecastDialogOpen(true);

    try {
      const response = await generateLongTermForecast({
        missionId,
        forecastDays
      });

      if (response.data.success) {
        setForecastData(response.data.forecast);
        toast.success(`${forecastDays}-day forecast generated`);
      }
    } catch (error) {
      toast.error("Failed to generate forecast");
      setForecastDialogOpen(false);
    } finally {
      setLoadingForecast(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Enhanced Analytics Dashboard
        </h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleGenerateForecast}
            className="bg-purple-600 hover:bg-purple-700 h-8 text-xs"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Long-term Forecast
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
          >
            <Settings className="w-3 h-3 mr-1" />
            Customize
          </Button>
        </div>
      </div>

      {/* Real-time Analytics with RCA integration */}
      <RealTimeMissionAnalytics 
        missionId={missionId}
        onAnomalyClick={handleRootCauseAnalysis}
      />

      {/* Root Cause Analysis Dialog */}
      <Dialog open={rcaDialogOpen} onOpenChange={setRcaDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Root Cause Analysis
            </DialogTitle>
          </DialogHeader>

          {loadingRCA ? (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-600 mb-4" />
              <p className="text-sm text-slate-600">Analyzing root causes...</p>
            </div>
          ) : rcaData && (
            <div className="space-y-6 py-4">
              {/* Root Causes */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">Identified Root Causes</h4>
                <div className="space-y-3">
                  {rcaData.root_causes?.map((cause, idx) => (
                    <Card key={idx} className={cn(
                      "border-2",
                      cause.layer === "root" ? "border-red-300 bg-red-50" :
                      cause.layer === "intermediate" ? "border-amber-300 bg-amber-50" :
                      "border-blue-300 bg-blue-50"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={cn(
                                "text-xs",
                                cause.layer === "root" ? "bg-red-100 text-red-700" :
                                cause.layer === "intermediate" ? "bg-amber-100 text-amber-700" :
                                "bg-blue-100 text-blue-700"
                              )}>
                                {cause.layer}
                              </Badge>
                              <Badge className="bg-purple-100 text-purple-700 text-xs">
                                {(cause.confidence * 100).toFixed(0)}% confidence
                              </Badge>
                            </div>
                            <h5 className="text-sm font-bold text-slate-900 mb-2">{cause.cause}</h5>
                            
                            {cause.evidence?.length > 0 && (
                              <div className="mb-2">
                                <div className="text-xs text-slate-600 mb-1">Evidence:</div>
                                <ul className="space-y-1">
                                  {cause.evidence.map((ev, eidx) => (
                                    <li key={eidx} className="text-xs text-slate-700 flex items-start gap-2">
                                      <span className="text-blue-600">•</span>
                                      {ev}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {cause.contributing_factors?.length > 0 && (
                              <div>
                                <div className="text-xs text-slate-600 mb-1">Contributing Factors:</div>
                                <div className="flex flex-wrap gap-1">
                                  {cause.contributing_factors.map((factor, fidx) => (
                                    <Badge key={fidx} className="bg-slate-100 text-slate-700 text-xs">
                                      {factor}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 5 Whys Chain */}
              {rcaData.causal_chain?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Causal Chain (5 Whys)</h4>
                  <div className="space-y-2">
                    {rcaData.causal_chain.map((chain, idx) => (
                      <Card key={idx} className="border-2 border-purple-200 bg-purple-50">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {chain.level}
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-bold text-purple-900 mb-1">{chain.question}</div>
                              <div className="text-sm text-slate-700">{chain.answer}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Remediation Plan */}
              {rcaData.remediation_plan && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Remediation Plan</h4>
                  <Tabs defaultValue="immediate" className="w-full">
                    <TabsList className="bg-slate-100">
                      <TabsTrigger value="immediate">Immediate</TabsTrigger>
                      <TabsTrigger value="short-term">Short-term</TabsTrigger>
                      <TabsTrigger value="long-term">Long-term</TabsTrigger>
                      <TabsTrigger value="preventive">Preventive</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="immediate" className="space-y-2 mt-3">
                      {rcaData.remediation_plan.immediate_actions?.map((action, idx) => (
                        <div key={idx} className="p-2 bg-red-50 border border-red-200 rounded text-sm text-slate-900">
                          🚨 {action}
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="short-term" className="space-y-2 mt-3">
                      {rcaData.remediation_plan.short_term_fixes?.map((fix, idx) => (
                        <div key={idx} className="p-2 bg-amber-50 border border-amber-200 rounded text-sm text-slate-900">
                          ⚡ {fix}
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="long-term" className="space-y-2 mt-3">
                      {rcaData.remediation_plan.long_term_solutions?.map((solution, idx) => (
                        <div key={idx} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-slate-900">
                          🎯 {solution}
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="preventive" className="space-y-2 mt-3">
                      {rcaData.remediation_plan.preventive_measures?.map((measure, idx) => (
                        <div key={idx} className="p-2 bg-emerald-50 border border-emerald-200 rounded text-sm text-slate-900">
                          🛡️ {measure}
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Impact & Timeline */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="p-3">
                    <div className="text-xs text-amber-900 font-semibold mb-1">Business Impact</div>
                    <p className="text-sm text-slate-700">{rcaData.business_impact}</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3">
                    <div className="text-xs text-blue-900 font-semibold mb-1">Est. Resolution Time</div>
                    <p className="text-lg font-bold text-slate-900">{rcaData.estimated_resolution_time}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRcaDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Long-term Forecast Dialog */}
      <Dialog open={forecastDialogOpen} onOpenChange={setForecastDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              {forecastDays}-Day AI Forecast & Scenario Planning
            </DialogTitle>
          </DialogHeader>

          {loadingForecast ? (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-600 mb-4" />
              <p className="text-sm text-slate-600">Generating long-term forecast...</p>
            </div>
          ) : forecastData && (
            <div className="space-y-6 py-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-3">
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-3">
                    <div className="text-xs text-emerald-700 mb-1">Avg Success Rate</div>
                    <div className="text-xl font-bold text-emerald-900">
                      {(forecastData.baseline_forecast.summary_statistics.mean_success_rate * 100).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3">
                    <div className="text-xs text-blue-700 mb-1">Avg Latency</div>
                    <div className="text-xl font-bold text-blue-900">
                      {forecastData.baseline_forecast.summary_statistics.mean_latency?.toFixed(0) || 0}ms
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-3">
                    <div className="text-xs text-purple-700 mb-1">Total Projected Cost</div>
                    <div className="text-xl font-bold text-purple-900">
                      ${forecastData.baseline_forecast.summary_statistics.total_projected_cost?.toFixed(2) || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-3">
                    <div className="text-xs text-slate-600 mb-1">Confidence</div>
                    <div className="text-xl font-bold text-slate-900">
                      {(forecastData.confidence_score * 100).toFixed(0)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Forecast Chart */}
              <Card className="bg-white border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-900">Performance Projection</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={forecastData.baseline_forecast.daily_projections?.slice(0, 30) || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#6b7280" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Area type="monotone" dataKey="expected_success_rate" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Success Rate" />
                      <Area type="monotone" dataKey="confidence_interval_upper" stroke="#3b82f6" fill="none" strokeDasharray="3 3" name="Upper Bound" />
                      <Area type="monotone" dataKey="confidence_interval_lower" stroke="#3b82f6" fill="none" strokeDasharray="3 3" name="Lower Bound" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Scenarios */}
              {forecastData.scenarios?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Scenario Planning</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {forecastData.scenarios.map((scenario, idx) => (
                      <Card key={idx} className={cn(
                        "border-2",
                        scenario.name === "best_case" ? "border-emerald-300 bg-emerald-50" :
                        scenario.name === "worst_case" ? "border-red-300 bg-red-50" :
                        "border-blue-300 bg-blue-50"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-bold text-slate-900">
                              {scenario.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h5>
                            <Badge className="bg-slate-100 text-slate-700 text-xs">
                              {(scenario.probability * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 mb-3">{scenario.description}</p>
                          
                          <div className="space-y-1 text-xs mb-3">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Success:</span>
                              <span className="font-bold text-slate-900">{scenario.outcomes.success_rate_change}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Cost:</span>
                              <span className="font-bold text-slate-900">{scenario.outcomes.cost_change}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Latency:</span>
                              <span className="font-bold text-slate-900">{scenario.outcomes.latency_change}</span>
                            </div>
                          </div>

                          {scenario.triggers?.length > 0 && (
                            <div className="text-xs text-slate-600">
                              <span className="font-semibold">Triggers: </span>
                              {scenario.triggers[0]}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Trend Analysis */}
              {forecastData.trend_analysis && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-900">Trend Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {forecastData.trend_analysis.detected_trends?.length > 0 && (
                      <div>
                        <div className="text-xs text-blue-900 font-semibold mb-2">Detected Trends:</div>
                        <div className="space-y-1">
                          {forecastData.trend_analysis.detected_trends.map((trend, idx) => (
                            <div key={idx} className="text-sm text-slate-700">• {trend}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {forecastData.trend_analysis.seasonality && (
                      <div className="p-2 bg-white rounded border border-blue-200">
                        <div className="text-xs text-blue-900 font-semibold mb-1">Seasonality:</div>
                        <p className="text-sm text-slate-700">{forecastData.trend_analysis.seasonality}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Strategic Recommendations */}
              {forecastData.strategic_recommendations?.length > 0 && (
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      Strategic Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {forecastData.strategic_recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-emerald-600">→</span>
                          {rec}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setForecastDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}