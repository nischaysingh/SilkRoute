import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, TrendingUp, Lightbulb, Database, GitBranch, 
  Sparkles, Copy, ChevronRight, Loader2 
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ExplainThisPanel({ open, onOpenChange, target }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (open && target) {
      setLoading(true);
      // Simulate AI analysis
      setTimeout(() => {
        setAnalysis({
          howComputed: {
            formula: target.metric ? `SUM(${target.metric.key}) / COUNT(runs)` : "Aggregate across all missions",
            dataSources: ["AIRequest entity", "Mission logs", "Cost tracking API"],
            model: "Statistical aggregation with outlier filtering"
          },
          whyItMoved: {
            change: "+12%",
            drivers: [
              { factor: "Token inflation", contribution: 45, detail: "OpenAI pricing increased 8% this month" },
              { factor: "New mission launched", contribution: 35, detail: "batch_pick_opt_v2 added $1.2k/month" },
              { factor: "Increased concurrency", contribution: 20, detail: "Pilot scaled from 10 to 15 concurrent runs" }
            ]
          },
          nextActions: [
            { 
              label: "Throttle inference concurrency to 8", 
              impact: "Cost ↓ 8%", 
              confidence: 87,
              reasoning: "Historical data shows 8 concurrent runs maintains 92% success with 8% lower cost"
            },
            { 
              label: "Switch batch_pick_opt_v2 to cost-save profile", 
              impact: "Cost ↓ 12%", 
              confidence: 91,
              reasoning: "This mission has low complexity tasks suitable for cheaper models"
            },
            { 
              label: "Enable aggressive caching", 
              impact: "Cost ↓ 15%", 
              confidence: 82,
              reasoning: "47% of requests are repeat queries within 1hr window"
            }
          ],
          dataLineage: [
            { step: "Raw Events", source: "AIRequest.created_date", count: "1,247 records" },
            { step: "Cost Attribution", source: "AIRequest.cost_estimate_cents", count: "1,247 records" },
            { step: "Aggregation", source: "SUM + GROUP BY mission", count: "4 missions" },
            { step: "Final Metric", source: "Total AI Spend", count: "$13.65k" }
          ]
        });
        setLoading(false);
      }, 1500);
    }
  }, [open, target]);

  if (!target) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-slate-200 w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Explain This: {target.card?.title}
            {target.metric && ` → ${target.metric.key}`}
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-8 h-8 text-purple-600" />
            </motion.div>
          </div>
        ) : analysis && (
          <Tabs defaultValue="computed" className="mt-6">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="computed">How It's Computed</TabsTrigger>
              <TabsTrigger value="why">Why It Moved</TabsTrigger>
              <TabsTrigger value="next">What to Try Next</TabsTrigger>
            </TabsList>

            {/* How It's Computed */}
            <TabsContent value="computed" className="space-y-4 mt-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Formula
                  </h4>
                  <div className="p-3 bg-white rounded border border-blue-200 font-mono text-sm text-slate-900">
                    {analysis.howComputed.formula}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(analysis.howComputed.formula);
                      toast.success("Formula copied to clipboard");
                    }}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Formula
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Data Sources</h4>
                  <ul className="space-y-2">
                    {analysis.howComputed.dataSources.map((source, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                        <div className="w-2 h-2 rounded-full bg-purple-600" />
                        {source}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Model Used</h4>
                  <p className="text-sm text-slate-700">{analysis.howComputed.model}</p>
                </CardContent>
              </Card>

              {/* Data Lineage */}
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Data Lineage
                  </h4>
                  <div className="space-y-3">
                    {analysis.dataLineage.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </div>
                            {idx < analysis.dataLineage.length - 1 && (
                              <div className="w-0.5 h-10 bg-purple-300 my-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <h5 className="text-sm font-semibold text-slate-900">{step.step}</h5>
                            <p className="text-xs text-slate-600">{step.source}</p>
                            <Badge className="mt-1 bg-purple-100 text-purple-700 text-[10px]">
                              {step.count}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Why It Moved */}
            <TabsContent value="why" className="space-y-4 mt-4">
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-amber-900 mb-2">Change Detected</h4>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    <span className="text-2xl font-bold text-amber-900">{analysis.whyItMoved.change}</span>
                    <span className="text-sm text-slate-700">from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Driver Analysis</h4>
                  <div className="space-y-3">
                    {analysis.whyItMoved.drivers.map((driver, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-900">{driver.factor}</span>
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            {driver.contribution}% contribution
                          </Badge>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${driver.contribution}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                          />
                        </div>
                        <p className="text-xs text-slate-600">{driver.detail}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* What to Try Next */}
            <TabsContent value="next" className="space-y-4 mt-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-emerald-900">Adaptive Play Suggestions</h4>
                </div>
                <p className="text-xs text-slate-700">
                  Based on historical data and current patterns, here are recommended actions:
                </p>
              </div>

              {analysis.nextActions.map((action, idx) => (
                <Card key={idx} className="border-2 border-slate-200 hover:border-purple-300 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-slate-900 mb-1">{action.label}</h5>
                        <p className="text-xs text-slate-600 mb-2">{action.reasoning}</p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs ml-2">
                        {action.confidence}% conf
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-700">{action.impact}</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        onClick={() => {
                          toast.success("Action queued for execution");
                        }}
                      >
                        Apply Now
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}