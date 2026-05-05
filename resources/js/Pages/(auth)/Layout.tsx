import SEO from '@/shared/components/SEO';
import { DialogShell } from './components/DialogShell';
import type { AuthStep } from './types';
import { AUTH_CONFIG } from './auth.config';

interface AuthLayoutProps {
  step: AuthStep;
  children: React.ReactNode;
}

export default function AuthLayout({ step, children }: AuthLayoutProps) {
  return (
    <>
      <SEO title='Admin - Auth' description='This is only for admin Auth. ' />
      <DialogShell open dialogKey={step} config={AUTH_CONFIG[step]}>
        {children}
      </DialogShell>
    </>
  );
}
