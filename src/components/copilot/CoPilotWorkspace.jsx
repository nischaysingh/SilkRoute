import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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

  // Sample context cards
  const [contextCards] = useState([
    {
      id: 1,
      type: "mission",
      title: "invoice_chase_v1",
      summary: "94% success rate, running for 3 days",
      state: "running",
      risks: [
        { level: "medium", text: "External API timeout detected 3x today" }
      ],
      nextActions: [
        { label: "Reroute to Co-Pilot", confidence: 88 },
        { label: "Enable circuit breaker", confidence: 92 }
      ],
      metrics: {
        "Success Rate": "94%",
        "Avg Latency": "842ms",
        "Daily Spend": "$0.75"
      }
    },
    {
      id: 2,
      type: "kpi",
      title: "Total AI Spend",
      summary: "$13.65k/month, up 12% from last month",
      state: "warning",
      risks: [
        { level: "high", text: "Spend exceeding budget by $1.2k" }
      ],
      nextActions: [
        { label: "Analyze spend drivers", confidence: 95 },
        { label: "Suggest cost optimizations", confidence: 89 }
      ],
      metrics: {
        "Current": "$13.65k",
        "Budget": "$12.5k",
        "Overrun": "$1.15k"
      }
    },
    {
      id: 3,
      type: "workflow",
      title: "AR Collection Pipeline",
      summary: "Paused since 2 hours ago, pending approval",
      state: "paused",
      risks: [
        { level: "low", text: "No immediate risks" }
      ],
      nextActions: [
        { label: "Resume workflow", confidence: 90 },
        { label: "Review approval queue", confidence: 85 }
      ],
      metrics: {
        "Status": "Paused",
        "Last Run": "2h ago",
        "Success": "100%"
      }
    }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      from: "user",
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I've analyzed your request. Here's what I found...",
        "Based on historical data, I recommend...",
        "Let me help you build that. Opening Agent Builder...",
        "I've identified 3 optimization opportunities for you."
      ];

      const aiMessage = {
        id: Date.now() + 1,
        from: "copilot",
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        suggestions: [
          { label: "Show details", action: "details" },
          { label: "Build automation", action: "build" }
        ]
      };

      setMessages(prev => [...prev, aiMessage]);
    }, 800);
  };

  const handleCardClick = (card) => {
    setSelectedContext(card);
    toast.info(`Context loaded: ${card.title}`);
  };

  const handleExplainThis = (card, metric) => {
    setExplainTarget({ card, metric });
    setExplainPanelOpen(true);
  };

  const handleActionClick = (action) => {
    toast.success(`Executing: ${action.label}`, {
      description: `Confidence: ${action.confidence}%`
    });
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left: Chat Interface */}
      <div className="col-span-12 lg:col-span-5 space-y-4">
        {/* Chat Messages */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
          <CardContent className="p-4">
            <div className="h-[500px] overflow-y-auto mb-4 space-y-3">
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
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      
                      {msg.suggestions && (
                        <div className="flex gap-2 mt-2">
                          {msg.suggestions.map((sug, idx) => (
                            <Button
                              key={idx}
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs bg-white hover:bg-slate-50"
                              onClick={() => toast.info(`Action: ${sug.label}`)}
                            >
                              {sug.label}
                            </Button>
                          ))}
                        </div>
                      )}

                      <div className="text-xs mt-1 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Co-Pilot anything... (e.g., 'Explain why spend spiked')"
                className="flex-1"
              />
              <Button onClick={handleSend} className="bg-gradient-to-r from-purple-600 to-blue-600">
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
                  className="justify-start"
                  onClick={() => {
                    setInput(action.label);
                    setTimeout(handleSend, 100);
                  }}
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