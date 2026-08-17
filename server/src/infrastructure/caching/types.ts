// cache.types.ts
export interface CachePayload<T> {
  data: T;
  expiry: number;
  etag: string;
  lastModified: number;
}

export interface CacheOptions<T> {
  ttl: number;
  staleTtl?: number;
  callback: () => Promise<T>;
  timeoutMs?: number; // Callback timeout
}

export interface CacheConditionalOptions<T> extends CacheOptions<T> {
  ifNoneMatch?: string; // For 304 Not Modified
  ifMatch?: string; // For optimistic locking (412 Precondition Failed)
}

export interface CacheResult<T> {
  data?: T;
  etag: string;
  status: 200 | 304 | 412;
  hit: boolean;
  stale: boolean;
}

export interface CacheConfig {
  failureThreshold: number;
  recoveryWindowMs: number;
  lockTtlSeconds: number;
  lockRetryDelay: number;
  maxLockRetries: number;
  maxCallbackDurationMs: number;
  maxPayloadBytes: number;
  compressionThresholdBytes: number;
  enableCompression: boolean;
}

export interface CacheMetrics {
  recordHit(key: string, stale: boolean): void;
  recordMiss(key: string): void;
  recordLatency(operation: string, durationMs: number): void;
  recordCircuitStateChange(state: "CLOSED" | "OPEN" | "HALF_OPEN"): void;
  recordCorruption(key: string): void;
  recordBytesSaved(bytes: number): void;
}
