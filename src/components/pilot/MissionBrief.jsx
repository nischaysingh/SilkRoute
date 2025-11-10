import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FileText, Download, Send, Mail, Sparkles, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function MissionBrief({ missions }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [brief, setBrief] = useState(null);

  const generateBrief = () => {
    setGenerating(true);

    setTimeout(() => {
      const activeMissions = missions.filter(m => m.state === "running");
      const avgLatency = Math.round(
        activeMissions.reduce((sum, m) => sum + m.avgLatency, 0) / activeMissions.length
      );
      const totalTokens = activeMissions.reduce((sum, m) => sum + m.tokensPerRun, 0);
      const avgSuccess = Math.round(
        activeMissions.reduce((sum, m) => sum + m.successRate, 0) / activeMissions.length
      );

      setBrief({
        period: "This Week",
        summary: `This week, Pilot reduced average latency by 180ms (-18%) and cut cost by 12%. Three policy relaxations drove most savings. Success rate improved to ${avgSuccess}% across ${activeMissions.length} active missions.`,
        keyMetrics: [
          { label: "Avg Latency", value: `${avgLatency}ms`, change: "-180ms", trend: "down" },
          { label: "Cost Reduction", value: "12%", change: "-$0.42", trend: "down" },
          { label: "Success Rate", value: `${avgSuccess}%`, change: "+2.3%", trend: "up" },
          { label: "Total Runs", value: "1,847", change: "+215", trend: "up" }
        ],
        highlights: [
          "Pilot v2.4 configuration achieved 7.8% efficiency gain",
          "Auto-scaled concurrency 3x during peak hours",
          "Zero policy violations detected",
          "Co-Pilot reduced error rate by 6% through smart retries"
        ],
        recommendations: [
          "Consider locking Pilot v2.4 configuration as baseline",
          "Invoice_chase_v1 ready for full autonomy mode",
          "Batch_pick_opt_v2 would benefit from parallel processing"
        ]
      });

      setGenerating(false);
    }, 1500);
  };

  const handleExport = (format) => {
    toast.success(`Exporting as ${format}...`, {
      description: "Download will start shortly"
    });
  };

  const handleCopy = () => {
    if (brief) {
      const text = `${brief.period} Mission Brief\n\n${brief.summary}\n\nKey Metrics:\n${brief.keyMetrics.map(m => `${m.label}: ${m.value} (${m.change})`).join('\n')}\n\nHighlights:\n${brief.highlights.map(h => `• ${h}`).join('\n')}`;
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setDrawerOpen(true);
          if (!brief) generateBrief();
        }}
        className="h-7 text-xs border-slate-200 bg-white hover:bg-slate-50"
      >
        <FileText className="w-3 h-3 mr-1" />
        Mission Brief
      </Button>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="bg-white border-slate-200 w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Mission Brief
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {generating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center mb-4"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <p className="text-sm text-slate-600">Generating executive summary...</p>
              </div>
            ) : brief ? (
              <>
                {/* Header */}
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-purple-600 text-white text-xs py-0.5 px-2">
                        {brief.period}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCopy}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {brief.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <h5 className="text-sm font-bold text-slate-900 mb-3">Key Metrics</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {brief.keyMetrics.map((metric, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                          <div className="text-xs text-slate-600 mb-1">{metric.label}</div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-lg font-bold text-slate-900">{metric.value}</span>
                            <Badge className={cn(
                              "text-[9px] py-0",
                              metric.trend === "down" && metric.label.includes("Latency") || metric.label.includes("Cost") 
                                ? "bg-emerald-100 text-emerald-700"
                                : metric.trend === "up" 
                                  ? "bg-emerald-100 text-emerald-700" 
                                  : "bg-slate-100 text-slate-700"
                            )}>
                              {metric.change}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Highlights */}
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <h5 className="text-sm font-bold text-slate-900 mb-3">Highlights</h5>
                    <ul className="space-y-2">
                      {brief.highlights.map((highlight, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-2 text-xs text-slate-700"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                          <span>{highlight}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <h5 className="text-sm font-bold text-amber-900 mb-3">AI Recommendations</h5>
                    <ul className="space-y-2">
                      {brief.recommendations.map((rec, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-2 text-xs text-slate-700"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Export Options */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExport("PDF")}
                    className="w-full"
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExport("Email")}
                    className="w-full"
                  >
                    <Mail className="w-3 h-3 mr-2" />
                    Send Email
                  </Button>
                </div>

                {/* Regenerate */}
                <Button
                  variant="ghost"
                  onClick={generateBrief}
                  className="w-full text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Regenerate Brief
                </Button>
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}