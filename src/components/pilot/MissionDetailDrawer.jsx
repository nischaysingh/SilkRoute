import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Play, Pause, XCircle, GitBranch, Clock, DollarSign, 
  Zap, Activity, TrendingUp, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function MissionDetailDrawer({ open, onOpenChange, mission, onLaunch, onPause, onAbort, onReroute }) {
  if (!mission) return null;

  const runs = Array.from({ length: 20 }, (_, i) => ({
    id: `run-${i + 1}`,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    state: i === 0 ? "running" : i < 3 ? "completed" : i === 3 ? "failed" : "completed",
    latency: 800 + Math.random() * 400,
    tokens: 950 + Math.floor(Math.random() * 200),
    cost: (0.025 + Math.random() * 0.01).toFixed(3),
    decision: i % 3 === 0 ? "Approved" : i % 3 === 1 ? "Rejected" : "Escalated"
  }));

  const timeline = [
    { time: "2024-12-19 14:30", event: "Mission created", actor: "admin@acme.com" },
    { time: "2024-12-19 15:00", event: "Flight plan edited", actor: "admin@acme.com" },
    { time: "2024-12-19 15:15", event: "Approved for launch", actor: "manager@acme.com" },
    { time: "2024-12-19 15:20", event: "Policy PII Masking applied", actor: "system" },
    { time: "2024-12-19 15:30", event: "First run completed", actor: "pilot" }
  ];

  const costData = [
    { day: "Mon", tokens: 12000, tools: 8, api: 15 },
    { day: "Tue", tokens: 15000, tools: 12, api: 18 },
    { day: "Wed", tokens: 18000, tools: 10, api: 20 },
    { day: "Thu", tokens: 14000, tools: 15, api: 17 },
    { day: "Fri", tokens: 16000, tools: 11, api: 19 }
  ];

  const decisions = [
    { 
      timestamp: "2024-12-19 15:45", 
      inputs: { account_id: "acc_12345", amount: 1500 },
      guards: ["PII check: passed", "Budget check: passed", "Threshold: met"],
      action: "Approved",
      confidence: 94
    },
    { 
      timestamp: "2024-12-19 14:30", 
      inputs: { account_id: "acc_67890", amount: 500 },
      guards: ["PII check: passed", "Budget check: passed", "Threshold: not met"],
      action: "Rejected",
      confidence: 88
    },
    { 
      timestamp: "2024-12-19 13:15", 
      inputs: { account_id: "acc_11111", amount: 2000 },
      guards: ["PII check: passed", "Budget check: warning", "Threshold: met"],
      action: "Escalated",
      confidence: 72
    }
  ];

  const logs = [
    { time: "15:45:23", level: "info", message: "Request processed successfully", details: "account_id: acc_12345" },
    { time: "15:45:20", level: "debug", message: "Executing step 3: Decide Action", details: "model: gpt-4o" },
    { time: "15:45:18", level: "info", message: "PII masking applied", details: "fields: email, ssn" },
    { time: "15:45:15", level: "warn", message: "High latency detected", details: "latency: 1240ms" },
    { time: "15:45:10", level: "info", message: "Step 1 completed", details: "data fetched" }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-slate-200 w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-slate-900">{mission.name}</SheetTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onLaunch(mission)}
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
              >
                <Play className="w-3 h-3 mr-1" />
                Launch
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPause(mission)}
                className="h-7 text-xs"
              >
                <Pause className="w-3 h-3 mr-1" />
                Pause
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAbort(mission)}
                className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="w-3 h-3 mr-1" />
                Abort
              </Button>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="runs" className="mt-6">
          <TabsList className="bg-slate-100">
            <TabsTrigger value="runs">Runs</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="cost">Cost</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="runs" className="mt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Time</TableHead>
                    <TableHead className="text-xs">State</TableHead>
                    <TableHead className="text-xs">Latency</TableHead>
                    <TableHead className="text-xs">Tokens</TableHead>
                    <TableHead className="text-xs">Cost</TableHead>
                    <TableHead className="text-xs">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="text-xs font-mono">
                        {new Date(run.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-xs",
                          run.state === "completed" && "bg-emerald-100 text-emerald-700",
                          run.state === "running" && "bg-blue-100 text-blue-700",
                          run.state === "failed" && "bg-red-100 text-red-700"
                        )}>
                          {run.state}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{Math.round(run.latency)}ms</TableCell>
                      <TableCell className="text-xs">{run.tokens}</TableCell>
                      <TableCell className="text-xs">${run.cost}</TableCell>
                      <TableCell className="text-xs">{run.decision}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <div className="space-y-3">
              {timeline.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-900">{event.event}</span>
                      <span className="text-xs text-slate-500 font-mono">{event.time}</span>
                    </div>
                    <span className="text-xs text-slate-600">by {event.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cost" className="mt-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="tokens" stackId="a" fill="#3b82f6" />
                <Bar dataKey="tools" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="api" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-700 mb-1">Tokens</div>
                <div className="text-lg font-bold text-blue-900">75k</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-xs text-purple-700 mb-1">Tool Calls</div>
                <div className="text-lg font-bold text-purple-900">56</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="text-xs text-emerald-700 mb-1">API Calls</div>
                <div className="text-lg font-bold text-emerald-900">89</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="decisions" className="mt-4">
            <div className="space-y-4">
              {decisions.map((decision, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-slate-600">{decision.timestamp}</span>
                    <Badge className={cn(
                      "text-xs",
                      decision.action === "Approved" && "bg-emerald-100 text-emerald-700",
                      decision.action === "Rejected" && "bg-red-100 text-red-700",
                      decision.action === "Escalated" && "bg-amber-100 text-amber-700"
                    )}>
                      {decision.action} ({decision.confidence}%)
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-1">Inputs:</div>
                      <div className="text-xs text-slate-600 font-mono">
                        {JSON.stringify(decision.inputs)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-1">Guards:</div>
                      <div className="flex flex-wrap gap-1">
                        {decision.guards.map((guard, i) => (
                          <Badge key={i} className="bg-purple-50 text-purple-700 text-[10px]">
                            {guard}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <div className="space-y-1 font-mono text-xs max-h-96 overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx} className={cn(
                  "p-2 rounded border-l-2",
                  log.level === "error" && "bg-red-50 border-red-500",
                  log.level === "warn" && "bg-amber-50 border-amber-500",
                  log.level === "info" && "bg-blue-50 border-blue-500",
                  log.level === "debug" && "bg-slate-50 border-slate-300"
                )}>
                  <span className="text-slate-500">[{log.time}]</span>
                  <span className={cn(
                    "ml-2 font-semibold",
                    log.level === "error" && "text-red-700",
                    log.level === "warn" && "text-amber-700",
                    log.level === "info" && "text-blue-700",
                    log.level === "debug" && "text-slate-600"
                  )}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="ml-2 text-slate-900">{log.message}</span>
                  {log.details && (
                    <div className="mt-1 text-slate-600 pl-20">{log.details}</div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}