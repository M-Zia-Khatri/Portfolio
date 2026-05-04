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

export function useGsapReveal(
  scopeRef: RefObject<HTMLElement | null>,
  target: string,
  options?: { y?: number; duration?: number; ease?: string; once?: boolean },
) {
  const initializedRef = useRef(false);

  useLayoutEffect(() => {
    if (!scopeRef.current || initializedRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        target,
        { autoAlpha: 0, y: options?.y ?? 20, willChange: 'transform,opacity' },
        {
          autoAlpha: 1,
          y: 0,
          duration: options?.duration ?? 0.55,
          ease: options?.ease ?? 'power2.out',
          clearProps: 'willChange',
          scrollTrigger: {
            trigger: scopeRef.current,
            start: 'top 80%',
            once: options?.once ?? true,
          },
        },
      );
    }, scopeRef);

    initializedRef.current = true;
    return () => ctx.revert();
  }, [scopeRef, target, options?.duration, options?.ease, options?.once, options?.y]);
}

export function useGsapStagger(
  parentRef: RefObject<HTMLElement | null>,
  target: string,
  options: GsapStaggerOptions = {},
) {
  const hasAnimatedRef = useRef(false);
  const { y = 20, duration = 0.6, stagger = 0.1, once = true } = options;
  useLayoutEffect(() => {
    if (!parentRef.current) return;

    const ctx = gsap.context(() => {
      const children = Array.from(parentRef.current?.children ?? []);
      // FIX: Don't mark as complete if there are no children yet (loading state)
      if (children.length === 0) return;
      if (once && hasAnimatedRef.current) return;

      gsap.fromTo(
        target,
        { autoAlpha: 0, y: options?.y ?? 16, willChange: 'transform,opacity' },
        {
          autoAlpha: 1,
          y: 0,
          duration: options?.duration ?? 0.5,
          stagger: options?.stagger ?? 0.08,
          ease: 'power2.out',
          clearProps: 'willChange',
          onComplete: () => {
            hasAnimatedRef.current = true;
            ScrollTrigger.refresh(); // Ensure markers are correct after height change
          },
          scrollTrigger: {
            trigger: parentRef.current,
            start: 'top 78%',
            once: true,
          },
        },
      );
    }, parentRef);

    return () => ctx.revert();
  }, [parentRef, y, duration, stagger, once, parentRef.current?.children.length]);
}

export function useGsapTypingEffect(
  scopeRef: RefObject<HTMLElement | null>,
  deps: unknown[],
  setup: (timeline: gsap.core.Timeline) => void,
  paused?: boolean,
) {
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (!scopeRef.current) return;

    const ctx = gsap.context(() => {
      tlRef.current?.kill();
      const timeline = gsap.timeline({ paused: !!paused });
      tlRef.current = timeline;
      setup(timeline);
      if (!paused) timeline.play(0);
    }, scopeRef);

    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
      ctx.revert();
    };
  }, [scopeRef, paused, ...deps]);

  useLayoutEffect(() => {
    if (!tlRef.current) return;
    if (paused) tlRef.current.pause();
    else tlRef.current.resume();
  }, [paused]);

  return tlRef;
}
