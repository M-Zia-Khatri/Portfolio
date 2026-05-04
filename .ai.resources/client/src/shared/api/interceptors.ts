import { refreshTokenApi } from '@/features/auth/services/auth.api';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/features/auth/utils/tokenManager';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { clearETag, getETag, setETag } from './etag-store';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
}

const REFRESH_EXCLUDED_URLS = ['/auth/refresh', '/auth/login', '/auth/verify-otp'];

function isExcluded(url: string | undefined): boolean {
  if (!url) return false;
  return REFRESH_EXCLUDED_URLS.some((path) => url.includes(path));
}

export const setupInterceptors = (api: AxiosInstance): void => {
  // REQUEST INTERCEPTOR
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = config.method?.toLowerCase();
    const url = config.url;
    const isMutation = method === 'patch' || method === 'put' || method === 'delete';

    if (isMutation && url && !isExcluded(url)) {
      // Check for explicitly provided ETag first
      const explicitETag = config.headers['X-Explicit-ETag'] as string | undefined;
      // Fallback to stored ETag
      const storedETag = getETag(url);

      const etag = explicitETag || storedETag;

      if (etag) {
        config.headers['If-Match'] = etag;
        console.debug(`[Interceptor] Attaching If-Match: ${etag} for ${url}`);
      } else {
        console.warn(`[Interceptor] No ETag available for ${url}`);
      }

      // Clean up custom header so it doesn't leak to server
      delete config.headers['X-Explicit-ETag'];
    }

    return config;
  });

  // RESPONSE INTERCEPTOR
  api.interceptors.response.use(
    (res) => {
      const url = res.config.url;
      const etag = res.headers.etag || res.headers.ETag;

      if (etag && url && !isExcluded(url)) {
        setETag(url, etag);
      }

      return res;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle 412 - ETag mismatch (conflict)
      if (error.response?.status === 412) {
        console.warn('⚠️ 412 Precondition Failed - ETag mismatch');
        if (originalRequest.url) {
          clearETag(originalRequest.url);
        }
        return Promise.reject(
          new Error('This item was modified by another user. Please refresh and try again.'),
        );
      }

      // Handle 428 - Missing If-Match
      if (error.response?.status === 428) {
        console.error('❌ 428 Precondition Required - If-Match missing');
        return Promise.reject(new Error('Edit validation failed. Please refresh the page.'));
      }

      // Handle 404
      if (error.response?.status === 404) {
        if (originalRequest.url) {
          clearETag(originalRequest.url);
        }
      }

      // Auth refresh logic (existing)
      if (
        error.response?.status !== 401 ||
        originalRequest._retry ||
        isExcluded(originalRequest.url)
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const data = await refreshTokenApi();
        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearAccessToken();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    },
  );
};
