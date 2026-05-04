import { clearCookie, getCookie, setCookie } from './cookieManager';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Durations (matching backend JWT expiries)
const ACCESS_MAX_AGE = 15 * 60; // 15 Minutes
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // 7 Days

export function setTokens(access: string, refresh?: string): void {
  setCookie(ACCESS_TOKEN_KEY, access, { maxAge: ACCESS_MAX_AGE });
  if (refresh) {
    setCookie(REFRESH_TOKEN_KEY, refresh, { maxAge: REFRESH_MAX_AGE });
  }
}
export function setAccessToken(token: string): void {
  setCookie(ACCESS_TOKEN_KEY, token, { maxAge: ACCESS_MAX_AGE });
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN_KEY);
}
// ADD THIS FUNCTION
export function clearAccessToken(): void {
  clearCookie(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY);
}

export function clearTokens(): void {
  clearCookie(ACCESS_TOKEN_KEY);
  clearCookie(REFRESH_TOKEN_KEY);
}
