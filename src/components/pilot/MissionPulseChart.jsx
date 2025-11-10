import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Activity, TrendingUp, Clock, Zap, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function MissionPulseChart({ missions }) {
  const [selectedSpike, setSelectedSpike] = useState(null);
  const [contextDrawerOpen, setContextDrawerOpen] = useState(false);

  // Generate pulse data
  const pulseData = Array.from({ length: 24 }, (_, i) => {
    const tokens = 8000 + Math.random() * 4000;
    const successRate = 85 + Math.random() * 12;
    const latency = 700 + Math.random() * 400;
    
    // Create some spikes
    const isSpike = i === 8 || i === 16;
    
    return {
      time: i,
      tokens: isSpike ? tokens * 1.4 : tokens,
      successRate: isSpike ? successRate - 15 : successRate,
      latency: isSpike ? latency * 1.6 : latency,
      isSpike
    };
  });

  const spikes = pulseData.filter(d => d.isSpike);

  const handleSpikeClick = (spike) => {
    setSelectedSpike(spike);
    setContextDrawerOpen(true);
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardHeader className="border-b border-slate-200 pb-3">
          <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Mission Pulse — Last 24 Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Tokens Chart */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">Token Usage</span>
                <Badge className="bg-purple-100 text-purple-700 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  {Math.round(pulseData.reduce((sum, d) => sum + d.tokens, 0) / pulseData.length)} avg
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={pulseData} onClick={(e) => {
                  if (e?.activePayload?.[0]?.payload?.isSpike) {
                    handleSpikeClick(e.activePayload[0].payload);
                  }
                }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={false}
                  />
                  {spikes.map((spike, idx) => (
                    <ReferenceDot
                      key={idx}
                      x={spike.time}
                      y={spike.tokens}
                      r={6}
                      fill="#ef4444"
                      stroke="#fff"
                      strokeWidth={2}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Success Rate Chart */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">Success Rate</span>
                <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {Math.round(pulseData.reduce((sum, d) => sum + d.successRate, 0) / pulseData.length)}% avg
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={pulseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} domain={[70, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Latency Chart */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">Latency</span>
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {Math.round(pulseData.reduce((sum, d) => sum + d.latency, 0) / pulseData.length)}ms avg
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={pulseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Drawer */}
      <Sheet open={contextDrawerOpen} onOpenChange={setContextDrawerOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              What Happened Here?
            </SheetTitle>
          </SheetHeader>

          {selectedSpike && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <h4 className="text-sm font-semibold text-purple-900 mb-2">AI Analysis</h4>
                <p className="text-xs text-slate-700 leading-relaxed mb-3">
                  At hour {selectedSpike.time}, token usage spiked by 40% due to increased batch processing.
                  Success rate dropped to {selectedSpike.successRate.toFixed(1)}% due to rate limiting.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Token Spike:</span>
                    <span className="font-bold text-red-600">+{((selectedSpike.tokens / 8000 - 1) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Success Drop:</span>
                    <span className="font-bold text-red-600">-{(100 - selectedSpike.successRate).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Latency Increase:</span>
                    <span className="font-bold text-amber-600">+{((selectedSpike.latency / 700 - 1) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="text-sm font-semibold text-amber-900 mb-2">Root Cause</h4>
                <ul className="space-y-1 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 flex-shrink-0">•</span>
                    <span>Webhook burst triggered batch processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 flex-shrink-0">•</span>
                    <span>Rate limit hit on external API</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 flex-shrink-0">•</span>
                    <span>Retry depth increased to 3</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="text-sm font-semibold text-emerald-900 mb-2">Recommended Actions</h4>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    className="w-full justify-start text-xs bg-white hover:bg-emerald-50 border border-emerald-200 text-slate-900"
                  >
                    Enable request throttling
                  </Button>
                  <Button
                    size="sm"
                    className="w-full justify-start text-xs bg-white hover:bg-emerald-50 border border-emerald-200 text-slate-900"
                  >
                    Reduce retry depth to 2
                  </Button>
                  <Button
                    size="sm"
                    className="w-full justify-start text-xs bg-white hover:bg-emerald-50 border border-emerald-200 text-slate-900"
                  >
                    Add circuit breaker
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}