import { Button, Dialog, Flex, Select, Text, TextArea, TextField } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { ICON_OPTIONS } from './iconMap';

export default function SkillDialog({ open, onOpenChange, onSubmit, initialData }: any) {
  const [form, setForm] = useState<any>({
    name: '',
    icon: ICON_OPTIONS[0],
    lang: '',
    color: '#61dafb',
    mode: 'code',
    fileName: '',
    content: '',
    commands: [],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        content: initialData.mode === 'code' ? initialData.code.join('\n') : '',
        commands: initialData.commands || [],
      });
    }
  }, [initialData, open]);

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="600px">
        <Dialog.Title>{initialData ? 'Edit Skill' : 'Add Skill'}</Dialog.Title>

        <Flex direction="column" gap="3">
          <TextField.Root placeholder="Skill Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />

          <Select.Root value={form.icon} onValueChange={(v) => handleChange('icon', v)}>
            <Select.Trigger />
            <Select.Content>
              {ICON_OPTIONS.map((opt) => (
                <Select.Item key={opt} value={opt}>
                  {opt}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <TextField.Root placeholder="Language" value={form.lang} onChange={(e) => handleChange('lang', e.target.value)} />

          <TextField.Root placeholder="Color" value={form.color} onChange={(e) => handleChange('color', e.target.value)} />

          <Select.Root value={form.mode} onValueChange={(v) => handleChange('mode', v)}>
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="code">Code</Select.Item>
              <Select.Item value="terminal">Terminal</Select.Item>
            </Select.Content>
          </Select.Root>

          <TextField.Root placeholder="File Name" value={form.fileName} onChange={(e) => handleChange('fileName', e.target.value)} />

          {form.mode === 'code' ? (
            <TextArea rows={8} value={form.content} onChange={(e) => handleChange('content', e.target.value)} />
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
