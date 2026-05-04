import type { ApiSkill, ModeENUM } from '@/features/skills/types';
import { api } from '@/shared/api/axios';
import { getETag } from '@/shared/api/etag-store';

// ─── ETag helper ─────────────────────────────────────────────────────────────
// Fetches a fresh ETag for the given skill.
// The response interceptor in interceptors.ts calls setETag automatically,
// so we just need to trigger the GET; the stored value is readable right after.

async function fetchSkillETag(id: string): Promise<string | null> {
  const url = `/skills/${id}`;

  try {
    await api.get(url, {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    const stored = getETag(url);
    if (stored) return stored;

    console.error(
      `[skills.api] ETag header unreachable for ${url}.\n` +
        "Add  exposedHeaders: ['ETag']  to your server CORS config.",
    );
    return null;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

// ─── GET /api/skills ──────────────────────────────────────────────────────────

export async function fetchSkills(mode?: ModeENUM): Promise<ApiSkill[]> {
  const res = await api.get<{ data: ApiSkill[] }>(mode ? `/skills?mode=${mode}` : '/skills');
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data : [];
}

// ─── POST /api/skills ─────────────────────────────────────────────────────────

export async function createSkill(payload: unknown): Promise<ApiSkill> {
  const res = await api.post<{ data: ApiSkill }>('/skills', payload);
  return res.data.data;
}

// ─── PATCH /api/skills/:id ────────────────────────────────────────────────────
// Step 1 – GET the skill so the response interceptor stores its ETag.
// Step 2 – PATCH; the request interceptor reads the stored ETag and attaches
//           If-Match automatically.

export async function updateSkill(id: string, payload: unknown): Promise<ApiSkill> {
  const url = `/skills/${id}`;

  const etag = await fetchSkillETag(id);

  if (!etag) {
    throw new Error(
      "Could not read the skill's ETag. " +
        "Add  exposedHeaders: ['ETag']  to your server CORS middleware.",
    );
  }

  const res = await api.patch<{ data: ApiSkill }>(url, payload, {
    headers: { 'If-Match': etag },
  });

  return res.data.data;
}

// ─── DELETE /api/skills/:id ───────────────────────────────────────────────────

export async function deleteSkill(id: string): Promise<void> {
  await api.delete(`/skills/${id}`);
}
