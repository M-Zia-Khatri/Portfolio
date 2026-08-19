import { Flex, Text } from "@radix-ui/themes";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/utils/cn";

export function PortfolioFormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <Flex direction="column" gap="1">
      <Text as="label" size="1" weight="medium" className={cn("text-(--gray-11)")}>
        {label}
      </Text>
      {children}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Text size="1" className={cn("text-(--red-9)")}>
              {error}
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </Flex>
  );
}
