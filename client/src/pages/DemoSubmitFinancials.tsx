/**
 * DemoSubmitFinancials
 *
 * A guided 3-step interactive demo that lets unauthenticated visitors:
 *   1. Choose a borrower and fill in financial figures (pre-filled with realistic defaults)
 *   2. Watch the covenant evaluation engine run automatically
 *   3. Read the AI-generated plain-language narrative
 *
 * Uses demo.submitFinancials and demo.generateNarrative publicProcedures.
 * All data is flagged isDemo=1 and isolated from the real portfolio.
 */

import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Sparkles,
  TrendingDown,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

// ─── What You Just Saw Explainer ─────────────────────────────────────────────

type WhatYouJustSawProps = {
  evalResult: EvalResult;
  scenario: typeof SCENARIOS[number] | null;
};

function WhatYouJustSaw({ evalResult, scenario }: WhatYouJustSawProps) {
  const [open, setOpen] = useState(false);

  const steps = [
    {
      n: "1",
      color: "#6366f1",
      title: "Financial data submitted",
      detail: `You submitted ${scenario?.values.periodLabel ?? "Q1 2025"} financials for ${scenario?.label ?? "the borrower"} — EBITDA, total debt, cash flow, and more.`,
    },
    {
      n: "2",
      color: "#f59e0b",
      title: "Covenant engine calculated the ratios",
      detail: evalResult.evaluationSummary.results
        .map((r) => {
          const type = (r as { covenantType?: string }).covenantType ?? `Covenant #${r.covenantId}`;
          const val = r.calculatedValue !== null ? r.calculatedValue.toFixed(3) : "N/A";
          return `${type} = ${val}x → ${r.status}`;
        })
        .join(" · "),
    },
    {
      n: "3",
      color: "#f43f5e",
      title: `${evalResult.evaluationSummary.breachCount} breach${evalResult.evaluationSummary.breachCount !== 1 ? "es" : ""} detected automatically`,
      detail: `The engine compared each calculated value against the covenant threshold using the configured operator (≥, ≤). Values outside the threshold were classified as Breach. Values within 10% of the threshold were flagged as Warning.`,
    },
    {
      n: "4",
      color: "#10b981",
      title: "LLM translated results into plain English",
      detail: `The server assembled a structured prompt from the evaluation results and sent it to the language model. The model wrote a 3–4 sentence summary for a Relationship Manager — no jargon, no raw numbers, just context.`,
    },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-slate-600" />
          </div>
          <div>
            <span className="font-semibold text-foreground text-sm">What you just saw — explained</span>
            <span className="text-xs text-muted-foreground ml-2">How the agentic AI pipeline worked step by step</span>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-4 border-t border-slate-200 pt-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            When you clicked Submit, four things happened automatically — no manual trigger, no human in the loop until the AI narrative step.
          </p>
          <div className="space-y-3">
            {steps.map((s) => (
              <div key={s.n} className="flex items-start gap-4">
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor: s.color }}
                >
                  {s.n}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 mt-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Why this matters for PMs:</strong> Steps 1–3 are fully deterministic — the same inputs always produce the same outputs. Step 4 is the only AI component, and it only runs when a human asks for it. This separation of concerns (rule engine vs. LLM) is a deliberate product decision that makes the system auditable and the AI explainable.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Pre-filled scenario presets to make the demo compelling
const SCENARIOS = [
  {
    label: "Healthy Company",
    description: "Strong cash flow, low leverage — all covenants pass comfortably.",
    borrowerIdx: 2, // BlueSky Logistics (Low risk)
    values: {
      periodLabel: "Q1 2025",
      revenue: "9800000",
      ebitda: "2400000",
      ebit: "2100000",
      interestExpense: "360000",
      netIncome: "1300000",
      totalAssets: "16000000",
      currentAssets: "5500000",
      currentLiabilities: "3000000",
      totalDebt: "7200000",
      totalEquity: "7200000",
      operatingCashFlow: "3100000",
      debtServicePayments: "2100000",
    },
    expectedOutcome: "Compliant",
  },
  {
    label: "Near-Breach Warning",
    description: "Margins are tightening — DSCR is close to the threshold.",
    borrowerIdx: 0, // Meridian Manufacturing (Medium risk)
    values: {
      periodLabel: "Q1 2025",
      revenue: "17000000",
      ebitda: "2800000",
      ebit: "2400000",
      interestExpense: "820000",
      netIncome: "1200000",
      totalAssets: "41000000",
      currentAssets: "8800000",
      currentLiabilities: "7100000",
      totalDebt: "13200000",
      totalEquity: "17000000",
      operatingCashFlow: "3300000",
      debtServicePayments: "2800000",
    },
    expectedOutcome: "Warning",
  },
  {
    label: "Covenant Breach",
    description: "Retail headwinds have hit hard — current ratio and interest coverage both fail.",
    borrowerIdx: 1, // Apex Retail (High risk)
    values: {
      periodLabel: "Q1 2025",
      revenue: "29000000",
      ebitda: "1400000",
      ebit: "900000",
      interestExpense: "720000",
      netIncome: "100000",
      totalAssets: "27000000",
      currentAssets: "5400000",
      currentLiabilities: "5200000",
      totalDebt: "8100000",
      totalEquity: "8200000",
      operatingCashFlow: "700000",
      debtServicePayments: "1200000",
    },
    expectedOutcome: "Breach",
  },
];

type EvalResult = {
  submissionId: number;
  evaluationSummary: {
    results: Array<{ covenantId: number; status: string; calculatedValue: number | null }>;
    breachCount: number;
    warningCount: number;
  };
};

const statusColor = (s: string) => {
  if (s === "Compliant") return "text-emerald-600";
  if (s === "Warning") return "text-amber-600";
  if (s === "Breach") return "text-rose-600";
  return "text-slate-500";
};

const statusBadge = (s: string) => {
  if (s === "Compliant") return "badge-compliant";
  if (s === "Warning") return "badge-warning";
  if (s === "Breach") return "badge-breach";
  return "";
};

export default function DemoSubmitFinancials() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(2); // Pre-select Covenant Breach for maximum impact
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);

  const { data: borrowers } = trpc.demo.borrowers.useQuery();
  const submitMutation = trpc.demo.submitFinancials.useMutation({
    onSuccess: (data) => {
      setEvalResult(data);
      setStep(3);
    },
    onError: (e) => toast.error(e.message),
  });
  const narrativeMutation = trpc.demo.generateNarrative.useMutation({
    onSuccess: (data) => {
      setNarrative(typeof data.narrative === "string" ? data.narrative : String(data.narrative));
      setNarrativeLoading(false);
    },
    onError: () => {
      toast.error("Failed to generate narrative.");
      setNarrativeLoading(false);
    },
  });

  const scenario = selectedScenario !== null ? SCENARIOS[selectedScenario] : null;
  const borrower = scenario && borrowers ? borrowers[scenario.borrowerIdx] : null;

  const handleSubmit = () => {
    if (!scenario || !borrower) return;
    const loans = borrowers; // we'll use borrowerId to find the loan
    const { periodLabel, ...restValues } = scenario.values;
    submitMutation.mutate({
      borrowerId: borrower.id,
      loanId: borrower.id,
      periodLabel,
      periodEndDate: "2025-03-31",
      statementType: "Quarterly",
      ...restValues,
    });
    setStep(2);
  };

  const handleGenerateNarrative = () => {
    if (!borrower) return;
    setNarrativeLoading(true);
    narrativeMutation.mutate({ borrowerId: borrower.id });
  };

  const handleReset = () => {
    setStep(1);
    setSelectedScenario(null);
    setEvalResult(null);
    setNarrative(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Try It Live</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1 ml-12">
          Submit real financial data and watch the AI pipeline run — covenant evaluation, breach detection, and narrative generation — all in real time.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: "Choose Scenario" },
          { n: 2, label: "Engine Running" },
          { n: 3, label: "Results & AI" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              step === s.n
                ? "bg-primary text-primary-foreground"
                : step > s.n
                ? "bg-emerald-100 text-emerald-700"
                : "bg-muted text-muted-foreground"
            }`}>
              {step > s.n ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{s.n}</span>}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Choose Scenario ── */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-foreground font-medium">Pick a scenario to simulate — each uses a different borrower and financial profile:</p>
          <div className="grid grid-cols-1 gap-4">
            {SCENARIOS.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedScenario(i)}
                className={`w-full text-left rounded-xl border-2 p-5 transition-all hover:shadow-md ${
                  selectedScenario === i
                    ? s.expectedOutcome === "Compliant"
                      ? "border-emerald-400 bg-emerald-50"
                      : s.expectedOutcome === "Warning"
                      ? "border-amber-400 bg-amber-50"
                      : "border-rose-400 bg-rose-50"
                    : "border-border bg-white hover:border-primary/40"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="font-bold text-foreground">{s.label}</span>
                      <span className={statusBadge(s.expectedOutcome)}>{s.expectedOutcome}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                    {borrowers && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Borrower: <strong className="text-foreground">{borrowers[s.borrowerIdx]?.name}</strong>
                        {" · "}{s.values.periodLabel}
                      </p>
                    )}
                  </div>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    s.expectedOutcome === "Compliant" ? "bg-emerald-100" : s.expectedOutcome === "Warning" ? "bg-amber-100" : "bg-rose-100"
                  }`}>
                    {s.expectedOutcome === "Compliant" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : s.expectedOutcome === "Warning" ? <AlertTriangle className="h-5 w-5 text-amber-600" /> : <XCircle className="h-5 w-5 text-rose-600" />}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedScenario !== null && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3">Financial figures that will be submitted:</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: "EBITDA", value: scenario?.values.ebitda },
                  { label: "Total Debt", value: scenario?.values.totalDebt },
                  { label: "Op. Cash Flow", value: scenario?.values.operatingCashFlow },
                  { label: "Debt Service", value: scenario?.values.debtServicePayments },
                  { label: "Current Assets", value: scenario?.values.currentAssets },
                  { label: "Current Liab.", value: scenario?.values.currentLiabilities },
                  { label: "Interest Exp.", value: scenario?.values.interestExpense },
                  { label: "Revenue", value: scenario?.values.revenue },
                ].map((f) => (
                  <div key={f.label} className="bg-slate-50 rounded-lg p-2.5">
                    <div className="text-muted-foreground mb-0.5">{f.label}</div>
                    <div className="font-mono font-semibold text-foreground">
                      {f.value ? `$${parseInt(f.value).toLocaleString()}` : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={selectedScenario === null || submitMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap className="h-5 w-5" />
            Submit Financials & Run Covenant Engine
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Step 2: Engine Running ── */}
      {step === 2 && (
        <div className="bg-white border border-border rounded-2xl p-10 text-center shadow-sm">
          <div className="flex flex-col items-center gap-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-primary/20 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full border-4 border-primary border-t-transparent animate-spin absolute inset-0" />
                <Brain className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Covenant Engine Running</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                Calculating financial ratios, evaluating covenant thresholds, and determining compliance status…
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground w-full max-w-xs">
              {["Fetching covenant rules…", "Calculating DSCR…", "Evaluating thresholds…", "Creating compliance records…"].map((msg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                  {msg}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Results & AI Narrative ── */}
      {step === 3 && evalResult && (
        <div className="space-y-5">
          {/* Evaluation summary card */}
          <div className={`bg-white border-2 rounded-2xl p-7 shadow-sm ${
            evalResult.evaluationSummary.breachCount > 0 ? "border-rose-300" : evalResult.evaluationSummary.warningCount > 0 ? "border-amber-300" : "border-emerald-300"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                {evalResult.evaluationSummary.breachCount > 0 ? (
                  <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <TrendingDown className="h-5 w-5 text-rose-600" />
                  </div>
                ) : evalResult.evaluationSummary.warningCount > 0 ? (
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-foreground text-base">Evaluation Complete</h2>
                  <p className="text-sm text-muted-foreground">
                    {borrower?.name} · {scenario?.values.periodLabel}
                  </p>
                </div>
              </div>
              <div className="sm:text-right">
                <div className={`text-2xl font-bold font-mono ${
                  evalResult.evaluationSummary.breachCount > 0 ? "text-rose-600" : evalResult.evaluationSummary.warningCount > 0 ? "text-amber-600" : "text-emerald-600"
                }`}>
                  {evalResult.evaluationSummary.breachCount > 0 ? "Breach" : evalResult.evaluationSummary.warningCount > 0 ? "Warning" : "Compliant"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Overall Status</div>
              </div>
            </div>

            {/* Metric row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground font-mono">{evalResult.evaluationSummary.results.length}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Covenants Tested</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600 font-mono">{evalResult.evaluationSummary.warningCount}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-rose-600 font-mono">{evalResult.evaluationSummary.breachCount}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Breaches</div>
              </div>
            </div>

            {/* Per-covenant results */}
            {evalResult.evaluationSummary.results.length > 0 && (
              <div className="mt-5 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Per-Covenant Results</div>
                {evalResult.evaluationSummary.results.map((r) => (
                  <div key={r.covenantId} className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-lg">
                    <div>
                      <span className="font-medium text-foreground text-xs">
                        {(r as { covenantType?: string }).covenantType ?? `Covenant #${r.covenantId}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {r.calculatedValue !== null && (
                        <span className="font-mono text-foreground font-medium">{r.calculatedValue.toFixed(3)}x</span>
                      )}
                      <span className={statusBadge(r.status)}>{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Narrative */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-border bg-gradient-to-r from-rose-50 to-transparent">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-rose-600" />
                <h3 className="font-semibold text-foreground">AI Covenant Narrative</h3>
                <span className="text-xs text-muted-foreground hidden sm:inline">— for Relationship Managers</span>
              </div>
              <button
                onClick={handleGenerateNarrative}
                disabled={narrativeLoading || narrativeMutation.isPending}
                className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {narrativeLoading ? (
                  <>
                    <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate AI Summary
                  </>
                )}
              </button>
            </div>
            <div className="px-6 py-5">
              {narrative ? (
                <div>
                  <p className="text-sm text-foreground leading-relaxed">{narrative}</p>
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    This summary was generated by an LLM from the covenant evaluation results above. The AI did not calculate any numbers — it only translated pre-computed results into plain English.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <Brain className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Click "Generate AI Summary" to see the LLM translate these results into plain English for a Relationship Manager.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* What You Just Saw explainer */}
          <WhatYouJustSaw evalResult={evalResult} scenario={scenario} />

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-xl font-medium hover:bg-accent transition-colors"
            >
              Try Another Scenario
            </button>
            <button
              onClick={() => setLocation(`/demo/borrowers/${borrower?.id}`)}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              View Full Borrower Detail
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
