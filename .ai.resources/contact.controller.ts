import { prisma } from '../lib/prisma.js';
import {
  cacheForget,
  cacheInvalidatePrefix,
  cacheRemember,
  cacheRememberConditional,
  TTL,
} from '../lib/utills/caching/cache.js';
import type { Request, Response } from 'express';
import { catchError } from '../lib/utills/catch-error.js';
import { sendContactEmail } from '../lib/utills/mailer.js';
import { send } from '../lib/utills/send.js';

const CACHE_KEYS = {
  list: (page: number, pageSize: number) => `contacts:list:${page}:${pageSize}`,
  prefix: 'contacts',
};

// ─── SUBMIT CONTACT FORM (Public) ─────────────────────────────────────────────
export async function submitContact(req: Request, res: Response): Promise<void> {
  try {
    const { fullName, email, message } = req.body;

    const entry = await prisma.contactMessage.create({
      data: {
        full_name: fullName,
        email,
        message,
      },
    });

    await cacheInvalidatePrefix(CACHE_KEYS.prefix);

    // Fire-and-forget — don't block the response on email delivery
    sendContactEmail(fullName, email, message, entry.created_at).catch((err) =>
      console.error('[Mailer] Failed to send contact email:', err),
    );

    send(res, {
      success: true,
      status: 201,
      message: 'Message sent successfully',
      data: { id: entry.id },
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── GET ALL MESSAGES (Admin only) ────────────────────────────────────────────
export async function getContacts(req: Request, res: Response): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Number(req.query.pageSize) || 20);
    const skip = (page - 1) * pageSize;
    const clientETag = req.headers['if-none-match'] as string | undefined;

    const result = await cacheRememberConditional(CACHE_KEYS.list(page, pageSize), {
      ttl: TTL.ONE_DAY,
      staleTtl: TTL.ONE_WEEK,
      ifNoneMatch: clientETag,
      callback: async () => {
        const [items, total] = await Promise.all([
          prisma.contactMessage.findMany({
            orderBy: { created_at: 'desc' },
            skip,
            take: pageSize,
          }),
          prisma.contactMessage.count(),
        ]);
        return { items, total };
      },
    });

    res.setHeader('ETag', result.etag);
    res.setHeader('Cache-Control', 'private, must-revalidate');

    if (result.status === 304) {
      res.status(304).end();
      return;
    }

    const total = result.data?.total ?? 0;

    send(res, {
      success: true,
      status: 200,
      message: 'Data retrieved successfully',
      data: result.data?.items,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── DELETE MESSAGE (Admin only) ──────────────────────────────────────────────
export async function deleteContact(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Try cache first for existence check (may be stale but that's ok for auth check)
    const cached = await cacheRemember(`contact:${id}`, {
      ttl: TTL.ONE_DAY,
      callback: () =>
        prisma.contactMessage.findUnique({
          where: { id },
          select: { id: true },
        }),
    });

    if (!cached) {
      return send(res, {
        success: false,
        status: 404,
        message: 'Message not found',
      });
    }

    await prisma.contactMessage.delete({ where: { id } });

    await Promise.all([cacheForget(`contact:${id}`), cacheInvalidatePrefix(CACHE_KEYS.prefix)]);

    send(res, {
      success: true,
      status: 200,
      message: 'Deleted successfully',
    });
  } catch (err) {
    catchError(res, err);
  }
}
