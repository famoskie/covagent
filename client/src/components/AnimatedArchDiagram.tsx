/**
 * AnimatedArchDiagram
 *
 * An interactive SVG-based architecture diagram for the TechStack page.
 * Hovering a layer node:
 *   - Lifts the node with a shadow + border highlight
 *   - Animates an SVG connector "data packet" dot travelling downward
 *   - Dims all unrelated layers
 *   - Shows a tooltip describing the data flow at that step
 *
 * An auto-play mode cycles through layers when nothing is hovered.
 */

import { useEffect, useRef, useState } from "react";

// ─── Layer definitions ────────────────────────────────────────────────────────

type LayerDef = {
  id: string;
  label: string;
  sublabel: string;
  color: string;         // Tailwind color name
  hex: string;           // Hex for SVG
  lightHex: string;      // Light tint for SVG fill
  flowLabel: string;     // Short label shown on the animated connector
  tooltip: string;       // Shown in the info panel on hover
  downstream: string[];  // IDs of layers this one sends data to
};

const LAYERS: LayerDef[] = [
  {
    id: "browser",
    label: "Browser / React Frontend",
    sublabel: "React 19 · TypeScript · Tailwind · Recharts",
    color: "blue",
    hex: "#3b82f6",
    lightHex: "#eff6ff",
    flowLabel: "HTTP / tRPC call",
    tooltip: "The user submits a financial statement form. React serialises the inputs and fires a tRPC mutation over HTTPS to the Express server.",
    downstream: ["trpc"],
  },
  {
    id: "trpc",
    label: "tRPC API Layer",
    sublabel: "Type-safe procedures · Zod validation",
    color: "indigo",
    hex: "#6366f1",
    lightHex: "#eef2ff",
    flowLabel: "Validated input",
    tooltip: "tRPC deserialises the request, runs Zod schema validation on every input field, and routes the call to the correct procedure handler with a fully-typed context object.",
    downstream: ["express"],
  },
  {
    id: "express",
    label: "Express Server",
    sublabel: "Node.js · OAuth middleware · Session cookies",
    color: "violet",
    hex: "#8b5cf6",
    lightHex: "#f5f3ff",
    flowLabel: "Authenticated context",
    tooltip: "Express verifies the JWT session cookie, attaches the authenticated user to ctx, and passes control to the procedure handler. Unauthenticated requests are rejected here.",
    downstream: ["engine"],
  },
  {
    id: "engine",
    label: "Covenant Evaluation Engine",
    sublabel: "DSCR · Leverage · Current Ratio · Alerts",
    color: "amber",
    hex: "#f59e0b",
    lightHex: "#fffbeb",
    flowLabel: "Ratio results + alerts",
    tooltip: "The engine calculates DSCR, Leverage Ratio, Current Ratio, and Interest Coverage from the submitted figures. It evaluates each against the covenant threshold, determines Compliant / Warning / Breach, and creates Alert records for failures.",
    downstream: ["database", "ai"],
  },
  {
    id: "database",
    label: "MySQL Database (TiDB)",
    sublabel: "Drizzle ORM · 7 tables · Type-safe queries",
    color: "emerald",
    hex: "#10b981",
    lightHex: "#ecfdf5",
    flowLabel: "Persisted rows",
    tooltip: "Drizzle ORM writes covenant_results, alerts, and financial_submissions rows to TiDB. The typed query builder ensures column names and value types are checked at compile time — no raw SQL strings.",
    downstream: [],
  },
  {
    id: "ai",
    label: "AI Layer (LLM)",
    sublabel: "Manus Forge API · Server-side only",
    color: "rose",
    hex: "#f43f5e",
    lightHex: "#fff1f2",
    flowLabel: "Plain-language narrative",
    tooltip: "When a Relationship Manager requests a summary, the server assembles a structured prompt from the borrower's covenant data and sends it to the LLM via the Forge API. The model returns a 3–4 sentence plain-English narrative. The API key never leaves the server.",
    downstream: [],
  },
];

// ─── Layout constants ─────────────────────────────────────────────────────────

const NODE_W = 520;
const NODE_H = 62;
const NODE_GAP = 28;
const SVG_W = 640;
const MAIN_X = (SVG_W - NODE_W) / 2;

// Main column Y positions (browser, trpc, express, engine, database)
const mainIds = ["browser", "trpc", "express", "engine", "database"];
const sideIds = ["ai"];

function getMainY(index: number) {
  return 20 + index * (NODE_H + NODE_GAP);
}

// AI node: to the right of the engine node
const engineIdx = mainIds.indexOf("engine");
const ENGINE_Y = getMainY(engineIdx);
const AI_X = MAIN_X + NODE_W + 32;
const AI_Y = ENGINE_Y + NODE_H + NODE_GAP;

const SVG_H = getMainY(mainIds.length) + 20;

function getNodePos(id: string): { x: number; y: number } {
  const mi = mainIds.indexOf(id);
  if (mi !== -1) return { x: MAIN_X, y: getMainY(mi) };
  if (id === "ai") return { x: AI_X, y: AI_Y };
  return { x: MAIN_X, y: 0 };
}

// ─── Connector paths ──────────────────────────────────────────────────────────

type ConnectorDef = {
  id: string;
  from: string;
  to: string;
  label: string;
};

const CONNECTORS: ConnectorDef[] = [
  { id: "c-browser-trpc",   from: "browser",  to: "trpc",     label: "tRPC call" },
  { id: "c-trpc-express",   from: "trpc",     to: "express",  label: "Validated" },
  { id: "c-express-engine", from: "express",  to: "engine",   label: "ctx.user" },
  { id: "c-engine-db",      from: "engine",   to: "database", label: "Write rows" },
  { id: "c-engine-ai",      from: "engine",   to: "ai",       label: "Prompt" },
];

function getConnectorPath(from: string, to: string): string {
  const f = getNodePos(from);
  const t = getNodePos(to);

  if (from === "engine" && to === "ai") {
    // Curved path from engine right edge to ai top
    const fx = f.x + NODE_W;
    const fy = f.y + NODE_H / 2;
    const tx = t.x + NODE_W / 2;
    const ty = t.y;
    return `M ${fx} ${fy} C ${fx + 60} ${fy}, ${tx} ${ty - 40}, ${tx} ${ty}`;
  }

  // Straight vertical connector between main column nodes
  const cx = f.x + NODE_W / 2;
  const fy = f.y + NODE_H;
  const ty = t.y;
  return `M ${cx} ${fy} L ${cx} ${ty}`;
}

function getConnectorLength(from: string, to: string): number {
  if (from === "engine" && to === "ai") return 120;
  const f = getNodePos(from);
  const t = getNodePos(to);
  return Math.abs(t.y - (f.y + NODE_H));
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  onLayerClick?: (id: string) => void;
};

export default function AnimatedArchDiagram({ onLayerClick }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [autoIdx, setAutoIdx] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-play: cycle through layers every 2.2s when nothing is hovered
  useEffect(() => {
    if (hovered) {
      if (autoRef.current) clearInterval(autoRef.current);
      return;
    }
    autoRef.current = setInterval(() => {
      setAutoIdx((i) => (i + 1) % mainIds.length);
    }, 2200);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [hovered]);

  // Treat 'auth-note' as a non-layer hover — fall back to auto-play layer
  const resolvedHovered = hovered === "auth-note" ? null : hovered;
  const activeId = resolvedHovered ?? mainIds[autoIdx % mainIds.length];
  const activeLayer = LAYERS.find((l) => l.id === activeId) ?? LAYERS[0];

  // Which connectors are "active" (downstream from the hovered node)
  function isConnectorActive(c: ConnectorDef): boolean {
    if (!activeId) return false;
    // A connector is active if it originates from the active layer
    // or from any layer upstream of it in the main chain
    const activeMainIdx = mainIds.indexOf(activeId);
    const fromMainIdx = mainIds.indexOf(c.from);
    if (fromMainIdx !== -1 && activeMainIdx !== -1 && fromMainIdx <= activeMainIdx) return true;
    if (activeId === "engine" && (c.from === "engine")) return true;
    return false;
  }

  function isNodeDimmed(id: string): boolean {
    if (!activeId) return false;
    const activeMainIdx = mainIds.indexOf(activeId);
    const nodeMainIdx = mainIds.indexOf(id);
    if (nodeMainIdx !== -1 && activeMainIdx !== -1) {
      return nodeMainIdx > activeMainIdx + 1;
    }
    if (id === "ai" && activeId !== "engine" && activeId !== "ai") return true;
    return false;
  }

  return (
    <div className="w-full">
      {/* Info panel — shown ABOVE the diagram on mobile for clarity */}
      <div className="flex flex-col-reverse lg:flex-row gap-6 items-start">
        {/* SVG Diagram */}
        <div className="w-full lg:flex-1 min-w-0 overflow-x-auto">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full h-auto block"
            style={{ maxWidth: 640 }}
          >
            {/* Connector paths */}
            {CONNECTORS.map((c) => {
              const active = isConnectorActive(c);
              const fromLayer = LAYERS.find((l) => l.id === c.from)!;
              const pathD = getConnectorPath(c.from, c.to);
              const pathLen = getConnectorLength(c.from, c.to);

              return (
                <g key={c.id}>
                  {/* Base connector line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={active ? fromLayer.hex : "#e2e8f0"}
                    strokeWidth={active ? 2.5 : 1.5}
                    strokeDasharray={active ? "none" : "4 4"}
                    style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
                  />

                  {/* Animated data packet dot */}
                  {active && (
                    <circle r={5} fill={fromLayer.hex} opacity={0.9}>
                      <animateMotion
                        dur="1.1s"
                        repeatCount="indefinite"
                        path={pathD}
                        rotate="auto"
                      />
                    </circle>
                  )}

                  {/* Connector label */}
                  {active && c.from !== "engine" || (active && c.from === "engine" && c.to !== "ai") ? (
                    <text
                      x={MAIN_X + NODE_W / 2 + 12}
                      y={getNodePos(c.from).y + NODE_H + NODE_GAP / 2 + 4}
                      fontSize={9}
                      fill={fromLayer.hex}
                      fontFamily="Inter, sans-serif"
                      fontWeight="600"
                      opacity={active ? 1 : 0}
                      style={{ transition: "opacity 0.3s" }}
                    >
                      {c.label}
                    </text>
                  ) : null}
                </g>
              );
            })}

            {/* Layer nodes */}
            {LAYERS.map((layer) => {
              const pos = getNodePos(layer.id);
              const isActive = layer.id === activeId;
              const dimmed = isNodeDimmed(layer.id);
              const nodeW = layer.id === "ai" ? NODE_W * 0.72 : NODE_W;

              return (
                <g
                  key={layer.id}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(layer.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onLayerClick?.(layer.id)}
                >
                  {/* Drop shadow filter */}
                  <defs>
                    <filter id={`shadow-${layer.id}`} x="-10%" y="-20%" width="120%" height="150%">
                      <feDropShadow
                        dx="0"
                        dy={isActive ? 4 : 1}
                        stdDeviation={isActive ? 8 : 2}
                        floodColor={layer.hex}
                        floodOpacity={isActive ? 0.2 : 0.06}
                      />
                    </filter>
                  </defs>

                  {/* Node background */}
                  <rect
                    x={pos.x}
                    y={isActive ? pos.y - 2 : pos.y}
                    width={nodeW}
                    height={NODE_H}
                    rx={10}
                    fill={isActive ? layer.lightHex : "#ffffff"}
                    stroke={isActive ? layer.hex : dimmed ? "#f1f5f9" : "#e2e8f0"}
                    strokeWidth={isActive ? 2 : 1}
                    filter={`url(#shadow-${layer.id})`}
                    opacity={dimmed ? 0.35 : 1}
                    style={{ transition: "all 0.25s ease" }}
                  />

                  {/* Left accent bar */}
                  <rect
                    x={pos.x}
                    y={isActive ? pos.y - 2 : pos.y}
                    width={4}
                    height={NODE_H}
                    rx={2}
                    fill={isActive ? layer.hex : dimmed ? "#e2e8f0" : "#cbd5e1"}
                    opacity={dimmed ? 0.35 : 1}
                    style={{ transition: "fill 0.25s" }}
                  />

                  {/* Pulse ring on active */}
                  {isActive && (
                    <rect
                      x={pos.x - 3}
                      y={pos.y - 5}
                      width={nodeW + 6}
                      height={NODE_H + 6}
                      rx={13}
                      fill="none"
                      stroke={layer.hex}
                      strokeWidth={1.5}
                      opacity={0}
                    >
                      <animate attributeName="opacity" values="0.6;0" dur="1s" repeatCount="indefinite" />
                      <animate attributeName="width" values={`${nodeW + 6};${nodeW + 18}`} dur="1s" repeatCount="indefinite" />
                      <animate attributeName="height" values={`${NODE_H + 6};${NODE_H + 18}`} dur="1s" repeatCount="indefinite" />
                      <animate attributeName="x" values={`${pos.x - 3};${pos.x - 9}`} dur="1s" repeatCount="indefinite" />
                      <animate attributeName="y" values={`${pos.y - 5};${pos.y - 11}`} dur="1s" repeatCount="indefinite" />
                    </rect>
                  )}

                  {/* Label */}
                  <text
                    x={pos.x + 18}
                    y={isActive ? pos.y - 2 + NODE_H / 2 - 7 : pos.y + NODE_H / 2 - 7}
                    fontSize={11.5}
                    fontWeight="700"
                    fill={isActive ? layer.hex : dimmed ? "#94a3b8" : "#1e293b"}
                    fontFamily="Inter, sans-serif"
                    style={{ transition: "fill 0.25s" }}
                  >
                    {layer.label}
                  </text>
                  <text
                    x={pos.x + 18}
                    y={isActive ? pos.y - 2 + NODE_H / 2 + 10 : pos.y + NODE_H / 2 + 10}
                    fontSize={9.5}
                    fill={isActive ? layer.hex : dimmed ? "#cbd5e1" : "#64748b"}
                    opacity={isActive ? 0.75 : 1}
                    fontFamily="Inter, sans-serif"
                    style={{ transition: "fill 0.25s" }}
                  >
                    {layer.sublabel}
                  </text>
                </g>
              );
            })}

            {/* Auth node — static side card at bottom right */}
            <g
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered("auth-note")}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                x={AI_X}
                y={AI_Y + NODE_H + NODE_GAP}
                width={NODE_W * 0.72}
                height={NODE_H * 0.85}
                rx={10}
                fill={hovered === "auth-note" ? "#f8fafc" : "#f8fafc"}
                stroke={hovered === "auth-note" ? "#475569" : "#e2e8f0"}
                strokeWidth={hovered === "auth-note" ? 2 : 1}
                strokeDasharray="5 3"
                style={{ transition: "stroke 0.25s" }}
              />
              <rect x={AI_X} y={AI_Y + NODE_H + NODE_GAP} width={4} height={NODE_H * 0.85} rx={2} fill="#475569" />
              <text x={AI_X + 18} y={AI_Y + NODE_H + NODE_GAP + NODE_H * 0.85 / 2 - 6} fontSize={11} fontWeight="700" fill="#334155" fontFamily="Inter, sans-serif">Auth & Roles</text>
              <text x={AI_X + 18} y={AI_Y + NODE_H + NODE_GAP + NODE_H * 0.85 / 2 + 9} fontSize={9} fill="#64748b" fontFamily="Inter, sans-serif">OAuth · JWT · RBAC · 4 tiers</text>
            </g>

            {/* "Cross-cutting" label for Auth */}
            <text
              x={AI_X + NODE_W * 0.72 / 2}
              y={AI_Y + NODE_H + NODE_GAP - 6}
              fontSize={8}
              fill="#94a3b8"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
            >
              cross-cutting concern
            </text>
          </svg>
        </div>

        {/* Info panel */}
        <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-4">
          <div
            className="rounded-2xl border-2 p-5 transition-all duration-300"
            style={{
              borderColor: activeLayer.hex,
              backgroundColor: activeLayer.lightHex,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="h-2.5 w-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: activeLayer.hex }}
              />
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: activeLayer.hex }}
              >
                Active Layer
              </span>
            </div>
            <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2">
              {activeLayer.label}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {activeLayer.tooltip}
            </p>
            {activeLayer.downstream.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Sends data to
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeLayer.downstream.map((d) => {
                    const dl = LAYERS.find((l) => l.id === d)!;
                    return (
                      <span
                        key={d}
                        className="text-xs font-medium px-2.5 py-1 rounded-full border"
                        style={{
                          backgroundColor: dl.lightHex,
                          borderColor: dl.hex,
                          color: dl.hex,
                          borderWidth: 1,
                          opacity: 0.9,
                        }}
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
                className="text-xs font-medium px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5"
                style={{
                  backgroundColor: activeLayer.lightHex,
                  borderColor: activeLayer.hex,
                  color: activeLayer.hex,
                  borderWidth: 1,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ backgroundColor: activeLayer.hex }} />
                Terminal layer — data is persisted here
              </div>
            )}
          </div>

          {/* Hint */}
          <p className="text-xs text-slate-400 text-center mt-3 leading-relaxed">
            Hover any layer to trace the data flow.
            <br />Auto-playing when idle.
          </p>

          {/* Layer pills for quick navigation */}
          <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
            {LAYERS.map((l) => (
              <button
                key={l.id}
                onMouseEnter={() => setHovered(l.id)}
                onMouseLeave={() => setHovered(null)}
                className="text-xs px-2.5 py-1 rounded-full border font-medium transition-all"
                style={{
                  backgroundColor: activeId === l.id ? l.lightHex : "white",
                  borderColor: activeId === l.id ? l.hex : "#e2e8f0",
                  color: activeId === l.id ? l.hex : "#64748b",
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
