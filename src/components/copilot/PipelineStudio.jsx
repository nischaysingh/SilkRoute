import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Plus, Play, Database, Filter, GitMerge, Save } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function PipelineStudio() {
  const [nodes, setNodes] = useState([
    { id: 1, type: "source", label: "Orders API", x: 50, y: 100, config: "Fetch all orders from last 24h" },
    { id: 2, type: "transform", label: "Filter", x: 250, y: 100, config: "transactions > $10k" },
    { id: 3, type: "transform", label: "Aggregate", x: 450, y: 100, config: "Group by customer_id" },
    { id: 4, type: "output", label: "QuickBooks", x: 650, y: 100, config: "Update invoice records" }
  ]);

  const [preview] = useState({
    recordsProcessed: 1247,
    recordsFiltered: 843,
    recordsOutputted: 156,
    estimatedRuntime: "2.3s",
    estimatedCost: "$0.012"
  });

  const getNodeColor = (type) => {
    switch (type) {
      case "source": return "bg-blue-100 border-blue-300 text-blue-800";
      case "transform": return "bg-purple-100 border-purple-300 text-purple-800";
      case "output": return "bg-emerald-100 border-emerald-300 text-emerald-800";
      default: return "bg-slate-100 border-slate-300 text-slate-800";
    }
  };

  const getNodeIcon = (type) => {
    switch (type) {
      case "source": return Database;
      case "transform": return Filter;
      case "output": return GitMerge;
      default: return GitBranch;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitBranch className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">Pipeline Studio</h2>
                <p className="text-sm text-slate-600">Map your data flow and transformations visually</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Play className="w-4 h-4 mr-1" />
                Run Pipeline
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-6">
          <div className="relative h-96 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {nodes.map((node, idx) => {
                if (idx < nodes.length - 1) {
                  const nextNode = nodes[idx + 1];
                  return (
                    <line
                      key={idx}
                      x1={node.x + 100}
                      y1={node.y + 30}
                      x2={nextNode.x}
                      y2={nextNode.y + 30}
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  );
                }
                return null;
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const Icon = getNodeIcon(node.type);
              return (
                <motion.div
                  key={node.id}
                  drag
                  dragMomentum={false}
                  style={{ position: "absolute", left: node.x, top: node.y }}
                  className="cursor-move"
                >
                  <div className={`p-3 rounded-lg border-2 shadow-lg w-32 ${getNodeColor(node.type)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-bold">{node.label}</span>
                    </div>
                    <p className="text-[10px] leading-tight">{node.config}</p>
                  </div>
                </motion.div>
              );
            })}

            {/* Add Node Button */}
            <Button
              size="sm"
              variant="outline"
              className="absolute bottom-4 right-4"
              onClick={() => {
                toast.success("New node added");
                setNodes([...nodes, {
                  id: nodes.length + 1,
                  type: "transform",
                  label: "New Step",
                  x: 50,
                  y: 50,
                  config: "Configure this step..."
                }]);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Node
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Node Library */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-4">
          <h4 className="text-sm font-bold text-slate-900 mb-3">Node Library</h4>
          <div className="grid grid-cols-4 gap-2">
            {[
              { type: "source", label: "API Source", icon: Database },
              { type: "source", label: "Database", icon: Database },
              { type: "transform", label: "Filter", icon: Filter },
              { type: "transform", label: "Map", icon: GitBranch },
              { type: "transform", label: "Aggregate", icon: GitMerge },
              { type: "transform", label: "Join", icon: GitMerge },
              { type: "output", label: "Database", icon: Database },
              { type: "output", label: "API Output", icon: GitMerge }
            ].map((nodeType, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="flex flex-col h-auto py-2"
                onClick={() => toast.info(`Add ${nodeType.label} node`)}
              >
                <nodeType.icon className="w-4 h-4 mb-1" />
                <span className="text-xs">{nodeType.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="text-sm font-bold text-blue-900 mb-3">Live Preview</h4>
          <div className="grid grid-cols-5 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{preview.recordsProcessed}</div>
              <div className="text-xs text-slate-600">Records In</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">{preview.recordsFiltered}</div>
              <div className="text-xs text-slate-600">Filtered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-900">{preview.recordsOutputted}</div>
              <div className="text-xs text-slate-600">Output</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">{preview.estimatedRuntime}</div>
              <div className="text-xs text-slate-600">Est. Runtime</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">{preview.estimatedCost}</div>
              <div className="text-xs text-slate-600">Est. Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Optimization Suggestions */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <h4 className="text-sm font-bold text-purple-900 mb-3">🤖 Co-Pilot Suggestions</h4>
          <div className="space-y-2">
            <div className="p-3 rounded bg-white border border-purple-200">
              <p className="text-sm text-slate-900 mb-2">
                💡 Use cached results from mission <strong>InvoiceSync</strong> for faster load
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-100 text-emerald-700 text-xs">Est. 65% faster</Badge>
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  Apply Optimization
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}