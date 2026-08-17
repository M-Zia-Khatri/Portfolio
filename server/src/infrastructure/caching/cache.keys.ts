// cache.keys.ts
import { CACHE_PREFIX } from "./cache.constants.js";

export function buildKey(key: string): string {
  return `${CACHE_PREFIX}:${key}`;
}

export function buildLockKey(redisKey: string): string {
  return `${redisKey}:lock`;
}

export function buildTagKey(tag: string): string {
  return `${CACHE_PREFIX}:_tags:${tag}`;
}

export function parseKey(redisKey: string): string | null {
  if (!redisKey.startsWith(`${CACHE_PREFIX}:`)) return null;
  return redisKey.slice(CACHE_PREFIX.length + 1);
}
