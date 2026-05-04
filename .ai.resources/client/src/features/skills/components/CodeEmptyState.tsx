import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';

export default function CodeEmptyState() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        rootRef.current,
        { autoAlpha: 0, scale: 0.94 },
        { autoAlpha: 1, scale: 1, duration: 0.25 },
      );
      gsap.to('[data-empty-icon]', {
        y: -4,
        duration: 1.4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="flex h-full flex-col items-center justify-center gap-2 select-none"
      style={{ minHeight: 240 }}
    >
      <div data-empty-icon className="text-4xl opacity-20">
        📂
      </div>
      <p className="text-[12px] tracking-widest uppercase opacity-25">No file open</p>
      <p className="text-[11px] opacity-15">Click a skill to open a tab</p>
    </div>
  );
}
