import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import DemoLayout from "@/components/DemoLayout";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DemoProvider, useDemo } from "./contexts/DemoContext";
import { useAuth } from "./_core/hooks/useAuth";

// Pages
import Landing from "./pages/Landing";
import Portfolio from "./pages/Portfolio";
import Borrowers from "./pages/Borrowers";
import BorrowerDetail from "./pages/BorrowerDetail";
import SubmitFinancials from "./pages/SubmitFinancials";
import AlertsFeed from "./pages/AlertsFeed";
import CovenantConfig from "./pages/CovenantConfig";
import UserManagement from "./pages/UserManagement";

// Demo pages
import DemoPortfolio from "./pages/DemoPortfolio";
import DemoBorrowers from "./pages/DemoBorrowers";
import DemoBorrowerDetail from "./pages/DemoBorrowerDetail";
import DemoAlerts from "./pages/DemoAlerts";
import DemoSubmitFinancials from "./pages/DemoSubmitFinancials";
import TechStack from "./pages/TechStack";

function Router() {
  const { user, loading } = useAuth();
  const { isDemoMode } = useDemo();

  // Demo routes — no auth required
  if (isDemoMode) {
    return (
      <DemoLayout>
        <Switch>
          <Route path="/dashboard" component={DemoPortfolio} />
          <Route path="/demo/borrowers/:id" component={DemoBorrowerDetail} />
          <Route path="/demo/borrowers" component={DemoBorrowers} />
          <Route path="/demo/alerts" component={DemoAlerts} />
          <Route path="/tech-stack" component={TechStack} />
          <Route path="/demo/try" component={DemoSubmitFinancials} />
          {/* Redirect any other path to demo dashboard */}
          <Route>{() => { window.location.replace("/dashboard"); return null; }}</Route>
        </Switch>
      </DemoLayout>
    );
  }

  // Show landing page for unauthenticated users (not in demo mode)
  if (!loading && !user) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/tech-stack" component={TechStack} />
        {/* Allow /dashboard to enter demo mode from direct link */}
        <Route path="/dashboard">{() => { window.location.replace("/"); return null; }}</Route>
        <Route component={Landing} />
      </Switch>
    );
  }

  // While auth is loading, show nothing to avoid flash
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Authenticated routes
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Portfolio} />
        <Route path="/borrowers" component={Borrowers} />
        <Route path="/borrowers/:id" component={BorrowerDetail} />
        <Route path="/financials/submit" component={SubmitFinancials} />
        <Route path="/alerts" component={AlertsFeed} />
        <Route path="/covenants" component={CovenantConfig} />
        <Route path="/admin/users" component={UserManagement} />
        <Route path="/tech-stack" component={TechStack} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <DemoProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </DemoProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
