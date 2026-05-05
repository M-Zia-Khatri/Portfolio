import AuthLayout from './Layout';
import { ApiErrorBanner } from './components/ui/ApiErrorBanner';
import { FieldError } from './components/ui/FieldError';
import { SubmitButton } from './components/ui/SubmitButton';
import { cn } from '@/shared/utils/cn';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { useCallback, useRef, useState } from 'react';

function getInputStyle(hasError: boolean): React.CSSProperties {
  return {
    background: 'var(--gray-3)',
    borderColor: hasError ? 'var(--red-8, #b91c1c)' : 'var(--gray-6)',
    color: 'var(--gray-12)',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.25)',
  };
}

export default function Login() {
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing, errors } = useForm({ email: '', password: '' });

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => {
      const next = !prev;
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      if (next) {
        hideTimerRef.current = setTimeout(() => setShowPassword(false), 5_000);
      }
      return next;
    });
  }, []);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    post(route('auth.login'));
  }

  return (
    <AuthLayout step='login'>
      <form onSubmit={submit} className={cn('space-y-5')} noValidate>
        <ApiErrorBanner message={typeof errors.email === 'string' ? errors.email : ''} />
        <div>
          <label htmlFor='login-email' className={cn('mb-1.5 block text-xs font-medium tracking-wide select-none')} style={{ color: 'var(--gray-11)' }}>
            Email address
          </label>
          <input id='login-email' type='email' autoComplete='email' placeholder='admin@example.com' value={data.email} onChange={(e) => setData('email', e.target.value)} className={cn('w-full rounded-xl px-4 py-2.5 text-sm outline-none', 'border font-mono transition-none placeholder:opacity-25')} style={getInputStyle(!!errors.email)} />
          <FieldError message={errors.email} />
        </div>

        <div>
          <label htmlFor='login-password' className={cn('mb-1.5 block text-xs font-medium tracking-wide select-none')} style={{ color: 'var(--gray-11)' }}>
            Password
          </label>
          <div className='relative'>
            <input id='login-password' type={showPassword ? 'text' : 'password'} autoComplete='current-password' placeholder='••••••••' value={data.password} onChange={(e) => setData('password', e.target.value)} className={cn('w-full rounded-xl px-4 py-2.5 pr-11 text-sm outline-none', 'border font-mono transition-none placeholder:opacity-40')} style={getInputStyle(!!errors.password)} />
            <button type='button' tabIndex={-1} onClick={handleTogglePassword} aria-label={showPassword ? 'Hide password' : 'Show password'} className={cn('absolute top-1/2 right-3 -translate-y-1/2', 'transition-colors duration-150')} style={{ color: 'var(--gray-9)' }}>
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
          <FieldError message={errors.password} />
        </div>
        <div className={cn('h-px w-full')} style={{ background: 'var(--gray-4)' }} />
        <SubmitButton isPending={processing} label='Continue →' />
      </form>
    </AuthLayout>
  );
}
