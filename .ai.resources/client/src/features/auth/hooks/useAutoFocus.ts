import { useEffect, useRef } from 'react';

export function useAutoFocus<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => ref.current?.focus(), 80);
    return () => clearTimeout(id);
  }, [active]);

  return ref;
}
