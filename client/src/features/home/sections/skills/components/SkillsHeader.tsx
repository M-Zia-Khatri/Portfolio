import { Heading, Text } from "@radix-ui/themes";
import { memo } from "react";
import { HEADING, TEXT } from "@/shared/constants/style.constants";

export const SkillsHeader = memo(function SkillsHeader() {
  return (
    <div className="text-center gap-1 md:gap-1.5 lg:gap-2 xl:gap-2.5">
      <Heading as="h2" size={HEADING.h2.size} className="font-bold">
        Tech Stack
      </Heading>
      <Text size={TEXT.base.size} color="blue" className="opacity-75">
        select a skill to explore
      </Text>
    </div>
  );
});
