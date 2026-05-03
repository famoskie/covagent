/**
 * ProductPreview — Animated product demo for the landing page
 *
 * Shows the core CovAgent agentic pipeline auto-cycling through 4 states:
 *   1. Portfolio Overview — borrower table with live status badges
 *   2. Evaluation Running — covenant engine calculating ratios
 *   3. Breach Detected — alert feed with severity indicators
 *   4. AI Narrative — LLM generating plain-language summary
 *
 * Wrapped in a browser-chrome mockup (macOS style).
 */

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Brain,
  CheckCircle2,
  Loader2,
  Sparkles,
  XCircle,
  Zap,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const BORROWERS = [
  { name: "Meridian Manufacturing Co.", industry: "Manufacturing", risk: "Medium", status: "Warning", dscr: "1.226", leverage: "4.00" },
  { name: "Apex Retail Group", industry: "Retail", risk: "High", status: "Breach", dscr: "0.636", leverage: "4.17" },
  { name: "BlueSky Logistics LLC", industry: "Logistics", risk: "Low", status: "Compliant", dscr: "1.366", leverage: "3.50" },
];

const COVENANT_STEPS = [
  { label: "Fetching covenant rules for Apex Retail Group…", done: false },
  { label: "Calculating DSCR: 0.700 ÷ 1.100 = 0.636x", done: false },
  { label: "Evaluating: 0.636 >= 1.25 → BREACH", done: false },
  { label: "Calculating Current Ratio: 5.4M ÷ 5.2M = 1.038x", done: false },
  { label: "Evaluating: 1.038 >= 1.10 → WARNING", done: false },
  { label: "Creating alert records…", done: false },
  { label: "Notifying platform owner in real time…", done: false },
];

const AI_NARRATIVE = "Apex Retail Group is currently in breach of its DSCR covenant, meaning operating cash flows are insufficient to cover debt service obligations. The current ratio is also dangerously close to the minimum threshold, signalling near-term liquidity pressure. An urgent conversation with the client is warranted to understand the drivers and agree a remediation plan.";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "Compliant") return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="h-3 w-3" /> Compliant
    </span>
  );
  if (status === "Warning") return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
      <AlertTriangle className="h-3 w-3" /> Warning
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
      <XCircle className="h-3 w-3" /> Breach
    </span>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const cls = risk === "Low" ? "bg-emerald-100 text-emerald-700" : risk === "Medium" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700";
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{risk}</span>;
}

// ─── Screen 1: Portfolio ──────────────────────────────────────────────────────

function PortfolioScreen() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Portfolio Overview</h3>
          <p className="text-xs text-slate-500">Real-time covenant compliance</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg px-2.5 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Live Demo
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Active Loans", value: "3", color: "text-blue-600" },
          { label: "Covenants", value: "6", color: "text-indigo-600" },
          { label: "Warnings", value: "2", color: "text-amber-600" },
          { label: "Breaches", value: "1", color: "text-rose-600" },
        ].map((m) => (
          <div key={m.label} className="bg-white border border-slate-200 rounded-lg p-2.5 text-center">
            <div className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Borrower table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Borrower Portfolio</span>
          <span className="text-xs text-slate-400">3 borrowers</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-3 py-2 text-slate-400 font-medium">Borrower</th>
              <th className="text-left px-3 py-2 text-slate-400 font-medium hidden sm:table-cell">Risk</th>
              <th className="text-left px-3 py-2 text-slate-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {BORROWERS.map((b, i) => (
              <tr key={i} className={`border-b border-slate-50 ${b.status === "Breach" ? "bg-rose-50/50" : ""}`}>
                <td className="px-3 py-2.5">
                  <div className="font-medium text-slate-700">{b.name}</div>
                  <div className="text-slate-400">{b.industry}</div>
                </td>
                <td className="px-3 py-2.5 hidden sm:table-cell"><RiskBadge risk={b.risk} /></td>
                <td className="px-3 py-2.5"><StatusBadge status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Screen 2: Evaluation Running ────────────────────────────────────────────

function EvaluationScreen({ step }: { step: number }) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Covenant Engine Running</h3>
            <p className="text-xs text-slate-500">Apex Retail Group · Q1 2025</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Processing…
        </div>
      </div>

      <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs space-y-1.5">
        {COVENANT_STEPS.map((s, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 transition-all duration-300 ${
              i < step ? "opacity-100" : "opacity-0"
            }`}
          >
            {i < step - 1 ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
            ) : i === step - 1 ? (
              <Loader2 className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5 animate-spin" />
            ) : null}
            <span className={i < step - 1 ? "text-slate-400" : "text-amber-300"}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-600">Progress</span>
          <span className="text-xs text-slate-500">{Math.round((step / COVENANT_STEPS.length) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${(step / COVENANT_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Screen 3: Breach Detected ────────────────────────────────────────────────

function BreachScreen() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Alerts & Breach Feed</h3>
            <p className="text-xs text-slate-500">Real-time covenant violations</p>
          </div>
        </div>
        <span className="text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200 rounded-full px-2.5 py-0.5">1 Breach</span>
      </div>

      <div className="bg-rose-50 border border-rose-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-rose-200 bg-rose-100/50">
          <XCircle className="h-3.5 w-3.5 text-rose-600" />
          <span className="text-xs font-semibold text-rose-700">Covenant Breach</span>
        </div>
        <div className="px-3 py-3">
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            BREACH: Apex Retail Group failed DSCR covenant. Required: ≥ 1.25. Actual: <span className="text-rose-600 font-bold">0.636x</span>.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-400">May 3, 2025 · Q1 2025</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-400">DSCR</span>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-200 bg-amber-100/50">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-xs font-semibold text-amber-700">Near-Breach Warning</span>
        </div>
        <div className="px-3 py-3">
          <p className="text-xs text-slate-700 leading-relaxed">
            WARNING: Apex Retail Group near breach on Current Ratio. Required: ≥ 1.10. Actual: <span className="text-amber-600 font-bold">1.038x</span>.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
        <span className="text-xs text-slate-600">Owner notified in real time via platform notification</span>
      </div>
    </div>
  );
}

// ─── Screen 4: AI Narrative ───────────────────────────────────────────────────

function NarrativeScreen({ charCount }: { charCount: number }) {
  const displayed = AI_NARRATIVE.slice(0, charCount);
  const isComplete = charCount >= AI_NARRATIVE.length;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center">
            <Bot className="h-3.5 w-3.5 text-rose-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">AI Covenant Narrative</h3>
            <p className="text-xs text-slate-500">For Relationship Managers</p>
          </div>
        </div>
        {isComplete ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Generated
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
            <Brain className="h-3.5 w-3.5 animate-pulse" />
            Generating…
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <div className="text-xs text-slate-500 mb-2 font-medium">Borrower: Apex Retail Group · Q1 2025</div>
        <p className="text-xs text-slate-700 leading-relaxed">
          {displayed}
          {!isComplete && <span className="inline-block w-0.5 h-3 bg-rose-500 animate-pulse ml-0.5 align-middle" />}
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
        <p className="text-xs text-slate-500 italic">
          The AI translated pre-computed results into plain English. No numbers were calculated by the model.
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Screen = "portfolio" | "evaluation" | "breach" | "narrative";

const SCREEN_SEQUENCE: Screen[] = ["portfolio", "evaluation", "breach", "narrative"];

export default function ProductPreview() {
  const [screen, setScreen] = useState<Screen>("portfolio");
  const [evalStep, setEvalStep] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  // Auto-cycle through screens
  useEffect(() => {
    if (!isRunning) return;

    if (screen === "portfolio") {
      const t = setTimeout(() => setScreen("evaluation"), 2800);
      return () => clearTimeout(t);
    }

    if (screen === "evaluation") {
      if (evalStep < COVENANT_STEPS.length) {
        const t = setTimeout(() => setEvalStep((s) => s + 1), 380);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => { setScreen("breach"); setEvalStep(0); }, 600);
        return () => clearTimeout(t);
      }
    }

    if (screen === "breach") {
      const t = setTimeout(() => setScreen("narrative"), 3000);
      return () => clearTimeout(t);
    }

    if (screen === "narrative") {
      if (charCount < AI_NARRATIVE.length) {
        const t = setTimeout(() => setCharCount((c) => Math.min(c + 4, AI_NARRATIVE.length)), 28);
        return () => clearTimeout(t);
      } else {
        // Restart the cycle after a pause
        const t = setTimeout(() => {
          setScreen("portfolio");
          setCharCount(0);
          setEvalStep(0);
        }, 4000);
        return () => clearTimeout(t);
      }
    }
  }, [screen, evalStep, charCount, isRunning]);

  const screenLabels: Record<Screen, string> = {
    portfolio: "Portfolio Dashboard",
    evaluation: "Covenant Engine",
    breach: "Breach Alerts",
    narrative: "AI Narrative",
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Browser chrome */}
      <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
        {/* Title bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          {/* URL bar */}
          <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-500 font-mono">covagent.live/dashboard</span>
          </div>
          {/* Status indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
            <div className={`h-2 w-2 rounded-full ${screen === "evaluation" ? "bg-amber-400 animate-pulse" : screen === "breach" ? "bg-rose-400 animate-pulse" : screen === "narrative" ? "bg-rose-400 animate-pulse" : "bg-emerald-400"}`} />
            <span className="hidden sm:inline">{screenLabels[screen]}</span>
          </div>
        </div>

        {/* Screen content */}
        <div className="min-h-[300px] sm:min-h-[340px] bg-slate-50 relative overflow-hidden">
          <div className={`absolute inset-0 transition-opacity duration-300 ${screen === "portfolio" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <PortfolioScreen />
          </div>
          <div className={`absolute inset-0 transition-opacity duration-300 ${screen === "evaluation" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <EvaluationScreen step={evalStep} />
          </div>
          <div className={`absolute inset-0 transition-opacity duration-300 ${screen === "breach" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <BreachScreen />
          </div>
          <div className={`absolute inset-0 transition-opacity duration-300 ${screen === "narrative" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <NarrativeScreen charCount={charCount} />
          </div>
        </div>

        {/* Progress dots */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {SCREEN_SEQUENCE.map((s) => (
              <button
                key={s}
                onClick={() => { setScreen(s); setEvalStep(0); setCharCount(0); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  screen === s ? "w-6 bg-primary" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400">
            {SCREEN_SEQUENCE.indexOf(screen) + 1} / {SCREEN_SEQUENCE.length} — {screenLabels[screen]}
          </span>
        </div>
      </div>
    </div>
  );
}
