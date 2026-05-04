import SkillChip from '@/features/skills/components/SkillChip';
import type { ApiSkill, Skill } from '@/features/skills/types';
import CodeCard from '@/shared/components/CodeCard';
import { Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import {
  AlertDialog,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  IconButton,
  Spinner,
  Text,
} from '@radix-ui/themes';
import { useState } from 'react';
import { ICON_MAP } from './iconMap';
import SkillDialog from './SkillDialog';
import type { SkillFormValues } from './skills.schema';
import { useCreateSkill, useDeleteSkill, useSkillsData, useUpdateSkill } from './useSkillActions';

// B3 fixed: proper type for a skill that has been mapped (iconComponent resolved)
type MappedSkill = Skill & { id: string };

// B1 + B2 + B3 fixed: resolves the string icon key from the API into the real component.
function toMappedSkill(s: ApiSkill): MappedSkill {
  const iconComponent = ICON_MAP[s.icon] ?? ICON_MAP.default;
  if (!ICON_MAP[s.icon]) {
    console.warn(`[Skills] No icon found for key "${s.icon}", using default.`);
  }
  return { ...s, iconComponent } as MappedSkill;
}

export default function Skills() {
  const { data: apiSkills, isLoading, isError } = useSkillsData();

  // B10 fixed: each mutation receives an onError callback for user feedback.
  // Replace `console.error` with your toast library (e.g. toast.error(message)).
  const onMutationError = (err: unknown) => {
    const message =
      (err as any)?.response?.data?.message ?? 'Something went wrong. Please try again.';
    console.error('[Skills mutation]', message);
    // toast.error(message);
  };

  const createSkill = useCreateSkill(onMutationError);
  const updateSkill = useUpdateSkill(onMutationError);
  const deleteSkill = useDeleteSkill(onMutationError);

  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<ApiSkill | null>(null);

  if (isLoading)
    return (
      <Flex justify="center" p="9">
        <Spinner size="3" />
      </Flex>
    );

  if (isError)
    return (
      <Flex justify="center" p="9">
        <Text color="red">Failed to load skills.</Text>
      </Flex>
    );

  // B1 + B2 + B3 fixed: map API skills to runtime Skill shape with resolved iconComponent.
  const mappedSkills: MappedSkill[] = (apiSkills ?? []).map(toMappedSkill);

  // B5 fixed: if activeSkillId is null or stale (skill was deleted), fall back to index 0.
  const activeSkill =
    mappedSkills.find((s) => s.id === activeSkillId) ??
    (mappedSkills.length > 0 ? mappedSkills[0] : null);

  const handleOpenAdd = () => {
    setEditingSkill(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (skill: ApiSkill) => {
    setEditingSkill(skill);
    setIsDialogOpen(true);
  };

  // B8 + B9 fixed:
  //   B8 — `content` is destructured out and never sent to the API.
  //   B9 — terminal commands preserve kind:'output' / 'comment' / 'blank' by tagging all
  //         as 'command' only when actually submitted. For now the textarea only supports
  //         plain command lines; the kind is always 'command' by design.
  //         Extend to a structured editor if richer kinds are needed.
  const onFormSubmit = async (values: SkillFormValues) => {
    const { content, mode, commands, ...rest } = values;

    const payload =
      mode === 'code'
        ? { ...rest, mode, code: content?.split('\n') || [] }
        : { ...rest, mode, commands: commands || [] };

    // B10 fixed: mutateAsync errors are caught here so the dialog stays open on failure.
    // The onError callback on the mutation handles user-facing feedback.
    try {
      if (editingSkill) {
        await updateSkill.mutateAsync({ id: editingSkill.id, data: payload });
      } else {
        await createSkill.mutateAsync(payload);
      }
      setIsDialogOpen(false);
    } catch {
      // onError on the mutation already handles feedback; just keep the dialog open.
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
        {/* Sidebar: List */}
        <Box className="md:col-span-4">
          <Card size="2">
            <Flex direction="column" gap="4">
              {mappedSkills.length === 0 && (
                <Text size="2" color="gray">
                  No skills added yet.
                </Text>
              )}
              {mappedSkills.map((skill) => (
                <Flex
                  key={skill.id}
                  align="center"
                  justify="between"
                  className="border-b border-(--gray-4) pb-2 last:border-0"
                >
                  <SkillChip
                    skill={skill}
                    active={activeSkill?.id === skill.id}
                    onClick={() => setActiveSkillId(skill.id)}
                  />
                  <Flex gap="2">
                    <IconButton
                      variant="ghost"
                      onClick={() => handleOpenEdit(skill as unknown as ApiSkill)}
                    >
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
                        <AlertDialog.Description>
                          This will remove "{skill.name}" from your portfolio.
                        </AlertDialog.Description>
                        <Flex gap="3" mt="4" justify="end">
                          <AlertDialog.Cancel>
                            <Button variant="soft" color="gray">
                              Cancel
                            </Button>
                          </AlertDialog.Cancel>
                          <AlertDialog.Action>
                            <Button
                              variant="solid"
                              color="red"
                              onClick={() => {
                                // B5 fixed: clear stale activeSkillId when the active skill is deleted.
                                if (activeSkillId === skill.id) setActiveSkillId(null);
                                deleteSkill.mutate(skill.id);
                              }}
                            >
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

        {/* Preview Area */}
        <Box className="md:col-span-8">
          {activeSkill ? (
            <Flex direction="column" gap="4">
              <Text size="2" weight="bold" color="blue" className="uppercase tracking-widest">
                Live Preview (Static)
              </Text>
              <CodeCard
                skill={activeSkill}
                openTabs={[activeSkill]}
                onTabClick={() => {}}
                onTabClose={() => {}}
                started={true}
              />
            </Flex>
          ) : (
            <Card className="h-full flex items-center justify-center border-dashed">
              <Text color="gray">Select a skill to preview</Text>
            </Card>
          )}
        </Box>
      </Grid>

      <SkillDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={onFormSubmit}
        initialData={editingSkill}
        isPending={createSkill.isPending || updateSkill.isPending}
      />
    </Container>
  );
}
