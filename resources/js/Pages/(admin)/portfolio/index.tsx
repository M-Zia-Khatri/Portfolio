import { cn } from '@/shared/utils/cn';
import type { PortfolioPageProps } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { AlertDialog, Button, Callout, Flex, Heading, Select, Spinner, Text } from '@radix-ui/themes';
import { CheckCircle, Plus, TriangleAlert } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import AdminLayout from '../Layout';
import type { PortfolioItem } from './portfolio.types';
import { PortfolioCard } from './PortfolioCard';
import { PortfolioDialog } from './PortfolioDialog';

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
};

const slideDown = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const gridContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

function PortfolioPage() {
  const { portfolioItems = [], flash } = usePage<PortfolioPageProps>().props;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [filterTech, setFilterTech] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');

  const items = portfolioItems;

  const allTechs = Array.from(new Set(items.flatMap((item) => item.useTech))).sort();

  const allRoles = Array.from(new Set(items.map((item) => item.siteRole).filter(Boolean))).sort();

  const filtered = items.filter((item) => {
    const techMatch = filterTech === 'all' || item.useTech.includes(filterTech);
    const roleMatch = filterRole === 'all' || item.siteRole === filterRole;
    return techMatch && roleMatch;
  });

  function handleEdit(item: PortfolioItem) {
    setEditItem(item);
    setDialogOpen(true);
  }

  function handleAddNew() {
    setEditItem(null);
    setDialogOpen(true);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    router.delete(route('portfolio.destroy', deleteTarget), {
      preserveScroll: true,
      onStart: () => {
        setIsDeleting(true);
        setDeleteError(null);
      },
      onSuccess: () => {
        setDeleteTarget(null);
      },
      onError: () => {
        setDeleteError('Unable to delete this portfolio item. Please try again.');
      },
      onFinish: () => {
        setIsDeleting(false);
      },
    });
  }

  function clearFilters() {
    setFilterTech('all');
    setFilterRole('all');
  }

  return (
    <div className={cn('min-h-screen bg-[var(--color-background)] p-6 md:p-10')}>
      <div className={cn('mx-auto max-w-[var(--container-4)]')}>
        {/* Header */}
        <motion.div variants={slideDown} initial="hidden" animate="show">
          <Flex align="center" justify="between" mb="6" gap="4" wrap="wrap">
            <div>
              <Heading size="7" className={cn('font-bold text-[var(--gray-12)]')}>
                Portfolio
              </Heading>
              <Text size="2" className={cn('mt-1 text-[var(--gray-10)]')}>
                {items.length} {items.length === 1 ? 'project' : 'projects'}
              </Text>
            </div>

            <Button size="2" color="blue" onClick={handleAddNew}>
              <Plus size={15} />
              Add Portfolio
            </Button>
          </Flex>
        </motion.div>

        <AnimatePresence>
          {flash?.success && (
            <motion.div variants={fadeIn} initial="hidden" animate="show" exit={{ opacity: 0 }} className={cn('mb-6')}>
              <Callout.Root color="green">
                <Callout.Icon>
                  <CheckCircle size={16} />
                </Callout.Icon>
                <Callout.Text>{flash.success}</Callout.Text>
              </Callout.Root>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deleteError && (
            <motion.div variants={fadeIn} initial="hidden" animate="show" exit={{ opacity: 0 }} className={cn('mb-6')}>
              <Callout.Root color="red">
                <Callout.Icon>
                  <TriangleAlert size={16} />
                </Callout.Icon>
                <Callout.Text>{deleteError}</Callout.Text>
              </Callout.Root>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <AnimatePresence>
          {items.length > 0 && (
            <motion.div variants={slideDown} initial="hidden" animate="show" exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}>
              <Flex gap="3" mb="6" wrap="wrap">
                <Flex align="center" gap="2">
                  <Text size="1" className={cn('text-[var(--gray-10)]')}>
                    Tech:
                  </Text>
                  <Select.Root value={filterTech} onValueChange={setFilterTech} size="1">
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="all">All</Select.Item>
                      {allTechs.map((tech) => (
                        <Select.Item key={tech} value={tech}>
                          {tech}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>

                <Flex align="center" gap="2">
                  <Text size="1" className={cn('text-[var(--gray-10)]')}>
                    Role:
                  </Text>
                  <Select.Root value={filterRole} onValueChange={setFilterRole} size="1">
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="all">All</Select.Item>
                      {allRoles.map((role) => (
                        <Select.Item key={role} value={role}>
                          {role}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>

                <AnimatePresence>
                  {(filterTech !== 'all' || filterRole !== 'all') && (
                    <motion.div variants={fadeIn} initial="hidden" animate="show" exit={{ opacity: 0, transition: { duration: 0.1 } }}>
                      <Button variant="ghost" color="gray" size="1" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Flex>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty — no items at all */}
        <AnimatePresence>
          {items.length === 0 && (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              className={cn('flex flex-col items-center gap-3 py-24')}
            >
              <Text size="4">No portfolio items yet</Text>
              <Button size="2" color="blue" onClick={handleAddNew}>
                <Plus size={15} /> Add Portfolio
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty — filters produce no results */}
        <AnimatePresence>
          {items.length > 0 && filtered.length === 0 && (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              className={cn('flex flex-col items-center gap-2 py-20')}
            >
              <Text size="3">No results match your filters.</Text>
              <Button variant="ghost" color="blue" size="2" onClick={clearFilters}>
                Clear filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid — stagger children via cardVariants exported from PortfolioCard */}
        {filtered.length > 0 && (
          <motion.div
            variants={gridContainer}
            initial="hidden"
            animate="show"
            className={cn('grid gap-4', 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3')}
          >
            {filtered.map((item) => (
              <PortfolioCard key={item.id} item={item} onEdit={handleEdit} onDelete={setDeleteTarget} />
            ))}
          </motion.div>
        )}
      </div>

      {/* ─── Dialog ─────────────────────────────────────────────────────────── */}
      <PortfolioDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditItem(null);
          }
        }}
        editItem={editItem}
      />

      {/* ─── Delete Confirmation ─────────────────────────────────────────────── */}
      <AlertDialog.Root open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialog.Content maxWidth="400px">
          <AlertDialog.Title>Delete Portfolio Item</AlertDialog.Title>
          <AlertDialog.Description>Are you sure? This action cannot be undone.</AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button color="red" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? (
                  <Flex align="center" gap="2">
                    <Spinner size="1" /> Deleting…
                  </Flex>
                ) : (
                  'Delete'
                )}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
}

PortfolioPage.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default PortfolioPage;
