/**
 * DemoLayout — sidebar layout for unauthenticated demo mode.
 * Mirrors DashboardLayout structure but skips auth checks.
 * Includes the persistent DemoBanner at the top.
 */
import DemoBanner from "@/components/DemoBanner";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  AlertTriangle,
  Brain,
  Building2,
  LayoutDashboard,
  LogIn,
  PanelLeft,
  Shield,
  Zap,
} from "lucide-react";
import { CSSProperties, useState } from "react";
import { useLocation } from "wouter";

const demoNavItems = [
  { icon: Zap, label: "Try It Live", path: "/demo/try", highlight: true },
  { icon: LayoutDashboard, label: "Portfolio", path: "/dashboard" },
  { icon: Building2, label: "Borrowers", path: "/demo/borrowers" },
  { icon: AlertTriangle, label: "Alerts", path: "/demo/alerts" },
  { icon: Brain, label: "How the AI Works", path: "/tech-stack" },
];

const SIDEBAR_WIDTH_KEY = "demo-sidebar-width";
const DEFAULT_WIDTH = 260;

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try { return parseInt(localStorage.getItem(SIDEBAR_WIDTH_KEY) ?? String(DEFAULT_WIDTH), 10); }
    catch { return DEFAULT_WIDTH; }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <DemoBanner />
      <div className="flex flex-1">
        <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
          <DemoLayoutContent setSidebarWidth={setSidebarWidth}>
            {children}
          </DemoLayoutContent>
        </SidebarProvider>
      </div>
    </div>
  );
}

function DemoLayoutContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (w: number) => void }) {
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const activeItem = demoNavItems.find((item) => item.path === location || (item.path !== "/dashboard" && location.startsWith(item.path)));

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="h-16 justify-center border-b border-sidebar-border">
          <div className="flex items-center gap-3 px-3 w-full">
            <button onClick={toggleSidebar} className="h-8 w-8 flex items-center justify-center hover:bg-sidebar-accent rounded-lg transition-colors focus:outline-none shrink-0" aria-label="Toggle navigation">
              <PanelLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            {!isCollapsed && (
              <div className="flex items-center gap-2 min-w-0">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <span className="font-bold tracking-tight text-foreground truncate">CovAgent</span>
                <span className="text-xs text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 shrink-0">Demo</span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-0 py-2">
          <SidebarMenu className="px-2">
            {demoNavItems.map((item) => {
              const isActive = location === item.path || (item.path !== "/dashboard" && location.startsWith(item.path));
              const isHighlight = (item as { highlight?: boolean }).highlight;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => setLocation(item.path)}
                    tooltip={item.label}
                    className={`h-10 transition-all font-normal ${
                      isHighlight && !isActive
                        ? "text-primary bg-primary/8 hover:bg-primary/15 border border-primary/20"
                        : ""
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : isHighlight ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={isHighlight && !isActive ? "font-semibold text-primary" : ""}>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        {/* Sign in + GitHub CTAs at bottom */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <a
            href={getLoginUrl()}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 bg-primary/10 hover:bg-primary/20 transition-colors text-primary text-sm font-medium ${isCollapsed ? "justify-center" : ""}`}
          >
            <LogIn className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Sign In for Full Access</span>}
          </a>
          {!isCollapsed && (
            <a
              href="https://github.com/oluwafemi-oso/covagent"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            >
              <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              <span>Agents are open source</span>
            </a>
          )}
        </div>
      </Sidebar>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b border-border h-14 items-center justify-between bg-card/95 px-4 backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9 rounded-lg" />
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">{activeItem?.label ?? "CovAgent"}</span>
                <span className="text-xs text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5">Demo</span>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 min-h-screen">{children}</main>
      </SidebarInset>
    </>
  );
}
