import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  RefreshCw,
  Shield,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
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

const CHART_COLORS = {
  Compliant: "#34d399",
  Warning: "#fbbf24",
  Breach: "#f43f5e",
};

export default function Portfolio() {
  const { data, isLoading, refetch } = trpc.portfolio.summary.useQuery();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const userRole = (user as { role?: string })?.role ?? "rm";
  const [resetting, setResetting] = useState(false);

  const resetDemo = trpc.demo.resetDemoData.useMutation({
    onSuccess: (result) => {
      toast.success(`Demo data reset — ${result.deleted} submission${result.deleted !== 1 ? "s" : ""} removed.`);
      refetch();
      setResetting(false);
    },
    onError: () => {
      toast.error("Failed to reset demo data.");
      setResetting(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading portfolio…</p>
        </div>
      </div>
    );
  }

  const summary = data;
  const chartData = summary
    ? [
        { name: "Compliant", value: summary.healthChart.compliant },
        { name: "Warning", value: summary.healthChart.warning },
        { name: "Breach", value: summary.healthChart.breach },
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
          {userRole === "admin" && (
            <button
              onClick={() => {
                if (confirm("Reset all demo submissions? This will remove demo data from the portfolio.")) {
                  setResetting(true);
                  resetDemo.mutate();
                }
              }}
              disabled={resetting || resetDemo.isPending}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 hover:bg-accent transition-colors disabled:opacity-50"
              title="Remove all demo-mode financial submissions"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resetting ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Reset Demo Data</span>
            </button>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>CCO Dashboard</span>
          </div>
        </div>
      </div>

      {/* Summary metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<FileText className="h-5 w-5 text-blue-400" />}
          label="Active Loans"
          value={summary?.totalLoans ?? 0}
          color="blue"
        />
        <MetricCard
          icon={<Shield className="h-5 w-5 text-indigo-400" />}
          label="Covenants Tracked"
          value={summary?.totalCovenants ?? 0}
          color="indigo"
        />
        <MetricCard
          icon={<AlertTriangle className="h-5 w-5 text-amber-400" />}
          label="Active Warnings"
          value={summary?.warnings ?? 0}
          color="amber"
        />
        <MetricCard
          icon={<XCircle className="h-5 w-5 text-rose-400" />}
          label="Active Breaches"
          value={summary?.activeBreaches ?? 0}
          color="rose"
          highlight={!!summary?.activeBreaches}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Borrower table */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground text-sm">Borrower Portfolio</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {summary?.borrowerStatuses?.length ?? 0} borrowers
            </span>
          </div>

          {!summary?.borrowerStatuses?.length ? (
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
                  {summary.borrowerStatuses.map((row) => (
                    <tr
                      key={row.borrower.id}
                      className="border-b border-border/50 hover:bg-accent/30 cursor-pointer transition-colors"
                      onClick={() => setLocation(`/borrowers/${row.borrower.id}`)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-foreground">{row.borrower.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {row.loans.length} loan{row.loans.length !== 1 ? "s" : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-xs">{row.borrower.industry ?? "—"}</td>
                      <td className="px-4 py-3.5"><RiskBadge rating={row.borrower.riskRating} /></td>
                      <td className="px-4 py-3.5 text-right font-mono text-foreground">{row.covenantCount}</td>
                      <td className="px-4 py-3.5 text-right font-mono">
                        <span className={row.breachCount > 0 ? "text-rose-400 font-semibold" : "text-muted-foreground"}>
                          {row.breachCount}
                        </span>
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={row.overallStatus} /></td>
                      <td className="px-4 py-3.5 text-right">
                        <ArrowRight className="h-4 w-4 text-muted-foreground inline-block" />
                      </td>
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
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CHART_COLORS[entry.name as keyof typeof CHART_COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.17 0.022 250)",
                      border: "1px solid oklch(0.26 0.022 250)",
                      borderRadius: "8px",
                      color: "oklch(0.93 0.01 250)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "oklch(0.58 0.018 250)", fontSize: "12px" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Stat breakdown */}
              <div className="mt-2 space-y-2">
                {[
                  { label: "Compliant", value: summary?.healthChart.compliant ?? 0, color: "text-emerald-400" },
                  { label: "Warning", value: summary?.healthChart.warning ?? 0, color: "text-amber-400" },
                  { label: "Breach", value: summary?.healthChart.breach ?? 0, color: "text-rose-400" },
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

function MetricCard({
  icon,
  label,
  value,
  color,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  highlight?: boolean;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 border-blue-500/20",
    indigo: "bg-indigo-500/10 border-indigo-500/20",
    amber: "bg-amber-500/10 border-amber-500/20",
    rose: "bg-rose-500/10 border-rose-500/20",
  };

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
