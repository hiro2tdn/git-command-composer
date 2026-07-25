"use client";

import { useEffect, useState } from "react";
import {
  categories,
  getGoalsByCategory,
  type CategoryId,
  type Goal,
} from "@/lib/goals";

type CommandTreeProps = {
  selectedGoalId: string | null;
  onSelectGoal: (goal: Goal) => void;
  className?: string;
};

export function CommandTree({
  selectedGoalId,
  onSelectGoal,
  className = "",
}: CommandTreeProps) {
  const [expanded, setExpanded] = useState<Set<CategoryId>>(
    () => new Set(categories.map((c) => c.id))
  );

  useEffect(() => {
    if (!selectedGoalId) return;
    const goal = categories
      .flatMap((c) => getGoalsByCategory(c.id))
      .find((g) => g.id === selectedGoalId);
    if (!goal) return;
    setExpanded((prev) => new Set(prev).add(goal.category));
  }, [selectedGoalId]);

  const toggleCategory = (categoryId: CategoryId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <nav
      aria-label="Git コマンド一覧"
      className={`flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card ${className}`}
    >
      <div className="shrink-0 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">コマンド一覧</h2>
        <p className="mt-0.5 text-xs text-muted">カテゴリを開いて選択</p>
      </div>

      <ul className="tree-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-1">
        {categories.map((category) => {
          const isOpen = expanded.has(category.id);
          const goals = getGoalsByCategory(category.id);
          const hasSelected = goals.some((g) => g.id === selectedGoalId);

          return (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                aria-expanded={isOpen}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-surface/60 ${
                  hasSelected ? "text-foreground" : "text-muted"
                }`}
              >
                <span
                  className="w-4 shrink-0 text-center font-mono text-xs text-muted"
                  aria-hidden
                >
                  {isOpen ? "▾" : "▸"}
                </span>
                <span aria-hidden>{category.emoji}</span>
                <span className="min-w-0 flex-1 font-medium text-foreground">
                  {category.label}
                </span>
                <span className="shrink-0 text-[10px] text-muted/70">
                  {goals.length}
                </span>
              </button>

              {isOpen && (
                <ul className="pb-1">
                  {goals.map((goal) => {
                    const isSelected = selectedGoalId === goal.id;
                    return (
                      <li key={goal.id}>
                        <button
                          type="button"
                          onClick={() => onSelectGoal(goal)}
                          aria-current={isSelected ? "true" : undefined}
                          className={`flex w-full items-center gap-2 border-l-2 py-2 pr-3 pl-7 text-left transition ${
                            isSelected
                              ? "border-accent bg-accent/10"
                              : "border-transparent hover:border-accent/30 hover:bg-surface/40"
                          }`}
                        >
                          <code
                            className={`shrink-0 font-mono text-xs ${
                              isSelected ? "text-accent" : "text-success/90"
                            }`}
                          >
                            {goal.command.base}
                          </code>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
