import { Cross2Icon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { Badge, Flex, IconButton, Text } from "@radix-ui/themes";
import type { CustomLevelPreset } from "../store/GameSetStore";

interface CustomLevelPreviewProps {
  customLevels: CustomLevelPreset[];
  editingId: string | null;
  onEdit: (lvl: CustomLevelPreset) => void;
  onCancelEdit: () => void;
  onDelete: (id: string, isBeingEdited: boolean) => void;
}

export function CustomLevelPreview({
  customLevels,
  editingId,
  onEdit,
  onCancelEdit,
  onDelete,
}: CustomLevelPreviewProps) {
  if (customLevels.length === 0) return null;

  return (
    <Flex direction="column" gap="2" mt="4">
      <Text size="2" weight="medium" style={{ color: "var(--gray-11)" }}>
        Saved levels
      </Text>
      <Flex direction="column" gap="2">
        {customLevels.map((lvl) => {
          const m = Math.floor(lvl.totalSeconds / 60);
          const s = lvl.totalSeconds % 60;
          const isBeingEdited = editingId === lvl.id;
          return (
            <Flex
              key={lvl.id}
              align="center"
              justify="between"
              px="3"
              py="2"
              style={{
                background: isBeingEdited ? "var(--blue-a3)" : "var(--gray-3)",
                border: `1px solid ${isBeingEdited ? "var(--blue-7)" : "var(--gray-5)"}`,
                borderRadius: 8,
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              <Flex align="center" gap="2" wrap="wrap">
                <Text
                  size="2"
                  weight="bold"
                  style={{ color: isBeingEdited ? "var(--blue-11)" : "var(--gray-12)" }}
                >
                  {lvl.name}
                </Text>
                <Badge color="gray" variant="soft" size="1">
                  1–{lvl.maxNumber}
                </Badge>
                <Badge color="blue" variant="soft" size="1">
                  {lvl.guessLimit} guesses
                </Badge>
                <Badge color="amber" variant="soft" size="1">
                  {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
                </Badge>
              </Flex>

              <Flex gap="1" align="center">
                {isBeingEdited ? (
                  <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    onClick={onCancelEdit}
                    title="Cancel edit"
                  >
                    <Cross2Icon />
                  </IconButton>
                ) : (
                  <IconButton
                    size="1"
                    variant="ghost"
                    color="blue"
                    onClick={() => onEdit(lvl)}
                    title="Edit level"
                  >
                    <Pencil1Icon />
                  </IconButton>
                )}
                <IconButton
                  size="1"
                  variant="ghost"
                  color="red"
                  onClick={() => onDelete(lvl.id, isBeingEdited)}
                  title="Delete level"
                >
                  <TrashIcon />
                </IconButton>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
