const STORAGE_KEY = 'debugHeroBg';
const QUERY_KEYS = ['debugHeroBg', 'heroBgDebug'] as const;

/**
 * Opt-in debug for the hero background (development only).
 * Enable with URL `?debugHeroBg=1` or `sessionStorage.setItem('debugHeroBg','1')`.
 */
export function isBgSceneDebugEnabled(): boolean {
  if (!import.meta.env.DEV) {
    return false;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  try {
    if (window.sessionStorage.getItem(STORAGE_KEY) === '1') {
      return true;
    }
    const params = new URLSearchParams(window.location.search);
    for (const key of QUERY_KEYS) {
      if (params.has(key)) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

export function bgSceneDebug(label: string, payload: Record<string, unknown>): void {
  if (!isBgSceneDebugEnabled()) {
    return;
  }

  console.debug(`[BgScene] ${label}`, payload);
}
