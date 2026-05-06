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
export type ModeENUM = 'code' | 'terminal';
export type Token = { text: string; color: string };
export type ApiSkillPayload = Omit<SkillData, 'fileName'> & {
  fileName?: string;
  file_name?: string;
};
export type ApiSkill = ApiSkillPayload;

const TERMINAL_LINE_KINDS = ['command', 'output', 'comment', 'blank'] as const satisfies readonly TerminalLine['kind'][];

function hasTerminalLineKind(kind: string): kind is TerminalLine['kind'] {
  return TERMINAL_LINE_KINDS.includes(kind as TerminalLine['kind']);
}

export function getApiSkillFileName(skill: ApiSkillPayload): string | undefined {
  return skill.fileName ?? skill.file_name;
}

export function normalizeApiSkill(skill: ApiSkillPayload): ApiSkillPayload {
  return { ...skill, fileName: getApiSkillFileName(skill) };
}

export function isCodeSkill(skill: ApiSkillPayload): skill is ApiSkillPayload & { fileName: string; mode: 'code'; code: string[] } {
  return skill.mode === 'code' && typeof skill.fileName === 'string' && Array.isArray(skill.code);
}

export function isTerminalSkill(
  skill: ApiSkillPayload,
): skill is ApiSkillPayload & { fileName: string; mode: 'terminal'; commands: SkillCommandData[] } {
  return skill.mode === 'terminal' && typeof skill.fileName === 'string' && Array.isArray(skill.commands);
}

export function toTerminalLines(commands: SkillCommandData[]): TerminalLine[] {
  return commands
    .filter((command): command is SkillCommandData & { kind: TerminalLine['kind'] } => hasTerminalLineKind(command.kind))
    .map((command) => ({ kind: command.kind, text: command.text }));
}
