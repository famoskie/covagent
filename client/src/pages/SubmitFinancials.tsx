import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ArrowLeft, CheckCircle2, FileText, TrendingDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation, useSearch } from "wouter";

type FormData = {
  borrowerId: string;
  loanId: string;
  periodLabel: string;
  periodEndDate: string;
  statementType: "Quarterly" | "Annual" | "Monthly";
  revenue: string;
  ebitda: string;
  ebit: string;
  interestExpense: string;
  netIncome: string;
  totalAssets: string;
  currentAssets: string;
  currentLiabilities: string;
  totalDebt: string;
  totalEquity: string;
  operatingCashFlow: string;
  debtServicePayments: string;
  notes: string;
};

type EvalResult = {
  submissionId: number;
  evaluationSummary: {
    results: Array<{ covenantId: number; status: string; calculatedValue: number | null }>;
    breachCount: number;
    warningCount: number;
  };
};

export default function SubmitFinancials() {
  const { user } = useAuth();
  const userRole = (user as { role?: string })?.role ?? "rm";
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const preselectedBorrowerId = params.get("borrowerId") ?? "";

  const [form, setForm] = useState<FormData>({
    borrowerId: preselectedBorrowerId,
    loanId: "",
    periodLabel: "",
    periodEndDate: "",
    statementType: "Quarterly",
    revenue: "",
    ebitda: "",
    ebit: "",
    interestExpense: "",
    netIncome: "",
    totalAssets: "",
    currentAssets: "",
    currentLiabilities: "",
    totalDebt: "",
    totalEquity: "",
    operatingCashFlow: "",
    debtServicePayments: "",
    notes: "",
  });

  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);

  const { data: borrowers } = trpc.borrowers.list.useQuery();
  const { data: loans } = trpc.loans.listByBorrower.useQuery(
    { borrowerId: parseInt(form.borrowerId) },
    { enabled: !!form.borrowerId }
  );

  const submitMutation = trpc.financials.submit.useMutation({
    onSuccess: (data) => {
      setEvalResult(data);
      toast.success("Financial statement submitted and evaluated.");
    },
    onError: (e) => toast.error(e.message),
  });

  const setField = (key: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.borrowerId || !form.loanId || !form.periodLabel || !form.periodEndDate) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitMutation.mutate({
      borrowerId: parseInt(form.borrowerId),
      loanId: parseInt(form.loanId),
      periodLabel: form.periodLabel,
      periodEndDate: form.periodEndDate,
      statementType: form.statementType,
      revenue: form.revenue || undefined,
      ebitda: form.ebitda || undefined,
      ebit: form.ebit || undefined,
      interestExpense: form.interestExpense || undefined,
      netIncome: form.netIncome || undefined,
      totalAssets: form.totalAssets || undefined,
      currentAssets: form.currentAssets || undefined,
      currentLiabilities: form.currentLiabilities || undefined,
      totalDebt: form.totalDebt || undefined,
      totalEquity: form.totalEquity || undefined,
      operatingCashFlow: form.operatingCashFlow || undefined,
      debtServicePayments: form.debtServicePayments || undefined,
      notes: form.notes || undefined,
    });
  };

  if (userRole !== "analyst" && userRole !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-400/60" />
        <p className="text-foreground font-medium">Access Restricted</p>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Only Credit Analysts and Admins can submit financial statements.
        </p>
        <Button variant="outline" onClick={() => setLocation("/")}>Back to Portfolio</Button>
      </div>
    );
  }

  // Show evaluation result
  if (evalResult) {
    const { evaluationSummary } = evalResult;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            {evaluationSummary.breachCount > 0 ? (
              <div className="h-16 w-16 rounded-full bg-rose-500/15 flex items-center justify-center">
                <TrendingDown className="h-8 w-8 text-rose-400" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-foreground">Evaluation Complete</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Submission #{evalResult.submissionId} has been processed and all covenants evaluated.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
            <div>
              <div className="text-2xl font-bold text-foreground font-mono">
                {evaluationSummary.results.length}
              </div>
              <div className="text-xs text-muted-foreground">Covenants Tested</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400 font-mono">
                {evaluationSummary.warningCount}
              </div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-400 font-mono">
                {evaluationSummary.breachCount}
              </div>
              <div className="text-xs text-muted-foreground">Breaches</div>
            </div>
          </div>

          {evaluationSummary.results.length > 0 && (
            <div className="mt-5 text-left space-y-2">
              {evaluationSummary.results.map((r) => (
                <div key={r.covenantId} className="flex items-center justify-between text-sm p-3 bg-secondary/50 rounded-lg">
                  <span className="text-muted-foreground">Covenant #{r.covenantId}</span>
                  <div className="flex items-center gap-3">
                    {r.calculatedValue !== null && (
                      <span className="font-mono text-foreground">{r.calculatedValue.toFixed(3)}</span>
                    )}
                    {r.status === "Compliant" && <span className="badge-compliant">Compliant</span>}
                    {r.status === "Warning" && <span className="badge-warning">Warning</span>}
                    {r.status === "Breach" && <span className="badge-breach">Breach</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setEvalResult(null);
                setForm({ ...form, periodLabel: "", periodEndDate: "", revenue: "", ebitda: "", ebit: "", interestExpense: "", netIncome: "", totalAssets: "", currentAssets: "", currentLiabilities: "", totalDebt: "", totalEquity: "", operatingCashFlow: "", debtServicePayments: "", notes: "" });
              }}
            >
              Submit Another
            </Button>
            <Button
              className="flex-1"
              onClick={() => setLocation(form.borrowerId ? `/borrowers/${form.borrowerId}` : "/")}
            >
              View Borrower
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Submit Financial Statement</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the borrower's periodic financials. Covenant evaluation runs automatically on submission.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Borrower & Period */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground text-sm">Borrower & Period</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Borrower *</Label>
              <Select value={form.borrowerId} onValueChange={(v) => { setField("borrowerId", v); setField("loanId", ""); }}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select borrower" />
                </SelectTrigger>
                <SelectContent>
                  {borrowers?.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Loan / Facility *</Label>
              <Select value={form.loanId} onValueChange={(v) => setField("loanId", v)} disabled={!form.borrowerId}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select loan" />
                </SelectTrigger>
                <SelectContent>
                  {loans?.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>{l.facilityName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Period Label * (e.g. Q3 2025)</Label>
              <Input value={form.periodLabel} onChange={(e) => setField("periodLabel", e.target.value)} className="bg-input border-border" placeholder="Q3 2025" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Period End Date *</Label>
              <Input type="date" value={form.periodEndDate} onChange={(e) => setField("periodEndDate", e.target.value)} className="bg-input border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Statement Type</Label>
              <Select value={form.statementType} onValueChange={(v) => setField("statementType", v as typeof form.statementType)}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Quarterly", "Annual", "Monthly"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Income Statement */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground text-sm">Income Statement</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { key: "revenue", label: "Revenue" },
              { key: "ebitda", label: "EBITDA" },
              { key: "ebit", label: "EBIT" },
              { key: "interestExpense", label: "Interest Expense" },
              { key: "netIncome", label: "Net Income" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form[key as keyof FormData]}
                  onChange={(e) => setField(key as keyof FormData, e.target.value)}
                  className="bg-input border-border font-mono"
                  placeholder="0.00"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Balance Sheet */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground text-sm">Balance Sheet</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { key: "totalAssets", label: "Total Assets" },
              { key: "currentAssets", label: "Current Assets" },
              { key: "currentLiabilities", label: "Current Liabilities" },
              { key: "totalDebt", label: "Total Debt" },
              { key: "totalEquity", label: "Total Equity" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form[key as keyof FormData]}
                  onChange={(e) => setField(key as keyof FormData, e.target.value)}
                  className="bg-input border-border font-mono"
                  placeholder="0.00"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Cash Flow */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground text-sm">Cash Flow</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "operatingCashFlow", label: "Operating Cash Flow" },
              { key: "debtServicePayments", label: "Debt Service Payments" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form[key as keyof FormData]}
                  onChange={(e) => setField(key as keyof FormData, e.target.value)}
                  className="bg-input border-border font-mono"
                  placeholder="0.00"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-foreground text-sm">Notes</h2>
          <Textarea
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            className="bg-input border-border resize-none"
            placeholder="Any additional context or notes…"
            rows={3}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              Submitting & Evaluating…
            </span>
          ) : (
            "Submit & Run Covenant Evaluation"
          )}
        </Button>
      </form>
    </div>
  );
}
