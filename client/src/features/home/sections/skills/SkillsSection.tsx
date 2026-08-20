import { Box, Flex, Spinner, Text } from "@radix-ui/themes";
import { memo, useRef } from "react";
import CodeEmptyState from "@/features/skills/components/CodeEmptyState";
import CodeCard from "@/shared/components/CodeCard";
import SecComponent from "@/shared/components/SecContainer";
import { TEXT } from "@/shared/constants/style.constants";
import { useGsapReveal } from "@/shared/hooks/gsap/useGsapReveal";
import { useGsapStagger } from "@/shared/hooks/gsap/useGsapStagger";
import { SkillsGrid } from "./components/SkillsGrid";
import { SkillsHeader } from "./components/SkillsHeader";
import { useSkillsSection } from "./hooks/useSkillsSection";

const PERSPECTIVE_STYLE = { perspective: 800 } as const;

function SkillsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  useGsapReveal(sectionRef, { y: 40, duration: 0.8, once: true });
  useGsapStagger(cardsRef, { y: 20, stagger: 0.1, duration: 0.5, once: true });
  const section = useSkillsSection();
  return (
    <SecComponent>
      <Box
        ref={sectionRef}
        className="mx-auto flex w-full max-w-xs flex-col items-center gap-8 sm:max-w-xl md:gap-12"
      >
        <SkillsHeader />
        <SkillsGrid
          cardsRef={cardsRef}
          skills={section.mappedSkills}
          activeName={section.resolvedSkill?.name}
          handlers={section.chipHandlers}
        />
        <div className="relative w-full" style={PERSPECTIVE_STYLE}>
          {section.isLoading ? (
            <Flex
              align="center"
              justify="center"
              className="min-h-[300px] rounded-xl border border-white/10"
            >
              <Spinner size="3" />
            </Flex>
          ) : section.isError ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              className="min-h-[300px] rounded-xl border border-white/10 p-4"
            >
              <CodeEmptyState />
              <Text size="2" color="red" className="text-center">
                Couldn&apos;t load skills right now.
              </Text>
            </Flex>
          ) : !section.resolvedSkill ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              className="min-h-[300px] rounded-xl border border-white/10 p-4"
            >
              <CodeEmptyState />
              <Text size="2" color="gray" className="text-center">
                No skills available yet.
              </Text>
            </Flex>
          ) : (
            <CodeCard
              isActive={section.isSectionActive}
              skill={section.resolvedSkill}
              openTabs={section.openTabs}
              onTabClick={section.handleTabClick}
              onTabClose={section.handleTabClose}
              codeProgress={section.codeProgress}
              terminalProgress={section.terminalProgress}
              onCodeProgressChange={section.handleCodeProgressChange}
              onTerminalProgressChange={section.handleTerminalProgressChange}
              codeContainerRef={codeRef}
            />
          )}
        </div>
      </Box>
    </SecComponent>
  );
}

export default memo(SkillsSection);
