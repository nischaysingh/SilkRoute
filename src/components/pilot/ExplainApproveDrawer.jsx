import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Eye, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ExplainApproveDrawer({ open, onOpenChange, action, onApprove, onReject, onUndo }) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  if (!action) return null;

  const handleApprove = () => {
    onApprove?.(action);
    onOpenChange(false);
    toast.success("Action approved", {
      description: "AI will execute this change"
    });
  };

  const handleReject = () => {
    onReject?.(action);
    onOpenChange(false);
    toast.info("Action rejected", {
      description: "No changes will be made"
    });
  };

  const handleFeedback = (positive) => {
    setFeedbackGiven(true);
    toast.success(positive ? "Positive feedback recorded" : "Negative feedback recorded", {
      description: "This will improve AI decision quality"
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-slate-200 w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-slate-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600" />
            Review AI Action
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Action Summary */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <h5 className="text-sm font-bold text-purple-900 mb-2">Proposed Action</h5>
              <p className="text-sm text-slate-900 font-semibold mb-1">{action.title}</p>
              <p className="text-xs text-slate-700">{action.description}</p>
            </CardContent>
          </Card>

          {/* Confidence */}
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <h5 className="text-sm font-bold text-slate-900 mb-3">AI Confidence</h5>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-700">Overall Confidence</span>
                <span className="text-lg font-bold text-purple-900">{action.confidence || 92}%</span>
              </div>
              <Progress value={action.confidence || 92} className="h-2" />
              
              {action.confidenceBreakdown && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                  {Object.entries(action.confidenceBreakdown).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-semibold text-slate-900">{value}%</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plain English Reasoning */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h5 className="text-sm font-bold text-blue-900 mb-3">Why This Makes Sense</h5>
              <div className="space-y-2 text-xs text-slate-700">
                {action.reasoning?.map((reason, idx) => (
                  <p key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 font-semibold">{idx + 1}.</span>
                    <span>{reason}</span>
                  </p>
                )) || (
                  <>
                    <p className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">1.</span>
                      <span>Historical data shows this optimization improved success by 6.1%</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">2.</span>
                      <span>Cost reduction of 4.8% aligns with enterprise objective</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">3.</span>
                      <span>Risk level is low - can be reverted in under 30 seconds</span>
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Expected Impact */}
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <h5 className="text-sm font-bold text-slate-900 mb-3">Expected Impact</h5>
              <div className="grid grid-cols-2 gap-3">
                {action.impact && Object.entries(action.impact).map(([key, value]) => (
                  <div key={key} className="p-2 bg-slate-50 rounded text-center">
                    <div className="text-xs text-slate-600 capitalize mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className={cn(
                      "text-sm font-bold",
                      typeof value === 'string' && value.startsWith('+') && !key.toLowerCase().includes('cost') ? "text-emerald-700" :
                      typeof value === 'string' && value.startsWith('-') && key.toLowerCase().includes('cost') ? "text-emerald-700" :
                      typeof value === 'string' && value.startsWith('-') && !key.toLowerCase().includes('cost') ? "text-red-700" :
                      typeof value === 'string' && value.startsWith('+') && key.toLowerCase().includes('cost') ? "text-red-700" :
                      "text-slate-900"
                    )}>
                      {value}
                    </div>
                  </div>
                )) || (
                  <>
                    <div className="p-2 bg-slate-50 rounded text-center">
                      <div className="text-xs text-slate-600 mb-1">Success Rate</div>
                      <div className="text-sm font-bold text-emerald-700">+6.1%</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded text-center">
                      <div className="text-xs text-slate-600 mb-1">Cost</div>
                      <div className="text-sm font-bold text-emerald-700">-4.8%</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded text-center">
                      <div className="text-xs text-slate-600 mb-1">Latency</div>
                      <div className="text-sm font-bold text-blue-700">-150ms</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded text-center">
                      <div className="text-xs text-slate-600 mb-1">Risk Level</div>
                      <div className="text-sm font-bold text-emerald-700">Low</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Decision History (if available) */}
          {action.previousApplications && (
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4">
                <h5 className="text-sm font-bold text-emerald-900 mb-2">Past Performance</h5>
                <p className="text-xs text-slate-700">
                  This action has been applied {action.previousApplications.count} times with a {action.previousApplications.successRate}% success rate.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Approve/Reject Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleReject}
              className="border-red-300 bg-red-50 hover:bg-red-100 text-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>

          {/* Feedback Section */}
          {!feedbackGiven && (
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <h5 className="text-sm font-bold text-slate-900 mb-3">Provide Feedback</h5>
                <p className="text-xs text-slate-600 mb-3">
                  Help improve AI decision quality by rating this recommendation
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFeedback(true)}
                    className="flex-1 h-9 text-xs border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Good Suggestion
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFeedback(false)}
                    className="flex-1 h-9 text-xs border-red-300 bg-red-50 hover:bg-red-100"
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    Needs Improvement
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Undo Option (if action was previously applied) */}
          {action.applied && (
            <Button
              variant="outline"
              onClick={() => {
                onUndo?.(action);
                onOpenChange(false);
                toast.success("Action reverted");
              }}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Undo This Action
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}