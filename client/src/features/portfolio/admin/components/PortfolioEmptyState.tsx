import { Button, Text } from "@radix-ui/themes";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/utils/cn";

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
};

interface PortfolioEmptyStateProps {
  hasItems: boolean;
  hasFilteredResults: boolean;
  onAddNew: () => void;
  onClearFilters: () => void;
}

export function PortfolioEmptyState({
  hasItems,
  hasFilteredResults,
  onAddNew,
  onClearFilters,
}: PortfolioEmptyStateProps) {
  return (
    <>
      <AnimatePresence>
        {!hasItems && (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className={cn("flex flex-col items-center gap-3 py-24")}
          >
            <Text size="4">No portfolio items yet</Text>
            <Button size="2" color="blue" onClick={onAddNew}>
              <Plus size={15} /> Add Portfolio
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasItems && !hasFilteredResults && (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className={cn("flex flex-col items-center gap-2 py-20")}
          >
            <Text size="3">No results match your filters.</Text>
            <Button variant="ghost" color="blue" size="2" onClick={onClearFilters}>
              Clear filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
