import type { Request } from "express";

export type KeyResolver = (req: Request) => string | null;
export type FailBehavior = "open" | "closed";

export interface Tier {
  limit: number;
  interval: number; // seconds
  weight?: number; // defaults to 1 — counts as `weight` requests
}

export interface RateLimitConfig {
  action: string;
  tiers: Tier[];
  keyResolver?: KeyResolver;
  message?: string;
  failBehavior?: FailBehavior;
  skip?: (req: Request) => boolean;
}

export interface FallbackEntry {
  count: number;
  windowStart: number; // unix seconds
}
