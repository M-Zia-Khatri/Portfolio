import { ICON_MAP } from '@/features/dashboard/pages/skills/iconMap';
import { useSkillsCodeData } from '@/features/dashboard/pages/skills/useSkillActions';
import type { ApiSkill, Skill } from '@/features/skills/types';
import type { CodeCardHandle } from '@/shared/components/CodeCard';
import CodeCard from '@/shared/components/CodeCard';
import { useGsapReveal } from '@/shared/hooks/useGsapAnimations';
import { memo, startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type CardStatus = 'idle' | 'typing' | 'paused' | 'advancing' | 'done';

// Helper to convert API skill to runtime Skill with iconComponent resolved
function toRuntimeSkill(apiSkill: ApiSkill): Skill {
  const iconComponent = ICON_MAP[apiSkill.icon] ?? ICON_MAP.default;
  return { ...apiSkill, iconComponent } as Skill;
}

function StatusBadge({
  status,
  color,
  secondsLeft,
  nextName,
}: {
  status: CardStatus;
  color: string;
  secondsLeft: number;
  nextName: string;
}) {
  if (status === 'typing')
    return (
      <span className="text-[10px] tracking-widest" style={{ color: `${color}bb` }}>
        typing…
      </span>
    );
  if (status === 'paused')
    return (
      <span className="text-[10px] tracking-widest text-amber-300">resuming in {secondsLeft}s</span>
    );
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

function ProgressRail({
  contactSkills,
  autoIndex,
  isDone,
}: {
  contactSkills: Skill[];
  autoIndex: number;
  isDone: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2.5">
      {contactSkills.map((s, i) => (
        <div
          key={s.name}
          title={s.name}
          className="h-1 rounded-full transition-all duration-300"
          style={{
            width: i === autoIndex && !isDone ? 20 : 5,
            opacity: i <= autoIndex ? 1 : 0.2,
            background: isDone
              ? `${s.color}60`
              : i === autoIndex
                ? s.color
                : i < autoIndex
                  ? `${s.color}60`
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
  const [cardStatus, setCardStatus] = useState<CardStatus>('idle');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const codeCardRef = useRef<CodeCardHandle>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useGsapReveal(wrapRef, '[data-contact-card]', { y: 16, duration: 0.45 });

  // Initialize activeSkill when contactSkills are available
  useEffect(() => {
    if (contactSkills.length > 0 && !activeSkill) {
      setActiveSkill(contactSkills[0]);
      setOpenTabs([contactSkills[0]]);
    }
  }, [contactSkills, activeSkill]);

  const nextName = contactSkills.length > 0
    ? contactSkills[(autoIndex + 1) % contactSkills.length].name
    : '';

  const advanceToNext = useCallback(() => {
    if (contactSkills.length === 0) return;
    const currentIndex = autoIndexRef.current;
    if (currentIndex === contactSkills.length - 1) return setCardStatus('done');

    setCardStatus('advancing');

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
      setCardStatus('typing');
    }, 700);
  }, [contactSkills]);

  useEffect(() => {
    if (isActive && cardStatus === 'idle') setCardStatus('typing');
    if (!isActive) codeCardRef.current?.pause();
    if (isActive && cardStatus !== 'paused') codeCardRef.current?.resume();
  }, [isActive, cardStatus]);

  const handleTabClick = useCallback(
    (skill: Skill) => {
      if (cardStatus === 'done' || cardStatus === 'idle') return;
      const liveSkill = contactSkills[autoIndexRef.current];
      if (skill.name === liveSkill.name) {
        codeCardRef.current?.resume();
        setCardStatus('typing');

        startTransition(() => {
          setActiveSkill(skill);
        });
        return;
      }

      setActiveSkill(skill);
      codeCardRef.current?.pause();
      const delaySecs = Math.ceil((10_000 + Math.random() * 10_000) / 1000);
      setCardStatus('paused');
      setSecondsLeft(delaySecs);
      const interval = setInterval(() => setSecondsLeft((v) => Math.max(0, v - 1)), 1000);
      setTimeout(() => {
        clearInterval(interval);
        const live = contactSkills[autoIndexRef.current];
        setActiveSkill(live);
        codeCardRef.current?.resume();
        setCardStatus('typing');
      }, delaySecs * 1000);
    },
    [cardStatus, contactSkills],
  );

  // Show loading or empty state if no skills available
  if (isLoading || isError || contactSkills.length === 0) {
    return null;
  }

  const currentColor = contactSkills[autoIndex]?.color ?? '#ffffff';

  return (
    <div ref={wrapRef} className="flex flex-col gap-2">
      <div className="flex h-5 justify-end pr-1">
        <MemoizedStatusBadge
          status={cardStatus}
          color={currentColor}
          secondsLeft={secondsLeft}
          nextName={nextName}
        />
      </div>
      <div data-contact-card className="relative" style={{ perspective: 800 }}>
        {activeSkill && (
          <CodeCard
            ref={codeCardRef}
            skill={activeSkill}
            openTabs={cardStatus !== 'idle' ? openTabs : []}
            started={cardStatus !== 'idle'}
            isActive={isActive && cardStatus !== 'advancing'}
            onTabClick={handleTabClick}
            onTabClose={() => undefined}
            onTypingComplete={cardStatus !== 'done' ? advanceToNext : undefined}
          />
        )}
      </div>
      <MemoizedProgressRail
        contactSkills={contactSkills}
        autoIndex={autoIndex}
        isDone={cardStatus === 'done'}
      />
    </div>
  );
}
