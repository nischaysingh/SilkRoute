import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Mail, Phone, Calendar } from "lucide-react";

export default function OwnerAvatar({ name, weeklyTouches = {} }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold cursor-help">
            {initials}
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-900/95 border-white/10 text-white">
          <div className="text-xs space-y-1">
            <div className="font-semibold mb-2">{name}</div>
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3" />
              <span>{weeklyTouches.email || 0} emails this week</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3" />
              <span>{weeklyTouches.call || 0} calls this week</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>{weeklyTouches.meeting || 0} meetings this week</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}