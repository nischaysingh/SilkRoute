import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Terminal, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CommandConsole({ open, onOpenChange, onExecuteCommand }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [executing, setExecuting] = useState(false);

  const commands = [
    { text: "Launch invoice chase", category: "mission" },
    { text: "Reroute batch opt to Co-Pilot", category: "routing" },
    { text: "Simulate all drafts for SLA risk", category: "analysis" },
    { text: "Show mission health", category: "monitoring" },
    { text: "Optimize for cost", category: "optimization" },
    { text: "Pause all running missions", category: "control" },
    { text: "Generate mission report", category: "reporting" }
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.text.toLowerCase().includes(input.toLowerCase())
  );

  const handleExecute = async (command) => {
    setExecuting(true);
    setHistory(prev => [...prev, { type: "command", text: command }]);
    
    // Simulate execution
    setTimeout(() => {
      const response = {
        type: "response",
        text: `✓ Executed: ${command}`,
        status: "success"
      };
      setHistory(prev => [...prev, response]);
      setExecuting(false);
      setInput("");
      
      onExecuteCommand?.(command);
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && input.trim()) {
      handleExecute(input);
    }
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl text-slate-100 p-0">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-mono">Pilot Command Console</span>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-4 font-mono text-sm">
          {/* History */}
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {history.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex items-start gap-2 text-xs",
                    item.type === "command" ? "text-blue-400" : "text-emerald-400"
                  )}
                >
                  {item.type === "command" ? (
                    <ChevronRight className="w-3 h-3 mt-0.5" />
                  ) : (
                    <Zap className="w-3 h-3 mt-0.5" />
                  )}
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </AnimatePresence>

            {executing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs text-amber-400"
              >
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 rounded-full bg-amber-400"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <span>Executing...</span>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 mb-4">
            <ChevronRight className="w-4 h-4 text-emerald-400" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a command or search..."
              className="flex-1 bg-slate-800 border-slate-700 text-slate-100 font-mono text-xs"
              autoFocus
            />
          </div>

          {/* Suggestions */}
          {input && filteredCommands.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <div className="text-xs text-slate-500 mb-2">Suggestions:</div>
              {filteredCommands.slice(0, 5).map((cmd, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleExecute(cmd.text)}
                  className="w-full flex items-center gap-2 p-2 rounded bg-slate-800 hover:bg-slate-700 transition-colors text-left"
                >
                  <Badge className={cn(
                    "text-[9px] py-0",
                    cmd.category === "mission" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                    cmd.category === "routing" && "bg-purple-500/20 text-purple-400 border-purple-500/30",
                    cmd.category === "analysis" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                    cmd.category === "monitoring" && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                    cmd.category === "optimization" && "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
                    cmd.category === "control" && "bg-red-500/20 text-red-400 border-red-500/30",
                    cmd.category === "reporting" && "bg-slate-500/20 text-slate-400 border-slate-500/30"
                  )}>
                    {cmd.category}
                  </Badge>
                  <span className="text-xs text-slate-300">{cmd.text}</span>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Help Text */}
          {!input && (
            <div className="text-xs text-slate-500 space-y-1">
              <div>💡 Try: "Launch invoice chase" or "Optimize for cost"</div>
              <div>⌘K to open/close console</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}