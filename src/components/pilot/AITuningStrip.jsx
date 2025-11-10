import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TrendingUp, Lock, Unlock, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function AITuningStrip({ mission, onLockConfiguration }) {
  const [autoTuneEnabled, setAutoTuneEnabled] = useState(true);

  // Mock tuning history
  const tuningHistory = Array.from({ length: 20 }, (_, i) => ({
    run: i + 1,
    success: 85 + Math.random() * 15
  }));

  // Mock configurations leaderboard
  const configurations = [
    { 
      name: "Pilot v2.4 + Balanced Profile", 
      improvement: 7.8, 
      metrics: { latency: 802, cost: 0.0205, success: 96.5 },
      isWinner: true
    },
    { 
      name: "Pilot v2.3 + High-Accuracy", 
      improvement: 5.2, 
      metrics: { latency: 780, cost: 0.0285, success: 97.2 },
      isWinner: false
    },
    { 
      name: "Pilot v2.2 + Cost-Save", 
      improvement: 3.1, 
      metrics: { latency: 890, cost: 0.0165, success: 94.8 },
      isWinner: false
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h5 className="text-sm font-bold text-purple-900">AI Tuning</h5>
            <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
              Continuous Optimization
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor={`autotune-${mission.id}`} className="text-xs text-slate-700 cursor-pointer">
              Auto-tune
            </Label>
            <Switch
              id={`autotune-${mission.id}`}
              checked={autoTuneEnabled}
              onCheckedChange={setAutoTuneEnabled}
              className="scale-75"
            />
          </div>
        </div>

        {/* Performance Chart */}
        <ResponsiveContainer width="100%" height={60}>
          <LineChart data={tuningHistory}>
            <XAxis dataKey="run" tick={{ fontSize: 8 }} />
            <YAxis domain={[80, 100]} tick={{ fontSize: 8 }} />
            <Tooltip 
              contentStyle={{ fontSize: 10 }}
              formatter={(value) => [`${value.toFixed(1)}%`, 'Success']}
            />
            <Line 
              type="monotone" 
              dataKey="success" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Configuration Leaderboard */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-3 h-3 text-amber-600" />
            <h6 className="text-xs font-semibold text-slate-900">Configuration Leaderboard</h6>
          </div>
          
          {configurations.map((config, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "p-2 rounded-lg border relative",
                config.isWinner 
                  ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300" 
                  : "bg-white border-slate-200"
              )}
            >
              {config.isWinner && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-amber-400 opacity-10"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {config.isWinner && <Trophy className="w-3 h-3 text-amber-600" />}
                    <span className="text-xs font-semibold text-slate-900">
                      {config.name}
                    </span>
                  </div>
                  <Badge className={cn(
                    "text-[9px] py-0",
                    config.isWinner 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-blue-100 text-blue-700"
                  )}>
                    +{config.improvement}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="text-center">
                    <div className="text-slate-600">Latency</div>
                    <div className="font-semibold text-slate-900">{config.metrics.latency}ms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-600">Cost</div>
                    <div className="font-semibold text-slate-900">${config.metrics.cost.toFixed(4)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-600">Success</div>
                    <div className="font-semibold text-slate-900">{config.metrics.success}%</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lock/Continue Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setAutoTuneEnabled(false);
              onLockConfiguration?.(configurations[0]);
            }}
            className="h-7 text-xs"
          >
            <Lock className="w-3 h-3 mr-1" />
            Lock Winner
          </Button>
          <Button
            size="sm"
            onClick={() => setAutoTuneEnabled(true)}
            disabled={autoTuneEnabled}
            className={cn(
              "h-7 text-xs",
              autoTuneEnabled 
                ? "bg-purple-600 hover:bg-purple-700" 
                : "bg-purple-600/50"
            )}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Keep Tuning
          </Button>
        </div>

        {autoTuneEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-2 rounded-lg bg-purple-100 border border-purple-200 flex items-center gap-2 text-[10px] text-purple-900"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-3 h-3" />
            </motion.div>
            <span>AI continuously experimenting with configurations...</span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}