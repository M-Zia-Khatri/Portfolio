import type { Request, Response } from "express";
import { Prisma, type Skill } from "../../generated/prisma/client.js";
import type { SkillMode } from "./../../generated/prisma/enums.js";
import type { SkillModel } from "./../../generated/prisma/models/Skill.js";
import { generateETag } from "../infrastructure/caching/cache.etag.js";
import {
  cacheForget,
  cacheInvalidatePrefix,
  cachePut,
  cacheRemember,
  cacheRememberConditional,
  TTL,
} from "../infrastructure/caching/cache.js";
import { prisma } from "../infrastructure/prisma.js";
import { type SkillRow, toSkillResponse } from "../lib/types/skill.types.js";
import { catchError } from "../lib/utills/catch-error.js";
import { send } from "../lib/utills/send.js";
import { createSkillSchema, updateSkillSchema } from "../lib/validators/skill.validation.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toNullableJsonInput(
  value: unknown | null | undefined,
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
  if (value === null || value === undefined) {
    return Prisma.NullableJsonNullValueInput.JsonNull;
  }
  return value as Prisma.InputJsonValue;
}

function isLangTaken(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return (
      err.code === "P2002" &&
      Array.isArray((err.meta as { target?: string[] })?.target) &&
      (err.meta as { target: string[] }).target.includes("lang")
    );
  }
  return false;
}

type CustomSkillWhereInput = Prisma.SkillWhereInput & {
  mode?: Prisma.EnumSkillModeFilter<"Skill"> | SkillModel | undefined;
};

const CACHE_KEYS = {
  all: (mode?: string) => `skills:list:${mode ?? "all"}`,
  one: (id: string) => `skills:${id}`,
  prefix: "skills",
};

function toPrismaJson(value: unknown): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
  if (value === null || value === undefined) return Prisma.NullableJsonNullValueInput.JsonNull;
  return value as Prisma.InputJsonValue;
}

// GET /api/skills - Add conditional request support
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const { mode } = req.query;
    const modeStr = typeof mode === "string" ? mode : undefined;
    const clientETag = req.headers["if-none-match"] as string | undefined;

    const result = await cacheRememberConditional<Skill[]>(CACHE_KEYS.all(modeStr), {
      ttl: TTL.ONE_DAY,
      staleTtl: TTL.ONE_WEEK,
      ifNoneMatch: clientETag, // Enable 304 support
      callback: () =>
        prisma.skill.findMany({
          where:
            modeStr === "code" || modeStr === "terminal"
              ? { mode: modeStr as SkillMode }
              : undefined,
          orderBy: { created_at: "asc" },
        }),
    });

    res.setHeader("ETag", result.etag);
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");

    if (result.status === 304) {
      res.status(304).end();
      return;
    }

    send(res, {
      success: true,
      status: 200,
      message: "Skills retrieved successfully",
      data: (result.data as unknown as SkillRow[]).map(toSkillResponse),
      meta: { total: Array.isArray(result.data) ? result.data.length : 0 },
    });
  } catch (err) {
    catchError(res, err);
  }
}

// GET /api/skills/:id - Single item with ETag
export async function getOne(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const clientETag = req.headers["if-none-match"] as string | undefined;

    const result = await cacheRememberConditional(CACHE_KEYS.one(id), {
      ttl: TTL.ONE_DAY,
      staleTtl: TTL.ONE_WEEK,
      ifNoneMatch: clientETag,
      callback: () => prisma.skill.findUnique({ where: { id } }),
    });

    res.setHeader("ETag", result.etag);
    res.setHeader("Cache-Control", "private, must-revalidate");

    if (result.status === 304) {
      res.status(304).end();
      return;
    }

    if (!result.data) {
      return send(res, { success: false, status: 404, message: "Skill not found" });
    }

    send(res, {
      success: true,
      status: 200,
      message: "Skill retrieved successfully",
      data: toSkillResponse(result.data as unknown as SkillRow),
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── POST /api/skills ─────────────────────────────────────────────────────────
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const parsed = createSkillSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      send(res, {
        success: false,
        status: 400,
        message: "Validation error",
        error: {
          field: firstIssue.path.join(".") || "body",
          detail: firstIssue.message,
          issues: parsed.error.issues,
        },
      });
      return;
    }

    const isSkillAllreadyExists = await prisma.skill.findFirst({
      where: { name: parsed.data.name },
      select: { id: true },
    });

    if (isSkillAllreadyExists) {
      send(res, {
        success: false,
        status: 409,
        message: "A skill with this name already exists",
        error: { field: "name", detail: "name must be unique" },
      });
      return;
    }

    const input = parsed.data;

    const row = await prisma.skill.create({
      data: {
        name: input.name,
        icon: input.icon,
        file_name: input.fileName,
        lang: input.lang,
        color: input.color,
        mode: input.mode,
        code: toNullableJsonInput(input.mode === "code" ? input.code : null),
        commands: toNullableJsonInput(input.mode === "terminal" ? input.commands : null),
      },
    });

    // Warm the single item cache immediately (no cold miss on next GET)
    await cachePut(CACHE_KEYS.one(row.id), row, TTL.ONE_DAY);

    // Only invalidate list caches, not the item we just created
    await cacheInvalidatePrefix(CACHE_KEYS.prefix);

    res.setHeader("ETag", generateETag(row));
    send(res, {
      success: true,
      status: 201,
      message: "Skill created successfully",
      data: toSkillResponse(row as unknown as SkillRow),
    });
  } catch (err) {
    if (isLangTaken(err)) {
      send(res, {
        success: false,
        status: 409,
        message: "A skill with this language already exists",
        error: { field: "lang", detail: "lang must be unique" },
      });
      return;
    }
    catchError(res, err);
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const clientETag = req.headers["if-match"] as string | undefined;

    if (!clientETag) {
      return send(res, {
        success: false,
        status: 428,
        message: "If-Match header required for optimistic locking",
      });
    }

    // Check cache first for existing (faster than DB)
    const cached = await cacheRememberConditional<Skill | null>(CACHE_KEYS.one(id), {
      ttl: TTL.ONE_DAY,
      ifMatch: clientETag, // 412 if someone else modified it
      callback: () => prisma.skill.findUnique({ where: { id } }),
    });

    if (cached.status === 412) {
      return send(res, {
        success: false,
        status: 412,
        message: "Resource modified by another request",
        error: { currentETag: cached.etag },
      });
    }

    if (!cached.data) {
      return send(res, { success: false, status: 404, message: "Skill not found" });
    }

    const parsed = updateSkillSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return send(res, {
        success: false,
        status: 400,
        message: "Validation error",
        error: { field: firstIssue.path.join(".") || "body", detail: firstIssue.message },
      });
    }

    // ... rest of your update logic ...
    const input = parsed.data;
    const resolvedMode = input.mode ?? (cached.data.mode as "code" | "terminal");
    const _resolvedCode = resolvedMode === "code" ? (input.code ?? cached.data.code) : null;
    const _resolvedCommands =
      resolvedMode === "terminal" ? (input.commands ?? cached.data.commands) : null;

    const row = await prisma.skill.update({
      where: { id },
      data: {
        name: input.name ?? cached.data.name,
        icon: input.icon ?? cached.data.icon,
        file_name: input.fileName ?? cached.data.file_name,
        lang: input.lang ?? cached.data.lang,
        color: input.color ?? cached.data.color,
        mode: resolvedMode,
        code: input.code !== undefined ? toPrismaJson(input.code) : undefined,
        commands: input.commands !== undefined ? toPrismaJson(input.commands) : undefined,
      },
    });

    // Warm cache instead of invalidating (instant consistency)
    await cachePut(CACHE_KEYS.one(id), row, TTL.ONE_DAY);
    // Only invalidate the list, keep the single item warm
    await cacheInvalidatePrefix(CACHE_KEYS.prefix);

    res.setHeader("ETag", generateETag(row)); // Send new ETag
    send(res, {
      success: true,
      status: 200,
      message: "Skill updated successfully",
      data: toSkillResponse(row as unknown as SkillRow),
    });
  } catch (err) {
    if (isLangTaken(err)) {
      return send(res, {
        success: false,
        status: 409,
        message: "A skill with this language already exists",
      });
    }
    catchError(res, err);
  }
}

// ─── DELETE /api/skills/:id ───────────────────────────────────────────────────
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Check existence (lightweight, hits cache if warm)
    const existing = await cacheRemember(CACHE_KEYS.one(id), {
      ttl: TTL.ONE_DAY,
      callback: () => prisma.skill.findUnique({ where: { id }, select: { id: true } }),
    });
    if (!existing) {
      return send(res, { success: false, status: 404, message: "Skill not found" });
    }

    await prisma.skill.delete({ where: { id } });

    await Promise.all([cacheForget(CACHE_KEYS.one(id)), cacheInvalidatePrefix(CACHE_KEYS.prefix)]);

    send(res, {
      success: true,
      status: 200,
      message: "Skill deleted successfully",
    });
  } catch (err) {
    catchError(res, err);
  }
}
