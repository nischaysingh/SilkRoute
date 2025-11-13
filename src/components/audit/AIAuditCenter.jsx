import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, TrendingUp, CheckCircle, XCircle, Play, Download, Loader2, Eye, Target, Lock, Activity, FileText, Brain, Scale, Gauge, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { performAIAudit } from "@/functions/performAIAudit";

const COLORS = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#3b82f6",
  low: "#10b981"
};

export default function AIAuditCenter() {
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [auditReport, setAuditReport] = useState(null);
  const [auditConfig, setAuditConfig] = useState({
    timeRangeDays: 30,
    analysisDepth: "comprehensive"
  });

  const runAudit = async () => {
    setRunning(true);
    setAuditDialogOpen(false);
    setReportDialogOpen(true);

    try {
      toast.loading("Running AI audit...", { id: "ai-audit" });

      const response = await performAIAudit(auditConfig);

      if (response.data.success) {
        setAuditReport(response.data);
        toast.success("AI audit completed", {
          id: "ai-audit",
          description: `Analyzed ${response.data.metadata.data_points_analyzed.ai_requests} AI interactions`
        });
      } else {
        throw new Error(response.data.error || "Audit failed");
      }
    } catch (error) {
      console.error("Audit error:", error);
      toast.error("Audit failed", {
        id: "ai-audit",
        description: error.message
      });
    } finally {
      setRunning(false);
    }
  };

  const downloadReport = () => {
    if (!auditReport) return;

    const report = auditReport.audit_report;
    const reportText = `AI SYSTEM AUDIT REPORT
========================
Generated: ${new Date(auditReport.metadata.analysis_date).toLocaleString()}
Time Range: Last ${auditReport.metadata.time_range_days} days

EXECUTIVE SUMMARY
-----------------
Overall Health Score: ${(report.executive_summary.overall_health_score * 100).toFixed(0)}%
Risk Level: ${report.executive_summary.risk_level}
Compliance Status: ${report.executive_summary.compliance_status}

Key Findings:
${report.executive_summary.key_findings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

BIAS ANALYSIS
-------------
Bias Detected: ${report.bias_analysis.bias_detected ? 'YES' : 'NO'}
Severity: ${report.bias_analysis.severity}

Findings:
${report.bias_analysis.findings.map((f, i) => `
${i + 1}. ${f.category}
   Description: ${f.description}
   Evidence: ${f.evidence}
   Recommendation: ${f.recommendation}
`).join('\n')}

SECURITY RISKS
--------------
Critical Risks: ${report.security_risks.critical_risks}
High Risks: ${report.security_risks.high_risks}

Detailed Risks:
${report.security_risks.risks.map((r, i) => `
${i + 1}. ${r.title} [${r.severity}]
   Description: ${r.description}
   Affected Systems: ${r.affected_systems.join(', ')}
   Mitigation: ${r.mitigation}
`).join('\n')}

PERFORMANCE ANALYSIS
--------------------
Efficiency Score: ${(report.performance_analysis.efficiency_score * 100).toFixed(0)}%

Bottlenecks:
${report.performance_analysis.bottlenecks.map((b, i) => `
${i + 1}. ${b.component}
   Issue: ${b.issue}
   Impact: ${b.impact}
   Optimization: ${b.optimization}
`).join('\n')}

Cost Optimization Opportunities:
${report.performance_analysis.cost_optimization_opportunities.map((o, i) => `${i + 1}. ${o}`).join('\n')}

COMPLIANCE ASSESSMENT
---------------------
Compliant: ${report.compliance_assessment.compliant ? 'YES' : 'NO'}
Audit Trail Completeness: ${(report.compliance_assessment.audit_trail_completeness * 100).toFixed(0)}%

${report.compliance_assessment.violations.length > 0 ? `Violations:
${report.compliance_assessment.violations.map((v, i) => `
${i + 1}. ${v.regulation} [${v.severity}]
   Description: ${v.description}
   Remediation: ${v.remediation}
`).join('\n')}` : 'No violations detected'}

RECOMMENDATIONS
---------------
IMMEDIATE ACTIONS:
${report.recommendations.immediate_actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

SHORT-TERM (1-3 months):
${report.recommendations.short_term.map((a, i) => `${i + 1}. ${a}`).join('\n')}

LONG-TERM (3-12 months):
${report.recommendations.long_term.map((a, i) => `${i + 1}. ${a}`).join('\n')}

---
Data Points Analyzed:
- AI Requests: ${auditReport.metadata.data_points_analyzed.ai_requests}
- Workflow Executions: ${auditReport.metadata.data_points_analyzed.workflow_executions}
- Audit Logs: ${auditReport.metadata.data_points_analyzed.audit_logs}
- Personas: ${auditReport.metadata.data_points_analyzed.personas}
- Missions: ${auditReport.metadata.data_points_analyzed.missions}
`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Audit_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Report downloaded");
  };

  const riskDistribution = auditReport?.audit_report.security_risks.risks.reduce((acc, risk) => {
    acc[risk.severity] = (acc[risk.severity] || 0) + 1;
    return acc;
  }, {});

  const riskChartData = riskDistribution ? Object.entries(riskDistribution).map(([severity, count]) => ({
    name: severity,
    value: count
  })) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            AI System Audit Center
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Comprehensive analysis of AI interactions, security, bias, and compliance
          </p>
        </div>
        <Button
          onClick={() => setAuditDialogOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Play className="w-4 h-4 mr-2" />
          Run Audit
        </Button>
      </div>

      {/* Quick Stats */}
      {auditReport && (
        <div className="grid grid-cols-4 gap-4">
          <Card className={cn(
            "border-2",
            auditReport.audit_report.executive_summary.overall_health_score >= 0.8 ? "bg-emerald-50 border-emerald-300" :
            auditReport.audit_report.executive_summary.overall_health_score >= 0.6 ? "bg-blue-50 border-blue-300" :
            "bg-amber-50 border-amber-300"
          )}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Gauge className="w-5 h-5 text-slate-600" />
                <Badge className="bg-white/80 text-xs">Score</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {(auditReport.audit_report.executive_summary.overall_health_score * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-slate-700">Overall Health</div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-2",
            auditReport.audit_report.executive_summary.risk_level === "low" ? "bg-emerald-50 border-emerald-300" :
            auditReport.audit_report.executive_summary.risk_level === "medium" ? "bg-amber-50 border-amber-300" :
            "bg-red-50 border-red-300"
          )}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-slate-600" />
                <Badge className="bg-white/80 text-xs">Risk</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1 capitalize">
                {auditReport.audit_report.executive_summary.risk_level}
              </div>
              <div className="text-xs text-slate-700">Risk Level</div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-2",
            auditReport.audit_report.compliance_assessment.compliant ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300"
          )}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Scale className="w-5 h-5 text-slate-600" />
                <Badge className="bg-white/80 text-xs">Status</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {auditReport.audit_report.compliance_assessment.compliant ? "Pass" : "Fail"}
              </div>
              <div className="text-xs text-slate-700">Compliance</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-300 border-2">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-slate-600" />
                <Badge className="bg-white/80 text-xs">Data</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {auditReport.metadata.data_points_analyzed.ai_requests + auditReport.metadata.data_points_analyzed.workflow_executions}
              </div>
              <div className="text-xs text-slate-700">Interactions</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audit Configuration Dialog */}
      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Configure AI Audit
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Set parameters for comprehensive AI system analysis
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Time Range</Label>
              <Select
                value={auditConfig.timeRangeDays.toString()}
                onValueChange={(v) => setAuditConfig(prev => ({ ...prev, timeRangeDays: parseInt(v) }))}
              >
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Analysis Depth</Label>
              <Select
                value={auditConfig.analysisDepth}
                onValueChange={(v) => setAuditConfig(prev => ({ ...prev, analysisDepth: v }))}
              >
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="quick">Quick (Basic checks)</SelectItem>
                  <SelectItem value="standard">Standard (Recommended)</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive (Deep analysis)</SelectItem>
                  <SelectItem value="forensic">Forensic (Maximum detail)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Audit Scope</h4>
                <div className="space-y-1 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                    <span>Bias detection in routing and decision-making</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                    <span>Security vulnerability assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                    <span>Performance bottleneck identification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                    <span>Compliance and governance review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                    <span>Operational excellence assessment</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    Estimated analysis time: ~{auditConfig.analysisDepth === "forensic" ? "3-5" : auditConfig.analysisDepth === "comprehensive" ? "2-3" : "1-2"} minutes
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAuditDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={runAudit} className="flex-1 bg-purple-600 hover:bg-purple-700">
              <Play className="w-4 h-4 mr-2" />
              Run Audit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Audit Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  AI System Audit Report
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  {auditReport && `Generated ${new Date(auditReport.metadata.analysis_date).toLocaleString()}`}
                </DialogDescription>
              </div>
              {auditReport && (
                <Button onClick={downloadReport} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </DialogHeader>

          {running ? (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                </motion.div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Analyzing AI System...</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Scanning {auditConfig.timeRangeDays} days of data for bias, security, and performance issues
                </p>
                <div className="max-w-md mx-auto">
                  <div className="space-y-2 text-xs text-slate-600 mb-3">
                    <div className="flex items-center justify-between">
                      <span>Analyzing AI interactions...</span>
                      <Loader2 className="w-3 h-3 animate-spin" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Detecting bias patterns...</span>
                      <Loader2 className="w-3 h-3 animate-spin" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Scanning for security risks...</span>
                      <Loader2 className="w-3 h-3 animate-spin" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : auditReport ? (
            <Tabs defaultValue="summary" className="mt-4">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="summary">Executive Summary</TabsTrigger>
                <TabsTrigger value="bias">Bias Analysis</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="recommendations">Actions</TabsTrigger>
              </TabsList>

              {/* Executive Summary */}
              <TabsContent value="summary" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card className={cn(
                    "border-2",
                    auditReport.audit_report.executive_summary.overall_health_score >= 0.8 ? "bg-emerald-50 border-emerald-300" :
                    auditReport.audit_report.executive_summary.overall_health_score >= 0.6 ? "bg-blue-50 border-blue-300" :
                    "bg-amber-50 border-amber-300"
                  )}>
                    <CardContent className="p-5 text-center">
                      <Gauge className="w-8 h-8 mx-auto mb-3 text-slate-700" />
                      <div className="text-4xl font-bold text-slate-900 mb-2">
                        {(auditReport.audit_report.executive_summary.overall_health_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-slate-700 font-semibold">System Health</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-50 border-slate-300 border-2">
                    <CardContent className="p-5 text-center">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-slate-700" />
                      <div className="text-4xl font-bold text-slate-900 mb-2 capitalize">
                        {auditReport.audit_report.executive_summary.risk_level}
                      </div>
                      <div className="text-sm text-slate-700 font-semibold">Risk Level</div>
                    </CardContent>
                  </Card>

                  <Card className={cn(
                    "border-2",
                    auditReport.audit_report.compliance_assessment.compliant ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300"
                  )}>
                    <CardContent className="p-5 text-center">
                      <Scale className="w-8 h-8 mx-auto mb-3 text-slate-700" />
                      <div className="text-4xl font-bold text-slate-900 mb-2">
                        {auditReport.audit_report.compliance_assessment.compliant ? "Pass" : "Fail"}
                      </div>
                      <div className="text-sm text-slate-700 font-semibold">Compliance</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-base text-slate-900">Key Findings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {auditReport.audit_report.executive_summary.key_findings.map((finding, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-blue-200">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-sm text-slate-700">{finding}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-900">Data Analyzed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-3 text-center text-xs">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{auditReport.metadata.data_points_analyzed.ai_requests}</div>
                        <div className="text-slate-600">AI Requests</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{auditReport.metadata.data_points_analyzed.workflow_executions}</div>
                        <div className="text-slate-600">Workflows</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">{auditReport.metadata.data_points_analyzed.audit_logs}</div>
                        <div className="text-slate-600">Audit Logs</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-amber-600">{auditReport.metadata.data_points_analyzed.personas}</div>
                        <div className="text-slate-600">Personas</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-pink-600">{auditReport.metadata.data_points_analyzed.missions}</div>
                        <div className="text-slate-600">Missions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bias Analysis */}
              <TabsContent value="bias" className="space-y-4 mt-4">
                <Card className={cn(
                  "border-2",
                  auditReport.audit_report.bias_analysis.bias_detected ? "bg-amber-50 border-amber-300" : "bg-emerald-50 border-emerald-300"
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-900">Bias Detection Status</h4>
                      <Badge className={cn(
                        "text-sm px-3 py-1",
                        auditReport.audit_report.bias_analysis.bias_detected ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {auditReport.audit_report.bias_analysis.bias_detected ? "Issues Found" : "No Bias Detected"}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-700">
                      Severity Level: <strong className="capitalize">{auditReport.audit_report.bias_analysis.severity}</strong>
                    </div>
                  </CardContent>
                </Card>

                {auditReport.audit_report.bias_analysis.findings.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">Detailed Findings</h4>
                    {auditReport.audit_report.bias_analysis.findings.map((finding, idx) => (
                      <Card key={idx} className="border-2 border-amber-200 bg-amber-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="text-base font-bold text-slate-900">{finding.category}</h5>
                            <Badge className="bg-amber-100 text-amber-700 text-xs">Bias</Badge>
                          </div>
                          <p className="text-sm text-slate-700 mb-2">{finding.description}</p>
                          <div className="p-3 bg-white rounded border border-amber-200 mb-2">
                            <div className="text-xs text-slate-600 mb-1">Evidence:</div>
                            <div className="text-xs text-slate-900">{finding.evidence}</div>
                          </div>
                          <div className="p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="text-xs text-blue-900 font-semibold mb-1">Recommendation:</div>
                            <div className="text-xs text-slate-700">{finding.recommendation}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Security */}
              <TabsContent value="security" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-5 text-center">
                      <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                      <div className="text-3xl font-bold text-red-900 mb-1">
                        {auditReport.audit_report.security_risks.critical_risks}
                      </div>
                      <div className="text-sm text-red-700">Critical Risks</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-5 text-center">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                      <div className="text-3xl font-bold text-amber-900 mb-1">
                        {auditReport.audit_report.security_risks.high_risks}
                      </div>
                      <div className="text-sm text-amber-700">High Risks</div>
                    </CardContent>
                  </Card>
                </div>

                {riskChartData.length > 0 && (
                  <Card className="bg-white border-slate-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-900">Risk Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={riskChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={70}
                            dataKey="value"
                          >
                            {riskChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">Security Risks Identified</h4>
                  {auditReport.audit_report.security_risks.risks.map((risk, idx) => (
                    <Card key={idx} className={cn(
                      "border-2",
                      risk.severity === "critical" && "border-red-300 bg-red-50",
                      risk.severity === "high" && "border-amber-300 bg-amber-50",
                      risk.severity === "medium" && "border-blue-300 bg-blue-50",
                      risk.severity === "low" && "border-emerald-300 bg-emerald-50"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="text-base font-bold text-slate-900">{risk.title}</h5>
                          <Badge className={cn(
                            "text-xs",
                            risk.severity === "critical" && "bg-red-100 text-red-700",
                            risk.severity === "high" && "bg-amber-100 text-amber-700",
                            risk.severity === "medium" && "bg-blue-100 text-blue-700",
                            risk.severity === "low" && "bg-emerald-100 text-emerald-700"
                          )}>
                            {risk.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700 mb-3">{risk.description}</p>
                        <div className="mb-3">
                          <div className="text-xs text-slate-600 mb-1">Affected Systems:</div>
                          <div className="flex flex-wrap gap-1">
                            {risk.affected_systems.map((system, sidx) => (
                              <Badge key={sidx} className="bg-slate-100 text-slate-700 text-xs">
                                {system}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded border border-slate-200">
                          <div className="text-xs text-slate-600 mb-1">Mitigation:</div>
                          <div className="text-sm text-slate-900">{risk.mitigation}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Performance */}
              <TabsContent value="performance" className="space-y-4 mt-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-5 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-4xl font-bold text-blue-900 mb-2">
                      {(auditReport.audit_report.performance_analysis.efficiency_score * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-blue-700 font-semibold">Efficiency Score</div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">Performance Bottlenecks</h4>
                  {auditReport.audit_report.performance_analysis.bottlenecks.map((bottleneck, idx) => (
                    <Card key={idx} className="border-2 border-purple-200 bg-purple-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="text-base font-bold text-slate-900 mb-2">{bottleneck.component}</h5>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-slate-600">Issue: </span>
                                <span className="text-slate-900">{bottleneck.issue}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Impact: </span>
                                <span className="text-amber-700 font-semibold">{bottleneck.impact}</span>
                              </div>
                              <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                                <span className="text-emerald-900 font-semibold text-xs">Optimization: </span>
                                <span className="text-slate-700 text-xs">{bottleneck.optimization}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {auditReport.audit_report.performance_analysis.cost_optimization_opportunities.length > 0 && (
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-900">Cost Optimization Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {auditReport.audit_report.performance_analysis.cost_optimization_opportunities.map((opp, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                            <ChevronRight className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>{opp}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Compliance */}
              <TabsContent value="compliance" className="space-y-4 mt-4">
                <Card className={cn(
                  "border-2",
                  auditReport.audit_report.compliance_assessment.compliant ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300"
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {auditReport.audit_report.compliance_assessment.compliant ? (
                          <CheckCircle className="w-10 h-10 text-emerald-600" />
                        ) : (
                          <XCircle className="w-10 h-10 text-red-600" />
                        )}
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">
                            {auditReport.audit_report.compliance_assessment.compliant ? "Compliant" : "Non-Compliant"}
                          </h4>
                          <p className="text-sm text-slate-600">
                            Audit trail completeness: {(auditReport.audit_report.compliance_assessment.audit_trail_completeness * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <Progress 
                        value={auditReport.audit_report.compliance_assessment.audit_trail_completeness * 100} 
                        className="w-32 h-3"
                      />
                    </div>
                  </CardContent>
                </Card>

                {auditReport.audit_report.compliance_assessment.violations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">Compliance Violations</h4>
                    {auditReport.audit_report.compliance_assessment.violations.map((violation, idx) => (
                      <Card key={idx} className="border-2 border-red-200 bg-red-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="text-base font-bold text-slate-900">{violation.regulation}</h5>
                            <Badge className={cn(
                              "text-xs",
                              violation.severity === "critical" && "bg-red-600 text-white",
                              violation.severity === "high" && "bg-red-100 text-red-700",
                              violation.severity === "medium" && "bg-amber-100 text-amber-700"
                            )}>
                              {violation.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-700 mb-3">{violation.description}</p>
                          <div className="p-3 bg-white rounded border border-red-200">
                            <div className="text-xs text-red-900 font-semibold mb-1">Required Remediation:</div>
                            <div className="text-sm text-slate-700">{violation.remediation}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Recommendations */}
              <TabsContent value="recommendations" className="space-y-4 mt-4">
                <Card className="bg-red-50 border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Immediate Actions Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {auditReport.audit_report.recommendations.immediate_actions.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 bg-white rounded border border-red-200">
                          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            !
                          </div>
                          <span className="text-sm text-slate-900">{action}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-600" />
                      Short-Term Actions (1-3 months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {auditReport.audit_report.recommendations.short_term.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                          <ChevronRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Long-Term Strategic (3-12 months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {auditReport.audit_report.recommendations.long_term.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}