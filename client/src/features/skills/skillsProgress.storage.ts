import type { ModeENUM } from "./types";

export const STORAGE_KEY = "skills-section-progress";

export interface CodeTypingProgress {
  skillName: string | null;
  fileIndex: number;
  lineIndex: number;
  charIndex: number;
  completed: boolean;
}

export interface TerminalTypingProgress {
  skillName: string | null;
  commandIndex: number;
  lineIndex: number;
  charIndex: number;
  completed: boolean;
}

export interface SkillsSectionProgress {
  activeMode: ModeENUM;
  activeSkillName: string | null;
  openTabNames: string[];
  code: CodeTypingProgress;
  terminal: TerminalTypingProgress;
}

const DEFAULT_CODE_PROGRESS: CodeTypingProgress = {
  skillName: null,
  fileIndex: 0,
  lineIndex: 0,
  charIndex: 0,
  completed: false,
};

const DEFAULT_TERMINAL_PROGRESS: TerminalTypingProgress = {
  skillName: null,
  commandIndex: 0,
  lineIndex: 0,
  charIndex: 0,
  completed: false,
};

export const DEFAULT_SKILLS_SECTION_PROGRESS: SkillsSectionProgress = {
  activeMode: "code",
  activeSkillName: null,
  openTabNames: [],
  code: DEFAULT_CODE_PROGRESS,
  terminal: DEFAULT_TERMINAL_PROGRESS,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNonNegativeInteger(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toBoolean(value: unknown): boolean {
  return value === true;
}

function normalizeCodeProgress(value: unknown): CodeTypingProgress {
  if (!isRecord(value)) return { ...DEFAULT_CODE_PROGRESS };

  return {
    skillName: toNullableString(value.skillName),
    fileIndex: toNonNegativeInteger(value.fileIndex),
    lineIndex: toNonNegativeInteger(value.lineIndex),
    charIndex: toNonNegativeInteger(value.charIndex),
    completed: toBoolean(value.completed),
  };
}

function normalizeTerminalProgress(value: unknown): TerminalTypingProgress {
  if (!isRecord(value)) return { ...DEFAULT_TERMINAL_PROGRESS };

  return {
    skillName: toNullableString(value.skillName),
    commandIndex: toNonNegativeInteger(value.commandIndex),
    lineIndex: toNonNegativeInteger(value.lineIndex),
    charIndex: toNonNegativeInteger(value.charIndex),
    completed: toBoolean(value.completed),
  };
}

function normalizeProgress(value: unknown): SkillsSectionProgress | null {
  if (!isRecord(value)) return null;

  const activeMode = value.activeMode === "terminal" ? "terminal" : "code";
  const openTabNames = Array.isArray(value.openTabNames)
    ? value.openTabNames.filter((tabName): tabName is string => typeof tabName === "string")
    : [];

  return {
    activeMode,
    activeSkillName: toNullableString(value.activeSkillName),
    openTabNames,
    code: normalizeCodeProgress(value.code),
    terminal: normalizeTerminalProgress(value.terminal),
  };
}

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readSkillsSectionProgress(): SkillsSectionProgress | null {
  const storage = getSessionStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeSkillsSectionProgress(progress: SkillsSectionProgress): void {
  const storage = getSessionStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota/private-mode failures; animations should still run.
  }
}

export function patchSkillsSectionProgress(
  patcher: (current: SkillsSectionProgress) => SkillsSectionProgress,
): SkillsSectionProgress {
  const current = readSkillsSectionProgress() ?? DEFAULT_SKILLS_SECTION_PROGRESS;
  const next = patcher({
    ...current,
    code: { ...current.code },
    terminal: { ...current.terminal },
    openTabNames: [...current.openTabNames],
  });
  writeSkillsSectionProgress(next);
  return next;
}
