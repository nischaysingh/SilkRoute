import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, User, Loader2, MessageCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";

export default function PersonaChatDialog({ persona, open, onOpenChange }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const shouldAutoScroll = useRef(true);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (shouldAutoScroll.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    shouldAutoScroll.current = isNearBottom;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && persona && messages.length === 0) {
      // Initialize with greeting
      const greeting = getPersonaGreeting(persona);
      setMessages([{
        role: "assistant",
        content: greeting,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [open, persona]);

  const getPersonaGreeting = (persona) => {
    const emoji = persona.communication_style?.emoji_usage ? "👋 " : "";
    const tone = persona.communication_style?.tone || 'friendly';
    
    if (tone === 'formal') {
      return `${emoji}Good day. I am ${persona.name}. ${persona.description} How may I assist you today?`;
    } else if (tone === 'casual') {
      return `${emoji}Hey there! I'm ${persona.name}! ${persona.description} What can I help you with?`;
    } else if (tone === 'technical') {
      return `${emoji}Hello. ${persona.name} here. ${persona.description} Please describe your query.`;
    } else {
      return `${emoji}Hi! I'm ${persona.name}. ${persona.description} How can I help you today?`;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !persona) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    shouldAutoScroll.current = true;

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await base44.functions.invoke('chatWithPersona', {
        persona_id: persona.id,
        message: input,
        conversation_history: conversationHistory
      });

      const assistantMessage = {
        role: "assistant",
        content: response.data.response,
        timestamp: new Date().toISOString(),
        usage: response.data.usage
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Persona chat error:", error);
      toast.error("Failed to get response", {
        description: error.message
      });

      const errorMessage = {
        role: "assistant",
        content: "I apologize, but I encountered an issue processing your request. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const greeting = getPersonaGreeting(persona);
    setMessages([{
      role: "assistant",
      content: greeting,
      timestamp: new Date().toISOString()
    }]);
    toast.info("Conversation cleared");
  };

  const getAvatarGradient = (persona) => {
    const colors = {
      formal: "from-slate-600 to-slate-800",
      casual: "from-blue-500 to-purple-500",
      technical: "from-indigo-600 to-blue-700",
      friendly: "from-emerald-500 to-teal-600",
      concise: "from-amber-500 to-orange-600"
    };
    return colors[persona.communication_style?.tone] || "from-purple-600 to-blue-600";
  };

  if (!persona) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className={cn("w-12 h-12 bg-gradient-to-br flex items-center justify-center", getAvatarGradient(persona))}>
                <MessageCircle className="w-6 h-6 text-white" />
              </Avatar>
              <div>
                <DialogTitle className="text-xl">Chat with {persona.name}</DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  {persona.description}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-700">
                {persona.communication_style?.tone || 'professional'}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearChat}
                className="h-8"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          {/* Persona Quick Info */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {persona.knowledge_domains?.slice(0, 3).map((domain, idx) => (
              <Badge key={idx} className="bg-blue-50 text-blue-700 text-xs">
                {domain}
              </Badge>
            ))}
            {persona.specialized_tasks?.slice(0, 2).map((task, idx) => (
              <Badge key={idx} className="bg-emerald-50 text-emerald-700 text-xs">
                ⚡ {task}
              </Badge>
            ))}
          </div>
        </DialogHeader>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[400px] max-h-[500px]"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
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
                  <Avatar className={cn("w-8 h-8 bg-gradient-to-br flex items-center justify-center flex-shrink-0", getAvatarGradient(persona))}>
                    <Sparkles className="w-4 h-4 text-white" />
                  </Avatar>
                )}

                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl p-4",
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-900"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/20">
                    <div className={cn(
                      "text-xs opacity-70",
                      message.role === "user" ? "text-blue-100" : "text-slate-500"
                    )}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                    {message.usage && (
                      <div className="text-xs opacity-70 text-slate-500">
                        {message.usage.total_tokens} tokens
                      </div>
                    )}
                  </div>
                </div>

                {message.role === "user" && (
                  <Avatar className="w-8 h-8 bg-slate-300 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <Avatar className={cn("w-8 h-8 bg-gradient-to-br flex items-center justify-center flex-shrink-0", getAvatarGradient(persona))}>
                <Sparkles className="w-4 h-4 text-white" />
              </Avatar>
              <div className="bg-slate-100 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="text-sm text-slate-600">{persona.name} is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
              placeholder={`Ask ${persona.name} anything...`}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              💡 Try asking about orders, inventory, team performance, or AI mission insights
            </p>
            {messages.length > 1 && (
              <div className="text-xs text-slate-500">
                {messages.length - 1} messages
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}