import { Callout } from "@radix-ui/themes";

export function ContactErrorState({ message }: { message: string }) {
  return (
    <Callout.Root color="red" variant="surface" size="1">
      <Callout.Text>{message}</Callout.Text>
    </Callout.Root>
  );
}
