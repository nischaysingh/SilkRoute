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
        // Close panel when exiting Explain Mode
        setExplainPanelState(prev => ({ ...prev, isOpen: false, widgets: [], activeTab: null }));
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