import { useEffect, useState } from 'react';

const MOTION_QUERY = '(prefers-reduced-motion: no-preference)';

/**
 * Whether the hero may render the animated SVG background.
 * Deferred to client-only so SSR / hydration both start without the scene
 * (no mismatch). Updates when the user toggles reduced-motion at OS level.
 */
export function useHeroAnimatedBackground(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOTION_QUERY);

    const sync = (): void => {
      setEnabled(mq.matches);
    };

    sync();

    mq.addEventListener('change', sync);

    return () => {
      mq.removeEventListener('change', sync);
    };
  }, []);

  return enabled;
}
