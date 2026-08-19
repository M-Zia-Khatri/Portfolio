import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import {
  AlertDialog,
  Button,
  Card,
  Flex,
  IconButton,
  Text,
} from "@radix-ui/themes";
import SkillChip from "@/features/skills/components/SkillChip";
import CodeCard from "@/shared/components/CodeCard";
import type { ApiSkill } from "@/features/skills/types";
import type { MappedSkill } from "../skills.utils";

interface SkillsTableProps {
  skills: MappedSkill[];
  activeSkillId: string | null;
  onSelect: (id: string) => void;
  onEdit: (skill: ApiSkill) => void;
  onDelete: (id: string) => void;
}

export function SkillTableRow({
  skill,
  isActive,
  onSelect,
  onEdit,
  onDelete,
}: {
  skill: MappedSkill;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Flex
      align="center"
      justify="between"
      className="border-b border-(--gray-4) pb-2 last:border-0"
    >
      <SkillChip skill={skill} active={isActive} onClick={onSelect} />
      <Flex gap="2">
        <IconButton variant="ghost" onClick={onEdit}>
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
                <Button variant="solid" color="red" onClick={onDelete}>
                  Delete
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Flex>
    </Flex>
  );
}

export function SkillsTable({
  skills,
  activeSkillId,
  onSelect,
  onEdit,
  onDelete,
}: SkillsTableProps) {
  return (
    <Card size="2">
      <Flex direction="column" gap="4">
        {skills.map((skill) => (
          <SkillTableRow
            key={skill.id}
            skill={skill}
            isActive={activeSkillId === skill.id}
            onSelect={() => onSelect(skill.id)}
            onEdit={() => onEdit(skill as unknown as ApiSkill)}
            onDelete={() => onDelete(skill.id)}
          />
        ))}
      </Flex>
    </Card>
  );
}

export function SkillsTablePreview({ activeSkill }: { activeSkill: MappedSkill | null }) {
  if (!activeSkill) {
    return (
      <Card className="h-full flex items-center justify-center border-dashed">
        <Text color="gray">Select a skill to preview</Text>
      </Card>
    );
  }

  return (
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
  );
}
