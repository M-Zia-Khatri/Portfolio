import type { Request, Response } from "express";

/**
 * Build a Redis key with a cluster hash tag.
 *
 * Hash tag `{identity}` forces all keys for the same user / IP onto the
 * same Redis Cluster slot. Without this, EVAL on cross-slot keys fails
 * in cluster mode.
 *
 * Pattern: rl:{<identity>}:<action>:<interval>
 */
export function buildRedisKey(action: string, identity: string, interval: number): string {
  return `rl:{${identity}}:${action}:${interval}`;
}

/**
 * Extract the client IP, respecting X-Forwarded-For from a trusted proxy.
 */
export function getIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"] as string | undefined;
  return forwarded?.split(",")[0]?.trim() ?? req.socket?.remoteAddress ?? "unknown";
}

/**
 * Generate a per-request unique ID used as a Lua sorted-set member prefix.
 * Collision probability is negligible for rate-limiting purposes.
 */
export function uniqueRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Set IETF RateLimit response headers.
 *
 * Follows draft-ietf-httpapi-ratelimit-headers-08:
 *   RateLimit-Policy    → active policy:  limit;w=interval
 *   RateLimit-Limit     → window limit
 *   RateLimit-Remaining → slots left in this window
 *   RateLimit-Reset     → seconds until window resets (relative)
 *   Retry-After         → kept for backwards-compat with older clients
 */
export function setRateLimitHeaders(
  res: Response,
  limit: number,
  remaining: number,
  resetAt: number,
  interval: number,
): void {
  const resetIn = Math.max(0, Math.ceil(resetAt - Date.now() / 1000));

  res.set({
    "RateLimit-Policy": `${limit};w=${interval}`,
    "RateLimit-Limit": String(limit),
    "RateLimit-Remaining": String(remaining),
    "RateLimit-Reset": String(resetIn),
    "Retry-After": String(resetIn),
  });
}
