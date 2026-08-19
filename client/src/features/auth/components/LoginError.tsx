import { ApiErrorBanner } from "./ui/ApiErrorBanner";

export function LoginError({ message }: { message: string | null }) {
  return <ApiErrorBanner message={message} />;
}
