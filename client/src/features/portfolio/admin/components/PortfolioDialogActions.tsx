import { Button, Dialog, Flex, Spinner } from "@radix-ui/themes";

interface PortfolioDialogActionsProps {
  isEdit: boolean;
  submitting: boolean;
}

export function PortfolioDialogActions({ isEdit, submitting }: PortfolioDialogActionsProps) {
  return (
    <Flex justify="end" gap="3" mt="5">
      <Dialog.Close>
        <Button variant="soft" color="gray" type="button" disabled={submitting}>
          Cancel
        </Button>
      </Dialog.Close>
      <Button type="submit" disabled={submitting} color="blue">
        {submitting ? (
          <Flex align="center" gap="2">
            <Spinner size="1" />
            {isEdit ? "Saving…" : "Adding…"}
          </Flex>
        ) : isEdit ? (
          "Save Changes"
        ) : (
          "Add Portfolio"
        )}
      </Button>
    </Flex>
  );
}
