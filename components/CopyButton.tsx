"use client";

import { useCallback, useState } from "react";
import { useCopyHistory } from "./CopyHistoryProvider";

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

type CopyButtonProps = {
  command: string;
  label?: string;
  variant?: "default" | "icon";
};

export const iconButtonClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm transition";

export function CopyButton({
  command,
  label,
}: CopyButtonProps) {
  const { recordCopy } = useCopyHistory();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const trimmed = command.trim();
    if (!trimmed) return;

    await copyToClipboard(trimmed);
    recordCopy(trimmed, label);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [command, label, recordCopy]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`${iconButtonClass} text-muted hover:border-accent/40 hover:text-foreground`}
      aria-label="コマンドをコピー"
      title={copied ? "コピー済" : "コピー"}
    >
      {copied ? "✓" : "📋"}
    </button>
  );
}

export { copyToClipboard };
