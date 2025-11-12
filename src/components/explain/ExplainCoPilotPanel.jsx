import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X, Pin, Sparkles, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  Zap, Shield, GitBranch, Bell, FlaskConical, Bot, Code, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useExplainMode } from "./ExplainModeContext";
import { generateExplanation, generateHeuristics } from "./parseWidgetContent";
import { base44 } from "@/api/base44Client";
import WorkflowComposer from "./WorkflowComposer";

export default function ExplainCoPilotPanel() {
  const { 
    explainPanelState, 
    closeExplainPanel, 
    togglePin, 
    setActiveTab,
    removeWidgetFromPanel,
    logActionClick
  } = useExplainMode();

  const [showRawData, setShowRawData] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [workflowComposerOpen, setWorkflowComposerOpen] = useState(false);

  const activeWidget = explainPanelState.widgets.find(w => w.id === explainPanelState.activeTab) || explainPanelState.widgets[0];
  const activeData = activeWidget?.data;

  // Fetch AI explanation when active widget changes
  useEffect(() => {
    if (!activeData) return;

    const fetchAIExplanation = async () => {
      setLoadingAI(true);
      setAiInsights(null);

      try {
        const response = await base44.functions.invoke('explainWidget', {
          widgetData: {
            title: activeData.title,
            metric: activeData.metric,
            unit: activeData.unit,
            trend: activeData.trend,
            delta: activeData.delta,
            period: activeData.period,
            dimensions: activeData.dimensions,
            rawText: activeData.rawText
          },
          context: {
            page: window.location.pathname,
            tab: document.title
          }
        });

        if (response.data.explanation) {
          setAiInsights(response.data);
        } else {
          // Fallback to heuristics
          setAiInsights({
            explanation: generateExplanation(activeData),
            reasoning: generateHeuristics(activeData),
            suggestions: ['Review related metrics', 'Set up monitoring']
          });
        }
      } catch (error) {
        console.error('AI explanation error:', error);
        // Fallback to heuristics
        setAiInsights({
          explanation: generateExplanation(activeData),
          reasoning: generateHeuristics(activeData),
          suggestions: ['Review related metrics', 'Set up monitoring']
        });
      } finally {
        setLoadingAI(false);
      }
    };

    fetchAIExplanation();
  }, [activeData?.title, activeData?.metric, activeData?.rawText]);

  if (!explainPanelState.isOpen || explainPanelState.widgets.length === 0) {
    return null;
  }

  if (!activeData) return null;

  const handleAction = (action) => {
    logActionClick(action, activeData.title);

    switch (action) {
      case 'create_policy':
        const policyText = activeData.metric 
          ? `Alert if ${activeData.title} deviates > 15% from ${activeData.metric}`
          : `Alert if ${activeData.title} exceeds threshold`;
        toast.success("Policy template created", {
          description: policyText
        });
        break;

      case 'new_workflow':
        setWorkflowComposerOpen(true);
        break;

      case 'new_agent':
        toast.success("Opening Agent Builder", {
          description: `Mission: Monitor ${activeData.title} and auto-act within thresholds`
        });
        break;

      case 'simulate':
        toast.info("Opening Simulator", {
          description: `Targeting: ${activeData.title}`
        });
        break;

      case 'alert':
        const threshold = activeData.metric 
          ? `${activeData.metric} × 1.2`
          : 'threshold';
        toast.info("Setting up alert", {
          description: `Notify when ${activeData.title} exceeds ${threshold}`
        });
        break;

      case 'explain_more':
        setShowRawData(!showRawData);
        break;

      default:
        toast.info(`Action: ${action}`);
    }
  };

  const getActionConfig = (actionKey) => {
    const configs = {
      create_policy: { icon: Shield, label: "Create Policy", color: "red" },
      new_workflow: { icon: GitBranch, label: "New Workflow", color: "purple" },
      new_agent: { icon: Bot, label: "New Agent", color: "blue" },
      simulate: { icon: FlaskConical, label: "Simulate Change", color: "cyan" },
      alert: { icon: Bell, label: "Alert Me", color: "amber" },
      explain_more: { icon: Code, label: showRawData ? "Hide Details" : "Show Raw Data", color: "slate" }
    };
    return configs[actionKey] || { icon: Zap, label: actionKey, color: "gray" };
  };

  const getTrendIcon = () => {
    if (activeData.trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (activeData.trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-20 right-6 w-[420px] max-h-[calc(100vh-120px)] bg-gradient-to-br from-slate-900 via-purple-900/40 to-blue-900/40 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-500/30 z-[100] overflow-hidden flex flex-col explain-copilot-panel"
      >
        {/* Header */}
        <div className="p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Explain</h3>
                <div className="text-[10px] text-purple-300 font-semibold">Powered by GPT-4</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePin}
                className={cn(
                  "h-7 w-7 p-0",
                  explainPanelState.isPinned ? "text-purple-400" : "text-gray-400 hover:text-white"
                )}
              >
                <Pin className={cn("w-4 h-4", explainPanelState.isPinned && "fill-current")} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={closeExplainPanel}
                className="text-gray-400 hover:text-white h-7 w-7 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Multi-widget tabs */}
          {explainPanelState.widgets.length > 1 && (
            <Tabs value={explainPanelState.activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white/5 border border-white/10 h-8 w-full justify-start overflow-x-auto">
                {explainPanelState.widgets.map((widget) => (
                  <TabsTrigger 
                    key={widget.id} 
                    value={widget.id}
                    className="text-xs h-6 relative pr-6"
                  >
                    {widget.data.title}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWidgetFromPanel(widget.id);
                      }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-white/10 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Widget Title & Trend */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">{activeData.title}</h3>
              {activeData.trend && (
                <Badge className={cn(
                  "text-xs",
                  activeData.trend === 'up' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                  activeData.trend === 'down' && "bg-red-500/20 text-red-400 border-red-500/30",
                  activeData.trend === 'flat' && "bg-gray-500/20 text-gray-400 border-gray-500/30"
                )}>
                  {getTrendIcon()}
                  <span className="ml-1 capitalize">{activeData.trend}</span>
                </Badge>
              )}
            </div>

            {activeData.metric && (
              <div className="text-3xl font-bold text-white mb-1">
                {activeData.metric}
              </div>
            )}

            {activeData.delta && (
              <Badge className={cn(
                "text-xs",
                activeData.trend === 'up' && "bg-emerald-500/20 text-emerald-400",
                activeData.trend === 'down' && "bg-red-500/20 text-red-400"
              )}>
                {activeData.delta}
              </Badge>
            )}
          </div>

          {/* AI Loading State */}
          {loadingAI && (
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  <span className="text-sm text-white">AI analyzing widget...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI-Powered Explanation */}
          {aiInsights && !loadingAI && (
            <>
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/30 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-blue-300" />
                    </div>
                    What you're seeing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {aiInsights.explanation.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/30 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-purple-300" />
                    </div>
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {aiInsights.reasoning.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              {aiInsights.suggestions && aiInsights.suggestions.length > 0 && (
                <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/40 shadow-lg shadow-amber-500/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white font-bold flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/30 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-amber-300" />
                      </div>
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {aiInsights.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-yellow-400 mt-1">→</span>
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Suggested Actions */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              {/* Primary Action: New Workflow (Always Visible) */}
              <Button
                size="sm"
                onClick={() => handleAction('new_workflow')}
                className="col-span-2 justify-start h-auto py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 text-white"
              >
                <GitBranch className="w-4 h-4 mr-2 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-semibold">Create Workflow</div>
                  <div className="text-[10px] text-purple-200">Auto-generate multi-step automation</div>
                </div>
              </Button>

              {/* Other Actions */}
              {activeData.actions.filter(a => a !== 'new_workflow').map((actionKey) => {
                const config = getActionConfig(actionKey);
                return (
                  <Button
                    key={actionKey}
                    size="sm"
                    onClick={() => handleAction(actionKey)}
                    className={cn(
                      "justify-start h-auto py-2 px-3 bg-white/5 border-white/10 text-white hover:bg-white/10"
                    )}
                    variant="outline"
                  >
                    <config.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-xs">{config.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Raw Parsed Data (Expandable) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRawData(!showRawData)}
            className="w-full justify-between text-gray-400 hover:text-white hover:bg-white/5 h-8"
          >
            <span className="text-xs">Raw Parsed Values</span>
            {showRawData ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          <AnimatePresence>
            {showRawData && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-slate-950/80 border-white/10">
                  <CardContent className="p-3">
                    <pre className="text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify({
                        title: activeData.title,
                        metric: activeData.metric,
                        unit: activeData.unit,
                        trend: activeData.trend,
                        delta: activeData.delta,
                        period: activeData.period,
                        dimensions: activeData.dimensions,
                        parsedFields: activeData.parsedFields
                      }, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-purple-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="font-semibold">AI-powered analysis</span>
            </div>
            {explainPanelState.isPinned && (
              <Badge className="bg-purple-500/30 text-purple-300 border-purple-500/40 text-[10px] font-bold">
                <Pin className="w-2 h-2 mr-1 fill-current" />
                Pinned
              </Badge>
            )}
          </div>
        </div>

        {/* Workflow Composer Modal */}
        <WorkflowComposer
          open={workflowComposerOpen}
          onClose={() => setWorkflowComposerOpen(false)}
          widgetContext={activeData}
        />
      </motion.div>
    </AnimatePresence>
  );
}