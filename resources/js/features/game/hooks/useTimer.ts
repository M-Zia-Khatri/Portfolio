import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTimerOptions {
  initialTime: number; // seconds to count down from
  isActive: boolean; // whether the timer should be running
  onExpire?: () => void; // called once when timer reaches zero
}

export default function useTimer({ initialTime, isActive, onExpire }: UseTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const intervalRef = useRef<number | null>(null);
  const onExpireRef = useRef(onExpire);

  // Keep onExpire ref up to date without re-subscribing the effect
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Reset whenever initialTime changes
  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  // Start / stop the interval
  useEffect(() => {
    // clear any existing interval
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!isActive) return;

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // time’s up
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          onExpireRef.current?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive]);

  // Public API
  const reset = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimeLeft(initialTime);
  }, [initialTime]);

  const pause = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    // simply re-activates via the `isActive` prop; can combine with reset if desired
  }, []);

  return { timeLeft, reset, pause, start };
}
