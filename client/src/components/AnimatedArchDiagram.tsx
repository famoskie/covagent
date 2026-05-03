/**
 * AnimatedArchDiagram — CSS-only interactive flow diagram
 *
 * Fully div/CSS based — no SVG, no overflow issues, works on all screen sizes.
 * Hover any layer node to:
 *   - Highlight it with its accent colour
 *   - Dim all downstream layers
 *   - Show a live info panel with description and data flow
 *   - Animate the connector arrow below it
 * Auto-plays through layers when idle.
 */

import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/useMobile";

// ─── Layer definitions ────────────────────────────────────────────────────────

type LayerDef = {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  bg: string;
  border: string;
  text: string;
  dot: string;
  flowLabel: string;
  tooltip: string;
  downstream: string[];
  isBranch?: boolean;
};

const LAYERS: LayerDef[] = [
  {
    id: "browser",
    label: "Browser / React Frontend",
    sublabel: "React 19 · TypeScript · Tailwind · Recharts",
    color: "#3b82f6",
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
    dot: "bg-blue-500",
    flowLabel: "tRPC call over HTTPS",
    tooltip: "The user submits a financial statement. React serialises the inputs and fires a tRPC mutation to the Express server.",
    downstream: ["trpc"],
  },
  {
    id: "trpc",
    label: "tRPC API Layer",
    sublabel: "Type-safe procedures · Zod validation · React Query",
    color: "#6366f1",
    bg: "bg-indigo-50",
    border: "border-indigo-300",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    flowLabel: "Validated, typed input",
    tooltip: "tRPC deserialises the request, runs Zod schema validation on every field, and routes the call to the correct procedure with a fully-typed context object.",
    downstream: ["express"],
  },
  {
    id: "express",
    label: "Express Server",
    sublabel: "Node.js · OAuth middleware · Session cookies",
    color: "#8b5cf6",
    bg: "bg-violet-50",
    border: "border-violet-300",
    text: "text-violet-700",
    dot: "bg-violet-500",
    flowLabel: "Authenticated ctx.user",
    tooltip: "Express verifies the JWT session cookie, attaches the authenticated user to ctx, and passes control to the procedure handler. Unauthenticated requests are rejected here.",
    downstream: ["engine"],
  },
  {
    id: "engine",
    label: "Covenant Evaluation Engine",
    sublabel: "DSCR · Leverage · Current Ratio · Interest Coverage",
    color: "#f59e0b",
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    dot: "bg-amber-500",
    flowLabel: "Results + Alerts",
    tooltip: "Calculates financial ratios from submitted figures, evaluates each against the covenant threshold, classifies as Compliant / Warning / Breach, and creates Alert records for failures.",
    downstream: ["database", "ai"],
  },
  {
    id: "database",
    label: "MySQL Database (TiDB)",
    sublabel: "Drizzle ORM · 7 tables · Type-safe queries",
    color: "#10b981",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    flowLabel: "",
    tooltip: "Drizzle ORM writes covenant_results, alerts, and financial_submissions to TiDB. Column names and value types are checked at compile time — no raw SQL strings.",
    downstream: [],
  },
];

const AI_LAYER: LayerDef = {
  id: "ai",
  label: "AI Layer (LLM)",
  sublabel: "Manus Forge API · Server-side only",
  color: "#f43f5e",
  bg: "bg-rose-50",
  border: "border-rose-300",
  text: "text-rose-700",
  dot: "bg-rose-500",
  flowLabel: "",
  tooltip: "When a Relationship Manager requests a summary, the server assembles a structured prompt and calls the LLM via the Forge API. The model returns 3–4 plain-English sentences. The API key never leaves the server.",
  downstream: [],
  isBranch: true,
};

const AUTH_LAYER: LayerDef = {
  id: "auth",
  label: "Auth & Roles",
  sublabel: "OAuth · JWT · RBAC · 4 role tiers",
  color: "#64748b",
  bg: "bg-slate-50",
  border: "border-slate-300",
  text: "text-slate-600",
  dot: "bg-slate-400",
  flowLabel: "",
  tooltip: "Manus OAuth issues a signed JWT session cookie after login. Every tRPC request verifies the cookie and enforces role-based access: admin, analyst, rm, or unauthenticated demo.",
  downstream: [],
  isBranch: true,
};

const MAIN_IDS = ["browser", "trpc", "express", "engine", "database"];

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  onLayerClick?: (id: string) => void;
};

export default function AnimatedArchDiagram({ onLayerClick }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [autoIdx, setAutoIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMobile = useIsMobile();

  // Idle auto-play (slow)
  useEffect(() => {
    if (hovered || isPlaying) {
      if (autoRef.current) clearInterval(autoRef.current);
      return;
    }
    autoRef.current = setInterval(() => {
      setAutoIdx((i) => (i + 1) % MAIN_IDS.length);
    }, 2400);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [hovered, isPlaying]);

  // Play Full Flow: fast sequential animation through all layers
  const handlePlayFullFlow = () => {
    if (isPlaying) {
      if (playRef.current) clearInterval(playRef.current);
      setIsPlaying(false);
      setAutoIdx(0);
      return;
    }
    setIsPlaying(true);
    setAutoIdx(0);
    let step = 0;
    playRef.current = setInterval(() => {
      step++;
      if (step >= MAIN_IDS.length) {
        if (playRef.current) clearInterval(playRef.current);
        setIsPlaying(false);
        setAutoIdx(0);
        return;
      }
      setAutoIdx(step);
    }, 900);
  };

  // Cleanup play interval on unmount
  useEffect(() => {
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, []);

  const activeId = hovered ?? MAIN_IDS[autoIdx % MAIN_IDS.length];
  const allLayers = [...LAYERS, AI_LAYER, AUTH_LAYER];
  const activeLayer = allLayers.find((l) => l.id === activeId) ?? LAYERS[0];

  const activeMainIdx = MAIN_IDS.indexOf(activeId);

  function isLayerActive(id: string) {
    const idx = MAIN_IDS.indexOf(id);
    if (idx !== -1) return idx <= activeMainIdx;
    if (id === "ai" || id === "auth") return activeId === "engine" || id === activeId;
    return false;
  }

  function isLayerDimmed(id: string) {
    const idx = MAIN_IDS.indexOf(id);
    if (idx !== -1) return idx > activeMainIdx + 1;
    if (id === "ai" || id === "auth") return activeId !== "engine" && activeId !== "ai" && activeId !== "auth";
    return false;
  }

  return (
    <div className="w-full">
      {/* Flowing dash animation keyframes */}
      <style>{`
        @keyframes flowDash {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes flowDown {
          0% { background-position: 0 0; }
          100% { background-position: 0 20px; }
        }
        .connector-active {
          background-image: repeating-linear-gradient(
            to bottom,
            var(--connector-color) 0px,
            var(--connector-color) 6px,
            transparent 6px,
            transparent 10px
          );
          animation: flowDown 0.6s linear infinite;
        }
      `}</style>

      {/* Play Full Flow button + mobile hint */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-400 sm:hidden">
          👆 Tap any layer to trace the data flow
        </p>
        <div className="ml-auto">
          <button
            onClick={handlePlayFullFlow}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
              isPlaying
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary"
            }`}
          >
            {isPlaying ? (
              <>
                <span className="h-2 w-2 rounded-full bg-white animate-pulse inline-block" />
                Playing…
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play Full Flow
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Flow diagram ── */}
        <div className="w-full lg:flex-1 min-w-0">
          {/* Main column */}
          <div className="flex flex-col items-stretch gap-0">
            {LAYERS.map((layer, i) => {
              // Database is rendered inside the engine branch — skip it here
              if (layer.id === "database") return null;

              const active = isLayerActive(layer.id);
              const dimmed = isLayerDimmed(layer.id);
              const isHovered = hovered === layer.id || (hovered === null && MAIN_IDS[autoIdx % MAIN_IDS.length] === layer.id);
              const showConnector = i < LAYERS.length - 1 && layer.id !== "engine";
              const isBranchPoint = layer.id === "engine";

              return (
                <div key={layer.id} className="flex flex-col items-stretch">
                  {/* Node */}
                  <button
                    onMouseEnter={() => setHovered(layer.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onLayerClick?.(layer.id)}
                    className={`
                      w-full text-left rounded-xl border-2 px-5 py-4 transition-all duration-200
                      ${isHovered
                        ? `${layer.bg} ${layer.border} shadow-md scale-[1.01]`
                        : dimmed
                        ? "bg-slate-50 border-slate-100 opacity-40"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                      }
                    `}
                    style={{ borderLeftWidth: 4, borderLeftColor: isHovered ? layer.color : dimmed ? "#e2e8f0" : "#cbd5e1" }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className={`font-semibold text-sm truncate ${isHovered ? layer.text : dimmed ? "text-slate-400" : "text-slate-700"}`}>
                          {layer.label}
                        </div>
                        <div className={`text-xs mt-0.5 truncate ${isHovered ? layer.text + " opacity-70" : "text-slate-400"}`}>
                          {layer.sublabel}
                        </div>
                      </div>
                      {isHovered && (
                        <div className={`h-2.5 w-2.5 rounded-full shrink-0 animate-pulse ${layer.dot}`} />
                      )}
                    </div>
                  </button>

                  {/* Connector + branch */}
                  {showConnector && (
                    <div className="flex items-start">
                      {/* Main vertical connector */}
                      <div className="flex flex-col items-center" style={{ width: 60, marginLeft: 24 }}>
                      {/* Flowing connector line */}
                          <div
                            className={active ? "connector-active" : ""}
                            style={{
                              width: 2,
                              height: isBranchPoint ? 0 : 28,
                              backgroundColor: active ? "transparent" : "#e2e8f0",
                              // @ts-ignore
                              "--connector-color": layer.color,
                              transition: "height 0.3s",
                            } as React.CSSProperties}
                          />
                          {/* Flow label */}
                          {layer.flowLabel && active && (
                            <div
                              className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                              style={{ color: layer.color, backgroundColor: layer.color + "15", border: `1px solid ${layer.color}30` }}
                            >
                              {layer.flowLabel}
                            </div>
                          )}
                          {!isBranchPoint && (
                            <div
                              className={active ? "connector-active" : ""}
                              style={{
                                width: 2,
                                height: layer.flowLabel && active ? 8 : 28,
                                backgroundColor: active ? "transparent" : "#e2e8f0",
                                // @ts-ignore
                                "--connector-color": layer.color,
                              } as React.CSSProperties}
                            />
                          )}
                          {/* Arrow head */}
                          {!isBranchPoint && (
                            <div
                              className="w-0 h-0 transition-all duration-300"
                              style={{
                                borderLeft: "5px solid transparent",
                                borderRight: "5px solid transparent",
                                borderTop: `7px solid ${active ? layer.color : "#e2e8f0"}`,
                              }}
                            />
                          )}
                      </div>

                      {/* Branch connectors for engine → database + ai */}
                      {isBranchPoint && (
                        <div className="flex-1 pt-2 pb-1">
                          <div className="flex items-start gap-3">
                            {/* Left branch: database */}
                            <div className="flex-1 flex flex-col items-center">
                              <div className="flex items-center w-full justify-center">
                                <div className="h-0.5 flex-1 transition-all duration-300" style={{ backgroundColor: isLayerActive("database") ? layer.color : "#e2e8f0" }} />
                                <div className="w-0.5 h-6 transition-all duration-300 mx-0" style={{ backgroundColor: isLayerActive("database") ? layer.color : "#e2e8f0" }} />
                                <div className="h-0.5 flex-1 opacity-0" />
                              </div>
                              <div
                                className="w-0 h-0"
                                style={{
                                  borderLeft: "5px solid transparent",
                                  borderRight: "5px solid transparent",
                                  borderTop: `7px solid ${isLayerActive("database") ? layer.color : "#e2e8f0"}`,
                                }}
                              />
                            </div>

                            {/* Center: vertical line down */}
                            <div className="flex flex-col items-center" style={{ width: 40 }}>
                              <div className="w-0.5 h-4 transition-all duration-300" style={{ backgroundColor: isLayerActive("engine") ? layer.color : "#e2e8f0" }} />
                              {layer.flowLabel && isLayerActive("engine") && (
                                <div className="text-xs font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap text-center" style={{ color: layer.color, backgroundColor: layer.color + "15", fontSize: 9 }}>
                                  {layer.flowLabel}
                                </div>
                              )}
                              <div className="w-0.5 h-4 transition-all duration-300" style={{ backgroundColor: isLayerActive("engine") ? layer.color : "#e2e8f0" }} />
                              <div
                                className="w-0 h-0"
                                style={{
                                  borderLeft: "5px solid transparent",
                                  borderRight: "5px solid transparent",
                                  borderTop: `7px solid ${isLayerActive("engine") ? layer.color : "#e2e8f0"}`,
                                }}
                              />
                            </div>

                            {/* Right branch: AI */}
                            <div className="flex-1 flex flex-col items-center">
                              <div className="flex items-center w-full justify-center">
                                <div className="h-0.5 opacity-0 flex-1" />
                                <div className="w-0.5 h-6 transition-all duration-300 mx-0" style={{ backgroundColor: isLayerActive("ai") || activeId === "ai" ? AI_LAYER.color : "#e2e8f0" }} />
                                <div className="h-0.5 flex-1 transition-all duration-300" style={{ backgroundColor: isLayerActive("ai") || activeId === "ai" ? AI_LAYER.color : "#e2e8f0" }} />
                              </div>
                              <div
                                className="w-0 h-0"
                                style={{
                                  borderLeft: "5px solid transparent",
                                  borderRight: "5px solid transparent",
                                  borderTop: `7px solid ${isLayerActive("ai") || activeId === "ai" ? AI_LAYER.color : "#e2e8f0"}`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Branch nodes: database left, AI right */}
                          <div className="flex items-stretch gap-3 mt-1">
                            {/* Database node */}
                            <button
                              onMouseEnter={() => setHovered("database")}
                              onMouseLeave={() => setHovered(null)}
                              onClick={() => onLayerClick?.("database")}
                              className={`
                                flex-1 text-left rounded-xl border-2 px-4 py-3 transition-all duration-200
                                ${hovered === "database"
                                  ? `${LAYERS[4].bg} ${LAYERS[4].border} shadow-md`
                                  : isLayerDimmed("database")
                                  ? "bg-slate-50 border-slate-100 opacity-40"
                                  : "bg-white border-slate-200 hover:border-slate-300"
                                }
                              `}
                              style={{ borderLeftWidth: 4, borderLeftColor: hovered === "database" ? LAYERS[4].color : "#cbd5e1" }}
                            >
                              <div className={`font-semibold text-xs ${hovered === "database" ? LAYERS[4].text : "text-slate-600"}`}>MySQL Database</div>
                              <div className={`text-xs mt-0.5 ${hovered === "database" ? LAYERS[4].text + " opacity-70" : "text-slate-400"}`}>Drizzle ORM · 7 tables</div>
                            </button>

                            {/* AI node */}
                            <button
                              onMouseEnter={() => setHovered("ai")}
                              onMouseLeave={() => setHovered(null)}
                              onClick={() => onLayerClick?.("ai")}
                              className={`
                                flex-1 text-left rounded-xl border-2 px-4 py-3 transition-all duration-200
                                ${hovered === "ai"
                                  ? `${AI_LAYER.bg} ${AI_LAYER.border} shadow-md`
                                  : isLayerDimmed("ai")
                                  ? "bg-slate-50 border-slate-100 opacity-40"
                                  : "bg-white border-slate-200 hover:border-slate-300"
                                }
                              `}
                              style={{ borderLeftWidth: 4, borderLeftColor: hovered === "ai" ? AI_LAYER.color : "#cbd5e1" }}
                            >
                              <div className={`font-semibold text-xs ${hovered === "ai" ? AI_LAYER.text : "text-slate-600"}`}>AI Layer (LLM)</div>
                              <div className={`text-xs mt-0.5 ${hovered === "ai" ? AI_LAYER.text + " opacity-70" : "text-slate-400"}`}>Forge API · Server-side</div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Note: database node is rendered in the branch above, not here */}

            {/* Auth — cross-cutting concern */}
            <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
              <button
                onMouseEnter={() => setHovered("auth")}
                onMouseLeave={() => setHovered(null)}
                className={`
                  w-full text-left rounded-xl border-2 border-dashed px-5 py-3 transition-all duration-200
                  ${hovered === "auth" ? `${AUTH_LAYER.bg} ${AUTH_LAYER.border}` : "bg-slate-50/50 border-slate-200"}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-semibold text-sm ${hovered === "auth" ? AUTH_LAYER.text : "text-slate-500"}`}>
                      Auth & Roles <span className="text-xs font-normal ml-1 opacity-60">— cross-cutting concern</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">OAuth · JWT · RBAC · 4 role tiers (admin, analyst, rm, demo)</div>
                  </div>
                  {hovered === "auth" && <div className={`h-2 w-2 rounded-full ${AUTH_LAYER.dot} animate-pulse`} />}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── Info panel ── */}
        <div className="w-full lg:w-64 xl:w-72 shrink-0">
          <div
            className="rounded-2xl border-2 p-5 transition-all duration-300"
            style={{ borderColor: activeLayer.color, backgroundColor: activeLayer.color + "0d" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ backgroundColor: activeLayer.color }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: activeLayer.color }}>
                Active Layer
              </span>
            </div>
            <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2">{activeLayer.label}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">{activeLayer.tooltip}</p>

            {activeLayer.downstream.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sends data to</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeLayer.downstream.map((d) => {
                    const dl = allLayers.find((l) => l.id === d)!;
                    return (
                      <span
                        key={d}
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: dl.color + "15", color: dl.color, border: `1px solid ${dl.color}30` }}
                      >
                        {dl.label.split(" ")[0]}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {activeLayer.downstream.length === 0 && (
              <div
                className="text-xs font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
                style={{ backgroundColor: activeLayer.color + "15", color: activeLayer.color, border: `1px solid ${activeLayer.color}30` }}
              >
                <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ backgroundColor: activeLayer.color }} />
                Terminal layer
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 text-center mt-3 leading-relaxed">
            {isMobile ? "Tap" : "Hover"} any layer to trace the data flow.
            <br />Or click <strong className="text-slate-500">Play Full Flow</strong> to watch it run.
          </p>

          {/* Quick nav pills */}
          <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
            {[...LAYERS, AI_LAYER].map((l) => (
              <button
                key={l.id}
                onMouseEnter={() => setHovered(l.id)}
                onMouseLeave={() => setHovered(null)}
                className="text-xs px-2.5 py-1 rounded-full border font-medium transition-all"
                style={{
                  backgroundColor: activeId === l.id ? l.color + "15" : "white",
                  borderColor: activeId === l.id ? l.color : "#e2e8f0",
                  color: activeId === l.id ? l.color : "#64748b",
                }}
              >
                {l.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
