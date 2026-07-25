export type CopyHistoryEntry = {
  id: string;
  command: string;
  label?: string;
  copiedAt: number;
};

const STORAGE_KEY = "git-command-composer-copy-history";
const LEGACY_STORAGE_KEY = "git-helper-copy-history";
const MAX_ENTRIES = 50;

export function loadCopyHistory(): CopyHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        localStorage.setItem(STORAGE_KEY, raw);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CopyHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCopyHistory(entries: CopyHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore quota errors
  }
}

export function addCopyHistoryEntry(
  entries: CopyHistoryEntry[],
  command: string,
  label?: string
): CopyHistoryEntry[] {
  const trimmed = command.trim();
  if (!trimmed) return entries;

  const now = Date.now();
  const withoutDuplicate = entries.filter((e) => e.command !== trimmed);
  const entry: CopyHistoryEntry = {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    command: trimmed,
    label,
    copiedAt: now,
  };

  return [entry, ...withoutDuplicate].slice(0, MAX_ENTRIES);
}

export function formatCopiedAt(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "たった今";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  return new Date(timestamp).toLocaleString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
