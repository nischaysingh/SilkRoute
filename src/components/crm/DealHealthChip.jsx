import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DealHealthChip({ health, reasons = [] }) {
  const configs = {
    good: {
      icon: CheckCircle,
      className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      label: "On Track"
    },
    watch: {
      icon: AlertTriangle,
      className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      label: "Watch"
    },
    risk: {
      icon: XCircle,
      className: "bg-red-500/20 text-red-400 border-red-500/30",
      label: "At Risk"
    }
  };

  const config = configs[health] || configs.watch;
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={cn("text-xs flex items-center gap-1 cursor-help", config.className)}>
            <Icon className="w-3 h-3" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        {reasons.length > 0 && (
          <TooltipContent className="bg-gray-900/95 border-white/10 text-white max-w-xs">
            <div className="text-xs space-y-1">
              {reasons.map((reason, idx) => (
                <div key={idx}>• {reason}</div>
              ))}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}