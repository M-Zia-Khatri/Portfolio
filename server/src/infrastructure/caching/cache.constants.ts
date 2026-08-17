// cache.constants.ts
import type { CacheConfig } from "./cache.types.js";

export const TTL = {
  ONE_MINUTE: 60,
  FIVE_MINUTES: 60 * 5,
  FIFTEEN_MINUTES: 60 * 15,
  HALF_HOUR: 60 * 30,
  FOURTYFIVE_MINUTES: 60 * 45,
  ONE_HOUR: 60 * 60,
  ONE_DAY: 60 * 60 * 24,
  ONE_WEEK: 60 * 60 * 24 * 7,
} as const;

export const CACHE_PREFIX = "app:cache";
export const LOCK_TTL_SECONDS = 5;
export const LOCK_RETRY_DELAY = 100;
export const MAX_LOCK_RETRIES = 3;
export const FAILURE_THRESHOLD = 3;
export const RECOVERY_WINDOW_MS = 30_000;
export const MAX_CALLBACK_DURATION_MS = 30_000;
export const MAX_PAYLOAD_BYTES = 1024 * 1024; // 1MB
export const COMPRESSION_THRESHOLD_BYTES = 1024; // Compress if > 1KB
export const SCAN_BATCH_SIZE = 100;

export const DEFAULT_CONFIG: CacheConfig = {
  failureThreshold: 3,
  recoveryWindowMs: 30000,
  lockTtlSeconds: 5,
  lockRetryDelay: 100,
  maxLockRetries: 3,
  maxCallbackDurationMs: 30000,
  maxPayloadBytes: 1024 * 1024,
  compressionThresholdBytes: 1024,
  enableCompression: false,
};
