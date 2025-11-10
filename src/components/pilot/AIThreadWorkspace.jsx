import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Sparkles, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function AIThreadWorkspace({ mission, onConvertToWorkflow }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "system",
      text: `Ready to optimize ${mission?.name || "mission"}. What would you like to improve?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [proposedChanges, setProposedChanges] = useState(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: "user",
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setGenerating(true);

    // Simulate AI response with proposed changes
    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        role: "pilot",
        text: "I've analyzed your request. Here's my proposal:",
        timestamp: new Date().toISOString()
      };

      const copilotMessage = {
        id: messages.length + 3,
        role: "copilot",
        text: "Co-Pilot agrees. I predict a 15% improvement in efficiency.",
        timestamp: new Date().toISOString()
      };

      const changes = {
        steps: [
          { action: "Switch to gpt-4o-mini", impact: "-18% cost" },
          { action: "Enable parallel processing", impact: "+35% throughput" },
          { action: "Add retry circuit breaker", impact: "-40ms latency" }
        ],
        prediction: {
          costBefore: 0.025,
          costAfter: 0.0205,
          latencyBefore: 842,
          latencyAfter: 802,
          successBefore: 94,
          successAfter: 96.5
        }
      };

      setMessages(prev => [...prev, aiMessage, copilotMessage]);
      setProposedChanges(changes);
      setGenerating(false);
    }, 2000);
  };

  const handleApprove = () => {
    onConvertToWorkflow?.(proposedChanges);
    setProposedChanges(null);
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      role: "system",
      text: "✅ Changes approved and applied to flight plan.",
      timestamp: new Date().toISOString()
    }]);
  };

  const handleModify = () => {
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      role: "system",
      text: "Please describe your modifications:",
      timestamp: new Date().toISOString()
    }]);
    setProposedChanges(null);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4 text-purple-600" />
          <h4 className="text-sm font-bold text-slate-900">AI Thread</h4>
          <Badge className="bg-purple-100 text-purple-700 text-[9px] py-0">
            Conversational
          </Badge>
        </div>

        {/* Messages */}
        <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" && "justify-end"
                )}
              >
                {msg.role !== "user" && (
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                    msg.role === "pilot" && "bg-blue-100",
                    msg.role === "copilot" && "bg-purple-100",
                    msg.role === "system" && "bg-slate-100"
                  )}>
                    {msg.role === "pilot" && <Sparkles className="w-3 h-3 text-blue-600" />}
                    {msg.role === "copilot" && <Sparkles className="w-3 h-3 text-purple-600" />}
                    {msg.role === "system" && <CheckCircle className="w-3 h-3 text-slate-600" />}
                  </div>
                )}
                <div className={cn(
                  "rounded-lg px-3 py-2 max-w-[80%]",
                  msg.role === "user" && "bg-blue-600 text-white",
                  msg.role === "pilot" && "bg-blue-50 text-slate-900",
                  msg.role === "copilot" && "bg-purple-50 text-slate-900",
                  msg.role === "system" && "bg-slate-100 text-slate-900"
                )}>
                  <p className="text-xs leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {generating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs text-slate-600"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Analyzing...</span>
            </motion.div>
          )}
        </div>

        {/* Proposed Changes */}
        {proposedChanges && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-3 p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200"
          >
            <h5 className="text-xs font-bold text-emerald-900 mb-2">Proposed Changes</h5>
            <div className="space-y-1 mb-3">
              {proposedChanges.steps.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700">• {step.action}</span>
                  <Badge className="bg-emerald-100 text-emerald-700 text-[9px] py-0">
                    {step.impact}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Impact Preview */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="p-2 bg-white rounded text-center">
                <div className="text-xs text-slate-600 mb-1">Cost</div>
                <div className="text-sm font-bold text-emerald-900">
                  ${proposedChanges.prediction.costAfter.toFixed(3)}
                </div>
                <div className="text-[9px] text-emerald-600">
                  {((proposedChanges.prediction.costAfter / proposedChanges.prediction.costBefore - 1) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="p-2 bg-white rounded text-center">
                <div className="text-xs text-slate-600 mb-1">Latency</div>
                <div className="text-sm font-bold text-blue-900">
                  {proposedChanges.prediction.latencyAfter}ms
                </div>
                <div className="text-[9px] text-blue-600">
                  {proposedChanges.prediction.latencyAfter - proposedChanges.prediction.latencyBefore}ms
                </div>
              </div>
              <div className="p-2 bg-white rounded text-center">
                <div className="text-xs text-slate-600 mb-1">Success</div>
                <div className="text-sm font-bold text-purple-900">
                  {proposedChanges.prediction.successAfter}%
                </div>
                <div className="text-[9px] text-purple-600">
                  +{(proposedChanges.prediction.successAfter - proposedChanges.prediction.successBefore).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleApprove}
                className="flex-1 h-7 text-xs bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleModify}
                className="flex-1 h-7 text-xs"
              >
                Modify
              </Button>
            </div>
          </motion.div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="e.g., optimize cost under 5¢/run"
            className="flex-1 h-8 text-xs"
            disabled={generating}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || generating}
            className="h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}