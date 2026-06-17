import * as IORedis from "ioredis";
import { getConfig } from "../../config/env.js";

const { redis: redisConfig } = getConfig();

const redis = new IORedis.Redis({
  host: redisConfig.host,
  port: Number(redisConfig.port) || 6379,
});

redis.on("connect", () => {
  console.log("🔴 Redis connected");
});

redis.on("error", (err: Error) => {
  console.error("Redis error:", err);
});

export { redis };

import { configureCache, setCacheMetrics } from "./caching/cache.js";

// Configure global settings
configureCache({
  failureThreshold: 5, // More tolerant
  recoveryWindowMs: 60_000, // 1 minute recovery
  enableCompression: true, // Compress large payloads
  maxCallbackDurationMs: 10_000, // 10s timeout
});

// Optional: Setup metrics (OpenTelemetry, StatsD, etc.)
setCacheMetrics({
  recordHit: (key, stale) => console.log(`[metric] hit: ${key} (stale: ${stale})`),
  recordMiss: (key) => console.log(`[metric] miss: ${key}`),
  recordLatency: (op, ms) => console.log(`[metric] ${op}: ${ms}ms`),
  recordCircuitStateChange: (state) => console.warn(`[metric] circuit: ${state}`),
  recordCorruption: (key) => console.error(`[metric] corruption: ${key}`),
  recordBytesSaved: (bytes) => console.log(`[metric] compression saved: ${bytes}B`),
});
