import { useCallback, useEffect, useRef, useState } from 'react';

interface UseGameTimerOptions {
  initialTime: number;
  isActive: boolean;
  onExpire?: () => void;
}

export default function useGameTimer({ initialTime, isActive, onExpire }: UseGameTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const intervalRef = useRef<number | null>(null);
  const timeLeftRef = useRef(initialTime);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    timeLeftRef.current = initialTime;
    setTimeLeft(initialTime);
  }, [initialTime]);

  const clearRunningInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearRunningInterval();
    timeLeftRef.current = initialTime;
    setTimeLeft(initialTime);
  }, [clearRunningInterval, initialTime]);

  useEffect(() => {
    clearRunningInterval();
    if (!isActive) return;

    intervalRef.current = window.setInterval(() => {
      const next = Math.max(timeLeftRef.current - 1, 0);
      timeLeftRef.current = next;
      setTimeLeft(next);

      if (next === 0) {
        clearRunningInterval();
        onExpireRef.current?.();
      }
    }, 1000);

    return clearRunningInterval;
  }, [clearRunningInterval, isActive]);

  return { timeLeft, reset };
}
