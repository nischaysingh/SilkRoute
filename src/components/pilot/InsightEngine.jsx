import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sparkles, TrendingUp, AlertTriangle, Target, Eye, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sankey, Tooltip, ResponsiveContainer } from "recharts";

export default function InsightEngine({ missions, onExplainInsight }) {
  const [activeTab, setActiveTab] = useState("causal");
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [causalInsights] = useState([
    {
      id: 1,
      type: "causal",
      metric: "Latency",
      change: "+12%",
      reason: "Switched to Co-Pilot profile → longer token processing",
      evidence: [
        "Co-Pilot profile active since 10:15 AM",
        "Token count increased 18% per request",
        "Model processing time +95ms average"
      ],
      impact: "medium",
      recommendation: "Consider hybrid routing: Co-Pilot for complex, Pilot for simple"
    },
    {
      id: 2,
      type: "causal",
      metric: "Cost",
      change: "-8.2%",
      reason: "Aggressive caching reduced API calls by 47%",
      evidence: [
        "Cache hit rate: 67%",
        "API calls reduced from 1,250 to 663/hour",
        "Avg tokens saved: 380 per cached request"
      ],
      impact: "high",
      recommendation: "Increase cache TTL to 20 minutes for even better savings"
    },
    {
      id: 3,
      type: "causal",
      metric: "Success Rate",
      change: "+6.1%",
      reason: "Reduced retry count eliminated wasteful attempts",
      evidence: [
        "94% success on first retry",
        "Third retry success rate: only 4%",
        "Time saved per failed request: 2.3s"
      ],
      impact: "high",
      recommendation: "Apply same logic to batch_pick_opt_v2"
    }
  ]);

  const [rootCauses] = useState([
    {
      id: 1,
      bottleneck: "External API Timeout",
      affectedMissions: ["invoice_chase_v1", "ar_collection_push"],
      frequency: "12 times in last hour",
      avgDelay: "1,450ms",
      solution: "Enable circuit breaker + backup API routing"
    },
    {
      id: 2,
      bottleneck: "Token Limit Exceeded",
      affectedMissions: ["batch_pick_opt_v2"],
      frequency: "3 times today",
      avgDelay: "N/A (hard failure)",
      solution: "Implement chunking strategy or switch to gpt-4o"
    }
  ]);

  const [anomalyCorrelations] = useState([
    {
      time: "10:23 AM",
      events: [
        { type: "latency", value: "+230ms", mission: "invoice_chase_v1" },
        { type: "cost", value: "+$0.012", mission: "invoice_chase_v1" },
        { type: "policy", value: "VIP escalation triggered", mission: "invoice_chase_v1" }
      ],
      correlation: "VIP policy adds manual review step → latency + cost spike"
    },
    {
      time: "9:15 AM",
      events: [
        { type: "latency", value: "-180ms", mission: "batch_pick_opt_v2" },
        { type: "cost", value: "-$0.008", mission: "batch_pick_opt_v2" }
      ],
      correlation: "Model switch to gpt-4o-mini → faster + cheaper"
    }
  ]);

  const handleInsightClick = (insight) => {
    setSelectedInsight(insight);
    setDrawerOpen(true);
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">Insight Engine</h4>
              <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
                Causal Analysis
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-100 mb-4">
              <TabsTrigger value="causal" className="text-xs">Causal</TabsTrigger>
              <TabsTrigger value="bottlenecks" className="text-xs">Bottlenecks</TabsTrigger>
              <TabsTrigger value="correlations" className="text-xs">Correlations</TabsTrigger>
            </TabsList>

            {/* Causal Insights Tab */}
            <TabsContent value="causal" className="space-y-3">
              {causalInsights.map((insight, idx) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleInsightClick(insight)}
                  className="p-3 rounded-lg border-2 border-slate-200 bg-white hover:border-purple-300 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-900">{insight.metric}</span>
                        <Badge className={cn(
                          "text-[9px] py-0",
                          insight.change.startsWith('+') && insight.metric !== "Cost" ? "bg-emerald-100 text-emerald-700" :
                          insight.change.startsWith('-') && insight.metric === "Cost" ? "bg-emerald-100 text-emerald-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {insight.change}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-700">{insight.reason}</p>
                    </div>
                    <Badge className={cn(
                      "text-[9px] py-0 ml-2",
                      insight.impact === "high" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {insight.impact} impact
                    </Badge>
                  </div>

                  <div className="mt-2 p-2 rounded bg-purple-50 border border-purple-200">
                    <div className="flex items-start gap-2">
                      <Target className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-purple-900">{insight.recommendation}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            {/* Bottlenecks Tab */}
            <TabsContent value="bottlenecks" className="space-y-3">
              {rootCauses.map((cause, idx) => (
                <Card key={cause.id} className="border-amber-200 bg-amber-50">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <h5 className="text-xs font-semibold text-amber-900">{cause.bottleneck}</h5>
                        </div>
                        <div className="text-xs text-slate-700 space-y-1">
                          <div>Affected: {cause.affectedMissions.join(", ")}</div>
                          <div>Frequency: {cause.frequency}</div>
                          <div>Avg Delay: {cause.avgDelay}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 p-2 rounded bg-white border border-amber-300">
                      <div className="text-xs font-semibold text-slate-900 mb-1">Solution:</div>
                      <p className="text-xs text-slate-700">{cause.solution}</p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleInsightClick(cause)}
                      className="w-full mt-2 h-6 text-xs bg-amber-600 hover:bg-amber-700"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Correlations Tab */}
            <TabsContent value="correlations" className="space-y-3">
              {anomalyCorrelations.map((corr, idx) => (
                <Card key={idx} className="border-blue-200 bg-blue-50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-blue-900">{corr.time}</span>
                      <Badge className="bg-blue-100 text-blue-700 text-[9px] py-0">
                        {corr.events.length} events
                      </Badge>
                    </div>

                    <div className="space-y-1 mb-2">
                      {corr.events.map((event, i) => (
                        <div key={i} className="flex items-center justify-between text-xs bg-white rounded p-1.5">
                          <span className="text-slate-700">{event.type}</span>
                          <span className={cn(
                            "font-semibold",
                            event.value.startsWith('+') ? "text-red-700" : "text-emerald-700"
                          )}>
                            {event.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2 rounded bg-white border border-blue-300">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-900">{corr.correlation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Insight Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Insight Analysis
            </SheetTitle>
          </SheetHeader>

          {selectedInsight && (
            <div className="mt-6 space-y-4">
              {selectedInsight.type === "causal" && (
                <>
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <h5 className="text-sm font-bold text-purple-900 mb-2">Why This Happened</h5>
                      <p className="text-sm text-slate-900 mb-1">{selectedInsight.metric} changed by <strong>{selectedInsight.change}</strong></p>
                      <p className="text-xs text-slate-700">{selectedInsight.reason}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardContent className="p-4">
                      <h5 className="text-sm font-bold text-slate-900 mb-3">Evidence</h5>
                      <ul className="space-y-2">
                        {selectedInsight.evidence.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4">
                      <h5 className="text-sm font-bold text-emerald-900 mb-2">Recommendation</h5>
                      <p className="text-xs text-slate-700">{selectedInsight.recommendation}</p>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={() => {
                      onExplainInsight?.(selectedInsight);
                      setDrawerOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Apply Recommendation
                  </Button>
                </>
              )}

              {selectedInsight.bottleneck && (
                <>
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4">
                      <h5 className="text-sm font-bold text-amber-900 mb-2">Bottleneck Detected</h5>
                      <p className="text-sm text-slate-900">{selectedInsight.bottleneck}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardContent className="p-4">
                      <h5 className="text-sm font-bold text-slate-900 mb-3">Impact</h5>
                      <div className="space-y-2 text-xs text-slate-700">
                        <div className="flex justify-between">
                          <span>Affected Missions:</span>
                          <span className="font-semibold">{selectedInsight.affectedMissions.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frequency:</span>
                          <span className="font-semibold">{selectedInsight.frequency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Delay:</span>
                          <span className="font-semibold text-red-700">{selectedInsight.avgDelay}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4">
                      <h5 className="text-sm font-bold text-emerald-900 mb-2">Recommended Fix</h5>
                      <p className="text-xs text-slate-700">{selectedInsight.solution}</p>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={() => {
                      onExplainInsight?.(selectedInsight);
                      setDrawerOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Apply Fix
                  </Button>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}