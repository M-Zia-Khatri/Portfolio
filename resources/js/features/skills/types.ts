import type { SkillCommandData, SkillData } from '@/types/generated';
import type { ComponentType } from 'react';

export type TerminalLine = {
  kind: 'command' | 'output' | 'comment' | 'blank';
  text?: string | null;
};

interface SkillBase {
  id?: number;
  name: string;
  icon?: string;
  iconComponent: ComponentType<{ size?: number; className?: string }>;
  fileName: string;
  lang: string;
  color: string;
}

interface CodeSkill extends SkillBase {
  mode: 'code';
  code: string[];
  commands?: never;
}

interface TerminalSkill extends SkillBase {
  mode: 'terminal';
  commands: TerminalLine[];
  code?: never;
}

export type Skill = CodeSkill | TerminalSkill;
export type ModeENUM = Skill['mode'];
export type Token = { text: string; color: string };
export type ApiSkillPayload = Omit<SkillData, 'fileName' | 'mode'> & {
  fileName?: string;
  file_name?: string;
  mode: string;
};
export type ApiSkill = ApiSkillPayload;
export type UnknownSkillPayload = Partial<Omit<SkillData, 'fileName' | 'mode'>> & {
  fileName?: unknown;
  file_name?: unknown;
  mode?: unknown;
};

const TERMINAL_LINE_KINDS = ['command', 'output', 'comment', 'blank'] as const satisfies readonly TerminalLine['kind'][];

function isTerminalLineKind(kind: string): kind is TerminalLine['kind'] {
  return TERMINAL_LINE_KINDS.includes(kind as TerminalLine['kind']);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((line) => typeof line === 'string');
}

function isSkillCommandDataArray(value: unknown): value is SkillCommandData[] {
  return (
    Array.isArray(value) && value.every((command) => typeof command?.kind === 'string' && (typeof command.text === 'string' || command.text === null))
  );
}

export function getApiSkillFileName(skill: UnknownSkillPayload): string | undefined {
  const fileName = skill.fileName ?? skill.file_name;

  return typeof fileName === 'string' ? fileName : undefined;
}

export function isApiSkillPayload(skill: unknown): skill is ApiSkillPayload {
  if (!isRecord(skill)) {
    return false;
  }

  return (
    typeof skill.id === 'number' &&
    typeof skill.name === 'string' &&
    typeof skill.icon === 'string' &&
    typeof skill.lang === 'string' &&
    typeof skill.color === 'string' &&
    typeof skill.mode === 'string' &&
    (Array.isArray(skill.code) || skill.code === null || skill.code === undefined) &&
    (Array.isArray(skill.commands) || skill.commands === null || skill.commands === undefined) &&
    typeof getApiSkillFileName(skill) === 'string'
  );
}

export function normalizeApiSkill(skill: ApiSkillPayload): ApiSkillPayload {
  return { ...skill, fileName: getApiSkillFileName(skill) };
}

export function normalizeApiSkillList(skills: unknown): ApiSkillPayload[] {
  if (Array.isArray(skills)) {
    return skills.filter(isApiSkillPayload).map(normalizeApiSkill);
  }

  if (isRecord(skills)) {
    return Object.values(skills).filter(isApiSkillPayload).map(normalizeApiSkill);
  }

  return [];
}

export function hasRequiredSkillFields(skill: ApiSkillPayload): skill is ApiSkillPayload & {
  name: string;
  fileName: string;
  lang: string;
  color: string;
} {
  return isNonEmptyString(skill.name) && isNonEmptyString(skill.fileName) && isNonEmptyString(skill.lang) && isNonEmptyString(skill.color);
}

export function isCodeSkill(skill: ApiSkillPayload): skill is ApiSkillPayload & { fileName: string; mode: 'code'; code: string[] } {
  return skill.mode === 'code' && hasRequiredSkillFields(skill) && isStringArray(skill.code);
}

export function isTerminalSkill(
  skill: ApiSkillPayload,
): skill is ApiSkillPayload & { fileName: string; mode: 'terminal'; commands: SkillCommandData[] } {
  return skill.mode === 'terminal' && hasRequiredSkillFields(skill) && isSkillCommandDataArray(skill.commands);
}

export function toTerminalLines(commands: SkillCommandData[]): TerminalLine[] {
  return commands.map((command) => ({
    kind: isTerminalLineKind(command.kind) ? command.kind : 'blank',
    text: command.text,
  }));
}
