import { cn } from '@/shared/utils/cn';
import { AnimatePresence, motion } from 'motion/react';

interface ApiErrorBannerProps {
  message?: string;
}

export function ApiErrorBanner({ message }: ApiErrorBannerProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          role="alert"
          aria-live="assertive"
          className={cn('rounded-xl border px-4 py-3 font-mono text-sm')}
          style={{
            background: 'color-mix(in srgb, var(--red-3, #450a0a) 70%, transparent)',
            borderColor: 'var(--red-6, #7f1d1d)',
            color: 'var(--red-11, #fca5a5)',
          }}
        >
          ⚠ {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
