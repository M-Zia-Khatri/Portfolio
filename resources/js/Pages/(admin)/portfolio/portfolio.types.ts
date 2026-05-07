import type { PortfolioItemData } from '@/types/generated';

export type PortfolioItem = PortfolioItemData;

export interface PortfolioFormValues {
  [key: string]: string | File | null;
  siteName: string;
  siteRole: string;
  siteUrl: string;
  siteImage: File | null;
  useTech: string;
  description: string;
}
