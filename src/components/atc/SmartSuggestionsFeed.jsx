
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, TrendingDown, Zap, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SmartSuggestionsFeed({ suggestions = [], onApply }) {
  const defaultSuggestions = [
    {
      id: 1,
      title: "Reroute low-priority requests to Autopilot",
      description: "12 queued Low priority requests can be safely handled by Autopilot, saving ~$0.45/hr",
      confidence: 94,
      action: "reroute_low_priority",
      impact: { cost: -0.45, latency: +50 },
      icon: TrendingDown,
      color: "emerald"
    },
    {
      id: 2,
      title: "Switch to Cost-Save profile",
      description: "Current spend rate is 67% below budget. Optimize for cost without impacting SLA.",
      confidence: 87,
      action: "switch_profile_cost_save",
      impact: { cost: -1.20, latency: +120 },
      icon: Sparkles,
      color: "purple"
    },
    {
      id: 3,
      title: "Enable throttling for webhook source",
      description: "Webhook volume spiked 340% in last hour. Throttling can prevent downstream cascades.",
      confidence: 91,
      action: "throttle_webhook",
      impact: { cost: 0, latency: -80 },
      icon: Zap,
      color: "amber"
    },
    {
      id: 4,
      title: "Batch process 8 reconciliation tasks",
      description: "Daily reconciliations can be batched at 11 PM for 35% cost savings.",
      confidence: 78,
      action: "batch_reconciliation",
      impact: { cost: -0.28, latency: 0 },
      icon: RefreshCw,
      color: "blue"
    }
  ];

  const activeSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm rounded-lg">
      <CardHeader className="border-b border-slate-200 pb-1.5 px-3 pt-2">
        <CardTitle className="text-slate-900 text-xs flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-purple-600" />
          Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {activeSuggestions.slice(0, 3).map((suggestion) => (
            <div
              key={suggestion.id}
              className={cn(
                "p-2 rounded-lg border transition-all hover:shadow-sm",
                `border-${suggestion.color}-200 bg-${suggestion.color}-50/50`
              )}
            >
              <div className="flex items-start gap-2">
                <div className={cn(
                  "p-1 rounded flex-shrink-0",
                  `bg-${suggestion.color}-100`
                )}>
                  <suggestion.icon className={cn("w-3 h-3", `text-${suggestion.color}-700`)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-0.5">
                    <h4 className="text-[10px] font-semibold text-slate-900 leading-tight">{suggestion.title}</h4>
                    <Badge className={cn(
                      "text-[9px] ml-1 flex-shrink-0 py-0 h-3.5",
                      suggestion.confidence >= 90 ? "bg-emerald-100 text-emerald-700 border-emerald-300" :
                      suggestion.confidence >= 80 ? "bg-blue-100 text-blue-700 border-blue-300" :
                      "bg-slate-200 text-slate-700"
                    )}>
                      {suggestion.confidence}%
                    </Badge>
                  </div>
                  <p className="text-[9px] text-slate-700 mb-1.5 leading-tight">{suggestion.description}</p>
                  
                  <div className="flex items-center gap-2 mb-1.5">
                    {suggestion.impact.cost !== 0 && (
                      <div className="flex items-center gap-0.5 text-[9px]">
                        <span className="text-slate-600">$</span>
                        <span className={cn(
                          "font-mono font-semibold",
                          suggestion.impact.cost < 0 ? "text-emerald-700" : "text-red-700"
                        )}>
                          {suggestion.impact.cost < 0 ? '' : '+'}{suggestion.impact.cost.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {suggestion.impact.latency !== 0 && (
                      <div className="flex items-center gap-0.5 text-[9px]">
                        <Clock className="w-2 h-2" />
                        <span className={cn(
                          "font-mono font-semibold",
                          suggestion.impact.latency < 0 ? "text-emerald-700" : "text-amber-700"
                        )}>
                          {suggestion.impact.latency < 0 ? '' : '+'}{suggestion.impact.latency}ms
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => onApply?.(suggestion)}
                    className={cn(
                      "w-full h-5 text-[9px] text-white",
                      suggestion.color === "emerald" && "bg-emerald-600 hover:bg-emerald-700",
                      suggestion.color === "purple" && "bg-purple-600 hover:bg-purple-700",
                      suggestion.color === "amber" && "bg-amber-600 hover:bg-amber-700",
                      suggestion.color === "blue" && "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    <CheckCircle className="w-2 h-2 mr-0.5" />
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
