import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { AlertTriangle, Bell, BellOff, ExternalLink, XCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function DemoAlerts() {
  const [, setLocation] = useLocation();
  const { data: alerts, isLoading } = trpc.demo.alerts.useQuery({ limit: 200 });

  const breaches = alerts?.filter((a) => a.severity === "Breach") ?? [];
  const warnings = alerts?.filter((a) => a.severity === "Warning") ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Alerts & Breach Feed</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time covenant breaches and near-breach warnings</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-card border border-rose-500/30 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
            <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-400" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:inline">Breaches</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-400 font-mono">{breaches.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5 sm:hidden">Breaches</div>
        </div>
        <div className="bg-card border border-amber-500/30 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:inline">Warnings</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">{warnings.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5 sm:hidden">Warnings</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
            <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:inline">Total</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-400 font-mono">{alerts?.length ?? 0}</div>
          <div className="text-xs text-muted-foreground mt-0.5 sm:hidden">Total</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : !alerts?.length ? (
        <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-16 gap-4">
          <BellOff className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-foreground font-medium">No alerts</p>
          <p className="text-sm text-muted-foreground">All covenants are currently compliant.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {breaches.length > 0 && (
            <div className="bg-card border border-rose-500/20 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-rose-500/20 bg-rose-500/5">
                <XCircle className="h-4 w-4 text-rose-400" />
                <h2 className="font-semibold text-rose-400 text-sm">Covenant Breaches</h2>
              </div>
              <div className="divide-y divide-border">
                {breaches.map((a) => (
                  <div key={a.id} className="px-4 sm:px-5 py-3 sm:py-4 flex items-start gap-3">
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-foreground font-medium leading-snug">{a.message}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">{format(new Date(a.createdAt), "MMM d, yyyy")}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{a.covenantType}</span>
                      </div>
                    </div>
                    <button onClick={() => setLocation(`/demo/borrowers/${a.borrowerId}`)} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground shrink-0" title="View borrower">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="bg-card border border-amber-500/20 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-amber-500/20 bg-amber-500/5">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h2 className="font-semibold text-amber-400 text-sm">Near-Breach Warnings</h2>
              </div>
              <div className="divide-y divide-border">
                {warnings.map((a) => (
                  <div key={a.id} className="px-4 sm:px-5 py-3 sm:py-4 flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-foreground leading-snug">{a.message}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">{format(new Date(a.createdAt), "MMM d, yyyy")}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{a.covenantType}</span>
                      </div>
                    </div>
                    <button onClick={() => setLocation(`/demo/borrowers/${a.borrowerId}`)} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground shrink-0" title="View borrower">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
