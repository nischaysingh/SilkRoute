import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, AlertTriangle, Lightbulb, Eye, Pin, 
  Clock, CheckCircle, PauseCircle, Activity 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ContextCard({ card, onClick, onExplainThis, onActionClick, isSelected }) {
  const getStateIcon = () => {
    switch (card.state) {
      case "running": return <Activity className="w-4 h-4 text-emerald-600" />;
      case "paused": return <PauseCircle className="w-4 h-4 text-amber-600" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default: return <CheckCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStateColor = () => {
    switch (card.state) {
      case "running": return "border-emerald-300 bg-emerald-50";
      case "paused": return "border-amber-300 bg-amber-50";
      case "warning": return "border-amber-300 bg-amber-50";
      default: return "border-blue-300 bg-blue-50";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "bg-white/80 backdrop-blur-sm border-2 shadow-sm hover:shadow-lg transition-all cursor-pointer",
          isSelected ? "border-purple-500 bg-purple-50/50" : "border-slate-200",
          getStateColor()
        )}
        onClick={() => onClick?.(card)}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStateIcon()}
              <div>
                <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                <p className="text-xs text-slate-600">{card.summary}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onExplainThis?.(card, null);
                }}
              >
                <Eye className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <Pin className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {Object.entries(card.metrics).map(([key, value]) => (
              <div
                key={key}
                className="p-2 rounded bg-white border border-slate-200 cursor-pointer hover:border-purple-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onExplainThis?.(card, { key, value });
                }}
              >
                <div className="text-xs text-slate-600">{key}</div>
                <div className="text-sm font-bold text-slate-900">{value}</div>
              </div>
            ))}
          </div>

          {/* Risks */}
          {card.risks.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span className="text-xs font-semibold text-slate-900">Risks</span>
              </div>
              <div className="space-y-1">
                {card.risks.map((risk, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "text-xs p-2 rounded border",
                      risk.level === "high" && "bg-red-50 border-red-200 text-red-800",
                      risk.level === "medium" && "bg-amber-50 border-amber-200 text-amber-800",
                      risk.level === "low" && "bg-blue-50 border-blue-200 text-blue-800"
                    )}
                  >
                    {risk.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Best Actions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-3 h-3 text-purple-600" />
              <span className="text-xs font-semibold text-slate-900">Next Best Actions</span>
            </div>
            <div className="space-y-2">
              {card.nextActions.map((action, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="outline"
                  className="w-full justify-between text-xs h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onActionClick?.(action);
                  }}
                >
                  <span>{action.label}</span>
                  <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
                    {action.confidence}% conf
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Context Thread Indicator */}
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>3 related events in last 24h</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-5 text-xs text-purple-600 hover:text-purple-700"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                View Thread →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}