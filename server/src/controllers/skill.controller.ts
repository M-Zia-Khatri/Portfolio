import type { Request, Response } from 'express';
import { Prisma } from '../../../generated/prisma';
import prisma from '../lib/prisma';
import { send } from '../lib/utills/send';
import { catchError } from '../lib/utills/catch-error';
import {
  cacheForget,
  cacheInvalidatePrefix,
  cachePut,
  cacheRemember,
  cacheRememberConditional,
} from '../lib/utills/caching/cache';
import { ONE_DAY, ONE_WEEK } from '../lib/utills/caching/cache.constants';
import { createSkillSchema, updateSkillSchema } from '../lib/validators/skill.validation';
import { type SkillMode, type SkillRow, toSkillResponse } from '../lib/types/skill.types';

const CACHE_KEYS = {
  all: (mode?: SkillMode): string => {
    if (mode === 'code') {
      return 'skills:list:code';
    }

    if (mode === 'terminal') {
      return 'skills:list:terminal';
    }

    return 'skills:list:all';
  },
  one: (id: string): string => `skills:${id}`,
};

const isLangTaken = (error: unknown): boolean => {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes('lang')
  );
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const mode = req.query.mode as SkillMode | undefined;
    const ifNoneMatch = req.header('If-None-Match');

    const cached = await cacheRememberConditional<SkillRow[]>(CACHE_KEYS.all(mode), {
      ttl: ONE_DAY,
      staleTtl: ONE_WEEK,
      ifNoneMatch,
      callback: async () =>
        prisma.skill.findMany({
          where: mode ? { mode } : undefined,
          orderBy: { created_at: 'asc' },
        }) as Promise<SkillRow[]>,
    });

    res.setHeader('ETag', cached.etag);
    res.setHeader('Cache-Control', 'private, must-revalidate');

    if (cached.status === 304) {
      send(res, { success: true, status: 304, message: 'Not modified' });
      return;
    }

    const data = (cached.data ?? []).map(toSkillResponse);

    send(res, {
      success: true,
      status: 200,
      message: 'Skills fetched successfully',
      data,
      meta: { total: data.length },
    });
  } catch (error: unknown) {
    catchError(res, error);
  }
};

export const getOne = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cached = await cacheRememberConditional<SkillRow | null>(CACHE_KEYS.one(id), {
      ttl: ONE_DAY,
      staleTtl: ONE_WEEK,
      callback: async () => prisma.skill.findUnique({ where: { id } }) as Promise<SkillRow | null>,
    });

    if (!cached.data) {
      send(res, { success: false, status: 404, message: 'Skill not found' });
      return;
    }

    res.setHeader('ETag', cached.etag);
    res.setHeader('Cache-Control', 'private, must-revalidate');

    send(res, {
      success: true,
      status: 200,
      message: 'Skill fetched successfully',
      data: toSkillResponse(cached.data),
    });
  } catch (error: unknown) {
    catchError(res, error);
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createSkillSchema.safeParse(req.body);

    if (!parsed.success) {
      send(res, {
        success: false,
        status: 400,
        message: 'Validation failed',
        error: parsed.error.flatten(),
      });
      return;
    }

    const payload = parsed.data;
    const created = (await prisma.skill.create({
      data: {
        name: payload.name,
        icon: payload.icon,
        file_name: payload.fileName,
        lang: payload.lang,
        color: payload.color,
        mode: payload.mode,
        code: payload.mode === 'code' ? payload.code : Prisma.JsonNull,
        commands: payload.mode === 'terminal' ? payload.commands : Prisma.JsonNull,
      },
    })) as SkillRow;

    await cachePut(CACHE_KEYS.one(created.id), created, ONE_DAY);
    await cacheInvalidatePrefix('skills');

    const response = toSkillResponse(created);
    const etagRecord = await cacheRememberConditional<SkillRow>(CACHE_KEYS.one(created.id), {
      ttl: ONE_DAY,
      callback: async () => created,
    });

    res.setHeader('ETag', etagRecord.etag);
    res.setHeader('Cache-Control', 'private, must-revalidate');

    send(res, {
      success: true,
      status: 201,
      message: 'Skill created successfully',
      data: response,
    });
  } catch (error: unknown) {
    if (isLangTaken(error)) {
      send(res, { success: false, status: 409, message: 'A skill with this language already exists' });
      return;
    }

    catchError(res, error);
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ifMatch = req.header('If-Match');

    if (!ifMatch) {
      send(res, { success: false, status: 428, message: 'If-Match header required' });
      return;
    }

    const cached = await cacheRememberConditional<SkillRow | null>(CACHE_KEYS.one(id), {
      ttl: ONE_DAY,
      staleTtl: ONE_WEEK,
      ifMatch,
      callback: async () => prisma.skill.findUnique({ where: { id } }) as Promise<SkillRow | null>,
    });

    if (cached.status === 412) {
      send(res, { success: false, status: 412, message: 'Resource modified by another request' });
      return;
    }

    if (!cached.data) {
      send(res, { success: false, status: 404, message: 'Skill not found' });
      return;
    }

    const parsed = updateSkillSchema.safeParse(req.body);

    if (!parsed.success) {
      send(res, {
        success: false,
        status: 400,
        message: 'Validation failed',
        error: parsed.error.flatten(),
      });
      return;
    }

    const input = parsed.data;
    const previous = cached.data;
    const mode = input.mode ?? previous.mode;

    const mergedCode = mode === 'code' ? (input.code ?? previous.code ?? []) : null;
    const mergedCommands = mode === 'terminal' ? (input.commands ?? previous.commands ?? []) : null;

    const updated = (await prisma.skill.update({
      where: { id },
      data: {
        name: input.name ?? previous.name,
        icon: input.icon ?? previous.icon,
        file_name: input.fileName ?? previous.file_name,
        lang: input.lang ?? previous.lang,
        color: input.color ?? previous.color,
        mode,
        code: mergedCode,
        commands: mergedCommands,
      },
    })) as SkillRow;

    await cachePut(CACHE_KEYS.one(id), updated, ONE_DAY);
    await cacheInvalidatePrefix('skills');

    const etagRecord = await cacheRememberConditional<SkillRow>(CACHE_KEYS.one(id), {
      ttl: ONE_DAY,
      callback: async () => updated,
    });

    res.setHeader('ETag', etagRecord.etag);
    res.setHeader('Cache-Control', 'private, must-revalidate');

    send(res, {
      success: true,
      status: 200,
      message: 'Skill updated successfully',
      data: toSkillResponse(updated),
    });
  } catch (error: unknown) {
    if (isLangTaken(error)) {
      send(res, { success: false, status: 409, message: 'A skill with this language already exists' });
      return;
    }

    catchError(res, error);
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await cacheRemember<Pick<SkillRow, 'id'> | null>(CACHE_KEYS.one(id), {
      ttl: ONE_DAY,
      callback: async () => prisma.skill.findUnique({ where: { id }, select: { id: true } }),
    });

    if (!existing) {
      send(res, { success: false, status: 404, message: 'Skill not found' });
      return;
    }

    await prisma.skill.delete({ where: { id } });
    await Promise.all([cacheForget(CACHE_KEYS.one(id)), cacheInvalidatePrefix('skills')]);

    send(res, { success: true, status: 200, message: 'Skill deleted successfully' });
  } catch (error: unknown) {
    catchError(res, error);
  }
};
