import Overview from './pages/Overview';
import Payroll from './pages/Payroll';
import Taxes from './pages/Taxes';
import FPA from './pages/FPA';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import CashFlow from './pages/CashFlow';
import Management from './pages/Management';
import SilkRouteAI from './pages/SilkRouteAI';
import CoPilot from './pages/CoPilot';
import Workflows from './pages/Workflows';
import Layout from './Layout.jsx';


export const PAGES = {
    "Overview": Overview,
    "Payroll": Payroll,
    "Taxes": Taxes,
    "FPA": FPA,
    "Integrations": Integrations,
    "Settings": Settings,
    "CashFlow": CashFlow,
    "Management": Management,
    "SilkRouteAI": SilkRouteAI,
    "CoPilot": CoPilot,
    "Workflows": Workflows,
}

export const pagesConfig = {
    mainPage: "Overview",
    Pages: PAGES,
    Layout: Layout,
};