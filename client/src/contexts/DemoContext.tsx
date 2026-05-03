import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const DEMO_KEY = "covagent_demo_mode";

type DemoContextValue = {
  isDemoMode: boolean;
  enterDemo: () => void;
  exitDemo: () => void;
};

const DemoContext = createContext<DemoContextValue>({
  isDemoMode: false,
  enterDemo: () => {},
  exitDemo: () => {},
});

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    try {
      return sessionStorage.getItem(DEMO_KEY) === "true";
    } catch {
      return false;
    }
  });

  const enterDemo = () => {
    try { sessionStorage.setItem(DEMO_KEY, "true"); } catch {}
    setIsDemoMode(true);
  };

  const exitDemo = () => {
    try { sessionStorage.removeItem(DEMO_KEY); } catch {}
    setIsDemoMode(false);
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, enterDemo, exitDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}
