import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchPortfolio } from "../portfolio.admin.api";
import type { PortfolioItem } from "../portfolio.types";

export const PORTFOLIO_QUERY_KEY = ["portfolio"] as const;

export function usePortfolio() {
  const [filterTech, setFilterTech] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");

  const query = useQuery<PortfolioItem[]>({
    queryKey: PORTFOLIO_QUERY_KEY,
    queryFn: fetchPortfolio,
    staleTime: 1000 * 60 * 5,
  });

  const items = query.data ?? [];

  const allTechs = useMemo(
    () => Array.from(new Set(items.flatMap((item) => item.use_tech))).sort(),
    [items],
  );

  const allRoles = useMemo(
    () => Array.from(new Set(items.map((item) => item.site_role).filter(Boolean))).sort(),
    [items],
  );

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const techMatch = filterTech === "all" || item.use_tech.includes(filterTech);
        const roleMatch = filterRole === "all" || item.site_role === filterRole;
        return techMatch && roleMatch;
      }),
    [items, filterTech, filterRole],
  );

  function clearFilters() {
    setFilterTech("all");
    setFilterRole("all");
  }

  return {
    ...query,
    items,
    filtered,
    allTechs,
    allRoles,
    filterTech,
    filterRole,
    setFilterTech,
    setFilterRole,
    clearFilters,
  };
}
