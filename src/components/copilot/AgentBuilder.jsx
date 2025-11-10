import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Plus, Database, Zap, Shield, Play, Save, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AgentBuilder() {
  const [prompt, setPrompt] = useState("");
  const [blueprint, setBlueprint] = useState(null);
  const [building, setBuilding] = useState(false);

  const handleBuild = () => {
    if (!prompt.trim()) {
      toast.error("Please describe your agent's mission");
      return;
    }

    setBuilding(true);

    // Simulate AI parsing
    setTimeout(() => {
      setBlueprint({
        name: "Invoice Reconciliation Agent",
        mission: prompt,
        inputs: [
          { name: "QuickBooks API", type: "integration", description: "Fetch invoice data" },
          { name: "Invoice emails", type: "email", description: "Parse incoming invoices from inbox" }
        ],
        triggers: [
          { type: "schedule", config: "Every Friday at 9:00 AM" },
          { type: "event", config: "On new invoice received" }
        ],
        model: {
          name: "gpt-4o",
          profile: "cost-balanced",
          reasoning: "Requires accuracy for financial data"
        },
        safeguards: [
          { name: "Approval required", enabled: true, description: "Human review before updating QuickBooks" },
          { name: "Sandbox mode", enabled: true, description: "Test first 3 runs in sandbox" },
          { name: "PII masking", enabled: true, description: "Mask customer sensitive data" }
        ],
        outputs: [
          { name: "QuickBooks update", action: "Create/update invoice records" },
          { name: "Slack notification", action: "Post summary to #finance channel" }
        ],
        estimatedCost: "$2.40/month",
        estimatedRuntime: "~45s per execution"
      });
      setBuilding(false);
      toast.success("Agent blueprint generated!");
    }, 2000);
  };

  const handleDeploy = () => {
    toast.success("Agent deployed to Pilot!", {
      description: "Now active and ready for approval"
    });
  };

  const handleClone = () => {
    toast.success("Blueprint cloned", {
      description: "You can now modify and redeploy"
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Agent Builder</h2>
              <p className="text-sm text-slate-600">Design custom AI teammates by describing their mission</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Input */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-6">
          <Label className="text-sm font-bold text-slate-900 mb-2 block">
            Describe Your Agent's Mission
          </Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Build an AI agent that reconciles invoices every Friday and updates QuickBooks..."
            className="min-h-32 mb-4"
          />
          <Button
            onClick={handleBuild}
            disabled={building}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {building ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                Generating Blueprint...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Agent Blueprint
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Blueprint Display */}
      <AnimatePresence>
        {blueprint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Blueprint Header */}
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900">{blueprint.name}</h3>
                    <p className="text-sm text-slate-700">{blueprint.mission}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleClone}>
                      <Copy className="w-4 h-4 mr-1" />
                      Clone
                    </Button>
                    <Button size="sm" onClick={handleDeploy} className="bg-emerald-600 hover:bg-emerald-700">
                      <Play className="w-4 h-4 mr-1" />
                      Deploy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blueprint Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Inputs */}
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-900">Data Inputs</h4>
                  </div>
                  <div className="space-y-2">
                    {blueprint.inputs.map((input, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-slate-900">{input.name}</span>
                          <Badge className="bg-blue-100 text-blue-700 text-xs">{input.type}</Badge>
                        </div>
                        <p className="text-xs text-slate-600">{input.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Triggers */}
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <h4 className="text-sm font-bold text-slate-900">Triggers</h4>
                  </div>
                  <div className="space-y-2">
                    {blueprint.triggers.map((trigger, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <Badge className="bg-amber-100 text-amber-700 text-xs capitalize">{trigger.type}</Badge>
                        </div>
                        <p className="text-xs text-slate-700">{trigger.config}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Model Selection */}
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h4 className="text-sm font-bold text-slate-900">Model Configuration</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Model:</span>
                      <span className="text-sm font-semibold text-slate-900">{blueprint.model.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Profile:</span>
                      <Badge className="bg-purple-100 text-purple-700 text-xs">{blueprint.model.profile}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 italic">{blueprint.model.reasoning}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Safeguards */}
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-900">Safeguards</h4>
                  </div>
                  <div className="space-y-2">
                    {blueprint.safeguards.map((guard, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900">{guard.name}</div>
                          <div className="text-xs text-slate-600">{guard.description}</div>
                        </div>
                        <Switch checked={guard.enabled} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estimates */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Estimated Cost</div>
                    <div className="text-xl font-bold text-blue-900">{blueprint.estimatedCost}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Estimated Runtime</div>
                    <div className="text-xl font-bold text-blue-900">{blueprint.estimatedRuntime}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pre-built Templates */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-4">
          <h4 className="text-sm font-bold text-slate-900 mb-3">Pre-built Agent Templates</h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "Invoice Reconciler", category: "Finance" },
              { name: "CRM Sync Agent", category: "Sales" },
              { name: "Inventory Monitor", category: "Operations" },
              { name: "Report Generator", category: "Analytics" },
              { name: "Customer Support", category: "Service" },
              { name: "Data Pipeline", category: "Engineering" }
            ].map((template, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="flex flex-col items-start h-auto py-3"
                onClick={() => {
                  setPrompt(`Build an AI agent for ${template.name.toLowerCase()}`);
                  toast.info(`Template loaded: ${template.name}`);
                }}
              >
                <span className="text-sm font-semibold text-slate-900">{template.name}</span>
                <Badge className="mt-1 bg-slate-100 text-slate-600 text-xs">{template.category}</Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}