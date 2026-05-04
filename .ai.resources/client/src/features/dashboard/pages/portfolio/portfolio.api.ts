// ROOT CAUSE FIX:
// localhost:5173 → localhost:5000 is cross-origin (different ports).
// Browsers strip non-safelisted response headers from XHR/fetch unless the
// server sends:  Access-Control-Expose-Headers: ETag
//
// Without that, response.headers.etag === undefined in JS even though the
// server DID send the header (the browser uses it for its own native cache
// but never passes it through to JavaScript).
//
// ─── SERVER FIX (app.ts / server.ts) ──────────────────────────────────────
//   import cors from 'cors'
//   app.use(cors({
//     origin: process.env.CLIENT_URL || 'http://localhost:5173',
//     credentials: true,
//     exposedHeaders: ['ETag'],   // ← THIS ONE LINE FIXES EVERYTHING
//   }))
// ──────────────────────────────────────────────────────────────────────────
//
// The client is also hardened: after the fresh GET, the axios response
// interceptor (interceptors.ts) stores the ETag in the etag-store.
// We read from the store — not response.headers.etag — because the store
// is the canonical source once the interceptor has run.

import { api } from '@/shared/api/axios';
import { clearETag, getETag, setETag } from '@/shared/api/etag-store';
import type { ApiResponse, PortfolioItem } from './portfolio.types';

// ─── Cloudinary ──────────────────────────────────────────────────────────────

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!response.ok) throw new Error('Cloudinary upload failed');
  const data = await response.json();
  return data.secure_url as string;
}

// ─── ETag Helper ─────────────────────────────────────────────────────────────

async function fetchFreshETag(url: string): Promise<string | null> {
  try {
    // Cache-Control: no-cache forces the server past its 304 shortcut so we
    // always get a 200 with the ETag header in the response.
    await api.get(url, {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    // The axios response interceptor in interceptors.ts already ran and called
    // setETag(url, etag) — read the stored value as the authoritative source.
    // This is reliable regardless of header-name casing (etag vs ETag).
    const stored = getETag(url);
    if (stored) {
      console.debug(`[fetchFreshETag] ETag from store for ${url}:`, stored);
      return stored;
    }

    // Still null → the ETag header was stripped by the browser (CORS).
    // Apply the server fix described at the top of this file.
    console.error(
      `[fetchFreshETag] ETag header unreachable for ${url}.\n` +
        "Add  exposedHeaders: ['ETag']  to your server CORS config.",
    );
    return null;
  } catch (err: any) {
    if (err.response?.status === 404) {
      console.warn(`[fetchFreshETag] 404 – item not found: ${url}`);
      return null;
    }
    throw err;
  }
}

// ─── GET /portfolio ───────────────────────────────────────────────────────────

export async function fetchPortfolio(): Promise<PortfolioItem[]> {
  const { data, headers } = await api.get<ApiResponse<PortfolioItem[]>>('/portfolio');

  const etag = headers.etag as string | undefined;
  if (etag) {
    setETag('/portfolio', etag);
  }

  return data.data ?? [];
}

// ─── POST /portfolio ──────────────────────────────────────────────────────────

export async function createPortfolio(payload: Omit<PortfolioItem, 'id'>): Promise<PortfolioItem> {
  const { data, headers } = await api.post<ApiResponse<PortfolioItem>>('/portfolio', payload);

  if (!data.success || !data.data) {
    throw new Error(data.message || 'Create failed');
  }

  const etag = headers?.etag as string | undefined;
  if (etag) {
    setETag(`/portfolio/${data.data.id}`, etag);
  }
  clearETag('/portfolio');

  return data.data;
}

// ─── PATCH /portfolio/:id ─────────────────────────────────────────────────────

export async function updatePortfolio(
  id: string,
  payload: Partial<Omit<PortfolioItem, 'id'>>,
): Promise<PortfolioItem> {
  const url = `/portfolio/${id}`;

  // Fetch fresh → interceptor stores ETag → we read it from the store
  const etag = await fetchFreshETag(url);

  if (!etag) {
    throw new Error(
      "Could not read the item's ETag. " +
        "Add  exposedHeaders: ['ETag']  to your server CORS middleware.",
    );
  }

  // req.headers['if-match'] is what the server controller reads — use the
  // standard If-Match header, NOT a custom X-* header.
  const { data, headers } = await api.patch<ApiResponse<PortfolioItem>>(url, payload, {
    headers: { 'If-Match': etag },
  });

  if (!data.success || !data.data) {
    throw new Error(data.message || 'Update failed');
  }

  const newEtag = headers?.etag as string | undefined;
  if (newEtag) {
    setETag(url, newEtag);
  }
  clearETag('/portfolio');

  return data.data;
}

// ─── DELETE /portfolio/:id ────────────────────────────────────────────────────

export async function deletePortfolio(id: string): Promise<void> {
  const url = `/portfolio/${id}`;

  const etag = await fetchFreshETag(url);

  // Use the standard If-Match header
  const config = etag ? { headers: { 'If-Match': etag } } : undefined;

  await api.delete(url, config);

  clearETag(url);
  clearETag('/portfolio');
}
