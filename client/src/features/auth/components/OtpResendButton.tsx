import { cn } from "@/shared/utils/cn";

export function OtpResendButton({
  ready,
  time,
  onResend,
}: {
  ready: boolean;
  time: number;
  onResend: () => void;
}) {
  return (
    <p className={cn("text-center text-xs")} style={{ color: "var(--gray-10)" }}>
      Didn't receive the code?{" "}
      <button
        type="button"
        onClick={onResend}
        disabled={!ready}
        className={cn("font-semibold transition-colors duration-200 disabled:cursor-not-allowed")}
        style={{ color: ready ? "var(--blue-11)" : "var(--gray-9)" }}
      >
        {ready ? "Send again" : `Send again (${time}s)`}
      </button>
    </p>
  );
}
