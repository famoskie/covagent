import { getLoginUrl } from "@/const";
import { useDemo } from "@/contexts/DemoContext";
import { Eye, LogIn, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function DemoBanner() {
  const { isDemoMode, exitDemo } = useDemo();
  const [dismissed, setDismissed] = useState(false);
  const [, setLocation] = useLocation();

  if (!isDemoMode || dismissed) return null;

  const handleExit = () => {
    exitDemo();
    setLocation("/");
  };

  return (
    <div className="sticky top-0 z-50 bg-primary/90 backdrop-blur text-primary-foreground text-sm px-4 py-2.5 flex items-center justify-between gap-4 shadow-lg">
      <div className="flex items-center gap-2.5 min-w-0">
        <Eye className="h-4 w-4 shrink-0" />
        <span className="font-medium">Demo Mode</span>
        <span className="text-primary-foreground/70 hidden sm:inline">
          — You're exploring CovAgent with sample data. All write actions are disabled.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={getLoginUrl()}
          className="flex items-center gap-1.5 bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-lg"
        >
          <LogIn className="h-3.5 w-3.5" />
          Sign In
        </a>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 hover:bg-primary-foreground/20 rounded-lg transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
