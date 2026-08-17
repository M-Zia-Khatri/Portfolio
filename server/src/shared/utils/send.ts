import type { Response } from "express";
import type { ApiResponse } from "../types/globle.types.js";

export function send<T>(res: Response, payload: ApiResponse<T>): void {
  res.status(payload.status).json(payload);
}
