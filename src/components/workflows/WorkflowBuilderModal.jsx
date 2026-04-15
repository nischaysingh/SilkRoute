import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const STEP_TYPES = [
  { value: "condition", label: "Condition", icon: "🔀", color: "purple" },
  { value: "ai_action", label: "AI Action", icon: "🤖", color: "blue" },
  { value: "alert", label: "Alert / Notify", icon: "🔔", color: "amber" },
  { value: "data_transform", label: "Data Transform", icon: "⚙️", color: "cyan" },
  { value: "external_api", label: "External API", icon: "🌐", color: "emerald" },
  { value: "wait", label: "Wait", icon: "⏱️", color: "gray" },
];

const TRIGGERS = [
  { value: "manual", label: "Manual" },
  { value: "schedule", label: "Scheduled" },
  { value: "event", label: "On Event" },
  { value: "webhook", label: "Webhook" },
];

export default function WorkflowBuilderModal({ open, onClose, workflow }) {
  const queryClient = useQueryClient();
  const isEdit = !!workflow;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("manual");
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    if (workflow) {
      setName(workflow.name || "");
      setDescription(workflow.description || "");
      setTriggerType(workflow.trigger?.type || "manual");
      setSteps(workflow.steps || []);
    } else {
      setName("");
      setDescription("");
      setTriggerType("manual");
      setSteps([]);
    }
  }, [workflow, open]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? base44.entities.Workflow.update(workflow.id, data)
        : base44.entities.Workflow.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success(isEdit ? "Workflow updated" : "Workflow created");
      onClose();
    },
    onError: () => toast.error("Failed to save workflow"),
  });

  const addStep = () => {
    setSteps([
      ...steps,
      { name: `Step ${steps.length + 1}`, type: "ai_action", config: {} },
    ]);
  };

  const removeStep = (idx) => {
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const updateStep = (idx, field, value) => {
    setSteps(steps.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const handleSave = () => {
    if (!name.trim()) return toast.error("Workflow name is required");
    if (steps.length === 0) return toast.error("Add at least one step");
    saveMutation.mutate({
      name,
      description,
      trigger: { type: triggerType },
      steps,
      status: isEdit ? workflow.status : "draft",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Workflow" : "Create Workflow"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Name & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-gray-400 text-xs">Workflow Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Invoice Chase"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-400 text-xs">Trigger</Label>
              <Select value={triggerType} onValueChange={setTriggerType}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 text-white">
                  {TRIGGERS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-gray-400 text-xs">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this workflow do?"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-gray-400 text-xs">Steps ({steps.length})</Label>
              <Button size="sm" onClick={addStep} className="bg-purple-600 hover:bg-purple-700 h-7 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add Step
              </Button>
            </div>

            {steps.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-white/10 rounded-lg">
                No steps yet. Click "Add Step" to begin.
              </div>
            ) : (
              <div className="space-y-2">
                {steps.map((step, idx) => {
                  const stepTypeDef = STEP_TYPES.find((t) => t.value === step.type) || STEP_TYPES[0];
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 text-gray-500">
                        <GripVertical className="w-4 h-4" />
                        <span className="text-xs font-mono w-5 text-center">{idx + 1}</span>
                      </div>
                      <span className="text-lg">{stepTypeDef.icon}</span>
                      <Input
                        value={step.name}
                        onChange={(e) => updateStep(idx, "name", e.target.value)}
                        className="bg-white/5 border-white/10 text-white h-7 text-sm flex-1"
                        placeholder="Step name"
                      />
                      <Select
                        value={step.type}
                        onValueChange={(v) => updateStep(idx, "type", v)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-7 text-xs w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/10 text-white">
                          {STEP_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.icon} {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeStep(idx)}
                        className="h-7 w-7 text-red-400 hover:bg-red-500/10 flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : isEdit ? "Update" : "Create Workflow"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}