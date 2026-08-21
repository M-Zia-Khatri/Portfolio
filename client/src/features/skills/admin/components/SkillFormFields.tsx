import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  IconButton,
  Select,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { type UseFormReturn, useFieldArray } from "react-hook-form";
import { ICON_OPTIONS } from "../iconMap";
import type { CommandKind, SkillFormValues, SkillMode } from "../skills.schema";

export function SkillFormFields({ form }: { form: UseFormReturn<SkillFormValues> }) {
  const { register, watch, setValue, control, getFieldState } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "commands",
  });

  const mode = watch("mode");

  return (
    <Flex direction="column" gap="3">
      {/* Skill name + icon */}
      <Flex gap="3">
        <Box className="flex-2">
          <Text as="label" size="2" weight="bold">
            Skill Name
          </Text>

          <TextField.Root placeholder="e.g. React" {...register("name")} />
        </Box>

        <Box className="flex-1">
          <Text as="label" size="2" weight="bold">
            Icon
          </Text>

          <Select.Root value={watch("icon")} onValueChange={(value) => setValue("icon", value)}>
            <Select.Trigger className="w-full" />

            <Select.Content>
              {ICON_OPTIONS.map((option) => (
                <Select.Item key={option} value={option}>
                  {option}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>
      </Flex>

      {/* Language + color + mode */}
      <Flex gap="3">
        <Box className="flex-1">
          <Text as="label" size="2" weight="bold">
            Language
          </Text>

          <TextField.Root placeholder="tsx" {...register("lang")} />
        </Box>

        <Box className="flex-1">
          <Text as="label" size="2" weight="bold">
            Color (Hex)
          </Text>

          <TextField.Root {...register("color")} />
        </Box>

        <Box className="flex-1">
          <Text as="label" size="2" weight="bold">
            Mode
          </Text>

          <Select.Root value={mode} onValueChange={(value: SkillMode) => setValue("mode", value)}>
            <Select.Trigger className="w-full" />

            <Select.Content>
              <Select.Item value="code">Code Editor</Select.Item>

              <Select.Item value="terminal">Terminal</Select.Item>
            </Select.Content>
          </Select.Root>
        </Box>
      </Flex>

      {/* File name */}
      <Box>
        <Text as="label" size="2" weight="bold">
          File Name / Tab Name
        </Text>

        <TextField.Root placeholder="App.tsx" {...register("fileName")} />
      </Box>

      {/* Content */}
      <Box>
        <Text as="label" size="2" weight="bold" mb="2">
          {mode === "code" ? "Code Content" : "Terminal Sequence"}
        </Text>

        {mode === "code" ? (
          <TextArea
            placeholder="Enter code lines (one per line)..."
            rows={8}
            {...register("content")}
          />
        ) : (
          <Flex direction="column" gap="2">
            <Box className="max-h-75 overflow-y-auto pr-2">
              {fields.map((field, index) => {
                const kind = watch(`commands.${index}.kind`);

                const commandError = getFieldState(`commands.${index}.text`).error;

                return (
                  <Card key={field.id} size="1" mb="2">
                    <Flex align="center" gap="2">
                      {/* Command type */}
                      <Select.Root
                        value={kind}
                        onValueChange={(value: CommandKind) => {
                          setValue(`commands.${index}.kind`, value);
                        }}
                      >
                        <Select.Trigger variant="soft" color="blue" />

                        <Select.Content>
                          <Select.Item value="command">Command ($)</Select.Item>

                          <Select.Item value="output">Output</Select.Item>

                          <Select.Item value="comment">Comment (#)</Select.Item>

                          <Select.Item value="blank">Blank Line</Select.Item>
                        </Select.Content>
                      </Select.Root>

                      {/* Text input */}
                      {kind === "output" ? (
                        <TextArea
                          className="flex-1"
                          rows={4}
                          placeholder="Paste terminal output..."
                          {...register(`commands.${index}.text`)}
                        />
                      ) : kind !== "blank" ? (
                        <TextField.Root
                          className="flex-1"
                          placeholder="Text content..."
                          {...register(`commands.${index}.text`)}
                        />
                      ) : (
                        <Text size="1" color="gray" className="flex-1 italic">
                          Spacing line
                        </Text>
                      )}

                      {/* Delete */}
                      <IconButton
                        type="button"
                        size="1"
                        variant="ghost"
                        color="red"
                        onClick={() => remove(index)}
                      >
                        <TrashIcon />
                      </IconButton>
                    </Flex>

                    {/* Field error */}
                    {kind !== "blank" && commandError?.message && (
                      <Text color="red" size="1" mt="1">
                        {commandError.message}
                      </Text>
                    )}
                  </Card>
                );
              })}
            </Box>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  kind: "command",
                  text: "",
                })
              }
            >
              <PlusIcon />
              Add Command
            </Button>
          </Flex>
        )}
      </Box>
    </Flex>
  );
}

export function SkillDialogActions({ isPending }: { isPending: boolean }) {
  return (
    <Flex gap="3" mt="6" justify="end">
      <Dialog.Close>
        <Button type="button" variant="soft" color="gray">
          Cancel
        </Button>
      </Dialog.Close>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Skill"}
      </Button>
    </Flex>
  );
}
