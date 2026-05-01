// ─── Terminal line union (mirrors the client-side type) ───────────────────────
export type TerminalLine =
  | { kind: 'command'; text: string }
  | { kind: 'output'; text: string }
  | { kind: 'comment'; text: string }
  | { kind: 'blank' };

// ─── DB row shape (snake_case, raw from Prisma) ───────────────────────────────
export interface SkillRow {
  id: string;
  name: string;
  icon: string;
  file_name: string;
  lang: string;
  color: string;
  mode: 'code' | 'terminal';
  code: string[] | null;
  commands: TerminalLine[] | null;
  created_at: Date;
  updated_at: Date;
}

// ─── API response shape (lowerCamelCase) ─────────────────────────────────────
export interface SkillResponse {
  id: string;
  name: string;
  icon: string;
  fileName: string;
  lang: string;
  color: string;
  mode: 'code' | 'terminal';
  code: string[] | null;
  commands: TerminalLine[] | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────
export function toSkillResponse(row: SkillRow): SkillResponse {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    fileName: row.file_name,
    lang: row.lang,
    color: row.color,
    mode: row.mode,
    code: row.code as string[] | null,
    commands: row.commands,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}
