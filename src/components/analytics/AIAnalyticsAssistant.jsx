import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Send, Loader2, TrendingUp, AlertTriangle, Target, 
  Sparkles, X, Minus, Maximize2, ChevronRight, BarChart3,
  Activity, Clock, DollarSign, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AIAnalyticsAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchBusinessData = async () => {
    try {
      const [orders, inventory, payouts, people] = await Promise.all([
        base44.entities.Order.list('-created_date', 20),
        base44.entities.Inventory.list('-updated_date', 20),
        base44.entities.Payouts.list('-date', 10),
        base44.entities.People.list('-created_date', 10)
      ]);

      return { orders, inventory, payouts, people };
    } catch (error) {
      console.error('Error fetching data:', error);
      return { orders: [], inventory: [], payouts: [], people: [] };
    }
  };

  const handleSendQuery = async () => {
    if (!query.trim()) return;

    const userMessage = { role: "user", content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const data = await fetchBusinessData();

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert business intelligence AI analyst. Answer the user's question about their business data.

USER QUESTION: ${query}

AVAILABLE DATA:
Orders (last 20): ${JSON.stringify(data.orders.slice(0, 5))}
Inventory (last 20): ${JSON.stringify(data.inventory.slice(0, 5))}
Payouts (last 10): ${JSON.stringify(data.payouts.slice(0, 3))}
People (last 10): ${JSON.stringify(data.people.slice(0, 3))}

Provide a clear, actionable answer with specific numbers and insights. Be concise but informative.`,
        add_context_from_internet: false
      });

      const aiMessage = { role: "assistant", content: response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to process query");
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    setLoading(true);
    try {
      const data = await fetchBusinessData();

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this business data and provide strategic insights.

DATA OVERVIEW:
- Orders: ${data.orders.length} recent orders
- Inventory: ${data.inventory.length} items
- Payouts: ${data.payouts.length} recent payouts
- Team: ${data.people.length} people

Sample Orders: ${JSON.stringify(data.orders.slice(0, 3), null, 2)}
Sample Inventory: ${JSON.stringify(data.inventory.slice(0, 3), null, 2)}

Provide:
1. Key performance indicators
2. Top 3 actionable insights
3. Revenue trends
4. Operational bottlenecks`,
        response_json_schema: {
          type: "object",
          properties: {
            kpis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  value: { type: "string" },
                  trend: { type: "string", enum: ["up", "down", "stable"] },
                  interpretation: { type: "string" }
                }
              }
            },
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string", enum: ["high", "medium", "low"] },
                  action: { type: "string" }
                }
              }
            },
            trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  direction: { type: "string" },
                  change: { type: "string" }
                }
              }
            }
          }
        }
      });

      setInsights(response);
      setActiveTab("insights");
      toast.success("Insights generated!");
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error("Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  const detectAnomalies = async () => {
    setLoading(true);
    try {
      const data = await fetchBusinessData();

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Detect anomalies and unusual patterns in this business data.

ORDERS: ${JSON.stringify(data.orders.slice(0, 10), null, 2)}
INVENTORY: ${JSON.stringify(data.inventory.slice(0, 10), null, 2)}
PAYOUTS: ${JSON.stringify(data.payouts, null, 2)}

Look for:
- Unusual spikes or drops in values
- Outliers in order amounts or quantities
- Inventory levels that are too high or too low
- Payment patterns that seem irregular
- Any suspicious or unexpected data points`,
        response_json_schema: {
          type: "object",
          properties: {
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                  description: { type: "string" },
                  dataPoint: { type: "string" },
                  expectedValue: { type: "string" },
                  actualValue: { type: "string" },
                  rootCause: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });

      setAnomalies(response);
      setActiveTab("anomalies");
      toast.success("Anomaly detection complete!");
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      toast.error("Failed to detect anomalies");
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async () => {
    setLoading(true);
    try {
      const data = await fetchBusinessData();

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on historical data, predict future business outcomes.

HISTORICAL DATA:
Orders: ${JSON.stringify(data.orders.slice(0, 10), null, 2)}
Payouts: ${JSON.stringify(data.payouts, null, 2)}
Inventory: ${JSON.stringify(data.inventory.slice(0, 5), null, 2)}

Predict for the next 30 days:
- Revenue forecast
- Order volume trends
- Inventory needs
- Potential risks
- Growth opportunities`,
        response_json_schema: {
          type: "object",
          properties: {
            forecasts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  current: { type: "string" },
                  predicted: { type: "string" },
                  confidence: { type: "number" },
                  trend: { type: "string" }
                }
              }
            },
            risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  probability: { type: "string" },
                  impact: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            opportunities: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setPredictions(response);
      setActiveTab("predictions");
      toast.success("Predictions generated!");
    } catch (error) {
      console.error('Error generating predictions:', error);
      toast.error("Failed to generate predictions");
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "What's my top selling product?",
    "Show revenue trends this month",
    "Which inventory items are low?",
    "What's my average order value?",
    "Who are my top customers?"
  ];

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        <Brain className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={cn(
        "fixed right-6 z-50 bg-white border-2 border-slate-200 shadow-2xl",
        isMinimized ? "bottom-6 w-80" : "bottom-6 top-24 w-[500px]"
      )}
      style={{ borderRadius: "16px" }}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Analytics Assistant</h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs text-slate-600">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-7 w-7 p-0"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Quick Actions */}
          <div className="p-3 border-b border-slate-200 bg-slate-50">
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={generateInsights}
                disabled={loading}
                className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Insights
              </Button>
              <Button
                size="sm"
                onClick={detectAnomalies}
                disabled={loading}
                className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                Anomalies
              </Button>
              <Button
                size="sm"
                onClick={generatePredictions}
                disabled={loading}
                className="flex-1 h-8 text-xs bg-purple-600 hover:bg-purple-700"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Predict
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="w-full justify-start border-b border-slate-200 rounded-none bg-white px-3">
              <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
              <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
              <TabsTrigger value="anomalies" className="text-xs">Anomalies</TabsTrigger>
              <TabsTrigger value="predictions" className="text-xs">Predictions</TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex flex-col h-[calc(100vh-320px)] m-0">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 mx-auto mb-3 text-purple-400 opacity-50" />
                      <p className="text-sm text-slate-600 mb-4">Ask me anything about your business data</p>
                      <div className="space-y-2">
                        {quickQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setQuery(q);
                              setTimeout(() => handleSendQuery(), 100);
                            }}
                            className="block w-full text-left p-2 text-xs bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                          >
                            <ChevronRight className="w-3 h-3 inline mr-1 text-purple-600" />
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-lg text-sm",
                        msg.role === "user"
                          ? "bg-blue-600 text-white ml-8"
                          : "bg-slate-100 text-slate-900 mr-8"
                      )}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing data...
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-3 border-t border-slate-200">
                <div className="flex gap-2">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendQuery()}
                    placeholder="Ask about your data..."
                    className="text-sm"
                    disabled={loading}
                  />
                  <Button
                    onClick={handleSendQuery}
                    disabled={loading || !query.trim()}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="h-[calc(100vh-320px)] m-0">
              <ScrollArea className="h-full p-4">
                {!insights ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-blue-400 opacity-50" />
                    <p className="text-sm text-slate-600">Click "Insights" to generate analysis</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 gap-2">
                      {insights.kpis?.map((kpi, idx) => (
                        <Card key={idx} className="border-slate-200">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-600">{kpi.metric}</span>
                              {kpi.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                            </div>
                            <div className="text-lg font-bold text-slate-900">{kpi.value}</div>
                            <p className="text-xs text-slate-600 mt-1">{kpi.interpretation}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Insights */}
                    {insights.insights?.map((insight, idx) => (
                      <Card key={idx} className={cn(
                        "border-2",
                        insight.impact === 'high' && "border-red-200 bg-red-50",
                        insight.impact === 'medium' && "border-amber-200 bg-amber-50",
                        insight.impact === 'low' && "border-blue-200 bg-blue-50"
                      )}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="text-sm font-bold text-slate-900">{insight.title}</h5>
                            <Badge className={cn(
                              "text-xs",
                              insight.impact === 'high' && "bg-red-100 text-red-700",
                              insight.impact === 'medium' && "bg-amber-100 text-amber-700",
                              insight.impact === 'low' && "bg-blue-100 text-blue-700"
                            )}>
                              {insight.impact}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-700 mb-2">{insight.description}</p>
                          <div className="text-xs text-slate-900 font-semibold">
                            <Target className="w-3 h-3 inline mr-1" />
                            {insight.action}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Anomalies Tab */}
            <TabsContent value="anomalies" className="h-[calc(100vh-320px)] m-0">
              <ScrollArea className="h-full p-4">
                {!anomalies ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-400 opacity-50" />
                    <p className="text-sm text-slate-600">Click "Anomalies" to detect issues</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-700 mb-4">{anomalies.summary}</p>
                    {anomalies.anomalies?.map((anomaly, idx) => (
                      <Card key={idx} className={cn(
                        "border-2",
                        anomaly.severity === 'critical' && "border-red-300 bg-red-50",
                        anomaly.severity === 'high' && "border-orange-300 bg-orange-50",
                        anomaly.severity === 'medium' && "border-amber-300 bg-amber-50",
                        anomaly.severity === 'low' && "border-blue-300 bg-blue-50"
                      )}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="text-sm font-bold text-slate-900">{anomaly.type}</h5>
                            <Badge className={cn(
                              "text-xs",
                              anomaly.severity === 'critical' && "bg-red-600 text-white",
                              anomaly.severity === 'high' && "bg-orange-600 text-white",
                              anomaly.severity === 'medium' && "bg-amber-600 text-white",
                              anomaly.severity === 'low' && "bg-blue-600 text-white"
                            )}>
                              {anomaly.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-700 mb-2">{anomaly.description}</p>
                          <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                            <div>
                              <span className="text-slate-600">Expected: </span>
                              <span className="font-semibold text-slate-900">{anomaly.expectedValue}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Actual: </span>
                              <span className="font-semibold text-red-700">{anomaly.actualValue}</span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-700 mb-1">
                            <strong>Root Cause:</strong> {anomaly.rootCause}
                          </div>
                          <div className="text-xs text-emerald-700 font-semibold">
                            → {anomaly.recommendation}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="h-[calc(100vh-320px)] m-0">
              <ScrollArea className="h-full p-4">
                {!predictions ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-purple-400 opacity-50" />
                    <p className="text-sm text-slate-600">Click "Predict" to forecast trends</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Forecasts */}
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 mb-2">Forecasts (Next 30 Days)</h5>
                      <div className="space-y-2">
                        {predictions.forecasts?.map((forecast, idx) => (
                          <Card key={idx} className="border-slate-200">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-slate-900">{forecast.metric}</span>
                                <Badge className="bg-purple-100 text-purple-700 text-xs">
                                  {(forecast.confidence * 100).toFixed(0)}% confident
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-600">Current: {forecast.current}</span>
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                                <span className="text-purple-700 font-bold">Predicted: {forecast.predicted}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">{forecast.trend}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Risks */}
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 mb-2">Potential Risks</h5>
                      <div className="space-y-2">
                        {predictions.risks?.map((risk, idx) => (
                          <Card key={idx} className="border-red-200 bg-red-50">
                            <CardContent className="p-3">
                              <h6 className="text-xs font-bold text-slate-900 mb-1">{risk.risk}</h6>
                              <div className="flex items-center gap-2 text-xs mb-1">
                                <span className="text-slate-600">Probability: {risk.probability}</span>
                                <span className="text-slate-600">Impact: {risk.impact}</span>
                              </div>
                              <p className="text-xs text-emerald-700 font-semibold">
                                Mitigation: {risk.mitigation}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Opportunities */}
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 mb-2">Growth Opportunities</h5>
                      <div className="space-y-1">
                        {predictions.opportunities?.map((opp, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 p-2 bg-emerald-50 rounded border border-emerald-200">
                            <Sparkles className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>{opp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </>
      )}
    </motion.div>
  );
}