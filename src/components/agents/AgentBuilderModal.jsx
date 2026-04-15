import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const STATUSES = ["draft", "armed", "testing", "paused", "archived"];

export default function AgentBuilderModal({ open, onClose, agent }) {
  const queryClient = useQueryClient();
  const isEdit = !!agent;

  const [name, setName] = useState("");
  const [intent, setIntent] = useState("");
  const [priority, setPriority] = useState("3");
  const [status, setStatus] = useState("draft");
  const [riskScore, setRiskScore] = useState("0.2");

  useEffect(() => {
    if (agent) {
      setName(agent.name || "");
      setIntent(agent.intent || "");
      setPriority(String(agent.priority || 3));
      setStatus(agent.status || "draft");
      setRiskScore(String(agent.risk_score || 0.2));
    } else {
      setName("");
      setIntent("");
      setPriority("3");
      setStatus("draft");
      setRiskScore("0.2");
    }
  }, [agent, open]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? base44.entities.AIMission.update(agent.id, data)
        : base44.entities.AIMission.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-missions"] });
      toast.success(isEdit ? "Agent updated" : "Agent created");
      onClose();
    },
    onError: () => toast.error("Failed to save agent"),
  });

  const handleSave = () => {
    if (!name.trim()) return toast.error("Agent name is required");
    if (!intent.trim()) return toast.error("Agent intent is required");
    saveMutation.mutate({
      name,
      intent,
      priority: parseInt(priority),
      status,
      risk_score: parseFloat(riskScore),
      version: isEdit ? agent.version : 1,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit AI Agent" : "Create AI Agent"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-gray-400 text-xs">Agent Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. invoice_chase_v1"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-gray-400 text-xs">Intent / Objective *</Label>
            <Textarea
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="Describe what this agent should do. Be specific about the goal, data it should work with, and expected outcomes."
              className="bg-white/5 border-white/10 text-white min-h-[100px] resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-gray-400 text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 text-white">
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-400 text-xs">Priority (1–5)</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 text-white">
                  {[1, 2, 3, 4, 5].map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      {p} — {p === 1 ? "Highest" : p === 5 ? "Lowest" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-400 text-xs">Risk Score (0–1)</Label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={riskScore}
                onChange={(e) => setRiskScore(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : isEdit ? "Update Agent" : "Create Agent"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}