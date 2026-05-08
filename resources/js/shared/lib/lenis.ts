import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;
let mountCount = 0;
let visibilityListenerAttached = false;

export const TOPBAR_OFFSET = -96;
export const SECTION_NAVIGATION_EVENT = 'portfolio:section-navigate';

export type SectionNavigationDetail = {
  sectionId: string;
};

type ScrollToTargetOptions = {
  offset?: number;
  updateHash?: boolean;
  behavior?: ScrollBehavior;
  maxWaitMs?: number;
};

const defaultOptions: ConstructorParameters<typeof Lenis>[0] = {
  duration: 1.05,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.25,
};

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function onVisibilityChange() {
  if (typeof document === 'undefined') return;

  if (document.hidden) {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
    return;
  }

  if (lenisInstance) {
    startRafLoop();
  }
}

function attachVisibilityListener() {
  if (visibilityListenerAttached || typeof document === 'undefined') return;

  document.addEventListener('visibilitychange', onVisibilityChange);
  visibilityListenerAttached = true;
}

function detachVisibilityListener() {
  if (!visibilityListenerAttached || typeof document === 'undefined') return;

  document.removeEventListener('visibilitychange', onVisibilityChange);
  visibilityListenerAttached = false;
}

function raf(time: number) {
  lenisInstance?.raf(time);
  rafId = window.requestAnimationFrame(raf);
}

function startRafLoop() {
  if (typeof window === 'undefined' || rafId !== null) return;

  attachVisibilityListener();
  rafId = window.requestAnimationFrame(raf);
}

function getSectionId(target: string | Element) {
  if (target instanceof Element) return target.id || null;

  if (!target.startsWith('#')) return null;

  try {
    return decodeURIComponent(target.slice(1));
  } catch {
    return target.slice(1);
  }
}

function getTargetElement(target: string | Element) {
  if (target instanceof Element) return target;

  const sectionId = getSectionId(target);
  if (sectionId) {
    return document.getElementById(sectionId);
  }

  return document.querySelector(target);
}

function requestSectionRender(sectionId: string | null) {
  if (!sectionId || typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent<SectionNavigationDetail>(SECTION_NAVIGATION_EVENT, { detail: { sectionId } }));
}

function waitForTarget(target: string | Element, maxWaitMs: number): Promise<Element | null> {
  const existingElement = getTargetElement(target);
  if (existingElement) return Promise.resolve(existingElement);

  return new Promise((resolve) => {
    const startedAt = performance.now();
    let frameId: number | null = null;

    const observer = new MutationObserver(() => {
      const element = getTargetElement(target);
      if (!element) return;

      cleanup();
      resolve(element);
    });

    const cleanup = () => {
      observer.disconnect();
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };

    const check = () => {
      const element = getTargetElement(target);
      if (element) {
        cleanup();
        resolve(element);
        return;
      }

      if (performance.now() - startedAt >= maxWaitMs) {
        cleanup();
        resolve(null);
        return;
      }

      frameId = window.requestAnimationFrame(check);
    };

    observer.observe(document.body, { childList: true, subtree: true });
    frameId = window.requestAnimationFrame(check);
  });
}

function updateHash(element: Element, shouldUpdateHash: boolean) {
  if (!shouldUpdateHash || typeof window === 'undefined' || !element.id) return;

  const nextHash = `#${encodeURIComponent(element.id)}`;
  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;

  if (window.location.hash === nextHash) {
    window.history.replaceState(window.history.state, '', nextUrl);
    return;
  }

  window.history.pushState(window.history.state, '', nextUrl);
}

function scrollWithNativeOffset(element: Element, offset: number, behavior: ScrollBehavior) {
  const targetTop = element.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: Math.max(0, targetTop), behavior });
}

export function getLenis() {
  if (typeof window === 'undefined' || prefersReducedMotion()) return null;

  if (!lenisInstance) {
    lenisInstance = new Lenis(defaultOptions);
  }

  return lenisInstance;
}

export async function scrollToTarget(target: string | Element, options: ScrollToTargetOptions = {}) {
  if (typeof window === 'undefined') return;

  const { offset = TOPBAR_OFFSET, updateHash: shouldUpdateHash = true, behavior = 'smooth', maxWaitMs = 1200 } = options;
  const sectionId = getSectionId(target);

  requestSectionRender(sectionId);

  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

  const targetElement = await waitForTarget(target, maxWaitMs);
  if (!targetElement) return;

  updateHash(targetElement, shouldUpdateHash);

  const effectiveBehavior = prefersReducedMotion() ? 'auto' : behavior;
  const lenis = getLenis();

  if (lenis && effectiveBehavior === 'smooth' && targetElement instanceof HTMLElement) {
    startRafLoop();
    lenis.scrollTo(targetElement, { offset });
    return;
  }

  scrollWithNativeOffset(targetElement, offset, effectiveBehavior);
}

export function startLenis() {
  if (typeof window === 'undefined') return;

  mountCount += 1;
  const lenis = getLenis();
  if (!lenis) return;

  startRafLoop();
}

export function stopLenis() {
  if (typeof window === 'undefined') return;

  mountCount = Math.max(0, mountCount - 1);
  if (mountCount > 0) return;

  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }

  detachVisibilityListener();
  lenisInstance?.destroy();
  lenisInstance = null;
}
