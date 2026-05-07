import { ICON_MAP } from '@/Pages/(admin)/skills/iconMap';
import { isCodeSkill, isTerminalSkill, normalizeApiSkillList, toTerminalLines, type ApiSkill, type Skill } from '@/features/skills/types';
import type { CodeCardHandle } from '@/shared/components/CodeCard';
import CodeCard from '@/shared/components/CodeCard';
import { useGsapReveal } from '@/shared/hooks/useGsapAnimations';
import type { HomePageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { memo, startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type CardStatus = 'idle' | 'typing' | 'paused' | 'advancing' | 'done';

const ADVANCE_DELAY_MS = 700;
const TAB_PREVIEW_PAUSE_MS = 12_000;

function toRuntimeSkill(apiSkill: ApiSkill): Skill | null {
  const iconComponent = ICON_MAP[apiSkill.icon] ?? ICON_MAP.default;

  if (isCodeSkill(apiSkill)) {
    return {
      id: apiSkill.id,
      name: apiSkill.name,
      icon: apiSkill.icon,
      fileName: apiSkill.fileName,
      lang: apiSkill.lang,
      color: apiSkill.color,
      iconComponent,
      mode: 'code',
      code: apiSkill.code,
    };
  }

  if (isTerminalSkill(apiSkill)) {
    return {
      id: apiSkill.id,
      name: apiSkill.name,
      icon: apiSkill.icon,
      fileName: apiSkill.fileName,
      lang: apiSkill.lang,
      color: apiSkill.color,
      iconComponent,
      mode: 'terminal',
      commands: toTerminalLines(apiSkill.commands),
    };
  }

  return null;
}

function StatusBadge({ status, color, secondsLeft, nextName }: { status: CardStatus; color: string; secondsLeft: number; nextName: string }) {
  if (status === 'typing') {
    return (
      <span className="text-[10px] tracking-widest" style={{ color: `${color}bb` }}>
        typing…
      </span>
    );
  }

  if (status === 'paused') {
    return <span className="text-[10px] tracking-widest text-amber-300">resuming in {secondsLeft}s</span>;
  }

  if (status === 'advancing') {
    return (
      <span className="text-[10px] tracking-widest" style={{ color: `${color}bb` }}>
        next → {nextName}
      </span>
    );
  }

  if (status === 'done') {
    return (
      <span className="text-[10px] tracking-widest" style={{ color: `${color}99` }}>
        ✓ all done
      </span>
    );
  }

  return null;
}

function ProgressRail({ contactSkills, autoIndex, isDone }: { contactSkills: Skill[]; autoIndex: number; isDone: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2.5">
      {contactSkills.map((skill, index) => (
        <div
          key={skill.id ?? skill.name}
          title={skill.name}
          className="h-1 rounded-full transition-all duration-300"
          style={{
            width: index === autoIndex && !isDone ? 20 : 5,
            opacity: index <= autoIndex ? 1 : 0.2,
            background: isDone
              ? `${skill.color}60`
              : index === autoIndex
                ? skill.color
                : index < autoIndex
                  ? `${skill.color}60`
                  : 'rgba(255,255,255,0.18)',
          }}
        />
      ))}
    </div>
  );
}

const MemoizedStatusBadge = memo(StatusBadge);
const MemoizedProgressRail = memo(ProgressRail);

export default function ContactCodeCard({ isActive }: { isActive: boolean }) {
  const { contactSkills: apiSkills } = usePage<HomePageProps>().props;

  const contactSkills = useMemo<Skill[]>(
    () =>
      normalizeApiSkillList(apiSkills).flatMap((apiSkill): Skill[] => {
        const runtimeSkill = toRuntimeSkill(apiSkill);

        return runtimeSkill?.mode === 'code' ? [runtimeSkill] : [];
      }),
    [apiSkills],
  );

  const [autoIndex, setAutoIndex] = useState(0);
  const autoIndexRef = useRef(0);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [openTabs, setOpenTabs] = useState<Skill[]>([]);
  const [cardStatus, setCardStatus] = useState<CardStatus>('idle');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const codeCardRef = useRef<CodeCardHandle>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(isActive);

  useGsapReveal(wrapRef, '[data-contact-card]', { y: 16, duration: 0.45 });

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  }, []);

  const clearPreviewTimers = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const clearTimers = useCallback(() => {
    clearAdvanceTimer();
    clearPreviewTimers();
  }, [clearAdvanceTimer, clearPreviewTimers]);

  useEffect(() => {
    autoIndexRef.current = autoIndex;
  }, [autoIndex]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    clearTimers();

    if (contactSkills.length === 0) {
      autoIndexRef.current = 0;
      setAutoIndex(0);
      setActiveSkill(null);
      setOpenTabs([]);
      setCardStatus('idle');
      setSecondsLeft(0);

      return;
    }

    autoIndexRef.current = 0;
    setAutoIndex(0);
    setActiveSkill(contactSkills[0]);
    setOpenTabs([contactSkills[0]]);
    setSecondsLeft(0);
    setCardStatus(isActiveRef.current ? 'typing' : 'idle');
  }, [clearTimers, contactSkills]);

  useEffect(() => {
    if (!isActive) {
      codeCardRef.current?.pause();

      return;
    }

    if (cardStatus === 'idle' && contactSkills.length > 0) {
      setCardStatus('typing');
    }

    if (cardStatus !== 'paused' && cardStatus !== 'advancing') {
      codeCardRef.current?.resume();
    }
  }, [cardStatus, contactSkills.length, isActive]);

  useEffect(() => clearTimers, [clearTimers]);

  const nextName = contactSkills.length > 0 && autoIndex < contactSkills.length - 1 ? contactSkills[autoIndex + 1].name : '';

  const advanceToNext = useCallback(() => {
    if (contactSkills.length === 0 || cardStatus === 'advancing' || cardStatus === 'paused' || cardStatus === 'done') {
      return;
    }

    const currentIndex = autoIndexRef.current;

    if (currentIndex >= contactSkills.length - 1) {
      setCardStatus('done');

      return;
    }

    const nextIndex = currentIndex + 1;
    const nextSkill = contactSkills[nextIndex];

    if (!nextSkill) {
      setCardStatus('done');

      return;
    }

    clearAdvanceTimer();
    setCardStatus('advancing');
    codeCardRef.current?.pause();

    advanceTimeoutRef.current = setTimeout(() => {
      autoIndexRef.current = nextIndex;
      setAutoIndex(nextIndex);
      setOpenTabs((previousTabs) => {
        if (previousTabs.some((tab) => (tab.id ?? tab.name) === (nextSkill.id ?? nextSkill.name))) {
          return previousTabs;
        }

        return [...previousTabs, nextSkill];
      });
      setActiveSkill(nextSkill);
      setCardStatus('typing');
      advanceTimeoutRef.current = null;
    }, ADVANCE_DELAY_MS);
  }, [cardStatus, clearAdvanceTimer, contactSkills]);

  const handleTabClick = useCallback(
    (skill: Skill) => {
      if (cardStatus === 'done' || cardStatus === 'idle' || cardStatus === 'advancing' || contactSkills.length === 0) {
        return;
      }

      clearPreviewTimers();

      const liveSkill = contactSkills[autoIndexRef.current];

      if (!liveSkill || (skill.id ?? skill.name) === (liveSkill.id ?? liveSkill.name)) {
        setSecondsLeft(0);
        setCardStatus('typing');
        codeCardRef.current?.resume();

        startTransition(() => {
          setActiveSkill(skill);
        });

        return;
      }

      setActiveSkill(skill);
      setCardStatus('paused');
      codeCardRef.current?.pause();

      const delaySecs = Math.ceil(TAB_PREVIEW_PAUSE_MS / 1000);
      setSecondsLeft(delaySecs);
      countdownIntervalRef.current = setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
      resumeTimeoutRef.current = setTimeout(() => {
        clearPreviewTimers();
        setSecondsLeft(0);
        setActiveSkill(liveSkill);
        setCardStatus('typing');
        codeCardRef.current?.resume();
      }, TAB_PREVIEW_PAUSE_MS);
    },
    [cardStatus, clearPreviewTimers, contactSkills],
  );

  if (contactSkills.length === 0) {
    return null;
  }

  const currentColor = contactSkills[autoIndex]?.color ?? '#ffffff';

  return (
    <div ref={wrapRef} className="flex min-w-0 flex-col gap-2">
      <div className="flex h-5 justify-end pr-1">
        <MemoizedStatusBadge status={cardStatus} color={currentColor} secondsLeft={secondsLeft} nextName={nextName} />
      </div>
      <div data-contact-card className="relative min-w-0" style={{ perspective: 800 }}>
        {activeSkill && (
          <CodeCard
            ref={codeCardRef}
            skill={activeSkill}
            openTabs={cardStatus !== 'idle' ? openTabs : []}
            started={cardStatus !== 'idle'}
            isActive={isActive && cardStatus !== 'advancing' && cardStatus !== 'paused'}
            onTabClick={handleTabClick}
            onTabClose={() => undefined}
            onTypingComplete={cardStatus === 'typing' ? advanceToNext : undefined}
          />
        )}
      </div>
      <MemoizedProgressRail contactSkills={contactSkills} autoIndex={autoIndex} isDone={cardStatus === 'done'} />
    </div>
  );
}
