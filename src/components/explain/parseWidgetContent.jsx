// Parse widget content from DOM and metadata
export function parseWidgetContent(element, metadata = {}) {
  if (!element) {
    return {
      title: 'Unknown Widget',
      metric: null,
      unit: null,
      trend: null,
      delta: null,
      period: null,
      dimensions: [],
      actions: ['explain_more'],
      rawText: '',
      parsedFields: []
    };
  }

  const parsed = {
    title: metadata.title || extractTitle(element),
    metric: metadata.metric || extractMetric(element),
    unit: metadata.unit || extractUnit(element),
    trend: metadata.trend || extractTrend(element),
    delta: metadata.delta || extractDelta(element),
    period: metadata.period || extractPeriod(element),
    dimensions: metadata.dimensions || [],
    actions: metadata.actions || inferDefaultActions(element),
    rawText: element.innerText || element.textContent || '',
    parsedFields: []
  };

  // Track what fields were successfully parsed
  Object.keys(parsed).forEach(key => {
    if (parsed[key] && key !== 'rawText' && key !== 'parsedFields' && key !== 'actions') {
      parsed.parsedFields.push(key);
    }
  });

  return parsed;
}

// Extract title from widget
function extractTitle(element) {
  try {
    // Try CardTitle, then h2, h3, h4
    const titleSelectors = [
      '[class*="CardTitle"]',
      'h2', 'h3', 'h4', 'h5',
      '[class*="font-bold"]',
      '[class*="font-semibold"]'
    ];

    for (const selector of titleSelectors) {
      const titleEl = element.querySelector(selector);
      if (titleEl?.innerText?.trim()) {
        return titleEl.innerText.trim();
      }
    }

    // Fallback to first text node
    const text = element.innerText?.trim();
    if (text) {
      return text.split('\n')[0].substring(0, 50);
    }
  } catch (e) {
    console.error('Error extracting title:', e);
  }

  return 'Widget';
}

// Extract primary metric (largest number with currency/suffix)
function extractMetric(element) {
  try {
    const text = element.innerText || element.textContent || '';
    
    // Look for currency values with K/M/B suffixes
    const currencyPattern = /[\$€£₹]\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*([KMB])?/gi;
    const currencyMatches = [...text.matchAll(currencyPattern)];
    
    if (currencyMatches.length > 0) {
      const values = currencyMatches.map(match => {
        let num = parseFloat(match[1].replace(/,/g, ''));
        const suffix = match[2];
        if (suffix === 'K') num *= 1000;
        if (suffix === 'M') num *= 1000000;
        if (suffix === 'B') num *= 1000000000;
        return { original: match[0], value: num };
      });
      
      values.sort((a, b) => b.value - a.value);
      return values[0].original;
    }

    // Look for percentages
    const percentPattern = /(\d+(?:\.\d+)?)\s*%/g;
    const percentMatches = [...text.matchAll(percentPattern)];
    if (percentMatches.length > 0) {
      return percentMatches[0][0];
    }

    // Look for plain large numbers
    const numberPattern = /(\d+(?:,\d{3})+(?:\.\d+)?)/g;
    const numberMatches = [...text.matchAll(numberPattern)];
    if (numberMatches.length > 0) {
      return numberMatches[0][0];
    }
  } catch (e) {
    console.error('Error extracting metric:', e);
  }

  return null;
}

// Extract unit
function extractUnit(element) {
  try {
    const text = element.innerText || element.textContent || '';
    
    if (text.includes('$') || text.includes('USD')) return '$';
    if (text.includes('€') || text.includes('EUR')) return '€';
    if (text.includes('%')) return '%';
    if (text.includes('ms') || text.includes('milliseconds')) return 'ms';
    if (text.includes('days') || text.includes('d')) return 'days';
    if (text.includes('months') || text.includes('mo')) return 'months';
  } catch (e) {
    console.error('Error extracting unit:', e);
  }
  
  return null;
}

// Extract trend direction
function extractTrend(element) {
  try {
    const text = (element.innerText || element.textContent || '').toLowerCase();
    
    // Check for arrow icons in className
    const hasUpArrow = element.querySelector('[class*="TrendingUp"]') || 
                        element.querySelector('[class*="ArrowUp"]');
    const hasDownArrow = element.querySelector('[class*="TrendingDown"]') || 
                          element.querySelector('[class*="ArrowDown"]');
    
    if (hasUpArrow) return 'up';
    if (hasDownArrow) return 'down';

    // Check for color-based badges
    const hasGreenBadge = element.querySelector('[class*="bg-emerald"]') || 
                          element.querySelector('[class*="bg-green"]');
    const hasRedBadge = element.querySelector('[class*="bg-red"]');
    
    if (hasGreenBadge && !hasRedBadge) return 'up';
    if (hasRedBadge && !hasGreenBadge) return 'down';

    // Check text patterns
    if (text.includes('increased') || text.includes('growth') || text.includes('improvement')) return 'up';
    if (text.includes('decreased') || text.includes('decline') || text.includes('drop')) return 'down';
    if (text.includes('stable') || text.includes('unchanged')) return 'flat';
  } catch (e) {
    console.error('Error extracting trend:', e);
  }
  
  return null;
}

// Extract delta (change percentage/amount)
function extractDelta(element) {
  try {
    const text = element.innerText || element.textContent || '';
    
    // Look for +/- percentage changes
    const deltaPattern = /([+-]\s*\d+(?:\.\d+)?)\s*%/g;
    const deltaMatches = [...text.matchAll(deltaPattern)];
    
    if (deltaMatches.length > 0) {
      return deltaMatches[0][0];
    }

    // Look for +/- currency changes
    const currencyDeltaPattern = /([+-]\s*[\$€£₹]\s*\d+(?:,\d{3})*(?:\.\d+)?)\s*([KMB])?/g;
    const currencyDeltaMatches = [...text.matchAll(currencyDeltaPattern)];
    
    if (currencyDeltaMatches.length > 0) {
      return currencyDeltaMatches[0][0];
    }
  } catch (e) {
    console.error('Error extracting delta:', e);
  }

  return null;
}

// Extract time period
function extractPeriod(element) {
  try {
    const text = element.innerText || element.textContent || '';
    
    // Look for common period patterns
    const periodPatterns = [
      /Last\s+\d+\s+(days?|weeks?|months?|years?)/i,
      /This\s+(week|month|quarter|year)/i,
      /(Q[1-4]\s+\d{4})/i,
      /YTD/i,
      /MTD/i,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/i,
      /\d{4}-\d{2}-\d{2}/
    ];

    for (const pattern of periodPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    // Look for period in badges
    const badges = element.querySelectorAll('[class*="Badge"]');
    for (const badge of badges) {
      const badgeText = badge.innerText || badge.textContent || '';
      for (const pattern of periodPatterns) {
        const match = badgeText.match(pattern);
        if (match) {
          return match[0];
        }
      }
    }
  } catch (e) {
    console.error('Error extracting period:', e);
  }

  return null;
}

// Infer default actions based on widget type
function inferDefaultActions(element) {
  try {
    const className = element.className || '';
    const text = (element.innerText || element.textContent || '').toLowerCase();

    // Check if it's a chart
    if (element.querySelector('[class*="recharts"]') || className.includes('chart')) {
      return ['simulate', 'new_workflow', 'alert'];
    }

    // Check if it's a table
    if (element.querySelector('table') || className.includes('table')) {
      return ['new_agent', 'create_policy', 'alert'];
    }

    // Check for specific content types
    if (text.includes('forecast') || text.includes('prediction')) {
      return ['simulate', 'alert', 'create_policy'];
    }

    if (text.includes('trend') || text.includes('growth')) {
      return ['simulate', 'new_workflow', 'alert'];
    }
  } catch (e) {
    console.error('Error inferring actions:', e);
  }

  // Default for KPI cards
  return ['simulate', 'alert'];
}

// Generate explanation bullets
export function generateExplanation(parsedData) {
  const bullets = [];

  try {
    if (parsedData.metric) {
      bullets.push(`Current value: ${parsedData.metric}${parsedData.unit || ''}`);
    }

    if (parsedData.delta) {
      const direction = parsedData.trend === 'up' ? 'increased' : parsedData.trend === 'down' ? 'decreased' : 'changed';
      bullets.push(`This ${direction} by ${parsedData.delta}${parsedData.period ? ` over ${parsedData.period}` : ''}`);
    } else if (parsedData.trend) {
      const direction = parsedData.trend === 'up' ? 'trending upward' : parsedData.trend === 'down' ? 'trending downward' : 'stable';
      bullets.push(`Currently ${direction}${parsedData.period ? ` for ${parsedData.period}` : ''}`);
    }

    if (parsedData.period && bullets.length === 1) {
      bullets.push(`Period: ${parsedData.period}`);
    }

    if (parsedData.dimensions && parsedData.dimensions.length > 0) {
      bullets.push(`Segmented by: ${parsedData.dimensions.join(', ')}`);
    }

    if (bullets.length === 0) {
      bullets.push('Showing key metrics and trends');
      bullets.push('Click actions below to interact with this data');
    }
  } catch (e) {
    console.error('Error generating explanation:', e);
    bullets.push('Data analysis available');
  }

  return bullets;
}

// Generate heuristic reasoning
export function generateHeuristics(parsedData) {
  const reasons = [];

  try {
    if (parsedData.trend === 'up' && parsedData.delta) {
      const deltaNum = parseFloat(parsedData.delta.replace(/[^0-9.-]/g, ''));
      if (deltaNum > 15) {
        reasons.push('Significant increase detected - may indicate operational changes or seasonal effects');
      } else if (deltaNum > 5) {
        reasons.push('Moderate growth - consistent with expected patterns');
      } else {
        reasons.push('Slight uptick - within normal variance range');
      }
    } else if (parsedData.trend === 'down' && parsedData.delta) {
      const deltaNum = Math.abs(parseFloat(parsedData.delta.replace(/[^0-9.-]/g, '')));
      if (deltaNum > 15) {
        reasons.push('Sharp decline - recommend investigation into root causes');
      } else if (deltaNum > 5) {
        reasons.push('Noticeable decrease - may require attention');
      } else {
        reasons.push('Minor decrease - likely within acceptable variance');
      }
    }

    if (parsedData.period) {
      if (parsedData.period.toLowerCase().includes('ytd')) {
        reasons.push('Year-to-date view provides cumulative perspective');
      } else if (parsedData.period.toLowerCase().includes('last')) {
        reasons.push('Historical view helps identify patterns and anomalies');
      }
    }

    if (parsedData.dimensions && parsedData.dimensions.length > 0) {
      reasons.push('Segmentation allows for targeted analysis and action');
    }

    if (reasons.length === 0) {
      reasons.push('Multiple factors may influence this metric');
      reasons.push('Consider cross-referencing with related data points');
    }
  } catch (e) {
    console.error('Error generating heuristics:', e);
    reasons.push('Analysis available through AI reasoning');
  }

  return reasons;
}