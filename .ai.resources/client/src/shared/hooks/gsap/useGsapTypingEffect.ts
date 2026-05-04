import gsap from 'gsap';
import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';

interface GsapTypingOptions {
  speed?: number;
  cursorSelector?: string;
  lineSelector?: string;
  replayKey?: string | number;
}

export function useGsapTypingEffect(
  containerRef: RefObject<HTMLElement | null>,
  options: GsapTypingOptions = {},
) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const { speed = 0.05, cursorSelector, lineSelector = '.code-line', replayKey } = options;

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      timelineRef.current?.kill();

      const container = containerRef.current;
      if (!container) return;

      const lines = gsap.utils.toArray<HTMLElement>(lineSelector, container);
      if (lines.length === 0) return;

      gsap.set(lines, { autoAlpha: 0, y: 8, willChange: 'transform,opacity' });

      const tl = gsap.timeline();
      timelineRef.current = tl;
      tl.to(lines, {
        autoAlpha: 1,
        y: 0,
        stagger: speed,
        duration: 0.22,
        ease: 'power1.out',
        clearProps: 'willChange',
      });

      if (cursorSelector) {
        const cursor = container.querySelector(cursorSelector);
        if (cursor) {
          tl.to(cursor, { opacity: 0, repeat: -1, yoyo: true, duration: 0.48, ease: 'none' }, 0);
        }
      }
    }, containerRef);

    return () => {
      timelineRef.current?.kill();
      ctx.revert();
    };
  }, [containerRef, speed, lineSelector, cursorSelector, replayKey]);

  return timelineRef;
}
