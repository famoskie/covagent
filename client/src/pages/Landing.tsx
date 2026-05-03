import { getLoginUrl } from "@/const";
import { useDemo } from "@/contexts/DemoContext";
import ProductPreview from "@/components/ProductPreview";
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold text-base tracking-tight">CovAgent</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => setLocation("/tech-stack")}
              className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              How the AI Works
            </button>
            <a
              href="https://github.com/oluwafemi-oso/covagent"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>
            <button
              onClick={handleTryDemo}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 sm:px-3 py-1.5"
            >
              Demo
            </button>
            <a
              href={getLoginUrl()}
              className="text-sm bg-primary text-primary-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Sign In
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 sm:pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-xs text-primary font-medium mb-5 sm:mb-8">
          <Zap className="h-3 w-3" />
          AI-Powered Covenant Monitoring
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight max-w-3xl mx-auto">
          Stop managing covenants
          <span className="text-primary"> in spreadsheets.</span>
        </h1>

        <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Automates commercial loan covenant monitoring. Submit financials, get instant ratio calculations, surface breaches in real time, and generate AI risk summaries.
        </p>

        <div className="flex flex-col gap-3 mt-7 sm:mt-10 max-w-sm mx-auto sm:max-w-none sm:flex-row sm:justify-center">
          <button
            onClick={handleTryDemo}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm sm:text-base hover:opacity-90 transition-all shadow-lg shadow-primary/20 justify-center"
          >
            <Building2 className="h-4 w-4" />
            Explore Live Demo
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => { enterDemo(); setLocation("/demo/try"); }}
            className="flex items-center gap-2 border-2 border-primary/30 text-primary bg-primary/5 px-6 py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-primary/10 transition-all justify-center"
          >
            <Zap className="h-4 w-4" />
            Run the AI Pipeline
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-center mt-3">
          <a href={getLoginUrl()} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Sign In to Your Account →
          </a>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          No account required · No email needed
        </p>
      </section>

      {/* Product Preview */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-full px-3 py-1 text-xs text-primary font-medium mb-3">
            <Zap className="h-3 w-3" />
            Live Preview
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Watch the agentic pipeline in action
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Portfolio → Covenant Engine → Breach Alert → AI Narrative — auto-cycling every few seconds.
          </p>
        </div>
        <ProductPreview />
        <p className="text-center mt-4 text-xs text-muted-foreground">
          Click any dot to jump to that step, or{" "}
          <button
            onClick={() => { enterDemo(); setLocation("/demo/try"); }}
            className="text-primary font-medium hover:underline"
          >
            run it yourself →
          </button>
        </p>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-primary font-mono">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Everything a credit team needs
          </h2>
          <p className="text-muted-foreground mt-2 text-sm max-w-xl mx-auto">
            From financial spreading to breach notifications — the full covenant monitoring workflow in one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Open Source Agents */}
      <section className="bg-slate-900 border-y border-slate-800 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Left: copy */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-3 py-1 text-xs text-emerald-400 font-medium">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  Open Source
                </div>
                {/* GitHub star badge */}
                <a
                  href="https://github.com/oluwafemi-oso/covagent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <img
                    src="https://img.shields.io/github/stars/oluwafemi-oso/covagent?style=social"
                    alt="GitHub Stars"
                    className="h-5"
                    loading="lazy"
                  />
                </a>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                The AI agents are open source.
                <br />
                <span className="text-emerald-400">Use them in your own project.</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg mb-5">
                The two core AI components powering CovAgent — the Covenant Evaluation Engine and the LLM Narrative Agent — are extracted into a standalone TypeScript library. Zero platform dependencies. Works with OpenAI, Anthropic, or any LLM.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://github.com/oluwafemi-oso/covagent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-colors justify-center"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  View on GitHub
                </a>
                <button
                  onClick={() => setLocation("/tech-stack")}
                  className="flex items-center gap-2 border border-slate-600 text-slate-300 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors justify-center"
                >
                  How the AI Works →
                </button>
              </div>
            </div>

            {/* Right: code snippet */}
            <div className="w-full lg:w-auto lg:min-w-[340px] shrink-0">
              <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700 bg-slate-800/80">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-400 ml-2 font-mono">terminal</span>
                </div>
                <pre
                  className="px-5 py-4 text-xs font-mono leading-relaxed overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: [
                    '<span style="color:#64748b"># Install</span>',
                    '<span style="color:#34d399">npm</span> <span style="color:#f1f5f9">install covagent-agents</span>',
                    '',
                    '<span style="color:#64748b"># Use the Covenant Engine</span>',
                    '<span style="color:#60a5fa">import</span> <span style="color:#f1f5f9">{ CovenantEvaluationAgent }</span>',
                    '  <span style="color:#60a5fa">from</span> <span style="color:#fbbf24">"covagent-agents"</span><span style="color:#f1f5f9">;</span>',
                    '',
                    '<span style="color:#60a5fa">const</span> <span style="color:#f1f5f9">agent</span> <span style="color:#60a5fa">=</span> <span style="color:#60a5fa">new</span> <span style="color:#fde68a">CovenantEvaluationAgent</span><span style="color:#f1f5f9">();</span>',
                    '<span style="color:#60a5fa">const</span> <span style="color:#f1f5f9">report</span> <span style="color:#60a5fa">=</span> <span style="color:#f1f5f9">agent.</span><span style="color:#fde68a">evaluate</span><span style="color:#f1f5f9">({</span>',
                    '  <span style="color:#f1f5f9">statement, rules</span>',
                    '<span style="color:#f1f5f9">});</span>',
                    '',
                    '<span style="color:#64748b"># → Compliant | Warning | Breach</span>',
                  ].join('\n') }}
                />
              </div>
              <p className="text-xs text-slate-500 text-center mt-2">MIT License · TypeScript · Zero dependencies</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo CTA section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 sm:p-10 text-center">
          <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
            See it in action — no login required
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-5 sm:mb-8 text-xs sm:text-sm leading-relaxed">
            3 real borrowers, 6 covenant rules, live breach data. No account needed.
          </p>
          <div className="flex flex-col gap-3 max-w-xs mx-auto sm:max-w-none sm:flex-row sm:justify-center">
            <button
              onClick={handleTryDemo}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 justify-center"
            >
              <Building2 className="h-4 w-4" />
              Launch Demo Dashboard
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => { enterDemo(); setLocation("/demo/try"); }}
              className="flex items-center gap-2 border-2 border-primary/30 text-primary bg-primary/5 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/10 transition-all justify-center"
            >
              <Zap className="h-4 w-4" />
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
