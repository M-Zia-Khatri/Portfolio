import { Heading, Text } from "@radix-ui/themes";
import { motion, type Variants } from "motion/react";
import type { MouseEvent } from "react";
import { HEADING, TEXT } from "@/shared/constants/style.constants";
import type { PortfolioItem } from "../../types";
import { PortfolioLinks } from "./PortfolioLinks";

interface PortfolioContentProps {
  item: PortfolioItem;
  flipped: boolean;
  backItemVariants: Variants;
  onGithubClick: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export function PortfolioContent({
  item,
  flipped,
  backItemVariants,
  onGithubClick,
}: PortfolioContentProps) {
  return (
    <>
      <motion.div
        custom={0}
        variants={backItemVariants}
        animate={flipped ? "visible" : "hidden"}
        className="flex justify-between"
      >
        <div className="flex flex-col">
          <Heading as="h4" size={HEADING.h4.size} className="leading-tight text-white">
            {item.siteName}
          </Heading>
          <Text
            size={TEXT.sm.size}
            className="mt-1 font-semibold tracking-widest text-(--blue-10)/90 uppercase"
            as="p"
          >
            {item.siteRole}
          </Text>
        </div>
        <PortfolioLinks
          href={item.siteUrl}
          onClick={onGithubClick}
          className="z-20 flex h-8 w-8 items-center justify-center rounded-full border border-(--blue-12)/30 bg-(--blue-12)/10 backdrop-blur-sm"
        />
      </motion.div>

      <motion.div custom={1} variants={backItemVariants} animate={flipped ? "visible" : "hidden"} className="flex-1">
        <Text size={TEXT.sm.size} className="leading-relaxed text-white/60" as="p">
          {item.description}
        </Text>
      </motion.div>
    </>
  );
}
