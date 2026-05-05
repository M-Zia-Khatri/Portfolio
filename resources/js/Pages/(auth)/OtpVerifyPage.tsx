import { cn } from '@/shared/utils/cn';
import { useForm } from '@inertiajs/react';
import { AUTH_CONFIG, OTP_RESEND_COOLDOWN } from './auth.config';
import { DialogShell } from './components/DialogShell';
import { ApiErrorBanner } from './components/ui/ApiErrorBanner';
import { FieldError } from './components/ui/FieldError';
import { SubmitButton } from './components/ui/SubmitButton';
import { useCooldown } from './hooks/useCooldown';

interface OtpData {
  otp: string;
}

export default function OtpVerifyPage() {
  const cooldown = useCooldown(OTP_RESEND_COOLDOWN, true);
  const { data, setData, post, processing, errors } = useForm<OtpData>({ otp: '' });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    post('/auth/otp-verify');
  }

  function handleResend() {
    if (!cooldown.ready) {
      return;
    }

    post('/auth/login/resend');
    cooldown.reset();
  }

  return (
    <>
      <DialogShell open dialogKey="otp" config={AUTH_CONFIG.otp}>
        <form onSubmit={onSubmit} className={cn('space-y-5')} noValidate>
          <ApiErrorBanner message={null} />
          <div>
            <label
              htmlFor="otp-code"
              className={cn('mb-1.5 block text-xs font-medium tracking-wide select-none')}
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
              value={data.otp}
              onChange={(e) => setData('otp', e.target.value.replace(/\D/g, ''))}
              className={cn(
                'w-full rounded-xl px-4 py-3.5 outline-none',
                'border font-mono transition-none',
                'text-center text-2xl tracking-[0.7em]',
                'placeholder:tracking-[0.6em] placeholder:opacity-20',
              )}
            />
            <FieldError message={errors.otp} />
          </div>
          <div className={cn('h-px w-full')} style={{ background: 'var(--gray-4)' }} />
          <SubmitButton isPending={processing} label="Verify & Sign In →" pendingLabel="Verifying code…" />
          <p className={cn('text-center text-xs')} style={{ color: 'var(--gray-10)' }}>
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={!cooldown.ready}
              className={cn('font-semibold transition-colors duration-200 disabled:cursor-not-allowed')}
              style={{ color: cooldown.ready ? 'var(--blue-11)' : 'var(--gray-9)' }}
            >
              {cooldown.ready ? 'Send again' : `Send again (${cooldown.time}s)`}
            </button>
          </p>
        </form>
      </DialogShell>
    </>
  );
}
