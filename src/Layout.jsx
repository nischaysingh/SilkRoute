
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard, DollarSign, CreditCard, Users, PiggyBank,
  BarChart, CheckCircle, Settings, Bell, ChevronDown, Menu, X, Package, Radar, Wifi } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCompany, setActiveCompany] = useState("Acme Corp");
  const [activePeriod, setActivePeriod] = useState("This Month");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const navItems = [
  { name: "Overview", path: createPageUrl("Overview"), icon: LayoutDashboard },
  { name: "Cash Flow", path: createPageUrl("CashFlow"), icon: DollarSign },
  { name: "Payroll", path: createPageUrl("Payroll"), icon: Users },
  { name: "Taxes", path: createPageUrl("Taxes"), icon: PiggyBank },
  { name: "FP&A", path: createPageUrl("FPA"), icon: BarChart },
  { name: "Management", path: createPageUrl("Management"), icon: Package },
  { name: "SilkRouteAI", path: createPageUrl("SilkRouteAI"), icon: Radar },
  { name: "Integrations", path: createPageUrl("Integrations"), icon: CheckCircle },
  { name: "Settings", path: createPageUrl("Settings"), icon: Settings }];


  const isActive = (path) => location.pathname === path;

  const companies = ["Acme Corp", "Beta Solutions", "Gamma Enterprises"];
  const periods = ["This Month", "Last 3 Months", "YTD"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Top Navigation Bar */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Left: Company Switcher */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>

              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 rounded-lg bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                  <span className="font-semibold">{activeCompany}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-gray-900/95 backdrop-blur-xl border-white/20 text-white">
                <DropdownMenuLabel className="text-gray-400">Select Company</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {companies.map((company) =>
                <DropdownMenuItem
                  key={company}
                  onClick={() => setActiveCompany(company)}
                  className="hover:bg-white/10 focus:bg-white/10">

                    {company}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center: App Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-4xl font-medium text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Opsentia
            </h1>
          </div>

          {/* Right: System Status, M.POS, Period Selector, Alert Bell, Avatar */}
          <div className="flex items-center gap-3">
            {/* All Systems Online */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/20 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-medium text-white">All systems online</span>
            </div>

            {/* M.POS Connected */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/20 backdrop-blur-sm">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-white">M.POS connected</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-gray-300 hover:bg-white/10">
                  <span className="text-sm">{activePeriod}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 bg-gray-900/95 backdrop-blur-xl border-white/20 text-white">
                <DropdownMenuLabel className="text-gray-400">Select Period</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {periods.map((period) =>
                <DropdownMenuItem
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className="hover:bg-white/10 focus:bg-white/10">

                    {period}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="relative text-gray-300 hover:bg-white/10">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </Button>

            {user &&
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-white/10">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-white">
                      {user.full_name || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-gray-900/95 backdrop-blur-xl border-white/20 text-white">
                  <DropdownMenuLabel className="text-gray-400">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                  onClick={() => base44.auth.logout()}
                  className="hover:bg-white/10 focus:bg-white/10">

                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          </div>
        </div>

        {/* Horizontal Navigation Tabs (Desktop) */}
        <div className="bg-slate-50 text-slate-950 mx-6 px-6 rounded-[10px] hidden lg:flex border-t border-white/10">
          {navItems.map((item) =>
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "flex items-center gap-2 px-4 py-3 border-b-2 transition-all text-sm font-medium",
              isActive(item.path) ?
              "border-blue-500 text-blue-400 bg-blue-500/10" :
              "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
            )}>

              <item.icon className="w-4 h-4" />
              <span className="text-slate-950">{item.name}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen &&
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        onClick={() => setMobileMenuOpen(false)} />

      }

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gray-900/95 backdrop-blur-xl border-r border-white/10 w-64 z-40 transform transition-transform duration-300 lg:hidden shadow-2xl",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>

        <nav className="p-4 space-y-1">
          {navItems.map((item) =>
          <Link
            key={item.name}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              isActive(item.path) ?
              "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
              "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
            )}>

              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>);

}
