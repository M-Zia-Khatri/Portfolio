const etagStore = new Map<string, string>();

export const normalizeUrl = (url: string): string => {
  const clean = url.split('?')[0];
  // Match UUID format: 8-4-4-4-12 hex characters (case insensitive)
  return clean.replace(
    /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/gi,
    '/:id',
  );
};

export const setETag = (url: string, etag?: string): void => {
  if (!etag) return;
  const key = normalizeUrl(url);
  etagStore.set(key, etag);
  console.debug(`[ETag Store] Set: ${key} = ${etag}`);
};

export const getETag = (url: string): string | undefined => {
  const key = normalizeUrl(url);
  const etag = etagStore.get(key);
  console.debug(`[ETag Store] Get: ${key} = ${etag || 'miss'}`);
  return etag;
};

export const clearETag = (url: string): void => {
  const key = normalizeUrl(url);
  etagStore.delete(key);
  console.debug(`[ETag Store] Clear: ${key}`);
};

export const clearAllETags = (): void => {
  etagStore.clear();
};
