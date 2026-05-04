import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

interface GsapRevealOptions {
  y?: number;
  duration?: number;
  delay?: number;
  ease?: string;
  once?: boolean;
}

export function useGsapReveal(ref: RefObject<HTMLElement | null>, options: GsapRevealOptions = {}) {
  const hasAnimatedRef = useRef(false);
  const { y = 24, duration = 0.8, delay = 0, ease = 'power2.out', once = true } = options;

  useLayoutEffect(() => {
    if (!ref.current) return;
    if (once && hasAnimatedRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, y, willChange: 'transform,opacity' },
        {
          autoAlpha: 1,
          y: 0,
          delay,
          duration,
          ease,
          clearProps: 'willChange',
          onComplete: () => {
            hasAnimatedRef.current = true;
          },
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
            once,
          },
        },
      );
    }, ref);

    return () => ctx.revert();
  }, [ref, y, duration, delay, ease, once]);
}
