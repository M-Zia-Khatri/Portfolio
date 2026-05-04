import { useVerifyOtp } from '@/features/auth/hooks/useVerifyOtp';
import { cn } from '@/shared/utils/cn';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AUTH_CONFIG, OTP_RESEND_COOLDOWN } from '../auth.config';
import { otpSchema, type OtpFields } from '../auth.schema';
import { useApiError } from '../hooks/useApiError';
import { useCooldown } from '../hooks/useCooldown';
// FIX: import the existing useAutoFocus hook instead of duplicating its logic
import { useAutoFocus } from '../hooks/useAutoFocus';
import { DialogShell } from './DialogShell';
import { ApiErrorBanner } from './ui/ApiErrorBanner';
import { FieldError } from './ui/FieldError';
import { SubmitButton } from './ui/SubmitButton';

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface OtpFormProps {
  open: boolean;
  email: string;
  onSuccess: () => void;
  onResend: () => void;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function OtpForm({ open, email, onSuccess, onResend }: OtpFormProps) {
  // FIX: replaced the manual useRef + useEffect + setTimeout focus logic with
  // the existing useAutoFocus hook.
  const otpAutoFocusRef = useAutoFocus<HTMLInputElement>(open);

  // ── API
  const { mutateAsync: verifyOtp, isPending } = useVerifyOtp();
  const { error, clearError, handleError } = useApiError();

  // ── Cooldown
  const cooldown = useCooldown(OTP_RESEND_COOLDOWN, open);

  // ── Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OtpFields>({
    resolver: zodResolver(otpSchema),
  });

  // Destructure RHF's ref so we can merge it with our auto-focus ref.
  const { ref: codeFormRef, ...codeRest } = register('code');

  // Reset form + clear errors when the dialog opens
  useEffect(() => {
    if (!open) return;
    clearError();
    reset();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers
  async function onSubmit(values: OtpFields) {
    clearError();
    try {
      await verifyOtp({ email, otp: values.code });
      onSuccess();
    } catch (err) {
      handleError(err, 'OTP verification failed. Please try again.');
    }
  }

  function handleResend() {
    if (!cooldown.ready) return;
    onResend();
    cooldown.reset();
  }

  return (
    <DialogShell open={open} dialogKey="otp" config={AUTH_CONFIG.otp}>
      <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-5')} noValidate>
        <ApiErrorBanner message={error} />

        {/* OTP input */}
        <div>
          <label
            htmlFor="otp-code"
            className={cn('block text-xs font-medium mb-1.5 tracking-wide select-none')}
            style={{ color: 'var(--gray-11)' }}
          >
            One-time password
          </label>
          <input
            id="otp-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder="000000"
            {...codeRest}
            ref={(el) => {
              // Merge RHF ref + useAutoFocus ref
              codeFormRef(el);
              (otpAutoFocusRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }}
            className={cn(
              'w-full rounded-xl px-4 py-3.5 outline-none',
              'border font-mono transition-none',
              'text-center text-2xl tracking-[0.7em]',
              'placeholder:opacity-20 placeholder:tracking-[0.6em]',
            )}
            style={{
              background: 'var(--gray-3)',
              borderColor: errors.code ? 'var(--red-8, #b91c1c)' : 'var(--gray-6)',
              color: 'var(--gray-12)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.25)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--blue-8)';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px var(--blue-a4), inset 0 1px 3px rgba(0,0,0,0.25)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.code
                ? 'var(--red-8, #b91c1c)'
                : 'var(--gray-6)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.25)';
            }}
            onChange={(e) => {
              // Strip non-digits before RHF sees the value
              e.target.value = e.target.value.replace(/\D/g, '');
              codeRest.onChange(e);
            }}
          />
          <FieldError message={errors.code?.message} />
        </div>

        {/* Divider */}
        <div className={cn('h-px w-full')} style={{ background: 'var(--gray-4)' }} />

        <SubmitButton
          isPending={isPending}
          label="Verify & Sign In →"
          pendingLabel="Verifying code…"
        />

        {/* Resend */}
        <p className={cn('text-center text-xs')} style={{ color: 'var(--gray-10)' }}>
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={!cooldown.ready}
            className={cn(
              'font-semibold transition-colors duration-200 disabled:cursor-not-allowed',
            )}
            style={{
              color: cooldown.ready ? 'var(--blue-11)' : 'var(--gray-9)',
            }}
          >
            {cooldown.ready ? 'Send again' : `Send again (${cooldown.time}s)`}
          </button>
        </p>
      </form>
    </DialogShell>
  );
}
