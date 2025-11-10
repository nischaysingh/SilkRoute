
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Sparkles, Clock, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceDot } from "recharts";
import { toast } from "sonner";

export default function MissionPulse2({ missions, onExplainSpike }) {
  const [timeRange, setTimeRange] = useState("24h");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedMission1, setSelectedMission1] = useState(null);
  const [selectedMission2, setSelectedMission2] = useState(null);
  const [spikeDetailsOpen, setSpikeDetailsOpen] = useState(false);
  const [selectedSpike, setSelectedSpike] = useState(null);
  const [showPredictive, setShowPredictive] = useState(true);

  // Generate mock data based on time range
  const getDataPoints = () => {
    switch (timeRange) {
      case "1h": return 12;
      case "6h": return 36;
      case "24h": return 48;
      case "7d": return 84;
      default: return 48;
    }
  };

  const generateData = () => {
    const points = getDataPoints();
    return Array.from({ length: points }, (_, i) => ({
      time: i,
      tokens: 800 + Math.random() * 300,
      latency: 700 + Math.random() * 400,
      success: 85 + Math.random() * 15,
      spend: (0.02 + Math.random() * 0.015) * 100 // Scale spend for visibility
    }));
  };

  const data = generateData();

  // Generate predictive data (next 24 points)
  const generatePredictiveData = () => {
    const points = Math.floor(getDataPoints() / 2); // Roughly half of the historical points for prediction
    const currentData = data[data.length - 1]; // Use the last actual data point as a base
    if (!currentData) return []; // Handle case where data might be empty

    return Array.from({ length: points }, (_, i) => ({
      time: data.length + i,
      tokensPredict: currentData.tokens + (Math.random() - 0.5) * 50,
      latencyPredict: currentData.latency + (Math.random() - 0.5) * 80,
      successPredict: Math.min(100, currentData.success + (Math.random() - 0.3) * 3),
      spendPredict: currentData.spend + (Math.random() - 0.5) * 0.5
    }));
  };

  const predictiveData = showPredictive ? generatePredictiveData() : [];
  const combinedData = [...data, ...predictiveData];

  // Detect spikes
  const spikes = [
    { time: 12, type: "tokens", value: 1200, reason: "Large payload batch processing" },
    { time: 28, type: "latency", value: 1450, reason: "External API timeout" },
    { time: 35, type: "spend", value: 4.5, reason: "Model switch to gpt-4o" }
  ];

  const handleSpikeClick = (spike) => {
    setSelectedSpike(spike);
    setSpikeDetailsOpen(true);
    onExplainSpike?.(spike);
  };

  // Calculate predictions
  const predictions = {
    success: 96.4,
    successDelta: +1.8,
    spend: -0.004,
    avgLatency: 795
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">Mission Pulse 3.0</h4>
              <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
                Predictive
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-24 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="6h">6 Hours</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant={showPredictive ? "default" : "outline"}
                onClick={() => setShowPredictive(!showPredictive)}
                className={cn(
                  "h-7 text-xs",
                  showPredictive ? "bg-purple-600 hover:bg-purple-700" : "bg-white border-slate-200"
                )}
              >
                Forecast
              </Button>
              <Button
                size="sm"
                variant={compareMode ? "default" : "outline"}
                onClick={() => setCompareMode(!compareMode)}
                className="h-7 text-xs"
              >
                Compare
              </Button>
            </div>
          </div>

          {/* Predictive Summary */}
          {showPredictive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-3 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-900">Next 24h Forecast:</span>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-600">Success:</span>
                    <span className="font-bold text-emerald-700">{predictions.success}%</span>
                    <span className="text-emerald-600">(+{predictions.successDelta}%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-600">Spend:</span>
                    <span className="font-bold text-emerald-700">{predictions.spend.toFixed(3)}/run</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-600">Latency:</span>
                    <span className="font-bold text-blue-700">{predictions.avgLatency}ms</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mb-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-purple-600 rounded" />
              <span className="text-slate-600">🟣 Tokens</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-amber-600 rounded" />
              <span className="text-slate-600">🟠 Latency</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-emerald-600 rounded" />
              <span className="text-slate-600">🟢 Success</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-blue-600 rounded" />
              <span className="text-slate-600">🟡 Spend</span>
            </div>
            {showPredictive && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-slate-400 rounded" style={{ borderBottom: "1px dashed #64748b" }} /> {/* Changed to dashed line style */}
                <span className="text-slate-600">⚪ Predicted</span>
              </div>
            )}
          </div>

          {/* Stacked Multi-Metric Chart */}
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }}
                label={{ value: timeRange, position: "insideBottomRight", fontSize: 10, fill: "#64748b" }}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgb(226, 232, 240)',
                  borderRadius: '8px',
                  fontSize: '11px'
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const isPredict = payload[0].payload.tokensPredict !== undefined || payload[0].name.includes("(Predicted)"); // Check if any predictive key exists or name indicates prediction
                    return (
                      <div className="bg-white/95 border border-slate-200 rounded-lg p-2 text-xs">
                        <div className="font-semibold mb-1">
                          {isPredict ? "Predicted" : "Actual"}
                        </div>
                        {payload.map((entry, idx) => (
                          // Filter out null or undefined values which appear if a dataKey is not present in all objects
                          entry.value !== null && entry.value !== undefined && (
                            <div key={idx} className="flex items-center justify-between gap-2">
                              <span style={{ color: entry.color }}>{entry.name.replace(' (Predicted)', '')}:</span>
                              <span className="font-semibold">{entry.value?.toFixed(1)}</span>
                            </div>
                          )
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              
              {/* Actual lines */}
              <Line 
                type="monotone" 
                dataKey="tokens" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={false}
                name="Tokens"
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="latency" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={false}
                name="Latency (ms)"
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="success" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
                name="Success %"
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="spend" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                name="Spend (¢)"
                connectNulls
              />

              {/* Predictive lines (dotted) */}
              {showPredictive && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="tokensPredict" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Tokens (Predicted)"
                    connectNulls
                  />
                  <Line 
                    type="monotone" 
                    dataKey="latencyPredict" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Latency (Predicted)"
                    connectNulls
                  />
                  <Line 
                    type="monotone" 
                    dataKey="successPredict" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Success (Predicted)"
                    connectNulls
                  />
                  <Line 
                    type="monotone" 
                    dataKey="spendPredict" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Spend (Predicted)"
                    connectNulls
                  />
                </>
              )}

              {/* Spike Markers */}
              {spikes.map((spike, idx) => (
                <ReferenceDot
                  key={idx}
                  x={spike.time}
                  y={spike.type === "tokens" ? spike.value :
                     spike.type === "latency" ? spike.value :
                     spike.type === "spend" ? spike.value : 0}
                  r={6}
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSpikeClick(spike)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Spike Indicators */}
          {spikes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2"
            >
              <AlertCircle className="w-3 h-3 text-red-600" />
              <span className="text-xs text-slate-700">
                {spikes.length} spike{spikes.length > 1 ? 's' : ''} detected (click markers for details)
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSpikeClick(spikes[0])}
                className="h-6 text-xs text-red-600 hover:bg-red-50 ml-auto"
              >
                Explain Spikes
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Spike Details Drawer */}
      <Sheet open={spikeDetailsOpen} onOpenChange={setSpikeDetailsOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-600" />
              Spike Analysis
            </SheetTitle>
          </SheetHeader>

          {selectedSpike && (
            <div className="mt-6 space-y-4">
              {/* What Happened */}
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-red-900 mb-2">What Happened</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    A {selectedSpike.type} spike of {selectedSpike.value} was detected at time point {selectedSpike.time}.
                    This is {((selectedSpike.value / (selectedSpike.type === "tokens" ? 900 : selectedSpike.type === "latency" ? 900 : 2.5) - 1) * 100).toFixed(0)}% above baseline.
                  </p>
                </CardContent>
              </Card>

              {/* Root Cause */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-blue-900 mb-2">Root Cause</h4>
                  <ul className="space-y-1 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-600 mt-1.5" />
                      <span>{selectedSpike.reason}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-600 mt-1.5" />
                      <span>Affected 1 mission: invoice_chase_v1</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-600 mt-1.5" />
                      <span>Duration: ~5 minutes</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Suggested Fix */}
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-emerald-900 mb-3">Suggested Fix</h4>
                  <div className="space-y-2">
                    {[
                      { action: "Enable request throttling", impact: "-30% spike frequency" },
                      { action: "Add circuit breaker", impact: "+95% reliability" },
                      { action: "Increase retry timeout", impact: "-180ms avg latency" }
                    ].map((fix, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="w-full justify-between text-xs bg-white hover:bg-emerald-50 border-emerald-300"
                        onClick={() => {
                          toast.success(`Applied: ${fix.action}`);
                          setSpikeDetailsOpen(false);
                        }}
                      >
                        <span>{fix.action}</span>
                        <span className="text-emerald-700">{fix.impact}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
