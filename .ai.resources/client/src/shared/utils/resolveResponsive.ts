export type BreakpointKey = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export type ResponsiveValue<T = unknown> = Partial<Record<BreakpointKey, T>> & {
  custom?: Record<number, T>;
};

export const breakpoints: Record<Exclude<BreakpointKey, 'desktop'>, number> = {
  mobile: 640,
  tablet: 1024,
  laptop: 1280,
} as const;

// Pre-sorted descending at module load — paid once, not per call
const SORTED_BREAKPOINT_ENTRIES = (
  Object.entries(breakpoints) as [Exclude<BreakpointKey, 'desktop'>, number][]
).sort(([, a], [, b]) => b - a);

function getWidth(): number {
  return typeof window !== 'undefined' ? window.innerWidth : 0;
}

/**
 * Validates a `custom` map at construction time so errors surface early,
 * not buried inside a render cycle.
 */
export function createResponsiveValue<T>(value: ResponsiveValue<T>): ResponsiveValue<T> {
  if (value.custom) {
    for (const key of Object.keys(value.custom)) {
      if (Number.isNaN(Number(key))) {
        throw new Error(`Invalid key "${key}" in "custom". All keys must be numeric.`);
      }
    }
  }
  return value;
}

/**
 * Resolves a ResponsiveValue to a concrete value based on the current viewport width.
 *
 * Resolution order:
 *   1. Named breakpoints (mobile → tablet → laptop → desktop), matched exactly.
 *   2. If no exact match, cascades down to the nearest smaller defined breakpoint.
 *   3. Falls back to `custom` keys (sorted descending), returning the first
 *      whose threshold is ≤ the current width.
 *
 * @param obj - The responsive value map to resolve.
 * @returns The resolved value, or `undefined` if nothing matches.
 */
export function resolveResponsive<T>(obj: ResponsiveValue<T>): T | undefined {
  const width = getWidth();

  // --- 1. Exact named breakpoint match ---
  if (obj.desktop !== undefined && width > breakpoints.laptop) return obj.desktop;
  if (obj.laptop !== undefined && width > breakpoints.tablet && width <= breakpoints.laptop)
    return obj.laptop;
  if (obj.tablet !== undefined && width > breakpoints.mobile && width <= breakpoints.tablet)
    return obj.tablet;
  if (obj.mobile !== undefined && width <= breakpoints.mobile) return obj.mobile;

  // --- 2. Cascade: nearest smaller defined breakpoint ---
  // e.g. only mobile + desktop defined → tablet width falls back to mobile
  for (const [key, threshold] of SORTED_BREAKPOINT_ENTRIES) {
    if (obj[key] !== undefined && width > threshold) {
      return obj[key];
    }
  }
  // Smallest named breakpoint as final cascade
  if (obj.mobile !== undefined) return obj.mobile;

  // --- 3. Custom breakpoints fallback (sorted descending, validated at creation) ---
  if (obj.custom) {
    const sortedKeys = Object.keys(obj.custom)
      .map(Number)
      .sort((a, b) => b - a);

    for (const threshold of sortedKeys) {
      if (width >= threshold) return obj.custom[threshold];
    }
  }

  return undefined;
}
