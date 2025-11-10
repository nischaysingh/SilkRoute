import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Network, Bot, Database, Workflow, Zap, 
  GitBranch, ExternalLink, Eye, ZoomIn, ZoomOut 
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CoPilotCanvas({ onNodeClick }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);

  // Mock data - would come from actual build context
  const [nodes] = useState([
    {
      id: "agent_1",
      type: "agent",
      name: "Invoice Reconciler",
      status: "active",
      x: 150,
      y: 100,
      connections: ["pipeline_1", "workflow_1"]
    },
    {
      id: "pipeline_1",
      type: "pipeline",
      name: "QuickBooks Sync",
      status: "active",
      x: 400,
      y: 100,
      connections: ["data_1"]
    },
    {
      id: "data_1",
      type: "data",
      name: "Invoice Data",
      status: "active",
      x: 650,
      y: 100,
      connections: []
    },
    {
      id: "workflow_1",
      type: "workflow",
      name: "Late Invoice Alert",
      status: "active",
      x: 150,
      y: 250,
      connections: ["integration_1"]
    },
    {
      id: "integration_1",
      type: "integration",
      name: "Slack Notification",
      status: "active",
      x: 400,
      y: 250,
      connections: []
    },
    {
      id: "agent_2",
      type: "agent",
      name: "CRM Sync Agent",
      status: "draft",
      x: 150,
      y: 400,
      connections: ["pipeline_2"]
    },
    {
      id: "pipeline_2",
      type: "pipeline",
      name: "HubSpot Pipeline",
      status: "draft",
      x: 400,
      y: 400,
      connections: []
    }
  ]);

  const getNodeIcon = (type) => {
    switch (type) {
      case "agent": return Bot;
      case "pipeline": return Database;
      case "workflow": return Workflow;
      case "integration": return Zap;
      case "data": return GitBranch;
      default: return Network;
    }
  };

  const getNodeColor = (type) => {
    switch (type) {
      case "agent": return "from-purple-500 to-purple-600";
      case "pipeline": return "from-blue-500 to-blue-600";
      case "workflow": return "from-emerald-500 to-emerald-600";
      case "integration": return "from-amber-500 to-amber-600";
      case "data": return "from-slate-500 to-slate-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-700";
      case "draft": return "bg-amber-100 text-amber-700";
      case "error": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    toast.success(`Opening: ${node.name}`);
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <Card className="bg-white border-slate-200 overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Network className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Co-Pilot Canvas</h3>
                <p className="text-xs text-slate-600">Unified view of your AI operations brain</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleZoomOut}
                className="h-7 w-7 p-0"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs font-semibold text-slate-700 min-w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleZoomIn}
                className="h-7 w-7 p-0"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
          {/* Grid background */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #94a3b8 1px, transparent 1px),
                linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />

          {/* Canvas content */}
          <div
            className="absolute inset-0 transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          >
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {nodes.map(node =>
                node.connections.map(targetId => {
                  const targetNode = nodes.find(n => n.id === targetId);
                  if (!targetNode) return null;

                  return (
                    <motion.line
                      key={`${node.id}-${targetId}`}
                      x1={node.x + 60}
                      y1={node.y + 40}
                      x2={targetNode.x}
                      y2={targetNode.y + 40}
                      stroke={selectedNode?.id === node.id || selectedNode?.id === targetId ? "#8b5cf6" : "#cbd5e1"}
                      strokeWidth={selectedNode?.id === node.id || selectedNode?.id === targetId ? 3 : 2}
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  );
                })
              )}
            </svg>

            {/* Nodes */}
            {nodes.map((node, idx) => {
              const Icon = getNodeIcon(node.type);
              const isSelected = selectedNode?.id === node.id;
              const isConnected = selectedNode?.connections.includes(node.id) || 
                                  nodes.some(n => n.id === selectedNode?.id && node.connections.includes(n.id));

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isSelected ? 1.1 : 1,
                    zIndex: isSelected ? 50 : 10
                  }}
                  transition={{ delay: idx * 0.1 }}
                  className="absolute cursor-pointer group"
                  style={{ 
                    left: node.x, 
                    top: node.y,
                    width: 200
                  }}
                  onClick={() => handleNodeClick(node)}
                >
                  <div className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    isSelected 
                      ? "border-purple-400 bg-purple-50 shadow-xl" 
                      : isConnected
                      ? "border-blue-300 bg-blue-50 shadow-lg"
                      : "border-slate-200 bg-white shadow-md hover:border-purple-300 hover:shadow-lg"
                  )}>
                    {/* Pulse effect for selected */}
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-purple-400 opacity-20"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}

                    <div className="flex items-center gap-3 mb-2 relative z-10">
                      <div className={cn(
                        "p-2 rounded-lg bg-gradient-to-br",
                        getNodeColor(node.type)
                      )}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">
                          {node.name}
                        </h4>
                        <Badge className={cn("text-xs", getStatusColor(node.status))}>
                          {node.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 relative z-10">
                      <span className="capitalize">{node.type}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info(`Inspecting: ${node.name}`);
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNodeClick(node);
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 p-3">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Legend</h4>
            <div className="space-y-1">
              {[
                { type: "agent", label: "AI Agent" },
                { type: "pipeline", label: "Data Pipeline" },
                { type: "workflow", label: "Workflow" },
                { type: "integration", label: "Integration" },
                { type: "data", label: "Data Source" }
              ].map((item) => {
                const Icon = getNodeIcon(item.type);
                return (
                  <div key={item.type} className="flex items-center gap-2">
                    <div className={cn(
                      "p-1 rounded bg-gradient-to-br",
                      getNodeColor(item.type)
                    )}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-slate-700">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-600">Total Nodes</span>
                <span className="text-sm font-bold text-slate-900">{nodes.length}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-600">Active</span>
                <span className="text-sm font-bold text-emerald-600">
                  {nodes.filter(n => n.status === "active").length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-600">Draft</span>
                <span className="text-sm font-bold text-amber-600">
                  {nodes.filter(n => n.status === "draft").length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Node Details */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t border-slate-200 bg-purple-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedNode.name}</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Connected to {selectedNode.connections.length} components
                </p>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => handleNodeClick(selectedNode)}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open Builder
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}