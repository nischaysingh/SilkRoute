import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

const ExplainModeContext = createContext(null);

export function ExplainModeProvider({ children }) {
  const [isExplainModeActive, setIsExplainModeActive] = useState(false);
  const [explainPanelState, setExplainPanelState] = useState({
    isOpen: false,
    widgets: [], // Array of { id, data }
    activeTab: null,
    isPinned: false
  });
  
  const widgetRegistry = useRef(new Map());

  // Toggle Explain Mode
  const toggleExplainMode = useCallback(() => {
    setIsExplainModeActive(prev => {
      const newState = !prev;
      logEvent('explain_mode_toggled', { on: newState, page: window.location.pathname });
      
      if (!newState) {
        // Close panel when exiting Explain Mode (unless pinned)
        setExplainPanelState(prev => 
          prev.isPinned 
            ? prev 
            : { ...prev, isOpen: false, widgets: [], activeTab: null }
        );
      }
      
      return newState;
    });
  }, []);

  // Register an explainable widget
  const registerExplainableWidget = useCallback((widgetId, widgetRef, metadata) => {
    if (widgetRef) {
      widgetRegistry.current.set(widgetId, { ref: widgetRef, metadata });
    }
  }, []);

  // Unregister an explainable widget
  const unregisterExplainableWidget = useCallback((widgetId) => {
    widgetRegistry.current.delete(widgetId);
  }, []);

  // Open explain panel for a widget
  const openExplainPanel = useCallback((widgetId, parsedData) => {
    logEvent('explain_widget_opened', {
      page: window.location.pathname,
      title: parsedData.title,
      metric: parsedData.metric,
      trend: parsedData.trend,
      period: parsedData.period
    });

    logEvent('explain_widget_parsed', {
      title: parsedData.title,
      fields_detected: parsedData.parsedFields || []
    });

    setExplainPanelState(prev => {
      // Check if this widget is already in the panel
      const existingWidgetIndex = prev.widgets.findIndex(w => w.id === widgetId);
      
      if (existingWidgetIndex >= 0) {
        // Update existing widget data
        const updatedWidgets = [...prev.widgets];
        updatedWidgets[existingWidgetIndex] = { id: widgetId, data: parsedData };
        return {
          ...prev,
          isOpen: true,
          widgets: updatedWidgets,
          activeTab: widgetId
        };
      } else {
        // Add new widget
        return {
          ...prev,
          isOpen: true,
          widgets: [...prev.widgets, { id: widgetId, data: parsedData }],
          activeTab: widgetId
        };
      }
    });
  }, []);

  // Close explain panel
  const closeExplainPanel = useCallback(() => {
    setExplainPanelState(prev => ({
      ...prev,
      isOpen: false,
      widgets: prev.isPinned ? prev.widgets : [],
      activeTab: prev.isPinned ? prev.activeTab : null
    }));
  }, []);

  // Toggle pin state
  const togglePin = useCallback(() => {
    setExplainPanelState(prev => ({ ...prev, isPinned: !prev.isPinned }));
  }, []);

  // Set active tab
  const setActiveTab = useCallback((widgetId) => {
    setExplainPanelState(prev => ({ ...prev, activeTab: widgetId }));
  }, []);

  // Remove widget from panel
  const removeWidgetFromPanel = useCallback((widgetId) => {
    setExplainPanelState(prev => {
      const updatedWidgets = prev.widgets.filter(w => w.id !== widgetId);
      const newActiveTab = updatedWidgets.length > 0 
        ? (prev.activeTab === widgetId ? updatedWidgets[0].id : prev.activeTab)
        : null;
      
      return {
        ...prev,
        widgets: updatedWidgets,
        activeTab: newActiveTab,
        isOpen: updatedWidgets.length > 0
      };
    });
  }, []);

  // Log analytics event
  const logEvent = useCallback((eventName, data) => {
    console.log(`[Explain Mode Analytics] ${eventName}:`, data);
    // In production, send to analytics service
  }, []);

  // Log action click
  const logActionClick = useCallback((action, widgetTitle) => {
    logEvent('explain_widget_action', {
      action,
      title: widgetTitle,
      page: window.location.pathname
    });
  }, []);

  // Global click handler for ANY element when Explain Mode is active
  useEffect(() => {
    if (!isExplainModeActive) return;

    const handleGlobalClick = (e) => {
      // Don't interfere with buttons, inputs, or the explain panel itself
      if (
        e.target.closest('button') ||
        e.target.closest('input') ||
        e.target.closest('textarea') ||
        e.target.closest('[role="dialog"]') ||
        e.target.closest('.explain-copilot-panel')
      ) {
        return;
      }

      // Find the nearest card, chart container, table, or significant container
      const explainableElement = 
        e.target.closest('[data-explainable="true"]') ||
        e.target.closest('[class*="Card"]') ||
        e.target.closest('[class*="recharts"]') ||
        e.target.closest('table') ||
        e.target.closest('[class*="bg-"][class*="border"]');

      if (explainableElement && !e.target.closest('.explain-copilot-panel')) {
        e.stopPropagation();
        
        // Import parseWidgetContent dynamically
        import('./parseWidgetContent').then(({ parseWidgetContent }) => {
          // Generate a unique ID for this element
          const elementId = explainableElement.id || 
            `explain-${Math.random().toString(36).substr(2, 9)}`;
          
          // Get existing metadata from data attributes if present
          const metadata = {
            title: explainableElement.getAttribute('data-explain-title'),
            metric: explainableElement.getAttribute('data-explain-metric'),
            unit: explainableElement.getAttribute('data-explain-unit'),
            trend: explainableElement.getAttribute('data-explain-trend'),
            delta: explainableElement.getAttribute('data-explain-delta'),
            period: explainableElement.getAttribute('data-explain-period'),
            dimensions: explainableElement.getAttribute('data-explain-dimensions') 
              ? JSON.parse(explainableElement.getAttribute('data-explain-dimensions'))
              : undefined,
            actions: explainableElement.getAttribute('data-explain-actions')
              ? JSON.parse(explainableElement.getAttribute('data-explain-actions'))
              : undefined
          };

          const parsedData = parseWidgetContent(explainableElement, metadata);
          openExplainPanel(elementId, parsedData);
        });
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [isExplainModeActive, openExplainPanel]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle with 'E' key (only when not typing in an input)
      if (e.key.toLowerCase() === 'e' && 
          document.activeElement.tagName !== 'INPUT' && 
          document.activeElement.tagName !== 'TEXTAREA' &&
          !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggleExplainMode();
      }
      
      // Close panel with 'Esc' key
      if (e.key === 'Escape' && explainPanelState.isOpen) {
        e.preventDefault();
        closeExplainPanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleExplainMode, closeExplainPanel, explainPanelState.isOpen]);

  const value = {
    isExplainModeActive,
    toggleExplainMode,
    registerExplainableWidget,
    unregisterExplainableWidget,
    openExplainPanel,
    closeExplainPanel,
    explainPanelState,
    togglePin,
    setActiveTab,
    removeWidgetFromPanel,
    logActionClick
  };

  return (
    <ExplainModeContext.Provider value={value}>
      {children}
    </ExplainModeContext.Provider>
  );
}

export function useExplainMode() {
  const context = useContext(ExplainModeContext);
  if (!context) {
    throw new Error('useExplainMode must be used within ExplainModeProvider');
  }
  return context;
}