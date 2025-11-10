import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, Send, CheckCircle, XCircle, Clock, RefreshCw,
  Brain, Zap, GitBranch, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Floating Co-Pilot Avatar
export function CoPilotAvatar({ active, hint, onApprove, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hint && active) {
      setVisible(true);
    }
  }, [hint, active]);

  if (!active || !visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: 100 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0, x: 100 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-2xl border-0 max-w-xs">
        <CardContent className="p-3">
          <div className="flex items-start gap-2 mb-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="p-1.5 rounded-full bg-white/20"
            >
              <Brain className="w-4 h-4" />
            </motion.div>
            <div className="flex-1">
              <div className="text-xs font-bold mb-1">Co-Pilot Suggestion</div>
              <p className="text-xs leading-relaxed">{hint}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                onApprove?.();
                setVisible(false);
              }}
              className="flex-1 h-7 text-xs bg-white text-purple-600 hover:bg-white/90"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onDismiss?.();
                setVisible(false);
              }}
              className="flex-1 h-7 text-xs border-white/40 text-white hover:bg-white/10"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Co-Pilot Chat Panel
export function CoPilotChatPanel({ open, onOpenChange, messages, onSendMessage }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage?.(input);
    setInput("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-slate-200 w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-slate-900">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-5 h-5 text-purple-600" />
            </motion.div>
            Co-Pilot Collaboration
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Messages */}
          <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "flex gap-2",
                    msg.from === "user" && "justify-end"
                  )}
                >
                  {msg.from === "copilot" && (
                    <div className="p-1.5 rounded-full bg-purple-100 h-fit">
                      <Brain className="w-3 h-3 text-purple-600" />
                    </div>
                  )}
                  <div className={cn(
                    "rounded-lg p-3 max-w-[80%]",
                    msg.from === "user" 
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-900"
                  )}>
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                    {msg.action && (
                      <div className="mt-2 pt-2 border-t border-white/20">
                        <div className="flex items-center gap-1 text-[10px] text-white/80 mb-1">
                          <Zap className="w-2 h-2" />
                          Action: {msg.action}
                        </div>
                        {msg.status && (
                          <Badge className={cn(
                            "text-[9px] py-0",
                            msg.status === "completed" && "bg-emerald-100 text-emerald-700",
                            msg.status === "pending" && "bg-amber-100 text-amber-700"
                          )}>
                            {msg.status}
                          </Badge>
                        )}
                      </div>
                    )}
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
              placeholder="Ask Co-Pilot anything..."
              className="flex-1"
            />
            <Button onClick={handleSend} size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Collaboration Timeline
export function CollaborationTimeline({ actions }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardContent className="p-4">
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-purple-600" />
          Collaboration Timeline
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {actions.map((action, idx) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200"
            >
              <div className={cn(
                "p-1 rounded mt-0.5",
                action.actor === "pilot" && "bg-blue-100",
                action.actor === "copilot" && "bg-purple-100"
              )}>
                {action.actor === "pilot" ? (
                  <Sparkles className="w-3 h-3 text-blue-600" />
                ) : (
                  <Brain className="w-3 h-3 text-purple-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={cn(
                    "text-[9px] py-0 capitalize",
                    action.actor === "pilot" && "bg-blue-100 text-blue-700",
                    action.actor === "copilot" && "bg-purple-100 text-purple-700"
                  )}>
                    {action.actor}
                  </Badge>
                  <span className="text-[10px] text-slate-500">
                    {new Date(action.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-slate-900 leading-tight">{action.description}</p>
                {action.status && (
                  <div className="flex items-center gap-1 mt-1">
                    {action.status === "completed" && <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />}
                    {action.status === "pending" && <Clock className="w-2.5 h-2.5 text-amber-600" />}
                    <span className="text-[10px] text-slate-600 capitalize">{action.status}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Top Bar Toggle
export function CoPilotToggle({ enabled, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200"
    >
      <motion.div
        animate={enabled ? { rotate: [0, 360] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Brain className={cn(
          "w-4 h-4",
          enabled ? "text-purple-600" : "text-slate-400"
        )} />
      </motion.div>
      <Label htmlFor="copilot-toggle" className="text-xs font-semibold text-slate-900 cursor-pointer">
        🧩 Co-Pilot Mode
      </Label>
      <Switch
        id="copilot-toggle"
        checked={enabled}
        onCheckedChange={onToggle}
        className="scale-75"
      />
      {enabled && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-1"
        >
          <Badge className="bg-emerald-100 text-emerald-700 text-[9px] py-0">
            ACTIVE
          </Badge>
        </motion.div>
      )}
    </motion.div>
  );
}