import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { cn } from "@/shared/utils/cn";
import { AUTH_CONFIG } from "../auth.config";
import { type LoginFields as LoginFieldsType, loginSchema } from "../auth.schema";
import { useApiError } from "../hooks/useApiError";
import { useAutoFocus } from "../hooks/useAutoFocus";
import { DialogShell } from "./DialogShell";
import { LoginActions } from "./LoginActions";
import { LoginError } from "./LoginError";
import { LoginFields } from "./LoginFields";

interface LoginFormProps {
  open: boolean;
  onSuccess: (email: string) => void;
}

export function LoginForm({ open, onSuccess }: LoginFormProps) {
  const emailAutoFocusRef = useAutoFocus<HTMLInputElement>(open);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: login, isPending } = useLogin();
  const { error, clearError, handleError } = useApiError();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFieldsType>({ resolver: zodResolver(loginSchema) });

  const { ref: emailFormRef, ...emailRest } = register("email");
  const { ref: passwordFormRef, ...passwordRest } = register("password");

  useEffect(() => {
    if (!open) return;
    clearError();
    reset();
    setShowPassword(false);
  }, [open, clearError, reset]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => {
      const next = !prev;
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (next) hideTimerRef.current = setTimeout(() => setShowPassword(false), 5_000);
      return next;
    });
  }, []);

  async function onSubmit(values: LoginFieldsType) {
    clearError();
    try {
      await login(values);
      onSuccess(values.email);
    } catch (err) {
      handleError(err, "Login failed. Please try again.");
    }
  }

  return (
    <DialogShell open={open} dialogKey="login" config={AUTH_CONFIG.login}>
      <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-5")} noValidate>
        <LoginError message={error} />
        <LoginFields
          emailRest={emailRest}
          emailFormRef={emailFormRef}
          emailAutoFocusRef={emailAutoFocusRef}
          passwordRest={passwordRest}
          passwordFormRef={passwordFormRef}
          errors={errors}
          showPassword={showPassword}
          onTogglePassword={handleTogglePassword}
          onPasswordChange={(e) => {
            passwordRest.onChange(e);
            if (showPassword) {
              if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
              hideTimerRef.current = setTimeout(() => setShowPassword(false), 5_000);
            }
          }}
        />
        <div className={cn("h-px w-full")} style={{ background: "var(--gray-4)" }} />
        <LoginActions isPending={isPending} />
      </form>
    </DialogShell>
  );
}
