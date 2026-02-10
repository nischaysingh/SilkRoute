import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, XCircle, AlertCircle, RefreshCw, Plus, Search, 
  Zap, Database, DollarSign, Users, MessageSquare, ShoppingCart,
  BarChart3, Calendar, Loader2, Settings, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Available integrations catalog
const INTEGRATION_CATALOG = [
  {
    provider: "stripe",
    name: "Stripe",
    kind: "payment_processor",
    description: "Payment processing and subscription management",
    logo: "💳",
    color: "from-blue-600 to-purple-600",
    features: ["Payments", "Subscriptions", "Invoices", "Customer Data"]
  },
  {
    provider: "quickbooks",
    name: "QuickBooks",
    kind: "accounting",
    description: "Accounting and financial management",
    logo: "📊",
    color: "from-green-600 to-emerald-600",
    features: ["General Ledger", "Invoices", "Expenses", "Reports"]
  },
  {
    provider: "salesforce",
    name: "Salesforce",
    kind: "crm",
    description: "Customer relationship management",
    logo: "☁️",
    color: "from-cyan-600 to-blue-600",
    features: ["Leads", "Opportunities", "Accounts", "Contacts"]
  },
  {
    provider: "slack",
    name: "Slack",
    kind: "communication",
    description: "Team communication and notifications",
    logo: "💬",
    color: "from-purple-600 to-pink-600",
    features: ["Messages", "Channels", "Notifications", "Webhooks"]
  },
  {
    provider: "hubspot",
    name: "HubSpot",
    kind: "crm",
    description: "Marketing and sales CRM",
    logo: "🎯",
    color: "from-orange-600 to-red-600",
    features: ["Contacts", "Deals", "Marketing", "Analytics"]
  },
  {
    provider: "shopify",
    name: "Shopify",
    kind: "ecommerce",
    description: "E-commerce platform",
    logo: "🛍️",
    color: "from-emerald-600 to-teal-600",
    features: ["Orders", "Products", "Customers", "Inventory"]
  },
  {
    provider: "xero",
    name: "Xero",
    kind: "accounting",
    description: "Cloud accounting software",
    logo: "💰",
    color: "from-blue-600 to-cyan-600",
    features: ["Invoices", "Bank Reconciliation", "Payroll", "Reports"]
  },
  {
    provider: "gmail",
    name: "Gmail",
    kind: "communication",
    description: "Email and calendar integration",
    logo: "📧",
    color: "from-red-600 to-pink-600",
    features: ["Email", "Calendar", "Contacts", "Labels"]
  },
  {
    provider: "intercom",
    name: "Intercom",
    kind: "crm",
    description: "Customer messaging platform",
    logo: "💭",
    color: "from-blue-600 to-indigo-600",
    features: ["Live Chat", "Messages", "Customer Data", "Automation"]
  },
  {
    provider: "mailchimp",
    name: "Mailchimp",
    kind: "communication",
    description: "Email marketing platform",
    logo: "🐵",
    color: "from-yellow-600 to-amber-600",
    features: ["Email Campaigns", "Audiences", "Automation", "Reports"]
  }
];

const getCategoryIcon = (kind) => {
  switch (kind) {
    case "payment_processor": return DollarSign;
    case "accounting": return BarChart3;
    case "crm": return Users;
    case "communication": return MessageSquare;
    case "ecommerce": return ShoppingCart;
    case "analytics": return BarChart3;
    case "bank": return Database;
    default: return Zap;
  }
};

export default function IntegrationHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [configData, setConfigData] = useState({ api_key: "" });
  const [activeTab, setActiveTab] = useState("connected");
  const queryClient = useQueryClient();

  // Fetch connected integrations
  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => base44.entities.Integrations.list('-updated_date', 50)
  });

  // Connect integration mutation
  const connectMutation = useMutation({
    mutationFn: async (integration) => {
      return base44.entities.Integrations.create({
        name: integration.name,
        kind: integration.kind,
        provider: integration.provider,
        status: "connected",
        config: configData,
        permissions: integration.features,
        last_sync_at: new Date().toISOString(),
        sync_frequency: "daily",
        enabled_features: integration.features,
        metadata: {
          logo: integration.logo,
          color: integration.color,
          description: integration.description
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setConnectDialogOpen(false);
      setConfigData({ api_key: "" });
      toast.success(`${selectedIntegration?.name} connected successfully!`);
    },
    onError: (error) => {
      toast.error("Failed to connect", {
        description: error.message
      });
    }
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.Integrations.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success("Integration disconnected");
    }
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.Integrations.update(id, {
        status: "syncing",
        last_sync_at: new Date().toISOString()
      });
      
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return base44.entities.Integrations.update(id, {
        status: "connected"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success("Sync completed");
    }
  });

  const handleConnect = (catalogItem) => {
    setSelectedIntegration(catalogItem);
    setConnectDialogOpen(true);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "connected":
        return {
          icon: CheckCircle,
          color: "text-emerald-600",
          bg: "bg-emerald-100",
          badge: "bg-emerald-100 text-emerald-700 border-emerald-300"
        };
      case "syncing":
        return {
          icon: RefreshCw,
          color: "text-blue-600",
          bg: "bg-blue-100",
          badge: "bg-blue-100 text-blue-700 border-blue-300",
          spin: true
        };
      case "error":
        return {
          icon: XCircle,
          color: "text-red-600",
          bg: "bg-red-100",
          badge: "bg-red-100 text-red-700 border-red-300"
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-slate-400",
          bg: "bg-slate-100",
          badge: "bg-slate-100 text-slate-600 border-slate-300"
        };
    }
  };

  const connectedProviders = integrations.map(i => i.provider);
  const categories = ["all", ...Array.from(new Set(INTEGRATION_CATALOG.map(i => i.kind)))];

  const filteredCatalog = INTEGRATION_CATALOG.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.kind === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Integration Hub</h2>
          <p className="text-sm text-slate-600 mt-1">
            Connect external data sources • {integrations.length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            {integrations.filter(i => i.status === 'connected').length} Connected
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="connected">Connected ({integrations.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({INTEGRATION_CATALOG.length})</TabsTrigger>
        </TabsList>

        {/* Connected Integrations */}
        <TabsContent value="connected" className="space-y-4 mt-4">
          {integrations.length === 0 ? (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-12 text-center">
                <Database className="w-16 h-16 mx-auto mb-4 text-blue-400 opacity-50" />
                <h4 className="text-lg font-semibold text-slate-900 mb-2">No Integrations Connected</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Connect your first data source to enable AI insights and workflow automation
                </p>
                <Button
                  onClick={() => setActiveTab("available")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Integrations
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration) => {
                const statusConfig = getStatusConfig(integration.status);
                const StatusIcon = statusConfig.icon;
                const CategoryIcon = getCategoryIcon(integration.kind);

                return (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-slate-200 hover:shadow-lg transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{integration.metadata?.logo || "🔗"}</div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{integration.name}</h4>
                              <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                                <CategoryIcon className="w-3 h-3" />
                                <span className="capitalize">{integration.kind.replace('_', ' ')}</span>
                              </div>
                            </div>
                          </div>
                          <StatusIcon 
                            className={cn(
                              "w-5 h-5",
                              statusConfig.color,
                              statusConfig.spin && "animate-spin"
                            )} 
                          />
                        </div>

                        <Badge className={cn("mb-3 text-xs", statusConfig.badge)}>
                          {integration.status === 'connected' && 'Connected'}
                          {integration.status === 'syncing' && 'Syncing...'}
                          {integration.status === 'error' && 'Error'}
                          {integration.status === 'not_connected' && 'Not Connected'}
                        </Badge>

                        {integration.last_sync_at && (
                          <p className="text-xs text-slate-600 mb-3">
                            Last synced: {format(new Date(integration.last_sync_at), 'MMM d, h:mm a')}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => syncMutation.mutate(integration.id)}
                            disabled={syncMutation.isPending || integration.status === 'syncing'}
                            className="flex-1"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Sync
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => disconnectMutation.mutate(integration.id)}
                            className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                          >
                            Disconnect
                          </Button>
                        </div>

                        {/* Features */}
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="flex flex-wrap gap-1">
                            {integration.enabled_features?.slice(0, 3).map((feature, idx) => (
                              <Badge key={idx} className="bg-slate-100 text-slate-700 text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Available Integrations */}
        <TabsContent value="available" className="space-y-4 mt-4">
          {/* Search & Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search integrations..."
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white"
            >
              <option value="all">All Categories</option>
              {categories.filter(c => c !== "all").map(cat => (
                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.map((item) => {
              const isConnected = connectedProviders.includes(item.provider);
              const CategoryIcon = getCategoryIcon(item.kind);

              return (
                <motion.div
                  key={item.provider}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={cn(
                    "border-2 transition-all",
                    isConnected ? "border-emerald-200 bg-emerald-50" : "border-slate-200 hover:shadow-lg"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{item.logo}</div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                            <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                              <CategoryIcon className="w-3 h-3" />
                              <span className="capitalize">{item.kind.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>
                        {isConnected && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mb-3">{item.description}</p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} className="bg-slate-100 text-slate-700 text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleConnect(item)}
                        disabled={isConnected}
                        className={cn(
                          "w-full",
                          isConnected
                            ? "bg-slate-200 text-slate-500"
                            : `bg-gradient-to-r ${item.color} hover:opacity-90`
                        )}
                      >
                        {isConnected ? (
                          "Already Connected"
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <span className="text-2xl">{selectedIntegration?.logo}</span>
              Connect {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-slate-600">{selectedIntegration?.description}</p>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-slate-700 mb-1 block">API Key / Token</Label>
                <Input
                  value={configData.api_key}
                  onChange={(e) => setConfigData({ ...configData, api_key: e.target.value })}
                  placeholder="Enter your API key..."
                  type="password"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Get your API key from {selectedIntegration?.name} dashboard
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="text-xs font-bold text-blue-900 mb-2">Permissions Requested:</h5>
                <div className="space-y-1">
                  {selectedIntegration?.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle className="w-3 h-3 text-blue-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => connectMutation.mutate(selectedIntegration)}
              disabled={!configData.api_key || connectMutation.isPending}
              className={`bg-gradient-to-r ${selectedIntegration?.color}`}
            >
              {connectMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}