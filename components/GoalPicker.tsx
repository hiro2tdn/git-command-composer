"use client";

import { useEffect, useState } from "react";
import { getGoalById, type Goal } from "@/lib/goals";
import {
  loadSelectedGoalId,
  saveSelectedGoalId,
} from "@/lib/selectedGoal";
import { CommandPanel } from "./CommandPanel";
import { CommandTree } from "./CommandTree";

export function GoalPicker() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = loadSelectedGoalId();
    if (id) {
      setSelectedGoal(getGoalById(id) ?? null);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSelectedGoalId(selectedGoal?.id ?? null);
  }, [selectedGoal, hydrated]);

  return (
    <div className="lg:grid lg:min-h-[calc(100vh-12rem)] lg:grid-cols-[minmax(340px,420px)_1fr] lg:items-stretch lg:gap-6">
      <aside className="mb-6 flex min-h-0 flex-col lg:sticky lg:top-6 lg:mb-0 lg:max-h-[calc(100vh-8rem)]">
        <CommandTree
          className="min-h-[320px] flex-1 lg:min-h-0"
          selectedGoalId={selectedGoal?.id ?? null}
          onSelectGoal={setSelectedGoal}
        />
      </aside>

      <section className="min-w-0">
        {selectedGoal ? (
          <CommandPanel goal={selectedGoal} />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/30 px-6 py-16 text-center">
            <p className="font-mono text-sm text-accent">git …</p>
            <p className="mt-3 text-sm text-muted">
              左の一覧からコマンドを選んでください
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
