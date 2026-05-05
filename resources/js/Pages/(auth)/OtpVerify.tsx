import { useForm } from '@inertiajs/react';
import { cn } from '@/shared/utils/cn';
import AuthLayout from './Layout';
import { OTP_RESEND_COOLDOWN } from './auth.config';
import { useCooldown } from './hooks/useCooldown';
import { ApiErrorBanner } from './components/ui/ApiErrorBanner';
import { FieldError } from './components/ui/FieldError';
import { SubmitButton } from './components/ui/SubmitButton';

export default function OtpVerify() {
  const cooldown = useCooldown(OTP_RESEND_COOLDOWN, true);
  const { data, setData, post, processing, errors } = useForm({ otp: '' });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    post(route('auth.otp.verify'));
  }

  function resendOtp() {
    if (!cooldown.ready) {
      return;
    }

    post(route('auth.login.resend'));
    cooldown.reset();
  }

  return (
    <AuthLayout step='otp'>
      <form onSubmit={submit} className={cn('space-y-5')} noValidate>
        <ApiErrorBanner message={typeof errors.otp === 'string' ? errors.otp : ''} />
        <div>
          <label htmlFor='otp-code' className={cn('mb-1.5 block text-xs font-medium tracking-wide select-none')} style={{ color: 'var(--gray-11)' }}>
            One-time password
          </label>
          <input id='otp-code' type='text' inputMode='numeric' maxLength={6} autoComplete='one-time-code' placeholder='000000' value={data.otp} onChange={(e) => setData('otp', e.target.value.replace(/\D/g, ''))} className={cn('w-full rounded-xl px-4 py-3.5 outline-none', 'border font-mono transition-none', 'text-center text-2xl tracking-[0.7em]', 'placeholder:tracking-[0.6em] placeholder:opacity-20')} style={{ background: 'var(--gray-3)', borderColor: errors.otp ? 'var(--red-8, #b91c1c)' : 'var(--gray-6)', color: 'var(--gray-12)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.25)' }} />
          <FieldError message={errors.otp} />
        </div>
        <div className={cn('h-px w-full')} style={{ background: 'var(--gray-4)' }} />
        <SubmitButton isPending={processing} label='Verify & Sign In →' pendingLabel='Verifying code…' />
        <p className={cn('text-center text-xs')} style={{ color: 'var(--gray-10)' }}>
          Didn't receive the code?{' '}
          <button type='button' onClick={resendOtp} disabled={!cooldown.ready} className={cn('font-semibold transition-colors duration-200 disabled:cursor-not-allowed')} style={{ color: cooldown.ready ? 'var(--blue-11)' : 'var(--gray-9)' }}>
            {cooldown.ready ? 'Send again' : `Send again (${cooldown.time}s)`}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
