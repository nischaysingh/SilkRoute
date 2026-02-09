import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard, DollarSign, CreditCard, Users, PiggyBank,
  BarChart, CheckCircle, Settings, Bell, ChevronDown, Menu, X, Package, Radar, Wifi, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ExplainModeProvider, useExplainMode } from "@/components/explain/ExplainModeContext";
import ExplainCoPilotPanel from "@/components/explain/ExplainCoPilotPanel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AIAnalyticsAssistant from "@/components/analytics/AIAnalyticsAssistant";

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCompany, setActiveCompany] = useState("Acme Corp");
  const [activePeriod, setActivePeriod] = useState("This Month");
  
  const { isExplainModeActive, toggleExplainMode } = useExplainMode();

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
    { name: "Settings", path: createPageUrl("Settings"), icon: Settings }
  ];

  const isActive = (path) => location.pathname === path;

  const companies = ["Acme Corp", "Beta Solutions", "Gamma Enterprises"];
  const periods = ["This Month", "Last 3 Months", "YTD"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Explain Mode Global Styles */}
      <style>{`
        /* Explain Mode Highlight Glow for ANY element clicked */
        ${isExplainModeActive ? `
          [class*="Card"]:not(.explain-copilot-panel):not(.explain-copilot-panel *):hover,
          [class*="recharts"]:not(.explain-copilot-panel):not(.explain-copilot-panel *):hover,
          table:not(.explain-copilot-panel):not(.explain-copilot-panel *):hover,
          [class*="bg-"][class*="border"]:not(.explain-copilot-panel):not(.explain-copilot-panel *):not(button):not(input):hover {
            outline: 2px solid rgba(147, 51, 234, 0.6) !important;
            outline-offset: 2px !important;
            box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.15), 0 0 20px rgba(147, 51, 234, 0.4) !important;
            cursor: pointer !important;
            transition: all 150ms ease-in-out !important;
          }

          [data-explainable="true"]:not(.explain-copilot-panel):not(.explain-copilot-panel *) {
            outline: 2px solid rgba(147, 51, 234, 0.5) !important;
            outline-offset: 2px !important;
            box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.1), 0 0 16px rgba(147, 51, 234, 0.3) !important;
            cursor: pointer !important;
            transition: all 150ms ease-in-out !important;
          }

          [data-explainable="true"]:not(.explain-copilot-panel):not(.explain-copilot-panel *):hover {
            outline-color: rgba(147, 51, 234, 0.8) !important;
            box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.2), 0 0 24px rgba(147, 51, 234, 0.5) !important;
          }
        ` : ''}

        /* Background dimming when Explain Mode is active */
        .explain-mode-active-bg::before {
          content: '';
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.25);
          pointer-events: none;
          z-index: 40;
          transition: opacity 200ms ease-in-out;
        }
      `}</style>

      {/* Top Navigation Bar */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
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
                {companies.map((company) => (
                  <DropdownMenuItem
                    key={company}
                    onClick={() => setActiveCompany(company)}
                    className="hover:bg-white/10 focus:bg-white/10"
                  >
                    {company}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-4xl font-medium text-center text-white">
              Silkroute
            </h1>
          </div>

          <div className="flex items-center gap-3">
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
                {periods.map((period) => (
                  <DropdownMenuItem
                    key={period}
                    onClick={() => setActivePeriod(period)}
                    className="hover:bg-white/10 focus:bg-white/10"
                  >
                    {period}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="relative text-gray-300 hover:bg-white/10">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </Button>

            {user && (
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
                    className="hover:bg-white/10 focus:bg-white/10"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="bg-slate-50 text-slate-950 mx-6 px-6 rounded-[10px] hidden lg:flex items-center border-t border-white/10">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-2 px-4 py-3 border-b-2 transition-all text-sm font-medium",
                isActive(item.path)
                  ? "border-blue-500 text-blue-400 bg-blue-500/10"
                  : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-slate-950">{item.name}</span>
            </Link>
          ))}
          
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-medium text-slate-700">All systems online</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
              <Wifi className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-slate-700">M.POS connected</span>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gray-900/95 backdrop-blur-xl border-r border-white/10 w-64 z-40 transform transition-transform duration-300 lg:hidden shadow-2xl",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive(item.path)
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <main 
        className={cn(
          "p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto relative",
          isExplainModeActive && "explain-mode-active-bg"
        )}
      >
        {children}
      </main>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleExplainMode}
              className={cn(
                "fixed bottom-6 right-6 z-[90] rounded-full w-16 h-16 shadow-2xl transition-all duration-200 flex items-center justify-center",
                isExplainModeActive
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 scale-110"
                  : "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700"
              )}
              aria-label={isExplainModeActive ? "Exit Explain Mode (Press E)" : "Enter Explain Mode (Press E)"}
            >
              <div className="flex flex-col items-center">
                <Eye className="w-6 h-6 text-white" />
                <span className="text-[9px] text-white mt-0.5 font-semibold">
                  {isExplainModeActive ? "EXIT" : "EXPLAIN"}
                </span>
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-gray-900 border-purple-500/30 text-white">
            <p className="text-xs font-semibold">
              {isExplainModeActive 
                ? "Exit Explain Mode (Press E)" 
                : "Explain Mode - Click anything to understand it (Press E)"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AnimatePresence>
        {isExplainModeActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-[90] px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold shadow-lg border border-white/20"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <span>Explain Mode Active - Click any widget to understand it</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ExplainCoPilotPanel />
      <AIAnalyticsAssistant />
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <ExplainModeProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </ExplainModeProvider>
  );
}