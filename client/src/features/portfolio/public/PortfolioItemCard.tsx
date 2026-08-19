import { AspectRatio } from "@radix-ui/themes";
import { motion, type Variants } from "motion/react";
import { cn } from "@/shared/utils/cn";
import type { PortfolioItem } from "../types";
import { PortfolioActions } from "./components/PortfolioActions";
import { PortfolioContent } from "./components/PortfolioContent";
import { PortfolioImage } from "./components/PortfolioImage";
import { PortfolioStatus } from "./components/PortfolioStatus";
import { PortfolioTags } from "./components/PortfolioTags";
import { usePortfolioCard } from "./hooks/usePortfolioCard";
import { portfolioFaceBaseClass } from "./portfolio.utils";

interface PortfolioItemCardProps {
  item: PortfolioItem;
}

const backItemVariants: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: 0.18 + i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function PortfolioItemCard({ item }: PortfolioItemCardProps) {
  const card = usePortfolioCard(item);
  return (
    <motion.div
      ref={card.cardRef}
      className="group cursor-pointer perspective-distant"
      onClick={card.flip}
      onMouseMove={card.handleMouseMove}
      onMouseLeave={card.handleMouseLeave}
      initial="idle"
      whileHover="hovered"
      whileTap={{ scale: 0.975, transition: { type: "spring", stiffness: 400, damping: 20 } }}
      style={{
        rotateX: card.tiltX,
        rotateY: card.tiltY,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      variants={{
        idle: { y: 0 },
        hovered: { y: -7, transition: { type: "spring", stiffness: 280, damping: 22 } },
      }}
    >
      <AspectRatio ratio={16 / 9}>
        <div className="relative h-full w-full transform-3d">
          <motion.div
            className={cn(portfolioFaceBaseClass)}
            style={{
              transform: card.frontTransform,
              opacity: card.frontOpacity,
              willChange: "transform, opacity",
            }}
          >
            <PortfolioImage
              item={item}
              imgX={card.imgX}
              imgY={card.imgY}
              onDemoClick={(e) => {
                e.stopPropagation();
                card.onDemoClick();
              }}
            />
          </motion.div>

          <motion.div
            className={cn(portfolioFaceBaseClass, "bg-(--gray-2)")}
            style={{
              transform: card.backTransform,
              opacity: card.backOpacity,
              willChange: "transform, opacity",
            }}
          >
            <PortfolioActions
              gridBaseRef={card.gridBaseRef}
              gridShineTrailRef={card.gridShineTrailRef}
              gridShineLeadRef={card.gridShineLeadRef}
            />
            <PortfolioStatus />
            <div className="relative z-10 flex h-full flex-col gap-2 p-4">
              <PortfolioContent
                item={item}
                flipped={card.flipped}
                backItemVariants={backItemVariants}
                onGithubClick={(e) => {
                  e.stopPropagation();
                  card.onGithubClick();
                }}
              />
              <PortfolioTags
                useTech={item.useTech}
                flipped={card.flipped}
                backItemVariants={backItemVariants}
              />
            </div>
          </motion.div>
        </div>
      </AspectRatio>
    </motion.div>
  );
}
