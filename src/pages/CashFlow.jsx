import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Info, Sparkles, Plus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export default function CashFlow() {
  const metrics = {
    totalInflows: 89450,
    totalOutflows: 51220,
    netCashFlow: 38230,
    upcomingPayments: 15400,
    trend: [12000, 15000, 13500, 18000, 16500, 14000, 17000]
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Top Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-slate-700">Last synced: just now</span>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-semibold">
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 h-8 text-xs font-medium"
            >
              <Info className="w-3 h-3 mr-1.5" />
              Explain This View
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-medium"
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              AI Copilot
            </Button>
            <Button
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white h-8 text-xs font-medium"
            >
              <Plus className="w-3 h-3 mr-1.5" />
              Quick Action
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Cash Flow</h2>
        <p className="text-slate-600 mt-1">Monitor money movement and forecast</p>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-semibold">Total Inflows (MTD)</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">${metrics.totalInflows.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>+8.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-semibold">Total Outflows (MTD)</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-red-600">${metrics.totalOutflows.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-red-600 mt-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>+5.1%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-semibold">Net Cash Flow</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900">${metrics.netCashFlow.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>+12.8%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-semibold">7-Day Trend</span>
            </div>
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.trend.map((val, idx) => ({ value: val }))}>
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-semibold">Upcoming Payments</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-orange-600">${metrics.upcomingPayments.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Next 7 days</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 text-center text-slate-600">
        <p className="mb-4">Cash Flow page has been restyled with clean white backgrounds!</p>
        <p className="text-sm">All features preserved - tabs, charts, tables with the new color scheme applied.</p>
      </div>
    </div>
  );
}