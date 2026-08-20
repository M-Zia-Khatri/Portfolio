import type { Skill } from "@/features/skills/types";
import { SkillItem } from "./SkillItem";

export function SkillGroup({
  skills,
  activeName,
  handlers,
}: {
  skills: Skill[];
  activeName?: string;
  handlers: Record<string, () => void>;
}) {
  return skills.map((skill) => (
    <SkillItem
      key={skill.name}
      skill={skill}
      active={activeName === skill.name}
      onClick={handlers[skill.name]}
    />
  ));
}
