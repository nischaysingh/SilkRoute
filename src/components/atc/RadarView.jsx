
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Play, Pause, Box, Eye } from "lucide-react";
import {
  TooltipProvider,
  Tooltip as UITooltip,
  TooltipTrigger as UITooltipTrigger,
  TooltipContent as UITooltipContent
} from "@/components/ui/tooltip";

export default function RadarView({ requests = [], onApprove, onHold, onSandbox, onExplain }) {
  const [hoveredRequest, setHoveredRequest] = useState(null);

  const getBlipPosition = (req) => {
    // Calculate position based on SLA time left and risk score
    const slaMs = req.sla_deadline ? new Date(req.sla_deadline) - new Date() : 0;
    const hoursLeft = Math.max(0, slaMs / (1000 * 60 * 60));
    
    // Radius based on time-to-SLA (closer to center = more urgent)
    const maxRadius = 180;
    const radius = Math.min(maxRadius, hoursLeft * 15);
    
    // Angle based on route
    const routeAngles = { pilot: 30, copilot: 150, autopilot: 270 };
    const baseAngle = routeAngles[req.route] || 0;
    const angleVariation = (Math.random() - 0.5) * 60;
    const angle = (baseAngle + angleVariation) * (Math.PI / 180);
    
    const x = 200 + radius * Math.cos(angle);
    const y = 200 + radius * Math.sin(angle);
    
    return { x, y, radius };
  };

  const getBlipColor = (req) => {
    if (req.risk_score >= 0.7 || req.breach_probability >= 0.5) return "#ef4444";
    if (req.risk_score >= 0.4 || req.breach_probability >= 0.25) return "#f59e0b";
    return "#10b981";
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardHeader className="border-b border-slate-200 pb-3">
        <CardTitle className="text-slate-900 text-sm">Radar View</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative w-full aspect-square max-w-[400px] mx-auto">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {/* Radar circles */}
            {[60, 120, 180].map((r, idx) => (
              <circle
                key={idx}
                cx="200"
                cy="200"
                r={r}
                fill="none"
                stroke="rgb(226, 232, 240)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
            
            {/* Radar sweep lines */}
            {[0, 60, 120, 180, 240, 300].map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <line
                  key={idx}
                  x1="200"
                  y1="200"
                  x2={200 + 180 * Math.cos(rad)}
                  y2={200 + 180 * Math.sin(rad)}
                  stroke="rgb(226, 232, 240)"
                  strokeWidth="1"
                  opacity="0.5"
                />
              );
            })}
            
            {/* Route labels */}
            <text x="200" y="30" textAnchor="middle" className="fill-blue-600 text-xs font-semibold">
              Pilot
            </text>
            <text x="350" y="210" textAnchor="start" className="fill-purple-600 text-xs font-semibold">
              Copilot
            </text>
            <text x="50" y="210" textAnchor="end" className="fill-emerald-600 text-xs font-semibold">
              Autopilot
            </text>
            
            {/* Request blips */}
            {requests.map((req) => {
              const { x, y } = getBlipPosition(req);
              const color = getBlipColor(req);
              const isHovered = hoveredRequest === req.id;
              
              return (
                <g key={req.id}>
                  <TooltipProvider>
                    <UITooltip>
                      <UITooltipTrigger>
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? 8 : 6}
                          fill={color}
                          opacity={0.8}
                          onMouseEnter={() => setHoveredRequest(req.id)}
                          onMouseLeave={() => setHoveredRequest(null)}
                          className="cursor-pointer transition-all duration-200"
                          style={{
                            filter: isHovered ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : 'none'
                          }}
                        />
                      </UITooltipTrigger>
                      <UITooltipContent className="bg-white border-slate-200 text-slate-900 p-3">
                        <div className="space-y-2 text-xs">
                          <div><strong>ID:</strong> {req.id.substring(0, 8)}...</div>
                          <div><strong>Intent:</strong> {req.intent}</div>
                          <div><strong>Route:</strong> {req.route}</div>
                          <div><strong>Risk:</strong> {(req.risk_score * 100).toFixed(0)}%</div>
                          {req.pii && <Badge className="bg-purple-50 text-purple-700 text-xs">PII</Badge>}
                          {req.vip && <Badge className="bg-amber-50 text-amber-700 text-xs">VIP</Badge>}
                          
                          <div className="flex gap-1 pt-2 border-t border-slate-200">
                            {req.state === 'queued' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onApprove?.(req);
                                  }}
                                  className="h-6 px-2 text-xs">
                                  <Play className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSandbox?.(req);
                                  }}
                                  className="h-6 px-2 text-xs">
                                  <Box className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onHold?.(req);
                                  }}
                                  className="h-6 px-2 text-xs">
                                  <Pause className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onExplain?.(req);
                              }}
                              className="h-6 px-2 text-xs">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </UITooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                  
                  {/* Pulsing ring for high risk */}
                  {(req.risk_score >= 0.7 || req.breach_probability >= 0.5) && (
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 12 : 10}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      opacity="0.4"
                      className="animate-ping"
                    />
                  )}
                </g>
              );
            })}
          </svg>
          
          {/* Center indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
            <span className="text-slate-600">Low Risk</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
            <span className="text-slate-600">Medium Risk</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></div>
            <span className="text-slate-600">High Risk</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
