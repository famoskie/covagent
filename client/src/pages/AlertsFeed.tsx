import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCheck,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AlertsFeed() {
  const [, setLocation] = useLocation();
  const { data: alerts, isLoading, refetch } = trpc.alerts.list.useQuery({ limit: 200 });
  const markRead = trpc.alerts.markRead.useMutation({ onSuccess: () => refetch() });
  const markAllRead = trpc.alerts.markAllRead.useMutation({
    onSuccess: () => {
      toast.success("All alerts marked as read.");
      refetch();
    },
  });

  const breaches = alerts?.filter((a) => a.severity === "Breach") ?? [];
  const warnings = alerts?.filter((a) => a.severity === "Warning") ?? [];
  const unread = alerts?.filter((a) => !a.isRead) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Alerts & Breach Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time covenant breaches and near-breach warnings
          </p>
        </div>
        {unread.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Summary cards */}
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
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unread</span>
          </div>
          <div className="text-3xl font-bold text-blue-400 font-mono">{unread.length}</div>
        </div>
      </div>

      {/* Alert feed */}
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
          {/* Breaches first */}
          {breaches.length > 0 && (
            <div className="bg-card border border-rose-500/20 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-rose-500/20 bg-rose-500/5">
                <XCircle className="h-4 w-4 text-rose-400" />
                <h2 className="font-semibold text-rose-400 text-sm">Covenant Breaches</h2>
              </div>
              <div className="divide-y divide-border">
                {breaches.map((a) => (
                  <AlertRow
                    key={a.id}
                    alert={a}
                    onMarkRead={() => markRead.mutate({ id: a.id })}
                    onViewBorrower={() => setLocation(`/borrowers/${a.borrowerId}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-card border border-amber-500/20 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-amber-500/20 bg-amber-500/5">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h2 className="font-semibold text-amber-400 text-sm">Near-Breach Warnings</h2>
              </div>
              <div className="divide-y divide-border">
                {warnings.map((a) => (
                  <AlertRow
                    key={a.id}
                    alert={a}
                    onMarkRead={() => markRead.mutate({ id: a.id })}
                    onViewBorrower={() => setLocation(`/borrowers/${a.borrowerId}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type AlertItem = {
  id: number;
  severity: "Warning" | "Breach";
  message: string;
  covenantType: string;
  borrowerId: number;
  isRead: number;
  createdAt: Date;
};

function AlertRow({
  alert,
  onMarkRead,
  onViewBorrower,
}: {
  alert: AlertItem;
  onMarkRead: () => void;
  onViewBorrower: () => void;
}) {
  const isUnread = !alert.isRead;

  return (
    <div className={`px-5 py-4 flex items-start gap-4 transition-colors ${isUnread ? "bg-accent/10" : ""}`}>
      <div className="shrink-0 mt-0.5">
        {alert.severity === "Breach" ? (
          <XCircle className="h-5 w-5 text-rose-400" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm leading-relaxed ${isUnread ? "text-foreground font-medium" : "text-foreground/80"}`}>
            {alert.message}
          </p>
          {isUnread && (
            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-muted-foreground">
            {format(new Date(alert.createdAt), "MMM d, yyyy HH:mm")}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{alert.covenantType}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onViewBorrower}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          title="View borrower"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
        {isUnread && (
          <button
            onClick={onMarkRead}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title="Mark as read"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
