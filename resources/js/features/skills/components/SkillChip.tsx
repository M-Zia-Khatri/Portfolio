import { cn } from '@/shared/utils/cn';
import gsap from 'gsap';
import { memo, useRef } from 'react';
import type { Skill } from '../types';

interface SkillChipProps {
  skill: Skill;
  active: boolean;
  onClick: () => void;
}

const SkillChip = memo(function SkillChip({ skill, active, onClick }: SkillChipProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return onClick();

    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ripple.className = 'pointer-events-none absolute rounded-full';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.background = `${skill.color}30`;
    btn.appendChild(ripple);

    gsap.fromTo(
      ripple,
      { width: 0, height: 0, x: 0, y: 0, opacity: 1 },
      {
        width: 120,
        height: 120,
        x: -60,
        y: -60,
        opacity: 0,
        duration: 0.55,
        onComplete: () => ripple.remove(),
      },
    );
    onClick();
  };

  const Icon = skill.iconComponent;

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      className={cn(
        'relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-lg border px-3 py-[7px] text-[13px] font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.04] active:scale-95',
      )}
      style={{
        background: active ? `${skill.color}16` : 'rgba(255,255,255,0.03)',
        borderColor: active ? `${skill.color}55` : 'rgba(255,255,255,0.08)',
        color: active ? skill.color : 'rgba(255,255,255,0.45)',
        boxShadow: active ? `0 0 14px ${skill.color}28` : 'none',
        willChange: 'transform',
      }}
    >
      <span className={cn('transition-transform duration-500', active && 'rotate-[360deg]')}>
        <Icon size={15} />
      </span>
      <span>{skill.name}</span>
      {active && (
        <span
          className="pointer-events-none absolute inset-0 rounded-lg"
          style={{ border: `1px solid ${skill.color}50` }}
        />
      )}
    </button>
  );
});

export default SkillChip;
