import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  Zap, CheckCircle, XCircle, AlertTriangle, TrendingUp, TrendingDown,
  Activity, Clock, Target, Brain, Loader2, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ProactiveMitigationEngine({ 
  anomalies, 
  onApplyMitigation,
  onReject,
  learningEnabled = true 
}) {
  const [autoMitigateEnabled, setAutoMitigateEnabled] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [mitigationDrawerOpen, setMitigationDrawerOpen] = useState(false);
  const [executingMitigation, setExecutingMitigation] = useState(false);
  const [mitigationHistory, setMitigationHistory] = useState([
    {
      id: 1,
      anomaly: "Model latency spike",
      strategy: "Reroute to faster model",
      timestamp: "2024-12-20 10:23 AM",
      success: true,
      metrics: {
        latencyReduction: 180,
        costImpact: 0.003,
        successRate: 98
      }
    },
    {
      id: 2,
      anomaly: "API rate limit approaching",
      strategy: "Enable request throttling",
      timestamp: "2024-12-19 3:45 PM",
      success: true,
      metrics: {
        errorReduction: 95,
        costImpact: 0,
        successRate: 100
      }
    },
    {
      id: 3,
      anomaly: "Token usage spike",
      strategy: "Switch to cost-save profile",
      timestamp: "2024-12-18 11:12 AM",
      success: false,
      metrics: {
        accuracyDrop: 8,
        costImpact: -0.012,
        successRate: 87
      }
    }
  ]);

  // AI-generated mitigation strategies
  const generateMitigationStrategies = (anomaly) => {
    const strategies = {
      "retry_storm": [
        {
          id: 1,
          name: "Enable Circuit Breaker",
          description: "Temporarily halt requests to failing API and retry with exponential backoff",
          confidence: 94,
          estimatedImpact: {
            errorReduction: 85,
            latencyImprovement: -120,
            costChange: 0
          },
          risk: "low",
          learningSource: "3 successful past applications",
          steps: [
            "Activate circuit breaker for target API",
            "Set retry delay to 2s exponential backoff",
            "Monitor for 5 minutes",
            "Auto-resume if success rate > 95%"
          ]
        },
        {
          id: 2,
          name: "Reroute to Backup API",
          description: "Switch traffic to secondary API endpoint with proven reliability",
          confidence: 87,
          estimatedImpact: {
            errorReduction: 95,
            latencyImprovement: 40,
            costChange: 0.005
          },
          risk: "medium",
          learningSource: "2 successful past applications",
          steps: [
            "Validate backup API health",
            "Gradually shift 25% traffic",
            "Monitor error rates",
            "Complete migration if stable"
          ]
        }
      ],
      "latency_spike": [
        {
          id: 1,
          name: "Switch to Faster Model",
          description: "Temporarily use gpt-4o-mini for reduced latency with minimal accuracy trade-off",
          confidence: 92,
          estimatedImpact: {
            latencyImprovement: -180,
            accuracyDrop: 1.2,
            costChange: -0.008
          },
          risk: "low",
          learningSource: "5 successful past applications",
          steps: [
            "Switch model to gpt-4o-mini",
            "Monitor accuracy metrics",
            "Revert if accuracy drops > 3%",
            "Auto-revert after 1 hour"
          ]
        },
        {
          id: 2,
          name: "Enable Aggressive Caching",
          description: "Cache responses for 15 minutes to reduce API calls during spike",
          confidence: 89,
          estimatedImpact: {
            latencyImprovement: -220,
            cacheHitRate: 67,
            costChange: -0.012
          },
          risk: "low",
          learningSource: "8 successful past applications",
          steps: [
            "Enable Redis caching layer",
            "Set TTL to 15 minutes",
            "Monitor cache hit rate",
            "Adjust TTL based on data freshness"
          ]
        }
      ],
      "cost_spike": [
        {
          id: 1,
          name: "Switch to Cost-Save Profile",
          description: "Activate cost-optimized settings to reduce spend immediately",
          confidence: 85,
          estimatedImpact: {
            costReduction: 34,
            latencyIncrease: 45,
            accuracyDrop: 2.1
          },
          risk: "medium",
          learningSource: "4 past applications (3 successful, 1 rolled back)",
          steps: [
            "Switch to cost-save profile",
            "Reduce concurrency to 10",
            "Monitor accuracy carefully",
            "Revert if success rate < 90%"
          ]
        }
      ]
    };

    const anomalyType = anomaly.title.toLowerCase().includes("retry") ? "retry_storm" :
                        anomaly.title.toLowerCase().includes("latency") ? "latency_spike" :
                        anomaly.title.toLowerCase().includes("cost") ? "cost_spike" :
                        "latency_spike";

    return strategies[anomalyType] || strategies.latency_spike;
  };

  const handleSelectAnomaly = (anomaly) => {
    setSelectedAnomaly({
      ...anomaly,
      strategies: generateMitigationStrategies(anomaly)
    });
    setMitigationDrawerOpen(true);
  };

  const handleExecuteMitigation = (strategy) => {
    setExecutingMitigation(true);

    setTimeout(() => {
      const success = Math.random() > 0.15; // 85% success rate
      
      const newHistoryEntry = {
        id: mitigationHistory.length + 1,
        anomaly: selectedAnomaly.title,
        strategy: strategy.name,
        timestamp: new Date().toLocaleString(),
        success,
        metrics: strategy.estimatedImpact
      };

      setMitigationHistory(prev => [newHistoryEntry, ...prev]);
      
      if (success) {
        toast.success("Mitigation applied successfully", {
          description: `${strategy.name} is now active`
        });
        onApplyMitigation?.(selectedAnomaly, strategy);
      } else {
        toast.error("Mitigation failed", {
          description: "Rolled back to previous state"
        });
      }

      setExecutingMitigation(false);
      setMitigationDrawerOpen(false);
      setSelectedAnomaly(null);
    }, 2000);
  };

  // Auto-mitigation logic
  useEffect(() => {
    if (!autoMitigateEnabled) return;

    const criticalAnomalies = anomalies.filter(a => a.severity === "high");
    
    if (criticalAnomalies.length > 0) {
      const anomaly = criticalAnomalies[0];
      const strategies = generateMitigationStrategies(anomaly);
      const bestStrategy = strategies[0]; // Highest confidence

      if (bestStrategy.confidence > 90 && bestStrategy.risk === "low") {
        toast.info("Auto-mitigation triggered", {
          description: `Applying ${bestStrategy.name}...`
        });
        
        setTimeout(() => {
          handleExecuteMitigation(bestStrategy);
        }, 1000);
      }
    }
  }, [anomalies, autoMitigateEnabled]);

  const successRate = mitigationHistory.length > 0
    ? (mitigationHistory.filter(m => m.success).length / mitigationHistory.length * 100).toFixed(0)
    : 0;

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">Proactive Mitigation</h4>
              <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
                AI-Powered
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-mitigate" className="text-xs text-slate-700">
                Auto-Mitigate
              </Label>
              <Switch
                id="auto-mitigate"
                checked={autoMitigateEnabled}
                onCheckedChange={setAutoMitigateEnabled}
                className="scale-75"
              />
            </div>
          </div>

          {/* Learning Stats */}
          {learningEnabled && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-lg font-bold text-emerald-700">{successRate}%</div>
                <div className="text-[10px] text-slate-600">Success Rate</div>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-center">
                <div className="text-lg font-bold text-blue-700">{mitigationHistory.length}</div>
                <div className="text-[10px] text-slate-600">Total Applied</div>
              </div>
              <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-center">
                <div className="text-lg font-bold text-purple-700">
                  {mitigationHistory.filter(m => m.success).length}
                </div>
                <div className="text-[10px] text-slate-600">Successful</div>
              </div>
            </div>
          )}

          {/* Active Anomalies with Mitigation Suggestions */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {anomalies.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
                  <p className="text-xs text-slate-600">No active anomalies</p>
                </div>
              ) : (
                anomalies.map((anomaly, idx) => {
                  const strategies = generateMitigationStrategies(anomaly);
                  const bestStrategy = strategies[0];

                  return (
                    <motion.div
                      key={anomaly.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                        anomaly.severity === "high" && "bg-red-50 border-red-200",
                        anomaly.severity === "medium" && "bg-amber-50 border-amber-200"
                      )}
                      onClick={() => handleSelectAnomaly(anomaly)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className={cn(
                              "w-3 h-3",
                              anomaly.severity === "high" ? "text-red-600" : "text-amber-600"
                            )} />
                            <span className="text-xs font-semibold text-slate-900">
                              {anomaly.title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mb-2">
                            {anomaly.description}
                          </p>
                        </div>
                        <Badge className={cn(
                          "text-[9px] py-0 ml-2",
                          anomaly.severity === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {anomaly.severity}
                        </Badge>
                      </div>

                      {/* AI Suggestion */}
                      <div className="p-2 rounded bg-purple-50 border border-purple-200">
                        <div className="flex items-center gap-1 mb-1">
                          <Brain className="w-3 h-3 text-purple-600" />
                          <span className="text-xs font-semibold text-purple-900">
                            AI Suggests:
                          </span>
                          <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0 ml-auto">
                            {bestStrategy.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-700">
                          {bestStrategy.name}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Recent History */}
          {mitigationHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h5 className="text-xs font-semibold text-slate-900 mb-2">Recent Mitigations</h5>
              <div className="space-y-1">
                {mitigationHistory.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {entry.success ? (
                        <CheckCircle className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-600 flex-shrink-0" />
                      )}
                      <span className="text-slate-700 truncate">{entry.strategy}</span>
                    </div>
                    <span className="text-slate-500 text-[10px] flex-shrink-0 ml-2">
                      {entry.timestamp.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mitigation Strategy Drawer */}
      <Sheet open={mitigationDrawerOpen} onOpenChange={setMitigationDrawerOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Mitigation Strategies
            </SheetTitle>
          </SheetHeader>

          {selectedAnomaly && (
            <div className="mt-6 space-y-4">
              {/* Anomaly Details */}
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-bold text-red-900 mb-2">Detected Anomaly</h4>
                  <p className="text-sm text-slate-900 font-semibold mb-1">
                    {selectedAnomaly.title}
                  </p>
                  <p className="text-xs text-slate-700">
                    {selectedAnomaly.description}
                  </p>
                </CardContent>
              </Card>

              {/* Strategies */}
              <div className="space-y-3">
                {selectedAnomaly.strategies.map((strategy, idx) => (
                  <Card key={strategy.id} className={cn(
                    "border-2 cursor-pointer transition-all hover:shadow-lg",
                    idx === 0 ? "border-purple-300 bg-purple-50" : "border-slate-200"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {idx === 0 && <Zap className="w-4 h-4 text-purple-600" />}
                            <h5 className="text-sm font-bold text-slate-900">
                              {strategy.name}
                            </h5>
                          </div>
                          <p className="text-xs text-slate-700 mb-2">
                            {strategy.description}
                          </p>
                        </div>
                        <Badge className={cn(
                          "text-[9px] py-0 ml-2",
                          strategy.risk === "low" ? "bg-emerald-100 text-emerald-700" :
                          strategy.risk === "medium" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {strategy.risk} risk
                        </Badge>
                      </div>

                      {/* Confidence & Learning */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1">
                          <div className="text-xs text-slate-600 mb-1">
                            AI Confidence: {strategy.confidence}%
                          </div>
                          <Progress value={strategy.confidence} className="h-1.5" />
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 text-[9px] py-0">
                          {strategy.learningSource}
                        </Badge>
                      </div>

                      {/* Estimated Impact */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {Object.entries(strategy.estimatedImpact).map(([key, value]) => (
                          <div key={key} className="p-2 bg-white rounded border border-slate-200 text-center">
                            <div className="text-[10px] text-slate-600 capitalize mb-1">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className={cn(
                              "text-xs font-bold",
                              typeof value === 'number' && value < 0 ? "text-emerald-700" :
                              typeof value === 'number' && value > 0 ? "text-red-700" :
                              "text-slate-900"
                            )}>
                              {typeof value === 'number' ? (
                                value > 0 ? `+${value}` : value
                              ) : value}
                              {key.includes('Reduction') || key.includes('Improvement') || key.includes('Rate') ? '%' : ''}
                              {key.includes('latency') && 'ms'}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Steps */}
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 mb-3">
                        <div className="text-xs font-semibold text-slate-900 mb-2">
                          Execution Steps:
                        </div>
                        <ol className="space-y-1">
                          {strategy.steps.map((step, stepIdx) => (
                            <li key={stepIdx} className="text-xs text-slate-700 flex items-start gap-2">
                              <span className="text-purple-600 font-semibold flex-shrink-0">
                                {stepIdx + 1}.
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => handleExecuteMitigation(strategy)}
                        disabled={executingMitigation}
                        className={cn(
                          "w-full",
                          idx === 0 
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
                            : "bg-slate-600 hover:bg-slate-700"
                        )}
                      >
                        {executingMitigation ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Apply {strategy.name}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}