// cache.ts
import { EventEmitter } from "node:events";
import { redis } from "../redis.js";
import { isCircuitOpen, recordFailure, recordSuccess } from "./cache.circuit.js";
import {
  CACHE_PREFIX,
  DEFAULT_CONFIG,
  LOCK_RETRY_DELAY,
  MAX_CALLBACK_DURATION_MS,
  SCAN_BATCH_SIZE,
} from "./cache.constants.js";
import { generateETag, matchETag } from "./cache.etag.js";
import { buildKey, buildLockKey } from "./cache.keys.js";
import { acquireLock, acquireLockWithBackoff, releaseLock, sleep } from "./cache.lock.js";
import { deserialize, serialize } from "./cache.serializer.js";
import type {
  CacheConditionalOptions,
  CacheConfig,
  CacheMetrics,
  CacheOptions,
  CachePayload,
  CacheResult,
} from "./cache.types.js";

export { TTL } from "./cache.constants.js";
export type { CacheConfig, CacheMetrics, CacheOptions, CacheResult } from "./cache.types.js";

let config: CacheConfig = DEFAULT_CONFIG;
let metrics: CacheMetrics | null = null;
const events = new EventEmitter();

export function configureCache(userConfig: Partial<CacheConfig>): void {
  config = { ...DEFAULT_CONFIG, ...userConfig };
}

export function setCacheMetrics(m: CacheMetrics): void {
  metrics = m;
}

function withTimeout<T>(promise: Promise<T>, ms: number, context: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${context} timeout after ${ms}ms`)), ms),
    ),
  ]);
}

async function writeToCache<T>(
  redisKey: string,
  data: T,
  ttl: number,
  staleTtl: number,
  etag?: string,
): Promise<void> {
  const startTime = Date.now();
  const payload: CachePayload<T> = {
    data,
    expiry: Date.now() + ttl * 1000,
    etag: etag || generateETag(data),
    lastModified: Date.now(),
  };

  const {
    data: serialized,
    compressed,
    originalSize,
  } = await serialize(payload, config.enableCompression);

  await redis.set(redisKey, serialized, "EX", ttl + staleTtl);

  recordSuccess();

  if (metrics) {
    metrics.recordLatency("write", Date.now() - startTime);
    if (compressed) {
      metrics.recordBytesSaved(originalSize - Buffer.byteLength(serialized));
    }
  }
}

async function readFromCache<T>(redisKey: string): Promise<CachePayload<T> | null> {
  const raw = await redis.get(redisKey);
  if (!raw) return null;

  // Detect compression by checking if it's valid JSON (compressed is base64)
  const isCompressed = raw[0] !== "{";
  return deserialize<T>(raw, isCompressed);
}

function revalidateInBackground<T>(
  redisKey: string,
  lockKey: string,
  ttl: number,
  staleTtl: number,
  callback: () => Promise<T>,
  currentEtag?: string,
): void {
  Promise.resolve()
    .then(async () => {
      const acquired = await acquireLock(lockKey);
      if (!acquired) return;

      try {
        const fresh = await withTimeout(
          callback(),
          config.maxCallbackDurationMs,
          "background-revalidation",
        );

        const newEtag = generateETag(fresh);

        // Skip write if content unchanged (ETag optimization)
        if (currentEtag && currentEtag === newEtag) {
          await redis.expire(redisKey, ttl + staleTtl);
          events.emit("revalidate:unchanged", redisKey);
          return;
        }

        await writeToCache(redisKey, fresh, ttl, staleTtl, newEtag);
        events.emit("revalidate:updated", redisKey);
      } catch (err) {
        recordFailure(err, `background revalidation "${redisKey}"`);
      } finally {
        await releaseLock(lockKey);
      }
    })
    .catch(() => undefined);
}

export async function cacheRemember<T>(key: string, options: CacheOptions<T>): Promise<T> {
  const { ttl, staleTtl = 0, callback } = options;
  const redisKey = buildKey(key);
  const lockKey = buildLockKey(redisKey);

  if (isCircuitOpen()) {
    console.warn(`[cache] BYPASS (circuit open): ${redisKey}`);
    return withTimeout(callback(), options.timeoutMs || MAX_CALLBACK_DURATION_MS, "callback");
  }

  const startTime = Date.now();

  try {
    const payload = await readFromCache<T>(redisKey);

    if (metrics) metrics.recordLatency("read", Date.now() - startTime);

    if (payload) {
      if (payload.expiry > Date.now()) {
        console.debug(`[cache] HIT (fresh): ${redisKey}`);
        if (metrics) metrics.recordHit(redisKey, false);
        return payload.data;
      }

      if (staleTtl > 0) {
        console.debug(`[cache] HIT (stale): ${redisKey}`);
        if (metrics) metrics.recordHit(redisKey, true);
        revalidateInBackground(redisKey, lockKey, ttl, staleTtl, callback, payload.etag);
        return payload.data;
      }
    }

    console.debug(`[cache] MISS: ${redisKey}`);
    if (metrics) metrics.recordMiss(redisKey);
  } catch (err) {
    if (err instanceof Error && err.message.includes("deserialize")) {
      // Corruption recovery
      console.error(`[cache] Corruption detected in ${redisKey}, purging`);
      if (metrics) metrics.recordCorruption(redisKey);
      await redis.del(redisKey).catch(() => undefined);
    } else {
      recordFailure(err, `GET "${redisKey}"`);
    }
  }

  // Cache miss or corrupted - acquire lock and compute
  const acquired = await acquireLockWithBackoff(lockKey);

  if (acquired) {
    try {
      // Double-check after acquiring lock
      const retry = await readFromCache<T>(redisKey);
      if (retry && retry.expiry > Date.now()) {
        console.debug(`[cache] HIT (post-lock): ${redisKey}`);
        return retry.data;
      }

      const data = await withTimeout(
        callback(),
        options.timeoutMs || MAX_CALLBACK_DURATION_MS,
        "callback",
      );

      writeToCache(redisKey, data, ttl, staleTtl).catch((err) =>
        recordFailure(err, `SET "${redisKey}"`),
      );

      return data;
    } finally {
      await releaseLock(lockKey);
    }
  }

  // Failed to acquire lock, wait and retry read
  await sleep(LOCK_RETRY_DELAY);

  try {
    const retry = await readFromCache<T>(redisKey);
    if (retry) {
      console.debug(`[cache] HIT (retry): ${redisKey}`);
      return retry.data;
    }
  } catch (err) {
    recordFailure(err, `GET retry "${redisKey}"`);
  }

  // Final fallback
  return withTimeout(callback(), options.timeoutMs || MAX_CALLBACK_DURATION_MS, "callback");
}

export async function cacheRememberConditional<T>(
  key: string,
  options: CacheConditionalOptions<T>,
): Promise<CacheResult<T>> {
  const { ifNoneMatch, ifMatch, ttl, staleTtl = 0, callback } = options;
  const redisKey = buildKey(key);
  const lockKey = buildLockKey(redisKey);

  if (isCircuitOpen()) {
    const data = await withTimeout(
      callback(),
      options.timeoutMs || MAX_CALLBACK_DURATION_MS,
      "callback",
    );
    return {
      data,
      etag: generateETag(data),
      status: 200,
      hit: false,
      stale: false,
    };
  }

  try {
    const payload = await readFromCache<T>(redisKey);

    if (payload) {
      // Optimistic locking check
      if (ifMatch && !matchETag(ifMatch, payload.etag)) {
        return { etag: payload.etag, status: 412, hit: true, stale: false };
      }

      // 304 Not Modified check (fresh cache)
      if (payload.expiry > Date.now()) {
        if (ifNoneMatch && matchETag(ifNoneMatch, payload.etag)) {
          return { etag: payload.etag, status: 304, hit: true, stale: false };
        }

        return {
          data: payload.data,
          etag: payload.etag,
          status: 200,
          hit: true,
          stale: false,
        };
      }

      // Stale-while-revalidate
      if (staleTtl > 0) {
        // Only revalidate if client doesn't have current version
        if (!ifNoneMatch || !matchETag(ifNoneMatch, payload.etag)) {
          revalidateInBackground(redisKey, lockKey, ttl, staleTtl, callback, payload.etag);
        }

        return {
          data: payload.data,
          etag: payload.etag,
          status: 200,
          hit: true,
          stale: true,
        };
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("deserialize")) {
      await redis.del(redisKey).catch(() => undefined);
    } else {
      recordFailure(err, `GET conditional "${redisKey}"`);
    }
  }

  // Compute fresh value
  const data = await withTimeout(
    callback(),
    options.timeoutMs || MAX_CALLBACK_DURATION_MS,
    "callback",
  );
  const newEtag = generateETag(data);

  await writeToCache(redisKey, data, ttl, staleTtl, newEtag).catch((err) =>
    recordFailure(err, `SET conditional "${redisKey}"`),
  );

  return {
    data,
    etag: newEtag,
    status: 200,
    hit: false,
    stale: false,
  };
}

export async function cachePut<T>(key: string, value: T, ttl: number): Promise<void> {
  if (isCircuitOpen()) return;
  const redisKey = buildKey(key);

  try {
    await writeToCache(redisKey, value, ttl, 0);
    console.info(`[cache] PUT: ${redisKey}`);
  } catch (err) {
    recordFailure(err, `cachePut "${redisKey}"`);
  }
}

export async function cacheForget(key: string): Promise<void> {
  if (isCircuitOpen()) return;
  const redisKey = buildKey(key);

  try {
    await redis.del(redisKey);
    recordSuccess();
    console.info(`[cache] FORGET: ${redisKey}`);
  } catch (err) {
    recordFailure(err, `cacheForget "${redisKey}"`);
  }
}

export async function cacheInvalidatePrefix(prefix: string): Promise<number> {
  if (isCircuitOpen()) return 0;

  const pattern = `${CACHE_PREFIX}:${prefix}:*`;
  let cursor = "0";
  let totalDeleted = 0;

  try {
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        SCAN_BATCH_SIZE,
      );

      cursor = nextCursor;

      if (keys.length > 0) {
        // Stream deletes in batches to avoid memory buildup
        const pipeline = redis.pipeline();
        keys.forEach((k: any) => {
          pipeline.del(k);
        });
        await pipeline.exec();
        totalDeleted += keys.length;
      }
    } while (cursor !== "0");

    console.info(`[cache] Invalidated prefix "${prefix}": ${totalDeleted} key(s)`);
    recordSuccess();
    return totalDeleted;
  } catch (err) {
    recordFailure(err, `cacheInvalidatePrefix "${prefix}"`);
    return 0;
  }
}

export function onCacheEvent(
  event: "revalidate:unchanged" | "revalidate:updated",
  handler: (key: string) => void,
): void {
  events.on(event, handler);
}
