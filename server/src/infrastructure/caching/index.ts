// index.ts

export {
  cacheForget,
  cacheInvalidatePrefix,
  cachePut,
  cacheRemember,
  cacheRememberConditional,
  configureCache,
  onCacheEvent,
  setCacheMetrics,
  TTL,
} from "./cache.js";
export { cacheRememberCollection } from "./collections.js";
export { generateCompositeETag, generateETag, matchETag } from "./etag.js";

export type {
  CacheConditionalOptions,
  CacheConfig,
  CacheMetrics,
  CacheOptions,
  CachePayload,
  CacheResult,
} from "./types.js";
