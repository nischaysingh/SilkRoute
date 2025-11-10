import React from "react";
import { Badge } from "@/components/ui/badge";
import { Briefcase, DollarSign, Shield, Star, User } from "lucide-react";

export default function PersonaChip({ persona, influenceScore }) {
  const personaIcons = {
    CTO: Shield,
    CFO: DollarSign,
    CEO: Star,
    'VP Sales': Briefcase,
    Director: User,
    Manager: User,
    Engineer: User
  };

  const Icon = personaIcons[persona] || User;

  return (
    <div className="flex items-center gap-1">
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {persona}
      </Badge>
      {influenceScore && (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-mono">
          {influenceScore}
        </Badge>
      )}
    </div>
  );
}