import { cn } from '@/shared/utils/cn';
import { useForm } from '@inertiajs/react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AUTH_CONFIG } from './auth.config';
import { DialogShell } from './components/DialogShell';
import { ApiErrorBanner } from './components/ui/ApiErrorBanner';
import { FieldError } from './components/ui/FieldError';
import { SubmitButton } from './components/ui/SubmitButton';
import { useApiError } from './hooks/useApiError';
import { useAutoFocus } from './hooks/useAutoFocus';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const emailAutoFocusRef = useAutoFocus<HTMLInputElement>(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { error, clearError, handleError } = useApiError();
  const { data, setData, post, processing, errors, reset } = useForm<LoginFormData>({ email: '', password: '' });

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearError();
    post('/auth/login', {
      onError: () => handleError(new Error('Login failed. Please try again.'), 'Login failed. Please try again.'),
      onSuccess: () => {
        reset('password');
      },
    });
  }

  return (
    <>
      <DialogShell open dialogKey="login" config={AUTH_CONFIG.login}>
        <form onSubmit={onSubmit} className={cn('space-y-5')} noValidate>
          <ApiErrorBanner message={error} />
          <div>
            <label
              htmlFor="login-email"
              className={cn('mb-1.5 block text-xs font-medium tracking-wide select-none')}
              style={{ color: 'var(--gray-11)' }}
            >
              Email address
            </label>
            <input
              id="login-email"
              ref={emailAutoFocusRef}
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              className={cn('w-full rounded-xl px-4 py-2.5 text-sm outline-none', 'border font-mono transition-none placeholder:opacity-25')}
            />
            <FieldError message={errors.email} />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className={cn('mb-1.5 block text-xs font-medium tracking-wide select-none')}
              style={{ color: 'var(--gray-11)' }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className={cn('w-full rounded-xl px-4 py-2.5 pr-11 text-sm outline-none', 'border font-mono transition-none placeholder:opacity-40')}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={handleTogglePassword}
                className={cn('absolute top-1/2 right-3 -translate-y-1/2')}
                style={{ color: 'var(--gray-9)' }}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
            <FieldError message={errors.password} />
          </div>
          <div className={cn('h-px w-full')} style={{ background: 'var(--gray-4)' }} />
          <SubmitButton isPending={processing} label="Continue →" pendingLabel="Signing in…" />
        </form>
      </DialogShell>
    </>
  );
}
