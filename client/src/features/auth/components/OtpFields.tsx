import type React from "react";
import type { FieldErrors, UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/shared/utils/cn";
import type { OtpFields as OtpFieldsType } from "../auth.schema";
import { FieldError } from "./ui/FieldError";

export function OtpFields({
  codeRest,
  codeFormRef,
  otpAutoFocusRef,
  errors,
}: {
  codeRest: Omit<UseFormRegisterReturn<"code">, "ref">;
  codeFormRef: UseFormRegisterReturn<"code">["ref"];
  otpAutoFocusRef: React.RefObject<HTMLInputElement | null>;
  errors: FieldErrors<OtpFieldsType>;
}) {
  return (
    <div>
      <label
        htmlFor="otp-code"
        className={cn("block text-xs font-medium mb-1.5 tracking-wide select-none")}
        style={{ color: "var(--gray-11)" }}
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
        {...codeRest}
        ref={(el) => {
          codeFormRef(el);
          (otpAutoFocusRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
        }}
        className={cn(
          "w-full rounded-xl px-4 py-3.5 outline-none",
          "border font-mono transition-none",
          "text-center text-2xl tracking-[0.7em]",
          "placeholder:opacity-20 placeholder:tracking-[0.6em]",
        )}
        style={{
          background: "var(--gray-3)",
          borderColor: errors.code ? "var(--red-8, #b91c1c)" : "var(--gray-6)",
          color: "var(--gray-12)",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.25)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--blue-8)";
          e.currentTarget.style.boxShadow =
            "0 0 0 3px var(--blue-a4), inset 0 1px 3px rgba(0,0,0,0.25)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = errors.code
            ? "var(--red-8, #b91c1c)"
            : "var(--gray-6)";
          e.currentTarget.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.25)";
        }}
        onChange={(e) => {
          e.target.value = e.target.value.replace(/\D/g, "");
          codeRest.onChange(e);
        }}
      />
      <FieldError message={errors.code?.message} />
    </div>
  );
}
