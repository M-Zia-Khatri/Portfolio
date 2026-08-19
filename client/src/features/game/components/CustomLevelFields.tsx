import { Flex, Text, TextField } from "@radix-ui/themes";
import type {
  CustomLevelFormErrors,
  CustomLevelFormState,
} from "../validation/customLevel.validation";

export function CustomLevelFieldRow({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <Flex direction="column" gap="1" style={{ flex: 1 }}>
      <Text size="2" weight="medium" style={{ color: "var(--gray-11)" }}>
        {label}
      </Text>
      {children}
      {error && (
        <Text size="1" style={{ color: "var(--red-11)" }}>
          {error}
        </Text>
      )}
    </Flex>
  );
}

interface CustomLevelFieldsProps {
  form: CustomLevelFormState;
  errors: CustomLevelFormErrors;
  onFieldChange: (key: keyof CustomLevelFormState, val: string) => void;
}

export function CustomLevelFields({ form, errors, onFieldChange }: CustomLevelFieldsProps) {
  return (
    <>
      <CustomLevelFieldRow label="Level name" error={errors.name}>
        <TextField.Root
          placeholder="e.g. Insane"
          value={form.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
          color={errors.name ? "red" : "blue"}
        />
      </CustomLevelFieldRow>

      <Flex gap="3">
        <CustomLevelFieldRow label="Max number (2–100)" error={errors.maxNumber}>
          <TextField.Root
            type="number"
            placeholder="50"
            min={2}
            max={100}
            value={form.maxNumber}
            onChange={(e) => onFieldChange("maxNumber", e.target.value)}
            color={errors.maxNumber ? "red" : "blue"}
          />
        </CustomLevelFieldRow>
        <CustomLevelFieldRow label="Guess limit (1–50)" error={errors.guessLimit}>
          <TextField.Root
            type="number"
            placeholder="5"
            min={1}
            max={50}
            value={form.guessLimit}
            onChange={(e) => onFieldChange("guessLimit", e.target.value)}
            color={errors.guessLimit ? "red" : "blue"}
          />
        </CustomLevelFieldRow>
      </Flex>

      <Flex gap="3">
        <CustomLevelFieldRow label="Minutes (0–59)" error={errors.timeMinutes}>
          <TextField.Root
            type="number"
            placeholder="2"
            min={0}
            max={59}
            value={form.timeMinutes}
            onChange={(e) => onFieldChange("timeMinutes", e.target.value)}
            color={errors.timeMinutes ? "red" : "blue"}
          />
        </CustomLevelFieldRow>
        <CustomLevelFieldRow label="Seconds (0–59)" error={errors.timeSeconds}>
          <TextField.Root
            type="number"
            placeholder="30"
            min={0}
            max={59}
            value={form.timeSeconds}
            onChange={(e) => onFieldChange("timeSeconds", e.target.value)}
            color={errors.timeSeconds ? "red" : "blue"}
          />
        </CustomLevelFieldRow>
      </Flex>
    </>
  );
}
