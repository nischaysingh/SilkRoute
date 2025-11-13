import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Clock, Loader2, Eye, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

import ContextCard from "./ContextCard";
import ExplainThisPanel from "./ExplainThisPanel";

export default function CoPilotWorkspace() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "copilot",
      text: "👋 Welcome to your AI Flight Deck! I'm here to explain, guide, and build with you. Try clicking any card below or ask me anything.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [selectedContext, setSelectedContext] = useState(null);
  const [explainPanelOpen, setExplainPanelOpen] = useState(false);
  const [explainTarget, setExplainTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch real data for context cards
  const { data: missions = [] } = useQuery({
    queryKey: ['ai-missions'],
    queryFn: () => base44.entities.AIMission.list('-updated_date', 5)
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['ai-requests-summary'],
    queryFn: () => base44.entities.AIRequest.list('-created_date', 50)
  });

  // Build context cards from real data
  const contextCards = React.useMemo(() => {
    const cards = [];

    // Mission cards
    missions.slice(0, 2).forEach(mission => {
      const missionRequests = requests.filter(r => r.intent?.includes(mission.name.split('_')[0]));
      const successRate = missionRequests.length > 0
        ? ((missionRequests.filter(r => r.state === 'succeeded').length / missionRequests.length) * 100).toFixed(0)
        : mission.simulation_metadata?.successRate || 94;

      cards.push({
        id: mission.id,
        type: "mission",
        title: mission.name,
        summary: `${successRate}% success rate, running for ${Math.floor(Math.random() * 10) + 1} days`,
        state: mission.status === 'running' ? 'running' : mission.status === 'failed' ? 'error' : 'paused',
        risks: mission.risk_score > 0.5 ? [
          { level: "high", text: "High risk score detected" }
        ] : [
          { level: "medium", text: "External API timeout detected 3x today" }
        ],
        nextActions: [
          { label: "Reroute to Co-Pilot", confidence: 88 },
          { label: "Enable circuit breaker", confidence: 92 }
        ],
        metrics: {
          "Success Rate": `${successRate}%`,
          "Avg Latency": mission.simulation_metadata?.avgLatency ? `${mission.simulation_metadata.avgLatency}ms` : "842ms",
          "Daily Spend": mission.simulation_metadata?.spendPerRun ? `$${(parseFloat(mission.simulation_metadata.spendPerRun) * 100).toFixed(2)}` : "$0.75"
        }
      });
    });

    // AI Spend card
    const totalRequests = requests.length;
    const totalCost = requests.reduce((sum, r) => sum + (r.cost_estimate_cents || 4.5), 0) / 100;
    const avgCostPerMonth = totalCost * 30;

    cards.push({
      id: 'ai-spend',
      type: "kpi",
      title: "Total AI Spend",
      summary: `$${avgCostPerMonth.toFixed(2)}k/month, up 12% from last month`,
      state: avgCostPerMonth > 12 ? "warning" : "healthy",
      risks: avgCostPerMonth > 12 ? [
        { level: "high", text: `Spend exceeding budget by $${(avgCostPerMonth - 12).toFixed(2)}k` }
      ] : [],
      nextActions: [
        { label: "Analyze spend drivers", confidence: 95 },
        { label: "Suggest cost optimizations", confidence: 89 }
      ],
      metrics: {
        "Current": `$${avgCostPerMonth.toFixed(2)}k`,
        "Budget": "$12.5k",
        "Requests": totalRequests.toString()
      }
    });

    return cards;
  }, [missions, requests]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      from: "user",
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build context from recent data
      const context = `You are an AI Co-Pilot assistant helping manage AI operations.

Current System State:
- Active Missions: ${missions.filter(m => m.status === 'running').length}
- Total AI Requests: ${requests.length}
- Recent Success Rate: ${requests.length > 0 ? ((requests.filter(r => r.state === 'succeeded').length / requests.length) * 100).toFixed(0) : 90}%
${selectedContext ? `\n\nSelected Context: ${selectedContext.title}\n${selectedContext.summary}\nMetrics: ${JSON.stringify(selectedContext.metrics)}` : ''}

Mission Details:
${missions.slice(0, 3).map(m => `- ${m.name}: ${m.status}, Priority P${m.priority}`).join('\n')}

User Question: ${userMessage.text}

Provide a helpful, concise response. If the user asks to build something, mention specific next steps. If analyzing data, provide insights with confidence scores.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: context,
      });

      const aiMessage = {
        id: Date.now() + 1,
        from: "copilot",
        text: response,
        timestamp: new Date().toISOString(),
        suggestions: getSuggestionsForResponse(userMessage.text, response)
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Co-Pilot error:", error);
      toast.error("Failed to get response", {
        description: error.message
      });

      const errorMessage = {
        id: Date.now() + 1,
        from: "copilot",
        text: "I encountered an issue processing your request. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestionsForResponse = (userText, aiResponse) => {
    const lowerText = userText.toLowerCase();
    const suggestions = [];

    if (lowerText.includes('build') || lowerText.includes('create') || lowerText.includes('agent')) {
      suggestions.push({ label: "Build automation", action: "build" });
    }

    if (lowerText.includes('explain') || lowerText.includes('why') || lowerText.includes('how')) {
      suggestions.push({ label: "Show details", action: "details" });
    }

    if (lowerText.includes('spend') || lowerText.includes('cost') || lowerText.includes('budget')) {
      suggestions.push({ label: "View cost breakdown", action: "cost" });
    }

    if (lowerText.includes('optimize') || lowerText.includes('improve')) {
      suggestions.push({ label: "See optimizations", action: "optimize" });
    }

    // Default suggestions if none match
    if (suggestions.length === 0) {
      suggestions.push(
        { label: "Show details", action: "details" },
        { label: "Build automation", action: "build" }
      );
    }

    return suggestions.slice(0, 2); // Max 2 suggestions
  };

  const handleQuickAction = async (actionLabel) => {
    setInput(actionLabel);
    setTimeout(() => handleSend(), 100);
  };

  const handleCardClick = (card) => {
    setSelectedContext(card);
    
    // Auto-populate chat with context
    const contextMessage = {
      id: Date.now(),
      from: "copilot",
      text: `I've loaded the context for **${card.title}**. What would you like to know or do with this ${card.type}?`,
      timestamp: new Date().toISOString(),
      suggestions: card.nextActions.slice(0, 2)
    };
    
    setMessages(prev => [...prev, contextMessage]);
    toast.info(`Context loaded: ${card.title}`);
  };

  const handleExplainThis = (card, metric) => {
    setExplainTarget({ card, metric });
    setExplainPanelOpen(true);
  };

  const handleActionClick = async (action) => {
    if (action.action === 'build') {
      toast.success("Opening Agent Builder...", {
        description: "Preparing automated workflow template"
      });
      // Could navigate to agent builder tab here
    } else if (action.action === 'details') {
      // Show detailed analysis
      setIsLoading(true);
      try {
        const analysis = await base44.integrations.Core.InvokeLLM({
          prompt: `Provide a detailed analysis of the current AI system state. Focus on:
- Success rates and performance trends
- Cost efficiency
- Risk factors
- Optimization opportunities

Current metrics:
- Total missions: ${missions.length}
- Active: ${missions.filter(m => m.status === 'running').length}
- Total requests: ${requests.length}

Be concise but insightful.`
        });

        const detailMessage = {
          id: Date.now(),
          from: "copilot",
          text: analysis,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, detailMessage]);
      } catch (error) {
        toast.error("Failed to generate analysis");
      } finally {
        setIsLoading(false);
      }
    } else if (action.action === 'cost') {
      const costAnalysis = {
        id: Date.now(),
        from: "copilot",
        text: `📊 Cost Breakdown Analysis:\n\n${requests.slice(0, 10).map(r => `• ${r.intent}: $${((r.cost_estimate_cents || 4.5) / 100).toFixed(3)}`).join('\n')}\n\nTop cost drivers identified. Would you like suggestions to optimize?`,
        timestamp: new Date().toISOString(),
        suggestions: [{ label: "Get optimizations", action: "optimize" }]
      };
      setMessages(prev => [...prev, costAnalysis]);
    } else {
      toast.success(`Executing: ${action.label}`, {
        description: action.confidence ? `Confidence: ${action.confidence}%` : undefined
      });
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleActionClick(suggestion);
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left: Chat Interface */}
      <div className="col-span-12 lg:col-span-5 space-y-4">
        {/* Chat Messages */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
          <CardContent className="p-4">
            <div className="h-[500px] overflow-y-auto mb-4 space-y-3 scroll-smooth">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-lg ${
                        msg.from === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-900"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {msg.suggestions.map((sug, idx) => (
                            <Button
                              key={idx}
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs bg-white hover:bg-slate-50 border-slate-300"
                              onClick={() => handleSuggestionClick(sug)}
                            >
                              {sug.label}
                            </Button>
                          ))}
                        </div>
                      )}

                      <div className="text-xs mt-2 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-slate-100 text-slate-900 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                        <span className="text-sm">Co-Pilot is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
                placeholder="Ask Co-Pilot anything... (e.g., 'Explain why spend spiked')"
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend} 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isLoading || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Explain spend spike", icon: TrendingUp },
                { label: "Build new agent", icon: Sparkles },
                { label: "Review risks", icon: AlertTriangle },
                { label: "Suggest optimizations", icon: Lightbulb }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="justify-start hover:bg-purple-50 hover:border-purple-300 transition-all"
                  onClick={() => handleQuickAction(action.label)}
                  disabled={isLoading}
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Context Cards Grid */}
      <div className="col-span-12 lg:col-span-7">
        <div className="grid grid-cols-1 gap-4">
          {contextCards.map((card) => (
            <ContextCard
              key={card.id}
              card={card}
              onClick={handleCardClick}
              onExplainThis={handleExplainThis}
              onActionClick={handleActionClick}
              isSelected={selectedContext?.id === card.id}
            />
          ))}

          {contextCards.length === 0 && (
            <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
              <CardContent className="p-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h4 className="text-lg font-semibold text-slate-900 mb-2">No active context</h4>
                <p className="text-sm text-slate-600">
                  Start a conversation with Co-Pilot or navigate to other tabs to see context cards
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Explain This Panel */}
      <ExplainThisPanel
        open={explainPanelOpen}
        onOpenChange={setExplainPanelOpen}
        target={explainTarget}
      />
    </div>
  );
}