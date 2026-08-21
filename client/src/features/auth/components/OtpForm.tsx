import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useVerifyOtp } from "@/features/auth/hooks/useVerifyOtp";
import { cn } from "@/shared/utils/cn";
import { AUTH_CONFIG, OTP_RESEND_COOLDOWN } from "../auth.config";
import { type OtpFields as OtpFieldsType, otpSchema } from "../auth.schema";
import { useApiError } from "../hooks/useApiError";
import { useAutoFocus } from "../hooks/useAutoFocus";
import { useCooldown } from "../hooks/useCooldown";
import { DialogShell } from "./DialogShell";
import { OtpActions } from "./OtpActions";
import { OtpFields } from "./OtpFields";
import { OtpResendButton } from "./OtpResendButton";
import { ApiErrorBanner } from "./ui/ApiErrorBanner";

interface OtpFormProps {
  open: boolean;
  email: string;
  onSuccess: () => void;
  onResend: () => void;
}

export function OtpForm({ open, email, onSuccess, onResend }: OtpFormProps) {
  const otpAutoFocusRef = useAutoFocus<HTMLInputElement>(open);
  const { mutateAsync: verifyOtp, isPending } = useVerifyOtp();
  const { error, clearError, handleError } = useApiError();
  const cooldown = useCooldown(OTP_RESEND_COOLDOWN, open);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OtpFieldsType>({ resolver: zodResolver(otpSchema) });

  const { ref: codeFormRef, ...codeRest } = register("code");

  useEffect(() => {
    if (!open) return;
    clearError();
    reset();
  }, [open, clearError, reset]);

  async function onSubmit(values: OtpFieldsType) {
    clearError();
    try {
      await verifyOtp({ email, otp: values.code });
      onSuccess();
    } catch (err) {
      handleError(err, "OTP verification failed. Please try again.");
    }
  }

  function handleResend() {
    if (!cooldown.ready) return;
    onResend();
    cooldown.reset();
  }

  return (
    <DialogShell open={open} dialogKey="otp" config={AUTH_CONFIG.otp}>
      <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-5")} noValidate>
        <ApiErrorBanner message={error} />
        <OtpFields
          codeRest={codeRest}
          codeFormRef={codeFormRef}
          otpAutoFocusRef={otpAutoFocusRef}
          errors={errors}
        />
        <div className={cn("h-px w-full")} style={{ background: "var(--gray-4)" }} />
        <OtpActions isPending={isPending} />
        <OtpResendButton ready={cooldown.ready} time={cooldown.time} onResend={handleResend} />
      </form>
    </DialogShell>
  );
}
