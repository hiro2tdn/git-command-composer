"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addCopyHistoryEntry,
  loadCopyHistory,
  saveCopyHistory,
  type CopyHistoryEntry,
} from "@/lib/copyHistory";

type CopyHistoryContextValue = {
  history: CopyHistoryEntry[];
  recordCopy: (command: string, label?: string) => void;
  clearHistory: () => void;
  removeEntry: (id: string) => void;
};

const CopyHistoryContext = createContext<CopyHistoryContextValue | null>(null);

export function CopyHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<CopyHistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHistory(loadCopyHistory());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveCopyHistory(history);
    }
  }, [history, hydrated]);

  const recordCopy = useCallback((command: string, label?: string) => {
    setHistory((prev) => addCopyHistoryEntry(prev, command, label));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const value = useMemo(
    () => ({ history, recordCopy, clearHistory, removeEntry }),
    [history, recordCopy, clearHistory, removeEntry]
  );

  return (
    <CopyHistoryContext.Provider value={value}>
      {children}
    </CopyHistoryContext.Provider>
  );
}

export function useCopyHistory() {
  const ctx = useContext(CopyHistoryContext);
  if (!ctx) {
    throw new Error("useCopyHistory must be used within CopyHistoryProvider");
  }
  return ctx;
}
