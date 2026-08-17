// index.ts

export { cacheRememberCollection } from "./cache.collections.js";
export { generateCompositeETag, generateETag, matchETag } from "./cache.etag.js";
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

export type {
  CacheConditionalOptions,
  CacheConfig,
  CacheMetrics,
  CacheOptions,
  CachePayload,
  CacheResult,
} from "./cache.types.js";
