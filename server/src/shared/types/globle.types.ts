export interface ApiResponse<T = unknown> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  error?: unknown;
  meta?: Record<string, unknown>;
}

import type { Request } from "express";

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
  };
}
