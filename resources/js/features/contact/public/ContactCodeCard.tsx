import { ICON_MAP } from '@/Pages/(admin)/skills/iconMap';
import { isCodeSkill, isTerminalSkill, toTerminalLines, type ApiSkill, type Skill } from '@/features/skills/types';
import type { CodeCardHandle } from '@/shared/components/CodeCard';
import CodeCard from '@/shared/components/CodeCard';
import { useGsapReveal } from '@/shared/hooks/useGsapAnimations';
import type { HomePageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { memo, startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type CardStatus = 'idle' | 'typing' | 'paused' | 'advancing' | 'done';

const ADVANCE_DELAY_MS = 700;
const PAUSE_RESUME_DELAY_MS = 12_000;
const COUNTDOWN_INTERVAL_MS = 1_000;

function toRuntimeSkill(apiSkill: ApiSkill): Skill | null {
  const iconComponent = ICON_MAP[apiSkill.icon] ?? ICON_MAP.default;

  const baseSkill = {
    id: apiSkill.id,
    name: apiSkill.name,
    icon: apiSkill.icon,
    fileName: apiSkill.fileName,
    lang: apiSkill.lang,
    color: apiSkill.color,
    iconComponent,
  };

  if (isCodeSkill(apiSkill)) {
    return {
      ...baseSkill,
      mode: 'code',
      code: apiSkill.code,
    };
  }

  if (isTerminalSkill(apiSkill)) {
    return {
      ...baseSkill,
      mode: 'terminal',
      commands: toTerminalLines(apiSkill.commands),
    };
  }

  return null;
}

function StatusBadge({ status, color, secondsLeft, nextName }: { status: CardStatus; color: string; secondsLeft: number; nextName: string }) {
  if (status === 'typing')
    return (
      <span className="text-[10px] tracking-widest" style={{ color: `${color}bb` }}>
        typing…
      </span>
    );
  if (status === 'paused') return <span className="text-[10px] tracking-widest text-amber-300">resuming in {secondsLeft}s</span>;
  if (status === 'advancing')
    return (
      <span className="text-[10px] tracking-widest" style={{ color: `${color}bb` }}>
        next → {nextName}
      </span>
    );
  if (status === 'done')
    return (
      <span className="text-[10px] tracking-widest" style={{ color: `${color}99` }}>
        ✓ all done
      </span>
    );
  return null;
}

function ProgressRail({ contactSkills, autoIndex, isDone }: { contactSkills: Skill[]; autoIndex: number; isDone: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2.5">
      {contactSkills.map((s, i) => (
        <div
          key={s.id ?? s.name}
          title={s.name}
          className="h-1 rounded-full transition-all duration-300"
          style={{
            width: i === autoIndex && !isDone ? 20 : 5,
            opacity: i <= autoIndex ? 1 : 0.2,
            background: isDone ? `${s.color}60` : i === autoIndex ? s.color : i < autoIndex ? `${s.color}60` : 'rgba(255,255,255,0.18)',
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

  const contactSkills = useMemo<Skill[]>(() => apiSkills.map(toRuntimeSkill).filter((skill): skill is Skill => skill !== null), [apiSkills]);

  const [autoIndex, setAutoIndex] = useState(0);
  const autoIndexRef = useRef(0);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [openTabs, setOpenTabs] = useState<Skill[]>([]);
  const [cardStatus, setCardStatus] = useState<CardStatus>('idle');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const codeCardRef = useRef<CodeCardHandle>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useGsapReveal(wrapRef, '[data-contact-card]', { y: 16, duration: 0.45 });

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  }, []);

  const clearPauseTimers = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    autoIndexRef.current = autoIndex;
  }, [autoIndex]);

  useEffect(() => {
    if (contactSkills.length === 0) {
      setAutoIndex(0);
      setActiveSkill(null);
      setOpenTabs([]);
      setCardStatus('idle');
      setSecondsLeft(0);
      return;
    }

    const nextIndex = Math.min(autoIndexRef.current, contactSkills.length - 1);
    autoIndexRef.current = nextIndex;
    setAutoIndex(nextIndex);
    setActiveSkill(contactSkills[nextIndex]);
    setOpenTabs(contactSkills.slice(0, nextIndex + 1));
  }, [contactSkills]);

  useEffect(
    () => () => {
      clearAdvanceTimer();
      clearPauseTimers();
    },
    [clearAdvanceTimer, clearPauseTimers],
  );

  const nextName = contactSkills.length > 0 && autoIndex < contactSkills.length - 1 ? contactSkills[autoIndex + 1].name : '';

  const advanceToNext = useCallback(() => {
    if (contactSkills.length === 0 || cardStatus === 'advancing' || cardStatus === 'paused' || cardStatus === 'done') return;

    const currentIndex = autoIndexRef.current;
    if (currentIndex >= contactSkills.length - 1) {
      setCardStatus('done');
      return;
    }

    clearAdvanceTimer();
    setCardStatus('advancing');

    advanceTimeoutRef.current = setTimeout(() => {
      setAutoIndex((previousIndex) => {
        const nextIndex = Math.min(previousIndex + 1, contactSkills.length - 1);
        const nextSkill = contactSkills[nextIndex];

        autoIndexRef.current = nextIndex;
        setOpenTabs((previousTabs) => (previousTabs.some((tab) => tab.id === nextSkill.id) ? previousTabs : [...previousTabs, nextSkill]));
        setActiveSkill(nextSkill);
        setCardStatus('typing');

        return nextIndex;
      });

      advanceTimeoutRef.current = null;
    }, ADVANCE_DELAY_MS);
  }, [cardStatus, clearAdvanceTimer, contactSkills]);

  useEffect(() => {
    if (contactSkills.length === 0) return;

    if (!isActive) {
      codeCardRef.current?.pause();
      return;
    }

    if (cardStatus === 'idle') {
      setCardStatus('typing');
      return;
    }

    if (cardStatus !== 'paused' && cardStatus !== 'advancing' && cardStatus !== 'done') {
      codeCardRef.current?.resume();
    }
  }, [cardStatus, contactSkills.length, isActive]);

  const handleTabClick = useCallback(
    (skill: Skill) => {
      if (cardStatus === 'done' || cardStatus === 'idle' || cardStatus === 'advancing') return;

      const liveSkill = contactSkills[autoIndexRef.current];
      if (!liveSkill) return;

      clearPauseTimers();

      if (skill.id === liveSkill.id) {
        codeCardRef.current?.resume();
        setSecondsLeft(0);
        setCardStatus('typing');

        startTransition(() => {
          setActiveSkill(skill);
        });
        return;
      }

      setActiveSkill(skill);
      codeCardRef.current?.pause();
      setSecondsLeft(Math.ceil(PAUSE_RESUME_DELAY_MS / 1000));
      setCardStatus('paused');

      countdownIntervalRef.current = setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), COUNTDOWN_INTERVAL_MS);
      resumeTimeoutRef.current = setTimeout(() => {
        clearPauseTimers();
        const currentLiveSkill = contactSkills[autoIndexRef.current];
        if (!currentLiveSkill) return;

        setActiveSkill(currentLiveSkill);
        setSecondsLeft(0);
        codeCardRef.current?.resume();
        setCardStatus('typing');
      }, PAUSE_RESUME_DELAY_MS);
    },
    [cardStatus, clearPauseTimers, contactSkills],
  );

  if (contactSkills.length === 0) {
    return null;
  }

  const currentColor = contactSkills[autoIndex]?.color ?? '#ffffff';

  return (
    <div ref={wrapRef} className="flex flex-col gap-2">
      <div className="flex h-5 justify-end pr-1">
        <MemoizedStatusBadge status={cardStatus} color={currentColor} secondsLeft={secondsLeft} nextName={nextName} />
      </div>
      <div data-contact-card className="relative" style={{ perspective: 800 }}>
        {activeSkill && (
          <CodeCard
            ref={codeCardRef}
            skill={activeSkill}
            openTabs={cardStatus !== 'idle' ? openTabs : []}
            started={cardStatus !== 'idle'}
            isActive={isActive && cardStatus !== 'advancing' && cardStatus !== 'paused'}
            onTabClick={handleTabClick}
            onTabClose={() => undefined}
            onTypingComplete={cardStatus !== 'done' ? advanceToNext : undefined}
          />
        )}
      </div>
      <MemoizedProgressRail contactSkills={contactSkills} autoIndex={autoIndex} isDone={cardStatus === 'done'} />
    </div>
  );
}
