import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, MicOff, Volume2, Sparkles, CheckCircle, 
  Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";

export default function VoiceCommandInterface({ onCommand }) {
  const [conversationId, setConversationId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationLog, setConversationLog] = useState([]);

  // Initialize conversation with Voice Agent
  useEffect(() => {
    const initConversation = async () => {
      try {
        const conversation = await base44.agents.createConversation({
          agent_name: "copilot_voice",
          metadata: {
            name: "Voice Command Session",
            description: "Voice-driven Co-Pilot interaction"
          }
        });
        setConversationId(conversation.id);
        
        // Add initial greeting to log
        if (conversation.messages && conversation.messages.length > 0) {
          setConversationLog(conversation.messages.map(msg => ({
            id: Date.now(),
            type: msg.role === "user" ? "user" : "ai",
            text: msg.content,
            timestamp: new Date().toISOString()
          })));
        }
      } catch (error) {
        console.error("Failed to initialize voice conversation:", error);
        toast.error("Failed to connect to Voice Agent");
      }
    };

    initConversation();
  }, []);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      if (data.messages && data.messages.length > 0) {
        const lastMessage = data.messages[data.messages.length - 1];
        if (lastMessage.role === "assistant") {
          // Add AI response to log
          setConversationLog(prev => [...prev, {
            id: Date.now(),
            type: "ai",
            text: lastMessage.content,
            timestamp: new Date().toISOString()
          }]);
          setIsProcessing(false);
        }
      }
    });

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    if (isListening) {
      // Simulate voice recognition (in real app, this would use Web Speech API)
      const timer = setTimeout(() => {
        const sampleCommands = [
          "Build a workflow that alerts finance when spend exceeds fifteen thousand dollars",
          "Create an agent for invoice reconciliation",
          "Show me the CRM sync pipeline we built last week",
          "Optimize my workflow costs"
        ];
        const command = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
        setTranscript(command);
        setIsListening(false);
        handleVoiceCommand(command);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isListening]);

  const handleVoiceCommand = async (command) => {
    if (!conversationId) {
      toast.error("Voice agent not connected");
      return;
    }

    setIsProcessing(true);
    
    // Add to conversation log
    setConversationLog(prev => [...prev, {
      id: Date.now(),
      type: "user",
      text: command,
      timestamp: new Date().toISOString()
    }]);

    try {
      // Get current conversation
      const conversation = await base44.agents.getConversation(conversationId);
      
      // Send command to Voice Agent
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: command
      });

      // Trigger callback
      if (onCommand) {
        onCommand({ command });
      }

      // Simulate voice synthesis notification
      setTimeout(() => {
        toast.success("Command understood", {
          description: "Co-Pilot is processing your request"
        });
      }, 500);
    } catch (error) {
      console.error("Failed to process voice command:", error);
      toast.error("Failed to process command");
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      toast.info("Voice input stopped");
    } else {
      if (!conversationId) {
        toast.error("Voice agent not connected");
        return;
      }
      setIsListening(true);
      setTranscript("");
      toast.success("Listening... Speak your command");
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Voice Command Mode</h3>
              <p className="text-xs text-slate-600">Powered by Co-Pilot Voice Agent</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {conversationId && (
              <Badge className="bg-emerald-100 text-emerald-700 text-xs mr-2">
                Connected
              </Badge>
            )}
            <Badge className={cn(
              "text-xs",
              isListening ? "bg-red-100 text-red-700 animate-pulse" : "bg-slate-100 text-slate-700"
            )}>
              {isListening ? "Listening..." : "Ready"}
            </Badge>
          </div>
        </div>

        {/* Voice Input Area */}
        <div className="mb-6">
          <div className={cn(
            "relative flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all",
            isListening 
              ? "border-red-300 bg-red-50" 
              : "border-slate-200 bg-slate-50"
          )}>
            {/* Pulse animation when listening */}
            {isListening && (
              <>
                <motion.div
                  className="absolute w-24 h-24 rounded-full bg-red-400 opacity-20"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute w-24 h-24 rounded-full bg-red-400 opacity-10"
                  animate={{ scale: [1, 1.8, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                />
              </>
            )}

            <Button
              size="lg"
              onClick={toggleListening}
              disabled={!conversationId}
              className={cn(
                "relative z-10 w-16 h-16 rounded-full transition-all",
                isListening
                  ? "bg-red-600 hover:bg-red-700 animate-pulse"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              )}
            >
              {isListening ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>

            <p className="text-sm text-slate-600 mt-4">
              {isListening 
                ? "I'm listening... speak your command" 
                : conversationId
                ? "Click to start voice command"
                : "Connecting to voice agent..."}
            </p>
          </div>
        </div>

        {/* Transcript Display */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 rounded-lg bg-blue-50 border-2 border-blue-200"
            >
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">You said:</h4>
                  <p className="text-sm text-slate-700">{transcript}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing Indicator */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 rounded-lg bg-purple-50 border-2 border-purple-200"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                <div>
                  <h4 className="text-sm font-semibold text-purple-900">Co-Pilot is thinking...</h4>
                  <p className="text-xs text-slate-600">Processing your voice command</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation Log */}
        {conversationLog.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-3">Conversation History</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {conversationLog.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "p-2 rounded text-xs",
                    entry.type === "user" 
                      ? "bg-blue-50 text-blue-900" 
                      : "bg-purple-50 text-purple-900"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={cn(
                      "text-[10px]",
                      entry.type === "user" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    )}>
                      {entry.type === "user" ? "You" : "Co-Pilot"}
                    </Badge>
                    <span className="text-[10px] text-slate-500">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{entry.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Commands */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h4 className="text-xs font-bold text-slate-900 mb-2">Try saying:</h4>
          <div className="flex flex-wrap gap-2">
            {[
              "Build a workflow",
              "Create an agent",
              "Show my pipelines",
              "Optimize costs"
            ].map((cmd, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-slate-100"
                onClick={() => {
                  setTranscript(cmd);
                  handleVoiceCommand(cmd);
                }}
              >
                "{cmd}"
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}