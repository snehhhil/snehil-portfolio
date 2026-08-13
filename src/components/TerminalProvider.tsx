"use client";

import { createContext, useContext, useMemo, useState } from "react";

type TerminalContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  isInitialized: boolean;
  setIsInitialized: (initialized: boolean) => void;
};

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      toggleOpen: () => setIsOpen((current) => !current),
      isInitialized,
      setIsInitialized,
    }),
    [isInitialized, isOpen]
  );

  return (
    <TerminalContext.Provider value={value}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error("useTerminal must be used within TerminalProvider");
  }
  return context;
}
