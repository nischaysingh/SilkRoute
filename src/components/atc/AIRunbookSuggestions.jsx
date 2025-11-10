import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, Brain, TrendingUp, AlertTriangle, Clock, Target,
  ArrowRight, Zap, CheckCircle, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AIRunbookSuggestions({ 
  requests = [], 
  incidents = [], 
  avgLatency = 0, 
  errorRate = 0,
  onExecuteRunbook 
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate AI analysis of telemetry data
    setAnalyzing(true);
    
    const analyzeTimer = setTimeout(() => {
      const newSuggestions = generateSuggestions();
      setSuggestions(newSuggestions);
      setAnalyzing(false);
    }, 2000);

    return () => clearTimeout(analyzeTimer);
  }, [requests.length, incidents.length, avgLatency, errorRate]);

  const generateSuggestions = () => {
    const suggestions = [];
    
    // Analyze latency
    if (avgLatency > 1000) {
      suggestions.push({
        id: 1,
        runbook: "Cost",
        title: "Optimize Model Routing",
        confidence: 92,
        reasoning: "High latency detected (842ms). Cost optimization can reduce response time by routing to faster models.",
        impact: {
          latency_reduction: "25%",
          cost_impact: "$0.45/hr savings"
        },
        triggers: ["High latency spike", "Model inference time elevated"],
        priority: "high"
      });
    }

    // Analyze error rate
    if (errorRate > 1.5) {
      suggestions.push({
        id: 2,
        runbook: "Clean",
        title: "Clean Orphaned Records",
        confidence: 88,
        reasoning: "Error rate at 1.8% with webhook validation failures. Data cleanup can reduce retry storms.",
        impact: {
          error_reduction: "40%",
          storage_freed: "450MB"
        },
        triggers: ["Webhook failures", "Orphaned data detected"],
        priority: "medium"
      });
    }

    // Analyze queue depth
    const queuedCount = requests.filter(r => r.state === 'queued').length;
    if (queuedCount > 5) {
      suggestions.push({
        id: 3,
        runbook: "Batch",
        title: "Batch Process Queue",
        confidence: 85,
        reasoning: `${queuedCount} requests queued. Batch processing can clear queue 60% faster with parallel execution.`,
        impact: {
          processing_speedup: "60%",
          requests_cleared: queuedCount
        },
        triggers: ["Queue depth elevated", "Similar intents detected"],
        priority: "medium"
      });
    }

    // Analyze incidents
    if (incidents.length > 0) {
      suggestions.push({
        id: 4,
        runbook: "AR",
        title: "Invoice Reconciliation",
        confidence: 90,
        reasoning: "Open incidents suggest payment processing delays. AR reconciliation can identify and resolve blocked transactions.",
        impact: {
          blocked_transactions: 8,
          revenue_at_risk: "$12,450"
        },
        triggers: ["Payment incidents", "Transaction failures"],
        priority: "high"
      });
    }

    // Always suggest tax if end of quarter
    const now = new Date();
    const month = now.getMonth();
    if ([2, 5, 8, 11].includes(month)) {
      suggestions.push({
        id: 5,
        runbook: "Tax",
        title: "Quarterly Tax Prep",
        confidence: 78,
        reasoning: "End of quarter approaching. Tax recalculation ensures compliance and identifies deductions.",
        impact: {
          records_to_review: 89,
          potential_savings: "$1,847"
        },
        triggers: ["Q4 approaching", "Tax filing deadline"],
        priority: "low"
      });
    }

    // Pricing optimization based on request patterns
    const vipRequests = requests.filter(r => r.vip).length;
    if (vipRequests > 2) {
      suggestions.push({
        id: 6,
        runbook: "Price",
        title: "Dynamic VIP Pricing",
        confidence: 81,
        reasoning: `${vipRequests} VIP requests detected. Price optimization can adjust priority scoring and resource allocation.`,
        impact: {
          vip_satisfaction: "+15%",
          resource_efficiency: "+8%"
        },
        triggers: ["VIP request volume", "Priority distribution"],
        priority: "low"
      });
    }

    return suggestions.slice(0, 3); // Return top 3
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "border-red-300 bg-red-50";
      case "medium": return "border-amber-300 bg-amber-50";
      case "low": return "border-blue-300 bg-blue-50";
      default: return "border-slate-300 bg-slate-50";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high": return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "medium": return <Clock className="w-4 h-4 text-amber-600" />;
      case "low": return <Target className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm rounded-lg">
      <CardHeader className="border-b border-slate-200 pb-3 px-4 pt-3">
        <CardTitle className="text-slate-900 text-sm flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
          AI Runbook Suggestions
          {analyzing && (
            <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
              Analyzing...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        {analyzing ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-slate-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <p className="text-xs text-slate-600">System running optimally</p>
            <p className="text-xs text-slate-500">No runbook suggestions at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {suggestions.map((suggestion, idx) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all hover:shadow-md",
                    getPriorityColor(suggestion.priority)
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(suggestion.priority)}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900">{suggestion.title}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge className="bg-purple-100 text-purple-800 text-[10px] py-0 h-4">
                            {suggestion.runbook}
                          </Badge>
                          <span className="text-[10px] text-slate-600 capitalize">{suggestion.priority} priority</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        <span className="text-xs font-bold text-purple-900">{suggestion.confidence}%</span>
                      </div>
                      <Progress value={suggestion.confidence} className="w-16 h-1" />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-700 mb-2 leading-tight">
                    {suggestion.reasoning}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {Object.entries(suggestion.impact).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span className="text-[10px] text-slate-700">
                          <strong>{key.replace(/_/g, ' ')}:</strong> {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {suggestion.triggers.map((trigger, i) => (
                      <Badge key={i} className="bg-slate-100 text-slate-700 text-[9px] py-0 h-4">
                        {trigger}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => onExecuteRunbook?.(suggestion.runbook)}
                    className="w-full h-6 text-[10px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    Execute {suggestion.runbook} Runbook
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}