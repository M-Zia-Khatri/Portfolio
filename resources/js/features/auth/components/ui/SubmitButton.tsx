import { cn } from '@/shared/utils/cn';
import { motion } from 'motion/react';
import { Spinner } from './Spinner';

interface SubmitButtonProps {
  isPending: boolean;
  label: string;
  pendingLabel?: string;
}

export function SubmitButton({ isPending, label, pendingLabel = 'Verifying…' }: SubmitButtonProps) {
  return (
    <motion.button
      type="submit"
      disabled={isPending}
      whileHover={!isPending ? { scale: 1.01 } : {}}
      whileTap={!isPending ? { scale: 0.99 } : {}}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'w-full rounded-xl py-2.5 text-sm font-semibold tracking-wide',
        'mt-1 transition-colors duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'flex items-center justify-center gap-2',
      )}
      style={{
        background: 'linear-gradient(135deg, var(--blue-9) 0%, var(--blue-8) 100%)',
        color: 'var(--blue-contrast)',
        boxShadow: isPending ? 'none' : '0 4px 24px -4px var(--blue-a7)',
      }}
    >
      {isPending ? (
        <>
          <Spinner />
          {pendingLabel}
        </>
      ) : (
        label
      )}
    </motion.button>
  );
}
