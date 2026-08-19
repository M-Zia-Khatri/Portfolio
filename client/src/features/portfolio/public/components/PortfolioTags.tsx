import { Badge, Flex } from "@radix-ui/themes";
import { motion, type Variants } from "motion/react";

interface PortfolioTagsProps {
  useTech: string[];
  flipped: boolean;
  backItemVariants: Variants;
}

export function PortfolioTags({ useTech, flipped, backItemVariants }: PortfolioTagsProps) {
  return (
    <motion.div custom={2} variants={backItemVariants} animate={flipped ? "visible" : "hidden"}>
      <Flex wrap="wrap" gap="2">
        {useTech.map((tech, i) => (
          <motion.div
            key={tech}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={flipped ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
            transition={{
              delay: flipped ? 0.32 + i * 0.055 : 0,
              type: "spring",
              stiffness: 260,
              damping: 18,
            }}
            whileHover={{
              scale: 1.12,
              y: -2,
              transition: { type: "spring", stiffness: 400, damping: 16 },
            }}
          >
            <Badge variant="surface" size="3" className="cursor-default tracking-wide">
              {tech}
            </Badge>
          </motion.div>
        ))}
      </Flex>
    </motion.div>
  );
}
