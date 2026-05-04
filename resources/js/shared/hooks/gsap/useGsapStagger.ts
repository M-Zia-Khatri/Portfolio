import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

interface GsapStaggerOptions {
  y?: number;
  duration?: number;
  stagger?: number;
  once?: boolean;
}

export function useGsapStagger(
  parentRef: RefObject<HTMLElement | null>,
  options: GsapStaggerOptions = {},
) {
  const hasAnimatedRef = useRef(false);
  const { y = 20, duration = 0.6, stagger = 0.1, once = true } = options;

  useLayoutEffect(() => {
    if (!parentRef.current) return;
    if (once && hasAnimatedRef.current) return;

    const ctx = gsap.context(() => {
      const children = Array.from(parentRef.current?.children ?? []);
      if (children.length === 0) return;

      gsap.from(children, {
        autoAlpha: 0,
        y,
        duration,
        stagger,
        ease: 'power2.out',
        willChange: 'transform,opacity',
        clearProps: 'willChange',
        onComplete: () => {
          hasAnimatedRef.current = true;
        },
        scrollTrigger: {
          trigger: parentRef.current,
          start: 'top 82%',
          once,
        },
      });
    }, parentRef);

    return () => ctx.revert();
  }, [parentRef, y, duration, stagger, once]);
}
