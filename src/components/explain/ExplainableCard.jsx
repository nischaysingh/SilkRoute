import React from "react";
import { Card } from "@/components/ui/card";
import { useExplainableWidget } from "./useExplainableWidget";
import { cn } from "@/lib/utils";

/**
 * Wrapper component that makes any Card explainable
 * Usage: <ExplainableCard explain={{ title: "Revenue", metric: "$128k", trend: "up" }}>
 */
export default function ExplainableCard({ 
  children, 
  explain = {}, 
  className,
  ...props 
}) {
  const { explainableProps, isExplainModeActive } = useExplainableWidget(explain);

  return (
    <Card
      {...props}
      {...explainableProps}
      className={cn(
        className,
        isExplainModeActive && "explain-mode-active"
      )}
    >
      {children}
    </Card>
  );
}