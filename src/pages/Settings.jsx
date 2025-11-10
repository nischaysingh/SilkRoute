import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  // Mock data
  const accounts = [
    { code: "1000", name: "Cash", type: "Asset" },
    { code: "1100", name: "Accounts Receivable", type: "Asset" },
    { code: "2000", name: "Accounts Payable", type: "Liability" },
    { code: "3000", name: "Equity", type: "Equity" },
    { code: "4000", name: "Revenue", type: "Revenue" },
    { code: "5000", name: "Cost of Goods Sold", type: "Expense" },
    { code: "6000", name: "Operating Expenses", type: "Expense" },
  ];

  const roles = [
    { role: "Admin", users: 2, permissions: "Full access to all modules" },
    { role: "Finance", users: 3, permissions: "View and edit financial data" },
    { role: "Viewer", users: 5, permissions: "Read-only access" },
  ];

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

      <Tabs defaultValue="company">
        <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1">
          <TabsTrigger value="company" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 rounded-lg">Company Profile</TabsTrigger>
          <TabsTrigger value="accounts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 rounded-lg">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="roles" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 rounded-lg">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Company Name</Label>
                  <Input defaultValue="Acme Corp" className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">EIN</Label>
                  <Input defaultValue="**-*******23" disabled className="bg-white/5 border-white/10 text-gray-500 cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Address</Label>
                <Input defaultValue="123 Main Street, San Francisco, CA 94105" className="bg-white/5 border-white/10 text-white" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Fiscal Year Start</Label>
                  <Select defaultValue="january">
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
                  <Select defaultValue="usd">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Chart of Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-gray-400">Code</TableHead>
                      <TableHead className="text-gray-400">Name</TableHead>
                      <TableHead className="text-gray-400">Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account, idx) => (
                      <TableRow key={idx} className="border-white/10">
                        <TableCell className="font-mono text-gray-300">{account.code}</TableCell>
                        <TableCell className="font-medium text-white">{account.name}</TableCell>
                        <TableCell>
                          <Badge className={typeColors[account.type]}>{account.type}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Roles & Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-gray-400">Role</TableHead>
                      <TableHead className="text-gray-400">Users</TableHead>
                      <TableHead className="text-gray-400">Permissions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role, idx) => (
                      <TableRow key={idx} className="border-white/10">
                        <TableCell className="font-semibold text-white">{role.role}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white/5 border-white/20 text-white">{role.users} users</Badge>
                        </TableCell>
                        <TableCell className="text-gray-400">{role.permissions}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}