// ─── cookieManager.ts ─────────────────────────────────────────────────────────
// Low-level cookie helpers used by tokenManager.
// Centralises all cookie option logic in one place.

const IS_PROD = import.meta.env.PROD;

// ─── Get ─────────────────────────────────────────────────────────────────────

export function getCookie(name: string): string | null {
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

// ─── Set ─────────────────────────────────────────────────────────────────────

interface SetCookieOptions {
  /** Seconds until the cookie expires. Omit for a session cookie. */
  maxAge?: number;
  /** Defaults to "/". */
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none';
}

export function setCookie(name: string, value: string, options: SetCookieOptions = {}): void {
  const { maxAge, path = '/', sameSite = 'strict' } = options;

  const parts = [`${name}=${encodeURIComponent(value)}`, `path=${path}`, `SameSite=${sameSite}`];

  if (maxAge !== undefined) parts.push(`max-age=${maxAge}`);
  if (IS_PROD) parts.push('Secure');

  document.cookie = parts.join('; ');
}

// ─── Clear ────────────────────────────────────────────────────────────────────

export function clearCookie(name: string, path = '/'): void {
  document.cookie = `${name}=; path=${path}; max-age=0; SameSite=strict${IS_PROD ? '; Secure' : ''}`;
}
