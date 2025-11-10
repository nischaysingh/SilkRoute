import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function Integrations() {
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  // Mock data
  const integrations = [
    { id: 1, name: "JPMorgan Chase", kind: "bank", status: "Connected", last_sync_at: "2024-12-20T10:30:00Z", logo: "🏦" },
    { id: 2, name: "Bank of America", kind: "bank", status: "Connected", last_sync_at: "2024-12-20T09:15:00Z", logo: "🏦" },
    { id: 3, name: "Stripe", kind: "processor", status: "Connected", last_sync_at: "2024-12-20T11:45:00Z", logo: "💳" },
    { id: 4, name: "DoorDash", kind: "processor", status: "Not Connected", last_sync_at: null, logo: "🍔" },
    { id: 5, name: "App Store", kind: "processor", status: "Connected", last_sync_at: "2024-12-19T18:20:00Z", logo: "📱" },
    { id: 6, name: "AWS Marketplace", kind: "processor", status: "Error", last_sync_at: "2024-12-18T14:00:00Z", logo: "☁️" },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "Connected":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "Error":
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Connected":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Error":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const sampleData = [
    { date: "2024-12-20", description: "Transaction 1", amount: 1250 },
    { date: "2024-12-19", description: "Transaction 2", amount: 3400 },
    { date: "2024-12-18", description: "Transaction 3", amount: 890 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Integrations & Banking</h2>
        <p className="text-gray-400 mt-1">Connect and manage external accounts</p>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card 
            key={integration.id} 
            className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group"
            onClick={() => setSelectedIntegration(integration)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{integration.logo}</div>
                  <div>
                    <CardTitle className="text-lg text-white">{integration.name}</CardTitle>
                    <p className="text-sm text-gray-400 capitalize">{integration.kind}</p>
                  </div>
                </div>
                {getStatusIcon(integration.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Badge className={getStatusColor(integration.status)}>
                  {integration.status}
                </Badge>
                {integration.last_sync_at && (
                  <div className="text-xs text-gray-500">
                    Last sync: {format(new Date(integration.last_sync_at), 'MMM d, h:mm a')}
                  </div>
                )}
                <Button 
                  variant={integration.status === "Connected" ? "outline" : "default"}
                  size="sm"
                  className={
                    integration.status === "Connected" 
                      ? "w-full bg-white/5 border-white/10 text-white hover:bg-white/10" 
                      : "w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0"
                  }
                >
                  {integration.status === "Connected" ? "Manage" : "Connect"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Detail Sheet */}
      <Sheet open={!!selectedIntegration} onOpenChange={(open) => !open && setSelectedIntegration(null)}>
        <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedIntegration?.logo}</span>
              <div>
                <SheetTitle className="text-white">{selectedIntegration?.name}</SheetTitle>
                <SheetDescription className="capitalize text-gray-400">{selectedIntegration?.kind} Integration</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          {selectedIntegration && (
            <div className="mt-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Connection Status</h3>
                  <Badge className={getStatusColor(selectedIntegration.status)}>
                    {selectedIntegration.status}
                  </Badge>
                </div>
                {selectedIntegration.last_sync_at && (
                  <div className="text-sm text-gray-400">
                    Last synchronized: {format(new Date(selectedIntegration.last_sync_at), 'MMM d, yyyy h:mm a')}
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="font-semibold text-white mb-3">Permissions</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Read transaction history</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Read account balances</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Read account details</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">(Read-only permissions)</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Actions</h3>
                </div>
                <Button variant="outline" className="w-full gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10">
                  <RefreshCw className="w-4 h-4" />
                  Simulate Sync (no-op)
                </Button>
                <p className="text-xs text-gray-500 mt-2">Demo only - no actual sync performed</p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="font-semibold text-white mb-3">Sample Data Preview</h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm border border-white/10">
                  {sampleData.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <div>
                        <div className="font-medium text-white">{item.description}</div>
                        <div className="text-xs text-gray-500">{format(new Date(item.date), 'MMM d, yyyy')}</div>
                      </div>
                      <div className="font-semibold text-white">${item.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}