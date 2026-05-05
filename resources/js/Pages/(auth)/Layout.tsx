import { AUTH_CONFIG } from './auth.config';
import { DialogShell } from './components/DialogShell';
import type { AuthStep } from './types';

interface AuthLayoutProps {
  step: AuthStep;
  children: React.ReactNode;
}

export default function AuthLayout({ step, children }: AuthLayoutProps) {
  return (
    <>
      <DialogShell open dialogKey={step} config={AUTH_CONFIG[step]}>
        {children}
      </DialogShell>
    </>
  );
}
