import AnimatedArchDiagram from "@/components/AnimatedArchDiagram";
import { getLoginUrl } from "@/const";
import { useDemo } from "@/contexts/DemoContext";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileJson,
  Globe,
  MessageSquare,
  Scale,
  Shield,
  Sparkles,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

// ─── Covenant Engine formulas ─────────────────────────────────────────────────

const formulas = [
  {
    name: "DSCR",
    full: "Debt Service Coverage Ratio",
    formula: "Operating Cash Flow ÷ Debt Service Payments",
    typical: ">= 1.25x",
    meaning: "Measures whether the borrower generates enough cash to cover its debt repayments. A ratio below 1.0 means the business cannot service its debt from operations alone.",
    breach: "< 1.25",
    warning: "1.25 – 1.375",
    compliant: "> 1.375",
  },
  {
    name: "Leverage Ratio",
    full: "Total Debt to EBITDA",
    formula: "Total Debt ÷ EBITDA",
    typical: "<= 4.0x",
    meaning: "Shows how many years of earnings it would take to repay all debt. Higher values signal greater financial risk and reduced capacity to absorb shocks.",
    breach: "> 4.4",
    warning: "4.0 – 4.4",
    compliant: "< 4.0",
  },
  {
    name: "Current Ratio",
    full: "Short-Term Liquidity",
    formula: "Current Assets ÷ Current Liabilities",
    typical: ">= 1.10x",
    meaning: "Indicates whether the borrower can meet its short-term obligations. A ratio below 1.0 means current liabilities exceed current assets — a near-term liquidity risk.",
    breach: "< 1.0",
    warning: "1.0 – 1.1",
    compliant: "> 1.1",
  },
  {
    name: "Interest Coverage",
    full: "EBITDA to Interest Expense",
    formula: "EBITDA ÷ Interest Expense",
    typical: ">= 2.5x",
    meaning: "Measures how comfortably earnings cover interest costs. A ratio below 1.5x suggests the borrower is at risk of being unable to service interest payments.",
    breach: "< 2.25",
    warning: "2.25 – 2.5",
    compliant: "> 2.5",
  },
];

// ─── LLM pipeline steps ───────────────────────────────────────────────────────

const pipelineSteps = [
  {
    step: 1,
    icon: Users,
    color: "blue",
    hex: "#3b82f6",
    title: "Relationship Manager Requests a Summary",
    detail: "The RM navigates to a borrower's detail page and clicks 'Generate Summary'. No data is sent to the AI yet — this is a deliberate human trigger, not an automatic process.",
  },
  {
    step: 2,
    icon: FileJson,
    color: "indigo",
    hex: "#6366f1",
    title: "Server Assembles Structured Context",
    detail: "The backend queries the database for the borrower's name, industry, risk rating, all active covenant rules, the latest calculated values for each, their statuses, and the text of any recent breach or warning alerts.",
  },
  {
    step: 3,
    icon: Shield,
    color: "violet",
    hex: "#8b5cf6",
    title: "System Prompt Sets Strict Guardrails",
    detail: "Before the user's data is sent, a system prompt instructs the model: it must write for a non-technical audience, stay under 150 words, focus only on covenant health, and avoid financial advice. The model cannot go outside this scope.",
  },
  {
    step: 4,
    icon: Brain,
    color: "rose",
    hex: "#f43f5e",
    title: "LLM Synthesises the Narrative",
    detail: "The Manus Forge API calls the language model server-side (the API key never reaches the browser). The model reads the structured context and writes 3–4 plain-English sentences summarising the borrower's covenant health and key risks.",
  },
  {
    step: 5,
    icon: Eye,
    color: "amber",
    hex: "#f59e0b",
    title: "Output is Returned — Not Acted On",
    detail: "The narrative is displayed to the RM as a read-only text block. The AI does not trigger any actions, send any notifications, or modify any data. A human must read and decide what to do next.",
  },
  {
    step: 6,
    icon: CheckCircle2,
    color: "emerald",
    hex: "#10b981",
    title: "Human Remains in the Loop",
    detail: "The RM uses the summary as a conversation starter with the borrower — not as a decision. All covenant breach decisions, waivers, and remediation plans are made by the credit team, not the AI.",
  },
];

// ─── Explainability principles ────────────────────────────────────────────────

const principles = [
  {
    icon: Eye,
    title: "Transparent Inputs",
    desc: "Every piece of data sent to the AI is visible in the codebase. The prompt is assembled from database records — no hidden context, no web scraping, no external data sources.",
    good: true,
  },
  {
    icon: Scale,
    title: "Scoped Behaviour",
    desc: "The system prompt explicitly limits the model to covenant health commentary. It cannot give investment advice, make credit decisions, or discuss topics outside the borrower's financial data.",
    good: true,
  },
  {
    icon: Users,
    title: "Human-in-the-Loop",
    desc: "The AI generates text for a human to read. It does not trigger alerts, update records, or make decisions. Every consequential action requires a human to act.",
    good: true,
  },
  {
    icon: AlertTriangle,
    title: "No Hallucination Risk on Numbers",
    desc: "The model never calculates ratios — the deterministic Covenant Engine does that. The AI only narrates pre-computed results. Numbers in the narrative come from the database, not the model.",
    good: true,
  },
  {
    icon: XCircle,
    title: "What the AI Cannot Do",
    desc: "The AI cannot approve or deny loans, set covenant thresholds, send notifications, access external data, or retain memory between sessions. Each request is stateless.",
    good: false,
  },
  {
    icon: Shield,
    title: "Auditable by Design",
    desc: "Because the prompt is constructed server-side from structured data, any output can be traced back to specific database records. If the narrative is wrong, the source data can be inspected.",
    good: true,
  },
];

// ─── Agentic loop steps ───────────────────────────────────────────────────────

const agenticLoop = [
  { label: "Observe", desc: "Financial data is submitted by a Credit Analyst. The system observes new inputs: revenue, EBITDA, debt, cash flow figures for a specific borrower and period.", icon: Eye, color: "#3b82f6" },
  { label: "Reason", desc: "The Covenant Engine applies deterministic business rules: calculate each ratio, compare against thresholds, determine Compliant / Warning / Breach for every covenant.", icon: Brain, color: "#8b5cf6" },
  { label: "Act", desc: "Based on the reasoning, the system acts autonomously: persists results, creates alert records, and fires a real-time notification to the platform owner for every breach — no human trigger needed.", icon: Zap, color: "#f59e0b" },
  { label: "Explain", desc: "When a Relationship Manager requests it, the LLM translates the machine-readable results into a plain-language narrative — making the system's reasoning accessible to non-technical stakeholders.", icon: MessageSquare, color: "#10b981" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TechStack() {
  const { enterDemo } = useDemo();
  const [, setLocation] = useLocation();
  const [activeFormula, setActiveFormula] = useState<string | null>(null);

  const handleTryDemo = () => { enterDemo(); setLocation("/dashboard"); };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/60 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setLocation("/")}>
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight text-foreground">CovAgent</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/")} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">Home</button>
            <button onClick={handleTryDemo} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">Try Demo</button>
            <a href={getLoginUrl()} className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">Sign In</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-full px-4 py-1.5 text-xs text-rose-700 font-medium mb-6">
          <Bot className="h-3.5 w-3.5" />
          How the Agentic AI Works
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight max-w-3xl mx-auto">
          The AI behind CovAgent — explained plainly
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          CovAgent uses two distinct AI components: a <strong className="text-foreground">deterministic rule engine</strong> that calculates financial ratios and evaluates covenants, and a <strong className="text-foreground">language model</strong> that translates those results into plain English for Relationship Managers. This page explains exactly how both work.
        </p>
      </section>

      {/* ── Section 1: What is Agentic AI ── */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-primary/5 to-transparent px-8 py-6 border-b border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">What is an Agentic AI?</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Not all AI is the same. Understanding the distinction is essential for anyone building or managing AI-powered products.
            </p>
          </div>
          <div className="px-8 py-7 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-foreground leading-relaxed mb-4">
                A <strong>traditional AI</strong> responds to a single prompt and returns a single output. You ask, it answers. There is no memory, no follow-through, no autonomous action.
              </p>
              <p className="text-sm text-foreground leading-relaxed mb-4">
                An <strong>agentic AI</strong> operates in a loop: it <em>observes</em> its environment, <em>reasons</em> about what to do, <em>acts</em> autonomously, and then <em>explains</em> its actions in human-readable terms. It can trigger downstream processes without a human pressing a button at each step.
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                CovAgent is agentic in a specific, bounded sense: when a Credit Analyst submits financial data, the system automatically evaluates every covenant, creates alerts, and notifies the owner — all without any further human input. The LLM then explains those decisions in plain language when asked.
              </p>
            </div>
            <div className="space-y-3">
              {agenticLoop.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: step.color + "15" }}>
                      <Icon className="h-4 w-4" style={{ color: step.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: step.color }}>Step {i + 1}</span>
                        <span className="font-semibold text-foreground text-sm">{step.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Covenant Engine ── */}
      <section className="bg-slate-50 border-y border-border py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-xs text-amber-700 font-medium mb-4">
              <Zap className="h-3.5 w-3.5" />
              Component 1: The Rule Engine
            </div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">The Covenant Evaluation Engine</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
              This is <strong className="text-foreground">not</strong> a language model. It is a deterministic algorithm — the same inputs always produce the same outputs. This is intentional: financial compliance decisions must be auditable and reproducible.
            </p>
          </div>

          {/* How it works */}
          <div className="bg-white border border-border rounded-2xl p-7 mb-8 shadow-sm">
            <h3 className="font-bold text-foreground mb-5 text-base">How it works — step by step</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { n: "1", title: "Calculate", desc: "When a financial statement is submitted, the engine fetches all active covenant rules for that borrower and calculates the relevant financial ratio from the submitted figures using the formula defined for each covenant type.", color: "#6366f1" },
                { n: "2", title: "Evaluate", desc: "Each calculated value is compared against the covenant's threshold using the configured operator (>=, <=, >, <). This is a simple boolean test — the ratio either passes or it does not.", color: "#f59e0b" },
                { n: "3", title: "Classify", desc: "If the ratio passes, the status is Compliant. If it fails but is within 10% of the threshold, it is a Warning (near-breach signal). If it fails beyond that buffer, it is a Breach — and an alert is created immediately.", color: "#f43f5e" },
              ].map((s) => (
                <div key={s.n} className="rounded-xl border border-border p-5" style={{ borderLeftColor: s.color, borderLeftWidth: 3 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ backgroundColor: s.color }}>{s.n}</span>
                    <span className="font-semibold text-foreground">{s.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Formula cards */}
          <h3 className="font-bold text-foreground mb-4 text-base">The four financial ratios — click any to expand</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formulas.map((f) => {
              const isOpen = activeFormula === f.name;
              return (
                <button
                  key={f.name}
                  onClick={() => setActiveFormula(isOpen ? null : f.name)}
                  className="bg-white border border-border rounded-xl text-left transition-all hover:shadow-md hover:border-amber-300 w-full"
                >
                  <div className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-foreground">{f.name}</span>
                        <span className="text-xs text-muted-foreground">— {f.full}</span>
                      </div>
                      <code className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">{f.formula}</code>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${isOpen ? "rotate-90" : ""}`} />
                  </div>
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                      <p className="text-sm text-foreground leading-relaxed">{f.meaning}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs text-center">
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                          <div className="font-bold text-rose-700 mb-1">Breach</div>
                          <code className="text-rose-600">{f.breach}</code>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                          <div className="font-bold text-amber-700 mb-1">Warning</div>
                          <code className="text-amber-600">{f.warning}</code>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                          <div className="font-bold text-emerald-700 mb-1">Compliant</div>
                          <code className="text-emerald-600">{f.compliant}</code>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Warning zone:</strong> Any result that fails the threshold but falls within 10% of it is classified as a Warning rather than a Breach. This gives the credit team an early signal before a formal covenant violation occurs.
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 3: LLM Pipeline ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-full px-4 py-1.5 text-xs text-rose-700 font-medium mb-4">
            <Brain className="h-3.5 w-3.5" />
            Component 2: The Language Model
          </div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">The AI Narrative Pipeline</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
            The LLM does <strong className="text-foreground">not</strong> calculate ratios, make decisions, or trigger any actions. Its only job is to translate pre-computed, machine-readable results into plain English for Relationship Managers who need to have a conversation with a borrower.
          </p>
        </div>

        {/* Step flow */}
        <div className="relative mb-12">
          <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-border hidden sm:block" />
          <div className="space-y-4">
            {pipelineSteps.map((step) => {
              const Icon = step.icon;
              const colorMap: Record<string, string> = { blue: "#3b82f6", indigo: "#6366f1", violet: "#8b5cf6", rose: "#f43f5e", amber: "#f59e0b", emerald: "#10b981" };
              const hex = colorMap[step.color];
              return (
                <div key={step.step} className="relative flex gap-5">
                  <div className="shrink-0 h-14 w-14 rounded-full border-2 flex items-center justify-center z-10 bg-white" style={{ borderColor: hex }}>
                    <Icon className="h-5 w-5" style={{ color: hex }} />
                  </div>
                  <div className="flex-1 bg-white border border-border rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center text-white shrink-0" style={{ backgroundColor: hex }}>{step.step}</span>
                      <h3 className="font-semibold text-foreground text-sm">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prompt anatomy */}
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 mb-6">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-700 bg-slate-800">
            <div className="h-3 w-3 rounded-full bg-rose-500" />
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400 ml-2 font-mono">Actual LLM prompt — assembled server-side from live database records</span>
          </div>
          <pre className="px-6 py-5 text-xs text-slate-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">{`SYSTEM (guardrails — set by the product team, not the user):
"You are a senior credit analyst writing concise, plain-language risk
summaries for Relationship Managers. Keep responses under 150 words."

USER (assembled from database records — no free-text input from anyone):
Borrower: Apex Retail Group
Industry: Retail  |  Risk Rating: High

Current Covenant Status:
- Current Ratio (>= 1.10):  Actual 1.069 — Breach
- Interest Coverage (>= 2.50):  Actual 2.400 — Warning

Recent Alerts:
- BREACH: Apex Retail Group failed Current Ratio. Required: >= 1.10. Actual: 1.069.
- WARNING: Apex Retail Group near breach on Interest Coverage. Actual: 2.400.

Write a 3-4 sentence plain-language summary of this borrower's covenant
health and key risks. Avoid technical jargon. Focus on what a Relationship
Manager needs to know before speaking with the client.`}</pre>
        </div>

        {/* Example output */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-7 py-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Example AI Output — what the RM reads</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed italic">
            "Apex Retail Group is currently in breach of its Current Ratio covenant, meaning its short-term assets are not fully covering its short-term obligations — a sign of near-term liquidity pressure. Its interest coverage is also trending below the required minimum, suggesting earnings may not comfortably service debt costs. Given the High risk rating and the retail sector headwinds, this borrower warrants an urgent conversation with the client to understand the drivers and agree a remediation plan."
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Note: every number in this narrative came from the database — the model did not calculate anything. It only translated pre-computed results into readable prose.
          </p>
        </div>
      </section>

      {/* ── Section 4: Explainability Principles ── */}
      <section className="bg-slate-50 border-y border-border py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-1.5 text-xs text-indigo-700 font-medium mb-4">
              <Eye className="h-3.5 w-3.5" />
              AI Explainability
            </div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">What the AI can and cannot do</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Responsible AI products define clear boundaries. Here are CovAgent's.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {principles.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className={`bg-white border rounded-xl p-5 shadow-sm ${p.good ? "border-border" : "border-rose-200 bg-rose-50/30"}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${p.good ? "bg-emerald-50" : "bg-rose-50"}`}>
                      <Icon className={`h-4 w-4 ${p.good ? "text-emerald-600" : "text-rose-600"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${p.good ? "text-emerald-600" : "text-rose-600"}`}>{p.good ? "✓ Can" : "✗ Cannot"}</span>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm mt-0.5">{p.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 5: Why This Matters for PMs ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-primary/5 to-transparent px-8 py-6 border-b border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Why this matters for Product Managers</h2>
            </div>
            <p className="text-sm text-muted-foreground">AI behaviour is a product decision — not a technical one. PMs own these choices.</p>
          </div>
          <div className="px-8 py-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "You own the system prompt",
                desc: "The guardrails that constrain the model's behaviour — tone, scope, word limit, audience — are written by the product team, not engineers. If the AI says something wrong, the prompt is the first place to look.",
              },
              {
                title: "You define the warning buffer",
                desc: "The 10% warning zone before a breach is a product decision. Set it too tight and you create alert fatigue. Set it too loose and you miss early signals. This threshold belongs in the PRD.",
              },
              {
                title: "You decide what triggers the AI",
                desc: "The covenant engine runs automatically on every submission — that is an agentic design choice. The LLM narrative requires a human click — that is a deliberate human-in-the-loop choice. Both are PM decisions.",
              },
              {
                title: "You validate the output format",
                desc: "Specifying '3–4 sentences, under 150 words, plain English, no jargon' is a product requirement. Without it, the model might return a bullet list, a table, or a 500-word essay. Output format is your spec.",
              },
              {
                title: "You define the data scope",
                desc: "The model only sees what the server sends it. Deciding which fields are included in the prompt — and which are excluded — is a data governance decision that belongs to the product team.",
              },
              {
                title: "You own the failure modes",
                desc: "What happens when the LLM returns a hallucinated number? What happens when the engine calculates a null value because a field was left blank? Edge cases in AI systems are product problems, not just engineering bugs.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture diagram (simplified context) ── */}
      <section className="bg-slate-50 border-y border-border py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Where the AI sits in the system</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
              Hover any layer to trace the data flow and see how the AI components connect to the rest of the platform.
            </p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
            <AnimatedArchDiagram />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-14 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">See the AI in action</h2>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed max-w-lg mx-auto">
          The demo is loaded with live breach and warning data. Navigate to any borrower and click "Generate Summary" to see the LLM narrative pipeline run in real time.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleTryDemo}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md w-full sm:w-auto justify-center"
          >
            Launch Demo Dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 border border-border text-foreground px-8 py-3.5 rounded-xl font-medium hover:bg-accent transition-colors w-full sm:w-auto justify-center"
          >
            Back to Home
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">CovAgent</span>
            <span>— Commercial Lending Covenant Monitoring</span>
          </div>
          <a href={getLoginUrl()} className="hover:text-foreground transition-colors">Sign In →</a>
        </div>
      </footer>
    </div>
  );
}
