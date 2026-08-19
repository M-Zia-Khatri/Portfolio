import { SubmitButton } from "./ui/SubmitButton";

export function OtpActions({ isPending }: { isPending: boolean }) {
  return <SubmitButton isPending={isPending} label="Verify & Sign In →" pendingLabel="Verifying code…" />;
}
