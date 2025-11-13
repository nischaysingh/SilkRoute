import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, Maximize2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function MissionDependencyGraph({ nodes, edges, onNodeClick }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const containerRef = useRef(null);

  const width = 900;
  const height = 500;

  // Calculate positions using a force-directed layout simulation
  const nodePositions = React.useMemo(() => {
    const positions = {};
    const centerX = width / 2;
    const centerY = height / 2;

    // Group nodes by type
    const missions = nodes.filter(n => n.type === 'mission');
    const dataSources = nodes.filter(n => n.type === 'datasource');
    const policies = nodes.filter(n => n.type === 'policy');

    // Position missions in center
    missions.forEach((node, i) => {
      const angle = (i * 2 * Math.PI) / missions.length;
      const radius = 120;
      positions[node.id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    });

    // Position data sources on the right
    dataSources.forEach((node, i) => {
      positions[node.id] = {
        x: centerX + 280,
        y: centerY - 100 + (i * 120)
      };
    });

    // Position policies on the left
    policies.forEach((node, i) => {
      positions[node.id] = {
        x: centerX - 280,
        y: centerY - 50 + (i * 100)
      };
    });

    return positions;
  }, [nodes]);

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.classList.contains('graph-background')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev + delta)));
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getNodeColor = (type) => {
    switch (type) {
      case 'mission': return { bg: '#a855f7', border: '#7c3aed', text: '#ffffff' };
      case 'datasource': return { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' };
      case 'policy': return { bg: '#ef4444', border: '#dc2626', text: '#ffffff' };
      default: return { bg: '#64748b', border: '#475569', text: '#ffffff' };
    }
  };

  const getEdgeColor = (type) => {
    switch (type) {
      case 'calls': return '#8b5cf6';
      case 'validates': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur-sm h-8 w-8 p-0"
          onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur-sm h-8 w-8 p-0"
          onClick={() => setZoom(prev => Math.max(0.3, prev - 0.2))}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur-sm h-8 w-8 p-0"
          onClick={handleResetView}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Info Panel */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-4 z-10 w-64"
        >
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-purple-300 shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge className={cn(
                  "text-xs",
                  selectedNode.type === "mission" && "bg-purple-100 text-purple-700",
                  selectedNode.type === "datasource" && "bg-blue-100 text-blue-700",
                  selectedNode.type === "policy" && "bg-red-100 text-red-700"
                )}>
                  {selectedNode.type}
                </Badge>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-3">{selectedNode.label}</h4>
              <div className="space-y-2 text-xs">
                {selectedNode.runs !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Runs:</span>
                    <span className="font-bold text-slate-900">{selectedNode.runs.toLocaleString()}</span>
                  </div>
                )}
                {selectedNode.successRate !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Success Rate:</span>
                    <span className="font-bold text-emerald-600">{selectedNode.successRate}%</span>
                  </div>
                )}
                {selectedNode.calls !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">API Calls:</span>
                    <span className="font-bold text-blue-600">{selectedNode.calls.toLocaleString()}</span>
                  </div>
                )}
                {selectedNode.hits !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Policy Hits:</span>
                    <span className="font-bold text-amber-600">{selectedNode.hits}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Graph Canvas */}
      <div
        ref={containerRef}
        className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-slate-200 overflow-hidden relative"
        style={{ height: '500px', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width={width}
          height={height}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
          className="graph-background"
        >
          <defs>
            {/* Gradient for edges */}
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Arrow marker */}
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
            </marker>
          </defs>

          {/* Grid background */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Edges */}
          <g>
            {edges.map((edge, idx) => {
              const from = nodePositions[edge.from];
              const to = nodePositions[edge.to];
              if (!from || !to) return null;

              // Calculate edge thickness based on weight
              const thickness = Math.max(1, Math.min(8, edge.weight / 300));

              return (
                <g key={idx}>
                  {/* Edge line */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={getEdgeColor(edge.type)}
                    strokeWidth={thickness}
                    strokeOpacity={0.5}
                    markerEnd="url(#arrowhead)"
                  />
                  {/* Edge label */}
                  <text
                    x={(from.x + to.x) / 2}
                    y={(from.y + to.y) / 2}
                    fontSize="10"
                    fill="#64748b"
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                  >
                    {edge.type}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const colors = getNodeColor(node.type);
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;
              const nodeSize = isSelected || isHovered ? 70 : 60;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Glow effect for selected/hovered */}
                  {(isSelected || isHovered) && (
                    <circle
                      r={nodeSize / 2 + 8}
                      fill={colors.bg}
                      opacity="0.2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Node circle */}
                  <circle
                    r={nodeSize / 2}
                    fill={colors.bg}
                    stroke={colors.border}
                    strokeWidth={isSelected ? 4 : 2}
                    filter={isSelected || isHovered ? "url(#glow)" : "none"}
                    className="transition-all"
                  />

                  {/* Node label */}
                  <text
                    y={5}
                    fontSize="11"
                    fontWeight="600"
                    fill={colors.text}
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                  >
                    {node.label.length > 12 ? node.label.substring(0, 12) + '...' : node.label}
                  </text>

                  {/* Node stats badge */}
                  <text
                    y={nodeSize / 2 + 16}
                    fontSize="9"
                    fill="#64748b"
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                  >
                    {node.runs !== undefined && `${node.runs} runs`}
                    {node.calls !== undefined && `${node.calls} calls`}
                    {node.hits !== undefined && `${node.hits} hits`}
                  </text>

                  {/* Success rate indicator */}
                  {node.successRate !== undefined && (
                    <g>
                      <circle
                        r={nodeSize / 2 + 10}
                        fill="none"
                        stroke={node.successRate >= 95 ? "#10b981" : node.successRate >= 85 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="2"
                        strokeDasharray={`${(node.successRate / 100) * (2 * Math.PI * (nodeSize / 2 + 10))} ${2 * Math.PI * (nodeSize / 2 + 10)}`}
                        transform="rotate(-90)"
                        opacity="0.6"
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Zoom level indicator */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 border border-slate-200 text-xs text-slate-700">
          Zoom: {(zoom * 100).toFixed(0)}%
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
          <Info className="w-3 h-3" />
          <span>Drag to pan • Scroll to zoom • Click nodes for details</span>
        </div>
      </div>

      {/* Connection Statistics */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Card className="bg-purple-50 border-purple-200">
          <div className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {nodes.filter(n => n.type === 'mission').length}
            </div>
            <div className="text-xs text-slate-600">Active Missions</div>
          </div>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {nodes.filter(n => n.type === 'datasource').length}
            </div>
            <div className="text-xs text-slate-600">Data Sources</div>
          </div>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <div className="p-3 text-center">
            <div className="text-2xl font-bold text-red-600">
              {nodes.filter(n => n.type === 'policy').length}
            </div>
            <div className="text-xs text-slate-600">Active Policies</div>
          </div>
        </Card>
      </div>

      {/* Edge Statistics */}
      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-600">Total Connections:</span>
            <span className="ml-2 font-bold text-slate-900">{edges.length}</span>
          </div>
          <div>
            <span className="text-slate-600">API Calls:</span>
            <span className="ml-2 font-bold text-purple-600">
              {edges.filter(e => e.type === 'calls').reduce((sum, e) => sum + e.weight, 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-600">Validations:</span>
            <span className="ml-2 font-bold text-amber-600">
              {edges.filter(e => e.type === 'validates').reduce((sum, e) => sum + e.weight, 0)}
            </span>
          </div>
          <div>
            <span className="text-slate-600">Avg Degree:</span>
            <span className="ml-2 font-bold text-blue-600">
              {(edges.length / nodes.length).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}