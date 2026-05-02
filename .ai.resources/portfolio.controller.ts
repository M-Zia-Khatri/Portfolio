import { prisma } from '../lib/prisma.js';
import {
  CreatePortfolioDto,
  PortfolioItem,
  UpdatePortfolioDto,
} from '../lib/types/portfolio.types.js';
import { generateETag } from '../lib/utills/caching/cache.etag.js';
import {
  cacheForget,
  cacheInvalidatePrefix,
  cachePut,
  cacheRemember,
  cacheRememberConditional,
  TTL,
} from '../lib/utills/caching/cache.js';
import { deleteFromCloudinary } from '../lib/utills/cloudinary.js';
import type { Request, Response } from 'express';
import { Portfolio_item, Prisma } from '../../generated/prisma/client.js';
import { catchError } from '../lib/utills/catch-error.js';
import { send } from '../lib/utills/send.js';

// ─── Cache Keys ──────────────────────────────────────────────────────────────

const CACHE_KEYS = {
  all: 'portfolio:list',
  one: (id: string) => `portfolio:${id}`,
  prefix: 'portfolio',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateCreate(body: Partial<CreatePortfolioDto>): string | null {
  const { site_name, site_role, site_url, site_image_url, use_tech, description } = body;

  if (!site_name?.trim()) return 'site_name is required';
  if (!site_role?.trim()) return 'site_role is required';
  if (!site_url?.trim()) return 'site_url is required';
  if (!isValidUrl(site_url)) return 'site_url must be a valid URL';
  if (!site_image_url?.trim()) return 'site_image_url is required';
  if (!isValidUrl(site_image_url)) return 'site_image_url must be a valid URL';
  if (!description?.trim()) return 'description is required';
  if (!Array.isArray(use_tech) || use_tech.length === 0)
    return 'use_tech must be a non-empty array';
  if (use_tech.some((t) => typeof t !== 'string' || !t.trim()))
    return 'use_tech must contain non-empty strings';

  return null;
}

function validateUpdate(body: UpdatePortfolioDto): string | null {
  const { site_url, site_image_url, use_tech } = body;

  if (site_url !== undefined) {
    if (!site_url.trim()) return 'site_url must not be empty';
    if (!isValidUrl(site_url)) return 'site_url must be a valid URL';
  }

  if (site_image_url !== undefined) {
    if (!site_image_url.trim()) return 'site_image_url must not be empty';
    if (!isValidUrl(site_image_url)) return 'site_image_url must be a valid URL';
  }

  if (use_tech !== undefined) {
    if (!Array.isArray(use_tech) || use_tech.length === 0)
      return 'use_tech must be a non-empty array';
    if (use_tech.some((t) => typeof t !== 'string' || !t.trim()))
      return 'use_tech must contain non-empty strings';
  }

  return null;
}

function isStringArray(value: Prisma.JsonValue): value is string[] {
  return Array.isArray(value) && value.every((tech) => typeof tech === 'string');
}

function toPortfolioResponse(item: Portfolio_item): PortfolioItem {
  const useTech = item.use_tech;
  if (!isStringArray(useTech)) {
    throw new Error('Invalid portfolio data: use_tech must be a string array');
  }

  return {
    id: item.id,
    siteName: item.site_name,
    siteRole: item.site_role,
    siteUrl: item.site_url,
    siteImageUrl: item.site_image_url,
    useTech,
    description: item.description,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

// ─── GET /api/portfolio ───────────────────────────────────────────────────────

export async function getAllPortfolioItems(req: Request, res: Response): Promise<void> {
  try {
    const clientETag = req.headers['if-none-match'] as string | undefined;

    const result = await cacheRememberConditional(CACHE_KEYS.all, {
      ttl: TTL.ONE_DAY,
      staleTtl: TTL.ONE_WEEK,
      ifNoneMatch: clientETag,
      callback: () =>
        prisma.portfolio_item.findMany({
          orderBy: { created_at: 'desc' },
        }),
    });

    res.setHeader('ETag', result.etag);
    res.setHeader('Cache-Control', 'private, must-revalidate');

    // FIX: HTTP 304 must have no body — use res.status(304).end()
    if (result.status === 304) {
      res.status(304).end();
      return;
    }

    send(res, {
      success: true,
      status: 200,
      message: 'Portfolio items retrieved successfully',
      data: result.data,
      meta: { total: Array.isArray(result.data) ? result.data.length : 0 },
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── GET /api/portfolio/:id ───────────────────────────────────────────────────

export async function getPortfolioItemById(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const clientETag = req.headers['if-none-match'] as string | undefined;

    const result = await cacheRememberConditional<Portfolio_item | null>(CACHE_KEYS.one(id), {
      ttl: TTL.ONE_DAY,
      staleTtl: TTL.ONE_WEEK,
      ifNoneMatch: clientETag,
      callback: () => prisma.portfolio_item.findUnique({ where: { id } }),
    });

    res.setHeader('ETag', result.etag);
    res.setHeader('Cache-Control', 'private, must-revalidate');

    // FIX: HTTP 304 must have no body
    if (result.status === 304) {
      res.status(304).end();
      return;
    }

    if (!result.data) {
      return send(res, {
        success: false,
        status: 404,
        message: 'Portfolio item not found',
        error: { detail: `No item with id "${id}"` },
      });
    }

    send(res, {
      success: true,
      status: 200,
      message: 'Portfolio item retrieved successfully',
      data: toPortfolioResponse(result.data as Portfolio_item),
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── POST /api/portfolio ──────────────────────────────────────────────────────

export async function createPortfolioItem(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as Partial<CreatePortfolioDto>;

    const validationError = validateCreate(body);
    if (validationError) {
      await deleteFromCloudinary(req.body.site_image_url);
      send(res, {
        success: false,
        status: 400,
        message: 'Validation error',
        error: { detail: validationError },
      });
      return;
    }

    const { site_name, site_role, site_url, site_image_url, use_tech, description } =
      body as CreatePortfolioDto;

    const newItem = await prisma.portfolio_item.create({
      data: {
        site_name,
        site_role,
        site_url,
        site_image_url,
        use_tech,
        description,
      },
    });

    // FIX: invalidate the list FIRST, then warm the single-item cache.
    // Previously cachePut ran before cacheInvalidatePrefix, which wiped the
    // freshly-warmed key immediately (prefix 'portfolio:' covers 'portfolio:{id}').
    await cacheInvalidatePrefix(CACHE_KEYS.prefix);
    await cachePut(CACHE_KEYS.one(newItem.id), newItem, TTL.ONE_DAY);

    res.setHeader('ETag', generateETag(newItem));
    send(res, {
      success: true,
      status: 201,
      message: 'Portfolio item created successfully',
      data: newItem,
    });
  } catch (err) {
    await deleteFromCloudinary(req.body.site_image_url);
    catchError(res, err);
  }
}

// ─── PATCH /api/portfolio/:id ─────────────────────────────────────────────────

export async function updatePortfolioItem(req: Request, res: Response): Promise<void> {
  let newImage: string | undefined;

  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const body = req.body as UpdatePortfolioDto;
    // Client sends the standard If-Match header for optimistic locking
    const clientETag = req.headers['if-match'] as string | undefined;

    newImage = body.site_image_url;

    // ─── Require If-Match ────────────────────────────────────────────────────
    if (!clientETag) {
      if (newImage) await deleteFromCloudinary(newImage);

      return send(res, {
        success: false,
        status: 428,
        message: 'If-Match header required for optimistic locking',
      });
    }

    // ─── Fetch Cached + Validate ETag ────────────────────────────────────────
    const cached = await cacheRememberConditional<Portfolio_item | null>(CACHE_KEYS.one(id), {
      ttl: TTL.ONE_DAY,
      ifMatch: clientETag,
      callback: () => prisma.portfolio_item.findUnique({ where: { id } }),
    });

    const existing = cached.data;
    // ─── 404 Not Found ────────────────────────────────────────────────────────
    if (!existing) {
      if (newImage) await deleteFromCloudinary(newImage);

      return send(res, {
        success: false,
        status: 404,
        message: 'Portfolio item not found',
        error: { detail: `No item with id "${id}"` },
      });
    }

    // ─── 412 Precondition Failed ─────────────────────────────────────────────
    if (cached.status === 412) {
      if (newImage && newImage !== existing?.site_image_url) {
        await deleteFromCloudinary(newImage);
      }

      return send(res, {
        success: false,
        status: 412,
        message: 'Resource modified by another request',
        error: { currentETag: cached.etag },
      });
    }

    // ─── Validate Body ────────────────────────────────────────────────────────
    const validationError = validateUpdate(body);
    if (validationError) {
      if (newImage && newImage !== existing.site_image_url) {
        await deleteFromCloudinary(newImage);
      }

      return send(res, {
        success: false,
        status: 400,
        message: 'Validation error',
        error: { detail: validationError },
      });
    }

    const { site_name, site_role, site_url, site_image_url, use_tech, description } = body;

    const isNewImage =
      site_image_url && existing.site_image_url && site_image_url !== existing.site_image_url;

    // ─── Update DB ────────────────────────────────────────────────────────────
    const updatedItem = await prisma.portfolio_item.update({
      where: { id },
      data: {
        site_name: body.site_name,
        site_role: body.site_role,
        site_url: body.site_url,
        site_image_url: body.site_image_url,
        // Ensure type compatibility for JSON
        use_tech: body.use_tech ? (body.use_tech as Prisma.InputJsonValue) : undefined,
        description: body.description,
      },
    });

    // ─── Delete Old Image (only if replaced) ─────────────────────────────────
    if (isNewImage) {
      await deleteFromCloudinary(existing.site_image_url);
    }

    // FIX: sequential cache operations — invalidate list first, then update the
    // single-item cache. Promise.all() previously caused a race where
    // cacheInvalidatePrefix could delete what cachePut just wrote.
    await cacheInvalidatePrefix(CACHE_KEYS.prefix);
    await cachePut(CACHE_KEYS.one(id), updatedItem, TTL.ONE_DAY);

    // ─── Response ─────────────────────────────────────────────────────────────
    res.setHeader('ETag', generateETag(updatedItem));

    return send(res, {
      success: true,
      status: 200,
      message: 'Portfolio item updated successfully',
      data: toPortfolioResponse(updatedItem),
    });
  } catch (err: unknown) {
    try {
      if (newImage) await deleteFromCloudinary(newImage);
    } catch {
      // intentionally silent — primary error takes precedence
    }

    return catchError(res, err);
  }
}

// ─── DELETE /api/portfolio/:id ────────────────────────────────────────────────

export async function deletePortfolioItem(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Fast existence check via cache (only needs id)
    const cached = await cacheRemember(CACHE_KEYS.one(id), {
      ttl: TTL.ONE_DAY,
      callback: () =>
        prisma.portfolio_item.findUnique({
          where: { id },
          select: { id: true },
        }),
    });

    if (!cached) {
      return send(res, {
        success: false,
        status: 404,
        message: 'Portfolio item not found',
        error: { detail: `No item with id "${id}"` },
      });
    }

    // Delete returns the full record — use it for Cloudinary cleanup
    const deleted = await prisma.portfolio_item.delete({ where: { id } });
    if (deleted?.site_image_url) {
      await deleteFromCloudinary(deleted.site_image_url);
    }

    await Promise.all([cacheForget(CACHE_KEYS.one(id)), cacheInvalidatePrefix(CACHE_KEYS.prefix)]);

    send(res, {
      success: true,
      status: 200,
      message: 'Portfolio item deleted successfully',
    });
  } catch (err) {
    catchError(res, err);
  }
}
