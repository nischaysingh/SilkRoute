import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, GitBranch, Bot, Workflow, Database, 
  ChevronRight, Copy, ExternalLink 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ContextMemory({ onRecall }) {
  const [recentContext] = useState([
    {
      id: 1,
      type: "build",
      category: "agent",
      title: "Invoice Reconciler Agent",
      description: "Built with QuickBooks integration, monthly schedule",
      timestamp: "2 hours ago",
      status: "deployed"
    },
    {
      id: 2,
      type: "build",
      category: "pipeline",
      title: "CRM Sync Pipeline",
      description: "Syncs customer data from HubSpot every 6 hours",
      timestamp: "Yesterday",
      status: "draft"
    },
    {
      id: 3,
      type: "suggestion",
      category: "optimization",
      title: "Cache API Results",
      description: "Applied to Customer Refund Handler workflow",
      timestamp: "2 days ago",
      status: "applied"
    },
    {
      id: 4,
      type: "build",
      category: "workflow",
      title: "Late Invoice Alert",
      description: "Triggers every Friday, emails finance team",
      timestamp: "3 days ago",
      status: "deployed"
    }
  ]);

  const [activeBuildThreads] = useState([
    {
      id: 1,
      title: "Refund Processing Automation",
      progress: 65,
      steps: 3,
      completedSteps: 2,
      lastUpdate: "15 min ago"
    },
    {
      id: 2,
      title: "Inventory Sync Agent",
      progress: 30,
      steps: 4,
      completedSteps: 1,
      lastUpdate: "1 hour ago"
    }
  ]);

  const handleRecall = (item) => {
    toast.success(`Loading: ${item.title}`);
    if (onRecall) {
      onRecall(item);
    }
  };

  const handleDuplicate = (item) => {
    toast.success(`Duplicating: ${item.title}`);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "agent": return Bot;
      case "pipeline": return Database;
      case "workflow": return Workflow;
      case "optimization": return GitBranch;
      default: return Clock;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "agent": return "bg-purple-100 text-purple-700";
      case "pipeline": return "bg-blue-100 text-blue-700";
      case "workflow": return "bg-emerald-100 text-emerald-700";
      case "optimization": return "bg-amber-100 text-amber-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "deployed": return "bg-emerald-100 text-emerald-700";
      case "draft": return "bg-amber-100 text-amber-700";
      case "applied": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Build Threads */}
      <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-600" />
              Active Build Threads
            </h3>
            <Badge className="bg-purple-100 text-purple-700 text-xs">
              {activeBuildThreads.length} in progress
            </Badge>
          </div>

          {activeBuildThreads.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No active builds</p>
          ) : (
            <div className="space-y-2">
              {activeBuildThreads.map((thread) => (
                <motion.div
                  key={thread.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-lg border-2 border-purple-200 bg-purple-50 cursor-pointer"
                  onClick={() => handleRecall({ ...thread, type: "thread" })}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-slate-900">{thread.title}</h4>
                    <span className="text-xs text-slate-500">{thread.lastUpdate}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${thread.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="text-xs font-bold text-purple-700">{thread.progress}%</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      {thread.completedSteps}/{thread.steps} steps completed
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Context */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              What We Discussed Today
            </h3>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs"
              onClick={() => toast.info("Showing full history...")}
            >
              View All
            </Button>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {recentContext.map((item, idx) => {
                const Icon = getCategoryIcon(item.category);
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                    onClick={() => handleRecall(item)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg", getCategoryColor(item.category))}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">
                            {item.title}
                          </h4>
                          <Badge className={cn("text-xs ml-2 flex-shrink-0", getStatusColor(item.status))}>
                            {item.status}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">{item.timestamp}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(item);
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRecall(item);
                              }}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="text-sm font-bold text-slate-900 mb-3">Quick Recall</h4>
          <div className="flex flex-wrap gap-2">
            {[
              "Show CRM pipeline",
              "Duplicate invoice agent",
              "Recent workflows",
              "Last week's builds"
            ].map((action, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                className="h-7 text-xs bg-white hover:bg-slate-50"
                onClick={() => toast.info(`Recalling: ${action}`)}
              >
                {action}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}