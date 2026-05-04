import type { AuthStep, AuthStepConfig } from './types';

export const AUTH_CONFIG: Record<AuthStep, AuthStepConfig> = {
  login: {
    title: 'Sign In',
    badge: 'Admin Portal',
    description: 'Enter your credentials to continue',
  },
  otp: {
    title: 'Verify OTP',
    badge: 'Two-Factor Authentication',
    description: 'A 6-digit code was sent to your email',
  },
};

export const OTP_RESEND_COOLDOWN = 60;
