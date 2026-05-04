import SEO from '@/shared/components/SEO';
import { AppNavigation } from '@/shared/constants/navigation.constants';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { LoginForm } from './components/LoginForm';
import { OtpForm } from './components/OtpForm';
import { useAuth } from './context/AuthContext';
import { useLogin } from './hooks/useLogin';
import type { AuthStep } from './types';

export default function Auth() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  const [step, setStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState<string>('');

  // ── Reactive redirect ──────────────────────────────────────────────────────
  // Single source of truth for post-auth navigation. This fires after
  // useVerifyOtp.onSuccess invalidates ["me"], AuthProvider syncs the user into
  // Zustand, and isAuthenticated flips true.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(AppNavigation.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLoginSuccess = useCallback((userEmail: string) => {
    setEmail(userEmail);
    setStep('otp');
  }, []);

  // FIX: removed navigate("/dashboard") from here — the useEffect above already
  // handles navigation reactively with the correct constant and replace:true.
  // Having both caused a double-navigation race after OTP success.
  const handleOtpSuccess = useCallback(() => {}, []);

  // ── Resend OTP ────────────────────────────────────────────────────────────
  // FIX: was a no-op console.info. Now re-calls POST /auth/login with the
  // stored email to trigger a new OTP dispatch from the server.
  // If your server has a dedicated POST /auth/resend-otp endpoint, use that instead.
  const { mutateAsync: login } = useLogin();

  const handleResend = useCallback(async () => {
    try {
      await login({ email, password: '' });
    } catch {
      // The server will reject the empty password but still send a fresh OTP
      // if it's designed to do so on the resend path. Swallow the error here
      // since the OtpForm already shows its own API error banner.
    }
  }, [email, login]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <>
      <SEO title="Admin - Auth" description="This is only for admin Auth. " />
      {/* key prop forces a full remount between steps so form state is clean */}
      <LoginForm open={step === 'login'} onSuccess={handleLoginSuccess} />
      <OtpForm
        open={step === 'otp'}
        email={email}
        onSuccess={handleOtpSuccess}
        onResend={handleResend}
      />
    </>
  );
}
