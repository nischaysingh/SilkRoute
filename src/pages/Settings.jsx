import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Plus, Trash2, Edit, Save, Building, CreditCard, Users, Shield, 
  Bell, Database, Key, Mail, CheckCircle, AlertCircle 
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Settings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("company");

  // Company settings state
  const [companyName, setCompanyName] = useState("Acme Corp");
  const [address, setAddress] = useState("123 Main Street, San Francisco, CA 94105");
  const [fiscalYearStart, setFiscalYearStart] = useState("january");
  const [currency, setCurrency] = useState("usd");

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(true);
  const [anomalyAlerts, setAnomalyAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);

  // Get current user
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Fetch accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Accounts.list(),
  });

  // New account dialog state
  const [newAccountOpen, setNewAccountOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({ code: "", name: "", type: "Asset" });

  // Create account mutation
  const createAccountMutation = useMutation({
    mutationFn: (data) => base44.entities.Accounts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['accounts']);
      toast.success("Account created successfully");
      setNewAccountOpen(false);
      setNewAccount({ code: "", name: "", type: "Asset" });
    },
    onError: () => toast.error("Failed to create account"),
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: (id) => base44.entities.Accounts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['accounts']);
      toast.success("Account deleted successfully");
    },
    onError: () => toast.error("Failed to delete account"),
  });

  // Save company settings
  const saveCompanySettings = () => {
    // Here you would save to a CompanySettings entity or user metadata
    base44.auth.updateMe({
      company_name: companyName,
      address: address,
      fiscal_year_start: fiscalYearStart,
      currency: currency,
    }).then(() => {
      toast.success("Company settings saved successfully");
    }).catch(() => {
      toast.error("Failed to save settings");
    });
  };

  // Save notification settings
  const saveNotificationSettings = () => {
    base44.auth.updateMe({
      email_notifications: emailNotifications,
      slack_notifications: slackNotifications,
      anomaly_alerts: anomalyAlerts,
      weekly_reports: weeklyReports,
    }).then(() => {
      toast.success("Notification settings saved successfully");
    }).catch(() => {
      toast.error("Failed to save settings");
    });
  };

  const typeColors = {
    "Asset": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Liability": "bg-red-500/20 text-red-400 border-red-500/30",
    "Equity": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "Revenue": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "Expense": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Settings</h2>
        <p className="text-gray-400 mt-1">Configure your company and system preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1">
          <TabsTrigger value="company" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 rounded-lg">
            <Building className="w-4 h-4 mr-2" />
            Company
          </TabsTrigger>
          <TabsTrigger value="accounts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 rounded-lg">
            <CreditCard className="w-4 h-4 mr-2" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 rounded-lg">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 rounded-lg">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 rounded-lg">
            <Database className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-6 space-y-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Company Information</CardTitle>
              <CardDescription className="text-gray-400">Manage your company profile and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Company Name</Label>
                  <Input 
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">EIN</Label>
                  <Input defaultValue="**-*******23" disabled className="bg-white/5 border-white/10 text-gray-500 cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Address</Label>
                <Input 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-white/5 border-white/10 text-white" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Fiscal Year Start</Label>
                  <Select value={fiscalYearStart} onValueChange={setFiscalYearStart}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                      <SelectItem value="january">January</SelectItem>
                      <SelectItem value="april">April</SelectItem>
                      <SelectItem value="july">July</SelectItem>
                      <SelectItem value="october">October</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <Button 
                  onClick={saveCompanySettings}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Chart of Accounts</CardTitle>
                  <CardDescription className="text-gray-400">Manage your accounting accounts</CardDescription>
                </div>
                <Dialog open={newAccountOpen} onOpenChange={setNewAccountOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                    <DialogHeader>
                      <DialogTitle>Create New Account</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Add a new account to your chart of accounts
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Account Code</Label>
                        <Input 
                          value={newAccount.code}
                          onChange={(e) => setNewAccount({...newAccount, code: e.target.value})}
                          placeholder="e.g., 7000"
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Name</Label>
                        <Input 
                          value={newAccount.name}
                          onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                          placeholder="e.g., Marketing Expenses"
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Type</Label>
                        <Select value={newAccount.type} onValueChange={(value) => setNewAccount({...newAccount, type: value})}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white">
                            <SelectItem value="Asset">Asset</SelectItem>
                            <SelectItem value="Liability">Liability</SelectItem>
                            <SelectItem value="Equity">Equity</SelectItem>
                            <SelectItem value="Revenue">Revenue</SelectItem>
                            <SelectItem value="Expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setNewAccountOpen(false)}
                          className="flex-1 bg-white/5 border-white/10 text-white"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => createAccountMutation.mutate(newAccount)}
                          disabled={!newAccount.code || !newAccount.name || createAccountMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {createAccountMutation.isPending ? "Creating..." : "Create Account"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {accountsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-gray-400">Code</TableHead>
                        <TableHead className="text-gray-400">Name</TableHead>
                        <TableHead className="text-gray-400">Type</TableHead>
                        <TableHead className="text-gray-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow key={account.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-mono text-gray-300">{account.code}</TableCell>
                          <TableCell className="font-medium text-white">{account.name}</TableCell>
                          <TableCell>
                            <Badge className={typeColors[account.type]}>{account.type}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteAccountMutation.mutate(account.id)}
                              disabled={deleteAccountMutation.isPending}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">User Management</CardTitle>
                  <CardDescription className="text-gray-400">Invite and manage team members</CardDescription>
                </div>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => toast.info("Use the invite button in your app dashboard to add users")}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Invite User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-semibold">{user?.full_name?.[0] || user?.email?.[0] || "U"}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{user?.full_name || "User"}</div>
                      <div className="text-sm text-gray-400">{user?.email || "user@example.com"}</div>
                    </div>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <Shield className="w-3 h-3 mr-1" />
                    {user?.role || "admin"}
                  </Badge>
                </div>

                <div className="text-sm text-gray-400 text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p>Invite team members from your dashboard to get started</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
              <CardDescription className="text-gray-400">Manage how you receive updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Email Notifications</div>
                      <div className="text-sm text-gray-400">Receive email updates for important events</div>
                    </div>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Slack Notifications</div>
                      <div className="text-sm text-gray-400">Get notified in Slack channels</div>
                    </div>
                  </div>
                  <Switch checked={slackNotifications} onCheckedChange={setSlackNotifications} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Anomaly Alerts</div>
                      <div className="text-sm text-gray-400">Instant alerts for unusual patterns</div>
                    </div>
                  </div>
                  <Switch checked={anomalyAlerts} onCheckedChange={setAnomalyAlerts} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Weekly Reports</div>
                      <div className="text-sm text-gray-400">Receive weekly summary reports</div>
                    </div>
                  </div>
                  <Switch checked={weeklyReports} onCheckedChange={setWeeklyReports} />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <Button 
                  onClick={saveNotificationSettings}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Connected Integrations</CardTitle>
              <CardDescription className="text-gray-400">Manage your third-party connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Stripe", status: "connected", icon: "💳", color: "blue" },
                  { name: "QuickBooks", status: "connected", icon: "📊", color: "emerald" },
                  { name: "Slack", status: "disconnected", icon: "💬", color: "purple" },
                  { name: "Shopify", status: "connected", icon: "🛍️", color: "green" },
                ].map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${integration.color}-500/20 border border-${integration.color}-500/30 flex items-center justify-center text-xl`}>
                        {integration.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{integration.name}</div>
                        <div className="text-xs text-gray-400">
                          {integration.status === "connected" ? "Connected" : "Not connected"}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={integration.status === "connected" ? "outline" : "default"}
                      className={integration.status === "connected" ? 
                        "bg-white/5 border-white/10 text-white hover:bg-white/10" :
                        "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      }
                    >
                      {integration.status === "connected" ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}