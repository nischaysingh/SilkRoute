import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Zap, Shield, DollarSign, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export default function OperationalIntelligenceIndex({ score }) {
  const [activeTab, setActiveTab] = useState("efficiency");

  // Generate sparkline data
  const generateSparkline = () => Array.from({ length: 20 }, () => ({ 
    value: 70 + Math.random() * 30 
  }));

  const metrics = {
    efficiency: {
      score: 94,
      change: +5.3,
      lastWeek: 88.7,
      icon: Zap,
      color: "emerald",
      details: [
        { label: "Avg Response Time", value: "782ms", trend: -12, target: 800 },
        { label: "Token Efficiency", value: "92%", trend: +3, target: 90 },
        { label: "Cache Hit Rate", value: "87%", trend: +8, target: 85 }
      ],
      sparkline: generateSparkline()
    },
    reliability: {
      score: 96,
      change: -0.8,
      lastWeek: 96.8,
      icon: Shield,
      color: "blue",
      details: [
        { label: "Success Rate", value: "96.4%", trend: +1, target: 95 },
        { label: "Error Rate", value: "1.2%", trend: -0.5, target: 2 },
        { label: "Uptime", value: "99.8%", trend: 0, target: 99 }
      ],
      sparkline: generateSparkline()
    },
    scalability: {
      score: 89,
      change: +2.1,
      lastWeek: 86.9,
      icon: Activity,
      color: "purple",
      details: [
        { label: "Peak Throughput", value: "245 req/min", trend: +15, target: 200 },
        { label: "Concurrency Used", value: "14/16", trend: +2, target: 16 },
        { label: "Queue Time", value: "45ms", trend: -8, target: 50 }
      ],
      sparkline: generateSparkline()
    },
    spendDiscipline: {
      score: 91,
      change: -12,
      lastWeek: 103,
      icon: DollarSign,
      color: "amber",
      details: [
        { label: "Cost per Run", value: "$0.021", trend: -18, target: 0.025 },
        { label: "Budget Used", value: "78%", trend: +5, target: 80 },
        { label: "Waste Detected", value: "2.3%", trend: -1.2, target: 3 }
      ],
      sparkline: generateSparkline()
    }
  };

  const currentMetric = metrics[activeTab];
  const Icon = currentMetric.icon;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-900">Operational Intelligence</h4>
            <TabsList className="bg-slate-100 h-7">
              <TabsTrigger value="efficiency" className="text-xs h-6 px-2">
                <Zap className="w-3 h-3 mr-1" />
                Efficiency
              </TabsTrigger>
              <TabsTrigger value="reliability" className="text-xs h-6 px-2">
                <Shield className="w-3 h-3 mr-1" />
                Reliability
              </TabsTrigger>
              <TabsTrigger value="scalability" className="text-xs h-6 px-2">
                <Activity className="w-3 h-3 mr-1" />
                Scalability
              </TabsTrigger>
              <TabsTrigger value="spendDiscipline" className="text-xs h-6 px-2">
                <DollarSign className="w-3 h-3 mr-1" />
                Spend
              </TabsTrigger>
            </TabsList>
          </div>

          {Object.keys(metrics).map((key) => (
            <TabsContent key={key} value={key} className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Score Gauge */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn(
                    "relative w-24 h-24 rounded-full flex items-center justify-center",
                    currentMetric.color === "emerald" && "bg-emerald-100",
                    currentMetric.color === "blue" && "bg-blue-100",
                    currentMetric.color === "purple" && "bg-purple-100",
                    currentMetric.color === "amber" && "bg-amber-100"
                  )}>
                    <div className="text-center">
                      <div className={cn(
                        "text-2xl font-bold",
                        currentMetric.color === "emerald" && "text-emerald-700",
                        currentMetric.color === "blue" && "text-blue-700",
                        currentMetric.color === "purple" && "text-purple-700",
                        currentMetric.color === "amber" && "text-amber-700"
                      )}>
                        {currentMetric.score}
                      </div>
                      <div className="text-[10px] text-slate-600">/ 100</div>
                    </div>
                    <Icon className={cn(
                      "absolute top-2 right-2 w-4 h-4",
                      currentMetric.color === "emerald" && "text-emerald-600",
                      currentMetric.color === "blue" && "text-blue-600",
                      currentMetric.color === "purple" && "text-purple-600",
                      currentMetric.color === "amber" && "text-amber-600"
                    )} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn(
                        "text-[9px] py-0",
                        currentMetric.change >= 0 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-red-100 text-red-700"
                      )}>
                        {currentMetric.change >= 0 ? <TrendingUp className="w-2 h-2 mr-0.5" /> : <TrendingDown className="w-2 h-2 mr-0.5" />}
                        {currentMetric.change >= 0 ? '+' : ''}{currentMetric.change}%
                      </Badge>
                      <span className="text-xs text-slate-600">vs last week</span>
                    </div>
                    <div className="text-xs text-slate-600 mb-2">
                      Last Week: <span className="font-semibold text-slate-900">{currentMetric.lastWeek}</span>
                    </div>
                    <ResponsiveContainer width="100%" height={40}>
                      <LineChart data={currentMetric.sparkline}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={
                            currentMetric.color === "emerald" ? "#10b981" :
                            currentMetric.color === "blue" ? "#3b82f6" :
                            currentMetric.color === "purple" ? "#8b5cf6" : "#f59e0b"
                          }
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="space-y-2">
                  {currentMetric.details.map((detail, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-700">{detail.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{detail.value}</span>
                          <Badge className={cn(
                            "text-[9px] py-0",
                            detail.trend >= 0 && detail.label.includes("Rate") ? "bg-emerald-100 text-emerald-700" :
                            detail.trend < 0 && (detail.label.includes("Error") || detail.label.includes("Cost") || detail.label.includes("Time")) ? "bg-emerald-100 text-emerald-700" :
                            detail.trend > 0 && (detail.label.includes("Error") || detail.label.includes("Cost")) ? "bg-red-100 text-red-700" :
                            detail.trend === 0 ? "bg-slate-100 text-slate-700" :
                            "bg-emerald-100 text-emerald-700"
                          )}>
                            {detail.trend > 0 ? '+' : ''}{detail.trend}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={
                            detail.label.includes("Rate") || detail.label.includes("Used") || detail.label.includes("Uptime")
                              ? parseFloat(detail.value) 
                              : (parseFloat(detail.value.replace(/[^0-9.]/g, '')) / detail.target) * 100
                          } 
                          className="h-1 flex-1" 
                        />
                        <span className="text-[10px] text-slate-500">
                          Target: {detail.target}{detail.label.includes("Rate") || detail.label.includes("Uptime") || detail.label.includes("Used") || detail.label.includes("Waste") ? '%' : detail.label.includes("Cost") ? '' : ''}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}