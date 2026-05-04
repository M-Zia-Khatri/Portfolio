import { useCallback, useEffect, useState } from 'react';

const VISITED_KEY = 'visited';

/**
 * Isolates landing-page visit persistence so routing/UI remain clean.
 */
export function useHasVisited() {
  const [hasVisited, setHasVisited] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setHasVisited(window.localStorage.getItem(VISITED_KEY) === 'true');
    setHydrated(true);
  }, []);

  const markVisited = useCallback(() => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(VISITED_KEY, 'true');
    setHasVisited(true);
  }, []);

  return { hasVisited, hydrated, markVisited };
}
