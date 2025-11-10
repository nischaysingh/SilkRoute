import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ATCTab from "../components/silkroute/ATCTab";
import PilotTab from "../components/pilot/PilotTab";
import CoPilot from "./CoPilot";
import AutopilotTab from "../components/autopilot/AutopilotTab";
import ToolboxTab from "../components/toolbox/ToolboxTab";
import GlobalAIAssistant from "../components/ai/GlobalAIAssistant";

export default function SilkRouteAI() {
  const [activeTab, setActiveTab] = useState("atc");
  const [userRole] = useState("admin"); // In real app, get from auth

  return (
    <div className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 p-6 rounded-[10px] min-h-screen space-y-6 relative">
      {/* Global AI Assistant - Works across ALL tabs */}
      <GlobalAIAssistant 
        currentTab={activeTab}
        userActivity={`viewing_${activeTab}`}
        userRole={userRole}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl p-1 shadow-sm">
          <TabsTrigger 
            value="atc" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-700 rounded-lg"
          >
            ATC
          </TabsTrigger>
          <TabsTrigger 
            value="pilot" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-700 rounded-lg"
          >
            Pilot
          </TabsTrigger>
          <TabsTrigger 
            value="co-pilot" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-700 rounded-lg"
          >
            Co-Pilot
          </TabsTrigger>
          <TabsTrigger 
            value="autopilot" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-700 rounded-lg"
          >
            Autopilot
          </TabsTrigger>
          <TabsTrigger 
            value="toolbox" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-700 rounded-lg"
          >
            Toolbox
          </TabsTrigger>
        </TabsList>

        <TabsContent value="atc" className="mt-6">
          <ATCTab />
        </TabsContent>

        <TabsContent value="pilot" className="mt-6">
          <PilotTab />
        </TabsContent>

        <TabsContent value="co-pilot" className="mt-6">
          <CoPilot />
        </TabsContent>

        <TabsContent value="autopilot" className="mt-6">
          <AutopilotTab />
        </TabsContent>

        <TabsContent value="toolbox" className="mt-6">
          <ToolboxTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}