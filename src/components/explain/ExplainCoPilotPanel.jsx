import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X, Pin, Sparkles, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  Zap, Shield, GitBranch, Bell, FlaskConical, Bot, Code, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useExplainMode } from "./ExplainModeContext";
import { generateExplanation, generateHeuristics } from "./parseWidgetContent";
import { base44 } from "@/api/base44Client";

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
          setAiInsights({
            explanation: generateExplanation(activeData),
            reasoning: generateHeuristics(activeData),
            suggestions: ['Review related metrics', 'Set up monitoring']
          });
        }
      } catch (error) {
        console.error('AI explanation error:', error);
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
        toast.success("Opening Workflow Composer", {
          description: `Template: Monitor ${activeData.title} and trigger actions`
        });
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
    if (activeData.trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (activeData.trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="fixed top-20 right-6 w-[420px] max-h-[calc(100vh-120px)] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden flex flex-col explain-copilot-panel">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Explain</h3>
              <div className="text-[10px] text-blue-600 font-medium">Powered by GPT-4</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePin}
              className={cn(
                "h-7 w-7 p-0",
                explainPanelState.isPinned ? "text-blue-600" : "text-slate-400 hover:text-slate-900"
              )}
            >
              <Pin className={cn("w-4 h-4", explainPanelState.isPinned && "fill-current")} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={closeExplainPanel}
              className="text-slate-400 hover:text-slate-900 h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Multi-widget tabs */}
        {explainPanelState.widgets.length > 1 && (
          <Tabs value={explainPanelState.activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border border-slate-200 h-8 w-full justify-start overflow-x-auto">
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
                    className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-slate-100 rounded p-0.5"
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {/* Widget Title & Trend */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-900">{activeData.title}</h3>
            {activeData.trend && (
              <Badge className={cn(
                "text-xs",
                activeData.trend === 'up' && "bg-emerald-100 text-emerald-700 border-emerald-200",
                activeData.trend === 'down' && "bg-red-100 text-red-700 border-red-200",
                activeData.trend === 'flat' && "bg-slate-100 text-slate-700 border-slate-200"
              )}>
                {getTrendIcon()}
                <span className="ml-1 capitalize">{activeData.trend}</span>
              </Badge>
            )}
          </div>

          {activeData.metric && (
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {activeData.metric}
            </div>
          )}

          {activeData.delta && (
            <Badge className={cn(
              "text-xs",
              activeData.trend === 'up' && "bg-emerald-100 text-emerald-700 border-emerald-200",
              activeData.trend === 'down' && "bg-red-100 text-red-700 border-red-200"
            )}>
              {activeData.delta}
            </Badge>
          )}
        </div>

        {/* AI Loading State */}
        {loadingAI && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-sm text-slate-900">AI analyzing...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI-Powered Explanation */}
        {aiInsights && !loadingAI && (
          <>
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  What you're seeing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiInsights.explanation.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiInsights.reasoning.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            {aiInsights.suggestions && aiInsights.suggestions.length > 0 && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {aiInsights.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-amber-600 mt-1">→</span>
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
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            {activeData.actions.map((actionKey) => {
              const config = getActionConfig(actionKey);
              return (
                <Button
                  key={actionKey}
                  size="sm"
                  onClick={() => handleAction(actionKey)}
                  className={cn(
                    "justify-start h-auto py-2 px-3 bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
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
          className="w-full justify-between text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-8"
        >
          <span className="text-xs">Raw Parsed Values</span>
          {showRawData ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {showRawData && (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-3">
              <pre className="text-xs text-slate-300 overflow-x-auto">
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
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>AI-powered analysis</span>
          </div>
          {explainPanelState.isPinned && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">
              Pinned
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}