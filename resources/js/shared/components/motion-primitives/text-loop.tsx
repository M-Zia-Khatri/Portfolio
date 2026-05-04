import { cn } from '@/shared/utils/cn';
import { Children, useEffect, useState } from 'react';

type Transition = {
  duration?: number;
  [key: string]: unknown;
};

export type TextLoopProps = {
  children: React.ReactNode[];
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: unknown;
  onIndexChange?: (index: number) => void;
  trigger?: boolean;
  mode?: string;
};

export function TextLoop({
  children,
  className,
  interval = 2,
  transition = { duration: 0.3 },
  variants: _variants,
  onIndexChange,
  trigger = true,
  mode = 'popLayout',
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);

  useEffect(() => {
    if (!trigger) return;

    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((current) => {
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, trigger]);

  const animationDuration = transition.duration ?? 0.3;

  return (
    <div className={cn('relative inline-block whitespace-nowrap', className)}>
      <div
        key={`${mode}-${currentIndex}`}
        style={{ animationDuration: `${animationDuration}s` }}
        className="animate-[fadeUp_ease_forwards]"
      >
        {items[currentIndex]}
      </div>
    </div>
  );
}
