import { CheckIcon, Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { Button, Flex } from "@radix-ui/themes";

interface CustomLevelActionsProps {
  editingId: string | null;
  onCancelEdit: () => void;
  onClose: () => void;
  onSave: () => void;
}

export function CustomLevelActions({
  editingId,
  onCancelEdit,
  onClose,
  onSave,
}: CustomLevelActionsProps) {
  return (
    <Flex gap="3" justify="between" mt="5">
      {editingId ? (
        <Button variant="soft" color="gray" onClick={onCancelEdit}>
          <Cross2Icon />
          Cancel Edit
        </Button>
      ) : (
        <span />
      )}

      <Flex gap="2">
        <Button variant="soft" color="gray" onClick={onClose}>
          Close
        </Button>
        <Button variant="solid" color={editingId ? "amber" : "blue"} onClick={onSave}>
          {editingId ? <CheckIcon /> : <PlusIcon />}
          {editingId ? "Save Changes" : "Add Level"}
        </Button>
      </Flex>
    </Flex>
  );
}
