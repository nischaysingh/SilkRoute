import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle, Send, Sparkles, User, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";

export default function ConversationalBuilder({ onBuildComplete }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [buildingLive, setBuildingLive] = useState(false);
  const [buildProgress, setBuildProgress] = useState([]);
  const messagesEndRef = useRef(null);
  const shouldAutoScroll = useRef(true);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (shouldAutoScroll.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle manual scroll - disable auto-scroll if user scrolls up
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    shouldAutoScroll.current = isNearBottom;
  };

  // Only scroll when messages change and auto-scroll is enabled
  useEffect(() => {
    scrollToBottom();
  }, [messages, buildProgress]);

  // Initialize conversation with Co-Pilot Builder Agent
  useEffect(() => {
    const initConversation = async () => {
      try {
        const conversation = await base44.agents.createConversation({
          agent_name: "copilot_builder",
          metadata: {
            name: "Conversational Build Session",
            description: "Interactive building session with Co-Pilot"
          }
        });
        setConversationId(conversation.id);
        setMessages(conversation.messages || []);
      } catch (error) {
        console.error("Failed to initialize conversation:", error);
        toast.error("Failed to connect to Co-Pilot Builder");
      }
    };

    initConversation();
  }, []);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      setIsThinking(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;

    const userMessage = {
      role: "user",
      content: input
    };

    setInput("");
    setIsThinking(true);
    shouldAutoScroll.current = true; // Re-enable auto-scroll when sending

    try {
      // Get current conversation state
      const conversation = await base44.agents.getConversation(conversationId);
      
      // Add user message
      await base44.agents.addMessage(conversation, userMessage);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      setIsThinking(false);
    }
  };

  const handleQuickReply = (reply) => {
    setInput(reply);
    setTimeout(() => handleSend(), 100);
  };

  // Detect if AI is building something
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "assistant" && lastMessage.content) {
      // Check if message indicates building is starting
      if (lastMessage.content.toLowerCase().includes("let me build") || 
          lastMessage.content.toLowerCase().includes("creating") ||
          lastMessage.content.toLowerCase().includes("i'll create")) {
        startBuildingAnimation();
      }
    }
  }, [messages]);

  const startBuildingAnimation = () => {
    setBuildingLive(true);
    
    // Simulate build steps with animation
    const steps = [
      { id: 1, label: "Analyzing requirements", icon: "🔍" },
      { id: 2, label: "Configuring components", icon: "⚙️" },
      { id: 3, label: "Setting up integrations", icon: "🔌" },
      { id: 4, label: "Finalizing configuration", icon: "✅" }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setBuildProgress(prev => [...prev, { ...step, status: "building" }]);
        
        setTimeout(() => {
          setBuildProgress(prev => 
            prev.map((s, i) => i === idx ? { ...s, status: "completed" } : s)
          );

          if (idx === steps.length - 1) {
            setTimeout(() => {
              setBuildingLive(false);
              if (onBuildComplete) {
                onBuildComplete({ steps });
              }
            }, 500);
          }
        }, 800);
      }, idx * 1200);
    });
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm h-[600px] flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Conversational Builder</h3>
              <p className="text-xs text-slate-600">Powered by Co-Pilot Builder Agent</p>
            </div>
            {conversationId && (
              <Badge className="ml-auto bg-emerald-100 text-emerald-700 text-xs">
                Connected
              </Badge>
            )}
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((message, idx) => (
              <motion.div
                key={`${message.role}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                layout
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </Avatar>
                )}

                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-900"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  
                  {message.role === "assistant" && message.content && (
                    <>
                      {/* Quick reply detection */}
                      {(message.content.toLowerCase().includes("quickbooks or") || 
                        message.content.toLowerCase().includes("database?")) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs bg-white hover:bg-slate-50"
                            onClick={() => handleQuickReply("QuickBooks")}
                          >
                            QuickBooks
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs bg-white hover:bg-slate-50"
                            onClick={() => handleQuickReply("Internal Database")}
                          >
                            Internal Database
                          </Button>
                        </div>
                      )}
                      
                      {(message.content.toLowerCase().includes("validate") || 
                        message.content.toLowerCase().includes("automation")) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs bg-white hover:bg-slate-50"
                            onClick={() => handleQuickReply("Yes, validate data first")}
                          >
                            Validate Data
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs bg-white hover:bg-slate-50"
                            onClick={() => handleQuickReply("No, full automation")}
                          >
                            Full Automation
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {message.role === "user" && (
                  <Avatar className="w-8 h-8 bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Thinking indicator */}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <Avatar className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </Avatar>
              <div className="bg-slate-100 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="text-sm text-slate-600">Co-Pilot is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Live Building Progress */}
          {buildingLive && buildProgress.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4"
            >
              <h4 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Building Live...
              </h4>
              <div className="space-y-2">
                {buildProgress.map((step) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-2 rounded bg-white"
                  >
                    <span className="text-xl">{step.icon}</span>
                    <span className="text-sm flex-1">{step.label}</span>
                    {step.status === "building" && (
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    )}
                    {step.status === "completed" && (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Describe what you'd like to build..."
              className="flex-1"
              disabled={isThinking || buildingLive || !conversationId}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isThinking || buildingLive || !conversationId}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            💡 Try: "Build a pipeline that syncs invoices weekly" or "Create an agent for CRM updates"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}