"use client";

import { CopyButton, iconButtonClass } from "./CopyButton";
import { useCopyHistory } from "./CopyHistoryProvider";
import { formatCopiedAt } from "@/lib/copyHistory";

export function CopyHistoryPanel() {
  const { history, clearHistory, removeEntry } = useCopyHistory();

  if (history.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border px-6 py-8 text-center">
        <h3 className="mb-2 text-sm font-semibold text-foreground">
          コピー履歴
        </h3>
        <p className="text-sm text-muted">
          コマンドをコピーすると、ここに履歴が残ります
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">コピー履歴</h3>
          <p className="text-xs text-muted">{history.length} 件 · 最新順</p>
        </div>
        <button
          type="button"
          onClick={clearHistory}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition hover:border-danger/40 hover:text-danger"
        >
          すべて消去
        </button>
      </div>

      <ul className="max-h-80 divide-y divide-border overflow-y-auto">
        {history.map((entry) => (
          <li
            key={entry.id}
            className="flex items-start gap-3 px-5 py-3 transition hover:bg-background/50"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                {entry.label && (
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                    {entry.label}
                  </span>
                )}
                <time
                  className="text-[10px] text-muted"
                  dateTime={new Date(entry.copiedAt).toISOString()}
                >
                  {formatCopiedAt(entry.copiedAt)}
                </time>
              </div>
              <pre className="overflow-x-auto font-mono text-xs text-success">
                <code>{entry.command}</code>
              </pre>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <CopyButton
                command={entry.command}
                label={entry.label}
                recordHistory={false}
              />
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className={`${iconButtonClass} text-muted hover:border-danger/40 hover:text-danger`}
                aria-label="履歴から削除"
                title="削除"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
