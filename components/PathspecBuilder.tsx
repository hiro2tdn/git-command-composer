"use client";

import type { PathspecValue } from "@/lib/buildCommand";
import { buildPathspecArgs } from "@/lib/buildCommand";

type PathspecBuilderProps = {
  label: string;
  description: string;
  value: PathspecValue;
  excludeSuggestions?: string[];
  onChange: (value: PathspecValue) => void;
};

function PathList({
  title,
  paths,
  placeholder,
  onChangeAt,
  onRemoveAt,
  onAdd,
}: {
  title: string;
  paths: string[];
  placeholder: string;
  onChangeAt: (index: number, value: string) => void;
  onRemoveAt: (index: number) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">{title}</p>
      <div className="space-y-2">
        {paths.map((path, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={path}
              onChange={(e) => onChangeAt(index, e.target.value)}
              placeholder={placeholder}
              className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-foreground outline-none transition placeholder:text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent/30"
            />
            <button
              type="button"
              onClick={() => onRemoveAt(index)}
              aria-label="削除"
              className="shrink-0 rounded-lg border border-border px-2.5 text-sm text-muted transition hover:border-danger/40 hover:text-danger"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted transition hover:border-accent/40 hover:text-foreground"
      >
        + 追加
      </button>
    </div>
  );
}

export function PathspecBuilder({
  label,
  description,
  value,
  excludeSuggestions = [],
  onChange,
}: PathspecBuilderProps) {
  const preview = buildPathspecArgs(value).join(" ");
  const hasValue = preview.length > 0;

  const unusedSuggestions = excludeSuggestions.filter(
    (s) => !value.excludes.map((e) => e.trim()).includes(s)
  );

  return (
    <div
      className={`space-y-4 rounded-xl border p-3.5 transition sm:col-span-2 ${
        hasValue ? "border-accent/40 bg-accent/5" : "border-border bg-background"
      }`}
    >
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {hasValue && (
            <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-medium text-success">
              入力済み
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed text-muted">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PathList
          title="含める"
          paths={value.includes}
          placeholder="src/"
          onChangeAt={(index, next) => {
            const includes = [...value.includes];
            includes[index] = next;
            onChange({ ...value, includes });
          }}
          onRemoveAt={(index) => {
            onChange({
              ...value,
              includes: value.includes.filter((_, i) => i !== index),
            });
          }}
          onAdd={() => onChange({ ...value, includes: [...value.includes, ""] })}
        />

        <div className="space-y-2">
          <PathList
            title="除外する"
            paths={value.excludes}
            placeholder="package-lock.json"
            onChangeAt={(index, next) => {
              const excludes = [...value.excludes];
              excludes[index] = next;
              onChange({ ...value, excludes });
            }}
            onRemoveAt={(index) => {
              onChange({
                ...value,
                excludes: value.excludes.filter((_, i) => i !== index),
              });
            }}
            onAdd={() =>
              onChange({ ...value, excludes: [...value.excludes, ""] })
            }
          />
          {unusedSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {unusedSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...value,
                      excludes: [...value.excludes, suggestion],
                    })
                  }
                  className="rounded-md border border-border bg-card px-2 py-1 font-mono text-[11px] text-muted transition hover:border-accent/40 hover:text-foreground"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {hasValue && (
        <p className="rounded-lg border border-border/60 bg-card px-3 py-2 font-mono text-xs text-success">
          {preview}
        </p>
      )}
    </div>
  );
}
