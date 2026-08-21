import type { RefObject } from "react";
import type { Skill } from "@/features/skills/types";
import type { CodeCardHandle } from "@/shared/components/CodeCard";
import CodeCard from "@/shared/components/CodeCard";
import type { ContactCodeStatus } from "./ContactCodeHeader";

export function ContactCodeLine({
  activeSkill,
  cardStatus,
  codeCardRef,
  isActive,
  openTabs,
  onTabClick,
  onTypingComplete,
}: {
  activeSkill: Skill | null;
  cardStatus: ContactCodeStatus;
  codeCardRef: RefObject<CodeCardHandle | null>;
  isActive: boolean;
  openTabs: Skill[];
  onTabClick: (skill: Skill) => void;
  onTypingComplete?: () => void;
}) {
  return (
    <div data-contact-card className="relative" style={{ perspective: 800 }}>
      {activeSkill && (
        <CodeCard
          ref={codeCardRef}
          skill={activeSkill}
          openTabs={cardStatus !== "idle" ? openTabs : []}
          started={cardStatus !== "idle"}
          isActive={isActive && cardStatus !== "advancing"}
          onTabClick={onTabClick}
          onTabClose={() => undefined}
          onTypingComplete={onTypingComplete}
        />
      )}
    </div>
  );
}
