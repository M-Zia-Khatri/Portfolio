import type { ComponentType } from 'react';

// ─── Terminal ────────────────────────────────────────────────────────────────
export type TerminalLine =
  | { kind: 'command'; text: string }
  | { kind: 'output'; text: string }
  | { kind: 'comment'; text: string }
  | { kind: 'blank' };

// ─── Runtime Skill (used by all UI components) ────────────────────────────────
// `iconComponent` is the resolved React component — always set before passing to any component.
interface SkillBase {
  name: string;
  iconComponent: ComponentType<{ size?: number; className?: string }>;
  fileName: string;
  lang: string;
  color: string;
}

interface CodeSkill extends SkillBase {
  mode: 'code';
  code: string[];
}

interface TerminalSkill extends SkillBase {
  mode: 'terminal';
  commands: TerminalLine[];
}

export type Skill = CodeSkill | TerminalSkill;

// ─── API Skill (raw shape returned by the server) ────────────────────────────
// `icon` is a plain string key (e.g. "FaReact") that must be resolved via ICON_MAP
// before being passed to any component.
interface ApiSkillBase {
  id: string;
  name: string;
  icon: string;
  fileName: string;
  lang: string;
  color: string;
}

interface ApiCodeSkill extends ApiSkillBase {
  mode: 'code';
  code: string[];
}

interface ApiTerminalSkill extends ApiSkillBase {
  mode: 'terminal';
  commands: TerminalLine[];
}

export type ModeENUM = 'code' | 'terminal';

export type ApiSkill = ApiCodeSkill | ApiTerminalSkill;

export type Token = { text: string; color: string };
