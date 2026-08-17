// cache.collections.ts
import { cacheRememberConditional } from "./cache.js";
import type { CacheOptions, CacheResult } from "./cache.types.js";

export interface CollectionOptions<T> extends CacheOptions<T> {
  itemKeys: string[]; // Keys of items that compose this collection
}

export async function cacheRememberCollection<T>(
  listKey: string,
  options: CollectionOptions<T>,
): Promise<CacheResult<T>> {
  const { itemKeys, ...cacheOptions } = options;

  // For conditional requests, we need to check if any item changed
  // This is a simplified version; production might use a tag index
  const result = await cacheRememberConditional(listKey, {
    ...cacheOptions,
    callback: async () => {
      const data = await cacheOptions.callback();
      return {
        data,
        _metadata: {
          itemKeys,
          timestamp: Date.now(),
        },
      };
    },
  });

  if (result.data && "_metadata" in result.data) {
    const { data, _metadata } = result.data as any;
    return {
      ...result,
      data,
    };
  }

  return result as CacheResult<T>;
}
