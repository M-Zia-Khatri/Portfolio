// cache.collections.ts
import { cacheRememberConditional } from "./cache.js";
import type { CacheOptions, CacheResult } from "./types.js";

export interface CollectionOptions<T> extends CacheOptions<T> {
  itemKeys: string[]; // Keys of items that compose this collection
}

export async function cacheRememberCollection<T>(
  listKey: string,
  options: CollectionOptions<T>,
): Promise<CacheResult<T>> {
  const { itemKeys, ...cacheOptions } = options;

  type CollectionCacheValue = {
    data: T;
    _metadata: {
      itemKeys: string[];
      timestamp: number;
    };
  };

  // For conditional requests, we need to check if any item changed
  // This is a simplified version; production might use a tag index
  const result = (await cacheRememberConditional(listKey, {
    ...cacheOptions,
    callback: async (): Promise<CollectionCacheValue> => {
      const data = await cacheOptions.callback();
      return {
        data,
        _metadata: {
          itemKeys,
          timestamp: Date.now(),
        },
      };
    },
  })) as CacheResult<CollectionCacheValue>;

  if (result.data && typeof result.data === "object" && "_metadata" in result.data) {
    const cached = result.data as CollectionCacheValue;
    return {
      ...result,
      data: cached.data,
    } as CacheResult<T>;
  }

  return result as CacheResult<T>;
}
