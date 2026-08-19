import SkillChip from "@/features/skills/components/SkillChip";
import type { Skill } from "@/features/skills/types";

export function SkillItem({ skill, active, onClick }: { skill: Skill; active: boolean; onClick: () => void }) {
  return (
    <div>
      <SkillChip skill={skill} active={active} onClick={onClick} />
    </div>
  );
}
