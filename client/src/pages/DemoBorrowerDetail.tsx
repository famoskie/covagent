import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  XCircle,
  Zap,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocation, useParams } from "wouter";

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

function formatCurrency(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "—";
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n);
}

const TREND_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f43f5e", "#a78bfa", "#fb923c"];

export default function DemoBorrowerDetail() {
  const params = useParams<{ id: string }>();
  const borrowerId = parseInt(params.id ?? "0");
  const [, setLocation] = useLocation();

  const { data, isLoading } = trpc.demo.borrowerDetail.useQuery({ id: borrowerId });
  const { data: historyData } = trpc.demo.borrowerHistory.useQuery({ id: borrowerId });

  const trendData = historyData
    ? (() => {
        const byDate: Record<string, Record<string, number>> = {};
        historyData.forEach((r) => {
          const dateKey = format(new Date(r.evaluatedAt), "MMM d");
          if (!byDate[dateKey]) byDate[dateKey] = {};
          if (r.calculatedValue !== null) {
            byDate[dateKey][r.covenantType] = parseFloat(r.calculatedValue as string);
          }
        });
        return Object.entries(byDate).map(([date, values]) => ({ date, ...values }));
      })()
    : [];

  const covenantTypes = Array.from(new Set(historyData?.map((r) => r.covenantType) ?? []));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Building2 className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">Borrower not found.</p>
      </div>
    );
  }

  const { borrower, loans, covenants, latestResults, alerts, submissions } = data;
  const primaryLoan = loans[0];
  const hasBreaches = latestResults.some((r) => r.status === "Breach");
  const hasWarnings = latestResults.some((r) => r.status === "Warning");
  const overallStatus = hasBreaches ? "Breach" : hasWarnings ? "Warning" : "Compliant";

  return (
    <div className="space-y-6">
      <button
        onClick={() => setLocation("/dashboard")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Portfolio
      </button>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{borrower.name}</h1>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-sm text-muted-foreground">{borrower.industry ?? "—"}</span>
                <RiskBadge rating={borrower.riskRating} />
                <StatusBadge status={overallStatus} />
              </div>
            </div>
          </div>
          {primaryLoan && (
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground font-mono">{formatCurrency(primaryLoan.facilityAmount)}</div>
              <div className="text-xs text-muted-foreground mt-1">{primaryLoan.facilityName}</div>
              <div className="text-xs text-muted-foreground">Matures {format(new Date(primaryLoan.maturityDate), "MMM d, yyyy")}</div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
          <div className="text-center">
            <div className="text-xl font-bold text-foreground font-mono">{covenants.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Active Covenants</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-rose-400 font-mono">{latestResults.filter((r) => r.status === "Breach").length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Breaches</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-foreground font-mono">{submissions.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Submissions</div>
          </div>
        </div>
      </div>

      {/* Try It Live nudge */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Want to see the AI pipeline run live?</p>
            <p className="text-xs text-muted-foreground mt-0.5">Submit a financial statement and watch the covenant engine evaluate it in real time.</p>
          </div>
        </div>
        <button
          onClick={() => setLocation("/demo/try")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all shrink-0 whitespace-nowrap"
        >
          <Zap className="h-3.5 w-3.5" />
          Try It Live
        </button>
      </div>

      <Tabs defaultValue="covenants">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="covenants">Covenants</TabsTrigger>
          <TabsTrigger value="history">Compliance History</TabsTrigger>
          <TabsTrigger value="trends">Trend Charts</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="covenants" className="mt-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm">Active Covenant Rules</h3>
            </div>
            {covenants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <FileText className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No covenant rules configured</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Covenant</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Rule</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Actual</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Frequency</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {covenants.map((c) => {
                    const result = latestResults.find((r) => r.covenantId === c.id);
                    const actual = result?.calculatedValue ? parseFloat(result.calculatedValue as string).toFixed(3) : "—";
                    return (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-accent/20">
                        <td className="px-5 py-3.5 font-medium text-foreground">{c.covenantType}</td>
                        <td className="px-4 py-3.5 font-mono text-sm text-muted-foreground">{c.operator} {parseFloat(c.thresholdValue as string).toFixed(2)}x</td>
                        <td className="px-4 py-3.5 text-right font-mono text-foreground">{actual}</td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">{c.reportingFrequency}</td>
                        <td className="px-4 py-3.5">{result ? <StatusBadge status={result.status} /> : <span className="text-xs text-muted-foreground">No data</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm">Compliance History</h3>
            </div>
            {!historyData?.length ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No evaluation history</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Date</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Covenant</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Actual</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Threshold</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.slice(0, 50).map((r) => (
                      <tr key={r.id} className="border-b border-border/50 hover:bg-accent/20">
                        <td className="px-5 py-3 text-xs text-muted-foreground">{format(new Date(r.evaluatedAt), "MMM d, yyyy HH:mm")}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{r.covenantType}</td>
                        <td className="px-4 py-3 text-right font-mono">{r.calculatedValue ? parseFloat(r.calculatedValue as string).toFixed(3) : "—"}</td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">{r.operator} {parseFloat(r.thresholdValue as string).toFixed(2)}</td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground text-sm mb-4">Ratio Trends Over Time</h3>
            {trendData.length < 2 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <FileText className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Need at least 2 submissions to show trends</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0.022 250)" />
                  <XAxis dataKey="date" tick={{ fill: "oklch(0.58 0.018 250)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "oklch(0.58 0.018 250)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "oklch(0.17 0.022 250)", border: "1px solid oklch(0.26 0.022 250)", borderRadius: "8px", color: "oklch(0.93 0.01 250)", fontSize: "12px" }} />
                  {covenantTypes.map((type, i) => (
                    <Line key={type} type="monotone" dataKey={type} stroke={TREND_COLORS[i % TREND_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm">Alerts for {borrower.name}</h3>
            </div>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-400/40" />
                <p className="text-sm text-muted-foreground">No alerts — all covenants compliant</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {alerts.map((a) => (
                  <div key={a.id} className="px-5 py-4 flex items-start gap-3">
                    {a.severity === "Breach" ? <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" /> : <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{a.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(a.createdAt), "MMM d, yyyy HH:mm")}</p>
                    </div>
                    {a.severity === "Breach" ? <span className="badge-breach shrink-0">Breach</span> : <span className="badge-warning shrink-0">Warning</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
