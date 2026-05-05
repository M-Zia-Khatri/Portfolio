import SkillChip from '@/features/skills/components/SkillChip';
import type { ApiSkill, Skill } from '@/features/skills/types';
import CodeCard from '@/shared/components/CodeCard';
import { router, usePage } from '@inertiajs/react';
import { Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { AlertDialog, Box, Button, Card, Container, Flex, Grid, Heading, IconButton, Text } from '@radix-ui/themes';
import { useState } from 'react';
import { ICON_MAP } from './iconMap';
import SkillDialog from './SkillDialog';

type MappedSkill = Skill & { id: string };

function toMappedSkill(s: ApiSkill): MappedSkill {
  const iconComponent = ICON_MAP[s.icon] ?? ICON_MAP.default;
  return { ...s, iconComponent } as MappedSkill;
}

export default function Skills() {
  const { skills } = usePage().props;

  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<ApiSkill | null>(null);

  const mappedSkills: MappedSkill[] = (skills ?? []).map(toMappedSkill);

  const activeSkill = mappedSkills.find((s) => s.id === activeSkillId) ?? (mappedSkills.length > 0 ? mappedSkills[0] : null);

  const handleOpenAdd = () => {
    setEditingSkill(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (skill: ApiSkill) => {
    setEditingSkill(skill);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    router.delete(route('skills.destroy', id), {
      onSuccess: () => {
        if (activeSkillId === id) setActiveSkillId(null);
      },
    });
  };

  const onFormSubmit = (values: any) => {
    const { content, mode, commands, ...rest } = values;

    const payload = mode === 'code' ? { ...rest, mode, code: content?.split('\n') || [] } : { ...rest, mode, commands };

    if (editingSkill) {
      router.put(route('skills.update', editingSkill.id), payload, {
        onSuccess: () => setIsDialogOpen(false),
      });
    } else {
      router.post(route('skills.store'), payload, {
        onSuccess: () => setIsDialogOpen(false),
      });
    }
  };

  return (
    <Container size="4" py="6">
      <Flex justify="between" align="center" mb="6">
        <Box>
          <Heading size="8">Manage Skills</Heading>
          <Text color="gray">Configure your tech stack and code previews</Text>
        </Box>
        <Button size="3" onClick={handleOpenAdd}>
          <PlusIcon /> Add Skill
        </Button>
      </Flex>

      <Grid columns={{ initial: '1', md: '12' }} gap="6">
        {/* Sidebar */}
        <Box className="md:col-span-4">
          <Card size="2">
            <Flex direction="column" gap="4">
              {mappedSkills.length === 0 && (
                <Text size="2" color="gray">
                  No skills added yet.
                </Text>
              )}

              {mappedSkills.map((skill) => (
                <Flex key={skill.id} align="center" justify="between" className="border-b pb-2">
                  <SkillChip skill={skill} active={activeSkill?.id === skill.id} onClick={() => setActiveSkillId(skill.id)} />

                  <Flex gap="2">
                    <IconButton variant="ghost" onClick={() => handleOpenEdit(skill)}>
                      <Pencil1Icon />
                    </IconButton>

                    <AlertDialog.Root>
                      <AlertDialog.Trigger>
                        <IconButton variant="ghost" color="red">
                          <TrashIcon />
                        </IconButton>
                      </AlertDialog.Trigger>

                      <AlertDialog.Content>
                        <AlertDialog.Title>Delete Skill?</AlertDialog.Title>
                        <AlertDialog.Description>This will remove "{skill.name}"</AlertDialog.Description>

                        <Flex gap="3" mt="4" justify="end">
                          <AlertDialog.Cancel>
                            <Button variant="soft">Cancel</Button>
                          </AlertDialog.Cancel>

                          <AlertDialog.Action>
                            <Button color="red" onClick={() => handleDelete(skill.id)}>
                              Delete
                            </Button>
                          </AlertDialog.Action>
                        </Flex>
                      </AlertDialog.Content>
                    </AlertDialog.Root>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Card>
        </Box>

        {/* Preview */}
        <Box className="md:col-span-8">
          {activeSkill ? (
            <Flex direction="column" gap="4">
              <Text size="2" weight="bold" color="blue">
                Live Preview
              </Text>

              <CodeCard skill={activeSkill} openTabs={[activeSkill]} onTabClick={() => {}} onTabClose={() => {}} started />
            </Flex>
          ) : (
            <Card className="flex h-full items-center justify-center border-dashed">
              <Text color="gray">Select a skill</Text>
            </Card>
          )}
        </Box>
      </Grid>

      <SkillDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={onFormSubmit} initialData={editingSkill} />
    </Container>
  );
}
