import { motion } from "motion/react";
import { cn } from "@/shared/utils/cn";
import type { PortfolioItem } from "../portfolio.types";
import { PortfolioTableRow } from "./PortfolioTableRow";

const gridContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

interface PortfolioTableProps {
  items: PortfolioItem[];
  onEdit: (item: PortfolioItem) => void;
  onDelete: (id: string) => void;
}

export function PortfolioTable({ items, onEdit, onDelete }: PortfolioTableProps) {
  return (
    <motion.div
      variants={gridContainer}
      initial="hidden"
      animate="show"
      className={cn("grid gap-4", "grid-cols-1 sm:grid-cols-2 md:grid-cols-3")}
    >
      {items.map((item) => (
        <PortfolioTableRow key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </motion.div>
  );
}
