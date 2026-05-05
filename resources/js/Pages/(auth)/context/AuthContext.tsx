import { api } from '@/shared/api/axios';
import { setQueryClient, useAuthStore } from '@/shared/store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useMe } from '../hooks/useMe';
import { useAutoRefresh } from '../utils/useAutoRefresh';

// ─── Logout API ───────────────────────────────────────────────────────────────

/**
 * Hits POST /auth/logout.
 * The server revokes the DB refresh token and clears the HttpOnly cookie.
 * Always call this BEFORE store.logout() so the cookie is gone first.
 */
export const logoutApi = async (): Promise<void> => {
  await api.post('/auth/logout');
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading, isSuccess, isError } = useMe();
  const { setUser, setLoading } = useAuthStore();
  const queryClient = useQueryClient();

  useAutoRefresh();

  useEffect(() => {
    setQueryClient(queryClient);
  }, [queryClient]);

  // ── Sync React Query → Zustand ──────────────────────────────────────────
  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }

    // FIX #1a: only call setUser(user) — the previous code had setUser(null)
    // immediately after, which reset isAuthenticated to false on every load.
    if (isSuccess && user) {
      setUser(user);
      return;
    }

    // FIX #1b: handle the error/no-session case so isLoading clears.
    // Previously missing — caused an infinite spinner on unauthenticated visits
    // and a blank login page (Auth.tsx returns null while isLoading is true).
    if (isError || (isSuccess && !user)) {
      setUser(null);
    }
  }, [user, isLoading, isSuccess, isError, setUser, setLoading]);

  return <>{children}</>;
};

// ─── Re-exports for convenience ───────────────────────────────────────────────

/**
 * Primary auth hook — reads from Zustand, zero re-renders on unrelated state.
 *
 * @example
 * const { user, isAuthenticated, logout, hasRole } = useAuth()
 */
export { useAuthStore as useAuth } from '@/shared/store/useAuthStore';
