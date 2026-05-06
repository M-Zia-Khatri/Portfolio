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
export type ApiCodeSkill = SkillData & { mode: 'code'; code: string[]; commands: null };
export type ApiTerminalSkill = SkillData & { mode: 'terminal'; code: null; commands: SkillCommandData[] };
export type ApiSkill = ApiCodeSkill | ApiTerminalSkill;
export type ModeENUM = ApiSkill['mode'];
export type Token = { text: string; color: string };

const terminalKinds = ['command', 'output', 'comment', 'blank'] as const satisfies readonly TerminalLine['kind'][];

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function isTerminalLineKind(kind: string): kind is TerminalLine['kind'] {
  return terminalKinds.includes(kind as TerminalLine['kind']);
}

export function isCodeSkill(skill: SkillData): skill is ApiCodeSkill {
  return skill.mode === 'code' && isStringArray(skill.code) && skill.commands === null;
}

export function isTerminalSkill(skill: SkillData): skill is ApiTerminalSkill {
  return skill.mode === 'terminal' && skill.code === null && Array.isArray(skill.commands);
}

export function toTerminalLines(commands: SkillCommandData[]): TerminalLine[] {
  return commands.map((command) => ({ kind: isTerminalLineKind(command.kind) ? command.kind : 'blank', text: command.text }));
}
