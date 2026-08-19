import type { ApiSkill, Skill } from "@/features/skills/types";
import { ICON_MAP } from "./iconMap";
import type { SkillFormValues } from "./skills.schema";

export type MappedSkill = Skill & { id: string };
type TerminalCommand = NonNullable<SkillFormValues["commands"]>[number];

export function toMappedSkill(s: ApiSkill): MappedSkill {
  const iconComponent = ICON_MAP[s.icon] ?? ICON_MAP.default;
  if (!ICON_MAP[s.icon]) {
    console.warn(`[Skills] No icon found for key "${s.icon}", using default.`);
  }
  return { ...s, iconComponent } as MappedSkill;
}

export function normalizeTerminalCommands(commands: SkillFormValues["commands"]): TerminalCommand[] {
  if (!commands) return [];

  return commands.flatMap<TerminalCommand>((cmd) => {
    if (cmd.kind !== "output") {
      return [cmd];
    }

    return (cmd.text ?? "")
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map(
        (line): TerminalCommand => ({
          kind: "output",
          text: line,
        }),
      );
  });
}
