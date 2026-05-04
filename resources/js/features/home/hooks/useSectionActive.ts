import { useEffect, useState } from 'react';

const VISIBILITY_THRESHOLD = 0.3;

type Subscriber = (isActive: boolean) => void;

const subscriberMap = new Map<string, Set<Subscriber>>();
const sectionState = new Map<string, boolean>();
const observedElements = new Map<string, Element>();

let observer: IntersectionObserver | null = null;
let rafId: number | null = null;
const pending = new Map<string, boolean>();

function createObserver() {
  if (observer || typeof window === 'undefined') return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        pending.set(entry.target.id, entry.intersectionRatio >= VISIBILITY_THRESHOLD);

        const nextState = entry.intersectionRatio >= VISIBILITY_THRESHOLD;
        if (sectionState.get(entry.target.id) !== nextState) {
          pending.set(entry.target.id, nextState);
        }

        if (entry.isIntersecting) {
          // Force GSAP to recognize the newly mounted/visible section
          import('gsap/ScrollTrigger').then((m) => m.ScrollTrigger.refresh());
        }
      });

      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        pending.forEach((isActive, sectionId) => {
          const prev = sectionState.get(sectionId);
          // ONLY update if state actually flipped
          if (prev !== isActive) {
            sectionState.set(sectionId, isActive);
            subscriberMap.get(sectionId)?.forEach((notify) => notify(isActive));
          }
        });

        pending.clear();
        rafId = null;
      });
    },
    {
      threshold: [0, VISIBILITY_THRESHOLD, 1],
    },
  );
}

function ensureObserved(sectionId: string) {
  if (observedElements.has(sectionId)) return;

  const sectionEl = document.getElementById(sectionId);
  if (!sectionEl || !observer) return;

  observedElements.set(sectionId, sectionEl);
  observer.observe(sectionEl);
}

function unobserveIfUnused(sectionId: string) {
  if ((subscriberMap.get(sectionId)?.size ?? 0) > 0) return;

  const el = observedElements.get(sectionId);
  if (el && observer) observer.unobserve(el);

  observedElements.delete(sectionId);
  sectionState.delete(sectionId);
}

function cleanupObserverIfIdle() {
  if (Array.from(subscriberMap.values()).some((subs) => subs.size > 0)) return;

  if (rafId !== null && typeof window !== 'undefined') {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }

  observer?.disconnect();
  observer = null;
  observedElements.clear();
  pending.clear();
}

export function useSectionActive(sectionId: string): boolean {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    createObserver();

    const nextSubscribers = subscriberMap.get(sectionId) ?? new Set<Subscriber>();
    subscriberMap.set(sectionId, nextSubscribers);
    nextSubscribers.add(setIsActive);

    ensureObserved(sectionId);

    const knownState = sectionState.get(sectionId);
    if (knownState !== undefined) {
      setIsActive(knownState);
    } else {
      const sectionEl = document.getElementById(sectionId);
      if (sectionEl) {
        const rect = sectionEl.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const visiblePx = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const visibleRatio = rect.height > 0 ? Math.max(0, visiblePx) / rect.height : 0;
        const initialState = visibleRatio >= VISIBILITY_THRESHOLD;

        sectionState.set(sectionId, initialState);
        setIsActive(initialState);
      }
    }

    return () => {
      const subs = subscriberMap.get(sectionId);
      subs?.delete(setIsActive);
      if ((subs?.size ?? 0) === 0) {
        subscriberMap.delete(sectionId);
      }

      unobserveIfUnused(sectionId);
      cleanupObserverIfIdle();
    };
  }, [sectionId]);

  return isActive;
}
