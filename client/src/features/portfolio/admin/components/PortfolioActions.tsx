import { AlertDialog, Button, Flex, Spinner } from "@radix-ui/themes";

interface PortfolioActionsProps {
  deleteTarget: string | null;
  isDeleting: boolean;
  onDeleteTargetChange: (id: string | null) => void;
  onDeleteConfirm: () => void;
}

export function PortfolioActions({
  deleteTarget,
  isDeleting,
  onDeleteTargetChange,
  onDeleteConfirm,
}: PortfolioActionsProps) {
  return (
    <AlertDialog.Root
      open={Boolean(deleteTarget)}
      onOpenChange={(open) => !open && onDeleteTargetChange(null)}
    >
      <AlertDialog.Content maxWidth="400px">
        <AlertDialog.Title>Delete Portfolio Item</AlertDialog.Title>
        <AlertDialog.Description>
          Are you sure? This action cannot be undone.
        </AlertDialog.Description>
        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button color="red" onClick={onDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? (
                <Flex align="center" gap="2">
                  <Spinner size="1" /> Deleting…
                </Flex>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
