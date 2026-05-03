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
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { AlertTriangle, BarChart3, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CovenantConfig() {
  const { user } = useAuth();
  const userRole = (user as { role?: string })?.role ?? "rm";

  const { data: covenants, isLoading, refetch } = trpc.covenants.listAll.useQuery();
  const { data: borrowers } = trpc.borrowers.list.useQuery();
  const { data: loans } = trpc.loans.list.useQuery();

  const deleteCovenant = trpc.covenants.delete.useMutation({
    onSuccess: () => { toast.success("Covenant removed."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [addOpen, setAddOpen] = useState(false);
  type CovenantItem = NonNullable<typeof covenants>[number];
  const [editItem, setEditItem] = useState<CovenantItem | null>(null);

  const createCovenant = trpc.covenants.create.useMutation({
    onSuccess: () => { toast.success("Covenant rule created."); setAddOpen(false); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const updateCovenant = trpc.covenants.update.useMutation({
    onSuccess: () => { toast.success("Covenant updated."); setEditItem(null); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({
    borrowerId: "",
    loanId: "",
    covenantType: "DSCR" as "DSCR" | "Leverage Ratio" | "Current Ratio" | "Interest Coverage" | "Debt to EBITDA" | "Minimum Liquidity",
    operator: ">=" as ">=" | "<=" | ">" | "<" | "=",
    thresholdValue: "",
    reportingFrequency: "Quarterly" as "Monthly" | "Quarterly" | "Semi-Annual" | "Annual",
    description: "",
  });

  const filteredLoans = loans?.filter((l) => !form.borrowerId || l.borrowerId === parseInt(form.borrowerId)) ?? [];

  if (userRole !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Lock className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-foreground font-medium">Admin Access Required</p>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Covenant configuration is restricted to platform administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Covenant Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">Define and manage covenant rules per loan facility</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Covenant Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create Covenant Rule</DialogTitle>
            </DialogHeader>
            <CovenantForm
              form={form}
              setForm={setForm}
              borrowers={borrowers ?? []}
              loans={filteredLoans}
              onSubmit={() => createCovenant.mutate({ ...form, borrowerId: parseInt(form.borrowerId), loanId: parseInt(form.loanId) })}
              isPending={createCovenant.isPending}
              submitLabel="Create Rule"
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : !covenants?.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No covenant rules configured</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Covenant Type</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Rule</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Borrower</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Loan</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Frequency</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {covenants.map((c) => {
                const borrower = borrowers?.find((b) => b.id === c.borrowerId);
                const loan = loans?.find((l) => l.id === c.loanId);
                return (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-accent/20">
                    <td className="px-5 py-3.5 font-medium text-foreground">{c.covenantType}</td>
                    <td className="px-4 py-3.5 font-mono text-sm text-muted-foreground">
                      {c.operator} {parseFloat(c.thresholdValue as string).toFixed(2)}x
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{borrower?.name ?? `#${c.borrowerId}`}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{loan?.facilityName ?? `#${c.loanId}`}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{c.reportingFrequency}</td>
                    <td className="px-4 py-3.5">
                      {c.isActive ? (
                        <span className="badge-compliant">Active</span>
                      ) : (
                        <span className="badge-medium">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {format(new Date(c.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditItem(c as any)}
                          className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Remove this covenant rule?")) {
                              deleteCovenant.mutate({ id: c.id });
                            }
                          }}
                          className="p-1.5 rounded hover:bg-rose-500/10 transition-colors text-muted-foreground hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={(o) => { if (!o) setEditItem(null); }}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Edit Covenant Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Operator</Label>
                  <Select
                    value={editItem.operator}
                    onValueChange={(v) => setEditItem((e: any) => ({ ...e, operator: v }))}
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
                    value={editItem.thresholdValue as string}
                    onChange={(e) => setEditItem((prev: any) => ({ ...prev, thresholdValue: e.target.value }))}
                    className="bg-input border-border"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Reporting Frequency</Label>
                <Select
                  value={editItem.reportingFrequency}
                  onValueChange={(v) => setEditItem((e: any) => ({ ...e, reportingFrequency: v }))}
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
              <Button
                className="w-full"
                disabled={updateCovenant.isPending}
                onClick={() =>
                  updateCovenant.mutate({
                    id: editItem.id,
                    operator: editItem.operator,
                    thresholdValue: String(editItem.thresholdValue),
                    reportingFrequency: editItem.reportingFrequency,
                  })
                }
              >
                {updateCovenant.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CovenantForm({
  form,
  setForm,
  borrowers,
  loans,
  onSubmit,
  isPending,
  submitLabel,
}: {
  form: any;
  setForm: any;
  borrowers: any[];
  loans: any[];
  onSubmit: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <div className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Borrower *</Label>
        <Select value={form.borrowerId} onValueChange={(v) => setForm((f: any) => ({ ...f, borrowerId: v, loanId: "" }))}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue placeholder="Select borrower" />
          </SelectTrigger>
          <SelectContent>
            {borrowers.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Loan *</Label>
        <Select value={form.loanId} onValueChange={(v) => setForm((f: any) => ({ ...f, loanId: v }))} disabled={!form.borrowerId}>
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
        <Label className="text-xs text-muted-foreground">Covenant Type *</Label>
        <Select value={form.covenantType} onValueChange={(v) => setForm((f: any) => ({ ...f, covenantType: v }))}>
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
          <Label className="text-xs text-muted-foreground">Operator *</Label>
          <Select value={form.operator} onValueChange={(v) => setForm((f: any) => ({ ...f, operator: v }))}>
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
          <Label className="text-xs text-muted-foreground">Threshold *</Label>
          <Input
            type="number"
            step="0.01"
            value={form.thresholdValue}
            onChange={(e) => setForm((f: any) => ({ ...f, thresholdValue: e.target.value }))}
            className="bg-input border-border"
            placeholder="1.25"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Reporting Frequency</Label>
        <Select value={form.reportingFrequency} onValueChange={(v) => setForm((f: any) => ({ ...f, reportingFrequency: v }))}>
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
      <Button
        className="w-full"
        disabled={isPending || !form.borrowerId || !form.loanId || !form.thresholdValue}
        onClick={onSubmit}
      >
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </div>
  );
}
