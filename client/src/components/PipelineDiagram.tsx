/**
 * PipelineDiagram — Visual architecture pipeline for the TechStack page.
 *
 * Left-to-right flow with 4 color-coded stages:
 *   1. Loan Data Sources  (slate/neutral)
 *   2. Covenant Engine    (blue/teal — deterministic)
 *   3. AI Narrative       (amber/gold — LLM)
 *   4. Output             (green)
 *
 * Dashed line from Covenant Engine down to HITL note.
 * Responsive: stacks vertically on mobile.
 */

import { ArrowRight, ArrowDown } from "lucide-react";

// ─── Stage data ───────────────────────────────────────────────────────────────

const STAGES = [
  {
    id: "sources",
    label: "LOAN DATA SOURCES",
    color: "border-slate-600",
    labelColor: "text-slate-400",
    bg: "bg-slate-800/60",
    divider: "bg-slate-600",
    items: [
      "Core Banking System",
      "Spreadsheet Upload",
      "API Integration",
    ],
    itemColor: "text-slate-200",
    badge: null,
  },
  {
    id: "engine",
    label: "COVENANT ENGINE",
    color: "border-cyan-500/60",
    labelColor: "text-cyan-400",
    bg: "bg-cyan-950/40",
    divider: "bg-cyan-500/40",
    items: [
      "Calculate Ratios",
      "DSCR · Leverage",
      "Current Ratio",
      "Interest Coverage",
      "↓",
      "BREACH DETECTION",
      "Compliant / Warning / Breach",
      "↓",
      "RBAC LAYER",
      "Analyst · RM · Admin",
    ],
    itemColor: "text-cyan-100",
    badge: { text: "Deterministic", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  },
  {
    id: "narrative",
    label: "AI NARRATIVE",
    color: "border-amber-500/60",
    labelColor: "text-amber-400",
    bg: "bg-amber-950/30",
    divider: "bg-amber-500/40",
    items: [
      "GPT-4o",
      "Structured Context",
      "System Prompt",
      "Plain-English Summary",
    ],
    itemColor: "text-amber-100",
    badge: { text: "LLM · Human-triggered", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  },
  {
    id: "output",
    label: "OUTPUT",
    color: "border-emerald-500/60",
    labelColor: "text-emerald-400",
    bg: "bg-emerald-950/30",
    divider: "bg-emerald-500/40",
    items: [
      "RM Dashboard",
      "Breach Alerts",
      "Audit Log",
    ],
    itemColor: "text-emerald-100",
    badge: { text: "Read-only", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PipelineDiagram() {
  return (
    <div className="w-full">
      {/* Main pipeline card */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700 bg-slate-800/80">
          <span className="text-xs font-mono text-slate-400 tracking-wider">CovAgent · Agentic Pipeline</span>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Pipeline stages */}
        <div className="p-5 sm:p-6">
          {/* Desktop: horizontal flow */}
          <div className="hidden md:flex items-start gap-0">
            {STAGES.map((stage, i) => (
              <div key={stage.id} className="flex items-start flex-1 min-w-0">
                {/* Stage box */}
                <div className={`flex-1 min-w-0 rounded-xl border ${stage.color} ${stage.bg} p-4`}>
                  {/* Stage label */}
                  <div className={`text-xs font-bold tracking-widest uppercase mb-2 ${stage.labelColor}`}>
                    {stage.label}
                  </div>
                  <div className={`h-px w-full ${stage.divider} mb-3`} />

                  {/* Badge */}
                  {stage.badge && (
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border mb-3 ${stage.badge.color}`}>
                      {stage.badge.text}
                    </span>
                  )}

                  {/* Items */}
                  <div className="space-y-1">
                    {stage.items.map((item, j) => (
                      <div key={j} className={`text-sm font-mono ${
                        item === "↓" ? "text-slate-500 text-center text-base" :
                        item === item.toUpperCase() && item.length > 3 ? `font-bold text-xs tracking-wider ${stage.labelColor}` :
                        stage.itemColor
                      }`}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow between stages */}
                {i < STAGES.length - 1 && (
                  <div className="flex items-center px-2 pt-8 shrink-0">
                    <ArrowRight className="h-5 w-5 text-slate-500" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: vertical stack */}
          <div className="flex flex-col gap-3 md:hidden">
            {STAGES.map((stage, i) => (
              <div key={stage.id}>
                <div className={`rounded-xl border ${stage.color} ${stage.bg} p-4`}>
                  <div className={`text-xs font-bold tracking-widest uppercase mb-2 ${stage.labelColor}`}>
                    {stage.label}
                  </div>
                  <div className={`h-px w-full ${stage.divider} mb-3`} />
                  {stage.badge && (
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border mb-3 ${stage.badge.color}`}>
                      {stage.badge.text}
                    </span>
                  )}
                  <div className="space-y-1">
                    {stage.items.map((item, j) => (
                      <div key={j} className={`text-sm font-mono ${
                        item === "↓" ? "text-slate-500 text-center" :
                        item === item.toUpperCase() && item.length > 3 ? `font-bold text-xs tracking-wider ${stage.labelColor}` :
                        stage.itemColor
                      }`}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                {i < STAGES.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="h-4 w-4 text-slate-500" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* HITL dashed line note */}
          <div className="mt-5 flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0 mt-1">
              <div className="w-px h-4 border-l-2 border-dashed border-slate-600" />
              <div className="h-2 w-2 rounded-full bg-slate-600" />
            </div>
            <div className="flex-1 bg-slate-800/50 border border-dashed border-slate-600 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-slate-300 mb-0.5">Human remains in the loop — AI explains, humans decide</p>
              <p className="text-xs text-slate-500">
                The Covenant Engine fires automatically on every submission. The AI Narrative is triggered only when a Relationship Manager clicks "Generate Summary" — never automatically. All breach decisions, waivers, and remediation plans are made by the credit team.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="mt-3 text-xs text-slate-500 text-center leading-relaxed">
        Data flows left to right. The Covenant Engine is deterministic — same inputs always produce same outputs.
        The AI Narrative layer is additive and human-triggered only.
      </p>
    </div>
  );
}
