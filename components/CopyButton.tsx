"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  /** false のとき履歴には残さない（履歴パネルからの再コピー用） */
  recordHistory?: boolean;
};

export const iconButtonClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm transition";

function CopyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const TOOLTIP_GAP = 8;
const VIEW_PADDING = 8;
/** 実測前の概算（日本語の説明文幅） */
const TOOLTIP_WIDTH = 260;
const TOOLTIP_HEIGHT = 32;

export function CopyButton({
  command,
  label,
  recordHistory = true,
}: CopyButtonProps) {
  const { recordCopy } = useCopyHistory();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePos = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 下に十分な余白がなければ上に出す
    const placeBelow = rect.bottom + TOOLTIP_GAP + TOOLTIP_HEIGHT <= vh - VIEW_PADDING;
    const top = placeBelow
      ? rect.bottom + TOOLTIP_GAP
      : rect.top - TOOLTIP_GAP - TOOLTIP_HEIGHT;

    // 中央寄せしつつ画面内に収める
    let left = rect.left + rect.width / 2;
    const half = TOOLTIP_WIDTH / 2;
    left = Math.min(Math.max(left, VIEW_PADDING + half), vw - VIEW_PADDING - half);

    setPos({ top, left });
  }, []);

  const handleCopy = useCallback(async () => {
    const trimmed = command.trim();
    if (!trimmed) return;

    setOpen(false);

    await copyToClipboard(trimmed);
    if (recordHistory) {
      recordCopy(trimmed, label);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [command, label, recordCopy, recordHistory]);

  const tooltip = copied
    ? "クリップボードにコピーしました"
    : "コマンドをクリップボードにコピー";

  useEffect(() => {
    if (!open) return;
    updatePos();
    const onScrollOrResize = () => updatePos();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePos]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleCopy}
        onMouseEnter={() => {
          updatePos();
          setOpen(true);
        }}
        onMouseLeave={() => setOpen(false)}
        className={`${iconButtonClass} ${
          copied
            ? "border-success/40 text-success"
            : "text-muted hover:border-accent/40 hover:text-foreground"
        }`}
        aria-label={tooltip}
        aria-describedby={open ? tooltipId : undefined}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
      {mounted &&
        open &&
        createPortal(
          <span
            id={tooltipId}
            role="tooltip"
            className="pointer-events-none fixed z-[100] -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground shadow-lg"
            style={{ top: pos.top, left: pos.left }}
          >
            {tooltip}
          </span>,
          document.body
        )}
    </>
  );
}

export { copyToClipboard };
