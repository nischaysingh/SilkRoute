import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Brain, FileText, DollarSign, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MicroTrendCard = ({ label, value, trend, icon: Icon, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className={cn(
      "p-3 rounded-lg border-2 relative overflow-hidden",
      color === "emerald" && "border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100",
      color === "red" && "border-red-300 bg-gradient-to-br from-red-50 to-red-100",
      color === "blue" && "border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100",
      color === "amber" && "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100"
    )}
  >
    {/* Glow effect */}
    <div className={cn(
      "absolute inset-0 opacity-30 blur-xl",
      color === "emerald" && "bg-emerald-400",
      color === "red" && "bg-red-400",
      color === "blue" && "bg-blue-400",
      color === "amber" && "bg-amber-400"
    )} />
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2">
        <Icon className={cn(
          "w-4 h-4",
          color === "emerald" && "text-emerald-700",
          color === "red" && "text-red-700",
          color === "blue" && "text-blue-700",
          color === "amber" && "text-amber-700"
        )} />
        {trend > 0 ? (
          <TrendingUp className={cn(
            "w-4 h-4",
            color === "emerald" && "text-emerald-600",
            color === "red" && "text-red-600"
          )} />
        ) : (
          <TrendingDown className={cn(
            "w-4 h-4",
            color === "emerald" && "text-emerald-600",
            color === "blue" && "text-blue-600"
          )} />
        )}
      </div>
      <div className={cn(
        "text-2xl font-bold mb-1",
        color === "emerald" && "text-emerald-900",
        color === "red" && "text-red-900",
        color === "blue" && "text-blue-900",
        color === "amber" && "text-amber-900"
      )}>
        {trend > 0 ? '+' : ''}{value}
      </div>
      <div className="text-xs text-slate-700 font-medium">{label}</div>
    </div>
  </motion.div>
);

export default function AILearningPanel({ mission, onGenerateReport }) {
  const insights = [
    {
      id: 1,
      message: "Success improved +4.3% after latency rule change",
      timestamp: "2 days ago",
      type: "success"
    },
    {
      id: 2,
      message: "3 policies auto-relaxed → cost reduced $0.012/run",
      timestamp: "4 days ago",
      type: "optimization"
    },
    {
      id: 3,
      message: "Model switched to gpt-4o-mini → -18% cost, -2% accuracy",
      timestamp: "6 days ago",
      type: "model_change"
    }
  ];

  const trends = [
    { label: "Success", value: "4.3%", trend: 1, icon: TrendingUp, color: "emerald" },
    { label: "Cost", value: "0.012", trend: -1, icon: DollarSign, color: "emerald" },
    { label: "Latency", value: "180ms", trend: -1, icon: Clock, color: "blue" },
    { label: "Policy Hits", value: "8", trend: 1, icon: Shield, color: "amber" }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          background: [
            "linear-gradient(45deg, #3b82f6 0%, #8b5cf6 100%)",
            "linear-gradient(45deg, #8b5cf6 0%, #ec4899 100%)",
            "linear-gradient(45deg, #3b82f6 0%, #8b5cf6 100%)"
          ]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <CardContent className="p-4 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-5 h-5 text-purple-600" />
            </motion.div>
            <h4 className="text-sm font-bold text-slate-900">AI Learning Loop (Last 7 Days)</h4>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onGenerateReport}
            className="h-7 text-xs border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700"
          >
            <FileText className="w-3 h-3 mr-1" />
            Generate Insight Report
          </Button>
        </div>

        {/* Micro Trend Cards */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {trends.map((trend, idx) => (
            <MicroTrendCard key={idx} {...trend} />
          ))}
        </div>

        {/* Learning Insights Feed */}
        <div className="space-y-2">
          {insights.map((insight, idx) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "flex items-start gap-2 p-2 rounded-lg border",
                insight.type === "success" && "bg-emerald-50 border-emerald-200",
                insight.type === "optimization" && "bg-blue-50 border-blue-200",
                insight.type === "model_change" && "bg-purple-50 border-purple-200"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                insight.type === "success" && "bg-emerald-500 animate-pulse",
                insight.type === "optimization" && "bg-blue-500 animate-pulse",
                insight.type === "model_change" && "bg-purple-500 animate-pulse"
              )} />
              <div className="flex-1">
                <p className="text-xs text-slate-900 font-medium leading-relaxed">
                  {insight.message}
                </p>
                <span className="text-[10px] text-slate-600">{insight.timestamp}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}