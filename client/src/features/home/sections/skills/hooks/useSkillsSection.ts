import { useCallback, useEffect, useMemo, useState } from "react";
import { ICON_MAP } from "@/features/dashboard/pages/skills/iconMap";
import { useSkillsData } from "@/features/dashboard/pages/skills/useSkillActions";
import { DEFAULT_SKILLS_SECTION_PROGRESS, patchSkillsSectionProgress, readSkillsSectionProgress, type CodeTypingProgress, type SkillsSectionProgress, type TerminalTypingProgress } from "@/features/skills/skillsProgress.storage";
import type { ApiSkill, Skill } from "@/features/skills/types";
import { useSectionActive } from "../../hooks/useSectionActive";

export function useSkillsSection() {
  const isSectionActive = useSectionActive("skills");
  const { data, isLoading, isError } = useSkillsData();
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
  useEffect(() => setRestoredProgress(readSkillsSectionProgress()), []);
  useEffect(() => {
    if (!restoredProgress || mappedSkills.length === 0) return;
    const validTabNames = restoredProgress.openTabNames.filter((tabName) => mappedSkills.some((skill) => skill.name === tabName));
    const activeSkillName = restoredProgress.activeSkillName && mappedSkills.some((skill) => skill.name === restoredProgress.activeSkillName) ? restoredProgress.activeSkillName : validTabNames[0];
    if (validTabNames.length > 0) setOpenTabNames(validTabNames);
    if (activeSkillName) setActiveName(activeSkillName);
  }, [mappedSkills, restoredProgress]);
  const openTabs = useMemo<Skill[]>(() => {
    if (mappedSkills.length === 0) return [];
    const tabs = openTabNames.map((tabName) => mappedSkills.find((skill) => skill.name === tabName)).filter((skill): skill is Skill => Boolean(skill));
    return tabs.length > 0 ? tabs : [mappedSkills[0]];
  }, [mappedSkills, openTabNames]);
  const resolvedSkill = useMemo<Skill | null>(() => {
    if (mappedSkills.length === 0) return null;
    if (!activeName) return openTabs[0] ?? mappedSkills[0];
    return mappedSkills.find((skill) => skill.name === activeName) ?? openTabs[0] ?? mappedSkills[0];
  }, [activeName, mappedSkills, openTabs]);
  const persistSelection = useCallback((skill: Skill, nextOpenTabNames?: string[]) => {
    patchSkillsSectionProgress((current) => ({ ...current, activeMode: skill.mode, activeSkillName: skill.name, openTabNames: nextOpenTabNames ?? current.openTabNames }));
  }, []);
  const handleChipClick = useCallback((skill: Skill) => {
    setOpenTabNames((prev) => (prev.includes(skill.name) ? prev : [...prev, skill.name]));
    setActiveName(skill.name);
    const nextProgress = patchSkillsSectionProgress((current) => ({ ...current, activeMode: skill.mode, activeSkillName: skill.name, openTabNames: current.openTabNames.includes(skill.name) ? current.openTabNames : [...current.openTabNames, skill.name] }));
    setRestoredProgress(nextProgress);
  }, []);
  const handleTabClick = useCallback((skill: Skill) => { setActiveName(skill.name); persistSelection(skill); setRestoredProgress(readSkillsSectionProgress()); }, [persistSelection]);
  const handleTabClose = useCallback((skill: Skill) => {
    setOpenTabNames((prev) => {
      const next = prev.filter((name) => name !== skill.name);
      patchSkillsSectionProgress((current) => ({ ...current, activeSkillName: current.activeSkillName === skill.name ? (next[0] ?? null) : current.activeSkillName, openTabNames: next }));
      setRestoredProgress(readSkillsSectionProgress());
      if (next.length === 0) setActiveName(null);
      else setActiveName((currentName) => currentName !== skill.name ? currentName : next[Math.min(prev.indexOf(skill.name), next.length - 1)]);
      return next;
    });
  }, []);
  const handleCodeProgressChange = useCallback((progress: CodeTypingProgress) => patchSkillsSectionProgress((current) => ({ ...current, activeMode: "code", activeSkillName: progress.skillName, code: progress })), []);
  const handleTerminalProgressChange = useCallback((progress: TerminalTypingProgress) => patchSkillsSectionProgress((current) => ({ ...current, activeMode: "terminal", activeSkillName: progress.skillName, terminal: progress })), []);
  useEffect(() => {
    if (!resolvedSkill || isSectionActive) return;
    patchSkillsSectionProgress((current) => ({ ...current, activeMode: resolvedSkill.mode, activeSkillName: resolvedSkill.name, openTabNames }));
  }, [isSectionActive, openTabNames, resolvedSkill]);
  return { isSectionActive, isLoading, isError, mappedSkills, resolvedSkill, openTabs, codeProgress: restoredProgress?.code ?? DEFAULT_SKILLS_SECTION_PROGRESS.code, terminalProgress: restoredProgress?.terminal ?? DEFAULT_SKILLS_SECTION_PROGRESS.terminal, chipHandlers: Object.fromEntries(mappedSkills.map((s) => [s.name, () => handleChipClick(s)])), handleTabClick, handleTabClose, handleCodeProgressChange, handleTerminalProgressChange };
}
