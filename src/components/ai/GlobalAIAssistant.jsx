import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, X, ArrowRight, TrendingUp, AlertCircle, 
  Lightbulb, ChevronDown, ChevronUp, Brain, Target 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function GlobalAIAssistant({ currentTab, userActivity, userRole }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [insights, setInsights] = useState([]);

  // Generate contextual suggestions based on current tab and activity
  useEffect(() => {
    const generateSuggestions = () => {
      const contextualSuggestions = {
        atc: [
          {
            id: 1,
            type: "navigation",
            priority: "high",
            title: "Review Critical Incident",
            description: "There's an active latency spike in mission 'invoice_chase_v1'",
            action: "Go to Pilot → Inspect Mission",
            confidence: 94,
            icon: AlertCircle,
            color: "red"
          },
          {
            id: 2,
            type: "action",
            priority: "medium",
            title: "Cost Optimization Available",
            description: "Switch 3 missions to cost-save profile to reduce spend by $2.40/day",
            action: "Apply Optimization",
            confidence: 87,
            icon: TrendingUp,
            color: "emerald"
          },
          {
            id: 3,
            type: "insight",
            priority: "low",
            title: "Predictive Alert",
            description: "Based on current trends, expect 15% increase in token usage next week",
            action: "View Forecast",
            confidence: 78,
            icon: Brain,
            color: "blue"
          }
        ],
        pilot: [
          {
            id: 4,
            type: "navigation",
            priority: "high",
            title: "Mission Needs Review",
            description: "Mission 'batch_pick_opt_v2' has been paused for 2 hours - requires approval",
            action: "Review Mission",
            confidence: 96,
            icon: Target,
            color: "amber"
          },
          {
            id: 5,
            type: "action",
            priority: "medium",
            title: "Enable Fusion Mode",
            description: "Based on your activity, Fusion Mode could accelerate decision-making by 40%",
            action: "Activate Fusion",
            confidence: 82,
            icon: Sparkles,
            color: "purple"
          },
          {
            id: 6,
            type: "navigation",
            priority: "low",
            title: "Training Opportunity",
            description: "3 agents could benefit from fine-tuning based on recent performance data",
            action: "Go to Co-Pilot → Agent Builder",
            confidence: 73,
            icon: Lightbulb,
            color: "blue"
          }
        ],
        "co-pilot": [
          {
            id: 7,
            type: "action",
            priority: "high",
            title: "Workflow Optimization Detected",
            description: "Your 'Invoice Reconciler' workflow could be 30% faster with parallel processing",
            action: "Apply Optimization",
            confidence: 91,
            icon: TrendingUp,
            color: "emerald"
          },
          {
            id: 8,
            type: "insight",
            priority: "medium",
            title: "Agent Training Recommended",
            description: "Agent 'CRM Sync' shows bias in timezone handling - training data suggested",
            action: "View Training Pipeline",
            confidence: 85,
            icon: Brain,
            color: "purple"
          },
          {
            id: 9,
            type: "navigation",
            priority: "low",
            title: "Context Card Alert",
            description: "AI Spend KPI exceeded budget threshold - review recommended",
            action: "View Context Card",
            confidence: 79,
            icon: AlertCircle,
            color: "red"
          }
        ],
        autopilot: [
          {
            id: 10,
            type: "action",
            priority: "high",
            title: "Auto-Scale Recommended",
            description: "Traffic patterns suggest scaling up 2 autopilot agents for next 4 hours",
            action: "Enable Auto-Scale",
            confidence: 89,
            icon: TrendingUp,
            color: "blue"
          }
        ]
      };

      setSuggestions(contextualSuggestions[currentTab] || []);
    };

    generateSuggestions();

    // Refresh suggestions every 30 seconds
    const interval = setInterval(generateSuggestions, 30000);
    return () => clearInterval(interval);
  }, [currentTab, userActivity]);

  // Generate personalized insights based on user role
  useEffect(() => {
    const roleInsights = {
      admin: [
        {
          id: 1,
          title: "System Health Score: 92%",
          description: "Overall performance is strong. Minor latency issues in 2 missions.",
          metric: "+3% from yesterday",
          color: "emerald"
        },
        {
          id: 2,
          title: "Cost Efficiency: $13.65k/month",
          description: "You're tracking 8% over budget. Consider cost-save profile for non-critical missions.",
          metric: "+12% MoM",
          color: "amber"
        }
      ],
      user: [
        {
          id: 3,
          title: "Your Active Missions: 7",
          description: "All missions running smoothly. 94% average success rate across your portfolio.",
          metric: "+2 this week",
          color: "blue"
        }
      ]
    };

    setInsights(roleInsights[userRole] || roleInsights.user);
  }, [userRole]);

  const handleAction = (suggestion) => {
    toast.success(`Executing: ${suggestion.action}`);
    // In real implementation, this would trigger actual navigation or actions
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-300";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-300";
      case "low": return "bg-blue-100 text-blue-700 border-blue-300";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getIconColor = (color) => {
    const colors = {
      red: "text-red-600",
      amber: "text-amber-600",
      emerald: "text-emerald-600",
      blue: "text-blue-600",
      purple: "text-purple-600"
    };
    return colors[color] || "text-slate-600";
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
        >
          <Sparkles className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed top-24 right-6 w-96 z-50"
    >
      <Card className="bg-white/95 backdrop-blur-xl border-purple-200 shadow-2xl">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold">AI Navigator</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-purple-100">Contextual assistance for {currentTab.toUpperCase()}</p>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Personalized Insights */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1">
                <Brain className="w-3 h-3" />
                Personalized Insights
              </h4>
              <div className="space-y-2">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className={cn(
                      "p-3 rounded-lg border-2",
                      insight.color === "emerald" && "bg-emerald-50 border-emerald-200",
                      insight.color === "amber" && "bg-amber-50 border-amber-200",
                      insight.color === "blue" && "bg-blue-50 border-blue-200"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-900">{insight.title}</span>
                      <Badge className={cn(
                        "text-xs",
                        insight.color === "emerald" && "bg-emerald-100 text-emerald-700",
                        insight.color === "amber" && "bg-amber-100 text-amber-700",
                        insight.color === "blue" && "bg-blue-100 text-blue-700"
                      )}>
                        {insight.metric}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Suggestions */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                Smart Suggestions ({suggestions.length})
              </h4>
              <AnimatePresence>
                {suggestions.slice(0, isExpanded ? suggestions.length : 2).map((suggestion, idx) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "mb-2 p-3 rounded-lg border-2",
                      getPriorityColor(suggestion.priority)
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg bg-white/50")}>
                        <suggestion.icon className={cn("w-4 h-4", getIconColor(suggestion.color))} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-sm font-semibold text-slate-900">{suggestion.title}</h5>
                          <Badge className="text-[10px] bg-white/50">
                            {suggestion.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-700 mb-2">{suggestion.description}</p>
                        <Button
                          size="sm"
                          onClick={() => handleAction(suggestion)}
                          className="h-6 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          {suggestion.action}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Quick Actions */}
            {currentTab === "co-pilot" && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={() => toast.info("Opening Agent Training...")}
                  >
                    <Brain className="w-3 h-3 mr-1" />
                    Train Agent
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={() => toast.info("Opening Workflow Optimizer...")}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Optimize
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}