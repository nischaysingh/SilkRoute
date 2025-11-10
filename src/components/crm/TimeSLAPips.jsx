import React from "react";
import { cn } from "@/lib/utils";

export default function TimeSLAPips({ days, thresholds = { warning: 14, critical: 30 } }) {
  const getColor = () => {
    if (days >= thresholds.critical) return "bg-red-500";
    if (days >= thresholds.warning) return "bg-amber-500";
    return "bg-gray-400";
  };

  const getPipCount = () => {
    if (days >= thresholds.critical) return 3;
    if (days >= thresholds.warning) return 2;
    return 1;
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: getPipCount() }).map((_, idx) => (
        <div
          key={idx}
          className={cn("w-1.5 h-1.5 rounded-full", getColor())}
        />
      ))}
    </div>
  );
}