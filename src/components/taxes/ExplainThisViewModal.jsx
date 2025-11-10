import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info, TrendingUp, CheckCircle, Copy, Send, Download, BarChart3, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaxInsights } from "./TaxInsightsContext";
import { motion } from "framer-motion";

export default function ExplainThisViewModal({ open, onClose }) {
  const { selectedTaxType, selectedPeriod, generateAISummary, complianceScore } = useTaxInsights();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setTimeout(() => {
        const generated = generateAISummary(selectedTaxType);
        setSummary(generated);
        setLoading(false);
      }, 500);
    }
  }, [open, selectedTaxType, generateAISummary]);

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary.narrative);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                {selectedTaxType ? `${selectedTaxType.charAt(0).toUpperCase() + selectedTaxType.slice(1)} Tax Overview` : "Quarterly Tax Overview"} — AI Summary
              </DialogTitle>
              <p className="text-sm text-gray-400 mt-1">Automated analysis of tax movement, variance, and compliance performance</p>
            </div>
            {summary && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Confidence: {summary.confidence}%
              </Badge>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-8">
            <div className="h-4 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 bg-white/10 rounded animate-pulse w-4/5"></div>
            <div className="h-4 bg-white/10 rounded animate-pulse w-3/5"></div>
          </div>
        ) : summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 py-4"
          >
            {/* AI Narrative Block */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white mb-2">AI Narrative</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{summary.narrative}</p>
                </div>
              </div>
            </div>

            {/* Variance Breakdown Table */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Variance Breakdown
              </h3>
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-gray-400 text-xs">Tax Type</TableHead>
                      <TableHead className="text-gray-400 text-xs">Change %</TableHead>
                      <TableHead className="text-gray-400 text-xs">Driver</TableHead>
                      <TableHead className="text-gray-400 text-xs">AI Insight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.variances.map((variance, idx) => (
                      <TableRow key={idx} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white text-xs font-medium">{variance.type}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-xs",
                            variance.change.startsWith("+") ? "bg-red-500/20 text-red-400 border-red-500/30" :
                            variance.change.startsWith("-") ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                            "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          )}>
                            {variance.change}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300 text-xs">{variance.driver}</TableCell>
                        <TableCell className="text-gray-400 text-xs">{variance.insight}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Compliance Pulse Widget */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Compliance Pulse
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Compliance Health</span>
                    <span className="text-sm font-bold text-emerald-400">{complianceScore}/100</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${complianceScore}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    ></motion.div>
                  </div>
                </div>
                <p className="text-xs text-gray-400">5 filings upcoming · 0 overdue</p>
              </div>
            </div>

            {/* Recommended Actions */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Recommended Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                >
                  <Copy className="w-3 h-3 mr-2" />
                  Copy Summary
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                >
                  <Send className="w-3 h-3 mr-2" />
                  Send to Slack
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                >
                  <Download className="w-3 h-3 mr-2" />
                  Export to FP&A
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                >
                  <BarChart3 className="w-3 h-3 mr-2" />
                  Simulate Next Quarter
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 text-center">
                Generated by Silkroute AI — updated automatically each quarter
              </p>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}