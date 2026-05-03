import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
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

export default function BorrowerDetail() {
  const params = useParams<{ id: string }>();
  const borrowerId = parseInt(params.id ?? "0");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const userRole = (user as { role?: string })?.role ?? "rm";

  const { data, isLoading, refetch } = trpc.borrowers.detail.useQuery({ id: borrowerId });
  const { data: historyData } = trpc.borrowers.history.useQuery({ id: borrowerId });
  const generateNarrative = trpc.portfolio.generateNarrative.useMutation();

  const [narrative, setNarrative] = useState<string | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [addCovenantOpen, setAddCovenantOpen] = useState(false);

  const createCovenant = trpc.covenants.create.useMutation({
    onSuccess: () => {
      toast.success("Covenant rule added.");
      setAddCovenantOpen(false);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const [covenantForm, setCovenantForm] = useState({
    covenantType: "DSCR" as const,
    operator: ">=" as const,
    thresholdValue: "",
    reportingFrequency: "Quarterly" as const,
    description: "",
    loanId: 0,
  });

  const handleGenerateNarrative = async () => {
    setNarrativeLoading(true);
    try {
      const result = await generateNarrative.mutateAsync({ borrowerId });
      setNarrative(typeof result.narrative === 'string' ? result.narrative : String(result.narrative));
    } catch {
      toast.error("Failed to generate narrative.");
    } finally {
      setNarrativeLoading(false);
    }
  };

  // Build trend chart data from history
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

  const TREND_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f43f5e", "#a78bfa", "#fb923c"];

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
        <Button variant="outline" onClick={() => setLocation("/borrowers")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Borrowers
        </Button>
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
      {/* Back nav */}
      <button
        onClick={() => setLocation("/borrowers")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Borrowers
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
              <div className="text-2xl font-bold text-foreground font-mono">
                {formatCurrency(primaryLoan.facilityAmount)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{primaryLoan.facilityName}</div>
              <div className="text-xs text-muted-foreground">
                Matures {format(new Date(primaryLoan.maturityDate), "MMM d, yyyy")}
              </div>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
          <div className="text-center">
            <div className="text-xl font-bold text-foreground font-mono">{covenants.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Active Covenants</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-rose-400 font-mono">
              {latestResults.filter((r) => r.status === "Breach").length}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Breaches</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-foreground font-mono">{submissions.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Submissions</div>
          </div>
        </div>
      </div>

      {/* AI Narrative */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground text-sm">AI Covenant Narrative</h2>
            <span className="text-xs text-muted-foreground">— for Relationship Managers</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateNarrative}
            disabled={narrativeLoading}
            className="text-xs"
          >
            {narrativeLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border border-primary border-t-transparent animate-spin" />
                Generating…
              </span>
            ) : (
              "Generate Summary"
            )}
          </Button>
        </div>
        <div className="p-5">
          {narrative ? (
            <p className="text-sm text-foreground leading-relaxed">{narrative}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Click "Generate Summary" to produce a plain-language risk narrative for this borrower.
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="covenants">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="covenants">Covenants</TabsTrigger>
          <TabsTrigger value="history">Compliance History</TabsTrigger>
          <TabsTrigger value="trends">Trend Charts</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        {/* Covenants Tab */}
        <TabsContent value="covenants" className="mt-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm">Active Covenant Rules</h3>
              {userRole === "admin" && (
                <Dialog open={addCovenantOpen} onOpenChange={setAddCovenantOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="text-xs gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Add Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>Add Covenant Rule</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Loan</Label>
                        <Select
                          value={String(covenantForm.loanId || "")}
                          onValueChange={(v) => setCovenantForm((f) => ({ ...f, loanId: parseInt(v) }))}
                        >
                          <SelectTrigger className="bg-input border-border">
                            <SelectValue placeholder="Select loan" />
                          </SelectTrigger>
                          <SelectContent>
                            {loans.map((l) => (
                              <SelectItem key={l.id} value={String(l.id)}>{l.facilityName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Covenant Type</Label>
                        <Select
                          value={covenantForm.covenantType}
                          onValueChange={(v) => setCovenantForm((f) => ({ ...f, covenantType: v as typeof f.covenantType }))}
                        >
                          <SelectTrigger className="bg-input border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["DSCR", "Leverage Ratio", "Current Ratio", "Interest Coverage", "Debt to EBITDA", "Minimum Liquidity"].map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Operator</Label>
                          <Select
                            value={covenantForm.operator}
                            onValueChange={(v) => setCovenantForm((f) => ({ ...f, operator: v as typeof f.operator }))}
                          >
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[">=", "<=", ">", "<", "="].map((op) => (
                                <SelectItem key={op} value={op}>{op}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Threshold</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={covenantForm.thresholdValue}
                            onChange={(e) => setCovenantForm((f) => ({ ...f, thresholdValue: e.target.value }))}
                            className="bg-input border-border"
                            placeholder="e.g. 1.25"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Reporting Frequency</Label>
                        <Select
                          value={covenantForm.reportingFrequency}
                          onValueChange={(v) => setCovenantForm((f) => ({ ...f, reportingFrequency: v as typeof f.reportingFrequency }))}
                        >
                          <SelectTrigger className="bg-input border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Monthly", "Quarterly", "Semi-Annual", "Annual"].map((f) => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Description (optional)</Label>
                        <Input
                          value={covenantForm.description}
                          onChange={(e) => setCovenantForm((f) => ({ ...f, description: e.target.value }))}
                          className="bg-input border-border"
                          placeholder="Brief description"
                        />
                      </div>
                      <Button
                        className="w-full"
                        disabled={createCovenant.isPending || !covenantForm.loanId || !covenantForm.thresholdValue}
                        onClick={() =>
                          createCovenant.mutate({
                            ...covenantForm,
                            borrowerId,
                          })
                        }
                      >
                        {createCovenant.isPending ? "Adding…" : "Add Covenant Rule"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
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
                    const actual = result?.calculatedValue
                      ? parseFloat(result.calculatedValue as string).toFixed(3)
                      : "—";
                    return (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-accent/20">
                        <td className="px-5 py-3.5 font-medium text-foreground">{c.covenantType}</td>
                        <td className="px-4 py-3.5 font-mono text-sm text-muted-foreground">
                          {c.operator} {parseFloat(c.thresholdValue as string).toFixed(2)}x
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-foreground">{actual}</td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">{c.reportingFrequency}</td>
                        <td className="px-4 py-3.5">
                          {result ? <StatusBadge status={result.status} /> : <span className="text-xs text-muted-foreground">No data</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
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
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          {format(new Date(r.evaluatedAt), "MMM d, yyyy HH:mm")}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{r.covenantType}</td>
                        <td className="px-4 py-3 text-right font-mono">
                          {r.calculatedValue ? parseFloat(r.calculatedValue as string).toFixed(3) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                          {r.operator} {parseFloat(r.thresholdValue as string).toFixed(2)}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Trends Tab */}
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.17 0.022 250)",
                      border: "1px solid oklch(0.26 0.022 250)",
                      borderRadius: "8px",
                      color: "oklch(0.93 0.01 250)",
                      fontSize: "12px",
                    }}
                  />
                  {covenantTypes.map((type, i) => (
                    <Line
                      key={type}
                      type="monotone"
                      dataKey={type}
                      stroke={TREND_COLORS[i % TREND_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
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
                    {a.severity === "Breach" ? (
                      <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{a.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(a.createdAt), "MMM d, yyyy HH:mm")}
                      </p>
                    </div>
                    {a.severity === "Breach" ? (
                      <span className="badge-breach shrink-0">Breach</span>
                    ) : (
                      <span className="badge-warning shrink-0">Warning</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="mt-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm">Financial Submissions</h3>
              {(userRole === "analyst" || userRole === "admin") && (
                <Button
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => setLocation(`/financials/submit?borrowerId=${borrowerId}`)}
                >
                  <Plus className="h-3.5 w-3.5" /> Submit Financials
                </Button>
              )}
            </div>
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <FileText className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No financial submissions yet</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Period</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Type</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">EBITDA</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Total Debt</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-accent/20">
                      <td className="px-5 py-3.5 font-medium text-foreground">{s.periodLabel}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">{s.statementType}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-foreground">{formatCurrency(s.ebitda)}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-foreground">{formatCurrency(s.totalDebt)}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {format(new Date(s.createdAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const TREND_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f43f5e", "#a78bfa", "#fb923c"];
