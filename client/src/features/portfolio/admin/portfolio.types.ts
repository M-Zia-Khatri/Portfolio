export interface PortfolioItem {
  id: string;
  site_name: string;
  site_role: string;
  site_url: string;
  site_image_url: string;
  use_tech: string[];
  description: string;
}

export interface PortfolioFormValues {
  site_name: string;
  site_role: string;
  site_url: string;
  site_image?: FileList;
  use_tech: string;
  description: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  error?: unknown;
  meta?: unknown;
}
