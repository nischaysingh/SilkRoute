import { useEffect, useRef, useCallback } from "react";
import { useExplainMode } from "./ExplainModeContext";
import { parseWidgetContent } from "./parseWidgetContent";

export function useExplainableWidget(metadata = {}) {
  const {
    isExplainModeActive,
    registerExplainableWidget,
    unregisterExplainableWidget,
    openExplainPanel
  } = useExplainMode();

  const widgetRef = useRef(null);
  const widgetId = useRef(`explain-widget-${Math.random().toString(36).substr(2, 9)}`);

  // Register widget on mount
  useEffect(() => {
    if (widgetRef.current) {
      registerExplainableWidget(widgetId.current, widgetRef.current, metadata);
    }

    return () => {
      unregisterExplainableWidget(widgetId.current);
    };
  }, [metadata, registerExplainableWidget, unregisterExplainableWidget]);

  // Handle click to explain
  const handleExplainClick = useCallback((e) => {
    if (isExplainModeActive && widgetRef.current) {
      e.stopPropagation();
      const parsedData = parseWidgetContent(widgetRef.current, metadata);
      openExplainPanel(widgetId.current, parsedData);
    }
  }, [isExplainModeActive, metadata, openExplainPanel]);

  // Generate data-explain-* attributes
  const explainableProps = {
    ref: widgetRef,
    'data-explainable': 'true',
    ...(metadata.title && { 'data-explain-title': metadata.title }),
    ...(metadata.metric && { 'data-explain-metric': metadata.metric }),
    ...(metadata.unit && { 'data-explain-unit': metadata.unit }),
    ...(metadata.trend && { 'data-explain-trend': metadata.trend }),
    ...(metadata.delta && { 'data-explain-delta': metadata.delta }),
    ...(metadata.period && { 'data-explain-period': metadata.period }),
    ...(metadata.dimensions && { 'data-explain-dimensions': JSON.stringify(metadata.dimensions) }),
    ...(metadata.actions && { 'data-explain-actions': JSON.stringify(metadata.actions) }),
    ...(isExplainModeActive && {
      tabIndex: 0,
      role: 'button',
      'aria-label': `Explain ${metadata.title || 'widget'}`,
      onClick: handleExplainClick,
      onKeyDown: (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && isExplainModeActive) {
          e.preventDefault();
          handleExplainClick(e);
        }
      }
    })
  };

  return {
    explainableProps,
    isExplainModeActive,
    widgetRef
  };
}