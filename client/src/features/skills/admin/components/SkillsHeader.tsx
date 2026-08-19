import { PlusIcon } from "@radix-ui/react-icons";
import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";

interface SkillsHeaderProps {
  onAdd: () => void;
}

export function SkillsHeader({ onAdd }: SkillsHeaderProps) {
  return (
    <Flex justify="between" align="center" mb="6">
      <Box>
        <Heading size="8">Manage Skills</Heading>
        <Text color="gray">Configure your tech stack and code previews</Text>
      </Box>
      <Button size="3" onClick={onAdd}>
        <PlusIcon /> Add Skill
      </Button>
    </Flex>
  );
}
