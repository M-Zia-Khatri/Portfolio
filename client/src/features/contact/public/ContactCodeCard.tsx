import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { analytics } from "@/features/analytics/tracking";
import { useSkillsCodeData } from "@/features/skills/admin/hooks/useSkillActions";
import type { Skill } from "@/features/skills/types";
import type { CodeCardHandle } from "@/shared/components/CodeCard";
import { useGsapReveal } from "@/shared/hooks/useGsapAnimations";
import { markSessionOnce, toRuntimeSkill } from "./components/ContactCodeActions";
import { ContactCodeFooter } from "./components/ContactCodeFooter";
import { ContactCodeHeader, type ContactCodeStatus } from "./components/ContactCodeHeader";
import { ContactCodeLine } from "./components/ContactCodeLine";

const CONTACT_OPEN_SESSION_KEY = "analytics-contact-open";

export default function ContactCodeCard({ isActive }: { isActive: boolean }) {
  const { data: apiSkills, isLoading, isError } = useSkillsCodeData();

  // Map API skills to runtime skills with iconComponent resolved
  const contactSkills = useMemo<Skill[]>(() => {
    if (!apiSkills || apiSkills.length === 0) return [];
    return apiSkills.map(toRuntimeSkill);
  }, [apiSkills]);

  const [autoIndex, setAutoIndex] = useState(0);
  const autoIndexRef = useRef(0);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [openTabs, setOpenTabs] = useState<Skill[]>([]);
  const [cardStatus, setContactCodeStatus] = useState<ContactCodeStatus>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const codeCardRef = useRef<CodeCardHandle>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useGsapReveal(wrapRef, "[data-contact-card]", { y: 16, duration: 0.45 });

  useEffect(() => {
    if (isActive && markSessionOnce(CONTACT_OPEN_SESSION_KEY)) {
      analytics.track("contact_open", {});
    }
  }, [isActive]);

  // Initialize activeSkill when contactSkills are available
  useEffect(() => {
    if (contactSkills.length > 0 && !activeSkill) {
      setActiveSkill(contactSkills[0]);
      setOpenTabs([contactSkills[0]]);
    }
  }, [contactSkills, activeSkill]);

  const nextName =
    contactSkills.length > 0 ? contactSkills[(autoIndex + 1) % contactSkills.length].name : "";

  const advanceToNext = useCallback(() => {
    if (contactSkills.length === 0) return;
    const currentIndex = autoIndexRef.current;
    if (currentIndex === contactSkills.length - 1) return setContactCodeStatus("done");

    setContactCodeStatus("advancing");

    setTimeout(() => {
      const nextIdx = currentIndex + 1;
      const nextSkill = contactSkills[nextIdx];

      autoIndexRef.current = nextIdx;
      setAutoIndex(nextIdx);

      setOpenTabs((prev) => {
        if (prev.some((t) => t.name === nextSkill.name)) return prev;
        return [...prev, nextSkill];
      });

      setActiveSkill(nextSkill);
      setContactCodeStatus("typing");
    }, 700);
  }, [contactSkills]);

  useEffect(() => {
    if (isActive && cardStatus === "idle") setContactCodeStatus("typing");
    if (!isActive) codeCardRef.current?.pause();
    if (isActive && cardStatus !== "paused") codeCardRef.current?.resume();
  }, [isActive, cardStatus]);

  const handleTabClick = useCallback(
    (skill: Skill) => {
      if (cardStatus === "done" || cardStatus === "idle") return;
      const liveSkill = contactSkills[autoIndexRef.current];
      if (skill.name === liveSkill.name) {
        codeCardRef.current?.resume();
        setContactCodeStatus("typing");

        startTransition(() => {
          setActiveSkill(skill);
        });
        return;
      }

      setActiveSkill(skill);
      codeCardRef.current?.pause();
      const delaySecs = Math.ceil((10_000 + Math.random() * 10_000) / 1000);
      setContactCodeStatus("paused");
      setSecondsLeft(delaySecs);
      const interval = setInterval(() => setSecondsLeft((v) => Math.max(0, v - 1)), 1000);
      setTimeout(() => {
        clearInterval(interval);
        const live = contactSkills[autoIndexRef.current];
        setActiveSkill(live);
        codeCardRef.current?.resume();
        setContactCodeStatus("typing");
      }, delaySecs * 1000);
    },
    [cardStatus, contactSkills],
  );

  // Show loading or empty state if no skills available
  if (isLoading || isError || contactSkills.length === 0) {
    return null;
  }

  const currentColor = contactSkills[autoIndex]?.color ?? "#ffffff";

  return (
    <div ref={wrapRef} className="flex flex-col gap-2">
      <ContactCodeHeader
        status={cardStatus}
        color={currentColor}
        secondsLeft={secondsLeft}
        nextName={nextName}
      />
      <ContactCodeLine
        activeSkill={activeSkill}
        cardStatus={cardStatus}
        codeCardRef={codeCardRef}
        isActive={isActive}
        openTabs={openTabs}
        onTabClick={handleTabClick}
        onTypingComplete={cardStatus !== "done" ? advanceToNext : undefined}
      />
      <ContactCodeFooter
        contactSkills={contactSkills}
        autoIndex={autoIndex}
        isDone={cardStatus === "done"}
      />
    </div>
  );
}
