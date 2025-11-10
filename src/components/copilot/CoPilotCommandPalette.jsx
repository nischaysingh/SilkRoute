import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Sparkles, TrendingUp, AlertTriangle, Workflow, 
  Database, FileText, Brain, GitBranch, Zap 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function CoPilotCommandPalette({ open, onOpenChange }) {
  const [query, setQuery] = useState("");

  const commands = [
    { id: 1, label: "Explain why spend spiked this week", category: "Understand", icon: TrendingUp, shortcut: null },
    { id: 2, label: "Suggest ways to cut cost by 15%", category: "Guide", icon: Sparkles, shortcut: null },
    { id: 3, label: "Build new agent for CRM sync", category: "Build", icon: Workflow, shortcut: null },
    { id: 4, label: "Create pipeline for invoice data", category: "Build", icon: GitBranch, shortcut: null },
    { id: 5, label: "Generate refund policy document", category: "Draft", icon: FileText, shortcut: null },
    { id: 6, label: "Analyze current mission performance", category: "Understand", icon: Brain, shortcut: null },
    { id: 7, label: "Review risk factors", category: "Understand", icon: AlertTriangle, shortcut: null },
    { id: 8, label: "Optimize data pipeline", category: "Guide", icon: Database, shortcut: null },
    { id: 9, label: "Show insight timeline", category: "Understand", icon: Zap, shortcut: null }
  ];

  const filteredCommands = query
    ? commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const getCategoryColor = (category) => {
    switch (category) {
      case "Understand": return "bg-blue-100 text-blue-700";
      case "Guide": return "bg-purple-100 text-purple-700";
      case "Build": return "bg-emerald-100 text-emerald-700";
      case "Draft": return "bg-amber-100 text-amber-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const handleCommandClick = (command) => {
    onOpenChange(false);
    // Trigger the command action
    console.log("Execute command:", command.label);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 p-0 max-w-2xl">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Co-Pilot commands... (type to filter)"
              className="pl-10 border-none focus-visible:ring-0 text-base"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          <AnimatePresence>
            {filteredCommands.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">No commands found</p>
              </div>
            ) : (
              filteredCommands.map((cmd, idx) => (
                <motion.div
                  key={cmd.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => handleCommandClick(cmd)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                    "hover:bg-slate-50 border border-transparent hover:border-purple-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100">
                      <cmd.icon className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{cmd.label}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", getCategoryColor(cmd.category))}>
                      {cmd.category}
                    </Badge>
                    {cmd.shortcut && (
                      <kbd className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            <span className="text-purple-600 font-semibold">⌘K to open anytime</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}