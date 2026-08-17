import type { FallbackEntry } from "./rate-limit.types.js";

// In-memory fallback store.
// Activated only when Redis is unavailable AND failBehavior === "open".
// Uses lazy eviction — no background timer or setInterval needed.

const fallbackStore = new Map<string, FallbackEntry>();
const FALLBACK_MAX_KEYS = 5_000; // hard cap to prevent unbounded memory growth

/**
 * Check and record a request against the in-memory fallback store.
 * Returns `true` (allow) or `false` (block).
 */
export function fallbackCheck(
  key: string,
  interval: number,
  limit: number,
  weight: number,
): boolean {
  const now = Date.now() / 1000;
  const entry = fallbackStore.get(key);

  // No entry or window expired → start a fresh window
  if (!entry || now - entry.windowStart >= interval) {
    if (fallbackStore.size >= FALLBACK_MAX_KEYS && !fallbackStore.has(key)) {
      // Evict insertion-oldest key when at capacity
      const oldestKey = fallbackStore.keys().next().value;
      if (oldestKey) fallbackStore.delete(oldestKey);
    }
    fallbackStore.set(key, { count: weight, windowStart: now });
    return true; // allow
  }

  if (entry.count + weight > limit) return false; // block

  entry.count += weight;
  return true; // allow
}
