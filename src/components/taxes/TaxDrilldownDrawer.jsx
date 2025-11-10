import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FileText, Download, Send, TrendingUp, TrendingDown, Calendar,
  CheckCircle, Clock, AlertCircle, Info, BarChart3, Eye, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTaxInsights } from "./TaxInsightsContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ExplainThisViewModal from "./ExplainThisViewModal";

export default function TaxDrilldownDrawer({ open, onClose, taxData }) {
  const { setSelectedTaxType, generateAISummary } = useTaxInsights();
  const [aiInsight, setAiInsight] = useState(null);
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && taxData) {
      setLoading(true);
      setSelectedTaxType(taxData.id);
      setTimeout(() => {
        const summary = generateAISummary(taxData.id);
        setAiInsight(summary.narrative);
        setLoading(false);
      }, 300);
    }
  }, [open, taxData, setSelectedTaxType, generateAISummary]);

  if (!taxData) return null;

  const statusColors = {
    "Ready": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "Info Needed": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Not Started": "bg-gray-500/20 text-gray-400 border-gray-500/30"
  };

  const filingTimeline = [
    { date: "2024-10-15", event: "Filed Q3 2024", status: "Filed", confirmation: "EFTPS123456" },
    { date: "2025-01-15", event: "Next Due: Q4 2024", status: "Scheduled", confirmation: "—" }
  ];

  const jurisdictionData = [
    { name: "CA", amount: 12500 },
    { name: "NY", amount: 7700 },
    { name: "TX", amount: 5200 }
  ];

  const attachments = [
    { name: "Form 941.pdf", date: "2024-10-15", status: "Filed" },
    { name: "State_Withholding_CA.pdf", date: "2024-10-20", status: "Filed" }
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-[600px] bg-gray-900/95 backdrop-blur-xl border-white/10 text-white overflow-y-auto">
          <SheetHeader className="border-b border-white/10 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-xl text-white flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${taxData.color}`}>
                    <taxData.icon className="w-5 h-5 text-white" />
                  </div>
                  {taxData.title} — {taxData.period}
                </SheetTitle>
                <Badge className={cn("mt-2", statusColors[taxData.status])}>
                  {taxData.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                <Eye className="w-3 h-3 mr-1" />
                View Filing
              </Button>
              <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                <Download className="w-3 h-3 mr-1" />
                Export Detail
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                <FileText className="w-3 h-3 mr-1" />
                E-File Now
              </Button>
            </div>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Summary Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Tax Due</div>
                  <div className="text-lg font-bold text-white">${taxData.tax_due.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Paid to Date</div>
                  <div className="text-lg font-bold text-emerald-400">${taxData.paid_to_date.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Next Due Date</div>
                  <div className="text-sm font-semibold text-white">{format(new Date(taxData.next_due_date), 'MMM d, yyyy')}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Variance</div>
                  <div className={cn(
                    "text-sm font-semibold flex items-center gap-1",
                    taxData.variance > 0 ? "text-red-400" : "text-emerald-400"
                  )}>
                    {taxData.variance > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(taxData.variance)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Filing Timeline */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Filing Timeline</h3>
              <div className="space-y-3 pl-4 border-l-2 border-white/10">
                {filingTimeline.map((filing, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-blue-500 border-2 border-gray-900"></div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">{filing.event}</div>
                        <div className="text-xs text-gray-400">{format(new Date(filing.date), 'MMM d, yyyy')}</div>
                        {filing.confirmation !== "—" && (
                          <div className="text-xs text-gray-500 mt-1">Confirmation: {filing.confirmation}</div>
                        )}
                      </div>
                      <Badge className={cn(
                        "text-xs",
                        filing.status === "Filed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                        "bg-purple-500/20 text-purple-400 border-purple-500/30"
                      )}>
                        {filing.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Jurisdiction Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Jurisdiction Breakdown</h3>
              <div className="h-48 bg-white/5 rounded-lg p-4 border border-white/10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jurisdictionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value) => `$${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insight Block */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-400" />
                  AI Insight
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExplainModalOpen(true)}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-6 text-xs"
                >
                  <Info className="w-3 h-3 mr-1" />
                  Explain This
                </Button>
              </div>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-3 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-3 bg-white/10 rounded animate-pulse w-4/5"></div>
                </div>
              ) : (
                <p className="text-xs text-gray-300 leading-relaxed">{aiInsight}</p>
              )}
            </div>

            {/* Attachments / Records */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Attachments & Records</h3>
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-gray-400 text-xs">File Name</TableHead>
                      <TableHead className="text-gray-400 text-xs">Date</TableHead>
                      <TableHead className="text-gray-400 text-xs">Status</TableHead>
                      <TableHead className="text-gray-400 text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attachments.map((file, idx) => (
                      <TableRow key={idx} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white text-xs font-medium">{file.name}</TableCell>
                        <TableCell className="text-gray-400 text-xs">{file.date}</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                            {file.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" size="sm" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 justify-start">
                  <ArrowRight className="w-3 h-3 mr-2" />
                  Reconcile with Payroll
                </Button>
                <Button variant="outline" size="sm" className="bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 justify-start">
                  <ArrowRight className="w-3 h-3 mr-2" />
                  Generate Ledger Entry
                </Button>
                <Button variant="outline" size="sm" className="bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 justify-start">
                  <ArrowRight className="w-3 h-3 mr-2" />
                  Schedule Payment
                </Button>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Next Filing in 21 days</span>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Jan 15, 2025
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-xs text-white">Enable Auto-Filing for this jurisdiction</span>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ExplainThisViewModal
        open={explainModalOpen}
        onClose={() => setExplainModalOpen(false)}
      />
    </>
  );
}