import { useCallback, useEffect, useState } from 'react';

export function useCooldown(initial: number, active: boolean) {
  const [time, setTime] = useState(initial);

  // Reset when the dialog opens (active flips true)
  useEffect(() => {
    if (active) setTime(initial);
  }, [active, initial]);

  useEffect(() => {
    if (!active || time <= 0) return;
    const t = setTimeout(() => setTime((c) => c - 1), 1_000);
    return () => clearTimeout(t);
  }, [time, active]);

  const reset = useCallback(() => setTime(initial), [initial]);

  return { time, reset, ready: time <= 0 };
}
