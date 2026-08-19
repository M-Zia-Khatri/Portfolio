import { CheckCircledIcon } from "@radix-ui/react-icons";
import { Button, Callout } from "@radix-ui/themes";

export function ContactSuccessState({ onReset }: { onReset: () => void }) {
  return (
    <div key="success" className="animate-in fade-in zoom-in-95 duration-300">
      <Callout.Root color="green" variant="surface" size="2">
        <Callout.Icon>
          <CheckCircledIcon width={18} height={18} />
        </Callout.Icon>
        <Callout.Text>Your message was sent! I&apos;ll get back to you soon.</Callout.Text>
      </Callout.Root>
      <Button mt="4" variant="ghost" size="2" onClick={onReset}>
        Send another message
      </Button>
    </div>
  );
}
