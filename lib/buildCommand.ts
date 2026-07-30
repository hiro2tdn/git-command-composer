import type { CommandConfig, PathspecOption } from "./goals";

export type PathspecValue = {
  includes: string[];
  excludes: string[];
};

export type OptionState = {
  toggles: Record<string, boolean>;
  radios: Record<string, string>;
  texts: Record<string, string>;
  pathspecs: Record<string, PathspecValue>;
};

export function createInitialState(config: CommandConfig): OptionState {
  const toggles: Record<string, boolean> = {};
  const radios: Record<string, string> = {};
  const texts: Record<string, string> = {};
  const pathspecs: Record<string, PathspecValue> = {};

  config.toggles?.forEach((t) => {
    toggles[t.id] = t.defaultSelected ?? false;
  });

  const radioGroups = new Map<string, string>();
  config.radios?.forEach((r) => {
    if (r.defaultSelected && !radioGroups.has(r.group)) {
      radioGroups.set(r.group, r.id);
    }
  });
  config.radios?.forEach((r) => {
    if (!radios[r.group] && radioGroups.has(r.group)) {
      radios[r.group] = radioGroups.get(r.group)!;
    }
  });
  config.radios?.forEach((r) => {
    if (!radios[r.group]) {
      radios[r.group] = r.id;
    }
  });

  config.texts?.forEach((t) => {
    texts[t.id] = t.defaultValue ?? "";
  });

  config.pathspecs?.forEach((p) => {
    pathspecs[p.id] = { includes: [], excludes: [] };
  });

  return { toggles, radios, texts, pathspecs };
}

function resolveExclusiveToggles(
  config: CommandConfig,
  toggles: Record<string, boolean>
): Record<string, boolean> {
  const result = { ...toggles };
  const groups = new Map<string, string[]>();

  config.toggles?.forEach((t) => {
    if (t.group) {
      const ids = groups.get(t.group) ?? [];
      ids.push(t.id);
      groups.set(t.group, ids);
    }
  });

  groups.forEach((ids) => {
    const selected = ids.filter((id) => result[id]);
    if (selected.length > 1) {
      const keep = selected[selected.length - 1];
      ids.forEach((id) => {
        if (id !== keep) result[id] = false;
      });
    }
  });

  return result;
}

function toggleApplies(
  t: NonNullable<CommandConfig["toggles"]>[number],
  toggles: Record<string, boolean>,
  radios: Record<string, string>
): boolean {
  if (t.requiresToggle && !toggles[t.requiresToggle]) return false;
  if (t.requiresRadio && radios[t.requiresRadio.group] !== t.requiresRadio.id)
    return false;
  if (
    t.excludeWhenRadio &&
    radios[t.excludeWhenRadio.group] === t.excludeWhenRadio.id
  )
    return false;
  return true;
}

function textApplies(
  t: NonNullable<CommandConfig["texts"]>[number],
  toggles: Record<string, boolean>,
  radios: Record<string, string>
): boolean {
  if (t.requiresToggle && !toggles[t.requiresToggle]) return false;
  if (t.excludeWhenToggles?.some((id) => toggles[id])) return false;
  if (t.requiresRadio && radios[t.requiresRadio.group] !== t.requiresRadio.id)
    return false;
  if (
    t.excludeWhenRadio &&
    radios[t.excludeWhenRadio.group] === t.excludeWhenRadio.id
  )
    return false;
  return true;
}

/** Shell-safe: quote when spaces, ~, or metacharacters would break copy-paste execution. */
export function shellQuote(value: string): string {
  if (/^[A-Za-z0-9_./:@^,-]+$/.test(value)) {
    return value;
  }
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function appendTextParts(
  parts: string[],
  t: NonNullable<CommandConfig["texts"]>[number],
  value: string
): void {
  if (t.flag) {
    parts.push(t.flag, shellQuote(value));
    return;
  }
  if (t.suffix) {
    parts.push(...value.trim().split(/\s+/).map(shellQuote));
  }
}

function resolveCombineSeparator(
  combineWith: NonNullable<
    NonNullable<CommandConfig["texts"]>[number]["combineWith"]
  >,
  radios: Record<string, string>
): string {
  if (combineWith.separatorRadio) {
    const { group, threeDotId } = combineWith.separatorRadio;
    return radios[group] === threeDotId ? "..." : "..";
  }
  return combineWith.separator;
}

function appendTextOption(
  parts: string[],
  t: NonNullable<CommandConfig["texts"]>[number],
  value: string,
  state: OptionState
): void {
  if (t.combineWith) {
    const partner = state.texts[t.combineWith.id]?.trim();
    if (partner) {
      const separator = resolveCombineSeparator(t.combineWith, state.radios);
      parts.push(shellQuote(`${value}${separator}${partner}`));
      return;
    }
  }
  appendTextParts(parts, t, value);
}

function pathspecApplies(
  p: PathspecOption,
  radios: Record<string, string>
): boolean {
  if (p.requiresRadio && radios[p.requiresRadio.group] !== p.requiresRadio.id)
    return false;
  if (
    p.excludeWhenRadio &&
    radios[p.excludeWhenRadio.group] === p.excludeWhenRadio.id
  )
    return false;
  return true;
}

/** Build `-- include... :(exclude)x` pathspec args. */
export function buildPathspecArgs(value: PathspecValue): string[] {
  const includes = value.includes.map((s) => s.trim()).filter(Boolean);
  const excludes = value.excludes.map((s) => s.trim()).filter(Boolean);
  if (includes.length === 0 && excludes.length === 0) return [];

  const parts: string[] = ["--"];
  if (includes.length === 0) {
    parts.push(".");
  } else {
    parts.push(...includes.map(shellQuote));
  }
  excludes.forEach((path) => {
    parts.push(shellQuote(`:(exclude)${path}`));
  });
  return parts;
}

function appendToggleFlag(
  parts: string[],
  flag: string
): void {
  if (flag.includes(" ")) {
    parts.push(...flag.split(" "));
  } else {
    parts.push(flag);
  }
}

export function buildCommand(
  config: CommandConfig,
  state: OptionState
): string {
  const toggles = resolveExclusiveToggles(config, state.toggles);
  const baseParts = config.base.split(" ");
  const parts: string[] = [baseParts[0] ?? config.base];

  config.toggles?.forEach((t) => {
    if (!t.global) return;
    if (t.controlOnly) return;
    if (!toggleApplies(t, toggles, state.radios)) return;
    if (toggles[t.id]) appendToggleFlag(parts, t.flag);
  });

  const rest = baseParts.slice(1).join(" ");
  if (rest) parts.push(rest);

  config.toggles?.forEach((t) => {
    if (t.global) return;
    if (t.controlOnly) return;
    if (!toggleApplies(t, toggles, state.radios)) return;
    if (toggles[t.id]) appendToggleFlag(parts, t.flag);
  });

  config.radios?.forEach((r) => {
    if (r.controlOnly) return;
    if (state.radios[r.group] === r.id && r.flag) {
      parts.push(r.flag);
    }
  });

  config.texts?.forEach((t) => {
    if (!textApplies(t, toggles, state.radios)) return;

    let value = state.texts[t.id]?.trim() ?? "";

    if (!value && t.combineWith?.emptyFallback) {
      const partner = state.texts[t.combineWith.id]?.trim();
      if (partner) value = t.combineWith.emptyFallback;
    }

    if (!value) return;

    const combinedBy = config.texts?.find((x) => x.combineWith?.id === t.id);
    if (combinedBy) {
      const partnerVal = state.texts[combinedBy.id]?.trim()
        || combinedBy.combineWith?.emptyFallback;
      if (partnerVal && value) return;
    }

    appendTextOption(parts, t, value, state);
  });

  config.pathspecs?.forEach((p) => {
    if (!pathspecApplies(p, state.radios)) return;
    const value = state.pathspecs[p.id];
    if (!value) return;
    parts.push(...buildPathspecArgs(value));
  });

  return parts.join(" ");
}
