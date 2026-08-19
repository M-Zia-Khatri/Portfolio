import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPortfolio, deletePortfolio, updatePortfolio } from "../portfolio.admin.api";
import type { PortfolioItem } from "../portfolio.types";
import { PORTFOLIO_QUERY_KEY } from "./usePortfolio";

export function usePortfolioActions() {
  const queryClient = useQueryClient();

  type CreateVars = { item: Omit<PortfolioItem, "id"> };
  type CreateCtx = { previous: PortfolioItem[] };

  const createMutation = useMutation<PortfolioItem, Error, CreateVars, CreateCtx>({
    mutationFn: ({ item }) => createPortfolio(item),
    onMutate: async ({ item: newItem }) => {
      await queryClient.cancelQueries({ queryKey: PORTFOLIO_QUERY_KEY });
      const previous = queryClient.getQueryData<PortfolioItem[]>(PORTFOLIO_QUERY_KEY) ?? [];

      const optimistic: PortfolioItem = {
        id: `optimistic-${Date.now()}`,
        ...newItem,
      };
      queryClient.setQueryData<PortfolioItem[]>(PORTFOLIO_QUERY_KEY, (old = []) => [optimistic, ...old]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(PORTFOLIO_QUERY_KEY, ctx.previous);
      }
    },
    onSuccess: (serverItem) => {
      queryClient.setQueryData<PortfolioItem[]>(PORTFOLIO_QUERY_KEY, (old = []) =>
        old.map((item) => (item.id.startsWith("optimistic-") ? serverItem : item)),
      );
    },
  });

  type UpdateVars = { id: string; payload: Partial<Omit<PortfolioItem, "id">> };
  type UpdateCtx = { previous: PortfolioItem[] };

  const updateMutation = useMutation<PortfolioItem, Error, UpdateVars, UpdateCtx>({
    mutationFn: ({ id, payload }) => updatePortfolio(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: PORTFOLIO_QUERY_KEY });
      const previous = queryClient.getQueryData<PortfolioItem[]>(PORTFOLIO_QUERY_KEY) ?? [];

      queryClient.setQueryData<PortfolioItem[]>(PORTFOLIO_QUERY_KEY, (old = []) =>
        old.map((item) => (item.id === id ? { ...item, ...payload } : item)),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(PORTFOLIO_QUERY_KEY, ctx.previous);
      }
    },
    onSuccess: (serverItem) => {
      queryClient.setQueryData<PortfolioItem[]>(PORTFOLIO_QUERY_KEY, (old = []) =>
        old.map((item) => (item.id === serverItem.id ? serverItem : item)),
      );
    },
  });

  type DeleteCtx = { previous: PortfolioItem[] };

  const deleteMutation = useMutation<void, Error, string, DeleteCtx>({
    mutationFn: deletePortfolio,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: PORTFOLIO_QUERY_KEY });
      const previous = queryClient.getQueryData<PortfolioItem[]>(PORTFOLIO_QUERY_KEY) ?? [];

      queryClient.setQueryData<PortfolioItem[]>(PORTFOLIO_QUERY_KEY, (old = []) =>
        old.filter((item) => item.id !== id),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(PORTFOLIO_QUERY_KEY, ctx.previous);
      }
    },
  });

  async function handleDialogSubmit(data: Omit<PortfolioItem, "id">, id?: string) {
    if (id) {
      await updateMutation.mutateAsync({ id, payload: data });
    } else {
      await createMutation.mutateAsync({ item: data });
    }
  }

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    handleDialogSubmit,
  };
}
