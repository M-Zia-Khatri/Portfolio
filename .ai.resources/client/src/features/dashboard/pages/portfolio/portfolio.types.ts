// ─── DB / API Column Names (Snake_case) ──────────────────────────────────────

export interface PortfolioItem {
  id: string;
  site_name: string;
  site_role: string;
  site_url: string;
  site_image_url: string;
  use_tech: string[];
  description: string;
}

// ─── Form Values ──────────────────────────────────────────────────────────────

// use_tech is kept as a plain string in the form (comma-separated)
// and converted to/from string[] at the boundary (submit / populate)
export interface PortfolioFormValues {
  site_name: string;
  site_role: string;
  site_url: string;
  site_image?: FileList;
  use_tech: string; // UI input: "React, Node.js"
  description: string;
}

// ─── API Response Structure ───────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  // Required fields
  success: boolean;
  status: number;
  message: string;
  // Optional fields
  data?: T;
  error?: unknown;
  meta?: unknown;
}
