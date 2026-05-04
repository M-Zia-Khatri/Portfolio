import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;
let mountCount = 0;
let visibilityListenerAttached = false;

const TOPBAR_OFFSET = -96;

const defaultOptions: ConstructorParameters<typeof Lenis>[0] = {
  duration: 1.05,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.25,
};

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
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

  if (mountCount > 0 && rafId === null && lenisInstance) {
    rafId = window.requestAnimationFrame(raf);
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

export function getLenis() {
  if (typeof window === 'undefined' || prefersReducedMotion()) return null;

  if (!lenisInstance) {
    lenisInstance = new Lenis(defaultOptions);
  }

  return lenisInstance;
}

export function scrollToTarget(target: string | Element, offset = TOPBAR_OFFSET) {
  if (typeof window === 'undefined') return;

  const lenis = getLenis();
  if (lenis) {
    if (target instanceof HTMLElement) {
      lenis.scrollTo(target, { offset });
    } else if (typeof target === 'string') {
      lenis.scrollTo(target, { offset });
    }
    return;
  }

  if (typeof target === 'string') {
    const targetElement = document.querySelector(target);
    if (targetElement instanceof Element) {
      targetElement.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
    return;
  }

  target.scrollIntoView({ behavior: 'auto', block: 'start' });
}

export function startLenis() {
  if (typeof window === 'undefined') return;

  mountCount += 1;
  const lenis = getLenis();
  if (!lenis || rafId !== null) return;

  attachVisibilityListener();
  rafId = window.requestAnimationFrame(raf);
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
