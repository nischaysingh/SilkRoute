import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Send, Sparkles, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function VoiceCommandConsole({ open, onOpenChange, onExecuteCommand }) {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [history, setHistory] = useState([
    { id: 1, type: "system", text: "Voice command console ready. Speak or type your command.", timestamp: new Date().toISOString() }
  ]);

  const structuredCommands = [
    { pattern: "reroute <mission> to <route>", example: "reroute invoice_chase to copilot" },
    { pattern: "simulate <mission> for <duration>", example: "simulate next 6 hours" },
    { pattern: "optimize <target> for <goal>", example: "optimize cost for balanced mode" },
    { pattern: "pause all <priority>", example: "pause all medium-priority" },
    { pattern: "show <metric> trend", example: "show latency trend" }
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userCommand = {
      id: history.length + 1,
      type: "user",
      text: input,
      timestamp: new Date().toISOString()
    };

    setHistory(prev => [...prev, userCommand]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: history.length + 2,
        type: "ai",
        text: `Executing: ${input}`,
        timestamp: new Date().toISOString()
      };

      const successResponse = {
        id: history.length + 3,
        type: "success",
        text: "✓ Command executed successfully",
        timestamp: new Date().toISOString()
      };

      setHistory(prev => [...prev, aiResponse, successResponse]);
      onExecuteCommand?.(input);
    }, 800);
  };

  const handleVoiceToggle = () => {
    setListening(!listening);
    if (!listening) {
      toast.success("Voice listening activated", {
        description: "Speak your command..."
      });
      
      // Simulate voice recognition
      setTimeout(() => {
        setInput("Co-Pilot, reroute all medium-priority tasks to balanced mode");
        setListening(false);
        toast.success("Voice command captured");
      }, 3000);
    } else {
      toast.info("Voice listening stopped");
    }
  };

  const handleSpeak = (text) => {
    toast.success("AI responding vocally", {
      description: text.slice(0, 50) + "..."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <motion.div
              animate={listening ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {listening ? (
                <Mic className="w-5 h-5 text-red-500" />
              ) : (
                <MicOff className="w-5 h-5 text-slate-400" />
              )}
            </motion.div>
            Voice Command Console
            {listening && (
              <Badge className="bg-red-500/20 text-red-300 border-red-500/50 text-[9px] py-0 animate-pulse">
                LISTENING
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Command History */}
          <div className="bg-black/50 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs">
            <AnimatePresence>
              {history.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "mb-2 flex items-start gap-2",
                    entry.type === "user" && "text-blue-300",
                    entry.type === "ai" && "text-purple-300",
                    entry.type === "success" && "text-emerald-300",
                    entry.type === "system" && "text-slate-400"
                  )}
                >
                  <span className="text-slate-500 flex-shrink-0">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <div className="flex-1">
                    <span className="text-slate-400 mr-2">
                      {entry.type === "user" && "USER >"}
                      {entry.type === "ai" && "AI >"}
                      {entry.type === "success" && "✓"}
                      {entry.type === "system" && "SYS >"}
                    </span>
                    <span>{entry.text}</span>
                    {entry.type === "ai" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSpeak(entry.text)}
                        className="h-5 w-5 p-0 ml-2 text-purple-400 hover:text-purple-300"
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {listening && (
              <motion.div
                className="text-red-400"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🎤 Listening...
              </motion.div>
            )}
          </div>

          {/* Structured Commands Help */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <h5 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Structured Command Language
            </h5>
            <div className="space-y-1">
              {structuredCommands.slice(0, 3).map((cmd, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px]">
                  <code className="text-purple-300 font-mono">{cmd.pattern}</code>
                  <span className="text-slate-500">→</span>
                  <span className="text-slate-400 italic">{cmd.example}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={listening ? "destructive" : "outline"}
              onClick={handleVoiceToggle}
              className={cn(
                "h-9 w-9 p-0",
                listening && "animate-pulse"
              )}
            >
              {listening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type or speak your command..."
              className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!input.trim()}
              className="h-9 bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}