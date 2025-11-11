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
      console.log('[Explain Mode] Toggled:', newState);
      
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
    console.log('[Explain Mode] Opening panel for widget:', widgetId, parsedData);

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
  }, []);

  // Log action click
  const logActionClick = useCallback((action, widgetTitle) => {
    console.log('[Explain Mode] Action clicked:', action, widgetTitle);
  }, []);

  // Parse widget content inline (no dynamic import)
  const parseWidgetContent = useCallback((element, metadata = {}) => {
    if (!element) return null;

    const extractTitle = (el) => {
      const titleSelectors = ['[class*="CardTitle"]', 'h2', 'h3', 'h4', '[class*="font-bold"]'];
      for (const selector of titleSelectors) {
        const titleEl = el.querySelector(selector);
        if (titleEl?.innerText?.trim()) return titleEl.innerText.trim();
      }
      return 'Widget';
    };

    const extractMetric = (el) => {
      const text = el.innerText;
      const currencyPattern = /[\$€£₹]\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*([KMB])?/gi;
      const matches = [...text.matchAll(currencyPattern)];
      if (matches.length > 0) return matches[0][0];
      
      const percentPattern = /(\d+(?:\.\d+)?)\s*%/g;
      const percentMatches = [...text.matchAll(percentPattern)];
      if (percentMatches.length > 0) return percentMatches[0][0];
      
      return null;
    };

    const extractTrend = (el) => {
      const hasUpArrow = el.querySelector('[class*="TrendingUp"]') || el.querySelector('[class*="ArrowUp"]');
      const hasDownArrow = el.querySelector('[class*="TrendingDown"]') || el.querySelector('[class*="ArrowDown"]');
      if (hasUpArrow) return 'up';
      if (hasDownArrow) return 'down';
      return null;
    };

    const extractDelta = (el) => {
      const text = el.innerText;
      const deltaPattern = /([+-]\s*\d+(?:\.\d+)?)\s*%/g;
      const matches = [...text.matchAll(deltaPattern)];
      return matches.length > 0 ? matches[0][0] : null;
    };

    const parsed = {
      title: metadata.title || extractTitle(element),
      metric: metadata.metric || extractMetric(element),
      unit: metadata.unit || (element.innerText.includes('$') ? '$' : element.innerText.includes('%') ? '%' : null),
      trend: metadata.trend || extractTrend(element),
      delta: metadata.delta || extractDelta(element),
      period: metadata.period || null,
      dimensions: metadata.dimensions || [],
      actions: metadata.actions || ['simulate', 'alert', 'create_policy'],
      rawText: element.innerText,
      parsedFields: []
    };

    Object.keys(parsed).forEach(key => {
      if (parsed[key] && key !== 'rawText' && key !== 'parsedFields') {
        parsed.parsedFields.push(key);
      }
    });

    return parsed;
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
        console.log('[Explain Mode] Parsed widget:', parsedData);
        openExplainPanel(elementId, parsedData);
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [isExplainModeActive, openExplainPanel, parseWidgetContent]);

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