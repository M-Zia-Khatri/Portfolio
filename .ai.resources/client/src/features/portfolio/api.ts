import { api } from '@/shared/api/axios';

type PortfolioApiRow = {
  site_name: string;
  site_role: string;
  site_url: string;
  site_image_url: string;
  use_tech: string[];
  description: string;
};

type ApiResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data?: T;
};

export async function fetchPublicPortfolio(): Promise<PortfolioApiRow[]> {
  const { data } = await api.get<ApiResponse<PortfolioApiRow[]>>('/portfolio');
  return data.data ?? [];
}
