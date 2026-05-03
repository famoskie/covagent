/**
 * Demo Portfolio — uses publicProcedure demo.portfolioSummary
 * Identical layout to Portfolio.tsx but reads from the demo router.
 */
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Shield,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useLocation } from "wouter";

function StatusBadge({ status }: { status: string }) {
  if (status === "Compliant") return <span className="badge-compliant">Compliant</span>;
  if (status === "Warning") return <span className="badge-warning">Warning</span>;
  if (status === "Breach") return <span className="badge-breach">Breach</span>;
  return <span className="badge-medium">{status}</span>;
}

function RiskBadge({ rating }: { rating: string }) {
  if (rating === "Low") return <span className="badge-low">Low</span>;
  if (rating === "Medium") return <span className="badge-medium">Medium</span>;
  if (rating === "High") return <span className="badge-high">High</span>;
  if (rating === "Watch") return <span className="badge-watch">Watch</span>;
  return <span className="badge-medium">{rating}</span>;
}

const CHART_COLORS = { Compliant: "#34d399", Warning: "#fbbf24", Breach: "#f43f5e" };

export default function DemoPortfolio() {
  const { data, isLoading } = trpc.demo.portfolioSummary.useQuery();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const chartData = data
    ? [
        { name: "Compliant", value: data.healthChart.compliant },
        { name: "Warning", value: data.healthChart.warning },
        { name: "Breach", value: data.healthChart.breach },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Portfolio Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time covenant compliance across all active borrowers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Live Demo</span>
          </div>
        </div>
      </div>
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<FileText className="h-5 w-5 text-blue-400" />} label="Active Loans" value={data?.totalLoans ?? 0} color="blue" />
        <MetricCard icon={<Shield className="h-5 w-5 text-indigo-400" />} label="Covenants Tracked" value={data?.totalCovenants ?? 0} color="indigo" />
        <MetricCard icon={<AlertTriangle className="h-5 w-5 text-amber-400" />} label="Active Warnings" value={data?.warnings ?? 0} color="amber" />
        <MetricCard icon={<XCircle className="h-5 w-5 text-rose-400" />} label="Active Breaches" value={data?.activeBreaches ?? 0} color="rose" highlight={!!data?.activeBreaches} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Borrower table */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground text-sm">Borrower Portfolio</h2>
            </div>
            <span className="text-xs text-muted-foreground">{data?.borrowerStatuses?.length ?? 0} borrowers</span>
          </div>
          {!data?.borrowerStatuses?.length ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Building2 className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No borrowers yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Borrower</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Industry</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Risk</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Covenants</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Breaches</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {data.borrowerStatuses.map((row) => (
                    <tr
                      key={row.borrower.id}
                      className="border-b border-border/50 hover:bg-accent/30 cursor-pointer transition-colors"
                      onClick={() => setLocation(`/demo/borrowers/${row.borrower.id}`)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-foreground">{row.borrower.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{row.loans.length} loan{row.loans.length !== 1 ? "s" : ""}</div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-xs">{row.borrower.industry ?? "—"}</td>
                      <td className="px-4 py-3.5"><RiskBadge rating={row.borrower.riskRating} /></td>
                      <td className="px-4 py-3.5 text-right font-mono text-foreground">{row.covenantCount}</td>
                      <td className="px-4 py-3.5 text-right font-mono">
                        <span className={row.breachCount > 0 ? "text-rose-400 font-semibold" : "text-muted-foreground"}>{row.breachCount}</span>
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={row.overallStatus} /></td>
                      <td className="px-4 py-3.5 text-right"><ArrowRight className="h-4 w-4 text-muted-foreground inline-block" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Health chart */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground text-sm">Portfolio Health</h2>
          </div>
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-400/40" />
              <p className="text-sm text-muted-foreground">No covenant data yet</p>
            </div>
          ) : (
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={CHART_COLORS[entry.name as keyof typeof CHART_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "oklch(0.17 0.022 250)", border: "1px solid oklch(0.26 0.022 250)", borderRadius: "8px", color: "oklch(0.93 0.01 250)", fontSize: "12px" }} />
                  <Legend formatter={(value) => <span style={{ color: "oklch(0.58 0.018 250)", fontSize: "12px" }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-2">
                {[
                  { label: "Compliant", value: data?.healthChart.compliant ?? 0, color: "text-emerald-400" },
                  { label: "Warning", value: data?.healthChart.warning ?? 0, color: "text-amber-400" },
                  { label: "Breach", value: data?.healthChart.breach ?? 0, color: "text-rose-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={`font-semibold font-mono ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color, highlight }: { icon: React.ReactNode; label: string; value: number; color: string; highlight?: boolean }) {
  const colorMap: Record<string, string> = { blue: "bg-blue-500/10 border-blue-500/20", indigo: "bg-indigo-500/10 border-indigo-500/20", amber: "bg-amber-500/10 border-amber-500/20", rose: "bg-rose-500/10 border-rose-500/20" };
  return (
    <div className={`bg-card border rounded-xl p-5 ${highlight ? "border-rose-500/40 bg-rose-500/5" : "border-border"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorMap[color] ?? "bg-muted"}`}>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-foreground font-mono tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
