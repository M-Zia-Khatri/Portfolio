import type { Response } from "express";
import { getConfig } from "../../config/env.js";
import { send } from "./send.js";

const config = getConfig();

export function catchError(res: Response, err: unknown): void {
  console.error("[Server]", err);

  send(res, {
    success: false,
    status: 500,
    message: "Internal server error",
    error: config.isDev
      ? err instanceof Error
        ? { name: err.name, detail: err.message }
        : { detail: String(err) }
      : undefined,
  });
}
