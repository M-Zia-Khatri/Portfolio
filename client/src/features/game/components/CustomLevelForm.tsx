import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Callout, Flex, Separator, Text } from "@radix-ui/themes";
import type {
  CustomLevelFormErrors,
  CustomLevelFormState,
} from "../validation/customLevel.validation";
import { CustomLevelFields } from "./CustomLevelFields";

interface CustomLevelFormProps {
  editingId: string | null;
  form: CustomLevelFormState;
  errors: CustomLevelFormErrors;
  onFieldChange: (key: keyof CustomLevelFormState, val: string) => void;
}

export function CustomLevelForm({ editingId, form, errors, onFieldChange }: CustomLevelFormProps) {
  return (
    <>
      <Separator size="4" my="4" style={{ background: "var(--gray-5)" }} />
      <Text size="2" weight="medium" style={{ color: "var(--gray-11)" }}>
        {editingId ? "✏️ Edit level" : "Add new level"}
      </Text>

      <Flex direction="column" gap="3" mt="2">
        <CustomLevelFields form={form} errors={errors} onFieldChange={onFieldChange} />
        {errors.timeMinutes === "Total time must be > 0" && (
          <Callout.Root color="red" variant="soft" size="1">
            <Callout.Icon>
              <ExclamationTriangleIcon />
            </Callout.Icon>
            <Callout.Text>Total time must be greater than 0 seconds.</Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    </>
  );
}
