import { Box, Container, Flex, Grid, Spinner, Text } from "@radix-ui/themes";
import { useState } from "react";
import type { ApiSkill } from "@/features/skills/types";
import { SkillsEmptyState } from "./components/SkillsEmptyState";
import { SkillsHeader } from "./components/SkillsHeader";
import { SkillsTable, SkillsTablePreview } from "./components/SkillsTable";
import SkillDialog from "./SkillDialog";
import type { SkillFormValues } from "./skills.schema";
import { normalizeTerminalCommands, toMappedSkill } from "./skills.utils";
import {
  useCreateSkill,
  useDeleteSkill,
  useSkillsData,
  useUpdateSkill,
} from "./hooks/useSkillActions";

export default function Skills() {
  const { data: apiSkills, isLoading, isError } = useSkillsData();

  const onMutationError = (err: unknown) => {
    const message =
      (err as any)?.response?.data?.message ?? "Something went wrong. Please try again.";
    console.error("[Skills mutation]", message);
  };

  const createSkill = useCreateSkill(onMutationError);
  const updateSkill = useUpdateSkill(onMutationError);
  const deleteSkill = useDeleteSkill(onMutationError);

  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<ApiSkill | null>(null);

  if (isLoading) {
    return (
      <Flex justify="center" p="9">
        <Spinner size="3" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex justify="center" p="9">
        <Text color="red">Failed to load skills.</Text>
      </Flex>
    );
  }

  const mappedSkills = (apiSkills ?? []).map(toMappedSkill);
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

  const onFormSubmit = async (values: SkillFormValues) => {
    const { content, mode, commands, ...rest } = values;
    const payload =
      mode === "code"
        ? { ...rest, mode, code: content?.split("\n") ?? [] }
        : { ...rest, mode, commands: normalizeTerminalCommands(commands) };

    try {
      if (editingSkill) {
        await updateSkill.mutateAsync({ id: editingSkill.id, data: payload });
      } else {
        await createSkill.mutateAsync(payload);
      }
      setIsDialogOpen(false);
    } catch {
      // mutation onError handles feedback
    }
  };

  return (
    <Container size="4" py="6">
      <SkillsHeader onAdd={handleOpenAdd} />

      <Grid columns={{ initial: "1", md: "12" }} gap="6">
        <Box className="md:col-span-4">
          {mappedSkills.length === 0 ? (
            <SkillsEmptyState />
          ) : (
            <SkillsTable
              skills={mappedSkills}
              activeSkillId={activeSkill?.id ?? null}
              onSelect={setActiveSkillId}
              onEdit={handleOpenEdit}
              onDelete={(id) => {
                if (activeSkillId === id) setActiveSkillId(null);
                deleteSkill.mutate(id);
              }}
            />
          )}
        </Box>

        <Box className="md:col-span-8">
          <SkillsTablePreview activeSkill={activeSkill} />
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
