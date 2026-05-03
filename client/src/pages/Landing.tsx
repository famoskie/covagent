import { getLoginUrl } from "@/const";
import { useDemo } from "@/contexts/DemoContext";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";

const features = [
  {
    icon: BarChart3,
    title: "Portfolio Dashboard",
    desc: "Real-time overview of all borrowers, covenant statuses, and risk ratings in a single CCO-ready view.",
  },
  {
    icon: Zap,
    title: "Auto Evaluation Engine",
    desc: "Submit financials once — DSCR, Leverage Ratio, Current Ratio, and more are calculated and evaluated instantly.",
  },
  {
    icon: AlertTriangle,
    title: "Breach & Warning Alerts",
    desc: "Covenant breaches surface immediately with severity levels, timestamps, and direct links to the borrower.",
  },
  {
    icon: Bot,
    title: "AI Covenant Narrative",
    desc: "LLM-generated plain-language summaries of borrower covenant health, written for Relationship Managers.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    desc: "Credit Analysts enter data, Relationship Managers read reports, Admins configure covenants — strictly enforced.",
  },
  {
    icon: FileText,
    title: "Financial Spreading",
    desc: "Structured input for income statements, balance sheets, and cash flow — tied to specific borrowers and periods.",
  },
];

const stats = [
  { value: "6", label: "Covenant Types" },
  { value: "3", label: "Role Tiers" },
  { value: "Real-time", label: "Breach Alerts" },
  { value: "AI", label: "Risk Narratives" },
];

export default function Landing() {
  const { enterDemo } = useDemo();
  const [, setLocation] = useLocation();

  const handleTryDemo = () => {
    enterDemo();
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">CovAgent</span>
          </div>
          <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/tech-stack")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
          >
            How the AI Works
          </button>
          <button
            onClick={handleTryDemo}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
          >
            Try Demo
          </button>
            <a
              href={getLoginUrl()}
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Sign In
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs text-primary font-medium mb-8">
          <Zap className="h-3.5 w-3.5" />
          AI-Powered Covenant Monitoring
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground leading-tight max-w-3xl mx-auto">
          Stop managing covenants
          <span className="text-primary"> in spreadsheets.</span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          CovAgent automates commercial loan covenant monitoring for credit teams. Submit financials, get instant ratio calculations, surface breaches in real time, and generate AI-written risk summaries for Relationship Managers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <button
            onClick={handleTryDemo}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold text-base hover:opacity-90 transition-all shadow-lg shadow-primary/20 w-full sm:w-auto justify-center"
          >
            <Building2 className="h-5 w-5" />
            Explore Live Demo
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => { enterDemo(); setLocation("/demo/try"); }}
            className="flex items-center gap-2 border-2 border-primary/30 text-primary bg-primary/5 px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-primary/10 transition-all w-full sm:w-auto justify-center"
          >
            <Zap className="h-5 w-5" />
            Run the AI Pipeline
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3">
          <a
            href={getLoginUrl()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In to Your Account →
          </a>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          No account required · No email needed · Explore or run the AI pipeline live
        </p>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-primary font-mono">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Everything a credit team needs
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            From financial spreading to breach notifications — the full covenant monitoring workflow in one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo CTA section */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">
            See it in action — no login required
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-sm leading-relaxed">
            The demo is loaded with 3 real borrowers, 6 covenant rules, and live breach and warning data. Explore every page of the platform before deciding to create an account.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleTryDemo}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              <Building2 className="h-5 w-5" />
              Launch Demo Dashboard
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => { enterDemo(); setLocation("/demo/try"); }}
              className="flex items-center gap-2 border-2 border-primary/30 text-primary bg-primary/5 px-7 py-3.5 rounded-xl font-semibold hover:bg-primary/10 transition-all"
            >
              <Zap className="h-5 w-5" />
              Run the AI Pipeline
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">CovAgent</span>
              <span>— Commercial Lending Covenant Monitoring</span>
            </div>
            <a
              href={getLoginUrl()}
              className="hover:text-foreground transition-colors"
            >
              Sign In →
            </a>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Built by <span className="font-medium text-foreground">Olu Oso</span> — Product Manager</span>
            <a
              href="https://www.linkedin.com/in/oluwafemi-oso/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Connect on LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
