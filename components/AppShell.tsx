"use client";

import { CopyHistoryPanel } from "./CopyHistoryPanel";
import { CopyHistoryProvider } from "./CopyHistoryProvider";
import { GoalPicker } from "./GoalPicker";

export function AppShell() {
  return (
    <CopyHistoryProvider>
      <GoalPicker />
      <div className="mt-10">
        <CopyHistoryPanel />
      </div>
    </CopyHistoryProvider>
  );
}
