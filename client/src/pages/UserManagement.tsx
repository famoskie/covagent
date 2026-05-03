import { useAuth } from "@/_core/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Lock, Users } from "lucide-react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  admin: "Admin",
  analyst: "Credit Analyst",
  rm: "Relationship Manager",
  user: "User",
};

export default function UserManagement() {
  const { user } = useAuth();
  const userRole = (user as { role?: string })?.role ?? "rm";

  const { data: users, isLoading, refetch } = trpc.portfolio.listUsers.useQuery(undefined, {
    enabled: userRole === "admin",
  });

  const updateRole = trpc.portfolio.updateUserRole.useMutation({
    onSuccess: () => { toast.success("Role updated."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  if (userRole !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Lock className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-foreground font-medium">Admin Access Required</p>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          User management is restricted to platform administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Assign roles to control platform access. Role boundaries are strictly enforced.
        </p>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { role: "analyst", label: "Credit Analyst", desc: "Can submit financial statements and create borrowers/loans." },
          { role: "rm", label: "Relationship Manager", desc: "Read-only access to portfolio, borrower views, and AI narratives." },
          { role: "admin", label: "Admin", desc: "Full access including covenant configuration and user management." },
        ].map((r) => (
          <div key={r.role} className="bg-card border border-border rounded-xl p-4">
            <div className="font-semibold text-foreground text-sm mb-1">{r.label}</div>
            <p className="text-xs text-muted-foreground">{r.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : !users?.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No users found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">User</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Last Sign In</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-accent/20">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-foreground">{u.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">ID: {u.id}</div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{u.email ?? "—"}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    {format(new Date(u.lastSignedIn), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3.5">
                    <Select
                      value={u.role}
                      onValueChange={(v) => {
                        if (v !== u.role) {
                          updateRole.mutate({ userId: u.id, role: v as "user" | "admin" | "analyst" | "rm" });
                        }
                      }}
                    >
                      <SelectTrigger className="bg-input border-border w-44 h-8 text-xs">
                        <SelectValue>{roleLabels[u.role] ?? u.role}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rm">Relationship Manager</SelectItem>
                        <SelectItem value="analyst">Credit Analyst</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User (no access)</SelectItem>
                      </SelectContent>
                    </Select>
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
