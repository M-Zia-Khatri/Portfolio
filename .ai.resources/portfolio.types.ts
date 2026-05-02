export interface PortfolioItem {
  id: string;
  siteName: string;
  siteRole: string;
  siteUrl: string;
  siteImageUrl: string;
  useTech: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePortfolioDto {
  site_name: string;
  site_role: string;
  site_url: string;
  site_image_url: string;
  use_tech: string[];
  description: string;
}

export type UpdatePortfolioDto = Partial<CreatePortfolioDto>;
