import { SubmitButton } from "./ui/SubmitButton";

export function LoginActions({ isPending }: { isPending: boolean }) {
  return <SubmitButton isPending={isPending} label="Continue →" />;
}
