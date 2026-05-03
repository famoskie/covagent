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
  Building2,
  Code2,
  LayoutDashboard,
  LogIn,
  PanelLeft,
  Shield,
} from "lucide-react";
import { CSSProperties, useState } from "react";
import { useLocation } from "wouter";

const demoNavItems = [
  { icon: LayoutDashboard, label: "Portfolio", path: "/dashboard" },
  { icon: Building2, label: "Borrowers", path: "/demo/borrowers" },
  { icon: AlertTriangle, label: "Alerts", path: "/demo/alerts" },
  { icon: Code2, label: "How It's Built", path: "/tech-stack" },
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
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton isActive={isActive} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-10 transition-all font-normal">
                    <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        {/* Sign in CTA at bottom */}
        <div className="p-3 border-t border-sidebar-border">
          <a
            href={getLoginUrl()}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 bg-primary/10 hover:bg-primary/20 transition-colors text-primary text-sm font-medium ${isCollapsed ? "justify-center" : ""}`}
          >
            <LogIn className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Sign In for Full Access</span>}
          </a>
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
        <main className="flex-1 p-6 min-h-screen">{children}</main>
      </SidebarInset>
    </>
  );
}
