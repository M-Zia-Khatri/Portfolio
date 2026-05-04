import { api } from '@/shared/api/axios';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

/**
 * Revokes every active session for the current admin on the server,
 * then resets local auth state.
 *
 * Use this for "Sign out of all devices" in the admin UI, or call it
 * programmatically on a detected token anomaly.
 */
export const useLogoutAll = () => {
  const { logout } = useAuth();

  return useMutation({
    mutationFn: () => api.post('/auth/logout-all'),

    // FIX: removed the redundant logoutApi() call (POST /auth/logout) that was
    // being fired after logout-all already succeeded. The server revokes all
    // tokens and clears the HttpOnly cookie as part of logout-all — calling
    // logout again with an already-revoked token is a no-op at best, and an
    // unnecessary network request that was swallowed with .catch(() => {}).
    onSuccess: () => {
      logout();
    },

    onError: () => {
      // Even on network failure, clear local state — the user should not
      // remain logged in client-side if the server call fails.
      logout();
    },
  });
};
