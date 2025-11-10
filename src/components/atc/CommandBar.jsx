import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Command, Sparkles, Pause, Settings, AlertTriangle, Radar, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CommandBar({ open, onOpenChange, onExecuteCommand }) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    {
      id: "pause-source-webhook",
      label: "Pause Source: Webhook",
      icon: Pause,
      category: "Control",
      keywords: ["pause", "stop", "webhook", "source"]
    },
    {
      id: "switch-profile-cost-save",
      label: "Switch Profile to Cost-Save",
      icon: Settings,
      category: "Profile",
      keywords: ["switch", "profile", "cost", "save"]
    },
    {
      id: "switch-profile-high-accuracy",
      label: "Switch Profile to High-Accuracy",
      icon: Settings,
      category: "Profile",
      keywords: ["switch", "profile", "high", "accuracy"]
    },
    {
      id: "open-incident",
      label: "Open Incident #...",
      icon: AlertTriangle,
      category: "Incident",
      keywords: ["incident", "open", "view"]
    },
    {
      id: "explain-request",
      label: "Explain Request #...",
      icon: Sparkles,
      category: "Analysis",
      keywords: ["explain", "request", "reasoning"]
    },
    {
      id: "dispatch-mission",
      label: "Dispatch New Mission",
      icon: Radar,
      category: "Mission",
      keywords: ["dispatch", "mission", "new", "create"]
    },
    {
      id: "refresh-queue",
      label: "Refresh Queue",
      icon: RefreshCw,
      category: "Control",
      keywords: ["refresh", "reload", "queue"]
    },
    {
      id: "auto-prioritize",
      label: "Auto-Prioritize Queue",
      icon: Sparkles,
      category: "AI",
      keywords: ["auto", "prioritize", "ai", "smart"]
    },
    {
      id: "batch-approve-low",
      label: "Batch Approve Low Priority",
      icon: Command,
      category: "Batch",
      keywords: ["batch", "approve", "low", "priority"]
    }
  ];

  const filteredCommands = search
    ? commands.filter(cmd =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.keywords.some(k => k.includes(search.toLowerCase()))
      )
    : commands;

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleExecute(filteredCommands[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedIndex, filteredCommands]);

  const handleExecute = (command) => {
    onExecuteCommand?.(command);
    onOpenChange(false);
    setSearch("");
  };

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-slate-700 text-white p-0 max-w-2xl">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
            <Command className="w-4 h-4 text-slate-400" />
            <Input
              placeholder="Type a command or search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-0 text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs bg-slate-700 rounded text-slate-400">⌘K</kbd>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category} className="px-2 py-2">
              <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase">
                {category}
              </div>
              {cmds.map((cmd, idx) => {
                const globalIndex = filteredCommands.indexOf(cmd);
                const isSelected = globalIndex === selectedIndex;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleExecute(cmd)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800"
                    )}
                  >
                    <cmd.icon className={cn("w-4 h-4", isSelected ? "text-white" : "text-slate-400")} />
                    <span className="flex-1 text-sm">{cmd.label}</span>
                    {isSelected && (
                      <kbd className="px-2 py-0.5 text-xs bg-blue-700 rounded">↵</kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm text-slate-500">No commands found</p>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">↵</kbd>
                Execute
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">Esc</kbd>
                Close
              </span>
            </div>
            <span className="text-slate-600">AI-powered suggestions</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}