import type { PortfolioItem } from "../types";

export function getPortfolioProjectId(item: PortfolioItem) {
  return (
    item.siteName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") || item.siteUrl
  );
}

export const portfolioFaceBaseClass =
  "absolute inset-0 flex flex-col [backface-visibility:hidden] overflow-hidden rounded-xl";
