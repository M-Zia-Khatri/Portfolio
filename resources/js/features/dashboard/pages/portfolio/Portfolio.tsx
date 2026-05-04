import { cn } from '@/shared/utils/cn';
import {
  AlertDialog,
  Button,
  Callout,
  Flex,
  Grid,
  Heading,
  Select,
  Skeleton,
  Spinner,
  Text,
} from '@radix-ui/themes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, TriangleAlert } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { createPortfolio, deletePortfolio, fetchPortfolio, updatePortfolio } from './portfolio.api';
import type { PortfolioItem } from './portfolio.types';
import { PortfolioCard } from './PortfolioCard';
import { PortfolioDialog } from './PortfolioDialog';

const QUERY_KEY = ['portfolio'] as const;

// ─── Animation Variants ───────────────────────────────────────────────────────

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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-4)] overflow-hidden',
        'border border-[var(--gray-4)] bg-[var(--gray-2)]',
      )}
    >
      <Skeleton className={cn('h-44 w-full')} />
      <div className={cn('p-4 flex flex-col gap-2')}>
        <Skeleton className={cn('h-4 w-3/4')} />
        <Skeleton className={cn('h-3 w-1/2')} />
        <Skeleton className={cn('h-3 w-full')} />
        <Skeleton className={cn('h-3 w-full')} />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Portfolio() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterTech, setFilterTech] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');

  // ─── Query ─────────────────────────────────────────────────────────────────

  const {
    data: items = [],
    isLoading,
    isError,
    error,
  } = useQuery<PortfolioItem[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchPortfolio,
    staleTime: 1000 * 60 * 5,
  });

  // ─── Filter Options ────────────────────────────────────────────────────────

  const allTechs = Array.from(new Set(items.flatMap((item) => item.use_tech))).sort();

  const allRoles = Array.from(new Set(items.map((item) => item.site_role).filter(Boolean))).sort();

  const filtered = items.filter((item) => {
    const techMatch = filterTech === 'all' || item.use_tech.includes(filterTech);
    const roleMatch = filterRole === 'all' || item.site_role === filterRole;
    return techMatch && roleMatch;
  });

  // ─── Create Mutation ───────────────────────────────────────────────────────

  type CreateVars = { item: Omit<PortfolioItem, 'id'> };
  type CreateCtx = { previous: PortfolioItem[] };

  const createMutation = useMutation<PortfolioItem, Error, CreateVars, CreateCtx>({
    mutationFn: ({ item }) => createPortfolio(item),
    onMutate: async ({ item: newItem }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<PortfolioItem[]>(QUERY_KEY) ?? [];

      const optimistic: PortfolioItem = {
        id: `optimistic-${Date.now()}`,
        ...newItem,
      };
      queryClient.setQueryData<PortfolioItem[]>(QUERY_KEY, (old = []) => [optimistic, ...old]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(QUERY_KEY, ctx.previous);
      }
    },
    // FIX: removed unused `ctx` parameter
    onSuccess: (serverItem) => {
      queryClient.setQueryData<PortfolioItem[]>(QUERY_KEY, (old = []) =>
        old.map((item) => (item.id.startsWith('optimistic-') ? serverItem : item)),
      );
    },
  });

  // ─── Update Mutation ───────────────────────────────────────────────────────

  type UpdateVars = { id: string; payload: Partial<Omit<PortfolioItem, 'id'>> };
  type UpdateCtx = { previous: PortfolioItem[] };

  const updateMutation = useMutation<PortfolioItem, Error, UpdateVars, UpdateCtx>({
    mutationFn: ({ id, payload }) => updatePortfolio(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<PortfolioItem[]>(QUERY_KEY) ?? [];

      queryClient.setQueryData<PortfolioItem[]>(QUERY_KEY, (old = []) =>
        old.map((item) => (item.id === id ? { ...item, ...payload } : item)),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(QUERY_KEY, ctx.previous);
      }
    },
    onSuccess: (serverItem) => {
      queryClient.setQueryData<PortfolioItem[]>(QUERY_KEY, (old = []) =>
        old.map((item) => (item.id === serverItem.id ? serverItem : item)),
      );
    },
  });

  // ─── Delete Mutation ───────────────────────────────────────────────────────

  type DeleteCtx = { previous: PortfolioItem[] };

  const deleteMutation = useMutation<void, Error, string, DeleteCtx>({
    mutationFn: deletePortfolio,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<PortfolioItem[]>(QUERY_KEY) ?? [];

      queryClient.setQueryData<PortfolioItem[]>(QUERY_KEY, (old = []) =>
        old.filter((item) => item.id !== id),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(QUERY_KEY, ctx.previous);
      }
    },
  });

  // ─── Handlers ──────────────────────────────────────────────────────────────

  async function handleDialogSubmit(data: Omit<PortfolioItem, 'id'>, id?: string) {
    if (id) {
      await updateMutation.mutateAsync({ id, payload: data });
    } else {
      await createMutation.mutateAsync({ item: data });
    }
  }

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

  function clearFilters() {
    setFilterTech('all');
    setFilterRole('all');
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={cn('min-h-screen bg-[var(--color-background)] p-6 md:p-10')}>
      <div className={cn('max-w-[var(--container-4)] mx-auto')}>
        {/* Header */}
        <motion.div variants={slideDown} initial="hidden" animate="show">
          <Flex align="center" justify="between" mb="6" gap="4" wrap="wrap">
            <div>
              <Heading size="7" className={cn('text-[var(--gray-12)] font-bold')}>
                Portfolio
              </Heading>
              <Text size="2" className={cn('text-[var(--gray-10)] mt-1')}>
                {items.length} {items.length === 1 ? 'project' : 'projects'}
              </Text>
            </div>

            <Button size="2" color="blue" onClick={handleAddNew}>
              <Plus size={15} />
              Add Portfolio
            </Button>
          </Flex>
        </motion.div>

        {/* Filters */}
        <AnimatePresence>
          {items.length > 0 && (
            <motion.div
              variants={slideDown}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
            >
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
                    <motion.div
                      variants={fadeIn}
                      initial="hidden"
                      animate="show"
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    >
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

        {/* Loading */}
        {isLoading && (
          <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </Grid>
        )}

        {/* Error */}
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

        {/* Empty — no items at all */}
        <AnimatePresence>
          {!isLoading && !isError && items.length === 0 && (
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
          {!isLoading && !isError && items.length > 0 && filtered.length === 0 && (
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
        {!isLoading && filtered.length > 0 && (
          <motion.div
            variants={gridContainer}
            initial="hidden"
            animate="show"
            className={cn('grid gap-4', 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3')}
          >
            {filtered.map((item) => (
              <PortfolioCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* ─── Dialog ─────────────────────────────────────────────────────────── */}
      <PortfolioDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditItem(null);
        }}
        editItem={editItem}
        onSubmit={handleDialogSubmit}
      />

      {/* ─── Delete Confirmation ─────────────────────────────────────────────── */}
      <AlertDialog.Root
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialog.Content maxWidth="400px">
          <AlertDialog.Title>Delete Portfolio Item</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure? This action cannot be undone.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button color="red" onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? (
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
