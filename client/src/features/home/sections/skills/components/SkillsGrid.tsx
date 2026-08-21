import type { RefObject } from "react";
import { memo } from "react";
import type { Skill } from "@/features/skills/types";
import { cn } from "@/shared/utils/cn";
import { SkillGroup } from "./SkillGroup";

export const SkillsGrid = memo(function SkillsGrid({
  cardsRef,
  skills,
  activeName,
  handlers,
}: {
  cardsRef: RefObject<HTMLDivElement | null>;
  skills: Skill[];
  activeName?: string;
  handlers: Record<string, () => void>;
}) {
  return (
    <div
      ref={cardsRef}
      className={cn("flex flex-wrap justify-center", "gap-2 md:gap-2.5 lg:gap-3 2xl:gap-4")}
    >
      <SkillGroup skills={skills} activeName={activeName} handlers={handlers} />
    </div>
  );
});
