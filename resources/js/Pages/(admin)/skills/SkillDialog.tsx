import type { Skill, TerminalLine } from '@/features/skills/types';
import { Button, Dialog, Flex, Select, TextArea, TextField } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { ICON_OPTIONS } from './iconMap';

export type SkillDialogFormValues = {
  name: string;
  icon: string;
  lang: string;
  color: string;
  mode: 'code' | 'terminal';
  fileName: string;
  content: string;
  commands: TerminalLine[];
};

type SkillDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SkillDialogFormValues) => void;
  initialData: Skill | null;
};

const TERMINAL_LINE_KINDS = ['command', 'output', 'comment', 'blank'] as const satisfies readonly TerminalLine['kind'][];

function isTerminalLineKind(value: string): value is TerminalLine['kind'] {
  return TERMINAL_LINE_KINDS.includes(value as TerminalLine['kind']);
}

function normalizeCommand(command: TerminalLine): TerminalLine {
  return {
    kind: command.kind,
    text: command.kind === 'blank' ? '' : (command.text ?? ''),
  };
}

const emptyForm: SkillDialogFormValues = {
  name: '',
  icon: ICON_OPTIONS[0] ?? 'default',
  lang: '',
  color: '#61dafb',
  mode: 'code',
  fileName: '',
  content: '',
  commands: [],
};

export default function SkillDialog({ open, onOpenChange, onSubmit, initialData }: SkillDialogProps) {
  const [form, setForm] = useState<SkillDialogFormValues>(emptyForm);

  useEffect(() => {
    if (!initialData) {
      setForm(emptyForm);
      return;
    }

    setForm({
      name: initialData.name,
      icon: initialData.icon ?? ICON_OPTIONS[0] ?? 'default',
      lang: initialData.lang,
      color: initialData.color,
      mode: initialData.mode === 'terminal' ? 'terminal' : 'code',
      fileName: initialData.fileName,
      content: initialData.mode === 'code' ? initialData.code.join('\n') : '',
      commands: initialData.mode === 'terminal' ? initialData.commands.map(normalizeCommand) : [],
    });
  }, [initialData, open]);

  const handleChange = <TKey extends keyof SkillDialogFormValues>(key: TKey, value: SkillDialogFormValues[TKey]) => {
    setForm((previousForm) => ({ ...previousForm, [key]: value }));
  };

  const updateCommand = (index: number, updater: (command: TerminalLine) => TerminalLine) => {
    setForm((previousForm) => ({
      ...previousForm,
      commands: previousForm.commands.map((command, commandIndex) => (commandIndex === index ? updater(command) : command)),
    }));
  };

  const handleCommandKindChange = (index: number, value: string) => {
    if (!isTerminalLineKind(value)) {
      return;
    }

    updateCommand(index, (command) => ({
      kind: value,
      text: value === 'blank' ? '' : (command.text ?? ''),
    }));
  };

  const handleCommandTextChange = (index: number, text: string) => {
    updateCommand(index, (command) => ({ ...command, text: command.kind === 'blank' ? '' : text }));
  };

  const addCommand = () => {
    setForm((previousForm) => ({
      ...previousForm,
      commands: [...previousForm.commands, { kind: 'command', text: '' }],
    }));
  };

  const removeCommand = (index: number) => {
    setForm((previousForm) => ({
      ...previousForm,
      commands: previousForm.commands.filter((_, commandIndex) => commandIndex !== index),
    }));
  };

  const moveCommand = (index: number, direction: -1 | 1) => {
    setForm((previousForm) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= previousForm.commands.length) {
        return previousForm;
      }

      const nextCommands = [...previousForm.commands];
      const [command] = nextCommands.splice(index, 1);

      if (!command) {
        return previousForm;
      }

      nextCommands.splice(nextIndex, 0, command);

      return { ...previousForm, commands: nextCommands };
    });
  };

  const handleSubmit = () => {
    onSubmit({
      ...form,
      commands: form.commands.map(normalizeCommand),
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="600px">
        <Dialog.Title>{initialData ? 'Edit Skill' : 'Add Skill'}</Dialog.Title>

        <Flex direction="column" gap="3">
          <TextField.Root placeholder="Skill Name" value={form.name} onChange={(event) => handleChange('name', event.target.value)} />

          <Select.Root value={form.icon} onValueChange={(value) => handleChange('icon', value)}>
            <Select.Trigger />
            <Select.Content>
              {ICON_OPTIONS.map((option) => (
                <Select.Item key={option} value={option}>
                  {option}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <TextField.Root placeholder="Language" value={form.lang} onChange={(event) => handleChange('lang', event.target.value)} />

          <TextField.Root placeholder="Color" value={form.color} onChange={(event) => handleChange('color', event.target.value)} />

          <Select.Root value={form.mode} onValueChange={(value) => handleChange('mode', value === 'terminal' ? 'terminal' : 'code')}>
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="code">Code</Select.Item>
              <Select.Item value="terminal">Terminal</Select.Item>
            </Select.Content>
          </Select.Root>

          <TextField.Root placeholder="File Name" value={form.fileName} onChange={(event) => handleChange('fileName', event.target.value)} />

          {form.mode === 'code' ? (
            <TextArea rows={8} value={form.content} onChange={(event) => handleChange('content', event.target.value)} />
          ) : (
            <Flex direction="column" gap="2">
              {form.commands.map((command, index) => (
                <Flex key={index} gap="2" align="center">
                  <Select.Root value={command.kind} onValueChange={(value) => handleCommandKindChange(index, value)}>
                    <Select.Trigger />
                    <Select.Content>
                      {TERMINAL_LINE_KINDS.map((kind) => (
                        <Select.Item key={kind} value={kind}>
                          {kind}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>

                  <TextField.Root
                    placeholder="Text"
                    value={command.text ?? ''}
                    disabled={command.kind === 'blank'}
                    onChange={(event) => handleCommandTextChange(index, event.target.value)}
                  />

                  <Button type="button" variant="soft" onClick={() => moveCommand(index, -1)} disabled={index === 0}>
                    ↑
                  </Button>

                  <Button type="button" variant="soft" onClick={() => moveCommand(index, 1)} disabled={index === form.commands.length - 1}>
                    ↓
                  </Button>

                  <Button type="button" variant="soft" color="red" onClick={() => removeCommand(index)}>
                    Delete
                  </Button>
                </Flex>
              ))}

              <Button type="button" variant="soft" onClick={addCommand}>
                + Add Command
              </Button>
            </Flex>
          )}
        </Flex>

        <Flex justify="end" mt="4">
          <Button onClick={handleSubmit}>Save</Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
