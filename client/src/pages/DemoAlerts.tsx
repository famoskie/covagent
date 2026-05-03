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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Alerts & Breach Feed</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time covenant breaches and near-breach warnings</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-rose-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-rose-400" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Breaches</span>
          </div>
          <div className="text-3xl font-bold text-rose-400 font-mono">{breaches.length}</div>
        </div>
        <div className="bg-card border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Warnings</span>
          </div>
          <div className="text-3xl font-bold text-amber-400 font-mono">{warnings.length}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</span>
          </div>
          <div className="text-3xl font-bold text-blue-400 font-mono">{alerts?.length ?? 0}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : !alerts?.length ? (
        <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-20 gap-4">
          <BellOff className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-foreground font-medium">No alerts</p>
          <p className="text-sm text-muted-foreground">All covenants are currently compliant.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {breaches.length > 0 && (
            <div className="bg-card border border-rose-500/20 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-rose-500/20 bg-rose-500/5">
                <XCircle className="h-4 w-4 text-rose-400" />
                <h2 className="font-semibold text-rose-400 text-sm">Covenant Breaches</h2>
              </div>
              <div className="divide-y divide-border">
                {breaches.map((a) => (
                  <div key={a.id} className="px-5 py-4 flex items-start gap-4">
                    <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium">{a.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">{format(new Date(a.createdAt), "MMM d, yyyy HH:mm")}</span>
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
              <div className="flex items-center gap-2 px-5 py-3 border-b border-amber-500/20 bg-amber-500/5">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h2 className="font-semibold text-amber-400 text-sm">Near-Breach Warnings</h2>
              </div>
              <div className="divide-y divide-border">
                {warnings.map((a) => (
                  <div key={a.id} className="px-5 py-4 flex items-start gap-4">
                    <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{a.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">{format(new Date(a.createdAt), "MMM d, yyyy HH:mm")}</span>
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
