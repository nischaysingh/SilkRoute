/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import CashFlow from './pages/CashFlow';
import CoPilot from './pages/CoPilot';
import FPA from './pages/FPA';
import Home from './pages/Home';
import Integrations from './pages/Integrations';
import Management from './pages/Management';
import Overview from './pages/Overview';
import Payroll from './pages/Payroll';
import Settings from './pages/Settings';
import SilkRouteAI from './pages/SilkRouteAI';
import Taxes from './pages/Taxes';
import WorkflowHub from './pages/WorkflowHub';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CashFlow": CashFlow,
    "CoPilot": CoPilot,
    "FPA": FPA,
    "Home": Home,
    "Integrations": Integrations,
    "Management": Management,
    "Overview": Overview,
    "Payroll": Payroll,
    "Settings": Settings,
    "SilkRouteAI": SilkRouteAI,
    "Taxes": Taxes,
    "WorkflowHub": WorkflowHub,
}

export const pagesConfig = {
    mainPage: "Overview",
    Pages: PAGES,
    Layout: __Layout,
};