import { Callout } from "@radix-ui/themes";
import { TriangleAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { PortfolioActions } from "./components/PortfolioActions";
import { PortfolioEmptyState } from "./components/PortfolioEmptyState";
import { PortfolioFilters } from "./components/PortfolioFilters";
import { PortfolioHeader } from "./components/PortfolioHeader";
import { PortfolioLoading } from "./components/PortfolioLoading";
import { PortfolioTable } from "./components/PortfolioTable";
import { usePortfolio } from "./hooks/usePortfolio";
import { usePortfolioActions } from "./hooks/usePortfolioActions";
import { PortfolioDialog } from "./PortfolioDialog";
import type { PortfolioItem } from "./portfolio.types";

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
};

export default function Portfolio() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const {
    items,
    filtered,
    allTechs,
    allRoles,
    filterTech,
    filterRole,
    setFilterTech,
    setFilterRole,
    clearFilters,
    isLoading,
    isError,
    error,
  } = usePortfolio();

  const { deleteMutation, handleDialogSubmit } = usePortfolioActions();

  function handleEdit(item: PortfolioItem) {
    setEditItem(item);
    setDialogOpen(true);
  }

  function handleAddNew() {
    setEditItem(null);
    setDialogOpen(true);
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
      setDeleteTarget(null);
    }
  }

  return (
    <div className={cn("min-h-screen bg-[var(--color-background)] p-6 md:p-10")}>
      <div className={cn("max-w-[var(--container-4)] mx-auto")}>
        <PortfolioHeader itemCount={items.length} onAddNew={handleAddNew} />

        <AnimatePresence>
          {items.length > 0 && (
            <PortfolioFilters
              allTechs={allTechs}
              allRoles={allRoles}
              filterTech={filterTech}
              filterRole={filterRole}
              onFilterTechChange={setFilterTech}
              onFilterRoleChange={setFilterRole}
              onClearFilters={clearFilters}
            />
          )}
        </AnimatePresence>

        {isLoading && <PortfolioLoading />}

        <AnimatePresence>
          {isError && (
            <motion.div variants={fadeIn} initial="hidden" animate="show" exit={{ opacity: 0 }}>
              <Callout.Root color="red">
                <Callout.Icon>
                  <TriangleAlert size={16} />
                </Callout.Icon>
                <Callout.Text>{(error as Error)?.message}</Callout.Text>
              </Callout.Root>
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && !isError && (
          <PortfolioEmptyState
            hasItems={items.length > 0}
            hasFilteredResults={filtered.length > 0}
            onAddNew={handleAddNew}
            onClearFilters={clearFilters}
          />
        )}

        {!isLoading && filtered.length > 0 && (
          <PortfolioTable items={filtered} onEdit={handleEdit} onDelete={setDeleteTarget} />
        )}
      </div>

      <PortfolioDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditItem(null);
        }}
        editItem={editItem}
        onSubmit={handleDialogSubmit}
      />

      <PortfolioActions
        deleteTarget={deleteTarget}
        isDeleting={deleteMutation.isPending}
        onDeleteTargetChange={setDeleteTarget}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
