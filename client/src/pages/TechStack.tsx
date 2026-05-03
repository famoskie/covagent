import { getLoginUrl } from "@/const";
import { useDemo } from "@/contexts/DemoContext";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  Brain,
  ChevronRight,
  Code2,
  Database,
  FileJson,
  Globe,
  Key,
  Layers,
  Lock,
  MessageSquare,
  Network,
  Server,
  Shield,
  Sparkles,
  Table,
  Workflow,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

// ─── Data ─────────────────────────────────────────────────────────────────────

const stackLayers = [
  {
    id: "frontend",
    label: "Frontend",
    color: "blue",
    icon: Globe,
    tech: "React 19 + TypeScript + Tailwind CSS 4",
    tagline: "What users see and interact with",
    description:
      "The browser-side application is built with React 19 using TypeScript for end-to-end type safety. Tailwind CSS provides utility-first styling. shadcn/ui supplies accessible, composable components (tables, dialogs, tabs, selects). Recharts renders the portfolio health pie chart and ratio trend line charts. Wouter handles client-side routing without a full page reload.",
    pmSkill: "Product Thinking",
    pmDetail:
      "Understanding the frontend stack helps PMs write precise acceptance criteria, reason about loading states and empty states, and evaluate feasibility of UI requirements before committing to a sprint.",
    bullets: [
      "React 19 — component-based UI with hooks for state and side effects",
      "TypeScript — catches type mismatches at compile time, not runtime",
      "Tailwind CSS 4 — design tokens in CSS variables, utility classes in JSX",
      "shadcn/ui — pre-built accessible components (Dialog, Tabs, Select, etc.)",
      "Recharts — declarative SVG charts wired directly to tRPC query data",
      "Wouter — lightweight client-side router (Switch / Route / useLocation)",
    ],
  },
  {
    id: "trpc",
    label: "API Layer",
    color: "indigo",
    icon: Network,
    tech: "tRPC 11 + Zod + Superjson",
    tagline: "The type-safe contract between frontend and backend",
    description:
      "tRPC eliminates the need for a hand-written REST API. Procedures are defined once in TypeScript on the server; the client consumes them with full autocomplete and compile-time type checking — no OpenAPI spec, no code generation, no manual fetch wrappers. Zod validates every input at the boundary. Superjson serialises rich types (Date, BigInt) transparently.",
    pmSkill: "API Design & Contracts",
    pmDetail:
      "PMs who understand API contracts can write better technical specs, participate meaningfully in API design reviews, and identify when a feature requires a new endpoint vs. a frontend-only change.",
    bullets: [
      "Procedures replace REST routes — each is a typed function call",
      "protectedProcedure — injects ctx.user, throws 401 if unauthenticated",
      "publicProcedure — accessible without a session (used by demo mode)",
      "Zod schemas — input validation with descriptive error messages",
      "React Query — caches tRPC responses, handles loading/error/refetch",
      "Superjson — Date objects survive the JSON serialisation boundary intact",
    ],
  },
  {
    id: "backend",
    label: "Backend",
    color: "violet",
    icon: Server,
    tech: "Node.js + Express 4 + tsx",
    tagline: "The server that runs the business logic",
    description:
      "Express serves both the tRPC HTTP handler and the Vite-built static frontend from a single Node.js process. The server is written in TypeScript and executed by tsx (a zero-config TypeScript runner) in development, and compiled to ESM by esbuild for production. All environment variables are injected by the platform — no .env files are committed.",
    pmSkill: "Backend Architecture",
    pmDetail:
      "Knowing that a single Node process handles both API and static assets helps PMs understand deployment constraints, cold-start latency, and why certain features (like file uploads) need special handling.",
    bullets: [
      "Express 4 — HTTP server, middleware chain, cookie handling",
      "tsx — runs TypeScript directly in development without a build step",
      "esbuild — bundles server code to a single ESM file for production",
      "Manus OAuth — session cookies issued after OAuth callback, verified per request",
      "Context — every tRPC request builds a ctx object with req, res, and user",
      "Notification helper — calls Manus built-in API to push owner alerts",
    ],
  },
  {
    id: "engine",
    label: "Covenant Engine",
    color: "amber",
    icon: Workflow,
    tech: "Pure TypeScript business logic",
    tagline: "The automated financial ratio calculator and evaluator",
    description:
      "The Covenant Evaluation Engine is the core of CovAgent. When a Credit Analyst submits a financial statement, the engine automatically fetches all active covenant rules for that borrower, calculates each financial ratio from the submitted figures, compares the result against the threshold using the configured operator, determines a status (Compliant / Warning / Breach), persists a CovenantResult record, and — for breaches — creates an Alert and notifies the platform owner in real time.",
    pmSkill: "Domain Modelling & Business Rules",
    pmDetail:
      "This is where PM skills are most visible: translating a legal credit agreement into a data model (covenant type, operator, threshold) and a deterministic algorithm. PMs must own this specification.",
    bullets: [
      "DSCR = Operating Cash Flow ÷ Debt Service Payments",
      "Leverage Ratio = Total Debt ÷ EBITDA",
      "Current Ratio = Current Assets ÷ Current Liabilities",
      "Interest Coverage = EBITDA ÷ Interest Expense",
      "Debt to EBITDA = Total Debt ÷ EBITDA",
      "Warning zone = failing but within 10% of threshold (near-breach signal)",
    ],
  },
  {
    id: "database",
    label: "Database",
    color: "emerald",
    icon: Database,
    tech: "MySQL (TiDB) + Drizzle ORM",
    tagline: "Where all structured data lives",
    description:
      "The database is a MySQL-compatible TiDB instance managed by the Manus platform. Drizzle ORM provides a type-safe query builder — schema changes are written in TypeScript, migrations are generated by drizzle-kit, and queries return fully-typed row objects. No raw SQL strings in application code.",
    pmSkill: "Data Modelling",
    pmDetail:
      "PMs who can read a schema diagram can validate that the data model supports every required query, identify missing foreign-key relationships, and reason about data retention and GDPR implications.",
    bullets: [
      "borrowers — company name, industry, risk rating, contact info",
      "loans — facility name, amount, currency, effective/maturity dates",
      "covenants — type, operator, threshold, frequency, linked to loan + borrower",
      "financial_submissions — full income statement, balance sheet, cash flow",
      "covenant_results — calculated value, status, evaluation timestamp",
      "alerts — severity, message, read status, linked to result + borrower",
    ],
  },
  {
    id: "ai",
    label: "AI Layer",
    color: "rose",
    icon: Brain,
    tech: "LLM via Manus Forge API",
    tagline: "Plain-language risk summaries for Relationship Managers",
    description:
      "The AI Covenant Narrative feature calls an LLM (via the Manus built-in Forge API) from a server-side tRPC procedure. The model never sees raw database rows — the server assembles a structured natural-language prompt from the borrower's covenant statuses, latest calculated values, and recent alerts, then asks the model to write a 3–4 sentence plain-language summary. The API key is injected server-side and never exposed to the browser.",
    pmSkill: "AI Product Design & Explainability",
    pmDetail:
      "PMs must define what the AI is allowed to say, what data it receives, and how outputs are validated. This is the AI explainability requirement: the model's input, reasoning scope, and output format are all specified by the product team.",
    bullets: [
      "Trigger — Relationship Manager clicks 'Generate Summary' on a borrower page",
      "Input — borrower name, industry, risk rating, covenant statuses, breach messages",
      "System prompt — instructs the model to write for a non-technical audience",
      "Output — 3–4 sentences of plain English, under 150 words",
      "Guardrails — model is scoped to covenant health only; no financial advice",
      "Server-side only — API key never leaves the backend; no client-side LLM calls",
    ],
  },
  {
    id: "auth",
    label: "Auth & Roles",
    color: "slate",
    icon: Lock,
    tech: "Manus OAuth + JWT session cookies",
    tagline: "Who can do what — strictly enforced",
    description:
      "Authentication uses Manus OAuth. After login, the server issues a signed JWT session cookie. Every tRPC request verifies the cookie and attaches the user object to the request context. Role-based access control is enforced at the procedure level — not just in the UI — so even a direct API call from a non-admin user will receive a FORBIDDEN error.",
    pmSkill: "Security & Access Control",
    pmDetail:
      "PMs own the RBAC matrix. Defining which roles can read, write, and configure each resource is a product decision with security and compliance implications — not just a developer task.",
    bullets: [
      "admin — full access: covenant config, user management, all read/write",
      "analyst — can submit financials, create borrowers and loans",
      "rm (Relationship Manager) — read-only: portfolio, borrower detail, AI narratives",
      "Unauthenticated — demo mode only: public read-only procedures",
      "protectedProcedure — throws 401 if no valid session cookie",
      "adminProcedure pattern — throws 403 if role !== 'admin'",
    ],
  },
];

const pmSkillsMap = [
  { skill: "Product Thinking", tech: "React + TypeScript", example: "Writing acceptance criteria for loading states, empty states, and error boundaries in the portfolio dashboard." },
  { skill: "API Design", tech: "tRPC + Zod", example: "Defining the financial submission input schema — which fields are required, which are optional, and what validation rules apply." },
  { skill: "Domain Modelling", tech: "Drizzle Schema", example: "Designing the covenant_results table to capture calculated value, threshold, operator, and status for every evaluation run." },
  { skill: "Business Rules", tech: "Covenant Engine", example: "Specifying the DSCR formula, the warning buffer (10% of threshold), and the exact conditions that trigger an owner notification." },
  { skill: "AI Product Design", tech: "LLM + Forge API", example: "Writing the system prompt that scopes the model to covenant health only and instructs it to use plain language for Relationship Managers." },
  { skill: "Security & RBAC", tech: "OAuth + JWT + Roles", example: "Defining the role matrix: analysts write, RMs read, admins configure — and ensuring this is enforced server-side, not just in the UI." },
  { skill: "Data Strategy", tech: "MySQL + Drizzle ORM", example: "Deciding to store calculated values in covenant_results rather than recomputing them on every page load, enabling compliance history and trend charts." },
  { skill: "Notifications", tech: "Manus Notify API", example: "Specifying that breach notifications must be real-time (on submission) rather than batched, and that they go to the platform owner, not the borrower." },
];

const aiSteps = [
  { step: 1, label: "RM Clicks 'Generate Summary'", icon: MessageSquare, desc: "The Relationship Manager navigates to a borrower detail page and clicks the Generate Summary button. No data is sent to the AI yet." },
  { step: 2, label: "Server Fetches Context", icon: Database, desc: "The tRPC procedure queries the database for the borrower's covenant rules, latest calculated values, statuses, and recent breach/warning alerts." },
  { step: 3, label: "Prompt is Assembled", icon: FileJson, desc: "The server builds a structured natural-language prompt containing the borrower name, industry, risk rating, each covenant's rule and actual value, and any recent alert messages." },
  { step: 4, label: "System Prompt Sets Guardrails", icon: Shield, desc: "A system prompt instructs the model: 'You are a senior credit analyst writing concise, plain-language risk summaries for Relationship Managers. Keep responses under 150 words.' This scopes the model's behaviour." },
  { step: 5, label: "LLM Generates Narrative", icon: Sparkles, desc: "The Manus Forge API (server-side, API key never exposed) calls the language model. The model synthesises the covenant data into 3–4 plain-English sentences." },
  { step: 6, label: "Output Displayed to RM", icon: Globe, desc: "The narrative is returned to the frontend and displayed in the AI Covenant Narrative panel. The RM reads a human summary — no raw numbers, no jargon." },
];

// ─── Component ────────────────────────────────────────────────────────────────

const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string; badge: string }> = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   iconBg: "bg-blue-100",   badge: "bg-blue-100 text-blue-700" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", iconBg: "bg-indigo-100", badge: "bg-indigo-100 text-indigo-700" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", iconBg: "bg-violet-100", badge: "bg-violet-100 text-violet-700" },
  amber:  { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  iconBg: "bg-amber-100",  badge: "bg-amber-100 text-amber-700" },
  emerald:{ bg: "bg-emerald-50",border: "border-emerald-200",text: "text-emerald-700",iconBg: "bg-emerald-100",badge: "bg-emerald-100 text-emerald-700" },
  rose:   { bg: "bg-rose-50",   border: "border-rose-200",   text: "text-rose-700",   iconBg: "bg-rose-100",   badge: "bg-rose-100 text-rose-700" },
  slate:  { bg: "bg-slate-50",  border: "border-slate-200",  text: "text-slate-700",  iconBg: "bg-slate-100",  badge: "bg-slate-100 text-slate-700" },
};

export default function TechStack() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const { enterDemo } = useDemo();
  const [, setLocation] = useLocation();

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
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-full px-4 py-1.5 text-xs text-primary font-medium mb-6">
          <Code2 className="h-3.5 w-3.5" />
          Technology & Architecture
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight max-w-3xl mx-auto">
          How CovAgent is built — and why every decision matters
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          This page explains every layer of the technology stack in plain language, maps each technology to a PM skill, and shows exactly how the AI component works — because good AI products are explainable ones.
        </p>
      </section>

      {/* Architecture Diagram */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">System Architecture</h2>
            <span className="text-xs text-muted-foreground ml-2">Click any layer to jump to its details</span>
          </div>

          {/* Visual stack diagram */}
          <div className="flex flex-col items-center gap-1">
            {[
              { id: "frontend", label: "Browser / React Frontend", sublabel: "React 19 · TypeScript · Tailwind · shadcn/ui · Recharts", color: "blue" },
              { id: "trpc",     label: "tRPC API Layer",            sublabel: "Type-safe procedures · Zod validation · React Query cache", color: "indigo" },
              { id: "backend",  label: "Express Server",            sublabel: "Node.js · OAuth middleware · Session cookies · Context", color: "violet" },
              { id: "engine",   label: "Covenant Evaluation Engine",sublabel: "DSCR · Leverage · Current Ratio · Interest Coverage · Alerts", color: "amber" },
              { id: "database", label: "MySQL Database (TiDB)",     sublabel: "Drizzle ORM · 7 tables · Type-safe queries · Migrations", color: "emerald" },
            ].map((layer, i) => {
              const c = colorMap[layer.color];
              return (
                <div key={layer.id} className="w-full flex flex-col items-center">
                  <button
                    onClick={() => { setActiveLayer(layer.id); document.getElementById(layer.id)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                    className={`w-full max-w-2xl rounded-xl border-2 px-6 py-4 text-left transition-all hover:shadow-md ${c.bg} ${c.border} group`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-semibold text-sm ${c.text}`}>{layer.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{layer.sublabel}</div>
                      </div>
                      <ChevronRight className={`h-4 w-4 ${c.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </div>
                  </button>
                  {i < 4 && (
                    <div className="flex flex-col items-center my-1">
                      <ArrowDown className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI and Auth as side branches */}
            <div className="w-full max-w-2xl mt-4 grid grid-cols-2 gap-3">
              {[
                { id: "ai",   label: "AI Layer",       sublabel: "LLM · Forge API · Server-side only", color: "rose" },
                { id: "auth", label: "Auth & Roles",   sublabel: "OAuth · JWT · RBAC · 4 role tiers",  color: "slate" },
              ].map((layer) => {
                const c = colorMap[layer.color];
                return (
                  <button
                    key={layer.id}
                    onClick={() => { setActiveLayer(layer.id); document.getElementById(layer.id)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                    className={`rounded-xl border-2 px-5 py-4 text-left transition-all hover:shadow-md ${c.bg} ${c.border} group`}
                  >
                    <div className={`font-semibold text-sm ${c.text}`}>{layer.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{layer.sublabel}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data flow summary */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-2xl mx-auto">
              <strong className="text-foreground">Data flow:</strong> A Credit Analyst submits financials in the React UI → tRPC serialises the call → Express validates the session → the Covenant Engine calculates ratios and evaluates rules → results are written to MySQL → alerts trigger owner notifications → the RM requests an AI narrative → the server prompts the LLM with structured context → plain-language summary is returned to the browser.
            </p>
          </div>
        </div>
      </section>

      {/* Layer-by-layer breakdown */}
      <section className="max-w-5xl mx-auto px-6 pb-16 space-y-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Layer-by-Layer Breakdown</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Every technology choice, explained with context and PM relevance.</p>
        </div>

        {stackLayers.map((layer) => {
          const c = colorMap[layer.color];
          const Icon = layer.icon;
          return (
            <div key={layer.id} id={layer.id} className={`bg-white border-2 rounded-2xl overflow-hidden shadow-sm transition-all ${activeLayer === layer.id ? c.border : "border-border"}`}>
              {/* Header */}
              <div className={`px-7 py-5 ${c.bg} border-b ${c.border}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-11 w-11 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 ${c.text}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className={`text-lg font-bold ${c.text}`}>{layer.label}</h3>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${c.badge}`}>{layer.tech}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{layer.tagline}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right hidden sm:block">
                    <div className="text-xs text-muted-foreground">PM Skill</div>
                    <div className={`text-sm font-semibold ${c.text} mt-0.5`}>{layer.pmSkill}</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-7 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Description + PM insight */}
                <div className="lg:col-span-3 space-y-4">
                  <p className="text-sm text-foreground leading-relaxed">{layer.description}</p>
                  <div className={`rounded-xl ${c.bg} border ${c.border} p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Key className={`h-3.5 w-3.5 ${c.text}`} />
                      <span className={`text-xs font-semibold ${c.text} uppercase tracking-wider`}>PM Relevance</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{layer.pmDetail}</p>
                  </div>
                </div>

                {/* Bullet list */}
                <div className="lg:col-span-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Key Details</div>
                  <ul className="space-y-2">
                    {layer.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                        <div className={`h-1.5 w-1.5 rounded-full ${c.text.replace("text-", "bg-")} mt-2 shrink-0`} />
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* PM Skills Map */}
      <section className="bg-slate-50 border-y border-border py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-full px-4 py-1.5 text-xs text-primary font-medium mb-4">
              <Zap className="h-3.5 w-3.5" />
              PM Skills Map
            </div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Every feature is a PM skill in action</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              CovAgent was designed to demonstrate that modern product management requires technical fluency — not coding ability, but the ability to reason about systems, data, and AI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pmSkillsMap.map((item) => (
              <div key={item.skill} className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="font-semibold text-foreground text-sm">{item.skill}</span>
                  <span className="text-xs bg-primary/8 text-primary border border-primary/15 rounded-full px-2.5 py-0.5 shrink-0 font-medium">{item.tech}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Explainability */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-full px-4 py-1.5 text-xs text-rose-700 font-medium mb-4">
            <Bot className="h-3.5 w-3.5" />
            AI Explainability
          </div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">How the AI Covenant Narrative works</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Good AI products are transparent about what the model receives, what it is allowed to say, and how its output is used. Here is every step.
          </p>
        </div>

        {/* Step-by-step flow */}
        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-border hidden sm:block" />

          <div className="space-y-4">
            {aiSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative flex gap-5">
                  <div className="shrink-0 h-14 w-14 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center z-10">
                    <Icon className="h-5 w-5 text-rose-600" />
                  </div>
                  <div className="flex-1 bg-white border border-border rounded-xl px-6 py-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-full w-5 h-5 flex items-center justify-center shrink-0">{step.step}</span>
                      <h3 className="font-semibold text-foreground text-sm">{step.label}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prompt example */}
        <div className="mt-10 bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-700 bg-slate-800">
            <div className="h-3 w-3 rounded-full bg-rose-500" />
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400 ml-2 font-mono">Example LLM Prompt (server/routers/portfolio.ts)</span>
          </div>
          <pre className="px-6 py-5 text-xs text-slate-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">{`SYSTEM:
You are a senior credit analyst writing concise, plain-language risk
summaries for Relationship Managers. Keep responses under 150 words.

USER:
Borrower: Apex Retail Group
Industry: Retail
Risk Rating: High

Current Covenant Status:
- Current Ratio (>= 1.10): Actual 1.069 — Breach
- Interest Coverage (>= 2.50): Actual 2.400 — Warning

Recent Breaches:
- BREACH: Apex Retail Group failed Current Ratio covenant.
  Required: >= 1.10. Actual: 1.069.

Recent Warnings:
- WARNING: Apex Retail Group is near breach on Interest Coverage.
  Required: >= 2.50. Actual: 2.400.

Write a 3-4 sentence plain-language summary of this borrower's
covenant health and any key risks. Avoid technical jargon.`}</pre>
        </div>

        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Example AI Output</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed italic">
            "Apex Retail Group is currently in breach of its Current Ratio covenant, meaning its short-term assets are not fully covering its short-term obligations — a sign of near-term liquidity pressure. Its interest coverage is also trending below the required minimum, suggesting earnings may not comfortably service debt costs. Given the High risk rating and the retail sector headwinds, this borrower warrants an urgent conversation with the client to understand the drivers and agree a remediation plan."
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-50 border-t border-border py-14">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">See the technology in action</h2>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            The demo is loaded with live data — 3 borrowers, 6 covenant rules, real breach and warning alerts. No login required.
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
