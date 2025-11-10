import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, Lightbulb, FileText, Send, Copy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AISidePanel({ open, onClose, context = {} }) {
  const [activeTab, setActiveTab] = useState("summary");

  const summary = context.summary || "AI-generated summary will appear here based on the selected context.";
  
  const risks = context.risks || [
    { title: "No exec sponsor", severity: "high", impact: "Deal may stall in legal" },
    { title: "Stage age >30 days", severity: "medium", impact: "Requires immediate action" },
    { title: "Low engagement", severity: "low", impact: "Schedule check-in call" }
  ];

  const nextActions = context.actions || [
    { action: "Schedule exec intro", priority: "high", draftAvailable: true },
    { action: "Send product usage report", priority: "medium", draftAvailable: true },
    { action: "Follow up on technical questions", priority: "low", draftAvailable: false }
  ];

  const drafts = context.drafts || [
    { type: "email", subject: "Checking in on your evaluation", preview: "Hi [Name], wanted to see how the team is finding..." },
    { type: "slack", subject: "Quick sync?", preview: "Hey! Do you have 15 min this week to discuss..." }
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white w-[500px] overflow-y-auto">
        <SheetHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Brain className="w-5 h-5 text-blue-400" />
            </div>
            <SheetTitle className="text-white">AI Insights</SheetTitle>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
              Live
            </Badge>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="bg-white/5 p-1 rounded-xl w-full grid grid-cols-4">
            <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
            <TabsTrigger value="risks" className="text-xs">Risks</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
            <TabsTrigger value="drafts" className="text-xs">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 mt-4">
            <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
            </div>
          </TabsContent>

          <TabsContent value="risks" className="space-y-3 mt-4">
            {risks.map((risk, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn(
                      "w-4 h-4",
                      risk.severity === "high" ? "text-red-400" :
                      risk.severity === "medium" ? "text-amber-400" :
                      "text-gray-400"
                    )} />
                    <span className="text-sm font-medium">{risk.title}</span>
                  </div>
                  <Badge className={cn(
                    "text-xs",
                    risk.severity === "high" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                    risk.severity === "medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                    "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  )}>
                    {risk.severity}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400">{risk.impact}</p>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="actions" className="space-y-3 mt-4">
            {nextActions.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium">{item.action}</span>
                  </div>
                  <Badge className={cn(
                    "text-xs",
                    item.priority === "high" ? "bg-red-500/20 text-red-400" :
                    item.priority === "medium" ? "bg-amber-500/20 text-amber-400" :
                    "bg-blue-500/20 text-blue-400"
                  )}>
                    {item.priority}
                  </Badge>
                </div>
                {item.draftAvailable && (
                  <Button size="sm" variant="outline" className="w-full mt-2 text-xs bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Generate Draft
                  </Button>
                )}
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="drafts" className="space-y-3 mt-4">
            {drafts.map((draft, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium">{draft.subject}</span>
                  <Badge className="bg-purple-500/20 text-purple-400 text-xs ml-auto">
                    {draft.type}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mb-3">{draft.preview}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20">
                    <Send className="w-3 h-3 mr-1" />
                    Send
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs bg-white/5 border-white/10 hover:bg-white/10">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}