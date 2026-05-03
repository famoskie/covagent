import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Portfolio from "./pages/Portfolio";
import Borrowers from "./pages/Borrowers";
import BorrowerDetail from "./pages/BorrowerDetail";
import SubmitFinancials from "./pages/SubmitFinancials";
import AlertsFeed from "./pages/AlertsFeed";
import CovenantConfig from "./pages/CovenantConfig";
import UserManagement from "./pages/UserManagement";

function Router() {
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
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
