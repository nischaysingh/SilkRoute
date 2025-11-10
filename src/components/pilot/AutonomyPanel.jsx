import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Gauge, Shield, CheckCircle, XCircle, AlertTriangle,
  Play, Pause, XCircle as Stop, GitBranch, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AutonomyPanel({ mission, onLaunch, onPause, onAbort, onReroute, onPreflight, onApplySettings }) {
  const [autonomyLevel, setAutonomyLevel] = useState([1]);
  const [route, setRoute] = useState(mission?.route || "pilot");
  const [profile, setProfile] = useState("Prod-Balanced");
  const [safeMode, setSafeMode] = useState(false);
  const [throttle, setThrottle] = useState(false);
  const [quorumCheck, setQuorumCheck] = useState(true);
  const [preflightResult, setPreflightResult] = useState(null);

  const autonomyLevels = [
    { value: 0, label: "Manual Only", description: "Every action requires approval" },
    { value: 1, label: "Guide", description: "AI suggests, you approve" },
    { value: 2, label: "Semi-Auto", description: "Auto-reroute allowed" },
    { value: 3, label: "Auto with Recall", description: "Fully autonomous with rollback" }
  ];

  const currentAutonomy = autonomyLevels[autonomyLevel[0]];

  const handlePreflight = () => {
    toast.loading("Running preflight check...", { id: "preflight" });
    
    setTimeout(() => {
      const checks = [
        { name: "Input validation", passed: true },
        { name: "Policy compliance", passed: true },
        { name: "Route availability", passed: true },
        { name: "Cost budget check", passed: true },
        { name: "Downstream system health", passed: false, reason: "CRM API latency high" }
      ];
      
      setPreflightResult(checks);
      
      const allPassed = checks.every(c => c.passed);
      if (allPassed) {
        toast.success("Preflight passed", { id: "preflight" });
      } else {
        toast.warning("Preflight warnings detected", { id: "preflight" });
      }
      
      onPreflight?.(checks);
    }, 1500);
  };

  const handleApply = () => {
    toast.success("Settings applied", {
      description: `Route: ${route}, Profile: ${profile}, Autonomy: ${currentAutonomy.label}`
    });
    onApplySettings?.({ route, profile, autonomyLevel: autonomyLevel[0] });
  };

  return (
    <div className="space-y-3">
      {/* Autonomy Dial */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardHeader className="border-b border-slate-200 pb-3">
          <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-purple-600" />
            Autonomy Dial
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-900">{currentAutonomy.label}</span>
              <Badge className="bg-purple-100 text-purple-800 text-xs">
                Level {autonomyLevel[0]}
              </Badge>
            </div>
            <Slider
              value={autonomyLevel}
              onValueChange={setAutonomyLevel}
              min={0}
              max={3}
              step={1}
              className="mb-2"
            />
            <p className="text-xs text-slate-600 italic">{currentAutonomy.description}</p>
          </div>

          {autonomyLevel[0] >= 2 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Auto-corrections enabled
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route & Profile */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardHeader className="border-b border-slate-200 pb-3">
          <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-600" />
            Route & Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div>
            <Label className="text-xs text-slate-700 mb-2 block">Route</Label>
            <Select value={route} onValueChange={setRoute}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pilot">Pilot (Manual)</SelectItem>
                <SelectItem value="copilot">Copilot (Assisted)</SelectItem>
                <SelectItem value="autopilot">Autopilot (Auto)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-slate-700 mb-2 block">Model Profile</Label>
            <Select value={profile} onValueChange={setProfile}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Prod-Balanced">Prod-Balanced</SelectItem>
                <SelectItem value="High-Accuracy">High-Accuracy</SelectItem>
                <SelectItem value="Cost-Save">Cost-Save</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleApply}
            className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700"
          >
            Apply Settings
          </Button>
        </CardContent>
      </Card>

      {/* Safety */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardHeader className="border-b border-slate-200 pb-3">
          <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            Safety
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-slate-700">Safe Mode</Label>
            <Switch checked={safeMode} onCheckedChange={setSafeMode} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-slate-700">Throttle</Label>
            <Switch checked={throttle} onCheckedChange={setThrottle} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-slate-700">Quorum Check</Label>
            <Switch checked={quorumCheck} onCheckedChange={setQuorumCheck} />
          </div>

          <div>
            <Label className="text-xs text-slate-700 mb-2 block">Max Spend/Run</Label>
            <Input
              type="number"
              defaultValue="5.00"
              className="h-8 text-xs"
              placeholder="$5.00"
            />
          </div>

          <Button
            onClick={handlePreflight}
            variant="outline"
            className="w-full h-8 text-xs"
          >
            Run Preflight Check
          </Button>

          {preflightResult && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {preflightResult.map((check, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center justify-between p-2 rounded text-xs",
                    check.passed ? "bg-emerald-50" : "bg-red-50"
                  )}
                >
                  <span className={check.passed ? "text-emerald-900" : "text-red-900"}>
                    {check.name}
                  </span>
                  {check.passed ? (
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardHeader className="border-b border-slate-200 pb-3">
          <CardTitle className="text-sm text-slate-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          <Button
            onClick={() => onLaunch(mission)}
            className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2"
          >
            <Play className="w-3 h-3" />
            Launch Mission
          </Button>
          <Button
            onClick={() => onPause(mission)}
            variant="outline"
            className="w-full h-8 text-xs flex items-center justify-center gap-2"
          >
            <Pause className="w-3 h-3" />
            Pause Mission
          </Button>
          <Button
            onClick={() => onAbort(mission)}
            variant="outline"
            className="w-full h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 flex items-center justify-center gap-2"
          >
            <Stop className="w-3 h-3" />
            Abort Mission
          </Button>
          <Button
            onClick={() => onReroute(mission)}
            variant="outline"
            className="w-full h-8 text-xs flex items-center justify-center gap-2"
          >
            <GitBranch className="w-3 h-3" />
            Reroute to Copilot
          </Button>
          <Button
            variant="outline"
            className="w-full h-8 text-xs flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-3 h-3" />
            Open in ATC
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}