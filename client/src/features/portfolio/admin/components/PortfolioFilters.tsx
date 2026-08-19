import { Button, Flex, Select, Text } from "@radix-ui/themes";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/utils/cn";

const slideDown = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
};

interface PortfolioFiltersProps {
  allTechs: string[];
  allRoles: string[];
  filterTech: string;
  filterRole: string;
  onFilterTechChange: (value: string) => void;
  onFilterRoleChange: (value: string) => void;
  onClearFilters: () => void;
}

export function PortfolioFilters({
  allTechs,
  allRoles,
  filterTech,
  filterRole,
  onFilterTechChange,
  onFilterRoleChange,
  onClearFilters,
}: PortfolioFiltersProps) {
  return (
    <motion.div
      variants={slideDown}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
    >
      <Flex gap="3" mb="6" wrap="wrap">
        <Flex align="center" gap="2">
          <Text size="1" className={cn("text-[var(--gray-10)]")}>
            Tech:
          </Text>
          <Select.Root value={filterTech} onValueChange={onFilterTechChange} size="1">
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="all">All</Select.Item>
              {allTechs.map((tech) => (
                <Select.Item key={tech} value={tech}>
                  {tech}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex align="center" gap="2">
          <Text size="1" className={cn("text-[var(--gray-10)]")}>
            Role:
          </Text>
          <Select.Root value={filterRole} onValueChange={onFilterRoleChange} size="1">
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="all">All</Select.Item>
              {allRoles.map((role) => (
                <Select.Item key={role} value={role}>
                  {role}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        <AnimatePresence>
          {(filterTech !== "all" || filterRole !== "all") && (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
            >
              <Button variant="ghost" color="gray" size="1" onClick={onClearFilters}>
                Clear filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Flex>
    </motion.div>
  );
}
