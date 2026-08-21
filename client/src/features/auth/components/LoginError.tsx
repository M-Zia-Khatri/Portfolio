import { ApiErrorBanner } from "./ui/ApiErrorBanner";

export function LoginError({ message }: { message: string | undefined }) {
  return <ApiErrorBanner message={message} />;
}
