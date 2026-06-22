import { Box, Flex, Heading, Spinner, Text } from "@radix-ui/themes";
import type { RefObject } from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ICON_MAP } from "@/features/dashboard/pages/skills/iconMap";
import { useSkillsData } from "@/features/dashboard/pages/skills/useSkillActions";
import CodeEmptyState from "@/features/skills/components/CodeEmptyState";
import SkillChip from "@/features/skills/components/SkillChip";
import {
  type CodeTypingProgress,
  DEFAULT_SKILLS_SECTION_PROGRESS,
  patchSkillsSectionProgress,
  readSkillsSectionProgress,
  type SkillsSectionProgress,
  type TerminalTypingProgress,
} from "@/features/skills/skillsProgress.storage";
import type { ApiSkill, Skill } from "@/features/skills/types";
import CodeCard from "@/shared/components/CodeCard";
import SecComponent from "@/shared/components/SecContainer";
import { HEADING, TEXT } from "@/shared/constants/style.constants";
import { useGsapReveal } from "@/shared/hooks/gsap/useGsapReveal";
import { useGsapStagger } from "@/shared/hooks/gsap/useGsapStagger";
import { cn } from "@/shared/utils/cn";
import { useSectionActive } from "../hooks/useSectionActive";

const PERSPECTIVE_STYLE = { perspective: 800 } as const;

const SkillsHeading = memo(function SkillsHeading() {
  return (
    <div className="text-center gap-1 md:gap-1.5 lg:gap-2 xl:gap-2.5">
      <Heading as="h2" size={HEADING.h2.size} className="font-bold">
        Tech Stack
      </Heading>
      <Text size={TEXT.base.size} color="blue" className="opacity-75">
        select a skill to explore
      </Text>
    </div>
  );
});

const SkillChips = memo(function SkillChips({
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
      {skills.map((skill) => (
        <div key={skill.name}>
          <SkillChip
            skill={skill}
            active={activeName === skill.name}
            onClick={handlers[skill.name]}
          />
        </div>
      ))}
    </div>
  );
});

function SkillsSection() {
  const isSectionActive = useSectionActive("skills");
  const { data, isLoading, isError } = useSkillsData();

  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  useGsapReveal(sectionRef, { y: 40, duration: 0.8, once: true });
  useGsapStagger(cardsRef, { y: 20, stagger: 0.1, duration: 0.5, once: true });

  const mappedSkills = useMemo<Skill[]>(() => {
    const apiSkills: ApiSkill[] = data ?? [];
    return apiSkills.map((apiSkill) => {
      const iconComponent = ICON_MAP[apiSkill.icon] ?? ICON_MAP.default;
      return { ...apiSkill, iconComponent };
    });
  }, [data]);

  const [activeName, setActiveName] = useState<string | null>(null);
  const [openTabNames, setOpenTabNames] = useState<string[]>([]);
  const [restoredProgress, setRestoredProgress] = useState<SkillsSectionProgress | null>(null);

  useEffect(() => {
    setRestoredProgress(readSkillsSectionProgress());
  }, []);

  useEffect(() => {
    if (!restoredProgress || mappedSkills.length === 0) return;

    const validTabNames = restoredProgress.openTabNames.filter((tabName) =>
      mappedSkills.some((skill) => skill.name === tabName),
    );
    const activeSkillName =
      restoredProgress.activeSkillName &&
      mappedSkills.some((skill) => skill.name === restoredProgress.activeSkillName)
        ? restoredProgress.activeSkillName
        : validTabNames[0];

    if (validTabNames.length > 0) setOpenTabNames(validTabNames);
    if (activeSkillName) setActiveName(activeSkillName);
  }, [mappedSkills, restoredProgress]);

  const openTabs = useMemo<Skill[]>(() => {
    if (mappedSkills.length === 0) return [];
    const tabs = openTabNames
      .map((tabName) => mappedSkills.find((skill) => skill.name === tabName))
      .filter((skill): skill is Skill => Boolean(skill));
    return tabs.length > 0 ? tabs : [mappedSkills[0]];
  }, [mappedSkills, openTabNames]);

  const resolvedSkill = useMemo<Skill | null>(() => {
    if (mappedSkills.length === 0) return null;
    if (!activeName) return openTabs[0] ?? mappedSkills[0];
    return (
      mappedSkills.find((skill) => skill.name === activeName) ?? openTabs[0] ?? mappedSkills[0]
    );
  }, [activeName, mappedSkills, openTabs]);

  const persistSelection = useCallback((skill: Skill, nextOpenTabNames?: string[]) => {
    patchSkillsSectionProgress((current) => ({
      ...current,
      activeMode: skill.mode,
      activeSkillName: skill.name,
      openTabNames: nextOpenTabNames ?? current.openTabNames,
    }));
  }, []);

  const handleChipClick = useCallback((skill: Skill) => {
    setOpenTabNames((prev) => (prev.includes(skill.name) ? prev : [...prev, skill.name]));
    setActiveName(skill.name);
    const nextProgress = patchSkillsSectionProgress((current) => ({
      ...current,
      activeMode: skill.mode,
      activeSkillName: skill.name,
      openTabNames: current.openTabNames.includes(skill.name)
        ? current.openTabNames
        : [...current.openTabNames, skill.name],
    }));
    setRestoredProgress(nextProgress);
  }, []);

  const handleTabClick = useCallback(
    (skill: Skill) => {
      setActiveName(skill.name);
      persistSelection(skill);
      setRestoredProgress(readSkillsSectionProgress());
    },
    [persistSelection],
  );

  const handleTabClose = useCallback((skill: Skill) => {
    setOpenTabNames((prev) => {
      const next = prev.filter((name) => name !== skill.name);
      patchSkillsSectionProgress((current) => ({
        ...current,
        activeSkillName:
          current.activeSkillName === skill.name ? (next[0] ?? null) : current.activeSkillName,
        openTabNames: next,
      }));
      setRestoredProgress(readSkillsSectionProgress());

      if (next.length === 0) setActiveName(null);
      else {
        setActiveName((currentName) => {
          if (currentName !== skill.name) return currentName;
          const idx = prev.indexOf(skill.name);
          return next[Math.min(idx, next.length - 1)];
        });
      }
      return next;
    });
  }, []);

  const handleCodeProgressChange = useCallback((progress: CodeTypingProgress) => {
    patchSkillsSectionProgress((current) => ({
      ...current,
      activeMode: "code",
      activeSkillName: progress.skillName,
      code: progress,
    }));
  }, []);

  const handleTerminalProgressChange = useCallback((progress: TerminalTypingProgress) => {
    patchSkillsSectionProgress((current) => ({
      ...current,
      activeMode: "terminal",
      activeSkillName: progress.skillName,
      terminal: progress,
    }));
  }, []);

  useEffect(() => {
    if (!resolvedSkill || isSectionActive) return;

    patchSkillsSectionProgress((current) => ({
      ...current,
      activeMode: resolvedSkill.mode,
      activeSkillName: resolvedSkill.name,
      openTabNames,
    }));
  }, [isSectionActive, openTabNames, resolvedSkill]);

  const codeProgress = restoredProgress?.code ?? DEFAULT_SKILLS_SECTION_PROGRESS.code;
  const terminalProgress = restoredProgress?.terminal ?? DEFAULT_SKILLS_SECTION_PROGRESS.terminal;

  const chipHandlers = useMemo<Record<string, () => void>>(
    () => Object.fromEntries(mappedSkills.map((s) => [s.name, () => handleChipClick(s)])),
    [handleChipClick, mappedSkills],
  );

  return (
    <SecComponent>
      <Box
        ref={sectionRef}
        className="mx-auto flex w-full max-w-xs flex-col items-center gap-8 sm:max-w-xl md:gap-12"
      >
        <SkillsHeading />

        <SkillChips
          cardsRef={cardsRef}
          skills={mappedSkills}
          activeName={resolvedSkill?.name}
          handlers={chipHandlers}
        />

        <div className="relative w-full" style={PERSPECTIVE_STYLE}>
          {isLoading ? (
            <Flex
              align="center"
              justify="center"
              className="min-h-[300px] rounded-xl border border-white/10"
            >
              <Spinner size="3" />
            </Flex>
          ) : isError ? (
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
          ) : !resolvedSkill ? (
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
              isActive={isSectionActive}
              skill={resolvedSkill}
              openTabs={openTabs}
              onTabClick={handleTabClick}
              onTabClose={handleTabClose}
              codeProgress={codeProgress}
              terminalProgress={terminalProgress}
              onCodeProgressChange={handleCodeProgressChange}
              onTerminalProgressChange={handleTerminalProgressChange}
              codeContainerRef={codeRef}
            />
          )}
        </div>
      </Box>
    </SecComponent>
  );
}

export default memo(SkillsSection);
