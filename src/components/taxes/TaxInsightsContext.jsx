import React, { createContext, useContext, useState } from "react";

const TaxInsightsContext = createContext();

export function TaxInsightsProvider({ children }) {
  const [selectedTaxType, setSelectedTaxType] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("2024-Q4");
  const [aiSummary, setAiSummary] = useState(null);
  const [complianceScore, setComplianceScore] = useState(92);

  const generateAISummary = (taxType = null) => {
    if (taxType === "payroll") {
      return {
        narrative: "Payroll tax increased 6.4% due to two new hires in Engineering. No anomalies detected in withholding patterns. Compliance improved +3% following early filings in Q4.",
        confidence: 94,
        variances: [
          { type: "Payroll Tax", change: "+6.4%", driver: "New hires", insight: "Higher gross payroll" },
          { type: "Sales Tax", change: "0%", driver: "Consistent revenue", insight: "Stable quarter" },
          { type: "Income Tax", change: "+2.1%", driver: "Deferred credits", insight: "Adjusted forecast" }
        ]
      };
    } else if (taxType === "sales") {
      return {
        narrative: "Sales tax remained stable across CA and NY. Minor dip in retail channel offset by online sales growth. No compliance issues detected.",
        confidence: 91,
        variances: [
          { type: "Sales Tax", change: "-2.3%", driver: "Retail slowdown", insight: "Offset by online" },
          { type: "State Tax (CA)", change: "+1.2%", driver: "Rate adjustment", insight: "As expected" }
        ]
      };
    } else if (taxType === "income") {
      return {
        narrative: "Income tax estimates aligned with projected annual income. No adjustments needed. Ready for filing in April.",
        confidence: 88,
        variances: [
          { type: "Income Tax", change: "0%", driver: "On target", insight: "No surprises" }
        ]
      };
    } else {
      return {
        narrative: "Payroll tax increased 6.4% due to two new hires in Engineering. Sales tax remained stable across CA and NY. Compliance improved +3% following early filings in Q4.",
        confidence: 92,
        variances: [
          { type: "Payroll Tax", change: "+6.4%", driver: "New hires", insight: "Higher gross payroll" },
          { type: "Sales Tax", change: "0%", driver: "Consistent revenue", insight: "Stable quarter" },
          { type: "Income Tax", change: "+2.1%", driver: "Deferred credits", insight: "Adjusted forecast" }
        ]
      };
    }
  };

  return (
    <TaxInsightsContext.Provider value={{
      selectedTaxType,
      setSelectedTaxType,
      selectedPeriod,
      setSelectedPeriod,
      aiSummary,
      setAiSummary,
      complianceScore,
      setComplianceScore,
      generateAISummary
    }}>
      {children}
    </TaxInsightsContext.Provider>
  );
}

export function useTaxInsights() {
  const context = useContext(TaxInsightsContext);
  if (!context) {
    throw new Error("useTaxInsights must be used within TaxInsightsProvider");
  }
  return context;
}