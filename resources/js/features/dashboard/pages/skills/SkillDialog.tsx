import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
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
} from '@radix-ui/themes';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { ICON_OPTIONS } from './iconMap';
import { skillSchema, type SkillFormValues } from './skills.schema';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SkillFormValues) => void;
  initialData?: any;
  isPending: boolean;
}

export default function SkillDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isPending,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      mode: 'code',
      commands: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'commands',
  });

  const mode = watch('mode');

  useEffect(() => {
    if (initialData) {
      const content = initialData.mode === 'code' ? initialData.code.join('\n') : '';
      const commands = initialData.mode === 'terminal' ? initialData.commands : [];

      reset({
        ...initialData,
        icon: initialData.icon ?? ICON_OPTIONS[0],
        content,
        commands,
      });
    } else {
      reset({
        mode: 'code',
        color: '#61dafb',
        icon: ICON_OPTIONS[0],
        commands: [],
        content: '',
      });
    }
  }, [initialData, reset, open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="600px">
        <Dialog.Title>{initialData ? 'Edit Skill' : 'Add New Skill'}</Dialog.Title>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="3">
            <Flex gap="3">
              <Box className="flex-2">
                <Text as="label" size="2" weight="bold">
                  Skill Name
                </Text>
                <TextField.Root placeholder="e.g. React" {...register('name')} />
              </Box>
              <Box className="flex-1">
                <Text as="label" size="2" weight="bold">
                  Icon
                </Text>
                <Select.Root value={watch('icon')} onValueChange={(v) => setValue('icon', v)}>
                  <Select.Trigger className="w-full" />
                  <Select.Content>
                    {ICON_OPTIONS.map((opt) => (
                      <Select.Item key={opt} value={opt}>
                        {opt}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
            </Flex>

            <Flex gap="3">
              <Box className="flex-1">
                <Text as="label" size="2" weight="bold">
                  Language
                </Text>
                <TextField.Root placeholder="tsx" {...register('lang')} />
              </Box>
              <Box className="flex-1">
                <Text as="label" size="2" weight="bold">
                  Color (Hex)
                </Text>
                <TextField.Root {...register('color')} />
              </Box>
              <Box className="flex-1">
                <Text as="label" size="2" weight="bold">
                  Mode
                </Text>
                <Select.Root value={mode} onValueChange={(v: any) => setValue('mode', v)}>
                  <Select.Trigger className="w-full" />
                  <Select.Content>
                    <Select.Item value="code">Code Editor</Select.Item>
                    <Select.Item value="terminal">Terminal</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
            </Flex>

            <Box>
              <Text as="label" size="2" weight="bold">
                File Name / Tab Name
              </Text>
              <TextField.Root placeholder="App.tsx" {...register('fileName')} />
            </Box>

            {/* --- CONTENT AREA --- */}
            <Box>
              <Text as="label" size="2" weight="bold" mb="2">
                {mode === 'code' ? 'Code Content' : 'Terminal Sequence'}
              </Text>

              {mode === 'code' ? (
                <TextArea
                  placeholder="Enter code lines (one per line)..."
                  rows={8}
                  {...register('content')}
                />
              ) : (
                <Flex direction="column" gap="2">
                  <Box className="max-h-75 overflow-y-auto pr-2">
                    {fields.map((field, index) => (
                      <Card key={field.id} size="1" mb="2">
                        <Flex align="center" gap="2">
                          <Select.Root
                            value={watch(`commands.${index}.kind`)}
                            onValueChange={(v: any) => {
                              setValue(`commands.${index}.kind`, v);
                              if (v === 'blank')
                                setValue(`commands.${index}.text`, undefined as any);
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

                          {watch(`commands.${index}.kind`) !== 'blank' && (
                            <TextField.Root
                              className="flex-1"
                              placeholder="Text content..."
                              {...register(`commands.${index}.text` as const)}
                            />
                          )}

                          {watch(`commands.${index}.kind`) === 'blank' && (
                            <Text size="1" color="gray" className="flex-1 italic">
                              Spacing line
                            </Text>
                          )}

                          <IconButton
                            size="1"
                            variant="ghost"
                            color="red"
                            onClick={() => remove(index)}
                          >
                            <TrashIcon />
                          </IconButton>
                        </Flex>
                        {watch(`commands.${index}.kind`) !== 'blank' &&
                          errors.commands?.[index] &&
                          'text' in errors.commands[index] && (
                            <Text color="red" size="1" mt="1">
                              {(errors.commands[index] as any)?.text?.message}
                            </Text>
                          )}
                      </Card>
                    ))}
                  </Box>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ kind: 'command', text: '' })}
                  >
                    <PlusIcon /> Add Command
                  </Button>
                </Flex>
              )}

              {errors.content && (
                <Text color="red" size="1">
                  {errors.content.message}
                </Text>
              )}
            </Box>
          </Flex>

          <Flex gap="3" mt="6" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Skill'}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
