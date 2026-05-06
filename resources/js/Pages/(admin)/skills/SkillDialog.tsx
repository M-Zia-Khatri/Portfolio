import type { Skill, TerminalLine } from '@/features/skills/types';
import { Button, Dialog, Flex, Select, Text, TextArea, TextField } from '@radix-ui/themes';
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
      commands: initialData.mode === 'terminal' ? initialData.commands : [],
    });
  }, [initialData, open]);

  const handleChange = <TKey extends keyof SkillDialogFormValues>(key: TKey, value: SkillDialogFormValues[TKey]) => {
    setForm((previousForm) => ({ ...previousForm, [key]: value }));
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
            <Text size="2">Terminal commands handled here (simplified)</Text>
          )}
        </Flex>

        <Flex justify="end" mt="4">
          <Button onClick={() => onSubmit(form)}>Save</Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
