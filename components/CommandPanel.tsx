"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildCommand,
  createInitialState,
  type OptionState,
} from "@/lib/buildCommand";
import type { Goal } from "@/lib/goals";
import { CopyButton } from "./CopyButton";

type CommandPanelProps = {
  goal: Goal;
  onClose: () => void;
};

function shouldShowToggle(
  goal: Goal,
  toggleId: string,
  state: OptionState
): boolean {
  const toggle = goal.command.toggles?.find((t) => t.id === toggleId);
  if (!toggle) return false;
  if (toggle.requiresToggle && !state.toggles[toggle.requiresToggle])
    return false;
  if (
    toggle.requiresRadio &&
    state.radios[toggle.requiresRadio.group] !== toggle.requiresRadio.id
  )
    return false;
  if (
    toggle.excludeWhenRadio &&
    state.radios[toggle.excludeWhenRadio.group] === toggle.excludeWhenRadio.id
  )
    return false;
  return true;
}

function shouldShowText(
  goal: Goal,
  textId: string,
  state: OptionState
): boolean {
  const text = goal.command.texts?.find((t) => t.id === textId);
  if (!text) return false;
  if (text.requiresToggle && !state.toggles[text.requiresToggle]) return false;
  if (text.excludeWhenToggles?.some((id) => state.toggles[id])) return false;
  if (
    text.requiresRadio &&
    state.radios[text.requiresRadio.group] !== text.requiresRadio.id
  )
    return false;
  if (
    text.excludeWhenRadio &&
    state.radios[text.excludeWhenRadio.group] === text.excludeWhenRadio.id
  )
    return false;
  return true;
}

export function CommandPanel({ goal, onClose }: CommandPanelProps) {
  const [state, setState] = useState<OptionState>(() =>
    createInitialState(goal.command)
  );

  useEffect(() => {
    setState(createInitialState(goal.command));
  }, [goal]);

  const command = useMemo(
    () => buildCommand(goal.command, state),
    [goal.command, state]
  );

  const activeToggleCount = useMemo(
    () =>
      (goal.command.toggles ?? []).filter(
        (t) =>
          (state.toggles[t.id] ?? false) &&
          (!t.requiresToggle || state.toggles[t.requiresToggle]) &&
          (!t.requiresRadio ||
            state.radios[t.requiresRadio.group] === t.requiresRadio.id) &&
          (!t.excludeWhenRadio ||
            state.radios[t.excludeWhenRadio.group] !== t.excludeWhenRadio.id)
      ).length,
    [goal.command.toggles, state.toggles, state.radios]
  );

  const toggleHandler = (id: string, group?: string) => {
    setState((prev) => {
      const next = { ...prev.toggles, [id]: !prev.toggles[id] };
      if (group && next[id]) {
        goal.command.toggles?.forEach((t) => {
          if (t.group === group && t.id !== id) next[t.id] = false;
        });
      }
      return { ...prev, toggles: next };
    });
  };

  const radioHandler = (group: string, id: string) => {
    setState((prev) => ({
      ...prev,
      radios: { ...prev.radios, [group]: id },
    }));
  };

  const textHandler = (id: string, value: string) => {
    setState((prev) => ({
      ...prev,
      texts: { ...prev.texts, [id]: value },
    }));
  };

  const { toggles, radios, texts } = goal.command;
  const visibleToggles = toggles?.filter((t) =>
    shouldShowToggle(goal, t.id, state)
  );
  const visibleTexts = texts?.filter((t) => shouldShowText(goal, t.id, state));

  const hasOptions =
    (visibleToggles?.length ?? 0) > 0 ||
    (radios?.length ?? 0) > 0 ||
    (visibleTexts?.length ?? 0) > 0;

  return (
    <section
      className="animate-in overflow-hidden rounded-2xl border border-accent/30 bg-card shadow-2xl shadow-black/40"
      aria-live="polite"
    >
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl" aria-hidden>
                {goal.emoji}
              </span>
              <h2 className="text-xl font-bold text-foreground">
                {goal.title}
              </h2>
            </div>
            <p className="text-sm text-muted">{goal.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="操作の選択を解除"
            className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition hover:border-accent/30 hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="border-t border-border/60 bg-background/80 px-6 py-4">
          <div className="mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              完成したコマンド
            </p>
          </div>
            <div className="flex overflow-hidden rounded-lg border border-success/20 bg-card">
              <pre className="min-w-0 flex-1 overflow-x-auto px-4 py-3 font-mono text-sm text-success">
                <code>$ {command}</code>
              </pre>
              <div className="flex shrink-0 items-center border-l border-border/60 bg-background/50 px-2">
                <CopyButton command={command} label={goal.title} />
              </div>
            </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {goal.warning && (
          <div
            role="alert"
            className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            ⚠️ {goal.warning}
          </div>
        )}

        {!hasOptions && (
          <div className="rounded-xl border border-success/25 bg-success/5 px-4 py-4 text-sm text-foreground">
            <p className="font-medium text-success">そのまま使えます</p>
            <p className="mt-1 text-muted">
              この操作に追加オプションはありません。上のコマンドをそのままコピーしてください。
            </p>
          </div>
        )}

        {visibleToggles && visibleToggles.length > 0 && (
          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-semibold text-foreground">
              追加オプション
              <span className="ml-2 text-xs font-normal text-muted">
                （任意 · {activeToggleCount}/{visibleToggles.length} 選択中）
              </span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {visibleToggles.map((opt) => {
                const isOn = state.toggles[opt.id] ?? false;
                return (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 transition ${
                      isOn
                        ? opt.danger
                          ? "border-danger/40 bg-danger/10 ring-1 ring-danger/20"
                          : "border-accent/50 bg-accent/10 ring-1 ring-accent/20"
                        : "border-border bg-background hover:border-accent/30 hover:bg-surface/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={() => toggleHandler(opt.id, opt.group)}
                      className="sr-only"
                    />
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold transition ${
                        isOn
                          ? opt.danger
                            ? "border-danger bg-danger text-white"
                            : "border-accent bg-accent text-background"
                          : "border-border bg-card text-transparent"
                      }`}
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs text-accent">
                          {opt.flag}
                        </code>
                        <span className="text-sm font-medium text-foreground">
                          {opt.label}
                        </span>
                        {opt.defaultSelected && (
                          <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                            最初からオン
                          </span>
                        )}
                        {opt.danger && (
                          <span className="rounded bg-danger/20 px-1.5 py-0.5 text-[10px] font-bold text-danger">
                            注意
                          </span>
                        )}
                        {opt.group && (
                          <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-muted">
                            どれか1つ
                          </span>
                        )}
                      </span>
                      <span className="mt-1.5 block text-xs leading-relaxed text-muted">
                        {opt.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {radios && radios.length > 0 && (
          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-semibold text-foreground">
              動作モード
              <span className="ml-2 text-xs font-normal text-muted">
                （どれか1つ · 必須）
              </span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {radios.map((opt) => {
                const isSelected = state.radios[opt.group] === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 transition ${
                      isSelected
                        ? opt.danger
                          ? "border-danger/40 bg-danger/10 ring-1 ring-danger/20"
                          : "border-accent/50 bg-accent/10 ring-1 ring-accent/20"
                        : "border-border bg-background hover:border-accent/30 hover:bg-surface/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`radio-${goal.id}-${opt.group}`}
                      checked={isSelected}
                      onChange={() => radioHandler(opt.group, opt.id)}
                      className="sr-only"
                    />
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                        isSelected
                          ? opt.danger
                            ? "border-danger bg-danger"
                            : "border-accent bg-accent"
                          : "border-border bg-card"
                      }`}
                      aria-hidden
                    >
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-background" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs text-accent">
                          {opt.flag}
                        </code>
                        <span className="text-sm font-medium text-foreground">
                          {opt.label}
                        </span>
                        {opt.defaultSelected && (
                          <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                            おすすめ
                          </span>
                        )}
                        {opt.danger && (
                          <span className="rounded bg-danger/20 px-1.5 py-0.5 text-[10px] font-bold text-danger">
                            注意
                          </span>
                        )}
                      </span>
                      <span className="mt-1.5 block text-xs leading-relaxed text-muted">
                        {opt.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {visibleTexts && visibleTexts.length > 0 && (
          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-semibold text-foreground">
              入力する値
              <span className="ml-2 text-xs font-normal text-muted">
                （必要に応じて）
              </span>
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleTexts.map((opt) => {
                const hasValue = (state.texts[opt.id] ?? "").trim().length > 0;
                return (
                  <div
                    key={opt.id}
                    className={`rounded-xl border p-3.5 transition ${
                      hasValue
                        ? "border-accent/40 bg-accent/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <label className="block">
                      <span className="mb-1 flex flex-wrap items-center gap-2">
                        {opt.flag && (
                          <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs text-accent">
                            {opt.flag}
                          </code>
                        )}
                        <span className="text-sm font-medium text-foreground">
                          {opt.label}
                        </span>
                        {hasValue && (
                          <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-medium text-success">
                            入力済み
                          </span>
                        )}
                      </span>
                      <input
                        type="text"
                        value={state.texts[opt.id] ?? ""}
                        onChange={(e) => textHandler(opt.id, e.target.value)}
                        placeholder={opt.placeholder}
                        className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2.5 font-mono text-sm text-foreground outline-none transition placeholder:text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent/30"
                      />
                    </label>
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      {opt.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </fieldset>
        )}

      </div>
    </section>
  );
}
