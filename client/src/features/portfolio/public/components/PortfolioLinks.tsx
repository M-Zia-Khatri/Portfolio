import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import type { MouseEvent } from "react";

interface PortfolioLinksProps {
  href: string;
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
  showFrontHoverVariants?: boolean;
}

export function PortfolioLinks({
  href,
  onClick,
  className,
  showFrontHoverVariants = false,
}: PortfolioLinksProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={className}
      variants={
        showFrontHoverVariants
          ? {
              idle: { opacity: 0, scale: 0.75, y: -4 },
              hovered: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: 0.22, delay: 0.04 },
              },
            }
          : undefined
      }
      whileHover={{
        scale: 1.18,
        backgroundColor: "rgba(255,255,255,0.14)",
        transition: { type: "spring", stiffness: 350, damping: 20 },
      }}
    >
      <motion.div
        whileHover={{ rotate: 45 }}
        whileTap={{ rotate: 45 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
      >
        <ArrowUpRight size={14} className="text-(--blue-12)/70" />
      </motion.div>
    </motion.a>
  );
}
