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
    { name: "Workflows", path: createPageUrl("WorkflowHub"), icon: Wifi },
    { name: "Integrations", path: createPageUrl("Integrations"), icon: CheckCircle },
    { name: "Settings", path: createPageUrl("Settings"), icon: Settings }
  ];

  const isActive = (path) => location.pathname === path;

  const companies = ["Acme Corp", "Beta Solutions", "Gamma Enterprises"];
  const periods = ["This Month", "Last 3 Months", "YTD"];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Cyberpunk Grid Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>
      {/* Neon Glow Orbs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-magenta-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
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
      <div className="bg-black/90 backdrop-blur-xl border-b border-cyan-500/30 sticky top-0 z-50 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
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
                <Button variant="outline" className="flex items-center gap-2 rounded bg-black border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all">
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
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 via-magenta-400 to-cyan-400 bg-clip-text text-transparent animate-pulse" style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>
              [SILKROUTE]
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

            <Button variant="ghost" size="icon" className="relative text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_10px_rgba(0,255,255,0.5)]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-magenta-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,0,255,0.8)]"></span>
            </Button>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-cyan-500/20 hover:shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-magenta-500 rounded-sm flex items-center justify-center border border-cyan-400/50 shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                      <span className="text-black font-bold text-sm">
                        {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-bold text-cyan-400" style={{ fontFamily: 'monospace' }}>
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

        <div className="bg-black/80 backdrop-blur-sm mx-6 px-6 rounded-none hidden lg:flex items-center border border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-2 px-4 py-3 border-b-2 transition-all text-sm font-bold relative group",
                isActive(item.path)
                  ? "border-cyan-500 text-cyan-400 bg-cyan-500/10 shadow-[0_0_10px_rgba(0,255,255,0.4)]"
                  : "border-transparent text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/5"
              )}
              style={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
              {isActive(item.path) && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
              )}
            </Link>
          ))}
          
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="text-xs font-bold text-emerald-400" style={{ fontFamily: 'monospace' }}>SYSTEMS.ONLINE</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-black border border-cyan-500/50 shadow-[0_0_10px_rgba(0,255,255,0.3)]">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-400" style={{ fontFamily: 'monospace' }}>M.POS::ACTIVE</span>
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
          "p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto relative z-10",
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
                "fixed bottom-6 right-6 z-[90] rounded-sm w-16 h-16 transition-all duration-200 flex items-center justify-center border-2",
                isExplainModeActive
                  ? "bg-black border-magenta-500 shadow-[0_0_20px_rgba(255,0,255,0.8)] hover:shadow-[0_0_30px_rgba(255,0,255,1)] scale-110"
                  : "bg-black border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.5)] hover:shadow-[0_0_25px_rgba(0,255,255,0.8)]"
              )}
              aria-label={isExplainModeActive ? "Exit Explain Mode (Press E)" : "Enter Explain Mode (Press E)"}
            >
              <div className="flex flex-col items-center">
                <Eye className={cn("w-6 h-6", isExplainModeActive ? "text-magenta-400" : "text-cyan-400")} />
                <span className={cn("text-[9px] mt-0.5 font-bold", isExplainModeActive ? "text-magenta-400" : "text-cyan-400")} style={{ fontFamily: 'monospace' }}>
                  {isExplainModeActive ? "EXIT" : "SCAN"}
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
            className="fixed bottom-24 right-6 z-[90] px-4 py-2 bg-black border-2 border-magenta-500 text-magenta-400 text-xs font-bold shadow-[0_0_20px_rgba(255,0,255,0.6)]"
            style={{ fontFamily: 'monospace' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-magenta-500 animate-pulse shadow-[0_0_8px_rgba(255,0,255,0.8)]"></div>
              <span>[SCAN MODE::ACTIVE] - CLICK TO ANALYZE</span>
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