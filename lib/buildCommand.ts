import type { CommandConfig } from "./goals";

export type OptionState = {
  toggles: Record<string, boolean>;
  radios: Record<string, string>;
  texts: Record<string, string>;
};

export function createInitialState(config: CommandConfig): OptionState {
  const toggles: Record<string, boolean> = {};
  const radios: Record<string, string> = {};
  const texts: Record<string, string> = {};

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

  return { toggles, radios, texts };
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

export function buildCommand(
  config: CommandConfig,
  state: OptionState
): string {
  const toggles = resolveExclusiveToggles(config, state.toggles);
  const parts: string[] = [config.base];

  config.toggles?.forEach((t) => {
    if (!toggleApplies(t, toggles, state.radios)) return;
    if (toggles[t.id]) {
      if (t.flag.includes(" ")) {
        parts.push(...t.flag.split(" "));
      } else {
        parts.push(t.flag);
      }
    }
  });

  config.radios?.forEach((r) => {
    if (state.radios[r.group] === r.id && r.flag) {
      parts.push(r.flag);
    }
  });

  config.texts?.forEach((t) => {
    if (!textApplies(t, toggles, state.radios)) return;

    const value = state.texts[t.id]?.trim();
    if (!value) return;

    appendTextParts(parts, t, value);
  });

  return parts.join(" ");
}

export function getSelectedOptionDescriptions(
  config: CommandConfig,
  state: OptionState
): { flag: string; label: string; description: string }[] {
  const toggles = resolveExclusiveToggles(config, state.toggles);
  const selected: { flag: string; label: string; description: string }[] = [];

  config.toggles?.forEach((t) => {
    if (!toggleApplies(t, toggles, state.radios)) return;
    if (toggles[t.id]) {
      selected.push({
        flag: t.flag,
        label: t.label,
        description: t.description,
      });
    }
  });

  config.radios?.forEach((r) => {
    if (state.radios[r.group] === r.id && r.flag) {
      selected.push({
        flag: r.flag,
        label: r.label,
        description: r.description,
      });
    }
  });

  config.texts?.forEach((t) => {
    if (!textApplies(t, toggles, state.radios)) return;

    const value = state.texts[t.id]?.trim();
    if (!value) return;

    const flag = t.flag
      ? `${t.flag} ${shellQuote(value)}`
      : value.trim().split(/\s+/).map(shellQuote).join(" ");
    selected.push({
      flag,
      label: t.label,
      description: t.description,
    });
  });

  return selected;
}
