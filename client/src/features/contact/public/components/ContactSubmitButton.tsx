import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { Button, Flex, Spinner, Text } from "@radix-ui/themes";
import { memo } from "react";

export const ContactPromise = memo(() => (
  <Text size="1" color="blue" weight="medium">
    I&apos;ll never share your data with anyone else. Pinky promise!
  </Text>
));

export const ContactSubmitButton = memo(({ isLoading }: { isLoading: boolean }) => (
  <Button
    type="submit"
    size="3"
    variant="solid"
    disabled={isLoading}
    className="w-full cursor-pointer"
  >
    {isLoading ? (
      <Flex align="center" gap="2">
        <Spinner size="2" /> Sending…
      </Flex>
    ) : (
      <Flex align="center" gap="2">
        Send Message <PaperPlaneIcon width={15} height={15} />
      </Flex>
    )}
  </Button>
));
