import { Badge, Heading } from "@radix-ui/themes";
import { motion } from "motion/react";
import type { MouseEvent } from "react";
import { BorderTrail } from "@/shared/components/motion-primitives/border-trail";
import { HEADING } from "@/shared/constants/style.constants";
import { optimizedCloudinaryUrl } from "@/shared/utils/cloudinaryUrl";
import type { PortfolioItem } from "../../types";
import { PortfolioLinks } from "./PortfolioLinks";

interface PortfolioImageProps {
  item: PortfolioItem;
  imgX: any;
  imgY: any;
  onDemoClick: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export function PortfolioImage({ item, imgX, imgY, onDemoClick }: PortfolioImageProps) {
  return (
    <>
      <motion.img
        className="absolute -top-[5%] left-[0%] h-[110%] w-[110%] object-cover"
        src={optimizedCloudinaryUrl({ url: item.siteImageUrl, width: 800 })}
        alt={item.siteName}
        style={{ x: imgX, y: imgY, willChange: "transform" }}
      />

      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)",
        }}
        variants={{
          idle: { x: "-110%", opacity: 0 },
          hovered: { x: "110%", opacity: 1, transition: { duration: 0.7, ease: "easeInOut" } },
        }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

      <PortfolioLinks
        href={item.siteUrl}
        onClick={onDemoClick}
        showFrontHoverVariants
        className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-(--blue-12)/30 bg-(--blue-12)/10 backdrop-blur-sm"
      />

      <motion.div
        className="absolute right-0 bottom-0 left-0 p-4"
        variants={{
          idle: { y: 4, opacity: 0.85 },
          hovered: { y: 0, opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
        }}
      >
        <Heading as="h3" size={HEADING.h3.size} className="ml-2 leading-tight font-bold text-white">
          {item.siteName}
        </Heading>
        <Badge
          size="3"
          className="mt-2 inline-block rounded-full text-[10px] font-semibold uppercase"
        >
          {item.siteRole}
        </Badge>
      </motion.div>
      <div className="absolute inset-0 rounded-xl ring-1 ring-white/10" />
      <BorderTrail className="bg-white/30" size={60} />
    </>
  );
}
