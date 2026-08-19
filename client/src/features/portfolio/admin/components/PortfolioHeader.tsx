import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/shared/utils/cn";

const slideDown = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

interface PortfolioHeaderProps {
  itemCount: number;
  onAddNew: () => void;
}

export function PortfolioHeader({ itemCount, onAddNew }: PortfolioHeaderProps) {
  return (
    <motion.div variants={slideDown} initial="hidden" animate="show">
      <Flex align="center" justify="between" mb="6" gap="4" wrap="wrap">
        <div>
          <Heading size="7" className={cn("text-[var(--gray-12)] font-bold")}>
            Portfolio
          </Heading>
          <Text size="2" className={cn("text-[var(--gray-10)] mt-1")}>
            {itemCount} {itemCount === 1 ? "project" : "projects"}
          </Text>
        </div>

        <Button size="2" color="blue" onClick={onAddNew}>
          <Plus size={15} />
          Add Portfolio
        </Button>
      </Flex>
    </motion.div>
  );
}
