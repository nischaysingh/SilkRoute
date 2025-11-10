import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Zap, Users, Network, Mic } from "lucide-react";

// Existing Co-Pilot components
import CoPilotWorkspace from "../components/copilot/CoPilotWorkspace";
import AgentBuilder from "../components/copilot/AgentBuilder";
import PipelineStudio from "../components/copilot/PipelineStudio";
import WorkflowComposer from "../components/copilot/WorkflowComposer";
import DraftStudio from "../components/copilot/DraftStudio";
import InsightTimeline from "../components/copilot/InsightTimeline";
import CoPilotCommandPalette from "../components/copilot/CoPilotCommandPalette";

// AI Enhancement components (Phase 1)
import GlobalAIAssistant from "../components/ai/GlobalAIAssistant";
import AIAgentTrainingStudio from "../components/copilot/AIAgentTrainingStudio";
import AIWorkflowOptimizer from "../components/copilot/AIWorkflowOptimizer";

// NEW: Phase 1.5 - Interaction + Intelligence components
import ConversationalBuilder from "../components/copilot/ConversationalBuilder";
import ContextMemory from "../components/copilot/ContextMemory";
import PairBuildMode from "../components/copilot/PairBuildMode";
import CoPilotCanvas from "../components/copilot/CoPilotCanvas";
import VoiceCommandInterface from "../components/copilot/VoiceCommandInterface";

export default function CoPilot() {
  const [activeTab, setActiveTab] = useState("workspace");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [userActivity, setUserActivity] = useState("browsing");
  const [userRole] = useState("admin");
  
  // Phase 1.5 state
  const [pairBuildEnabled, setPairBuildEnabled] = useState(false);
  const [showContextMemory, setShowContextMemory] = useState(true);
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        e.preventDefault();
        setVoiceModeOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Track user activity
  useEffect(() => {
    setUserActivity(`viewing_${activeTab}`);
  }, [activeTab]);

  const handleBuildComplete = (data) => {
    console.log("Build completed:", data);
  };

  const handleNodeClick = (node) => {
    console.log("Node clicked:", node);
    // Navigate to appropriate builder tab
    if (node.type === "agent") setActiveTab("agent-builder");
    else if (node.type === "pipeline") setActiveTab("pipeline");
    else if (node.type === "workflow") setActiveTab("workflow");
  };

  return (
    <div className="space-y-6 relative">
      {/* Global AI Assistant */}
      <GlobalAIAssistant 
        currentTab={activeTab}
        userActivity={userActivity}
        userRole={userRole}
      />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Co-Pilot Flight Deck</h1>
                <p className="text-purple-100 text-sm">Phase 1.5: Your AI partner that thinks, asks, and remembers</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2">
                <Zap className="w-3 h-3 mr-1" />
                AI Partner Active
              </Badge>
              {pairBuildEnabled && (
                <Badge className="bg-emerald-500/90 backdrop-blur-sm text-white border-white/30 px-4 py-2 animate-pulse">
                  <Users className="w-3 h-3 mr-1" />
                  Pair-Build ON
                </Badge>
              )}
            </div>
          </div>

          {/* 3 Layers of Assistance */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl mb-2">🧠</div>
              <div className="font-semibold mb-1">Understand</div>
              <div className="text-xs text-purple-100">Contextual memory + intelligent recall</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl mb-2">✨</div>
              <div className="font-semibold mb-1">Guide</div>
              <div className="text-xs text-purple-100">Conversational building + pair programming</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl mb-2">🔧</div>
              <div className="font-semibold mb-1">Build</div>
              <div className="text-xs text-purple-100">Voice commands + visual canvas</div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-purple-100">
              💡 <kbd className="px-2 py-1 bg-white/20 rounded">⌘K</kbd> Command Palette 
              · <kbd className="px-2 py-1 bg-white/20 rounded">⌘V</kbd> Voice Mode
            </div>
            <Button
              size="sm"
              onClick={() => setVoiceModeOpen(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30"
            >
              <Mic className="w-3 h-3 mr-1" />
              Activate Voice
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout: Context Memory Sidebar + Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar: Context Memory */}
        {showContextMemory && (
          <div className="col-span-3">
            <ContextMemory onRecall={(item) => console.log("Recall:", item)} />
          </div>
        )}

        {/* Main Content */}
        <div className={showContextMemory ? "col-span-9" : "col-span-12"}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-1 shadow-sm">
              <TabsTrigger 
                value="workspace"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
              >
                <Brain className="w-4 h-4 mr-2" />
                Workspace
              </TabsTrigger>
              <TabsTrigger 
                value="conversational"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Conversational
              </TabsTrigger>
              <TabsTrigger 
                value="canvas"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
              >
                <Network className="w-4 h-4 mr-2" />
                Canvas
              </TabsTrigger>
              <TabsTrigger 
                value="agent-builder"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
              >
                Agent Builder
              </TabsTrigger>
              <TabsTrigger 
                value="training"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
              >
                AI Training
              </TabsTrigger>
              <TabsTrigger 
                value="pipeline"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
              >
                Pipeline
              </TabsTrigger>
              <TabsTrigger 
                value="workflow"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
              >
                Workflow
              </TabsTrigger>
              <TabsTrigger 
                value="optimizer"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
              >
                <Zap className="w-4 h-4 mr-2" />
                Optimizer
              </TabsTrigger>
              <TabsTrigger 
                value="draft"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
              >
                Draft
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workspace" className="mt-6">
              <CoPilotWorkspace />
            </TabsContent>

            <TabsContent value="conversational" className="mt-6">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8">
                  <ConversationalBuilder onBuildComplete={handleBuildComplete} />
                </div>
                <div className="col-span-4">
                  <PairBuildMode 
                    enabled={pairBuildEnabled}
                    onToggle={setPairBuildEnabled}
                    currentComponent="conversational-builder"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="canvas" className="mt-6">
              <CoPilotCanvas onNodeClick={handleNodeClick} />
            </TabsContent>

            <TabsContent value="agent-builder" className="mt-6">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8">
                  <AgentBuilder />
                </div>
                <div className="col-span-4">
                  <PairBuildMode 
                    enabled={pairBuildEnabled}
                    onToggle={setPairBuildEnabled}
                    currentComponent="agent-builder"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="training" className="mt-6">
              <AIAgentTrainingStudio agent={{ name: "Invoice Reconciler" }} />
            </TabsContent>

            <TabsContent value="pipeline" className="mt-6">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8">
                  <PipelineStudio />
                </div>
                <div className="col-span-4">
                  <PairBuildMode 
                    enabled={pairBuildEnabled}
                    onToggle={setPairBuildEnabled}
                    currentComponent="pipeline-studio"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="workflow" className="mt-6">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8">
                  <WorkflowComposer />
                </div>
                <div className="col-span-4">
                  <PairBuildMode 
                    enabled={pairBuildEnabled}
                    onToggle={setPairBuildEnabled}
                    currentComponent="workflow-composer"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="optimizer" className="mt-6">
              <AIWorkflowOptimizer workflows={[]} />
            </TabsContent>

            <TabsContent value="draft" className="mt-6">
              <DraftStudio />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Voice Command Modal */}
      {voiceModeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <VoiceCommandInterface 
              onCommand={(data) => {
                console.log("Voice command:", data);
                setTimeout(() => setVoiceModeOpen(false), 3000);
              }}
            />
            <Button
              onClick={() => setVoiceModeOpen(false)}
              className="mt-4 w-full"
              variant="outline"
            >
              Close Voice Mode
            </Button>
          </div>
        </div>
      )}

      {/* Global Insight Timeline */}
      <InsightTimeline />

      {/* Command Palette */}
      <CoPilotCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  );
}