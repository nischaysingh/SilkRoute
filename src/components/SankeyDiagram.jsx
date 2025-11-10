import React from "react";
import { cn } from "@/lib/utils";

export default function SankeyDiagram({ data, viewMode = "gross" }) {
  // Revenue flow data structure
  const flows = [
    { source: "Stripe", target: "Acme Corp", value: 12500, category: "Subscription" },
    { source: "Stripe", target: "Delta Corp", value: 3400, category: "Subscription" },
    { source: "DoorDash", target: "Jane Doe", value: 850, category: "Marketplace" },
    { source: "App Store", target: "Beta Inc", value: 4200, category: "Subscription" },
    { source: "AWS", target: "Gamma LLC", value: 8900, category: "Cloud Income" },
    { source: "Acme Corp", target: "Subscription", value: 12500 },
    { source: "Delta Corp", target: "Subscription", value: 3400 },
    { source: "Jane Doe", target: "Marketplace", value: 850 },
    { source: "Beta Inc", target: "Subscription", value: 4200 },
    { source: "Gamma LLC", target: "Cloud Income", value: 8900 },
  ];

  const sources = ["Stripe", "DoorDash", "App Store", "AWS"];
  const customers = ["Acme Corp", "Beta Inc", "Gamma LLC", "Delta Corp", "Jane Doe"];
  const categories = ["Subscription", "Marketplace", "Cloud Income"];

  const colors = {
    "Stripe": "#3b82f6",
    "DoorDash": "#8b5cf6",
    "App Store": "#ec4899",
    "AWS": "#f59e0b",
    "Subscription": "#10b981",
    "Marketplace": "#06b6d4",
    "Cloud Income": "#6366f1",
  };

  // Calculate totals for each node
  const getNodeTotal = (node, isSource) => {
    return flows
      .filter(f => isSource ? f.source === node : f.target === node)
      .reduce((sum, f) => sum + f.value, 0);
  };

  // Calculate node positions and heights
  const maxTotal = Math.max(
    ...sources.map(s => getNodeTotal(s, true)),
    ...customers.map(c => getNodeTotal(c, false)),
    ...categories.map(c => getNodeTotal(c, false))
  );

  const nodeHeight = (value) => Math.max((value / maxTotal) * 200, 20);

  return (
    <div className="relative w-full h-[400px] bg-white/5 rounded-lg p-6 overflow-hidden">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          {Object.entries(colors).map(([key, color]) => (
            <linearGradient key={key} id={`gradient-${key}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.3 }} />
            </linearGradient>
          ))}
        </defs>

        {/* Layer 1 to Layer 2 flows (Sources to Customers) */}
        {flows.filter(f => sources.includes(f.source)).map((flow, idx) => {
          const sourceIdx = sources.indexOf(flow.source);
          const targetIdx = customers.indexOf(flow.target);
          const sourceY = 50 + sourceIdx * 80;
          const targetY = 50 + targetIdx * 60;
          const height = nodeHeight(flow.value);

          return (
            <g key={`flow1-${idx}`}>
              <path
                d={`M 100,${sourceY} C 200,${sourceY} 200,${targetY} 300,${targetY}`}
                fill="none"
                stroke={`url(#gradient-${flow.source})`}
                strokeWidth={height / 4}
                opacity="0.7"
                className="transition-all duration-300 hover:opacity-1"
              />
            </g>
          );
        })}

        {/* Layer 2 to Layer 3 flows (Customers to Categories) */}
        {flows.filter(f => customers.includes(f.source)).map((flow, idx) => {
          const sourceIdx = customers.indexOf(flow.source);
          const targetIdx = categories.indexOf(flow.target);
          const sourceY = 50 + sourceIdx * 60;
          const targetY = 80 + targetIdx * 100;
          const height = nodeHeight(flow.value);

          return (
            <g key={`flow2-${idx}`}>
              <path
                d={`M 350,${sourceY} C 450,${sourceY} 450,${targetY} 550,${targetY}`}
                fill="none"
                stroke={`url(#gradient-${flow.target})`}
                strokeWidth={height / 4}
                opacity="0.7"
                className="transition-all duration-300 hover:opacity-1"
              />
            </g>
          );
        })}

        {/* Layer 1 Nodes (Sources) */}
        {sources.map((source, idx) => {
          const total = getNodeTotal(source, true);
          const height = nodeHeight(total);
          const y = 50 + idx * 80 - height / 2;

          return (
            <g key={`source-${idx}`}>
              <rect
                x="80"
                y={y}
                width="20"
                height={height}
                fill={colors[source]}
                rx="4"
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              />
              <text
                x="70"
                y={50 + idx * 80}
                textAnchor="end"
                className="fill-white text-xs font-medium"
              >
                {source}
              </text>
              <text
                x="70"
                y={50 + idx * 80 + 12}
                textAnchor="end"
                className="fill-gray-400 text-[10px]"
              >
                ${(total / 1000).toFixed(1)}k
              </text>
            </g>
          );
        })}

        {/* Layer 2 Nodes (Customers) */}
        {customers.map((customer, idx) => {
          const total = getNodeTotal(customer, false);
          const height = nodeHeight(total);
          const y = 50 + idx * 60 - height / 2;

          return (
            <g key={`customer-${idx}`}>
              <rect
                x="300"
                y={y}
                width="50"
                height={height}
                fill="#8b5cf6"
                rx="4"
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              />
              <text
                x="325"
                y={50 + idx * 60 - 8}
                textAnchor="middle"
                className="fill-white text-xs font-medium"
              >
                {customer.split(' ')[0]}
              </text>
            </g>
          );
        })}

        {/* Layer 3 Nodes (Categories) */}
        {categories.map((category, idx) => {
          const total = getNodeTotal(category, false);
          const height = nodeHeight(total);
          const y = 80 + idx * 100 - height / 2;

          return (
            <g key={`category-${idx}`}>
              <rect
                x="550"
                y={y}
                width="20"
                height={height}
                fill={colors[category]}
                rx="4"
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              />
              <text
                x="580"
                y={80 + idx * 100}
                textAnchor="start"
                className="fill-white text-xs font-medium"
              >
                {category}
              </text>
              <text
                x="580"
                y={80 + idx * 100 + 12}
                textAnchor="start"
                className="fill-gray-400 text-[10px]"
              >
                ${(total / 1000).toFixed(1)}k
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#3b82f6" }}></div>
          <span className="text-gray-400">Payment Channels</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#8b5cf6" }}></div>
          <span className="text-gray-400">Customers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#10b981" }}></div>
          <span className="text-gray-400">Revenue Types</span>
        </div>
      </div>
    </div>
  );
}