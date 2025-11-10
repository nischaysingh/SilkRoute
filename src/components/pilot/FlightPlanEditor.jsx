import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  FileText, Database, Settings, Shield, FlaskConical,
  ChevronRight, Edit, Copy, Trash2, CheckCircle, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function FlightPlanEditor({ mission, onValidate, onRunDryRun }) {
  const [validationResult, setValidationResult] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const steps = [
    { id: 1, name: "Fetch Data", action: "API Call", model: "N/A", tokens: 0, cost: 0, guardrails: ["Rate limit", "Timeout 5s"] },
    { id: 2, name: "Parse Input", action: "Transform", model: "gpt-4o-mini", tokens: 150, cost: 0.002, guardrails: ["Schema validate"] },
    { id: 3, name: "Decide Action", action: "LLM Inference", model: "gpt-4o", tokens: 800, cost: 0.024, guardrails: ["PII mask", "Cost cap"] },
    { id: 4, name: "Execute Action", action: "Tool Call", model: "N/A", tokens: 0, cost: 0, guardrails: ["Approval required"] },
    { id: 5, name: "Notify", action: "Email/Webhook", model: "N/A", tokens: 0, cost: 0, guardrails: ["Throttle 10/min"] }
  ];

  const inputs = [
    { key: "account_id", type: "string", value: "acc_12345", required: true },
    { key: "date_range", type: "string", value: "last_30_days", required: true },
    { key: "threshold", type: "number", value: "500", required: false },
    { key: "channel", type: "string", value: "email", required: true }
  ];

  const policies = [
    { id: 1, name: "PII Masking", enabled: true, description: "Mask sensitive data" },
    { id: 2, name: "Budget Guard", enabled: true, description: "Enforce $5/run cap" },
    { id: 3, name: "Vendor Lock", enabled: false, description: "Prevent OpenAI dependency" },
    { id: 4, name: "Compliance Mode", enabled: true, description: "GDPR/CCPA checks" }
  ];

  const dryRuns = [
    { id: 1, date: "2024-12-19 14:30", inputs: { account_id: "acc_12345" }, status: "passed", output: "Action approved" },
    { id: 2, date: "2024-12-18 10:15", inputs: { account_id: "acc_67890" }, status: "failed", output: "Threshold not met" },
    { id: 3, date: "2024-12-17 08:45", inputs: { account_id: "acc_11111" }, status: "passed", output: "Action approved" }
  ];

  const handleValidate = () => {
    const allValid = inputs.filter(i => i.required).every(i => i.value);
    setValidationResult(allValid ? "success" : "error");
    
    if (allValid) {
      toast.success("Validation passed", { description: "All required inputs are valid" });
    } else {
      toast.error("Validation failed", { description: "Missing required inputs" });
    }
    
    onValidate?.(allValid);
  };

  const handleDryRun = () => {
    toast.loading("Running dry-run...", { id: "dry-run" });
    setTimeout(() => {
      toast.success("Dry-run completed", { 
        id: "dry-run",
        description: "Action would be approved"
      });
      onRunDryRun?.();
    }, 2000);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
      <CardHeader className="border-b border-slate-200 pb-3">
        <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          Flight Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-50 border-b border-slate-200 w-full justify-start rounded-none">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="steps" className="text-xs">Steps</TabsTrigger>
            <TabsTrigger value="inputs" className="text-xs">Inputs</TabsTrigger>
            <TabsTrigger value="policies" className="text-xs">Policies</TabsTrigger>
            <TabsTrigger value="tests" className="text-xs">Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-4 space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-900 mb-2">Description</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated invoice collection workflow that identifies overdue invoices, 
                sends reminders via email, and escalates to collections if needed.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-900 mb-2">Goal</h4>
              <p className="text-xs text-slate-600">
                Reduce DSO (Days Sales Outstanding) by 20% through automated follow-ups
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-900 mb-2">Risk Level</h4>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300">Medium</Badge>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-900 mb-2">Downstream Systems</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  <Database className="w-3 h-3 mr-1" />
                  Touches AR
                </Badge>
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                  <Database className="w-3 h-3 mr-1" />
                  Writes to CRM
                </Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="steps" className="p-4 space-y-3">
            {steps.map((step, idx) => (
              <div key={step.id} className="relative">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      {step.id}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="w-0.5 h-8 bg-slate-200 my-1"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-xs font-semibold text-slate-900">{step.name}</h5>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="text-xs">
                        <span className="text-slate-600">Action:</span>
                        <span className="text-slate-900 font-medium ml-1">{step.action}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-600">Model:</span>
                        <span className="text-slate-900 font-medium ml-1">{step.model}</span>
                      </div>
                      {step.tokens > 0 && (
                        <>
                          <div className="text-xs">
                            <span className="text-slate-600">Tokens:</span>
                            <span className="text-slate-900 font-medium ml-1">{step.tokens}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-slate-600">Cost:</span>
                            <span className="text-slate-900 font-medium ml-1">${step.cost}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {step.guardrails.map((guard, i) => (
                        <Badge key={i} className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] py-0">
                          <Shield className="w-2 h-2 mr-0.5" />
                          {guard}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="inputs" className="p-4 space-y-4">
            {validationResult && (
              <div className={cn(
                "p-3 rounded-lg border",
                validationResult === "success" 
                  ? "bg-emerald-50 border-emerald-200" 
                  : "bg-red-50 border-red-200"
              )}>
                <div className="flex items-center gap-2">
                  {validationResult === "success" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={cn(
                    "text-xs font-medium",
                    validationResult === "success" ? "text-emerald-900" : "text-red-900"
                  )}>
                    {validationResult === "success" 
                      ? "All inputs valid" 
                      : "Missing required inputs"}
                  </span>
                </div>
              </div>
            )}

            {inputs.map((input) => (
              <div key={input.key} className="space-y-2">
                <Label className="text-xs text-slate-700 flex items-center gap-1">
                  {input.key}
                  {input.required && <span className="text-red-500">*</span>}
                  <Badge className="ml-2 bg-slate-100 text-slate-600 text-[9px]">{input.type}</Badge>
                </Label>
                <Input
                  defaultValue={input.value}
                  className="h-8 text-xs"
                  placeholder={`Enter ${input.key}...`}
                />
              </div>
            ))}

            <Button
              onClick={handleValidate}
              className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700"
            >
              Validate Inputs
            </Button>
          </TabsContent>

          <TabsContent value="policies" className="p-4 space-y-3">
            {policies.map((policy) => (
              <div key={policy.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex-1">
                  <h5 className="text-xs font-semibold text-slate-900 mb-1">{policy.name}</h5>
                  <p className="text-xs text-slate-600">{policy.description}</p>
                </div>
                <Switch defaultChecked={policy.enabled} />
              </div>
            ))}

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-900 mb-1">Policy Warning</p>
                  <p className="text-xs text-amber-700">
                    Vendor Lock is disabled. This mission may create OpenAI dependency.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tests" className="p-4 space-y-4">
            <div className="space-y-2">
              {dryRuns.map((run) => (
                <div key={run.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-600">{run.date}</span>
                    <Badge className={cn(
                      "text-xs",
                      run.status === "passed" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-red-100 text-red-700"
                    )}>
                      {run.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-700">
                    <span className="font-medium">Input:</span> {JSON.stringify(run.inputs)}
                  </div>
                  <div className="text-xs text-slate-700 mt-1">
                    <span className="font-medium">Output:</span> {run.output}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleDryRun}
              className="w-full h-8 text-xs bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <FlaskConical className="w-3 h-3" />
              Run Dry-Run
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}