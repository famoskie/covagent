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
import { ArrowRight, Building2, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

function RiskBadge({ rating }: { rating: string }) {
  if (rating === "Low") return <span className="badge-low">Low</span>;
  if (rating === "Medium") return <span className="badge-medium">Medium</span>;
  if (rating === "High") return <span className="badge-high">High</span>;
  if (rating === "Watch") return <span className="badge-watch">Watch</span>;
  return <span className="badge-medium">{rating}</span>;
}

export default function Borrowers() {
  const { user } = useAuth();
  const userRole = (user as { role?: string })?.role ?? "rm";
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    riskRating: "Medium" as "Low" | "Medium" | "High" | "Watch",
    contactName: "",
    contactEmail: "",
  });

  const { data: borrowers, isLoading, refetch } = trpc.borrowers.list.useQuery();
  const createBorrower = trpc.borrowers.create.useMutation({
    onSuccess: () => {
      toast.success("Borrower created.");
      setAddOpen(false);
      setForm({ name: "", industry: "", riskRating: "Medium", contactName: "", contactEmail: "" });
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = borrowers?.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.industry ?? "").toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Borrowers</h1>
          <p className="text-sm text-muted-foreground mt-1">All commercial borrowers in the portfolio</p>
        </div>
        {(userRole === "analyst" || userRole === "admin") && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Borrower
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Add New Borrower</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Company Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="bg-input border-border"
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Industry</Label>
                  <Input
                    value={form.industry}
                    onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                    className="bg-input border-border"
                    placeholder="Manufacturing"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Risk Rating</Label>
                  <Select
                    value={form.riskRating}
                    onValueChange={(v) => setForm((f) => ({ ...f, riskRating: v as typeof f.riskRating }))}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Low", "Medium", "High", "Watch"].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Contact Name</Label>
                    <Input
                      value={form.contactName}
                      onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Contact Email</Label>
                    <Input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                      className="bg-input border-border"
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  disabled={createBorrower.isPending || !form.name}
                  onClick={() => createBorrower.mutate(form)}
                >
                  {createBorrower.isPending ? "Creating…" : "Create Borrower"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search borrowers…"
          className="pl-9 bg-card border-border"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Building2 className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {search ? "No borrowers match your search" : "No borrowers yet"}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Industry</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Risk Rating</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Contact</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-border/50 hover:bg-accent/30 cursor-pointer transition-colors"
                  onClick={() => setLocation(`/borrowers/${b.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">{b.industry ?? "—"}</td>
                  <td className="px-4 py-3.5"><RiskBadge rating={b.riskRating} /></td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    {b.contactName ? (
                      <div>
                        <div>{b.contactName}</div>
                        {b.contactEmail && <div className="text-muted-foreground/70">{b.contactEmail}</div>}
                      </div>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <ArrowRight className="h-4 w-4 text-muted-foreground inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
