export type SkillMode = 'code' | 'terminal';

export type TerminalLine =
  | { kind: 'command'; text: string }
  | { kind: 'output'; text: string }
  | { kind: 'comment'; text: string }
  | { kind: 'blank' };

export interface SkillRow {
  id: string;
  name: string;
  icon: string;
  file_name: string;
  lang: string;
  color: string;
  mode: SkillMode;
  code: string[] | null;
  commands: TerminalLine[] | null;
  created_at: Date;
  updated_at: Date;
}

export interface SkillResponse {
  id: string;
  name: string;
  icon: string;
  fileName: string;
  lang: string;
  color: string;
  mode: SkillMode;
  code: string[] | null;
  commands: TerminalLine[] | null;
  createdAt: string;
  updatedAt: string;
}

export function toSkillResponse(row: SkillRow): SkillResponse {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    fileName: row.file_name,
    lang: row.lang,
    color: row.color,
    mode: row.mode,
    code: row.code,
    commands: row.commands,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}
