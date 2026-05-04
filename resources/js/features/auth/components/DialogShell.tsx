import { AnimatePresence, motion, type Variants } from 'motion/react';
// FIX: replaced AlertDialog with Dialog.
// AlertDialog is semantically for destructive confirmation prompts (delete,
// overwrite). It uses role="alertdialog" which screen readers announce
// immediately and interrupt the user — wrong for a login form.
// Dialog uses role="dialog", closes on Escape by default, and is the correct
// primitive for any form or informational overlay.
import { cn } from '@/shared/utils/cn';
import { Dialog } from 'radix-ui';
import type { AuthStepConfig } from '../types';

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 18 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 360,
      damping: 28,
      mass: 0.9,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 10,
    transition: { duration: 0.17, ease: 'easeIn' },
  },
};

// ─── PROPS ───────────────────────────────────────────────────────────────────

interface DialogShellProps {
  open: boolean;
  dialogKey: string;
  config: AuthStepConfig;
  children: React.ReactNode;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function DialogShell({ open, dialogKey, config, children }: DialogShellProps) {
  return (
    <Dialog.Root open={open}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Overlay */}
            <Dialog.Overlay asChild>
              <motion.div
                key={`${dialogKey}-overlay`}
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn('fixed inset-0 z-50')}
                style={{
                  background: 'rgba(2, 6, 8, 0.88)',
                  backdropFilter: 'blur(8px)',
                }}
              />
            </Dialog.Overlay>

            {/* Panel */}
            <Dialog.Content asChild onOpenAutoFocus={(e) => e.preventDefault()}>
              <motion.div
                key={`${dialogKey}-panel`}
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(
                  'fixed left-1/2 top-1/2 z-50',
                  'w-[calc(100%-2rem)] max-w-108',
                  '-translate-x-1/2 -translate-y-1/2',
                  'rounded-2xl border p-8 shadow-2xl outline-none',
                )}
                style={{
                  background: 'linear-gradient(155deg, var(--gray-2) 0%, var(--gray-1) 100%)',
                  borderColor: 'var(--gray-5)',
                  boxShadow: [
                    '0 0 0 1px var(--gray-4)',
                    '0 32px 96px -12px rgba(0,0,0,0.7)',
                    '0 0 48px -8px rgba(112, 193, 229, 0.07)',
                  ].join(', '),
                }}
              >
                {/* Pulse badge */}
                <div className={cn('flex items-center gap-2 mb-6')}>
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className={cn('inline-block w-2 h-2 rounded-full shrink-0')}
                    style={{
                      background: 'var(--blue-9)',
                      boxShadow: '0 0 10px var(--blue-9)',
                    }}
                  />
                  <span
                    className={cn('text-[10px] font-mono uppercase tracking-[0.18em]')}
                    style={{ color: 'var(--blue-11)' }}
                  >
                    {config.badge}
                  </span>
                </div>

                {/* Title & description */}
                <Dialog.Title asChild>
                  <h2
                    className={cn('text-[1.65rem] font-semibold tracking-tight leading-none mb-2')}
                    style={{
                      color: 'var(--gray-12)',
                      fontFamily: "'DM Serif Display', Georgia, serif",
                    }}
                  >
                    {config.title}
                  </h2>
                </Dialog.Title>

                <Dialog.Description asChild>
                  <p className={cn('text-sm mb-7')} style={{ color: 'var(--gray-10)' }}>
                    {config.description}
                  </p>
                </Dialog.Description>

                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
