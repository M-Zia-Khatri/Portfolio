export function getItem<T = unknown>(key: string, storage: Storage = localStorage): T | undefined {
  const localData = storage.getItem(key);
  if (localData === null) return undefined;
  try {
    return JSON.parse(localData) as T;
  } catch {
    return undefined;
  }
}

export function setItem<T = unknown>(key: string, data: T, storage: Storage = localStorage): void {
  storage.setItem(key, JSON.stringify(data ?? ''));
}

export function removeItem(key: string, storage: Storage = localStorage): void {
  storage.removeItem(key);
}
