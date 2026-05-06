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
export type ApiSkill = SkillData;
export type ModeENUM = 'code' | 'terminal';
export type Token = { text: string; color: string };

export function isCodeSkill(skill: SkillData): skill is SkillData & { mode: 'code'; code: string[] } {
  return skill.mode === 'code' && Array.isArray(skill.code);
}

export function isTerminalSkill(skill: SkillData): skill is SkillData & { mode: 'terminal'; commands: SkillCommandData[] } {
  return skill.mode === 'terminal' && Array.isArray(skill.commands);
}

export function toTerminalLines(commands: SkillCommandData[]): TerminalLine[] {
  return commands
    .filter((command): command is SkillCommandData & { kind: TerminalLine['kind'] } =>
      ['command', 'output', 'comment', 'blank'].includes(command.kind),
    )
    .map((command) => ({ kind: command.kind, text: command.text }));
}
